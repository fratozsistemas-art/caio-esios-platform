import React, { useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, FileSpreadsheet, TrendingUp, AlertTriangle, 
  Download, Trash2, Plus, Brain, BarChart3, LineChart,
  Loader2, CheckCircle, Sparkles, Filter, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import MultiFileUploader from "@/components/analysis/MultiFileUploader";
import DataVisualizationPanel from "@/components/analysis/DataVisualizationPanel";
import AIInsightsPanel from "@/components/analysis/AIInsightsPanel";
import ExportReportDialog from "@/components/analysis/ExportReportDialog";

export default function AdvancedDataAnalysis() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [consolidatedData, setConsolidatedData] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [showExportDialog, setShowExportDialog] = useState(false);

  const handleFilesUploaded = useCallback(async (files) => {
    setUploadedFiles(prev => [...prev, ...files]);
    toast.success(`${files.length} arquivo(s) carregado(s) com sucesso`);
  }, []);

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    toast.info("Arquivo removido");
  };

  const processFiles = async () => {
    if (uploadedFiles.length === 0) {
      toast.error("Carregue pelo menos um arquivo para processar");
      return;
    }

    setIsProcessing(true);
    try {
      const allData = [];
      
      for (const file of uploadedFiles) {
        const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
          file_url: file.url,
          json_schema: {
            type: "object",
            properties: {
              headers: { type: "array", items: { type: "string" } },
              rows: { type: "array", items: { type: "array" } },
              summary: {
                type: "object",
                properties: {
                  total_rows: { type: "number" },
                  numeric_columns: { type: "array", items: { type: "string" } },
                  date_columns: { type: "array", items: { type: "string" } },
                  text_columns: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        });

        if (result.status === "success" && result.output) {
          allData.push({
            fileName: file.name,
            ...result.output
          });
        }
      }

      setConsolidatedData({
        files: allData,
        processedAt: new Date().toISOString(),
        totalFiles: uploadedFiles.length
      });

      setActiveTab("visualize");
      toast.success("Dados processados com sucesso!");
    } catch (error) {
      console.error("Error processing files:", error);
      toast.error("Erro ao processar arquivos");
    } finally {
      setIsProcessing(false);
    }
  };

  const runAIAnalysis = async () => {
    if (!consolidatedData) {
      toast.error("Processe os arquivos primeiro");
      return;
    }

    setIsAnalyzing(true);
    try {
      const dataSnapshot = JSON.stringify(consolidatedData.files.slice(0, 2).map(f => ({
        file: f.fileName,
        headers: f.headers,
        sampleRows: f.rows?.slice(0, 10),
        summary: f.summary
      })));

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é um analista de dados sênior. Analise os seguintes dados e forneça insights estratégicos:

DADOS:
${dataSnapshot}

TAREFAS OBRIGATÓRIAS:
1. TENDÊNCIAS: Identifique padrões temporais, sazonalidades e direções de crescimento
2. ANOMALIAS: Detecte outliers, valores atípicos e inconsistências
3. CORRELAÇÕES: Encontre relacionamentos entre variáveis diferentes
4. INSIGHTS ESTRATÉGICOS: Extraia conclusões acionáveis para tomada de decisão
5. RECOMENDAÇÕES: Sugira ações baseadas nos dados

Retorne JSON estruturado com análise completa.`,
        response_json_schema: {
          type: "object",
          properties: {
            trends: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  direction: { type: "string", enum: ["up", "down", "stable", "volatile"] },
                  confidence: { type: "number" },
                  impact: { type: "string", enum: ["high", "medium", "low"] }
                }
              }
            },
            anomalies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  severity: { type: "string", enum: ["critical", "warning", "info"] },
                  recommendation: { type: "string" }
                }
              }
            },
            correlations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  variables: { type: "array", items: { type: "string" } },
                  strength: { type: "number" },
                  type: { type: "string", enum: ["positive", "negative", "non-linear"] },
                  description: { type: "string" }
                }
              }
            },
            strategicInsights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  insight: { type: "string" },
                  actionRequired: { type: "boolean" },
                  priority: { type: "string", enum: ["critical", "high", "medium", "low"] }
                }
              }
            },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  rationale: { type: "string" },
                  expectedImpact: { type: "string" },
                  timeframe: { type: "string" }
                }
              }
            },
            overallScore: { type: "number" },
            summary: { type: "string" }
          }
        }
      });

      setAiInsights(result);
      setActiveTab("insights");
      toast.success("Análise de IA concluída!");
    } catch (error) {
      console.error("Error running AI analysis:", error);
      toast.error("Erro na análise de IA");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearAll = () => {
    setUploadedFiles([]);
    setConsolidatedData(null);
    setAiInsights(null);
    setActiveTab("upload");
    toast.info("Dados limpos");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-[#00D4FF]" />
            Análise Avançada de Dados
          </h1>
          <p className="text-slate-400 mt-1">
            Upload múltiplo, visualizações interativas e insights por IA
          </p>
        </div>
        <div className="flex gap-3">
          {(consolidatedData || uploadedFiles.length > 0) && (
            <Button
              variant="outline"
              onClick={clearAll}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar Tudo
            </Button>
          )}
          {aiInsights && (
            <Button
              onClick={() => setShowExportDialog(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar Relatório
            </Button>
          )}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4">
        {[
          { step: 1, label: "Upload", icon: Upload, active: activeTab === "upload" },
          { step: 2, label: "Visualizar", icon: LineChart, active: activeTab === "visualize" },
          { step: 3, label: "Insights IA", icon: Brain, active: activeTab === "insights" }
        ].map((item, idx) => (
          <React.Fragment key={item.step}>
            <div 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all ${
                item.active 
                  ? "bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/30" 
                  : "bg-white/5 text-slate-400 hover:bg-white/10"
              }`}
              onClick={() => setActiveTab(item.label.toLowerCase().replace(" ", ""))}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </div>
            {idx < 2 && <div className="w-12 h-0.5 bg-slate-700" />}
          </React.Fragment>
        ))}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="hidden">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="visualize">Visualize</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Upload Zone */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-[#00D4FF]" />
                  Upload de Arquivos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MultiFileUploader 
                  onFilesUploaded={handleFilesUploaded}
                  acceptedTypes={[".csv", ".xlsx", ".xls"]}
                />
              </CardContent>
            </Card>

            {/* Uploaded Files List */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-green-400" />
                    Arquivos Carregados ({uploadedFiles.length})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {uploadedFiles.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Upload className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhum arquivo carregado</p>
                    <p className="text-sm mt-1">Arraste arquivos CSV ou Excel</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    <AnimatePresence>
                      {uploadedFiles.map((file) => (
                        <motion.div
                          key={file.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                        >
                          <div className="flex items-center gap-3">
                            <FileSpreadsheet className="w-5 h-5 text-green-400" />
                            <div>
                              <p className="text-white text-sm font-medium">{file.name}</p>
                              <p className="text-xs text-slate-500">
                                {(file.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFile(file.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}

                {uploadedFiles.length > 0 && (
                  <Button
                    onClick={processFiles}
                    disabled={isProcessing}
                    className="w-full mt-4 bg-[#00D4FF] hover:bg-[#00E5FF] text-[#0A1628]"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Processar e Visualizar
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Visualize Tab */}
        <TabsContent value="visualize">
          {consolidatedData ? (
            <div className="space-y-6">
              <DataVisualizationPanel 
                data={consolidatedData} 
                onRunAIAnalysis={runAIAnalysis}
                isAnalyzing={isAnalyzing}
              />
            </div>
          ) : (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="py-16 text-center">
                <LineChart className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Nenhum dado processado
                </h3>
                <p className="text-slate-400 mb-4">
                  Carregue e processe arquivos para visualizar
                </p>
                <Button onClick={() => setActiveTab("upload")}>
                  <Upload className="w-4 h-4 mr-2" />
                  Ir para Upload
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights">
          {aiInsights ? (
            <AIInsightsPanel insights={aiInsights} />
          ) : (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="py-16 text-center">
                <Brain className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Análise de IA não executada
                </h3>
                <p className="text-slate-400 mb-4">
                  Processe os dados e execute a análise de IA
                </p>
                {consolidatedData ? (
                  <Button 
                    onClick={runAIAnalysis}
                    disabled={isAnalyzing}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analisando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Executar Análise IA
                      </>
                    )}
                  </Button>
                ) : (
                  <Button onClick={() => setActiveTab("upload")}>
                    <Upload className="w-4 h-4 mr-2" />
                    Ir para Upload
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Export Dialog */}
      <ExportReportDialog
        open={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        data={consolidatedData}
        insights={aiInsights}
        files={uploadedFiles}
      />
    </div>
  );
}