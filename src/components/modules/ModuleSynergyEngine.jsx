import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, ArrowRight, Zap, Link2, Brain, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MODULE_CONNECTIONS = {
  m1: { feeds: ["m2", "m5", "m6", "m9"], name: "Market Intelligence", color: "blue" },
  m2: { feeds: ["m5", "m6", "m3"], name: "Competitive Intel", color: "purple" },
  m3: { feeds: ["m5", "m7", "m4"], name: "Tech & Innovation", color: "cyan" },
  m4: { feeds: ["m5", "m6", "m9"], name: "Financial Model", color: "green" },
  m5: { feeds: ["m6", "m7", "m8", "m11"], name: "Strategic Synthesis", color: "yellow" },
  m6: { feeds: ["m7", "m9"], name: "Opportunity Matrix", color: "orange" },
  m7: { feeds: ["m11"], name: "Implementation", color: "red" },
  m8: { feeds: ["m5", "m6"], name: "Maieutic Reframing", color: "indigo" },
  m9: { feeds: ["m5", "m7"], name: "Funding Intel", color: "emerald" },
  m10: { feeds: ["m5", "m6", "m7"], name: "Behavioral Intel", color: "pink" },
  m11: { feeds: ["m5", "m7"], name: "Hermes Governance", color: "amber" },
};

