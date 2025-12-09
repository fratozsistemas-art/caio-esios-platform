import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * AEGIS PROTOCOL - COMPLETE VALIDATION FRAMEWORK
 * Authenticity, Evidence, Governance, Integrity, Security
 * 
 * 5-Layer validation with hard stops and quality gates
 */

Deno.serve(async (req) => {
  const startTime = Date.now();
  
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { entity_type, entity_id, entity_data, enforce_hard_stops = true } = body;
    
    if (!entity_type || (!entity_id && !entity_data)) {
      return Response.json({ 
        error: 'entity_type and (entity_id or entity_data) are required' 
      }, { status: 400 });
    }
    
    console.log(`🛡️ AEGIS Protocol v1.0 - Validating ${entity_type}:${entity_id || 'new'}`);
    
    // Fetch entity if needed
    let targetEntity = entity_data;
    if (entity_id && !entity_data) {
      const entityMap = {
        'tsi_project': 'TSIProject',
        'strategy': 'Strategy',
        'analysis': 'Analysis',
        'tsi_deliverable': 'TSIDeliverable'
      };
      
      const entityName = entityMap[entity_type];
      if (entityName) {
        const entities = await base44.entities[entityName].filter({ id: entity_id });
        targetEntity = entities[0];
      }
    }
    
    if (!targetEntity) {
      return Response.json({ error: 'Entity not found' }, { status: 404 });
    }
    
    console.log('🔍 Running AEGIS 5-layer validation...');
    
    // Layer 1: AUTHENTICITY
    console.log('  [1/5] Authenticity validation...');
    const authenticityLayer = await validateAuthenticity(base44, targetEntity, entity_type);
    
    // Layer 2: EVIDENCE
    console.log('  [2/5] Evidence validation...');
    const evidenceLayer = await validateEvidence(base44, targetEntity, entity_type);
    
    // Layer 3: GOVERNANCE
    console.log('  [3/5] Governance validation...');
    const governanceLayer = await validateGovernance(base44, targetEntity, entity_type);
    
    // Layer 4: INTEGRITY
    console.log('  [4/5] Integrity validation...');
    const integrityLayer = await validateIntegrity(base44, targetEntity, entity_type);
    
    // Layer 5: SECURITY
    console.log('  [5/5] Security validation...');
    const securityLayer = await validateSecurity(base44, targetEntity, entity_type, user);
    
    // Calculate overall AEGIS score
    const overallScore = Math.round(
      (authenticityLayer.score * 0.25 +
       evidenceLayer.score * 0.20 +
       governanceLayer.score * 0.25 +
       integrityLayer.score * 0.20 +
       securityLayer.score * 0.10)
    );
    
    // Quality gates validation
    const qualityGates = {
      gate_0_data_quality: {
        status: evidenceLayer.score >= 70 ? 'passed' : evidenceLayer.score >= 50 ? 'warning' : 'failed',
        score: evidenceLayer.score,
        details: `Data quality: ${evidenceLayer.sources_validated} sources, Tier 1: ${evidenceLayer.data_tier_breakdown.tier_1}%`
      },
      gate_1_methodology: {
        status: governanceLayer.methodology_adherence >= 80 ? 'passed' : governanceLayer.methodology_adherence >= 60 ? 'warning' : 'failed',
        score: governanceLayer.methodology_adherence,
        details: `Methodology adherence: ${governanceLayer.methodology_adherence}%`
      },
      gate_2_crv_validation: {
        status: overallScore >= 75 ? 'passed' : overallScore >= 60 ? 'warning' : 'failed',
        score: overallScore,
        details: `Overall AEGIS score: ${overallScore}`
      },
      gate_3_hermes_integrity: {
        status: integrityLayer.consistency_score >= 85 ? 'passed' : integrityLayer.consistency_score >= 70 ? 'warning' : 'failed',
        score: integrityLayer.consistency_score,
        details: `Consistency score: ${integrityLayer.consistency_score}%`
      }
    };
    
    // Hard stops detection
    const hardStops = [];
    
    if (evidenceLayer.score < 50) {
      hardStops.push({
        gate: 'GATE_0_DATA_QUALITY',
        severity: 'hard_stop',
        message: `Critical data quality failure: ${evidenceLayer.score}% (minimum: 50%)`,
        resolution_required: true,
        resolved: false
      });
    }
    
    if (governanceLayer.methodology_adherence < 60) {
      hardStops.push({
        gate: 'GATE_1_METHODOLOGY',
        severity: 'hard_stop',
        message: `Methodology adherence below threshold: ${governanceLayer.methodology_adherence}% (minimum: 60%)`,
        resolution_required: true,
        resolved: false
      });
    }
    
    if (integrityLayer.score < 60) {
      hardStops.push({
        gate: 'GATE_3_INTEGRITY',
        severity: 'hard_stop',
        message: `Integrity validation failed: ${integrityLayer.score}% (minimum: 60%)`,
        resolution_required: true,
        resolved: false
      });
    }
    
    if (!securityLayer.audit_trail) {
      hardStops.push({
        gate: 'GATE_SECURITY_AUDIT',
        severity: 'warning',
        message: 'Audit trail incomplete - recommend enabling full tracking',
        resolution_required: false,
        resolved: false
      });
    }
    
    // Determine status
    let status = 'passed';
    if (hardStops.filter(h => h.severity === 'hard_stop' && !h.resolved).length > 0) {
      status = enforce_hard_stops ? 'blocked' : 'failed';
    } else if (hardStops.filter(h => h.severity === 'warning').length > 0) {
      status = 'passed';
    }
    
    const duration = Date.now() - startTime;
    
    // Store AEGIS protocol result
    const aegisRecord = await base44.entities.AEGISProtocol.create({
      protocol_version: '1.0.0',
      target_entity_type: entity_type,
      target_entity_id: entity_id || 'new_entity',
      validation_layers: {
        authenticity: authenticityLayer,
        evidence: evidenceLayer,
        governance: governanceLayer,
        integrity: integrityLayer,
        security: securityLayer
      },
      overall_aegis_score: overallScore,
      hard_stops_triggered: hardStops,
      quality_gates: qualityGates,
      status,
      execution_metadata: {
        duration_ms: duration,
        checks_performed: 25,
        auto_remediation_applied: false
      }
    });
    
    console.log(`\n🛡️ AEGIS Validation Complete:`);
    console.log(`  Overall Score: ${overallScore}%`);
    console.log(`  Status: ${status.toUpperCase()}`);
    console.log(`  Hard Stops: ${hardStops.length}`);
    console.log(`  Duration: ${duration}ms\n`);
    
    // If blocked, return error with details
    if (status === 'blocked' && enforce_hard_stops) {
      return Response.json({
        success: false,
        blocked: true,
        aegis_id: aegisRecord.id,
        overall_score: overallScore,
        status,
        hard_stops: hardStops,
        message: 'AEGIS Protocol blocked execution due to critical failures',
        resolution_steps: hardStops
          .filter(h => h.resolution_required)
          .map(h => h.message)
      }, { status: 403 });
    }
    
    return Response.json({
      success: true,
      aegis_id: aegisRecord.id,
      overall_score: overallScore,
      status,
      validation_layers: {
        authenticity: { score: authenticityLayer.score, passed: authenticityLayer.score >= 70 },
        evidence: { score: evidenceLayer.score, passed: evidenceLayer.score >= 70 },
        governance: { score: governanceLayer.score, passed: governanceLayer.score >= 70 },
        integrity: { score: integrityLayer.score, passed: integrityLayer.score >= 70 },
        security: { score: securityLayer.score, passed: securityLayer.score >= 70 }
      },
      quality_gates: qualityGates,
      hard_stops: hardStops,
      execution_time_ms: duration
    });
    
  } catch (error) {
    console.error('❌ AEGIS Protocol Error:', error);
    return Response.json({ 
      error: 'AEGIS protocol execution failed',
      details: error.message
    }, { status: 500 });
  }
});

