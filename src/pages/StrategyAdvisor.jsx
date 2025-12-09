import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Brain, Sparkles, AlertTriangle, TrendingUp, CheckCircle, Clock, FileText, Upload, History } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import DocumentAnalysisCard from "../components/strategy/DocumentAnalysisCard";

export default function StrategyAdvisor() {
  const [query, setQuery] = useState("");
  const [context, setContext] = useState("");
  const [category, setCategory] = useState("");
  const [currentResponse, setCurrentResponse] = useState(null);
  const [documentUrl, setDocumentUrl] = useState("");
  const [documentTitle, setDocumentTitle] = useState("");

  const queryClient = useQueryClient();

  const { data: pastQueries } = useQuery({
    queryKey: ['strategy-queries'],
    queryFn: () => base44.entities.StrategyQuery.list('-created_date', 10),
    initialData: []
  });

  const { data: documentAnalyses } = useQuery({
    queryKey: ['document-analyses'],
    queryFn: () => base44.entities.DocumentAnalysis.list('-created_date', 10),
    initialData: []
  });

  const advisorMutation = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('strategyAdvisor', data);
      return response.data;
    },
    onSuccess: (data) => {
      setCurrentResponse(data.response);
      queryClient.invalidateQueries({ queryKey: ['strategy-queries'] });
    }
  });

  const analyzeDocMutation = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('analyzeDocument', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-analyses'] });
      setDocumentUrl("");
      setDocumentTitle("");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    advisorMutation.mutate({ query, context, category });
  };

  const handleDocumentAnalysis = (e) => {
    e.preventDefault();
    analyzeDocMutation.mutate({ document_url: documentUrl, document_title: documentTitle });
  };

  const categories = [
    { value: "competitive_positioning", label: "Competitive Positioning" },
    { value: "integration_strategy", label: "Integration Strategy" },
    { value: "risk_assessment", label: "Risk Assessment" },
    { value: "market_entry", label: "Market Entry" },
    { value: "product_strategy", label: "Product Strategy" },
    { value: "governance", label: "Governance" },
    { value: "technical_architecture", label: "Technical Architecture" },
    { value: "other", label: "Other" }
  ];

  const priorityColors = {
    low: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    high: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    critical: "bg-red-500/20 text-red-300 border-red-500/30"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A2540] via-[#1A1D29] to-[#0F1419] p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00D4FF] to-[#8B5CF6] flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Strategy Advisor</h1>
              <p className="text-[#94A3B8]">AI-powered strategic intelligence & document analysis</p>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Query Input */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-[#1A1D29] border-[#00D4FF]/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#00D4FF]" />
                  Ask Strategic Question
                </CardTitle>
                <CardDescription className="text-[#94A3B8]">
                  Get board-grade intelligence using platform knowledge base
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm text-[#94A3B8] mb-2 block">Strategic Question</label>
                    <Textarea
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="E.g., How do we position against a new LLM entrant? What are the risks of integrating GPT-5 directly?"
                      className="bg-[#0A2540] border-[#00D4FF]/30 text-white placeholder:text-[#475569] min-h-[100px]"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#94A3B8] mb-2 block">Additional Context (Optional)</label>
                    <Textarea
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      placeholder="Provide any additional context or constraints..."
                      className="bg-[#0A2540] border-[#00D4FF]/30 text-white placeholder:text-[#475569]"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#94A3B8] mb-2 block">Category</label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="bg-[#0A2540] border-[#00D4FF]/30 text-white">
                        <SelectValue placeholder="Select category..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="submit"
                    disabled={advisorMutation.isPending}
                    className="w-full bg-[#00D4FF] hover:bg-[#00B8E6] text-[#0A2540] font-semibold"
                  >
                    {advisorMutation.isPending ? "Analyzing..." : "Get Strategic Advice"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Document Analysis */}
            <Card className="bg-[#1A1D29] border-[#FFB800]/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Upload className="w-5 h-5 text-[#FFB800]" />
                  Analyze Document
                </CardTitle>
                <CardDescription className="text-[#94A3B8]">
                  Auto-extract entities, sentiment, anomalies & categorization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDocumentAnalysis} className="space-y-4">
                  <div>
                    <label className="text-sm text-[#94A3B8] mb-2 block">Document Title</label>
                    <Input
                      value={documentTitle}
                      onChange={(e) => setDocumentTitle(e.target.value)}
                      placeholder="E.g., GPT-5 vs CAIO Comparison"
                      className="bg-[#0A2540] border-[#FFB800]/30 text-white placeholder:text-[#475569]"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#94A3B8] mb-2 block">Document URL</label>
                    <Input
                      value={documentUrl}
                      onChange={(e) => setDocumentUrl(e.target.value)}
                      placeholder="https://..."
                      className="bg-[#0A2540] border-[#FFB800]/30 text-white placeholder:text-[#475569]"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={analyzeDocMutation.isPending}
                    className="w-full bg-[#FFB800] hover:bg-[#E5A500] text-[#0A2540] font-semibold"
                  >
                    {analyzeDocMutation.isPending ? "Analyzing..." : "Analyze Document"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Response Display */}
            {currentResponse && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-[#1A1D29] border-[#00D4FF]/30">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">Strategic Recommendation</CardTitle>
                      <Badge className="bg-[#00D4FF]/20 text-[#00D4FF]">
                        Confidence: {currentResponse.confidence_score}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="prose prose-invert max-w-none">
                      <ReactMarkdown className="text-[#E2E8F0] leading-relaxed">
                        {currentResponse.recommendation}
                      </ReactMarkdown>
                    </div>

                    {currentResponse.risk_factors?.length > 0 && (
                      <div>
                        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                          Risk Factors
                        </h3>
                        <div className="space-y-2">
                          {currentResponse.risk_factors.map((risk, idx) => (
                            <div key={idx} className="flex items-start gap-2 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                              <span className="text-red-400 text-sm">{risk}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {currentResponse.opportunities?.length > 0 && (
                      <div>
                        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-400" />
                          Opportunities
                        </h3>
                        <div className="space-y-2">
                          {currentResponse.opportunities.map((opp, idx) => (
                            <div key={idx} className="flex items-start gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                              <span className="text-green-400 text-sm">{opp}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {currentResponse.action_items?.length > 0 && (
                      <div>
                        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-[#00D4FF]" />
                          Action Items
                        </h3>
                        <div className="space-y-2">
                          {currentResponse.action_items.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 bg-[#0A2540] rounded-lg border border-[#00D4FF]/20">
                              <div className="flex-1">
                                <p className="text-white text-sm mb-2">{item.action}</p>
                                <div className="flex items-center gap-2">
                                  <Badge className={priorityColors[item.priority]}>
                                    {item.priority}
                                  </Badge>
                                  <span className="text-[#94A3B8] text-xs flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {item.timeframe}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar: History & Analyses */}
          <div className="space-y-6">
            <Card className="bg-[#1A1D29] border-[#00D4FF]/20">
              <CardHeader>
                <CardTitle className="text-white text-sm">Recent Queries</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
                {pastQueries.slice(0, 5).map((pq) => (
                  <div
                    key={pq.id}
                    className="p-3 bg-[#0A2540] rounded-lg border border-[#00D4FF]/10 hover:border-[#00D4FF]/30 cursor-pointer transition-all"
                    onClick={() => {
                      setQuery(pq.query);
                      setContext(pq.context || "");
                      setCategory(pq.category);
                      if (pq.ai_response) {
                        setCurrentResponse(pq.ai_response);
                      }
                    }}
                  >
                    <p className="text-white text-xs line-clamp-2 mb-2">{pq.query}</p>
                    <Badge className="bg-[#00D4FF]/20 text-[#00D4FF] text-[10px]">
                      {pq.category}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-[#1A1D29] border-[#FFB800]/20">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <History className="w-4 h-4 text-[#FFB800]" />
                  Analyzed Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
                {documentAnalyses.length === 0 ? (
                  <p className="text-[#94A3B8] text-xs text-center py-4">No documents analyzed yet</p>
                ) : (
                  documentAnalyses.slice(0, 3).map((doc) => (
                    <DocumentAnalysisCard key={doc.id} analysis={doc} />
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}