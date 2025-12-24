import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, TrendingUp, Target, DollarSign, Code,
  CheckCircle, AlertCircle, Download, FileText,
  BarChart3, Lightbulb, Rocket, Network
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AnalysisReportModal({ analysis, open, onClose }) {
  if (!analysis) return null;

  const results = analysis.analysis_results || {};
  const moduleOutputs = results.module_outputs || {};
  const masterSynthesis = results.master_synthesis;

  const parseModuleOutput = (output) => {
    if (!output) return null;
    try {
      return typeof output === 'string' ? JSON.parse(output) : output;
    } catch {
      return null;
    }
  };

  const downloadReport = () => {
    const companyName = analysis.target?.company_name || 'Company';
    const date = new Date().toISOString().split('T')[0];
    
    // Create HTML document that Word can open
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>SIU Report - ${companyName}</title>
        <style>
          body {
            font-family: 'Calibri', 'Arial', sans-serif;
            line-height: 1.6;
            color: #000;
            max-width: 8.5in;
            margin: 0 auto;
            padding: 1in;
          }
          h1 {
            color: #2563eb;
            font-size: 28pt;
            margin-bottom: 10pt;
            border-bottom: 3pt solid #2563eb;
            padding-bottom: 10pt;
          }
          h2 {
            color: #1e40af;
            font-size: 20pt;
            margin-top: 20pt;
            margin-bottom: 10pt;
            border-bottom: 1pt solid #cbd5e1;
            padding-bottom: 5pt;
          }
          h3 {
            color: #334155;
            font-size: 16pt;
            margin-top: 15pt;
            margin-bottom: 8pt;
          }
          h4 {
            color: #475569;
            font-size: 14pt;
            margin-top: 12pt;
            margin-bottom: 6pt;
          }
          p {
            margin-bottom: 10pt;
            text-align: justify;
          }
          .metadata {
            background-color: #f1f5f9;
            padding: 15pt;
            margin-bottom: 20pt;
            border-left: 4pt solid #2563eb;
          }
          .metadata table {
            width: 100%;
            border-collapse: collapse;
          }
          .metadata td {
            padding: 5pt;
          }
          .metadata td:first-child {
            font-weight: bold;
            width: 30%;
          }
          .executive-summary {
            background-color: #eff6ff;
            padding: 20pt;
            margin: 20pt 0;
            border-left: 5pt solid #3b82f6;
          }
          .module-section {
            margin-top: 25pt;
            page-break-inside: avoid;
          }
          .confidence-badge {
            display: inline-block;
            background-color: #10b981;
            color: white;
            padding: 5pt 10pt;
            border-radius: 5pt;
            font-weight: bold;
          }
          .warning-badge {
            display: inline-block;
            background-color: #f59e0b;
            color: white;
            padding: 5pt 10pt;
            border-radius: 5pt;
            font-weight: bold;
          }
          ul, ol {
            margin-left: 20pt;
            margin-bottom: 10pt;
          }
          li {
            margin-bottom: 5pt;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 15pt 0;
          }
          table th {
            background-color: #2563eb;
            color: white;
            padding: 8pt;
            text-align: left;
            font-weight: bold;
          }
          table td {
            padding: 8pt;
            border-bottom: 1pt solid #e2e8f0;
          }
          table tr:nth-child(even) {
            background-color: #f8fafc;
          }
          .footer {
            margin-top: 40pt;
            padding-top: 20pt;
            border-top: 2pt solid #cbd5e1;
            font-size: 10pt;
            color: #64748b;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <h1>📊 Strategic Intelligence Unit v2.0</h1>
        <h1>${companyName} - Relatório Completo</h1>
        
        <div class="metadata">
          <table>
            <tr>
              <td>Empresa Analisada:</td>
              <td>${analysis.target?.company_name || 'N/A'}</td>
            </tr>
            <tr>
              <td>Indústria:</td>
              <td>${analysis.target?.industry || 'N/A'}</td>
            </tr>
            <tr>
              <td>Geografia:</td>
              <td>${analysis.target?.geography || 'N/A'}</td>
            </tr>
            <tr>
              <td>Tipo de Análise:</td>
              <td>${(analysis.mission?.type || 'N/A').replace(/_/g, ' ').toUpperCase()}</td>
            </tr>
            <tr>
              <td>Data da Análise:</td>
              <td>${new Date(analysis.created_date).toLocaleDateString('pt-BR')}</td>
            </tr>
            <tr>
              <td>Confidence Score:</td>
              <td><span class="confidence-badge">${analysis.confidence_score || 'N/A'}%</span></td>
            </tr>
            <tr>
              <td>Agentes Invocados:</td>
              <td>${results.agents_invoked?.length || 0} agentes especializados</td>
            </tr>
            <tr>
              <td>Tempo de Execução:</td>
              <td>${results.execution_time_seconds || 'N/A'} segundos</td>
            </tr>
          </table>
        </div>

        <h2>🎯 Objetivo Principal</h2>
        <p>${analysis.mission?.primary_objective || 'Não especificado'}</p>

        ${masterSynthesis ? `
        <div class="executive-summary">
          <h2>🧠 Executive Synthesis (CAIO Master)</h2>
          <p>${masterSynthesis.replace(/\n/g, '</p><p>')}</p>
        </div>
        ` : ''}

        ${generateModulesHTML(moduleOutputs)}

        <div class="footer">
          <p><strong>CAIO·AI Platform - Strategic Intelligence Unit v2.0</strong></p>
          <p>Powered by CAIO/TSI Methodology | Multi-LLM Orchestration</p>
          <p>Generated on ${new Date().toLocaleDateString('pt-BR')} at ${new Date().toLocaleTimeString('pt-BR')}</p>
        </div>
      </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SIU_Report_${companyName.replace(/\s+/g, '_')}_${date}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateModulesHTML = (modules) => {
    if (!modules || Object.keys(modules).length === 0) {
      return '<p><em>Nenhum módulo executado ainda.</em></p>';
    }

    const moduleNames = {
      'm1_market_context': 'M1 - Market Context',
      'm2_competitive_intel': 'M2 - Competitive Intelligence',
      'm3_tech_innovation': 'M3 - Tech & Innovation',
      'm4_financial_model': 'M4 - Financial Model',
      'm5_strategic_synthesis': 'M5 - Strategic Synthesis',
      'm6_opportunity_matrix': 'M6 - Opportunity Matrix',
      'm7_implementation': 'M7 - Implementation Roadmap',
      'm8_reframing_loop': 'M8 - Reframing Loop'
    };

    let html = '<h2>📈 Análise por Módulos</h2>';

    Object.entries(modules).forEach(([key, value]) => {
      const moduleName = moduleNames[key] || key.toUpperCase();
      const parsed = parseModuleOutput(value);

      html += `<div class="module-section">`;
      html += `<h3>${moduleName}</h3>`;

      if (parsed && typeof parsed === 'object') {
        html += renderObjectAsHTML(parsed);
      } else if (typeof value === 'string') {
        html += `<p>${value}</p>`;
      } else {
        html += `<p><em>Dados não disponíveis</em></p>`;
      }

      html += `</div>`;
    });

    return html;
  };

  const renderObjectAsHTML = (obj, level = 0) => {
    let html = '';

    Object.entries(obj).forEach(([key, value]) => {
      const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

      if (Array.isArray(value)) {
        html += `<h4>${label}:</h4><ul>`;
        value.forEach(item => {
          if (typeof item === 'object') {
            html += `<li>${renderObjectAsHTML(item, level + 1)}</li>`;
          } else {
            html += `<li>${item}</li>`;
          }
        });
        html += `</ul>`;
      } else if (typeof value === 'object' && value !== null) {
        html += `<h4>${label}:</h4>`;
        html += renderObjectAsHTML(value, level + 1);
      } else {
        html += `<p><strong>${label}:</strong> ${value}</p>`;
      }
    });

    return html;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-slate-950 border-white/10 text-white">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl text-white mb-2">
                {analysis.target?.company_name} - Relatório SIU v2.0
              </DialogTitle>
              <div className="flex gap-2 flex-wrap">
                <Badge className="bg-purple-500/20 text-purple-400">
                  {(analysis.mission?.type || 'unknown').replace(/_/g, ' ')}
                </Badge>
                {analysis.confidence_score && (
                  <Badge className="bg-green-500/20 text-green-400">
                    Confidence: {analysis.confidence_score}%
                  </Badge>
                )}
                <Badge className="bg-blue-500/20 text-blue-400">
                  {results.agents_invoked?.length || 0} agents invoked
                </Badge>
              </div>
            </div>
            <Button
              onClick={downloadReport}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/5"
            >
              <Download className="w-4 h-4 mr-2" />
              Download .doc
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Executive Summary */}
          {masterSynthesis && (
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Brain className="w-5 h-5 text-purple-400" />
                  Executive Synthesis (CAIO Master)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  <p className="text-slate-300 whitespace-pre-wrap">{masterSynthesis}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Module Outputs */}
          <Tabs defaultValue="m1" className="w-full">
            <TabsList className="grid grid-cols-4 lg:grid-cols-8 gap-2 bg-white/5 p-2">
              {Object.keys(moduleOutputs).map((module) => (
                <TabsTrigger
                  key={module}
                  value={module}
                  className="text-xs data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
                >
                  {module.toUpperCase().replace('_', ' ')}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(moduleOutputs).map(([moduleKey, moduleOutput]) => (
              <TabsContent key={moduleKey} value={moduleKey} className="space-y-4">
                <ModuleCard
                  title={moduleKey.toUpperCase().replace(/_/g, ' ')}
                  icon={<Brain className="w-5 h-5" />}
                  content={parseModuleOutput(moduleOutput)}
                />
              </TabsContent>
            ))}
          </Tabs>

          {/* Execution Metadata */}
          {results.execution_time_seconds && (
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-sm">Execution Metadata</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-slate-400">Execution Time</div>
                    <div className="text-white font-semibold">{results.execution_time_seconds}s</div>
                  </div>
                  <div>
                    <div className="text-slate-400">LLM Diversity</div>
                    <div className="text-white font-semibold">{results.llm_diversity_score || 0}/6</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Workflow</div>
                    <div className="text-white font-semibold">{results.workflow || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Agents</div>
                    <div className="text-white font-semibold">{results.agents_invoked?.length || 0}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ModuleCard({ title, icon, content }) {
  if (!content) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-6 text-center text-slate-400">
          <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No data available for this module</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(content).map(([key, value]) => {
          if (key === 'confidence_score') {
            return (
              <div key={key} className="flex items-center justify-between">
                <span className="text-slate-400 capitalize">{key.replace(/_/g, ' ')}:</span>
                <Badge className="bg-green-500/20 text-green-400">
                  {value}%
                </Badge>
              </div>
            );
          }

          if (Array.isArray(value)) {
            return (
              <div key={key} className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-300 capitalize">
                  {key.replace(/_/g, ' ')}
                </h4>
                <ul className="space-y-2 ml-4">
                  {value.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-400">
                      <CheckCircleIcon className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>
                        {typeof item === 'object' ? JSON.stringify(item, null, 2) : item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          }

          if (typeof value === 'object' && value !== null) {
            return (
              <div key={key} className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-300 capitalize">
                  {key.replace(/_/g, ' ')}
                </h4>
                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <pre className="text-xs text-slate-400 overflow-x-auto">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                </div>
              </div>
            );
          }

          return (
            <div key={key} className="flex items-start justify-between">
              <span className="text-slate-400 capitalize">{key.replace(/_/g, ' ')}:</span>
              <span className="text-white text-right max-w-md">{String(value)}</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}