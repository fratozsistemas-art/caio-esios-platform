import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Brain, Link2, Sparkles, Plus, CheckCircle, Loader2, BookOpen,
  Lightbulb, ArrowRight, Search, X, Unlink
} from "lucide-react";
import { toast } from "sonner";

export default function AnalysisKnowledgePanel({ analysis, onClose }) {
  const [activeTab, setActiveTab] = useState("link");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState(analysis.linked_knowledge_items || []);
  const [isLinking, setIsLinking] = useState(false);
  const [suggestedItems, setSuggestedItems] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  
  // New insight form
  const [newInsight, setNewInsight] = useState({
    title: "",
    summary: "",
    type: "insight",
    framework: "M1-Market"
  });

  const queryClient = useQueryClient();

  const { data: knowledgeItems = [], isLoading } = useQuery({
    queryKey: ['knowledge-items-for-linking'],
    queryFn: () => base44.entities.KnowledgeItem.list("-created_date", 100)
  });

  const filteredItems = knowledgeItems.filter(item =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tags?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleItem = (id) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const saveLinks = async () => {
    setIsLinking(true);
    try {
      await base44.entities.Analysis.update(analysis.id, {
        linked_knowledge_items: selectedItems
      });
      queryClient.invalidateQueries(['analyses-dashboard']);
      toast.success("Links atualizados com sucesso!");
      onClose();
    } catch (error) {
      toast.error("Erro ao salvar links: " + error.message);
    } finally {
      setIsLinking(false);
    }
  };

  const getSuggestions = async () => {
    setIsLoadingSuggestions(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on this analysis, suggest relevant knowledge items to link:

ANALYSIS: ${analysis.title}
TYPE: ${analysis.type}
INDUSTRY: ${analysis.results?.industry || 'N/A'}
KEY FINDINGS: ${JSON.stringify(analysis.results?.market_overview || analysis.results)}

AVAILABLE KNOWLEDGE ITEMS:
${knowledgeItems.slice(0, 20).map(k => `- ID: ${k.id}, Title: ${k.title}, Type: ${k.type}, Industry: ${k.industry || 'N/A'}, Tags: ${k.tags?.join(', ') || 'none'}`).join('\n')}

Return a JSON array of IDs that are most relevant to this analysis, with reasoning:
{
  "suggestions": [
    { "id": "item_id", "relevance": "high|medium", "reason": "why this is relevant" }
  ]
}`,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  relevance: { type: "string" },
                  reason: { type: "string" }
                }
              }
            }
          }
        }
      });

      setSuggestedItems(result.suggestions || []);
    } catch (error) {
      console.error("Error getting suggestions:", error);
      toast.error("Erro ao obter sugestões");
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const createInsightMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.KnowledgeItem.create({
        ...data,
        source_analysis_id: analysis.id,
        source_type: "converted_insight",
        industry: analysis.results?.industry,
        tags: [...(analysis.tags || []), "from-analysis"]
      });
    },
    onSuccess: (newItem) => {
      queryClient.invalidateQueries(['knowledge-items-for-linking']);
      setSelectedItems(prev => [...prev, newItem.id]);
      setNewInsight({ title: "", summary: "", type: "insight", framework: "M1-Market" });
      toast.success("Insight convertido em Knowledge Item!");
    }
  });

  // Extract key insights from analysis for quick conversion
  const extractableInsights = [];
  if (analysis.results?.market_overview?.growth_drivers) {
    extractableInsights.push({
      title: `Growth Drivers: ${analysis.results.industry}`,
      summary: analysis.results.market_overview.growth_drivers.join("; ")
    });
  }
  if (analysis.results?.scenarios) {
    analysis.results.scenarios.forEach(s => {
      if (s.strategic_implications?.length > 0) {
        extractableInsights.push({
          title: `${s.type} Scenario Implications`,
          summary: s.strategic_implications.join("; ")
        });
      }
    });
  }
  if (analysis.results?.early_warning_indicators) {
    extractableInsights.push({
      title: `Early Warning Indicators: ${analysis.results.industry}`,
      summary: analysis.results.early_warning_indicators.join("; ")
    });
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-white/10 max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            Integração com Knowledge Management
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 ml-2">
              {analysis.title}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="link" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
              <Link2 className="w-4 h-4 mr-2" />
              Vincular Itens
            </TabsTrigger>
            <TabsTrigger value="suggest" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
              <Sparkles className="w-4 h-4 mr-2" />
              Sugestões AI
            </TabsTrigger>
            <TabsTrigger value="convert" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
              <Lightbulb className="w-4 h-4 mr-2" />
              Converter Insights
            </TabsTrigger>
          </TabsList>

          {/* Link Existing Items */}
          <TabsContent value="link" className="mt-4">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Buscar knowledge items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400 mb-2">Disponíveis ({filteredItems.length})</p>
                  <ScrollArea className="h-64 rounded-lg border border-white/10 p-2">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredItems.map(item => (
                          <div
                            key={item.id}
                            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                              selectedItems.includes(item.id)
                                ? 'bg-blue-500/20 border border-blue-500/30'
                                : 'bg-white/5 hover:bg-white/10'
                            }`}
                            onClick={() => toggleItem(item.id)}
                          >
                            <Checkbox checked={selectedItems.includes(item.id)} />
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm truncate">{item.title}</p>
                              <p className="text-slate-500 text-xs truncate">{item.type} • {item.framework}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>

                <div>
                  <p className="text-sm text-slate-400 mb-2">Selecionados ({selectedItems.length})</p>
                  <ScrollArea className="h-64 rounded-lg border border-white/10 p-2 bg-white/5">
                    {selectedItems.length === 0 ? (
                      <p className="text-slate-500 text-sm text-center py-8">Nenhum item selecionado</p>
                    ) : (
                      <div className="space-y-2">
                        {knowledgeItems.filter(i => selectedItems.includes(i.id)).map(item => (
                          <div key={item.id} className="flex items-center gap-2 p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                            <BookOpen className="w-4 h-4 text-blue-400" />
                            <span className="text-white text-sm flex-1 truncate">{item.title}</span>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 text-slate-400 hover:text-red-400"
                              onClick={() => toggleItem(item.id)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>

              <Button
                onClick={saveLinks}
                disabled={isLinking}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                {isLinking ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</>
                ) : (
                  <><Link2 className="w-4 h-4 mr-2" /> Salvar Vínculos</>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* AI Suggestions */}
          <TabsContent value="suggest" className="mt-4">
            <div className="space-y-4">
              <Card className="bg-purple-500/10 border-purple-500/30">
                <CardContent className="p-4">
                  <p className="text-slate-300 text-sm mb-3">
                    A IA irá analisar o conteúdo desta análise e sugerir Knowledge Items relevantes para vincular.
                  </p>
                  <Button
                    onClick={getSuggestions}
                    disabled={isLoadingSuggestions}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isLoadingSuggestions ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analisando...</>
                    ) : (
                      <><Sparkles className="w-4 h-4 mr-2" /> Obter Sugestões AI</>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {suggestedItems.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-slate-400">Sugestões ({suggestedItems.length})</p>
                  {suggestedItems.map((suggestion, idx) => {
                    const item = knowledgeItems.find(k => k.id === suggestion.id);
                    if (!item) return null;
                    return (
                      <Card key={idx} className="bg-white/5 border-white/10">
                        <CardContent className="p-3">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={selectedItems.includes(item.id)}
                              onCheckedChange={() => toggleItem(item.id)}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-white font-medium text-sm">{item.title}</p>
                                <Badge className={
                                  suggestion.relevance === 'high'
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-yellow-500/20 text-yellow-400'
                                }>
                                  {suggestion.relevance}
                                </Badge>
                              </div>
                              <p className="text-slate-400 text-xs mt-1">{suggestion.reason}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Convert Insights */}
          <TabsContent value="convert" className="mt-4">
            <div className="space-y-4">
              {/* Quick Convert from Analysis */}
              {extractableInsights.length > 0 && (
                <div>
                  <p className="text-sm text-slate-400 mb-2">Insights extraídos automaticamente</p>
                  <div className="space-y-2">
                    {extractableInsights.map((insight, idx) => (
                      <Card key={idx} className="bg-green-500/10 border-green-500/30">
                        <CardContent className="p-3 flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium">{insight.title}</p>
                            <p className="text-slate-400 text-xs truncate">{insight.summary}</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => createInsightMutation.mutate({
                              title: insight.title,
                              summary: insight.summary,
                              type: "insight",
                              framework: "M1-Market"
                            })}
                            disabled={createInsightMutation.isPending}
                            className="bg-green-600 hover:bg-green-700 ml-2"
                          >
                            <Plus className="w-3 h-3 mr-1" /> Converter
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Manual Create */}
              <div className="pt-4 border-t border-white/10">
                <p className="text-sm text-slate-400 mb-3">Criar novo Knowledge Item manualmente</p>
                <div className="space-y-3">
                  <Input
                    placeholder="Título do insight"
                    value={newInsight.title}
                    onChange={(e) => setNewInsight({ ...newInsight, title: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                  />
                  <Textarea
                    placeholder="Resumo / descrição"
                    value={newInsight.summary}
                    onChange={(e) => setNewInsight({ ...newInsight, summary: e.target.value })}
                    className="bg-white/5 border-white/10 text-white h-20"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Select value={newInsight.type} onValueChange={(v) => setNewInsight({ ...newInsight, type: v })}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="insight">Insight</SelectItem>
                        <SelectItem value="strategy">Strategy</SelectItem>
                        <SelectItem value="framework">Framework</SelectItem>
                        <SelectItem value="case_study">Case Study</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={newInsight.framework} onValueChange={(v) => setNewInsight({ ...newInsight, framework: v })}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Framework" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M1-Market">M1 Market</SelectItem>
                        <SelectItem value="M2-Competitive">M2 Competitive</SelectItem>
                        <SelectItem value="M5-Synthesis">M5 Synthesis</SelectItem>
                        <SelectItem value="ABRA">ABRA</SelectItem>
                        <SelectItem value="CSI">CSI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={() => createInsightMutation.mutate(newInsight)}
                    disabled={!newInsight.title || createInsightMutation.isPending}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    {createInsightMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Criando...</>
                    ) : (
                      <><Plus className="w-4 h-4 mr-2" /> Criar Knowledge Item</>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}