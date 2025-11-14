import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auditResponse = await base44.asServiceRole.functions.invoke('auditModuleBoundaries', {});
    
    if (!auditResponse.data.success) {
      throw new Error('Audit failed');
    }

    const auditReport = auditResponse.data.audit_report;

    if (auditReport.recommendations.some(r => r.priority === 'high')) {
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: '🚨 CAIO Module Audit: Critical Issues Detected',
        body: `
Module Boundary Audit completed.

**Summary:**
- Overlaps detected: ${auditReport.overlaps_detected}
- Overall score: ${auditReport.overall_score}/100
- Critical recommendations: ${auditReport.recommendations.filter(r => r.priority === 'high').length}

**Top Priority Actions:**
${auditReport.recommendations.filter(r => r.priority === 'high').map(r => `- ${r.description}`).join('\n')}

**Auto-fix suggestions available:** ${auditReport.auto_fix_suggestions.length}

Review full report in CAIO Platform → Monitoring Hub
        `
      });
    }

    return Response.json({
      success: true,
      audit_summary: {
        timestamp: auditReport.timestamp,
        score: auditReport.overall_score,
        overlaps: auditReport.overlaps_detected,
        recommendations: auditReport.recommendations.length
      }
    });

  } catch (error) {
    console.error('Scheduled audit error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});