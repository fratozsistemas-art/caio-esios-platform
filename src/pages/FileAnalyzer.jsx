import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, TrendingUp, AlertTriangle, CheckCircle, Trash2, Eye, X, Target, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SecureFileUpload from "@/components/ui/SecureFileUpload";
import { LoadingCard } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "sonner";
import SuggestedVisualizationsPanel from "@/components/analysis/SuggestedVisualizationsPanel";
import AITaskSuggestions from "@/components/analysis/AITaskSuggestions";
import ShareAnalysisDialog from "@/components/collaboration/ShareAnalysisDialog";

export default function FileAnalyzer() {
  const queryClient = useQueryClient();
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [analysisToDelete, setAnalysisToDelete] = useState(null);

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list()
  });

  const { data: analyses = [], isLoading } = useQuery({
    queryKey: ['fileAnalyses'],
    queryFn: () => base44.entities.FileAnalysis.list('-created_date'),
    initialData: [],
  });

  const createAnalysisMutation = useMutation({
    mutationFn: async (data) => base44.entities.FileAnalysis.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fileAnalyses'] });
    },
  });

  const deleteAnalysisMutation = useMutation({
    mutationFn: (analysisId) => base44.entities.FileAnalysis.delete(analysisId),
    onSuccess: (_, deletedAnalysisId) => {
      queryClient.invalidateQueries({ queryKey: ['fileAnalyses'] });
      if (selectedAnalysis?.id === deletedAnalysisId) {
        setSelectedAnalysis(null);
        setShowDetailModal(false);
      }
      toast.success('✅ Análise excluída com sucesso!');
    },
    onError: (error) => {
      toast.error(`❌ Erro: ${error.message}`);
    }
  });

  const handleDeleteAnalysis = async (e, analysis) => {
    e.stopPropagation();
    setAnalysisToDelete(analysis);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (analysisToDelete) {
      await deleteAnalysisMutation.mutateAsync(analysisToDelete.id);
      setDeleteDialogOpen(false);
      setAnalysisToDelete(null);
    }
  };

  const handleFileUpload = async (uploadedFiles) => {
    for (const { name, url, type } of uploadedFiles) {
      const fileTypeMap = {
        'application/pdf': 'pdf_contract',
        'text/csv': 'csv_sales',
        'application/vnd.ms-excel': 'excel_financial',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'excel_financial',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'presentation'
      };

      const analysis = await createAnalysisMutation.mutateAsync({
        file_url: url,
        file_name: name,
        file_type: fileTypeMap[type] || 'other',
        status: 'processing'
      });

      processFile(analysis.id, url, name, fileTypeMap[type] || 'other');
    }
  };

  const processFile = async (analysisId, fileUrl, fileName, fileType) => {
    try {
      console.log(`🔄 Processing: ${fileName}`);

      // ✅ GUARANTEED COMPLETE ANALYSIS PROMPT
      const prompt = `You are an elite business analyst. Extract ACTIONABLE insights from this document.

**FILE:** ${fileName}
**TYPE:** ${fileType}

---

## 📊 MANDATORY OUTPUT (JSON ONLY - NO MARKDOWN)

Return VALID JSON with ALL fields populated:

\`\`\`json
{
  "extracted_data": {
    "key_numbers": [
      {"label": "Annual Revenue", "value": "$50M", "context": "FY2023"},
      {"label": "CAC", "value": "$120", "context": "Q4 2023"},
      {"label": "LTV", "value": "$600", "context": "24-month avg"}
    ],
    "important_dates": [
      {"date": "2024-Q1", "event": "Product launch"}
    ],
    "entities_mentioned": ["Company A", "John Doe"],
    "kpis": [
      {"metric": "NPS", "value": "65", "trend": "stable"}
    ]
  },
  
  "key_insights": [
    "INSIGHT 1: Specific finding with numbers",
    "INSIGHT 2: Another data-backed observation",
    "INSIGHT 3: Strategic implication",
    "INSIGHT 4: Risk identified",
    "INSIGHT 5: Opportunity detected",
    "INSIGHT 6: Additional context",
    "INSIGHT 7: Competitive angle"
  ],
  
  "suggested_actions": [
    {
      "title": "Validate Market Assumptions",
      "description": "Use M1 (Market Context) + M2 (Competitive Intel) to verify growth projections",
      "priority": "critical",
      "framework": "ABRA"
    },
    {
      "title": "Optimize Cost Structure",
      "description": "CAC is trending up - investigate marketing efficiency",
      "priority": "high",
      "framework": "EVA"
    },
    {
      "title": "Scenario Planning",
      "description": "Model best/worst case for Q1 launch",
      "priority": "medium",
      "framework": "NIA"
    }
  ],
  
  "visualizations": [
    {
      "id": "viz-1",
      "type": "line",
      "title": "Revenue vs CAC Trend (12 months)",
      "insight": "Shows unit economics trajectory",
      "reason": "Trend data detected - line chart ideal for showing progression"
    },
    {
      "id": "viz-2",
      "type": "scatter",
      "title": "CAC vs LTV Correlation",
      "insight": "Identify customer acquisition efficiency",
      "reason": "Two numeric variables - scatter plot shows correlation"
    }
  ],
  
  "suggested_tasks": [
    {
      "id": "task-1",
      "title": "Revisar estrutura de custos",
      "description": "CAC trending up - investigar eficiência de marketing",
      "priority": "high",
      "expectedImpact": "Potential 15% cost reduction",
      "framework": "EVA"
    }
  ],
  
  "confidence_score": 85,
  "confidence_justification": "Official document with audited numbers"
}
\`\`\`

**CRITICAL RULES:**
1. MINIMUM 5 insights (aim for 7)
2. MINIMUM 3 actions with frameworks
3. ALL numbers must be extracted
4. Confidence score 70-95 (never 100)
5. Valid JSON only - no markdown, no explanations

Execute now.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
        file_urls: [fileUrl],
        response_json_schema: {
          type: "object",
          properties: {
            extracted_data: {
              type: "object",
              properties: {
                key_numbers: { type: "array", items: { type: "object" } },
                important_dates: { type: "array", items: { type: "object" } },
                entities_mentioned: { type: "array", items: { type: "string" } },
                kpis: { type: "array", items: { type: "object" } }
              },
              required: ["key_numbers"]
            },
            key_insights: {
              type: "array",
              items: { type: "string" },
              minItems: 5
            },
            suggested_actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
                  framework: { type: "string" }
                },
                required: ["title", "description", "priority"]
              },
              minItems: 3
            },
            visualizations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  type: { type: "string", enum: ["line", "bar", "scatter", "area", "pie"] },
                  title: { type: "string" },
                  insight: { type: "string" },
                  reason: { type: "string" }
                }
              }
            },
            suggested_tasks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
                  expectedImpact: { type: "string" },
                  framework: { type: "string" }
                }
              }
            },
            confidence_score: { type: "number", minimum: 0, maximum: 100 },
            confidence_justification: { type: "string" }
          },
          required: ["extracted_data", "key_insights", "suggested_actions", "confidence_score"]
        }
      });

      // ✅ VALIDATE COMPLETENESS
      if (!result.key_insights || result.key_insights.length < 5) {
        throw new Error(`Incomplete analysis: only ${result.key_insights?.length || 0} insights (need 5+)`);
      }

      if (!result.suggested_actions || result.suggested_actions.length < 3) {
        throw new Error(`Incomplete analysis: only ${result.suggested_actions?.length || 0} actions (need 3+)`);
      }

      await base44.entities.FileAnalysis.update(analysisId, {
        extracted_data: result.extracted_data,
        key_insights: result.key_insights,
        suggested_actions: result.suggested_actions,
        visualizations: result.visualizations || [],
        suggested_tasks: result.suggested_tasks || [],
        confidence_score: result.confidence_score,
        status: 'completed'
      });

      console.log(`✅ Analysis completed: ${fileName}`);
      queryClient.invalidateQueries({ queryKey: ['fileAnalyses'] });
      toast.success(`✅ ${fileName} analyzed successfully!`);

    } catch (error) {
      console.error(`❌ Error processing ${fileName}:`, error);
      
      await base44.entities.FileAnalysis.update(analysisId, {
        status: 'failed',
        key_insights: [`Analysis failed: ${error.message}`]
      });
      
      queryClient.invalidateQueries({ queryKey: ['fileAnalyses'] });
      toast.error(`❌ Failed to analyze ${fileName}`);
    }
  };

  const statusConfig = {
    processing: { icon: Loader2, color: "text-blue-400", bg: "bg-blue-500/20", text: "Processando", spin: true },
    completed: { icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/20", text: "Concluído" },
    failed: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/20", text: "Falhou" }
  };

  if (isLoading) {
    return <LoadingCard message="Loading analyses..." />;
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            File Analyzer
          </h1>
          <p className="text-slate-400">
            Upload documents for AI-powered insights extraction
          </p>
        </div>
      </div>

      {/* Upload Zone */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Upload Files</CardTitle>
        </CardHeader>
        <CardContent>
          <SecureFileUpload
            accept=".pdf,.csv,.xlsx,.xls,.pptx"
            maxSize={20 * 1024 * 1024}
            multiple={true}
            onUpload={handleFileUpload}
            onError={(error) => toast.error(`Upload error: ${error.message}`)}
          />
        </CardContent>
      </Card>

      {/* Analyses List */}
      {analyses.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No analyses yet"
          description="Upload documents (PDF, Excel, CSV) to extract strategic insights"
          action={() => document.getElementById('secure-file-upload')?.click()}
          actionLabel="Upload First File"
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <AnimatePresence>
            {analyses.map((analysis, index) => {
              const config = statusConfig[analysis.status] || statusConfig.processing;
              const StatusIcon = config.icon;
              
              return (
                <motion.div
                  key={analysis.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card 
                    className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 cursor-pointer relative group"
                    onClick={() => {
                      if (analysis.status === 'completed') {
                        setSelectedAnalysis(analysis);
                        setShowDetailModal(true);
                      }
                    }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDeleteAnalysis(e, analysis)}
                      disabled={deleteAnalysisMutation.isPending}
                      className="absolute top-4 right-4 z-10 h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>

                    <CardHeader className="border-b border-white/10">
                      <div className="flex justify-between items-start pr-10">
                        <CardTitle className="text-white text-lg group-hover:text-blue-300 transition-colors">
                          {analysis.file_name}
                        </CardTitle>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${config.bg} ${config.color} flex items-center gap-1`}>
                          <StatusIcon className={`w-3 h-3 ${config.spin ? 'animate-spin' : ''}`} />
                          {config.text}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Type</span>
                        <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-medium">
                          {analysis.file_type}
                        </span>
                      </div>
                      
                      {analysis.status === 'completed' && (
                        <>
                          {analysis.key_insights && analysis.key_insights.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium text-slate-400">Key Insights</h4>
                              <ul className="space-y-1">
                                {analysis.key_insights.slice(0, 2).map((insight, idx) => (
                                  <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                                    <TrendingUp className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                                    <span className="line-clamp-2">{insight}</span>
                                  </li>
                                ))}
                              </ul>
                              {analysis.key_insights.length > 2 && (
                                <p className="text-xs text-slate-500">
                                  +{analysis.key_insights.length - 2} more insights
                                </p>
                              )}
                            </div>
                          )}

                          {analysis.confidence_score && (
                            <div className="pt-3 border-t border-white/10">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-400">Confidence</span>
                                <span className="text-lg font-semibold text-green-400">
                                  {analysis.confidence_score}%
                                </span>
                              </div>
                            </div>
                          )}

                          <div className="pt-3 flex items-center justify-center text-sm text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Eye className="w-4 h-4 mr-2" />
                            Click for full report
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Analysis?"
        description={`Are you sure you want to delete the analysis of "${analysisToDelete?.file_name}"? This cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        variant="danger"
      />

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl flex items-center gap-3">
              <FileText className="w-6 h-6 text-blue-400" />
              {selectedAnalysis?.file_name}
            </DialogTitle>
          </DialogHeader>

          {selectedAnalysis && (
            <div className="space-y-6 text-white">
              {/* Extracted Data */}
              {selectedAnalysis.extracted_data && (
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-blue-400">📊 Extracted Data</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {selectedAnalysis.extracted_data.key_numbers?.length > 0 && (
                      <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                        <h4 className="font-medium text-slate-300 mb-2">Key Numbers</h4>
                        {selectedAnalysis.extracted_data.key_numbers.map((num, idx) => (
                          <div key={idx} className="text-sm text-slate-400 mb-1">
                            <span className="text-white font-medium">{num.label}:</span> {num.value}
                            {num.context && <span className="text-slate-500"> ({num.context})</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Key Insights */}
              {selectedAnalysis.key_insights && selectedAnalysis.key_insights.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-green-400">💡 Key Insights</h3>
                  <ul className="space-y-2">
                    {selectedAnalysis.key_insights.map((insight, idx) => (
                      <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                        <TrendingUp className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-200">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggested Actions */}
              {selectedAnalysis.suggested_actions && selectedAnalysis.suggested_actions.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-orange-400">🎯 Suggested Actions</h3>
                  <div className="space-y-3">
                    {selectedAnalysis.suggested_actions.map((action, idx) => (
                      <div key={idx} className="p-4 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-white">{action.title}</h4>
                          <div className="flex gap-2">
                            <Badge className={
                              action.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                              action.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                              action.priority === 'medium' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-slate-500/20 text-slate-400'
                            }>
                              {action.priority}
                            </Badge>
                            {action.framework && (
                              <Badge className="bg-purple-500/20 text-purple-400">
                                {action.framework}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-slate-300">{action.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Visualizations */}
              {selectedAnalysis.visualizations && selectedAnalysis.visualizations.length > 0 && (
                <SuggestedVisualizationsPanel 
                  suggestions={selectedAnalysis.visualizations}
                  onApply={(viz) => toast.success(`Visualização "${viz.title}" aplicada!`)}
                />
              )}

              {/* AI Task Suggestions */}
              {(selectedAnalysis.suggested_tasks?.length > 0 || selectedAnalysis.suggested_actions?.length > 0) && (
                <AITaskSuggestions
                  suggestions={selectedAnalysis.suggested_tasks || selectedAnalysis.suggested_actions?.map((a, i) => ({
                    id: `action-${i}`,
                    title: a.title,
                    description: a.description,
                    priority: a.priority,
                    framework: a.framework
                  }))}
                  sourceType="file_analysis"
                  sourceId={selectedAnalysis.id}
                  users={users}
                />
              )}

              {/* Confidence Score */}
              {selectedAnalysis.confidence_score && (
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Analysis Confidence</span>
                    <span className="text-2xl font-bold text-blue-400">
                      {selectedAnalysis.confidence_score}/100
                    </span>
                  </div>
                </div>
              )}

              {/* Share Button */}
              <div className="flex justify-end pt-4 border-t border-white/10">
                <ShareAnalysisDialog
                  analysisType="file_analysis"
                  analysisId={selectedAnalysis.id}
                  analysisTitle={selectedAnalysis.file_name}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}