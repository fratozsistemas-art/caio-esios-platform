import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { entity_type, entity_id, content, metadata } = await req.json();

    // Brand guidelines and policies to check against
    const brandGuidelines = {
      typography: {
        headings: "Montserrat (700-900 weight)",
        body: "Inter (300-900 weight)",
        code: "JetBrains Mono"
      },
      colors: {
        primary: "#00D4FF (CAIO Cyan Electric)",
        secondary: "#0A2540 (CAIO Deep Blue)",
        gold: "#C7A763 (Metallic Gold)",
        forbidden: ["generic blues", "off-brand gradients"]
      },
      ip_protocols: {
        tier_1: "Never expose core reasoning algorithms, proprietary formulas, or mathematical models",
        tier_2: "Methodological frameworks can be described conceptually but not in implementation detail",
        tier_3: "Public-facing content must use market-standard terminology"
      },
      messaging: {
        positioning: "Executive Strategic Intelligence Platform",
        avoid: ["generic AI", "chatbot", "automation tool"],
        emphasize: ["TSI methodology", "cognitive modules", "institutional-grade"]
      }
    };

    // Use AI to analyze content for violations
    const complianceCheck = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a compliance monitoring AI for CAIO·AI platform. Analyze the following content for potential violations of brand guidelines, IP protocols, and strategic positioning.

Content to analyze:
${JSON.stringify(content, null, 2)}

Metadata:
${JSON.stringify(metadata, null, 2)}

Brand Guidelines & Policies:
${JSON.stringify(brandGuidelines, null, 2)}

Check for:
1. Brand Guideline Violations (typography, colors, visual identity)
2. IP Protocol Breaches (Tier 1/2/3 exposure of proprietary methods)
3. Messaging Deviations (positioning, terminology, value proposition)
4. Data Quality Issues (incomplete analysis, unverified claims)
5. Governance Gaps (missing Hermes validation, no CRV scoring)
6. Methodology Deviations (TSI modules not followed, frameworks misused)

For each violation found, provide:
- Specific guideline violated
- Exact content that violates
- Severity (low/medium/high/critical)
- Remediation steps (actionable, prioritized)
- Confidence score (0-100)

Return a structured compliance report.`,
      response_json_schema: {
        type: "object",
        properties: {
          has_violations: { type: "boolean" },
          overall_severity: { 
            type: "string",
            enum: ["low", "medium", "high", "critical"]
          },
          violations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                issue_type: { type: "string" },
                guideline: { type: "string" },
                violated_content: { type: "string" },
                explanation: { type: "string" },
                severity: { type: "string" },
                confidence: { type: "number" }
              }
            }
          },
          remediation_steps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                step: { type: "string" },
                priority: { type: "string" },
                estimated_effort: { type: "string" }
              }
            }
          },
          policy_references: {
            type: "array",
            items: { type: "string" }
          },
          overall_confidence: { type: "number" }
        }
      }
    });

    if (!complianceCheck.has_violations) {
      return Response.json({
        success: true,
        status: 'compliant',
        message: 'No violations detected'
      });
    }

    // Create compliance issue record
    const issueRecord = await base44.asServiceRole.entities.ComplianceIssue.create({
      issue_type: complianceCheck.violations[0]?.issue_type || 'governance_gap',
      severity: complianceCheck.overall_severity,
      source_entity_type: entity_type,
      source_entity_id: entity_id,
      violation_description: `${complianceCheck.violations.length} violations detected`,
      specific_violations: complianceCheck.violations,
      remediation_steps: complianceCheck.remediation_steps,
      policy_references: complianceCheck.policy_references,
      confidence_score: complianceCheck.overall_confidence,
      status: 'open'
    });

    // Send notification to all admins
    const allUsers = await base44.asServiceRole.entities.User.list();
    const adminUsers = allUsers.filter(u => u.role === 'admin');

    for (const admin of adminUsers) {
      await base44.asServiceRole.entities.AgentNotification.create({
        title: `🚨 Compliance Issue Detected - ${complianceCheck.overall_severity.toUpperCase()}`,
        message: `${complianceCheck.violations.length} violation(s) found in ${entity_type}. ${complianceCheck.violations[0]?.explanation || 'Review required.'}`,
        type: complianceCheck.overall_severity === 'critical' ? 'critical' : 'warning',
        source_agent: 'system',
        priority: complianceCheck.overall_severity === 'critical' ? 'critical' : 'high',
        target_user_email: admin.email,
        action_url: `/ComplianceMonitoring?issue=${issueRecord.id}`,
        action_label: 'Review Issue',
        context: {
          issue_id: issueRecord.id,
          entity_type,
          entity_id,
          violations_count: complianceCheck.violations.length
        },
        related_entity_type: 'ComplianceIssue',
        related_entity_id: issueRecord.id
      });
    }

    return Response.json({
      success: true,
      status: 'violations_detected',
      issue_id: issueRecord.id,
      violations_count: complianceCheck.violations.length,
      severity: complianceCheck.overall_severity
    });

  } catch (error) {
    console.error('Compliance monitoring error:', error);
    return Response.json({ 
      error: 'Compliance check failed', 
      details: error.message 
    }, { status: 500 });
  }
});