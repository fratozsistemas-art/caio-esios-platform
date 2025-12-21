import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Server, Cloud, Cpu, Shield, HardDrive, Sparkles, AlertTriangle, CheckCircle, Loader2, TrendingUp } from "lucide-react";
import { base44 } from "@/api/base44Client";

const DatabaseIcon = HardDrive;

export default function TechStackVisualization({ techStack }) {
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  if (!techStack) return null;

  const analyzeTechStack = async () => {
    setIsAnalyzing(true);
    try {
      const techStackSummary = JSON.stringify(techStack, null, 2);
      
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this technology stack and provide:
1. Modernization recommendations (suggest newer alternatives for outdated tech)
2. Security vulnerabilities or risks (identify potential security issues)
3. Overall health assessment (rate 1-10 with justification)
4. Priority improvements (top 3 actionable items)

Tech Stack:
${techStackSummary}

Respond in JSON format with this structure:
{
  "health_score": number (1-10),
  "health_summary": "brief overall assessment",
  "modernization": [{"technology": "name", "current": "version/status", "recommendation": "suggestion", "priority": "high/medium/low"}],
  "security_risks": [{"issue": "description", "severity": "critical/high/medium/low", "mitigation": "how to fix"}],
  "top_improvements": ["improvement 1", "improvement 2", "improvement 3"]
}`,
        response_json_schema: {
          type: "object",
          properties: {
            health_score: { type: "number" },
            health_summary: { type: "string" },
            modernization: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  technology: { type: "string" },
                  current: { type: "string" },
                  recommendation: { type: "string" },
                  priority: { type: "string" }
                }
              }
            },
            security_risks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  issue: { type: "string" },
                  severity: { type: "string" },
                  mitigation: { type: "string" }
                }
              }
            },
            top_improvements: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setAiAnalysis(analysis);
    } catch (error) {
      console.error('AI Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const layers = [
    {
      title: "Frontend",
      icon: Code,
      color: "blue",
      data: techStack.frontend,
      sections: [
        { key: "web_technologies", label: "Web" },
        { key: "mobile_platforms", label: "Mobile" },
        { key: "ui_frameworks", label: "UI Frameworks" }
      ]
    },
    {
      title: "Backend",
      icon: Server,
      color: "purple",
      data: techStack.backend,
      sections: [
        { key: "programming_languages", label: "Languages" },
        { key: "frameworks", label: "Frameworks" },
        { key: "api_architecture", label: "API" }
      ]
    },
    {
      title: "Infrastructure",
      icon: Cloud,
      color: "cyan",
      data: techStack.infrastructure,
      sections: [
        { key: "cloud_provider", label: "Cloud" },
        { key: "hosting_model", label: "Hosting" },
        { key: "cdn_services", label: "CDN" }
      ]
    },
    {
      title: "Data Layer",
      icon: DatabaseIcon,
      color: "green",
      data: techStack.data_layer,
      sections: [
        { key: "databases", label: "Databases" },
        { key: "data_warehouse", label: "Warehouse" },
        { key: "streaming", label: "Streaming" }
      ]
    },
    {
      title: "AI/ML",
      icon: Cpu,
      color: "pink",
      data: techStack.ai_ml_capabilities,
      sections: [
        { key: "ml_frameworks", label: "ML Frameworks" },
        { key: "ai_services", label: "AI Services" },
        { key: "nlp_tools", label: "NLP Tools" }
      ]
    },
    {
      title: "Security",
      icon: Shield,
      color: "red",
      data: techStack.security_compliance,
      sections: [
        { key: "authentication", label: "Auth" },
        { key: "encryption", label: "Encryption" },
        { key: "compliance_standards", label: "Compliance" }
      ]
    }
  ];

  const colorClasses = {
    blue: "from-blue-500 to-cyan-500",
    purple: "from-purple-500 to-pink-500",
    cyan: "from-cyan-500 to-blue-500",
    green: "from-green-500 to-emerald-500",
    pink: "from-pink-500 to-rose-500",
    red: "from-red-500 to-orange-500"
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Analysis Trigger */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Technology Stack</h3>
        <Button
          onClick={analyzeTechStack}
          disabled={isAnalyzing}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              AI Analysis
            </>
          )}
        </Button>
      </div>

      {/* AI Analysis Results */}
      {aiAnalysis && (
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Health Score */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Tech Stack Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-3">
                <div className="text-4xl font-bold text-white">
                  {aiAnalysis.health_score}/10
                </div>
                <div className={`text-lg font-semibold ${
                  aiAnalysis.health_score >= 7 ? 'text-green-400' :
                  aiAnalysis.health_score >= 5 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {aiAnalysis.health_score >= 7 ? 'Healthy' :
                   aiAnalysis.health_score >= 5 ? 'Fair' : 'Needs Attention'}
                </div>
              </div>
              <p className="text-sm text-slate-300">{aiAnalysis.health_summary}</p>
            </CardContent>
          </Card>

          {/* Security Risks */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-400" />
                Security Risks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {aiAnalysis.security_risks?.length > 0 ? (
                  aiAnalysis.security_risks.slice(0, 3).map((risk, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm text-white font-medium">{risk.issue}</p>
                          <Badge className={getSeverityColor(risk.severity)}>
                            {risk.severity}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400">{risk.mitigation}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">No critical risks detected</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Modernization Recommendations */}
          <Card className="bg-white/5 border-white/10 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Modernization Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {aiAnalysis.modernization?.map((rec, idx) => (
                  <div key={idx} className="p-3 bg-white/5 border border-white/10 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-white">{rec.technology}</p>
                      <Badge className={getPriorityColor(rec.priority)}>
                        {rec.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">Current: {rec.current}</p>
                    <p className="text-xs text-slate-300">{rec.recommendation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Improvements */}
          <Card className="bg-white/5 border-white/10 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Priority Improvements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {aiAnalysis.top_improvements?.map((improvement, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-2 bg-white/5 rounded">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-green-400">{idx + 1}</span>
                    </div>
                    <p className="text-sm text-slate-300 flex-1">{improvement}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Original Tech Stack Visualization */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {layers.map((layer, idx) => {
        const Icon = layer.icon;
        const hasData = layer.data && Object.keys(layer.data).length > 0;
        
        return (
          <div
            key={idx}
            className="p-5 rounded-xl bg-white/5 border border-white/10"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${colorClasses[layer.color]}`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-white">{layer.title}</h3>
            </div>

            {hasData ? (
              <div className="space-y-3">
                {layer.sections.map((section, sIdx) => {
                  const items = layer.data[section.key];
                  if (!items || items.length === 0) return null;
                  
                  return (
                    <div key={sIdx}>
                      <p className="text-xs text-slate-400 mb-2">{section.label}</p>
                      <div className="flex flex-wrap gap-2">
                        {items.map((item, iIdx) => (
                          <Badge
                            key={iIdx}
                            className="bg-white/5 text-slate-300 border border-white/10 text-xs"
                          >
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">Não detectado</p>
            )}
          </div>
        );
      })}
      </div>
    </div>
  );
}