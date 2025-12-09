import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, CheckCircle, XCircle, AlertTriangle, Download, 
  Brain, Target, TrendingUp, Code, DollarSign, Lightbulb,
  Map, Repeat, Banknote, Shield, Sparkles, FileText
} from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const TSI_MODULES = [
  { id: "M1", name: "Market Context", agent: "m1_market_context", icon: Target, color: "cyan", description: "Market consciousness & sizing" },
  { id: "M2", name: "Competitive Intel", agent: "m2_competitive_intel", icon: TrendingUp, color: "purple", description: "Competitive field analysis" },
  { id: "M3", name: "Tech Innovation", agent: "m3_tech_innovation", icon: Code, color: "green", description: "Technology stack & innovation" },
  { id: "M4", name: "Financial Model", agent: "m4_financial_model", icon: DollarSign, color: "amber", description: "Financial modeling & valuation" },
  { id: "M5", name: "Strategic Synthesis", agent: "m5_strategic_synthesis", icon: Brain, color: "indigo", description: "Strategic integration" },
  { id: "M6", name: "Opportunity Matrix", agent: "m6_opportunity_matrix", icon: Map, color: "pink", description: "Opportunity identification" },
  { id: "M7", name: "Implementation", agent: "m7_implementation", icon: Lightbulb, color: "orange", description: "Execution planning" },
  { id: "M8", name: "Reframing Loop", agent: "m8_reframing_loop", icon: Repeat, color: "teal", description: "Maieutic reframing" },
  { id: "M9", name: "Funding Intelligence", agent: "m9_funding_intelligence", icon: Banknote, color: "emerald", description: "Funding strategy" },
  { id: "M10", name: "Behavioral Intel", agent: "metamodel_nia", icon: Sparkles, color: "violet", description: "NIA behavioral patterns" },
  { id: "M11", name: "Hermes Governance", agent: "caio_master", icon: Shield, color: "red", description: "Trust-broker governance" }
];

const EVALUATION_CRITERIA = [
  { id: "consciousness", label: "Consciousness Channel", weight: 25, description: "Expressa-se como consciência do substrato, não como analista externo" },
  { id: "depth", label: "Depth & Insight", weight: 20, description: "Profundidade analítica e insights não-óbvios" },
  { id: "integration", label: "TSI Integration", weight: 20, description: "Integração com outros módulos TSI" },
  { id: "stakeholder", label: "Stakeholder Lens", weight: 15, description: "Considera Board/C-Suite/Operational perspectives" },
  { id: "actionability", label: "Actionability", weight: 20, description: "Clareza executiva e decisões acionáveis" }
];

