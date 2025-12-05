import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FileDown, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";

export default function ComparisonPDFExport({ comparisonResult, selectedAnalyses, onClose }) {
  const [isExporting, setIsExporting] = useState(false);
  const [sections, setSections] = useState({
    overview: true,
    keyDifferences: true,
    strategicInsights: true,
    riskAssessment: true,
    opportunities: true,
    decisionFramework: true
  });

  const toggleSection = (key) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const generatePDF = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let y = 20;

      // Helper functions
      const addTitle = (text, size = 16) => {
        doc.setFontSize(size);
        doc.setTextColor(0, 100, 180);
        doc.text(text, margin, y);
        y += size * 0.6;
      };

      const addSubtitle = (text) => {
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(text, margin, y);
        y += 8;
      };

      const addText = (text, indent = 0) => {
        doc.setFontSize(10);
        doc.setTextColor(40, 40, 40);
        const lines = doc.splitTextToSize(text, pageWidth - margin * 2 - indent);
        doc.text(lines, margin + indent, y);
        y += lines.length * 5;
      };

      const addBullet = (text) => {
        addText(`• ${text}`, 5);
      };

      const checkPageBreak = (neededSpace = 30) => {
        if (y > doc.internal.pageSize.getHeight() - neededSpace) {
          doc.addPage();
          y = 20;
        }
      };

      const addSeparator = () => {
        y += 5;
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y, pageWidth - margin, y);
        y += 10;
      };

      // Header
      addTitle("CAIO·AI Scenario Comparison Report", 20);
      y += 5;
      addSubtitle(`Generated: ${new Date().toLocaleString()}`);
      addSubtitle(`Analyses compared: ${selectedAnalyses?.length || 0}`);
      addSeparator();

      // Overview
      if (sections.overview && selectedAnalyses?.length > 0) {
        addTitle("Analyses Overview");
        selectedAnalyses.forEach((analysis, idx) => {
          checkPageBreak();
          addSubtitle(`${idx + 1}. ${analysis.title}`);
          addText(`Industry: ${analysis.results?.industry || 'N/A'}`);
          addText(`Geography: ${analysis.results?.geography || 'Global'}`);
          addText(`Time Horizon: ${analysis.results?.time_horizon || 'N/A'} years`);
          y += 5;
        });
        addSeparator();
      }

      // Key Differences
      if (sections.keyDifferences && comparisonResult?.key_differences?.length > 0) {
        checkPageBreak();
        addTitle("Key Differences");
        comparisonResult.key_differences.forEach((diff, idx) => {
          checkPageBreak();
          addSubtitle(`${diff.aspect} (${diff.significance} significance)`);
          addText(diff.comparison);
          y += 3;
        });
        addSeparator();
      }

      // Strategic Insights
      if (sections.strategicInsights && comparisonResult?.strategic_insights?.length > 0) {
        checkPageBreak();
        addTitle("Strategic Insights");
        comparisonResult.strategic_insights.forEach((insight, idx) => {
          checkPageBreak(40);
          addSubtitle(`Insight ${idx + 1}`);
          addText(insight.insight);
          
          if (insight.implications?.length > 0) {
            y += 3;
            addText("Implications:", 0);
            insight.implications.forEach(imp => addBullet(imp));
          }
          
          if (insight.recommended_actions?.length > 0) {
            y += 3;
            addText("Recommended Actions:", 0);
            insight.recommended_actions.forEach(action => addBullet(action));
          }
          y += 5;
        });
        addSeparator();
      }

      // Risk Assessment
      if (sections.riskAssessment && comparisonResult?.risk_assessment) {
        checkPageBreak();
        addTitle("Risk Assessment");
        
        if (comparisonResult.risk_assessment.combined_risks?.length > 0) {
          addSubtitle("Combined Risks");
          comparisonResult.risk_assessment.combined_risks.forEach(risk => addBullet(risk));
        }
        
        y += 5;
        
        if (comparisonResult.risk_assessment.mitigation_strategies?.length > 0) {
          addSubtitle("Mitigation Strategies");
          comparisonResult.risk_assessment.mitigation_strategies.forEach(strategy => addBullet(strategy));
        }
        addSeparator();
      }

      // Opportunities
      if (sections.opportunities && comparisonResult?.opportunity_synthesis) {
        checkPageBreak();
        addTitle("Opportunity Synthesis");
        
        if (comparisonResult.opportunity_synthesis.cross_cutting_opportunities?.length > 0) {
          addSubtitle("Cross-Cutting Opportunities");
          comparisonResult.opportunity_synthesis.cross_cutting_opportunities.forEach(opp => addBullet(opp));
        }
        
        y += 5;
        
        if (comparisonResult.opportunity_synthesis.prioritized_actions?.length > 0) {
          addSubtitle("Prioritized Actions");
          comparisonResult.opportunity_synthesis.prioritized_actions.forEach(action => addBullet(action));
        }
        addSeparator();
      }

      // Decision Framework
      if (sections.decisionFramework && comparisonResult?.decision_framework) {
        checkPageBreak();
        addTitle("Decision Framework");
        
        const df = comparisonResult.decision_framework;
        
        addSubtitle("If Optimistic Scenario:");
        addText(df.if_optimistic || 'N/A');
        y += 5;
        
        addSubtitle("If Baseline Scenario:");
        addText(df.if_baseline || 'N/A');
        y += 5;
        
        addSubtitle("If Pessimistic Scenario:");
        addText(df.if_pessimistic || 'N/A');
        y += 5;
        
        addSubtitle("Hedging Strategy:");
        addText(df.hedging_strategy || 'N/A');
      }

      // Footer on last page
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        "Generated by CAIO·AI Strategic Intelligence Platform",
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );

      // Save
      doc.save(`CAIO_Scenario_Comparison_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("PDF exported successfully!");
      onClose();
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Error exporting PDF: " + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-white/10 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <FileDown className="w-5 h-5 text-blue-400" />
            Export Comparison Report
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <p className="text-slate-400 text-sm">Select sections to include in the PDF:</p>
          
          <div className="space-y-3">
            {[
              { key: "overview", label: "Analyses Overview" },
              { key: "keyDifferences", label: "Key Differences" },
              { key: "strategicInsights", label: "Strategic Insights" },
              { key: "riskAssessment", label: "Risk Assessment" },
              { key: "opportunities", label: "Opportunity Synthesis" },
              { key: "decisionFramework", label: "Decision Framework" }
            ].map(section => (
              <div key={section.key} className="flex items-center gap-3">
                <Checkbox
                  id={section.key}
                  checked={sections[section.key]}
                  onCheckedChange={() => toggleSection(section.key)}
                />
                <Label htmlFor={section.key} className="text-white cursor-pointer">
                  {section.label}
                </Label>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-white/10 text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={generatePDF}
              disabled={isExporting || !Object.values(sections).some(Boolean)}
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              {isExporting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Exporting...</>
              ) : (
                <><FileDown className="w-4 h-4 mr-2" /> Export PDF</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}