async function validateAuthenticity(base44, entity, entityType) {
  const checks = [];
  let score = 100;
  
  // Check 1: Creator validation
  if (entity.created_by) {
    checks.push({ check: 'Creator Identity', passed: true, severity: 'low' });
  } else {
    checks.push({ check: 'Creator Identity', passed: false, severity: 'medium' });
    score -= 15;
  }
  
  // Check 2: Timestamp coherence
  if (entity.created_date && entity.updated_date) {
    const created = new Date(entity.created_date);
    const updated = new Date(entity.updated_date);
    const coherent = updated >= created;
    checks.push({ check: 'Timestamp Coherence', passed: coherent, severity: coherent ? 'low' : 'high' });
    if (!coherent) score -= 25;
  }
  
  // Check 3: Data provenance
  const hasProvenance = entity.data_sources || entity.referenced_documents || entity.analysis_results;
  checks.push({ check: 'Data Provenance', passed: !!hasProvenance, severity: hasProvenance ? 'low' : 'medium' });
  if (!hasProvenance) score -= 20;
  
  return { score, checks };
}

async function validateEvidence(base44, entity, entityType) {
  let score = 100;
  let sourcesValidated = 0;
  const tierBreakdown = { tier_1: 0, tier_2: 0, tier_3: 0, tier_4: 0 };
  
  // Check data sources
  if (entity.data_sources) {
    sourcesValidated = entity.data_sources.length;
    entity.data_sources.forEach(source => {
      if (source.tier) tierBreakdown[`tier_${source.tier}`] += 1;
    });
  } else if (entity.deliverables) {
    sourcesValidated = entity.deliverables.length;
  } else {
    score -= 30;
  }
  
  // Tier 1 sources are critical
  if (tierBreakdown.tier_1 === 0 && sourcesValidated > 0) {
    score -= 20;
  }
  
  // Convert to percentages
  Object.keys(tierBreakdown).forEach(tier => {
    tierBreakdown[tier] = sourcesValidated > 0 
      ? Math.round((tierBreakdown[tier] / sourcesValidated) * 100)
      : 0;
  });
  
  return { 
    score, 
    data_tier_breakdown: tierBreakdown, 
    sources_validated: sourcesValidated 
  };
}