export default function ModuleSynergyEngine({ moduleOutputs, onSynergyGenerated }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [synergies, setSynergies] = useState(null);
  const [expandedSynergy, setExpandedSynergy] = useState(null);

  const availableModules = Object.keys(moduleOutputs || {}).filter(k => moduleOutputs[k]);

  const generateSynergies = async () => {
    if (availableModules.length < 2) return;

    setIsAnalyzing(true);
    try {
      const moduleData = availableModules.map(m => ({
        module: m.toUpperCase(),
        name: MODULE_CONNECTIONS[m]?.name,
        output: JSON.stringify(moduleOutputs[m]).slice(0, 2000)
      }));

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a strategic integration AI that identifies synergies between different analytical modules. Analyze the following module outputs and identify cross-module insights:

Available Module Outputs:
${moduleData.map(m => `${m.module} (${m.name}): ${m.output}`).join('\n\n')}

Generate cross-module synergies in the following JSON format:
{
  "synergies": [
    {
      "id": 1,
      "source_modules": ["M1", "M2"],
      "target_module": "M5",
      "synergy_type": "data_enrichment|validation|amplification|risk_mitigation",
      "title": "Brief synergy title",
      "insight": "Detailed insight about how these modules connect",
      "data_flow": {
        "from": {"module": "M1", "data_point": "specific data"},
        "enriches": {"module": "M5", "aspect": "what it enriches"}
      },
      "recommended_action": "specific action to take",
      "impact_score": 0-100,
      "confidence": 0-100
    }
  ],
  "cross_module_recommendations": [
    {
      "recommendation": "strategic recommendation based on combined insights",
      "supporting_modules": ["M1", "M2", "M5"],
      "priority": "high|medium|low",
      "rationale": "why this matters"
    }
  ],
  "data_gaps": [
    {
      "gap": "what data is missing",
      "recommended_module": "which module should fill it",
      "impact_if_filled": "what would improve"
    }
  ],
  "emergent_patterns": [
    {
      "pattern": "pattern identified across modules",
      "evidence": ["evidence1", "evidence2"],
      "strategic_implication": "what this means"
    }
  ],
  "integration_score": 0-100,
  "next_best_module": "which module to run next for maximum insight"
}

Focus on actionable synergies that create compounding strategic value.`,
        response_json_schema: {
          type: "object",
          properties: {
            synergies: { type: "array", items: { type: "object" } },
            cross_module_recommendations: { type: "array", items: { type: "object" } },
            data_gaps: { type: "array", items: { type: "object" } },
            emergent_patterns: { type: "array", items: { type: "object" } },
            integration_score: { type: "number" },
            next_best_module: { type: "string" }
          }
        }
      });

      setSynergies(result);
      onSynergyGenerated?.(result);
    } catch (error) {
      console.error("Error generating synergies:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSynergyTypeColor = (type) => {
    switch (type) {
      case "data_enrichment": return "bg-blue-500/20 text-blue-400";
      case "validation": return "bg-green-500/20 text-green-400";
      case "amplification": return "bg-purple-500/20 text-purple-400";
      case "risk_mitigation": return "bg-orange-500/20 text-orange-400";
      default: return "bg-slate-500/20 text-slate-400";
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Link2 className="w-5 h-5 text-purple-400" />
          Cross-Module Synergy Engine
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 ml-2">
            <Sparkles className="w-3 h-3 mr-1" />
            AI Integration
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Modules */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-xs text-slate-400">Active modules:</span>
          {availableModules.length > 0 ? (
            availableModules.map(m => (
              <Badge key={m} className="bg-white/10 text-white text-xs">
                {m.toUpperCase()}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-slate-500">Run modules to enable synergy analysis</span>
          )}
        </div>

        <Button
          onClick={generateSynergies}
          disabled={availableModules.length < 2 || isAnalyzing}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          {isAnalyzing ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing Cross-Module Synergies...</>
          ) : (
            <><Zap className="w-4 h-4 mr-2" />Generate Synergies ({availableModules.length} modules)</>
          )}
        </Button>

        {synergies && (
          <div className="space-y-4 mt-6">
            {/* Integration Score */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-sm text-slate-400">Integration Score</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" 
                    style={{ width: `${synergies.integration_score}%` }}
                  />
                </div>
                <span className="text-lg font-bold text-white">{synergies.integration_score}%</span>
              </div>
            </div>

            {/* Synergies */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <Link2 className="w-4 h-4 text-purple-400" />
                Identified Synergies
              </h4>
              {synergies.synergies?.map((synergy, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card 
                    className="bg-white/5 border-white/10 cursor-pointer hover:bg-white/10 transition-all"
                    onClick={() => setExpandedSynergy(expandedSynergy === idx ? null : idx)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                          {synergy.source_modules?.map((m, i) => (
                            <React.Fragment key={i}>
                              <Badge className="bg-blue-500/20 text-blue-400 text-xs">{m}</Badge>
                              {i < synergy.source_modules.length - 1 && <span className="text-slate-500">+</span>}
                            </React.Fragment>
                          ))}
                          <ArrowRight className="w-4 h-4 text-purple-400" />
                          <Badge className="bg-green-500/20 text-green-400 text-xs">{synergy.target_module}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getSynergyTypeColor(synergy.synergy_type)}>
                            {synergy.synergy_type?.replace(/_/g, ' ')}
                          </Badge>
                          {expandedSynergy === idx ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                      </div>
                      <p className="text-sm text-white mt-2 font-medium">{synergy.title}</p>
                      
                      <AnimatePresence>
                        {expandedSynergy === idx && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                              <p className="text-xs text-slate-300">{synergy.insight}</p>
                              <div className="p-2 bg-purple-500/10 rounded border border-purple-500/20">
                                <p className="text-xs text-purple-400 font-medium">Recommended Action</p>
                                <p className="text-xs text-white">{synergy.recommended_action}</p>
                              </div>
                              <div className="flex gap-4 text-xs">
                                <span className="text-slate-400">Impact: <span className="text-white">{synergy.impact_score}%</span></span>
                                <span className="text-slate-400">Confidence: <span className="text-white">{synergy.confidence}%</span></span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Emergent Patterns */}
            {synergies.emergent_patterns?.length > 0 && (
              <Card className="bg-indigo-500/10 border-indigo-500/30">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-indigo-400 mb-3 flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Emergent Patterns
                  </h4>
                  <div className="space-y-2">
                    {synergies.emergent_patterns.map((pattern, idx) => (
                      <div key={idx} className="p-2 bg-white/5 rounded">
                        <p className="text-sm text-white font-medium">{pattern.pattern}</p>
                        <p className="text-xs text-indigo-400 mt-1">→ {pattern.strategic_implication}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cross-Module Recommendations */}
            {synergies.cross_module_recommendations?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-white">Strategic Recommendations</h4>
                {synergies.cross_module_recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-white">{rec.recommendation}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={`text-xs ${rec.priority === 'high' ? 'bg-red-500/20 text-red-400' : rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>
                          {rec.priority}
                        </Badge>
                        <span className="text-xs text-slate-400">Based on: {rec.supporting_modules?.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Next Best Module */}
            {synergies.next_best_module && (
              <div className="p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/30">
                <p className="text-xs text-green-400 mb-1">Recommended Next Module</p>
                <p className="text-lg font-bold text-white">{synergies.next_best_module}</p>
                <p className="text-xs text-slate-400 mt-1">Run this module next to maximize insight integration</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}