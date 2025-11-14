
import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Code, Search, TrendingUp, Sparkles, AlertTriangle, CheckCircle, Loader2, Trash2, Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TechStackVisualization from "../components/techintel/TechStackVisualization";
import SourcesList from "../components/techintel/SourcesList";
import { LoadingCard } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "sonner";

export default function TechIntelligence() {
  const queryClient = useQueryClient();
  const [showNewAnalysis, setShowNewAnalysis] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [analysisToDelete, setAnalysisToDelete] = useState(null);
  const [analysisData, setAnalysisData] = useState({
    company_name: "",
    analysis_type: "competitor",
    additional_context: ""
  });

  const { data: analyses = [], isLoading } = useQuery({
    queryKey: ['techStackAnalyses'],
    queryFn: () => base44.entities.TechStackAnalysis.list('-created_date'),
    initialData: [],
  });

  const deleteAnalysisMutation = useMutation({
    mutationFn: (analysisId) => base44.entities.TechStackAnalysis.delete(analysisId),
    onSuccess: (_, deletedAnalysisId) => {
      queryClient.invalidateQueries({ queryKey: ['techStackAnalyses'] });
      if (selectedAnalysis?.id === deletedAnalysisId) {
        setSelectedAnalysis(null);
      }
      toast.success('✅ Analysis deleted successfully');
    },
    onError: (error) => {
      toast.error(`❌ Error: ${error.message}`);
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

  const createAnalysisMutation = useMutation({
    mutationFn: async (data) => {
      const analysis = await base44.entities.TechStackAnalysis.create({
        ...data,
        status: "discovering"
      });

      // ✅ FIXED: Complete JSON Schema with proper array items
      const prompt = `You are a CTO/Tech Architect expert in reverse engineering tech stacks.

**TARGET:** ${data.company_name}
**TYPE:** ${data.analysis_type}
**CONTEXT:** ${data.additional_context || 'None'}

---

## 🔍 DISCOVERY METHODS (Execute ALL)

1. **Job Postings Mining** (CRV: 90%)
   - LinkedIn, Stack Overflow, GitHub Jobs
   - Extract: Languages, frameworks, cloud services, databases, tools

2. **GitHub/GitLab Intel** (CRV: 85%)
   - Public repos, dependencies, CI/CD workflows

3. **Tech Blog Content** (CRV: 75%)
   - Engineering blogs, Medium posts, conference talks

4. **API Documentation** (CRV: 80%)
   - REST vs GraphQL, auth patterns, SDKs

5. **Infrastructure Fingerprinting** (CRV: 70%)
   - DNS, CDN, SSL certs, HTTP headers

6. **Vendor Partnerships** (CRV: 95%)
   - AWS/GCP/Azure case studies, SaaS partnerships

---

## 📊 MANDATORY OUTPUT (JSON ONLY)

Return complete tech stack analysis with ALL sections filled.

**RULES:**
1. ALL sections must be filled
2. Confidence scores 70-95 (never 100 except obvious facts)
3. Minimum 3 key findings
4. Minimum 2 competitive advantages
5. Architecture score 60-95
6. Valid JSON only

Execute complete analysis now.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            company_name: { type: "string" },
            tech_stack: { 
              type: "object",
              properties: {
                frontend: { type: "object" },
                backend: { type: "object" },
                infrastructure: { type: "object" },
                data_layer: { type: "object" },
                ai_ml: { type: "object" },
                security: { type: "object" }
              }
            },
            discovery_sources: { 
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  url: { type: "string" },
                  technologies_found: { 
                    type: "array",
                    items: { type: "string" }
                  },
                  confidence: { type: "number" }
                }
              }
            },
            key_findings: { 
              type: "array",
              minItems: 3,
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  finding: { type: "string" },
                  impact: { type: "string" }
                }
              }
            },
            competitive_advantages: { 
              type: "array",
              minItems: 2,
              items: { type: "string" }
            },
            technical_debt_indicators: { 
              type: "array",
              items: { type: "string" }
            },
            architecture_quality_score: { 
              type: "number",
              minimum: 0,
              maximum: 100
            },
            modernization_opportunities: { 
              type: "array",
              items: {
                type: "object",
                properties: {
                  area: { type: "string" },
                  recommendation: { type: "string" },
                  impact: { type: "string" },
                  complexity: { type: "string" }
                }
              }
            }
          },
          required: ["company_name", "tech_stack", "key_findings", "architecture_quality_score"]
        }
      });

      // ✅ VALIDATE COMPLETENESS
      if (!result.key_findings || result.key_findings.length < 3) {
        throw new Error(`Incomplete: only ${result.key_findings?.length || 0} findings (need 3+)`);
      }

      if (!result.tech_stack || Object.keys(result.tech_stack).length < 3) {
        throw new Error('Incomplete: tech_stack missing key sections');
      }

      await base44.entities.TechStackAnalysis.update(analysis.id, {
        discovery_sources: result.discovery_sources || [],
        tech_stack: result.tech_stack,
        key_findings: result.key_findings,
        competitive_advantages: result.competitive_advantages || [],
        technical_debt_indicators: result.technical_debt_indicators || [],
        architecture_quality_score: result.architecture_quality_score,
        modernization_opportunities: result.modernization_opportunities || [],
        status: "completed"
      });

      queryClient.invalidateQueries({ queryKey: ['techStackAnalyses'] });
      toast.success(`✅ ${data.company_name} analysis completed!`);
      return analysis;

    },
    onError: (error) => {
      toast.error(`❌ Analysis failed: ${error.message}`);
    }
  });

  const handleCreateAnalysis = async () => {
    if (!analysisData.company_name) {
      toast.error('Company name is required');
      return;
    }

    await createAnalysisMutation.mutateAsync(analysisData);
    setShowNewAnalysis(false);
    setAnalysisData({ company_name: "", analysis_type: "competitor", additional_context: "" });
  };

  const statusConfig = {
    discovering: { icon: Loader2, color: "text-blue-400", bg: "bg-blue-500/20", spin: true },
    analyzing: { icon: Sparkles, color: "text-purple-400", bg: "bg-purple-500/20", spin: true },
    completed: { icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/20" },
    failed: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/20" }
  };

  if (isLoading) {
    return <LoadingCard message="Loading tech stack analyses..." />;
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Tech Stack Intelligence
          </h1>
          <p className="text-slate-400">
            Reverse engineer competitor tech stacks via open-source intelligence
          </p>
        </div>
        <Button
          onClick={() => setShowNewAnalysis(!showNewAnalysis)}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Analysis
        </Button>
      </div>

      {/* New Analysis Form */}
      <AnimatePresence>
        {showNewAnalysis && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">New Tech Stack Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Company Name</label>
                  <Input
                    value={analysisData.company_name}
                    onChange={(e) => setAnalysisData(prev => ({ ...prev, company_name: e.target.value }))}
                    placeholder="e.g., Nubank, Stripe, Shopify"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Analysis Type</label>
                  <Select
                    value={analysisData.analysis_type}
                    onValueChange={(value) => setAnalysisData(prev => ({ ...prev, analysis_type: value }))}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="competitor">Competitor Analysis</SelectItem>
                      <SelectItem value="acquisition_target">Acquisition Target</SelectItem>
                      <SelectItem value="vendor">Vendor Assessment</SelectItem>
                      <SelectItem value="partner">Partnership Evaluation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Additional Context (Optional)</label>
                  <Textarea
                    value={analysisData.additional_context}
                    onChange={(e) => setAnalysisData(prev => ({ ...prev, additional_context: e.target.value }))}
                    placeholder="Any specific areas to investigate?"
                    className="bg-white/5 border-white/10 text-white h-24"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleCreateAnalysis}
                    disabled={createAnalysisMutation.isPending || !analysisData.company_name}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    {createAnalysisMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Start Analysis
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowNewAnalysis(false)}
                    className="border-white/20 text-white hover:bg-white/5"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analyses List */}
      {analyses.length === 0 ? (
        <EmptyState
          icon={Code}
          title="No tech stack analyses yet"
          description="Analyze competitor tech stacks using open-source intelligence (job postings, blogs, GitHub, etc.)"
          action={() => setShowNewAnalysis(true)}
          actionLabel="Start First Analysis"
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {analyses.map((analysis, index) => {
            const config = statusConfig[analysis.status] || statusConfig.discovering;
            const StatusIcon = config.icon;

            return (
              <motion.div
                key={analysis.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 cursor-pointer group relative"
                  onClick={() => analysis.status === 'completed' && setSelectedAnalysis(analysis)}
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
                        {analysis.company_name}
                      </CardTitle>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${config.bg} ${config.color} flex items-center gap-1`}>
                        <StatusIcon className={`w-3 h-3 ${config.spin ? 'animate-spin' : ''}`} />
                        {analysis.status}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Analysis Type</span>
                      <Badge className="bg-purple-500/20 text-purple-400">
                        {analysis.analysis_type}
                      </Badge>
                    </div>

                    {analysis.status === 'completed' && (
                      <>
                        {analysis.architecture_quality_score && (
                          <div className="pt-3 border-t border-white/10">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-slate-400">Architecture Score</span>
                              <span className="text-2xl font-bold text-green-400">
                                {analysis.architecture_quality_score}/100
                              </span>
                            </div>
                          </div>
                        )}

                        {analysis.key_findings && analysis.key_findings.length > 0 && (
                          <div className="pt-3 border-t border-white/10">
                            <span className="text-sm text-slate-400 block mb-2">Key Findings</span>
                            <div className="flex flex-wrap gap-1">
                              {analysis.key_findings.slice(0, 3).map((finding, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {finding.category || finding.finding?.substring(0, 20)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Analysis?"
        description={`Delete tech stack analysis for "${analysisToDelete?.company_name}"? This cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        variant="danger"
      />

      {/* Analysis Detail Modal */}
      {selectedAnalysis && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedAnalysis(null)}>
          <Card className="max-w-6xl w-full max-h-[90vh] overflow-y-auto bg-slate-900 border-white/10" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="border-b border-white/10">
              <div className="flex justify-between items-start">
                <CardTitle className="text-white text-2xl">
                  {selectedAnalysis.company_name} - Tech Stack
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedAnalysis(null)}
                  className="text-white hover:bg-white/10"
                >
                  <span className="text-2xl">×</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="bg-white/5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="stack">Tech Stack</TabsTrigger>
                  <TabsTrigger value="findings">Findings</TabsTrigger>
                  <TabsTrigger value="sources">Sources</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4 mt-6">
                  {selectedAnalysis.architecture_quality_score && (
                    <Card className="bg-white/5 border-white/10">
                      <CardContent className="p-6">
                        <div className="text-center">
                          <div className="text-5xl font-bold text-green-400 mb-2">
                            {selectedAnalysis.architecture_quality_score}/100
                          </div>
                          <div className="text-slate-400">Architecture Quality Score</div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {selectedAnalysis.competitive_advantages && selectedAnalysis.competitive_advantages.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Competitive Advantages</h3>
                      <ul className="space-y-2">
                        {selectedAnalysis.competitive_advantages.map((adv, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-slate-300">
                            <TrendingUp className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                            <span>{adv}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedAnalysis.technical_debt_indicators && selectedAnalysis.technical_debt_indicators.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Technical Debt Indicators</h3>
                      <ul className="space-y-2">
                        {selectedAnalysis.technical_debt_indicators.map((debt, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-slate-300">
                            <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                            <span>{debt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="stack">
                  <TechStackVisualization techStack={selectedAnalysis.tech_stack} />
                </TabsContent>

                <TabsContent value="findings" className="space-y-4">
                  {selectedAnalysis.key_findings && selectedAnalysis.key_findings.length > 0 && (
                    <div className="space-y-3">
                      {selectedAnalysis.key_findings.map((finding, idx) => (
                        <Card key={idx} className="bg-white/5 border-white/10">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-white">{finding.category}</h4>
                              <Badge className={
                                finding.impact === 'critical' ? 'bg-red-500/20 text-red-400' :
                                finding.impact === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                'bg-blue-500/20 text-blue-400'
                              }>
                                {finding.impact}
                              </Badge>
                            </div>
                            <p className="text-slate-300 text-sm">{finding.finding}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {selectedAnalysis.modernization_opportunities && selectedAnalysis.modernization_opportunities.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3 mt-6">Modernization Opportunities</h3>
                      <div className="space-y-3">
                        {selectedAnalysis.modernization_opportunities.map((opp, idx) => (
                          <Card key={idx} className="bg-white/5 border-white/10">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold text-white">{opp.area}</h4>
                                <Badge className="bg-purple-500/20 text-purple-400">
                                  {opp.complexity} complexity
                                </Badge>
                              </div>
                              <p className="text-slate-300 text-sm mb-2">{opp.recommendation}</p>
                              <p className="text-green-400 text-xs">Impact: {opp.impact}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="sources">
                  <SourcesList sources={selectedAnalysis.discovery_sources || []} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
