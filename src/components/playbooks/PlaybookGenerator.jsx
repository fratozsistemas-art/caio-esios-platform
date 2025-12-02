import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, Loader2, Brain, Target, Building2, FileText,
  CheckCircle, AlertCircle, Lightbulb
} from "lucide-react";
import { motion } from "framer-motion";

export default function PlaybookGenerator({ strategicGoals, companySizes, onGenerated }) {
  const [formData, setFormData] = useState({
    strategic_goal: "",
    industry: "",
    company_size: "",
    additional_context: "",
    specific_challenges: ""
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");

  // Load insights from localStorage (from AI Modules)
  const storedInsights = JSON.parse(localStorage.getItem('caio_insights_data') || '{}');
  const recommendations = JSON.parse(localStorage.getItem('caio_recommendations') || '[]');

  const insightsCount = (storedInsights.synergies?.length || 0) + 
                        (storedInsights.conflicts_detected?.length || 0) +
                        recommendations.length;

  const generatePlaybook = async () => {
    if (!formData.strategic_goal || !formData.industry || !formData.company_size) return;

    setIsGenerating(true);
    setProgress(10);
    setProgressMessage("Gathering insights from AI modules...");

    try {
      // Build context from stored insights
      const insightsContext = `
AVAILABLE INSIGHTS FROM AI MODULES:
- Synergies identified: ${storedInsights.synergies?.length || 0}
- Conflicts detected: ${storedInsights.conflicts_detected?.length || 0}
- Recommendations: ${recommendations.length}
- Strategic health score: ${storedInsights.strategic_health_score || 'N/A'}

KEY SYNERGIES:
${storedInsights.synergy_opportunities?.slice(0, 3).map(s => `- ${s.title}: ${s.description}`).join('\n') || 'None available'}

KEY CONFLICTS:
${storedInsights.conflicts_detected?.slice(0, 3).map(c => `- ${c.description}`).join('\n') || 'None detected'}

CUMULATIVE RECOMMENDATIONS:
${storedInsights.cumulative_recommendations?.slice(0, 5).map(r => `- ${r.recommendation}`).join('\n') || recommendations.slice(0, 5).map(r => `- ${r.recommendation}`).join('\n') || 'None available'}

NEXT ACTIONS SUGGESTED:
${storedInsights.next_actions?.slice(0, 3).map(a => `- ${a.action} (${a.urgency})`).join('\n') || 'None available'}
`;

      setProgress(30);
      setProgressMessage("Analyzing strategic context...");

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a senior strategy consultant creating a comprehensive Strategy Playbook.

CONTEXT:
- Strategic Goal: ${formData.strategic_goal.replace(/_/g, ' ').toUpperCase()}
- Industry: ${formData.industry}
- Company Size: ${formData.company_size}
- Additional Context: ${formData.additional_context || 'None provided'}
- Specific Challenges: ${formData.specific_challenges || 'None specified'}

${insightsContext}

Generate a detailed, actionable Strategy Playbook in JSON format. Be specific, practical, and tailored to the industry and company size. Include realistic timelines, specific actions, and measurable KPIs.

The playbook should be executive-ready and could be presented to a board of directors.`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            executive_summary: { type: "string" },
            situation_analysis: {
              type: "object",
              properties: {
                current_state: { type: "string" },
                key_challenges: { type: "array", items: { type: "string" } },
                opportunities: { type: "array", items: { type: "string" } },
                constraints: { type: "array", items: { type: "string" } }
              }
            },
            strategic_pillars: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  pillar_name: { type: "string" },
                  description: { type: "string" },
                  priority: { type: "string" },
                  initiatives: { type: "array", items: { type: "string" } }
                }
              }
            },
            action_plan: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  phase: { type: "string" },
                  timeline: { type: "string" },
                  actions: { type: "array", items: { type: "string" } },
                  deliverables: { type: "array", items: { type: "string" } },
                  owner: { type: "string" },
                  resources_required: { type: "string" }
                }
              }
            },
            kpis: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  metric: { type: "string" },
                  current_value: { type: "string" },
                  target_value: { type: "string" },
                  timeframe: { type: "string" }
                }
              }
            },
            risks_mitigation: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  risk: { type: "string" },
                  probability: { type: "string" },
                  impact: { type: "string" },
                  mitigation: { type: "string" }
                }
              }
            },
            resource_requirements: {
              type: "object",
              properties: {
                budget_estimate: { type: "string" },
                team_size: { type: "string" },
                technology_needs: { type: "array", items: { type: "string" } },
                external_support: { type: "array", items: { type: "string" } }
              }
            },
            success_criteria: { type: "array", items: { type: "string" } }
          }
        }
      });

      setProgress(70);
      setProgressMessage("Structuring playbook document...");

      // Save to database
      const playbook = await base44.entities.StrategyPlaybook.create({
        ...result,
        strategic_goal: formData.strategic_goal,
        industry: formData.industry,
        company_size: formData.company_size,
        status: "draft",
        source_modules: ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "M9", "M10", "M11"],
        source_insights_count: insightsCount,
        generation_parameters: {
          additional_context: formData.additional_context,
          specific_challenges: formData.specific_challenges,
          generated_at: new Date().toISOString()
        }
      });

      setProgress(100);
      setProgressMessage("Playbook generated successfully!");

      setTimeout(() => {
        onGenerated(playbook);
      }, 1000);

    } catch (error) {
      console.error("Playbook generation error:", error);
      setProgressMessage("Error generating playbook. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedGoal = strategicGoals.find(g => g.value === formData.strategic_goal);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Configuration Form */}
      <div className="lg:col-span-2 space-y-4">
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Configure Your Strategy Playbook
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Strategic Goal */}
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Strategic Goal *</label>
              <Select
                value={formData.strategic_goal}
                onValueChange={(v) => setFormData(prev => ({ ...prev, strategic_goal: v }))}
              >
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue placeholder="Select strategic goal" />
                </SelectTrigger>
                <SelectContent>
                  {strategicGoals.map(goal => (
                    <SelectItem key={goal.value} value={goal.value}>
                      <div className="flex items-center gap-2">
                        <goal.icon className="w-4 h-4" />
                        {goal.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Industry */}
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Industry *</label>
              <Input
                value={formData.industry}
                onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                placeholder="e.g., Financial Services, Healthcare, Technology"
                className="bg-white/5 border-white/20 text-white"
              />
            </div>

            {/* Company Size */}
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Company Size *</label>
              <Select
                value={formData.company_size}
                onValueChange={(v) => setFormData(prev => ({ ...prev, company_size: v }))}
              >
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent>
                  {companySizes.map(size => (
                    <SelectItem key={size.value} value={size.value}>{size.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Additional Context */}
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Additional Context</label>
              <Textarea
                value={formData.additional_context}
                onChange={(e) => setFormData(prev => ({ ...prev, additional_context: e.target.value }))}
                placeholder="Provide any additional context about your company, market position, or strategic situation..."
                className="bg-white/5 border-white/20 text-white min-h-[80px]"
              />
            </div>

            {/* Specific Challenges */}
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Specific Challenges</label>
              <Textarea
                value={formData.specific_challenges}
                onChange={(e) => setFormData(prev => ({ ...prev, specific_challenges: e.target.value }))}
                placeholder="What specific challenges are you facing? What do you need the playbook to address?"
                className="bg-white/5 border-white/20 text-white min-h-[80px]"
              />
            </div>

            {/* Generate Button */}
            <Button
              onClick={generatePlaybook}
              disabled={isGenerating || !formData.strategic_goal || !formData.industry || !formData.company_size}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-6"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Playbook...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Strategy Playbook
                </>
              )}
            </Button>

            {/* Progress */}
            {isGenerating && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-slate-400 text-center">{progressMessage}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sidebar - Insights Preview */}
      <div className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Brain className="w-4 h-4 text-cyan-400" />
              Available AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
              <span className="text-sm text-slate-400">Synergies</span>
              <Badge className="bg-green-500/20 text-green-400">
                {storedInsights.synergy_opportunities?.length || 0}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
              <span className="text-sm text-slate-400">Conflicts</span>
              <Badge className="bg-red-500/20 text-red-400">
                {storedInsights.conflicts_detected?.length || 0}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
              <span className="text-sm text-slate-400">Recommendations</span>
              <Badge className="bg-purple-500/20 text-purple-400">
                {recommendations.length}
              </Badge>
            </div>

            {insightsCount === 0 && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-yellow-400 font-medium">No AI insights available</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Run AI modules and Strategy Coach first for better playbooks
                    </p>
                  </div>
                </div>
              </div>
            )}

            {insightsCount > 0 && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-green-400 font-medium">{insightsCount} insights available</p>
                    <p className="text-xs text-slate-400 mt-1">
                      These will be incorporated into your playbook
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Goal Preview */}
        {selectedGoal && (
          <Card className={`bg-${selectedGoal.color}-500/10 border-${selectedGoal.color}-500/30`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <selectedGoal.icon className={`w-8 h-8 text-${selectedGoal.color}-400`} />
                <div>
                  <h4 className="text-white font-medium">{selectedGoal.label}</h4>
                  <p className="text-xs text-slate-400">Selected Goal</p>
                </div>
              </div>
              <p className="text-xs text-slate-300">
                Your playbook will include specific strategies, action plans, KPIs, and risk mitigations 
                tailored for {selectedGoal.label.toLowerCase()}.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}