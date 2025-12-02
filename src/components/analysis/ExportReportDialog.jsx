import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Download, FileText, FileSpreadsheet, Loader2, 
  CheckCircle, TrendingUp, AlertTriangle, Target, Lightbulb
} from "lucide-react";
import { toast } from "sonner";

export default function ExportReportDialog({ open, onClose, data, insights, files }) {
  const [format, setFormat] = useState("pdf");
  const [isExporting, setIsExporting] = useState(false);
  const [sections, setSections] = useState({
    summary: true,
    trends: true,
    anomalies: true,
    correlations: true,
    insights: true,
    recommendations: true,
    rawData: false
  });

  const toggleSection = (key) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const exportToPDF = () => {
    // Generate HTML content for PDF
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório de Análise de Dados - CAIO·AI</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #1e293b; }
          h1 { color: #0d2847; border-bottom: 2px solid #00D4FF; padding-bottom: 10px; }
          h2 { color: #00D4FF; margin-top: 30px; }
          h3 { color: #334155; }
          .section { margin: 20px 0; padding: 15px; background: #f8fafc; border-radius: 8px; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; margin-right: 8px; }
          .badge-green { background: #dcfce7; color: #166534; }
          .badge-amber { background: #fef3c7; color: #92400e; }
          .badge-red { background: #fee2e2; color: #991b1b; }
          .badge-blue { background: #dbeafe; color: #1e40af; }
          .item { padding: 12px; margin: 8px 0; background: white; border-left: 4px solid #00D4FF; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0; }
          th { background: #f1f5f9; }
        </style>
      </head>
      <body>
        <h1>📊 Relatório de Análise de Dados</h1>
        <p style="color: #64748b;">Gerado por CAIO·AI em ${new Date().toLocaleString('pt-BR')}</p>
    `;

    if (sections.summary && insights?.summary) {
      htmlContent += `
        <div class="section">
          <h2>📋 Resumo Executivo</h2>
          <p>${insights.summary}</p>
          <p><strong>Score de Qualidade:</strong> ${insights.overallScore || 85}/100</p>
        </div>
      `;
    }

    if (sections.trends && insights?.trends?.length > 0) {
      htmlContent += `
        <div class="section">
          <h2>📈 Tendências Identificadas</h2>
          ${insights.trends.map(t => `
            <div class="item">
              <h3>${t.direction === 'up' ? '↑' : t.direction === 'down' ? '↓' : '→'} ${t.title}</h3>
              <p>${t.description}</p>
              <span class="badge badge-${t.impact === 'high' ? 'red' : t.impact === 'medium' ? 'amber' : 'green'}">
                Impacto: ${t.impact}
              </span>
              <span class="badge badge-blue">Confiança: ${t.confidence || 75}%</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    if (sections.anomalies && insights?.anomalies?.length > 0) {
      htmlContent += `
        <div class="section">
          <h2>⚠️ Anomalias Detectadas</h2>
          ${insights.anomalies.map(a => `
            <div class="item">
              <h3>${a.title}</h3>
              <p>${a.description}</p>
              <span class="badge badge-${a.severity === 'critical' ? 'red' : a.severity === 'warning' ? 'amber' : 'blue'}">
                ${a.severity}
              </span>
              ${a.recommendation ? `<p><strong>Recomendação:</strong> ${a.recommendation}</p>` : ''}
            </div>
          `).join('')}
        </div>
      `;
    }

    if (sections.correlations && insights?.correlations?.length > 0) {
      htmlContent += `
        <div class="section">
          <h2>🔗 Correlações Descobertas</h2>
          <table>
            <tr>
              <th>Variáveis</th>
              <th>Tipo</th>
              <th>Força</th>
              <th>Descrição</th>
            </tr>
            ${insights.correlations.map(c => `
              <tr>
                <td>${c.variables?.join(' × ') || '-'}</td>
                <td>${c.type}</td>
                <td>${(c.strength * 100).toFixed(0)}%</td>
                <td>${c.description}</td>
              </tr>
            `).join('')}
          </table>
        </div>
      `;
    }

    if (sections.insights && insights?.strategicInsights?.length > 0) {
      htmlContent += `
        <div class="section">
          <h2>💡 Insights Estratégicos</h2>
          ${insights.strategicInsights.map(i => `
            <div class="item">
              <h3>${i.title}</h3>
              <p>${i.insight}</p>
              <span class="badge badge-${i.priority === 'critical' ? 'red' : i.priority === 'high' ? 'amber' : 'blue'}">
                Prioridade: ${i.priority}
              </span>
              ${i.actionRequired ? '<span class="badge badge-red">Ação Necessária</span>' : ''}
            </div>
          `).join('')}
        </div>
      `;
    }

    if (sections.recommendations && insights?.recommendations?.length > 0) {
      htmlContent += `
        <div class="section">
          <h2>🎯 Recomendações</h2>
          ${insights.recommendations.map((r, idx) => `
            <div class="item">
              <h3>${idx + 1}. ${r.action}</h3>
              <p>${r.rationale}</p>
              <p><strong>Impacto Esperado:</strong> ${r.expectedImpact}</p>
              ${r.timeframe ? `<p><strong>Prazo:</strong> ${r.timeframe}</p>` : ''}
            </div>
          `).join('')}
        </div>
      `;
    }

    htmlContent += `
        <div class="footer">
          <p>Relatório gerado automaticamente por CAIO·AI - Plataforma de Inteligência Estratégica</p>
          <p>© ${new Date().getFullYear()} CAIO·AI. Todos os direitos reservados.</p>
        </div>
      </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-analise-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    let csvContent = "Seção,Tipo,Título,Descrição,Detalhes\n";

    if (sections.trends && insights?.trends) {
      insights.trends.forEach(t => {
        csvContent += `Tendências,${t.direction},${t.title},"${t.description}",Impacto: ${t.impact} | Confiança: ${t.confidence}%\n`;
      });
    }

    if (sections.anomalies && insights?.anomalies) {
      insights.anomalies.forEach(a => {
        csvContent += `Anomalias,${a.severity},${a.title},"${a.description}","${a.recommendation || ''}"\n`;
      });
    }

    if (sections.correlations && insights?.correlations) {
      insights.correlations.forEach(c => {
        csvContent += `Correlações,${c.type},${c.variables?.join(' × ')},"${c.description}",Força: ${(c.strength * 100).toFixed(0)}%\n`;
      });
    }

    if (sections.insights && insights?.strategicInsights) {
      insights.strategicInsights.forEach(i => {
        csvContent += `Insights,${i.priority},${i.title},"${i.insight}",${i.actionRequired ? 'Ação Necessária' : ''}\n`;
      });
    }

    if (sections.recommendations && insights?.recommendations) {
      insights.recommendations.forEach(r => {
        csvContent += `Recomendações,-,${r.action},"${r.rationale}",${r.expectedImpact} | ${r.timeframe || ''}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-analise-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      if (format === "pdf") {
        exportToPDF();
      } else {
        exportToCSV();
      }
      
      toast.success(`Relatório exportado em ${format.toUpperCase()}`);
      onClose();
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Erro ao exportar relatório");
    } finally {
      setIsExporting(false);
    }
  };

  const sectionOptions = [
    { key: "summary", label: "Resumo Executivo", icon: FileText },
    { key: "trends", label: "Tendências", icon: TrendingUp },
    { key: "anomalies", label: "Anomalias", icon: AlertTriangle },
    { key: "correlations", label: "Correlações", icon: Lightbulb },
    { key: "insights", label: "Insights Estratégicos", icon: Lightbulb },
    { key: "recommendations", label: "Recomendações", icon: Target },
    { key: "rawData", label: "Dados Brutos", icon: FileSpreadsheet }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-slate-900 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Download className="w-5 h-5 text-[#00D4FF]" />
            Exportar Relatório
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <div>
            <Label className="text-slate-300 mb-3 block">Formato de Exportação</Label>
            <RadioGroup value={format} onValueChange={setFormat} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" className="border-white/20" />
                <Label htmlFor="pdf" className="text-white flex items-center gap-2 cursor-pointer">
                  <FileText className="w-4 h-4 text-red-400" />
                  PDF/HTML
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" className="border-white/20" />
                <Label htmlFor="csv" className="text-white flex items-center gap-2 cursor-pointer">
                  <FileSpreadsheet className="w-4 h-4 text-green-400" />
                  CSV
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Section Selection */}
          <div>
            <Label className="text-slate-300 mb-3 block">Seções a Incluir</Label>
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4 space-y-3">
                {sectionOptions.map(({ key, label, icon: Icon }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-300">{label}</span>
                    </div>
                    <Checkbox
                      checked={sections[key]}
                      onCheckedChange={() => toggleSection(key)}
                      className="border-white/20 data-[state=checked]:bg-[#00D4FF] data-[state=checked]:border-[#00D4FF]"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Export Button */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-white/20 text-slate-300 hover:bg-white/10"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting || !Object.values(sections).some(Boolean)}
              className="flex-1 bg-[#00D4FF] hover:bg-[#00E5FF] text-[#0A1628]"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar {format.toUpperCase()}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}