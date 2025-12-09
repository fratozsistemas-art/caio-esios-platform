import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // This function runs automatically (can be triggered via cron or webhook)
    // Checks new DocumentAnalysis and StrategyQuery entries for compliance
    
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - 24); // Last 24 hours
    
    const [documentAnalyses, strategyQueries] = await Promise.all([
      base44.asServiceRole.entities.DocumentAnalysis.list('-created_date', 20),
      base44.asServiceRole.entities.StrategyQuery.list('-created_date', 20)
    ]);

    const recentDocs = documentAnalyses.filter(d => 
      new Date(d.created_date) > cutoffTime
    );

    const recentQueries = strategyQueries.filter(q => 
      new Date(q.created_date) > cutoffTime
    );

    const results = {
      scanned: 0,
      violations_found: 0,
      issues_created: []
    };

    // Check documents
    for (const doc of recentDocs) {
      results.scanned++;
      
      const checkResult = await base44.asServiceRole.functions.invoke('monitorCompliance', {
        entity_type: 'DocumentAnalysis',
        entity_id: doc.id,
        content: doc,
        metadata: {
          document_title: doc.document_title,
          document_type: doc.document_type
        }
      });

      if (checkResult.data.status === 'violations_detected') {
        results.violations_found++;
        results.issues_created.push(checkResult.data.issue_id);
      }
    }

    // Check queries
    for (const query of recentQueries) {
      results.scanned++;
      
      const checkResult = await base44.asServiceRole.functions.invoke('monitorCompliance', {
        entity_type: 'StrategyQuery',
        entity_id: query.id,
        content: query,
        metadata: {
          query: query.query,
          category: query.category
        }
      });

      if (checkResult.data.status === 'violations_detected') {
        results.violations_found++;
        results.issues_created.push(checkResult.data.issue_id);
      }
    }

    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
      results
    });

  } catch (error) {
    console.error('Auto-monitoring error:', error);
    return Response.json({ 
      error: 'Auto-monitoring failed', 
      details: error.message 
    }, { status: 500 });
  }
});