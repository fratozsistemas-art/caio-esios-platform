import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { check_type = 'comprehensive', target_node_ids = [] } = await req.json();

    const startTime = Date.now();

    // Get all network nodes if no specific targets
    let targetNodes;
    if (target_node_ids.length > 0) {
      targetNodes = await base44.asServiceRole.entities.KnowledgeGraphNode.filter({
        id: { $in: target_node_ids }
      });
    } else {
      targetNodes = await base44.asServiceRole.entities.KnowledgeGraphNode.list();
    }

    const relationships = await base44.asServiceRole.entities.KnowledgeGraphRelationship.list();
    const anomalies = await base44.asServiceRole.entities.NetworkAnomaly.filter({
      status: { $in: ['new', 'investigating'] }
    });

    // Perform health checks
    const metrics = await performHealthChecks(targetNodes, relationships);
    const issues = await detectIssues(targetNodes, relationships, anomalies);
    const healthScore = calculateHealthScore(metrics, issues);
    const status = determineStatus(healthScore);
    const recommendations = generateRecommendations(issues, metrics);

    const duration = (Date.now() - startTime) / 1000;

    // Trigger auto-remediation for critical issues
    for (const issue of issues.filter(i => i.severity === 'critical')) {
      if (shouldAutoRemediate(issue)) {
        await triggerAutoRemediation(issue, base44);
        issue.auto_remediation_triggered = true;
      }
    }

    // Create health check record
    const healthCheck = await base44.asServiceRole.entities.NetworkHealthCheck.create({
      check_name: `${check_type}_health_check`,
      check_type,
      target_nodes: targetNodes.map(n => n.id),
      status,
      health_score: healthScore,
      metrics,
      issues_found: issues,
      recommendations,
      checked_at: new Date().toISOString(),
      duration_seconds: duration,
      next_check_scheduled: new Date(Date.now() + 3600000).toISOString() // 1 hour
    });

    // Send alerts for critical issues
    if (issues.some(i => i.severity === 'critical')) {
      await base44.asServiceRole.entities.Alert.create({
        title: 'Critical Network Health Issues Detected',
        message: `Found ${issues.filter(i => i.severity === 'critical').length} critical issues`,
        severity: 'high',
        source: 'network_health_check',
        status: 'active',
        metadata: { health_check_id: healthCheck.id }
      });
    }

    return Response.json({
      health_check_id: healthCheck.id,
      status,
      health_score: healthScore,
      metrics,
      issues_count: issues.length,
      critical_issues: issues.filter(i => i.severity === 'critical').length,
      issues,
      recommendations,
      duration_seconds: duration,
      nodes_checked: targetNodes.length
    });

  } catch (error) {
    console.error('Health check error:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack
    }, { status: 500 });
  }
});

async function performHealthChecks(nodes, relationships) {
  // Simulate network metrics collection
  const metrics = {
    latency_ms: Math.random() * 100 + 20,
    packet_loss_percent: Math.random() * 5,
    throughput_mbps: Math.random() * 900 + 100,
    error_rate: Math.random() * 0.05,
    uptime_percent: 95 + Math.random() * 5
  };

  // Analyze connectivity
  const isolatedNodes = nodes.filter(node => {
    const connections = relationships.filter(r => 
      r.from_node_id === node.id || r.to_node_id === node.id
    );
    return connections.length === 0;
  });

  metrics.isolated_nodes_count = isolatedNodes.length;
  metrics.total_nodes = nodes.length;
  metrics.total_relationships = relationships.length;
  metrics.avg_connections_per_node = relationships.length / (nodes.length || 1);

  return metrics;
}

async function detectIssues(nodes, relationships, existingAnomalies) {
  const issues = [];

  // Check for isolated nodes
  nodes.forEach(node => {
    const connections = relationships.filter(r => 
      r.from_node_id === node.id || r.to_node_id === node.id
    );
    if (connections.length === 0) {
      issues.push({
        severity: 'medium',
        description: `Node ${node.label} is isolated with no connections`,
        affected_nodes: [node.id],
        auto_remediation_triggered: false
      });
    }
  });

  // Check for overloaded nodes (too many connections)
  nodes.forEach(node => {
    const connections = relationships.filter(r => 
      r.from_node_id === node.id || r.to_node_id === node.id
    );
    if (connections.length > 50) {
      issues.push({
        severity: 'high',
        description: `Node ${node.label} is overloaded with ${connections.length} connections`,
        affected_nodes: [node.id],
        auto_remediation_triggered: false
      });
    }
  });

  // Include existing anomalies as issues
  existingAnomalies.forEach(anomaly => {
    issues.push({
      severity: anomaly.severity,
      description: anomaly.details,
      affected_nodes: [anomaly.node_id],
      auto_remediation_triggered: false
    });
  });

  return issues;
}

function calculateHealthScore(metrics, issues) {
  let score = 100;

  // Deduct points for latency
  if (metrics.latency_ms > 100) score -= 10;
  else if (metrics.latency_ms > 50) score -= 5;

  // Deduct points for packet loss
  score -= metrics.packet_loss_percent * 2;

  // Deduct points for error rate
  score -= metrics.error_rate * 100;

  // Deduct points for uptime
  if (metrics.uptime_percent < 99) score -= (99 - metrics.uptime_percent) * 2;

  // Deduct points for issues
  issues.forEach(issue => {
    switch (issue.severity) {
      case 'critical': score -= 15; break;
      case 'high': score -= 10; break;
      case 'medium': score -= 5; break;
      case 'low': score -= 2; break;
    }
  });

  return Math.max(0, Math.min(100, score));
}

function determineStatus(healthScore) {
  if (healthScore >= 90) return 'healthy';
  if (healthScore >= 70) return 'degraded';
  if (healthScore >= 50) return 'critical';
  return 'unknown';
}

function generateRecommendations(issues, metrics) {
  const recommendations = [];

  if (metrics.latency_ms > 100) {
    recommendations.push('Consider optimizing network routes to reduce latency');
  }

  if (metrics.packet_loss_percent > 2) {
    recommendations.push('Investigate packet loss causes and improve network reliability');
  }

  if (metrics.isolated_nodes_count > 0) {
    recommendations.push(`Connect ${metrics.isolated_nodes_count} isolated nodes to the network`);
  }

  const criticalIssues = issues.filter(i => i.severity === 'critical');
  if (criticalIssues.length > 0) {
    recommendations.push(`Address ${criticalIssues.length} critical issues immediately`);
  }

  if (metrics.avg_connections_per_node < 2) {
    recommendations.push('Network is sparsely connected, consider adding more relationships');
  }

  return recommendations;
}

function shouldAutoRemediate(issue) {
  // Auto-remediate only specific low-risk issues
  return issue.description.includes('isolated') && issue.severity !== 'critical';
}

async function triggerAutoRemediation(issue, base44) {
  // Find automation for this type of issue
  const automations = await base44.asServiceRole.entities.NetworkAutomation.filter({
    automation_type: 'incident_response',
    trigger_type: 'event_based',
    is_active: true
  });

  if (automations && automations.length > 0) {
    // Trigger the automation
    await base44.asServiceRole.functions.invoke('executeNetworkAutomation', {
      automation_id: automations[0].id
    });
  }
}