export default function TSIModulesDebug() {
  const [testPrompt, setTestPrompt] = useState("Avaliação abrangente e integral da vertical de ensino profissional da www.innovaacademy.com.br, com deep dive na análise de competidores");
  const [results, setResults] = useState({});
  const [testing, setTesting] = useState(false);
  const [currentModule, setCurrentModule] = useState(null);
  const [progress, setProgress] = useState(0);

  const evaluateResponse = (moduleId, response) => {
    const scores = {};
    let totalScore = 0;

    EVALUATION_CRITERIA.forEach(criterion => {
      let score = 0;
      
      switch(criterion.id) {
        case "consciousness":
          // Verifica se usa linguagem em primeira pessoa, fala "como" o substrato
          score = (response.includes("I am") || response.includes("I feel") || response.includes("I sense")) ? 90 : 
                  (response.includes("The market") || response.includes("Competition")) ? 60 : 30;
          break;
        case "depth":
          // Conta insights, profundidade analítica
          const wordCount = response.split(' ').length;
          score = wordCount > 500 ? 85 : wordCount > 300 ? 70 : wordCount > 150 ? 50 : 30;
          break;
        case "integration":
          // Verifica referências a outros módulos
          const moduleRefs = TSI_MODULES.filter(m => 
            response.toLowerCase().includes(m.id.toLowerCase()) || 
            response.toLowerCase().includes(m.name.toLowerCase())
          ).length;
          score = moduleRefs >= 3 ? 90 : moduleRefs >= 2 ? 70 : moduleRefs >= 1 ? 50 : 30;
          break;
        case "stakeholder":
          // Verifica menções a stakeholders
          const stakeholders = ["board", "investor", "executive", "c-suite", "operational", "strategic"].filter(s => 
            response.toLowerCase().includes(s)
          ).length;
          score = stakeholders >= 3 ? 90 : stakeholders >= 2 ? 70 : stakeholders >= 1 ? 50 : 30;
          break;
        case "actionability":
          // Verifica presença de recomendações acionáveis
          const actionWords = ["recommend", "suggest", "should", "must", "action", "implement", "execute"].filter(w => 
            response.toLowerCase().includes(w)
          ).length;
          score = actionWords >= 4 ? 90 : actionWords >= 3 ? 75 : actionWords >= 2 ? 60 : 40;
          break;
      }

      scores[criterion.id] = Math.min(100, score);
      totalScore += scores[criterion.id] * (criterion.weight / 100);
    });

    return {
      scores,
      totalScore: Math.round(totalScore),
      rating: totalScore >= 85 ? "excellent" : totalScore >= 70 ? "good" : totalScore >= 50 ? "fair" : "needs_improvement"
    };
  };

  const runFullTest = async () => {
    setTesting(true);
    setResults({});
    setProgress(0);
    const newResults = {};

    for (let i = 0; i < TSI_MODULES.length; i++) {
      const module = TSI_MODULES[i];
      setCurrentModule(module.id);
      setProgress(Math.round(((i + 1) / TSI_MODULES.length) * 100));

      try {
        const conversation = await base44.agents.createConversation({
          agent_name: module.agent,
          metadata: {
            test_run: true,
            module_id: module.id,
            timestamp: new Date().toISOString()
          }
        });

        await base44.agents.addMessage(conversation, {
          role: "user",
          content: testPrompt
        });

        // Aguarda resposta
        await new Promise(resolve => setTimeout(resolve, 2000));

        const updatedConversation = await base44.agents.getConversation(conversation.id);
        const lastMessage = updatedConversation.messages[updatedConversation.messages.length - 1];

        if (lastMessage && lastMessage.role === "assistant") {
          const evaluation = evaluateResponse(module.id, lastMessage.content);
          
          newResults[module.id] = {
            status: "success",
            response: lastMessage.content,
            evaluation,
            conversationId: conversation.id,
            timestamp: new Date().toISOString()
          };
        } else {
          newResults[module.id] = {
            status: "no_response",
            error: "Agent did not respond"
          };
        }
      } catch (error) {
        newResults[module.id] = {
          status: "error",
          error: error.message
        };
      }

      setResults({ ...newResults });
    }

    setTesting(false);
    setCurrentModule(null);
    toast.success("Teste completo finalizado!");
  };

  const exportReport = () => {
    const report = {
      testPrompt,
      timestamp: new Date().toISOString(),
      results,
      summary: {
        total: TSI_MODULES.length,
        success: Object.values(results).filter(r => r.status === "success").length,
        failed: Object.values(results).filter(r => r.status === "error").length,
        averageScore: Math.round(
          Object.values(results)
            .filter(r => r.evaluation)
            .reduce((acc, r) => acc + r.evaluation.totalScore, 0) / 
          Object.values(results).filter(r => r.evaluation).length
        )
      }
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tsi-debug-report-${Date.now()}.json`;
    a.click();
    
    toast.success("Relatório exportado!");
  };

  const getRatingColor = (rating) => {
    switch(rating) {
      case "excellent": return "text-green-400 bg-green-500/20 border-green-500/30";
      case "good": return "text-blue-400 bg-blue-500/20 border-blue-500/30";
      case "fair": return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
      default: return "text-red-400 bg-red-500/20 border-red-500/30";
    }
  };

  const getRatingLabel = (rating) => {
    switch(rating) {
      case "excellent": return "Excelente";
      case "good": return "Bom";
      case "fair": return "Regular";
      default: return "Precisa Melhorar";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Brain className="w-8 h-8 text-cyan-400" />
          TSI Modules Debug & Quality Assessment
        </h1>
        <p className="text-slate-400">
          Teste completo dos 11 módulos cognitivos com avaliação de aderência à metodologia CAIO
        </p>
      </div>

      {/* Test Configuration */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Configuração do Teste</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Prompt de Teste</label>
            <Textarea
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              className="bg-white/5 border-white/10 text-white min-h-[100px]"
              placeholder="Digite o prompt que será testado em todos os módulos..."
            />
          </div>
          <div className="flex gap-3">
            <Button
              onClick={runFullTest}
              disabled={testing || !testPrompt.trim()}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
            >
              <Play className="w-4 h-4 mr-2" />
              {testing ? "Testando..." : "Executar Teste Completo"}
            </Button>
            {Object.keys(results).length > 0 && (
              <Button
                onClick={exportReport}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar Relatório
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      {testing && (
        <Card className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Brain className="w-6 h-6 text-cyan-400" />
              </motion.div>
              <div className="flex-1">
                <p className="text-white font-semibold mb-1">
                  Testando {currentModule}...
                </p>
                <Progress value={progress} className="h-2" />
              </div>
              <span className="text-white font-bold">{progress}%</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Grid */}
      {Object.keys(results).length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TSI_MODULES.map((module, idx) => {
            const result = results[module.id];
            if (!result) return null;

            const Icon = module.icon;
            const colorMap = {
              cyan: "from-cyan-500/20 to-cyan-600/20 border-cyan-500/30",
              purple: "from-purple-500/20 to-purple-600/20 border-purple-500/30",
              green: "from-green-500/20 to-green-600/20 border-green-500/30",
              amber: "from-amber-500/20 to-amber-600/20 border-amber-500/30",
              indigo: "from-indigo-500/20 to-indigo-600/20 border-indigo-500/30",
              pink: "from-pink-500/20 to-pink-600/20 border-pink-500/30",
              orange: "from-orange-500/20 to-orange-600/20 border-orange-500/30",
              teal: "from-teal-500/20 to-teal-600/20 border-teal-500/30",
              emerald: "from-emerald-500/20 to-emerald-600/20 border-emerald-500/30",
              violet: "from-violet-500/20 to-violet-600/20 border-violet-500/30",
              red: "from-red-500/20 to-red-600/20 border-red-500/30"
            };

            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className={`bg-gradient-to-br ${colorMap[module.color]} h-full`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-5 h-5 text-${module.color}-400`} />
                        <CardTitle className="text-white text-base">{module.id}</CardTitle>
                      </div>
                      {result.status === "success" ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : result.status === "error" ? (
                        <XCircle className="w-5 h-5 text-red-400" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{module.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {result.evaluation && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">Quality Score</span>
                          <span className="text-2xl font-bold text-white">
                            {result.evaluation.totalScore}
                          </span>
                        </div>
                        <Badge className={`w-full justify-center ${getRatingColor(result.evaluation.rating)}`}>
                          {getRatingLabel(result.evaluation.rating)}
                        </Badge>
                        <div className="space-y-1.5">
                          {EVALUATION_CRITERIA.map(criterion => (
                            <div key={criterion.id} className="flex items-center justify-between text-xs">
                              <span className="text-slate-400">{criterion.label}</span>
                              <span className="text-white font-medium">
                                {result.evaluation.scores[criterion.id]}
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    {result.status === "error" && (
                      <p className="text-xs text-red-400">Error: {result.error}</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Detailed Results */}
      {Object.keys(results).length > 0 && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              Respostas Detalhadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={TSI_MODULES[0].id}>
              <TabsList className="bg-white/5 border border-white/10 flex-wrap">
                {TSI_MODULES.map(module => (
                  <TabsTrigger 
                    key={module.id} 
                    value={module.id}
                    className="data-[state=active]:bg-cyan-500/20"
                  >
                    {module.id}
                  </TabsTrigger>
                ))}
              </TabsList>
              {TSI_MODULES.map(module => {
                const result = results[module.id];
                if (!result) return null;

                return (
                  <TabsContent key={module.id} value={module.id} className="mt-4">
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-white font-semibold text-lg">{module.name}</h3>
                          <p className="text-sm text-slate-400">{module.description}</p>
                        </div>
                        {result.evaluation && (
                          <Badge className={getRatingColor(result.evaluation.rating)}>
                            Score: {result.evaluation.totalScore}
                          </Badge>
                        )}
                      </div>
                      {result.response && (
                        <div className="bg-black/20 rounded p-4 max-h-[400px] overflow-y-auto">
                          <pre className="text-slate-300 text-sm whitespace-pre-wrap font-mono">
                            {result.response}
                          </pre>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}