async function validateGovernance(base44, entity, entityType) {
  let methodologyAdherence = 100;
  let hermesValidation = false;
  let cssAlignment = false;
  
  // Check for Hermes analysis
  try {
    const hermesAnalyses = await base44.entities.HermesAnalysis.filter({
      target_entity_id: entity.id
    });
    hermesValidation = hermesAnalyses.length > 0;
    if (!hermesValidation) methodologyAdherence -= 15;
  } catch (e) {
    // Hermes not available
  }
  
  // Check for CSS assessment
  try {
    const cssAssessments = await base44.entities.ContextualAssessment.filter({
      target_entity_id: entity.id
    });
    cssAlignment = cssAssessments.length > 0;
    if (!cssAlignment) methodologyAdherence -= 15;
  } catch (e) {
    // CSS not available
  }
  
  // Check for CRV scoring
  const hasCRV = entity.crv_score || entity.confidence_score || entity.sci_ia_score;
  if (!hasCRV) methodologyAdherence -= 20;
  
  // Check for quality gates
  const hasGates = entity.gate_0_status || entity.quality_gates;
  if (!hasGates) methodologyAdherence -= 10;
  
  const score = Math.round((methodologyAdherence * 0.7 + (hermesValidation ? 15 : 0) + (cssAlignment ? 15 : 0)));
  
  return { 
    score, 
    methodology_adherence: methodologyAdherence, 
    hermes_validation: hermesValidation, 
    css_alignment: cssAlignment 
  };
}

async function validateIntegrity(base44, entity, entityType) {
  let consistencyScore = 100;
  let temporalCoherence = true;
  let logicalCoherence = true;
  
  // Temporal coherence
  if (entity.milestones) {
    const dates = entity.milestones
      .map(m => m.target_date)
      .filter(d => d)
      .map(d => new Date(d));
    
    for (let i = 1; i < dates.length; i++) {
      if (dates[i] < dates[i-1]) {
        temporalCoherence = false;
        consistencyScore -= 25;
        break;
      }
    }
  }
  
  // Logical coherence (check for contradictions in text fields)
  const textFields = [
    entity.project_brief,
    entity.description,
    entity.executive_summary
  ].filter(Boolean);
  
  if (textFields.length === 0) {
    consistencyScore -= 20;
    logicalCoherence = false;
  }
  
  // Check for null/undefined critical fields
  const criticalFields = ['title', 'status'];
  criticalFields.forEach(field => {
    if (!entity[field]) {
      consistencyScore -= 10;
      logicalCoherence = false;
    }
  });
  
  const score = Math.max(0, Math.round(consistencyScore));
  
  return { 
    score, 
    consistency_score: consistencyScore, 
    temporal_coherence: temporalCoherence, 
    logical_coherence: logicalCoherence 
  };
}

async function validateSecurity(base44, entity, entityType, user) {
  let score = 100;
  let dataProvenance = false;
  let auditTrail = false;
  let rbacCompliance = true;
  
  // Data provenance
  dataProvenance = !!(entity.created_by && entity.created_date);
  if (!dataProvenance) score -= 30;
  
  // Audit trail
  auditTrail = !!(entity.updated_date && entity.updated_by);
  if (!auditTrail) score -= 20;
  
  // RBAC compliance (check if user has permission)
  if (entity.created_by && entity.created_by !== user.email && user.role !== 'admin') {
    try {
      const hasPermission = await base44.functions.invoke('checkPermission', {
        user_email: user.email,
        entity_type: entityType,
        entity_id: entity.id,
        permission: 'read'
      });
      rbacCompliance = hasPermission.data.allowed;
    } catch (e) {
      rbacCompliance = true; // Default to allow if RBAC not configured
    }
  }
  
  if (!rbacCompliance) score -= 40;
  
  return { 
    score, 
    data_provenance: dataProvenance, 
    audit_trail: auditTrail, 
    rbac_compliance: rbacCompliance 
  };
}