import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Layers, Loader2, Sparkles, Lightbulb, HelpCircle, ArrowRight, RefreshCw } from "lucide-react";

export default function M8MaieuticReframing({ onReframingComplete }) {
  const [situation, setSituation] = useState("");
  const [currentAssumptions, setCurrentAssumptions] = useState("");
  const [isReframing, setIsReframing] = useState(false);
  const [reframing, setReframing] = useState(null);

  const generateReframing = async () => {
    if (!situation) return;
    
    setIsReframing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a Socratic strategic advisor using maieutic questioning to help executives discover hidden assumptions and alternative perspectives. Analyze:

Current Situation:
${situation}

Current Assumptions (if any):
${currentAssumptions || "Not explicitly stated"}

Apply the Maieutic Method to generate:

{
  "situation_analysis": {
    "stated_problem": "what they think the problem is",
    "underlying_problem": "what the real problem might be",
    "hidden_assumptions": ["assumption1", "assumption2", "assumption3"],
    "cognitive_biases_detected": ["bias1", "bias2"]
  },
  "socratic_questions": [
    {
      "question": "provocative question",
      "purpose": "what this question reveals",
      "potential_insight": "what they might discover"
    }
  ],
  "alternative_framings": [
    {
      "framing": "alternative way to see the situation",
      "implications": ["implication1", "implication2"],
      "new_opportunities": ["opportunity1"],
      "paradigm_shift_required": "low|medium|high"
    }
  ],
  "contrarian_scenarios": [
    {
      "scenario": "what if the opposite were true",
      "key_assumption_challenged": "which assumption this challenges",
      "strategic_implication": "what this means strategically",
      "probability": "low|medium|plausible"
    }
  ],
  "competitive_asymmetries": [
    {
      "asymmetry": "unconventional advantage or approach",
      "why_competitors_miss_it": "reason",
      "exploitation_strategy": "how to leverage"
    }
  ],
  "reframed_strategy": {
    "original_direction": "what they were planning",
    "reframed_direction": "what they should consider",
    "key_pivot": "the main insight that changes everything",
    "confidence_level": 0-100
  },
  "thought_exercises": [
    {
      "exercise": "name of exercise",
      "instruction": "what to do",
      "expected_outcome": "what they'll learn"
    }
  ]
}

Be provocative but constructive. Challenge conventional wisdom.`,
        response_json_schema: {
          type: "object",
          properties: {
            situation_analysis: { type: "object" },
            socratic_questions: { type: "array", items: { type: "object" } },
            alternative_framings: { type: "array", items: { type: "object" } },
            contrarian_scenarios: { type: "array", items: { type: "object" } },
            competitive_asymmetries: { type: "array", items: { type: "object" } },
            reframed_strategy: { type: "object" },
            thought_exercises: { type: "array", items: { type: "object" } }
          }
        },
        add_context_from_internet: false
      });

      setReframing(result);
      onReframingComplete?.(result);
    } catch (error) {
      console.error("Error generating reframing:", error);
    } finally {
      setIsReframing(false);
    }
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Layers className="w-5 h-5 text-indigo-400" />
          M8 Maieutic Reframing Engine
          <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 ml-2">
            <Sparkles className="w-3 h-3 mr-1" />
            Socratic Method
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm text-slate-400 mb-1 block">Strategic Situation *</label>
          <Textarea
            placeholder="Describe your current strategic situation, challenge, or decision you're facing..."
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            className="bg-white/5 border-white/10 text-white h-32"
          />
        </div>

        <div>
          <label className="text-sm text-slate-400 mb-1 block">Current Assumptions (optional)</label>
          <Textarea
            placeholder="What do you currently believe to be true about this situation?"
            value={currentAssumptions}
            onChange={(e) => setCurrentAssumptions(e.target.value)}
            className="bg-white/5 border-white/10 text-white h-20"
          />
        </div>

        <Button
          onClick={generateReframing}
          disabled={!situation || isReframing}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        >
          {isReframing ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Applying Maieutic Method...</>
          ) : (
            <><RefreshCw className="w-4 h-4 mr-2" />Challenge My Assumptions</>
          )}
        </Button>

        {reframing && (
          <div className="space-y-4 mt-6">
            {/* Hidden Assumptions */}
            {reframing.situation_analysis && (
              <Card className="bg-red-500/10 border-red-500/30">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-red-400 mb-3">Hidden Assumptions Detected</h4>
                  <div className="space-y-2 mb-3">
                    {reframing.situation_analysis.hidden_assumptions?.map((assumption, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-slate-200">
                        <span className="text-red-400">⚠</span>
                        {assumption}
                      </div>
                    ))}
                  </div>
                  <div className="p-2 bg-white/5 rounded">
                    <p className="text-xs text-slate-400 mb-1">Underlying Problem</p>
                    <p className="text-sm text-white">{reframing.situation_analysis.underlying_problem}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Socratic Questions */}
            <Card className="bg-indigo-500/10 border-indigo-500/30">
              <CardContent className="p-4">
                <h4 className="text-sm font-semibold text-indigo-400 mb-3 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Socratic Questions
                </h4>
                <div className="space-y-3">
                  {reframing.socratic_questions?.map((q, idx) => (
                    <div key={idx} className="p-3 bg-white/5 rounded border border-white/10">
                      <p className="text-white font-medium mb-2 flex items-start gap-2">
                        <span className="text-indigo-400">?</span>
                        {q.question}
                      </p>
                      <p className="text-xs text-slate-400 mb-1">Purpose: {q.purpose}</p>
                      <p className="text-xs text-green-400">💡 {q.potential_insight}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Alternative Framings */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-white">Alternative Framings</h4>
              {reframing.alternative_framings?.map((framing, idx) => (
                <Card key={idx} className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-white font-medium">{framing.framing}</p>
                      <Badge className={`${framing.paradigm_shift_required === 'high' ? 'bg-red-500/20 text-red-400' : framing.paradigm_shift_required === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                        {framing.paradigm_shift_required} shift
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {framing.new_opportunities?.map((opp, i) => (
                        <Badge key={i} className="bg-green-500/20 text-green-400 text-xs">
                          <Lightbulb className="w-3 h-3 mr-1" />
                          {opp}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Contrarian Scenarios */}
            <Card className="bg-yellow-500/10 border-yellow-500/30">
              <CardContent className="p-4">
                <h4 className="text-sm font-semibold text-yellow-400 mb-3">Contrarian Scenarios</h4>
                <div className="space-y-3">
                  {reframing.contrarian_scenarios?.map((scenario, idx) => (
                    <div key={idx} className="p-2 bg-white/5 rounded">
                      <p className="text-sm text-white mb-1">"What if {scenario.scenario}?"</p>
                      <p className="text-xs text-slate-400">Challenges: {scenario.key_assumption_challenged}</p>
                      <p className="text-xs text-yellow-400">→ {scenario.strategic_implication}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reframed Strategy */}
            {reframing.reframed_strategy && (
              <Card className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-indigo-500/30">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-white mb-3">Strategic Reframing</h4>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex-1 p-2 bg-white/5 rounded text-center">
                      <p className="text-xs text-slate-400 mb-1">Original Direction</p>
                      <p className="text-sm text-slate-300">{reframing.reframed_strategy.original_direction}</p>
                    </div>
                    <ArrowRight className="w-6 h-6 text-indigo-400" />
                    <div className="flex-1 p-2 bg-indigo-500/20 rounded text-center border border-indigo-500/30">
                      <p className="text-xs text-indigo-400 mb-1">Reframed Direction</p>
                      <p className="text-sm text-white">{reframing.reframed_strategy.reframed_direction}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-white/5 rounded">
                    <p className="text-xs text-slate-400 mb-1">Key Pivot Insight</p>
                    <p className="text-white font-medium">{reframing.reframed_strategy.key_pivot}</p>
                    <Badge className="mt-2 bg-indigo-500/20 text-indigo-300">
                      {reframing.reframed_strategy.confidence_level}% confidence
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}