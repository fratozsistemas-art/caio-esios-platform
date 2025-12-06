import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Send, Loader2, Database, Network, Building2, Lightbulb, Target, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function StrategicIntelligenceSynthesizer() {
  const [query, setQuery] = useState("");
  const [synthesisResult, setSynthesisResult] = useState(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: globalContext } = useQuery({
    queryKey: ['global-context', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const contexts = await base44.entities.GlobalContext.filter({
        user_email: user.email
      });
      return contexts[0] || null;
    },
    enabled: !!user?.email
  });

  const updateContextMutation = useMutation({
    mutationFn: async (contextData) => {
      if (globalContext?.id) {
        return base44.entities.GlobalContext.update(globalContext.id, contextData);
      } else {
        return base44.entities.GlobalContext.create(contextData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['global-context']);
    }
  });

  const handleSynthesize = async () => {
    if (!query.trim()) {
      toast.error('Por favor, insira uma pergunta estratégica');
      return;
    }

    setIsSynthesizing(true);
    try {
      // Fetch data from multiple sources
      const [knowledgeItems, companies, analyses, strategies] = await Promise.all([
        base44.entities.KnowledgeItem.list(),
        base44.entities.Company.list(),
        base44.entities.Analysis.list(),
        base44.entities.Strategy.list()
      ]);

      // Prepare context from global state
      const contextPrompt = globalContext ? `
User Context:
- Active Goals: ${globalContext.active_goals?.join(', ') || 'None'}
- Recent Modules: ${globalContext.recent_modules?.map(m => m.module_name).join(', ') || 'None'}
- Context Summary: ${globalContext.context_summary || 'No previous context'}
- Relevant Companies: ${globalContext.relevant_entities?.companies?.join(', ') || 'None'}
` : '';

      // Build comprehensive data context
      const dataContext = `
Knowledge Base (${knowledgeItems.length} items):
${knowledgeItems.slice(0, 10).map(k => `- ${k.title} (${k.type}, Framework: ${k.framework || 'N/A'})`).join('\n')}

Companies (${companies.length} total):
${companies.slice(0, 15).map(c => `- ${c.legal_name || c.trade_name} (${c.industry || 'N/A'})`).join('\n')}

Recent Analyses (${analyses.length} total):
${analyses.slice(0, 10).map(a => `- ${a.title} (${a.type}, Status: ${a.status})`).join('\n')}

Strategies (${strategies.length} total):
${strategies.slice(0, 10).map(s => `- ${s.title} (${s.category}, Priority: ${s.priority || 'N/A'})`).join('\n')}
`;

      // Call AI for synthesis
      const synthesis = await base44.integrations.Core.InvokeLLM({
        prompt: `You are CAIO·AI Strategic Intelligence Synthesizer.

${contextPrompt}

Available Data:
${dataContext}

User's Strategic Question:
"${query}"

YOUR TASK:
1. Analyze the question in the context of available data
2. Draw connections between Knowledge Graph, Company Intelligence, and Strategic Analyses
3. Identify patterns, opportunities, and strategic insights
4. Provide actionable recommendations
5. Reference specific entities from the data when relevant

Provide a comprehensive strategic synthesis with:
- **Executive Summary** (2-3 sentences)
- **Key Insights** (3-5 bullet points with cross-references)
- **Strategic Connections** (how different data sources relate)
- **Opportunities Identified** 
- **Recommendations** (actionable next steps)
- **Data Sources Used** (which companies/analyses/knowledge items were most relevant)

Be specific, reference actual data, and provide strategic depth.`,
      });

      setSynthesisResult({
        query,
        synthesis,
        timestamp: new Date().toISOString(),
        sources_count: {
          knowledge_items: knowledgeItems.length,
          companies: companies.length,
          analyses: analyses.length,
          strategies: strategies.length
        }
      });

      // Update global context
      await updateContextMutation.mutateAsync({
        user_email: user.email,
        recent_modules: [
          ...(globalContext?.recent_modules || []).slice(0, 4),
          {
            module_name: 'Strategic Intelligence Synthesizer',
            accessed_at: new Date().toISOString(),
            key_data: { query, sources_used: ['knowledge_base', 'company_hub', 'analyses'] }
          }
        ],
        context_summary: `Last query: ${query.substring(0, 100)}...`,
        last_updated: new Date().toISOString()
      });

      toast.success('Síntese estratégica gerada com sucesso');
    } catch (error) {
      console.error('Synthesis error:', error);
      toast.error('Falha ao gerar síntese: ' + error.message);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const suggestedQueries = [
    "Quais são as principais oportunidades de mercado baseadas nas empresas e análises atuais?",
    "Como as estratégias ABRA e NIA se relacionam com as empresas em nosso knowledge graph?",
    "Quais gaps estratégicos existem entre nossas análises e o portfólio de empresas?",
    "Identifique padrões de sucesso nas estratégias implementadas",
    "Qual é o perfil de inovação tecnológica das empresas no nosso hub?"
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl">Strategic Intelligence Synthesizer</h2>
              <p className="text-sm text-slate-400 font-normal">
                AI-powered cross-module insights from Knowledge Graph, Company Hub & Analyses
              </p>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Context Awareness Badge */}
      {globalContext && (
        <Card className="bg-blue-500/5 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Badge className="bg-blue-500/20 text-blue-400">Context Aware</Badge>
              <span className="text-sm text-slate-300">
                Active Goals: {globalContext.active_goals?.length || 0} | 
                Recent Activity: {globalContext.recent_modules?.length || 0} modules
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Query Input */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-lg">Ask a Strategic Question</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex: Quais empresas do setor financeiro apresentam maior potencial de inovação baseado nas análises disponíveis?"
            className="min-h-32 bg-white/5 border-white/10 text-white"
          />
          
          <div className="flex gap-3">
            <Button
              onClick={handleSynthesize}
              disabled={isSynthesizing || !query.trim()}
              className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
            >
              {isSynthesizing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Synthesizing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Generate Strategic Synthesis
                </>
              )}
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-slate-400">Suggested queries:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQueries.map((sq, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => setQuery(sq)}
                  className="text-xs bg-white/5 border-white/10 hover:bg-white/10"
                >
                  {sq.substring(0, 50)}...
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {synthesisResult && (
        <Card className="bg-white/5 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-cyan-400" />
                Strategic Synthesis
              </div>
              <Badge className="bg-cyan-500/20 text-cyan-400">
                {new Date(synthesisResult.timestamp).toLocaleString('pt-BR')}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Query */}
            <div className="bg-white/5 rounded-lg p-4 border-l-4 border-purple-500">
              <p className="text-sm text-slate-400 mb-1">Question:</p>
              <p className="text-white font-medium">{synthesisResult.query}</p>
            </div>

            {/* Sources */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <Database className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-white">{synthesisResult.sources_count.knowledge_items}</p>
                <p className="text-xs text-slate-400">Knowledge Items</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <Building2 className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-white">{synthesisResult.sources_count.companies}</p>
                <p className="text-xs text-slate-400">Companies</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <TrendingUp className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-white">{synthesisResult.sources_count.analyses}</p>
                <p className="text-xs text-slate-400">Analyses</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <Target className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-white">{synthesisResult.sources_count.strategies}</p>
                <p className="text-xs text-slate-400">Strategies</p>
              </div>
            </div>

            {/* Synthesis Content */}
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown className="text-slate-300">
                {synthesisResult.synthesis}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}