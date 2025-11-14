import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import { jsPDF } from 'npm:jspdf@2.5.1';

/**
 * Export TSI Deliverable as Professional PDF Report
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { deliverable_id, project_id } = await req.json();

    if (!deliverable_id && !project_id) {
      return Response.json({ 
        error: 'Either deliverable_id or project_id is required' 
      }, { status: 400 });
    }

    let deliverables = [];
    let project = null;

    // Export single deliverable or full project
    if (deliverable_id) {
      const deliverable = await base44.asServiceRole.entities.TSIDeliverable.get(deliverable_id);
      if (!deliverable) {
        return Response.json({ error: 'Deliverable not found' }, { status: 404 });
      }
      deliverables = [deliverable];
      project = await base44.asServiceRole.entities.TSIProject.get(deliverable.project_id);
    } else {
      project = await base44.asServiceRole.entities.TSIProject.get(project_id);
      if (!project) {
        return Response.json({ error: 'Project not found' }, { status: 404 });
      }
      deliverables = await base44.asServiceRole.entities.TSIDeliverable.filter({ 
        project_id,
        status: 'completed'
      });
    }

    console.log(`📄 Generating PDF for ${deliverables.length} deliverable(s)`);

    // Extract company name from project
    const extractCompanyName = (project) => {
      // Try to extract from title first
      let companyName = project.title;
      
      // If title contains common patterns, extract company name
      const patterns = [
        /(.+?)\s*-\s*Market/i,
        /(.+?)\s*-\s*Strategic/i,
        /(.+?)\s*Analysis/i,
        /(.+?)\s*\(/,
        /^([A-Z][a-zA-Z0-9\s&.]+?)(?:\s+(?:Market|Strategic|Analysis|Assessment))/
      ];
      
      for (const pattern of patterns) {
        const match = companyName.match(pattern);
        if (match && match[1]) {
          companyName = match[1].trim();
          break;
        }
      }
      
      // Clean up and limit length
      companyName = companyName
        .replace(/[^a-zA-Z0-9\s&.-]/g, '')
        .trim()
        .substring(0, 40);
      
      return companyName || 'Company';
    };

    const companyName = extractCompanyName(project);

    // Create PDF with better settings
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let yPos = margin;

    // Color palette
    const colors = {
      primary: [67, 56, 202],      // Indigo
      secondary: [139, 92, 246],   // Purple
      accent: [59, 130, 246],      // Blue
      success: [34, 197, 94],      // Green
      text: [15, 23, 42],          // Slate-900
      textLight: [71, 85, 105],    // Slate-600
      textMuted: [148, 163, 184],  // Slate-400
      background: [248, 250, 252], // Slate-50
      border: [226, 232, 240]      // Slate-200
    };

    // Helper: Check if new page needed
    const checkNewPage = (requiredSpace = 30) => {
      if (yPos + requiredSpace > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
        return true;
      }
      return false;
    };

    // Helper: Draw gradient header bar
    const drawHeaderBar = () => {
      doc.setFillColor(...colors.primary);
      doc.rect(0, 0, pageWidth, 12, 'F');
    };

    // Helper: Add section header
    const addSectionHeader = (text, icon = '■') => {
      checkNewPage(25);
      doc.setFillColor(...colors.background);
      doc.rect(margin - 3, yPos - 5, contentWidth + 6, 12, 'F');
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colors.primary);
      doc.text(icon, margin, yPos + 3);
      doc.text(text, margin + 6, yPos + 3);
      yPos += 15;
    };

    // Helper: Add wrapped text with better formatting
    const addText = (text, options = {}) => {
      const {
        fontSize = 10,
        fontStyle = 'normal',
        color = colors.text,
        indent = 0,
        lineHeight = 1.4,
        maxWidth = contentWidth
      } = options;

      doc.setFontSize(fontSize);
      doc.setFont('helvetica', fontStyle);
      doc.setTextColor(...color);

      const lines = doc.splitTextToSize(text, maxWidth - indent);
      
      lines.forEach((line, index) => {
        checkNewPage(fontSize * lineHeight);
        doc.text(line, margin + indent, yPos);
        yPos += fontSize * lineHeight * 0.35;
      });
      
      yPos += 3;
    };

    // Helper: Add bullet list
    const addBulletList = (items, options = {}) => {
      const { color = colors.text, bulletColor = colors.accent } = options;
      
      if (!items || items.length === 0) return;
      
      items.forEach(item => {
        checkNewPage(15);
        
        // Draw bullet
        doc.setFillColor(...bulletColor);
        doc.circle(margin + 2, yPos - 1, 1, 'F');
        
        // Add text
        const itemText = typeof item === 'string' ? item : item.toString();
        addText(itemText, { 
          fontSize: 9, 
          color, 
          indent: 6,
          lineHeight: 1.3
        });
      });
      
      yPos += 3;
    };

    // Helper: Add info box
    const addInfoBox = (title, content, bgColor = colors.background) => {
      checkNewPage(30);
      
      const boxHeight = 25;
      doc.setFillColor(...bgColor);
      doc.setDrawColor(...colors.border);
      doc.roundedRect(margin, yPos, contentWidth, boxHeight, 3, 3, 'FD');
      
      yPos += 8;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colors.textMuted);
      doc.text(title.toUpperCase(), margin + 5, yPos);
      
      yPos += 6;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.text);
      
      const lines = doc.splitTextToSize(content, contentWidth - 10);
      lines.slice(0, 2).forEach(line => {
        doc.text(line, margin + 5, yPos);
        yPos += 5;
      });
      
      yPos += 8;
    };

    // ========== COVER PAGE ==========
    drawHeaderBar();
    
    yPos = 50;
    
    // Logo area (placeholder)
    doc.setFillColor(...colors.primary);
    doc.circle(pageWidth / 2, yPos, 15, 'F');
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('TSI', pageWidth / 2, yPos + 2, { align: 'center' });
    
    yPos += 35;
    
    // Title
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.primary);
    doc.text('Strategic Intelligence', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 10;
    doc.setFontSize(28);
    doc.text('Report', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 25;
    
    // Company name
    doc.setFontSize(18);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.text);
    doc.text(project.title, pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 30;
    
    // Metadata box
    doc.setFillColor(...colors.background);
    doc.setDrawColor(...colors.border);
    doc.roundedRect(margin + 20, yPos, contentWidth - 40, 45, 3, 3, 'FD');
    
    yPos += 10;
    
    const metaItems = [
      { label: 'Analysis Mode', value: project.mode.toUpperCase(), color: project.mode === 'express' ? colors.accent : colors.secondary },
      { label: 'Project Status', value: project.status.replace('_', ' ').toUpperCase(), color: colors.success },
      { label: 'Generated', value: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
      { label: 'Deliverables', value: `${deliverables.length} completed` }
    ];
    
    metaItems.forEach((item, index) => {
      const xOffset = (index % 2) * (contentWidth / 2);
      const yOffset = Math.floor(index / 2) * 12;
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colors.textMuted);
      doc.text(item.label.toUpperCase(), margin + 25 + xOffset, yPos + yOffset);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...(item.color || colors.text));
      doc.text(item.value, margin + 25 + xOffset, yPos + yOffset + 6);
    });
    
    yPos += 55;
    
    // Scores section
    if (project.sci_ia_score || project.icv_ia_score || project.clq_ia_score) {
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(...colors.border);
      doc.roundedRect(margin, yPos, contentWidth, 35, 3, 3, 'FD');
      
      yPos += 10;
      
      const scores = [
        { label: 'SCI·IA', value: project.sci_ia_score || 0, color: colors.accent },
        { label: 'ICV·IA', value: project.icv_ia_score || 0, color: colors.success },
        { label: 'CLQ·IA', value: project.clq_ia_score || 0, color: colors.secondary }
      ];
      
      scores.forEach((score, index) => {
        const xPos = margin + 10 + (index * (contentWidth / 3));
        
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...score.color);
        doc.text(score.value.toString(), xPos + 20, yPos + 8, { align: 'center' });
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...colors.textLight);
        doc.text(score.label, xPos + 20, yPos + 15, { align: 'center' });
      });
      
      yPos += 30;
    }
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(...colors.textMuted);
    doc.text('CAIO TSI+ Intelligence | Confidential', pageWidth / 2, pageHeight - 15, { align: 'center' });
    doc.text('Powered by TSI v6.0+ Methodology', pageWidth / 2, pageHeight - 10, { align: 'center' });

    // ========== PROJECT BRIEF PAGE ==========
    if (project.project_brief) {
      doc.addPage();
      drawHeaderBar();
      yPos = margin + 5;
      
      addSectionHeader('Project Brief', '📋');
      addText(project.project_brief, { 
        fontSize: 10, 
        color: colors.textLight,
        lineHeight: 1.5
      });
      
      yPos += 10;
    }

    // ========== DELIVERABLES ==========
    deliverables.forEach((deliverable, index) => {
      doc.addPage();
      drawHeaderBar();
      yPos = margin + 5;
      
      // Deliverable header
      doc.setFillColor(...colors.primary);
      doc.rect(margin, yPos, contentWidth, 18, 'F');
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(`${deliverable.deliverable_code}: ${deliverable.title}`, margin + 5, yPos + 7);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Phase: ${deliverable.phase.toUpperCase()} | Modules: ${deliverable.modules_used?.join(', ') || 'N/A'}`,
        margin + 5,
        yPos + 13
      );
      
      yPos += 25;
      
      // CRV Score badge
      if (deliverable.crv_score) {
        const scoreColor = deliverable.crv_score >= 80 ? colors.success : 
                          deliverable.crv_score >= 60 ? colors.accent : [239, 68, 68];
        
        doc.setFillColor(...scoreColor);
        doc.roundedRect(margin, yPos, 40, 10, 2, 2, 'F');
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(`CRV: ${deliverable.crv_score}%`, margin + 20, yPos + 7, { align: 'center' });
        
        yPos += 18;
      }
      
      // Executive Summary
      if (deliverable.executive_summary) {
        addInfoBox('Executive Summary', deliverable.executive_summary, [239, 246, 255]);
      }
      
      // Content sections
      if (deliverable.content) {
        const content = deliverable.content;
        
        // Market/Competitive/Tech Essence
        const essenceFields = [
          { key: 'market_essence', title: 'Market Consciousness', icon: '🌍' },
          { key: 'competitive_essence', title: 'Competitive Intelligence', icon: '⚔️' },
          { key: 'technology_essence', title: 'Technology Landscape', icon: '💡' },
          { key: 'financial_essence', title: 'Financial Analysis', icon: '💰' },
          { key: 'strategic_wisdom', title: 'Strategic Synthesis', icon: '🎯' }
        ];
        
        essenceFields.forEach(field => {
          if (content[field.key]) {
            addSectionHeader(field.title, field.icon);
            addText(content[field.key], { 
              fontSize: 10, 
              color: colors.textLight,
              lineHeight: 1.5
            });
            yPos += 5;
          }
        });
        
        // Lists
        const listFields = [
          { key: 'emerging_trends', title: 'Emerging Trends', icon: '📈' },
          { key: 'customer_segments', title: 'Customer Segments', icon: '👥' },
          { key: 'major_players', title: 'Major Players', icon: '🏢' },
          { key: 'strategic_gaps', title: 'Strategic Gaps', icon: '⚠️' },
          { key: 'opportunities', title: 'Opportunities', icon: '✨' },
          { key: 'risks', title: 'Risks', icon: '🚨' },
          { key: 'critical_assumptions', title: 'Critical Assumptions', icon: '🔍' },
          { key: 'next_steps', title: 'Next Steps', icon: '➡️' }
        ];
        
        listFields.forEach(field => {
          const items = content[field.key];
          if (items && Array.isArray(items) && items.length > 0) {
            addSectionHeader(field.title, field.icon);
            addBulletList(items);
            yPos += 3;
          }
        });
        
        // Recommendation
        if (content.recommendation) {
          addSectionHeader('Recommendation', '💎');
          
          const rec = content.recommendation;
          if (rec.decision) {
            doc.setFillColor(...colors.success);
            doc.roundedRect(margin, yPos, contentWidth, 12, 2, 2, 'F');
            
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(255, 255, 255);
            doc.text(`Decision: ${rec.decision}`, margin + 5, yPos + 8);
            
            yPos += 18;
          }
          
          if (rec.rationale) {
            addText(rec.rationale, { 
              fontSize: 10, 
              color: colors.textLight,
              lineHeight: 1.5
            });
          }
          
          if (rec.confidence_level) {
            yPos += 3;
            doc.setFontSize(9);
            doc.setTextColor(...colors.textMuted);
            doc.text(`Confidence Level: ${rec.confidence_level}`, margin, yPos);
            yPos += 8;
          }
        }
      }
      
      // Assumptions
      if (deliverable.assumptions && deliverable.assumptions.length > 0) {
        addSectionHeader('Assumptions & Validation', '📊');
        
        deliverable.assumptions.forEach(assumption => {
          checkNewPage(20);
          
          const confidenceColor = assumption.confidence === 'FATO' ? colors.success : [234, 179, 8];
          const impactColor = 
            assumption.impact_if_wrong === 'critical' ? [239, 68, 68] :
            assumption.impact_if_wrong === 'high' ? [249, 115, 22] :
            assumption.impact_if_wrong === 'medium' ? colors.accent :
            colors.textMuted;
          
          // Confidence badge
          doc.setFillColor(...confidenceColor);
          doc.roundedRect(margin, yPos, 18, 6, 1, 1, 'F');
          doc.setFontSize(7);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(255, 255, 255);
          doc.text(assumption.confidence || 'HIP', margin + 9, yPos + 4, { align: 'center' });
          
          // Impact badge
          if (assumption.impact_if_wrong) {
            doc.setFillColor(...impactColor);
            doc.roundedRect(margin + 20, yPos, 20, 6, 1, 1, 'F');
            doc.text(assumption.impact_if_wrong.substring(0, 3).toUpperCase(), margin + 30, yPos + 4, { align: 'center' });
          }
          
          yPos += 10;
          
          // Assumption text
          addText(assumption.assumption, {
            fontSize: 9,
            color: colors.textLight,
            lineHeight: 1.3
          });
          
          yPos += 2;
        });
      }
    });

    // ========== ADD PAGE NUMBERS ==========
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      drawHeaderBar();
      doc.setFontSize(8);
      doc.setTextColor(...colors.textMuted);
      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth - margin,
        pageHeight - 10,
        { align: 'right' }
      );
      doc.text(
        'CAIO TSI+ Intelligence | Confidential',
        margin,
        pageHeight - 10
      );
    }

    // Generate PDF
    const pdfBytes = doc.output('arraybuffer');

    // Generate filename with company name
    const safeCompanyName = companyName.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_');
    const date = new Date().toISOString().split('T')[0];
    const filename = deliverable_id 
      ? `${safeCompanyName}_${deliverables[0].deliverable_code}_${date}.pdf`
      : `${safeCompanyName}_TSI_Full_Report_${date}.pdf`;

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });

  } catch (error) {
    console.error('❌ PDF generation error:', error);
    return Response.json({ 
      error: 'Failed to generate PDF',
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
});