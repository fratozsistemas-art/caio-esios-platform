import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, FileText, Target, Shield, TrendingUp, CheckCircle,
  AlertTriangle, DollarSign, Users, Clock, Building2, Download
} from "lucide-react";
import { motion } from "framer-motion";

export default function PlaybookViewer({ playbook, goalInfo, onBack, onUpdate }) {
  const [activeSection, setActiveSection] = useState("summary");

  const updateStatus = async (newStatus) => {
    const updated = await base44.entities.StrategyPlaybook.update(playbook.id, { status: newStatus });
    onUpdate({ ...playbook, status: newStatus });
  };

  const getStatusBadge = (status) => {
    const styles = {
      draft: "bg-yellow-500/20 text-yellow-400",
      reviewed: "bg-blue-500/20 text-blue-400",
      approved: "bg-green-500/20 text-green-400",
      archived: "bg-slate-500/20 text-slate-400"
    };
    return styles[status] || styles.draft;
  };

  const GoalIcon = goalInfo?.icon || Target;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Button variant="ghost" onClick={onBack} className="text-slate-400 hover:text-white mb-2 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Library
          </Button>
          <div className="flex items-center gap-3">
            <GoalIcon className={`w-8 h-8 text-${goalInfo?.color || 'cyan'}-400`} />
            <div>
              <h1 className="text-2xl font-bold text-white">{playbook.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getStatusBadge(playbook.status)}>{playbook.status}</Badge>
                <Badge className="bg-white/10 text-slate-300">{playbook.industry}</Badge>
                <Badge className="bg-white/10 text-slate-300">{playbook.company_size}</Badge>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {playbook.status === 'draft' && (
            <Button onClick={() => updateStatus('reviewed')} variant="outline" className="border-blue-500/50 text-blue-400">
              Mark as Reviewed
            </Button>
          )}
          {playbook.status === 'reviewed' && (
            <Button onClick={() => updateStatus('approved')} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeSection} onValueChange={setActiveSection}>
        <TabsList className="bg-white/5 border border-white/10 flex-wrap h-auto p-1">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="analysis">Situation</TabsTrigger>
          <TabsTrigger value="pillars">Pillars</TabsTrigger>
          <TabsTrigger value="actions">Action Plan</TabsTrigger>
          <TabsTrigger value="kpis">KPIs</TabsTrigger>
          <TabsTrigger value="risks">Risks</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        {/* Executive Summary */}
        <TabsContent value="summary" className="mt-6">
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                Executive Summary
              </h3>
              <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                {playbook.executive_summary}
              </p>

              {playbook.success_criteria?.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <h4 className="text-sm font-semibold text-white mb-3">Success Criteria</h4>
                  <div className="grid gap-2">
                    {playbook.success_criteria.map((criteria, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        {criteria}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Situation Analysis */}
        <TabsContent value="analysis" className="mt-6">
          <div className="grid gap-4">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <h4 className="text-sm font-semibold text-white mb-3">Current State</h4>
                <p className="text-slate-300 text-sm">{playbook.situation_analysis?.current_state}</p>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-red-500/10 border-red-500/30">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Key Challenges
                  </h4>
                  <ul className="space-y-2">
                    {playbook.situation_analysis?.key_challenges?.map((item, idx) => (
                      <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                        <span className="text-red-400 mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-green-500/10 border-green-500/30">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Opportunities
                  </h4>
                  <ul className="space-y-2">
                    {playbook.situation_analysis?.opportunities?.map((item, idx) => (
                      <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                        <span className="text-green-400 mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-yellow-500/10 border-yellow-500/30">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Constraints
                  </h4>
                  <ul className="space-y-2">
                    {playbook.situation_analysis?.constraints?.map((item, idx) => (
                      <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                        <span className="text-yellow-400 mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Strategic Pillars */}
        <TabsContent value="pillars" className="mt-6">
          <div className="grid gap-4">
            {playbook.strategic_pillars?.map((pillar, idx) => (
              <Card key={idx} className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-lg font-semibold text-white">{pillar.pillar_name}</h4>
                    <Badge className={pillar.priority === 'critical' ? 'bg-red-500/20 text-red-400' : pillar.priority === 'high' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'}>
                      {pillar.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-400 mb-4">{pillar.description}</p>
                  <div className="grid md:grid-cols-2 gap-2">
                    {pillar.initiatives?.map((init, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg text-sm text-slate-300">
                        <Target className="w-4 h-4 text-cyan-400" />
                        {init}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Action Plan */}
        <TabsContent value="actions" className="mt-6">
          <div className="space-y-4">
            {playbook.action_plan?.map((phase, idx) => (
              <Card key={idx} className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">{phase.phase}</h4>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Clock className="w-3 h-3" />
                          {phase.timeline}
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-white/10 text-slate-300">{phase.owner}</Badge>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 uppercase mb-2">Actions</p>
                      <ul className="space-y-1">
                        {phase.actions?.map((action, i) => (
                          <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                            <CheckCircle className="w-3 h-3 text-green-400 mt-1" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase mb-2">Deliverables</p>
                      <ul className="space-y-1">
                        {phase.deliverables?.map((del, i) => (
                          <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                            <FileText className="w-3 h-3 text-purple-400 mt-1" />
                            {del}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {phase.resources_required && (
                    <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-white/10">
                      Resources: {phase.resources_required}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* KPIs */}
        <TabsContent value="kpis" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {playbook.kpis?.map((kpi, idx) => (
              <Card key={idx} className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <h4 className="text-white font-medium mb-3">{kpi.metric}</h4>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Current</span>
                    <span className="text-white font-semibold">{kpi.current_value}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Target</span>
                    <span className="text-green-400 font-semibold">{kpi.target_value}</span>
                  </div>
                  <Badge className="bg-cyan-500/20 text-cyan-400 text-xs w-full justify-center">
                    {kpi.timeframe}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Risks */}
        <TabsContent value="risks" className="mt-6">
          <div className="space-y-3">
            {playbook.risks_mitigation?.map((risk, idx) => (
              <Card key={idx} className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <h4 className="text-white font-medium">{risk.risk}</h4>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={risk.probability === 'high' ? 'bg-red-500/20 text-red-400' : risk.probability === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}>
                        {risk.probability} prob
                      </Badge>
                      <Badge className={risk.impact === 'critical' ? 'bg-red-500/20 text-red-400' : risk.impact === 'high' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'}>
                        {risk.impact} impact
                      </Badge>
                    </div>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-lg mt-2">
                    <p className="text-xs text-green-400 font-medium mb-1">Mitigation Strategy</p>
                    <p className="text-sm text-slate-300">{risk.mitigation}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Resources */}
        <TabsContent value="resources" className="mt-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  Budget Estimate
                </h4>
                <p className="text-2xl font-bold text-green-400">{playbook.resource_requirements?.budget_estimate}</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  Team Size
                </h4>
                <p className="text-2xl font-bold text-blue-400">{playbook.resource_requirements?.team_size}</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <h4 className="text-white font-medium mb-3">Technology Needs</h4>
                <div className="flex flex-wrap gap-2">
                  {playbook.resource_requirements?.technology_needs?.map((tech, idx) => (
                    <Badge key={idx} className="bg-purple-500/20 text-purple-400">{tech}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <h4 className="text-white font-medium mb-3">External Support</h4>
                <div className="flex flex-wrap gap-2">
                  {playbook.resource_requirements?.external_support?.map((support, idx) => (
                    <Badge key={idx} className="bg-orange-500/20 text-orange-400">{support}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}