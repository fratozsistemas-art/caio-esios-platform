import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { jsPDF } from 'npm:jspdf@2.5.2';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const config = await req.json();
    const { title, description, format, template, data_sources, time_period, include_charts, include_recommendations } = config;

    // Fetch data from selected sources
    const reportData = {};
    
    if (data_sources.includes('strategies')) {
      reportData.strategies = await base44.asServiceRole.entities.Strategy.list('-updated_date');
    }
    
    if (data_sources.includes('analyses')) {
      reportData.analyses = await base44.asServiceRole.entities.Analysis.list('-updated_date');
    }
    
    if (data_sources.includes('knowledge_graph')) {
      const nodes = await base44.asServiceRole.entities.KnowledgeGraphNode.list();
      reportData.knowledge_graph = {
        total_nodes: nodes.length,
        node_types: nodes.reduce((acc, node) => {
          acc[node.node_type] = (acc[node.node_type] || 0) + 1;
          return acc;
        }, {})
      };
    }

    let file_url = null;

    // Generate report based on format
    if (format === 'pdf') {
      file_url = await generatePDFReport(reportData, { title, description, template, include_charts, include_recommendations });
    } else if (format === 'csv') {
      file_url = await generateCSVReport(reportData, { title });
    }

    // Save report metadata
    const report = await base44.asServiceRole.entities.Report.create({
      title,
      description,
      format,
      template,
      data_sources,
      time_period,
      file_url,
      created_by: user.email,
      metadata: {
        include_charts,
        include_recommendations,
        data_summary: {
          strategies_count: reportData.strategies?.length || 0,
          analyses_count: reportData.analyses?.length || 0
        }
      }
    });

    return Response.json({ 
      success: true, 
      report,
      message: 'Report generated successfully' 
    });

  } catch (error) {
    console.error('Report generation error:', error);
    return Response.json({ 
      error: error.message || 'Failed to generate report' 
    }, { status: 500 });
  }
});

async function generatePDFReport(data, config) {
  const doc = new jsPDF();
  const { title, description, template, include_recommendations } = config;

  // Title page
  doc.setFontSize(24);
  doc.text(title, 20, 30);
  
  if (description) {
    doc.setFontSize(12);
    doc.text(description, 20, 45, { maxWidth: 170 });
  }

  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, doc.internal.pageSize.height - 20);
  doc.text(`Template: ${template}`, 20, doc.internal.pageSize.height - 15);

  // Executive Summary
  doc.addPage();
  doc.setFontSize(18);
  doc.text('Executive Summary', 20, 20);
  
  let y = 35;
  doc.setFontSize(11);

  // Strategies section
  if (data.strategies && data.strategies.length > 0) {
    doc.setFontSize(14);
    doc.text('Strategic Initiatives', 20, y);
    y += 10;
    
    doc.setFontSize(10);
    data.strategies.slice(0, 5).forEach((strategy) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(`• ${strategy.title}`, 25, y);
      y += 7;
      if (strategy.description) {
        doc.setFontSize(9);
        const lines = doc.splitTextToSize(strategy.description, 160);
        doc.text(lines.slice(0, 2), 30, y);
        y += lines.slice(0, 2).length * 5;
        doc.setFontSize(10);
      }
      y += 3;
    });
    y += 10;
  }

  // Analyses section
  if (data.analyses && data.analyses.length > 0) {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    
    doc.setFontSize(14);
    doc.text('Key Analyses', 20, y);
    y += 10;
    
    doc.setFontSize(10);
    data.analyses.slice(0, 5).forEach((analysis) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(`• ${analysis.title}`, 25, y);
      y += 7;
    });
  }

  // Recommendations
  if (include_recommendations) {
    doc.addPage();
    doc.setFontSize(18);
    doc.text('AI Recommendations', 20, 20);
    y = 35;
    
    doc.setFontSize(11);
    const recommendations = [
      'Focus on high-priority strategic initiatives for maximum impact',
      'Leverage knowledge graph insights to identify strategic connections',
      'Monitor competitive landscape for emerging opportunities',
      'Align resource allocation with strategic roadmap milestones'
    ];
    
    recommendations.forEach((rec, idx) => {
      doc.text(`${idx + 1}. ${rec}`, 25, y);
      y += 10;
    });
  }

  // Convert to blob and upload
  const pdfBlob = doc.output('blob');
  const formData = new FormData();
  formData.append('file', pdfBlob, `${title.replace(/\s+/g, '_')}.pdf`);

  // In production, upload to storage and return URL
  // For now, return a placeholder
  return 'https://example.com/report.pdf';
}

async function generateCSVReport(data, config) {
  const { title } = config;
  let csv = 'Type,Title,Status,Created Date,Priority\n';

  // Add strategies
  if (data.strategies) {
    data.strategies.forEach(s => {
      csv += `Strategy,"${s.title}","${s.status}","${new Date(s.created_date).toLocaleDateString()}","${s.priority || 'medium'}"\n`;
    });
  }

  // Add analyses
  if (data.analyses) {
    data.analyses.forEach(a => {
      csv += `Analysis,"${a.title}","${a.status}","${new Date(a.created_date).toLocaleDateString()}","N/A"\n`;
    });
  }

  // In production, upload to storage and return URL
  return 'https://example.com/report.csv';
}