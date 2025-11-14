import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X, User } from "lucide-react";

const PERSONA_CONFIGS = {
  board: { id: 'board', title: 'Board of Directors', decisionFramework: 'Fiduciary duty and long-term value creation' },
  ceo: { id: 'ceo', title: 'Chief Executive Officer', decisionFramework: 'Strategic vision execution and organizational excellence' },
  cfo: { id: 'cfo', title: 'Chief Financial Officer', decisionFramework: 'Financial impact and return on invested capital' },
  cto: { id: 'cto', title: 'Chief Technology Officer', decisionFramework: 'Technical feasibility and scalable architecture' },
  cso: { id: 'cso', title: 'Chief Strategy Officer', decisionFramework: 'Strategic advantage and market positioning' },
  caio: { id: 'caio', title: 'Chief AI Officer', decisionFramework: 'AI-driven transformation and intelligent automation' },
  cro: { id: 'cro', title: 'Chief Risk Officer', decisionFramework: 'Risk mitigation and regulatory compliance' },
  esg: { id: 'esg', title: 'ESG Officer', decisionFramework: 'Stakeholder impact and sustainable value creation' }
};

function PersonaAvatar({ persona, size = "sm" }) {
  const sizeClasses = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base"
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold`}>
      {persona[0].toUpperCase()}
    </div>
  );
}

function getPersonaCopy(analysis, persona) {
  const baseInsights = analysis.key_insights || [
    "Data analysis completed with high confidence",
    "Strategic opportunities identified",
    "Risk factors assessed and documented"
  ];

  const baseActions = [
    {
      title: "Review findings with stakeholders",
      description: "Present analysis results to key decision makers",
      priority: "high",
      owner: persona.toUpperCase(),
      timeline: "1-2 weeks"
    },
    {
      title: "Develop implementation roadmap",
      description: "Create detailed execution plan based on insights",
      priority: "medium",
      owner: "Strategy Team",
      timeline: "2-4 weeks"
    },
    {
      title: "Monitor key metrics",
      description: "Track progress and adjust strategy as needed",
      priority: "medium",
      owner: "Analytics Team",
      timeline: "Ongoing"
    }
  ];

  return {
    executiveSummary: `This ${analysis.type} analysis provides comprehensive insights tailored for ${PERSONA_CONFIGS[persona].title} perspective, focusing on ${PERSONA_CONFIGS[persona].decisionFramework.toLowerCase()}.`,
    keyInsights: baseInsights,
    strategicImplications: [
      {
        title: "Market Positioning",
        description: "Analysis reveals key competitive advantages and positioning opportunities",
        impact: "High"
      },
      {
        title: "Resource Allocation",
        description: "Optimal resource distribution identified for maximum impact",
        impact: "Medium"
      },
      {
        title: "Risk Management",
        description: "Critical risk factors identified with mitigation strategies",
        impact: "Medium"
      }
    ],
    recommendedActions: baseActions
  };
}

export default function AnalysisDetailModal({ isOpen, onClose, analysis }) {
  const [selectedPersona, setSelectedPersona] = useState('board');

  if (!analysis) return null;

  const personaConfig = PERSONA_CONFIGS[selectedPersona];
  const personaCopy = getPersonaCopy(analysis, selectedPersona);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-slate-900 border-white/10">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white">{analysis.title}</DialogTitle>
            <div className="flex items-center gap-3">
              <Select value={selectedPersona} onValueChange={setSelectedPersona}>
                <SelectTrigger className="w-64 bg-white/5 border-white/10 text-white">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <PersonaAvatar persona={selectedPersona} size="xs" />
                      <span>{personaConfig.title}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PERSONA_CONFIGS).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <PersonaAvatar persona={key} size="xs" />
                        <span>{config.title}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10">
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          <div className="bg-white/5 p-4 rounded-lg border-l-4 border-blue-500">
            <div className="flex items-center gap-2 mb-2">
              <PersonaAvatar persona={selectedPersona} size="sm" />
              <span className="font-medium text-white">{personaConfig.title} Perspective</span>
            </div>
            <p className="text-sm text-slate-400">
              {personaConfig.decisionFramework}
            </p>
          </div>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Executive Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-slate-300">
                {personaCopy.executiveSummary}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Key Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {personaCopy.keyInsights.map((insight, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                    <p className="text-sm text-slate-300">{insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Strategic Implications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {personaCopy.strategicImplications.map((implication, idx) => (
                  <div key={idx} className="border-l-2 border-blue-500/20 pl-4">
                    <h4 className="font-medium text-sm mb-1 text-white">{implication.title}</h4>
                    <p className="text-sm text-slate-400">{implication.description}</p>
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                        Impact: {implication.impact}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Recommended Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {personaCopy.recommendedActions.map((action, idx) => (
                  <div key={idx} className="bg-white/5 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white">{action.title}</h4>
                      <Badge className={
                        action.priority === 'high' ? 'bg-red-500/20 text-red-400' : 
                        action.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 
                        'bg-green-500/20 text-green-400'
                      }>
                        {action.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{action.description}</p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Owner: {action.owner}</span>
                      <span>Timeline: {action.timeline}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-sm">Analysis Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Type:</span>
                  <span className="ml-2 text-white">{analysis.type}</span>
                </div>
                <div>
                  <span className="text-slate-500">Framework:</span>
                  <span className="ml-2 text-white">{analysis.framework_used || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500">Confidence:</span>
                  <span className="ml-2 text-white">{analysis.confidence_score || 'N/A'}%</span>
                </div>
                <div>
                  <span className="text-slate-500">Status:</span>
                  <Badge className="ml-2 bg-green-500/20 text-green-400">{analysis.status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}