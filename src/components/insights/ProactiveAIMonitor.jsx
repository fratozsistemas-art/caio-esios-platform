import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bot, AlertTriangle, Lightbulb, TrendingUp, Bell, RefreshCw,
  BookOpen, Zap, Eye, CheckCircle, Clock, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";

const MONITORING_RULES = [
  {
    id: "critical_conflict",
    name: "Critical Conflict Detection",
    trigger: (insights) => insights.conflicts_detected?.some(c => c.severity === "critical"),
    priority: "critical",
    action: "flag_conflict"
  },
  {
    id: "synergy_opportunity",
    name: "High-Impact Synergy",
    trigger: (insights) => insights.synergy_opportunities?.some(s => s.impact_score > 75),
    priority: "high",
    action: "suggest_action"
  },
  {
    id: "low_health",
    name: "Strategic Health Alert",
    trigger: (insights) => insights.strategic_health_score < 60,
    priority: "high",
    action: "health_alert"
  },
  {
    id: "untracked_recommendations",
    name: "Untracked Recommendations",
    trigger: (insights, recs) => {
      const cumulative = insights.cumulative_recommendations?.length || 0;
      const tracked = recs?.length || 0;
      return cumulative > 0 && tracked < cumulative * 0.5;
    },
    priority: "medium",
    action: "track_reminder"
  },
  {
    id: "playbook_suggestion",
    name: "Playbook Opportunity",
    trigger: (insights) => {
      const synergies = insights.synergy_opportunities?.length || 0;
      const conflicts = insights.conflicts_detected?.length || 0;
      return synergies >= 3 || conflicts >= 2;
    },
    priority: "medium",
    action: "suggest_playbook"
  }
];

export default function ProactiveAIMonitor({ onAlertClick }) {
  const [alerts, setAlerts] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState(null);
  const [dismissedAlerts, setDismissedAlerts] = useState(() => {
    const saved = localStorage.getItem('caio_dismissed_alerts');
    return saved ? JSON.parse(saved) : [];
  });

  const runProactiveAnalysis = async () => {
    setIsAnalyzing(true);
    
    const storedInsights = JSON.parse(localStorage.getItem('caio_insights_data') || '{}');
    const recommendations = JSON.parse(localStorage.getItem('caio_recommendations') || '[]');
    
    const newAlerts = [];
    
    // Check each monitoring rule
    for (const rule of MONITORING_RULES) {
      if (rule.trigger(storedInsights, recommendations) && !dismissedAlerts.includes(rule.id)) {
        let alertData = {
          id: rule.id,
          name: rule.name,
          priority: rule.priority,
          action: rule.action,
          timestamp: new Date().toISOString()
        };

        // Generate AI-enhanced alert message
        if (Object.keys(storedInsights).length > 0) {
          try {
            const aiResponse = await base44.integrations.Core.InvokeLLM({
              prompt: `You are a proactive strategic AI assistant. Based on the following rule trigger and data, generate a brief, actionable alert message (max 2 sentences).

Rule: ${rule.name}
Priority: ${rule.priority}
Action Type: ${rule.action}

Context Data:
- Synergies: ${storedInsights.synergy_opportunities?.length || 0}
- Conflicts: ${storedInsights.conflicts_detected?.length || 0}
- Health Score: ${storedInsights.strategic_health_score || 'N/A'}
- Recommendations: ${storedInsights.cumulative_recommendations?.length || 0}

Generate a specific, actionable message explaining what was detected and what the user should do.`,
              response_json_schema: {
                type: "object",
                properties: {
                  message: { type: "string" },
                  suggested_action: { type: "string" },
                  related_modules: { type: "array", items: { type: "string" } }
                }
              }
            });
            alertData = { ...alertData, ...aiResponse };
          } catch (e) {
            alertData.message = getDefaultMessage(rule);
          }
        } else {
          alertData.message = getDefaultMessage(rule);
        }

        newAlerts.push(alertData);
      }
    }

    // Check for playbook suggestions based on patterns
    if (storedInsights.synergy_opportunities?.length >= 2) {
      const patterns = detectPatterns(storedInsights);
      if (patterns.suggestedPlaybook && !dismissedAlerts.includes('pattern_playbook')) {
        newAlerts.push({
          id: 'pattern_playbook',
          name: 'Playbook Recommendation',
          priority: 'medium',
          action: 'suggest_playbook',
          message: `Based on detected patterns, a "${patterns.suggestedPlaybook}" playbook could help consolidate your strategic insights.`,
          suggested_action: 'Generate a new playbook',
          playbook_type: patterns.suggestedPlaybook,
          timestamp: new Date().toISOString()
        });
      }
    }

    setAlerts(newAlerts);
    setLastAnalysis(new Date().toISOString());
    setIsAnalyzing(false);
  };

  const getDefaultMessage = (rule) => {
    const messages = {
      critical_conflict: "Critical strategic conflict detected requiring immediate attention.",
      synergy_opportunity: "High-impact synergy opportunity identified across modules.",
      low_health: "Strategic health score is below optimal threshold.",
      untracked_recommendations: "Several AI recommendations are not being tracked.",
      playbook_suggestion: "Enough insights gathered to generate a strategic playbook."
    };
    return messages[rule.id] || "New strategic alert detected.";
  };

  const detectPatterns = (insights) => {
    const synergies = insights.synergy_opportunities || [];
    const conflicts = insights.conflicts_detected || [];
    
    // Detect dominant themes
    const allModules = synergies.flatMap(s => s.modules_to_combine || []);
    const moduleCounts = allModules.reduce((acc, m) => {
      acc[m] = (acc[m] || 0) + 1;
      return acc;
    }, {});
    
    const dominantModule = Object.entries(moduleCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    
    // Suggest playbook based on patterns
    let suggestedPlaybook = null;
    if (dominantModule) {
      const playbookMap = {
        M1: 'market_entry',
        M4: 'cost_reduction',
        M3: 'digital_transformation',
        M6: 'competitive_repositioning',
        M9: 'growth_acceleration'
      };
      suggestedPlaybook = playbookMap[dominantModule];
    }

    return { dominantModule, suggestedPlaybook };
  };

  const dismissAlert = (alertId) => {
    const newDismissed = [...dismissedAlerts, alertId];
    setDismissedAlerts(newDismissed);
    localStorage.setItem('caio_dismissed_alerts', JSON.stringify(newDismissed));
    setAlerts(alerts.filter(a => a.id !== alertId));
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'critical': return { bg: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-400', icon: AlertTriangle };
      case 'high': return { bg: 'bg-orange-500/20', border: 'border-orange-500/50', text: 'text-orange-400', icon: Zap };
      case 'medium': return { bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', text: 'text-yellow-400', icon: Lightbulb };
      default: return { bg: 'bg-blue-500/20', border: 'border-blue-500/50', text: 'text-blue-400', icon: Bell };
    }
  };

  const getActionButton = (alert) => {
    switch (alert.action) {
      case 'flag_conflict':
        return (
          <Link to={createPageUrl('InsightsDashboard') + '?tab=conflicts'}>
            <Button size="sm" className="bg-red-600 hover:bg-red-700">
              <Eye className="w-3 h-3 mr-1" /> View Conflicts
            </Button>
          </Link>
        );
      case 'suggest_playbook':
        return (
          <Link to={createPageUrl('StrategyPlaybooks') + '?create=true' + (alert.playbook_type ? `&goal=${alert.playbook_type}` : '')}>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
              <BookOpen className="w-3 h-3 mr-1" /> Generate Playbook
            </Button>
          </Link>
        );
      case 'health_alert':
        return (
          <Link to={createPageUrl('AIModules')}>
            <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700">
              <TrendingUp className="w-3 h-3 mr-1" /> Run Analysis
            </Button>
          </Link>
        );
      case 'track_reminder':
        return (
          <Link to={createPageUrl('InsightsDashboard') + '?tab=recommendations'}>
            <Button size="sm" className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-3 h-3 mr-1" /> Track Actions
            </Button>
          </Link>
        );
      default:
        return (
          <Button size="sm" variant="outline" onClick={() => onAlertClick?.(alert)}>
            <ArrowRight className="w-3 h-3 mr-1" /> View Details
          </Button>
        );
    }
  };

  // Run analysis on mount and every 5 minutes
  useEffect(() => {
    runProactiveAnalysis();
    const interval = setInterval(runProactiveAnalysis, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-400" />
            Proactive AI Monitor
            {alerts.length > 0 && (
              <Badge className="bg-red-500/20 text-red-400 ml-2">{alerts.length}</Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={runProactiveAnalysis}
            disabled={isAnalyzing}
            className="text-slate-400 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        {lastAnalysis && (
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Last scan: {new Date(lastAnalysis).toLocaleTimeString()}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <AnimatePresence>
          {alerts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-4"
            >
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-slate-400">All systems nominal</p>
              <p className="text-xs text-slate-500">No critical alerts detected</p>
            </motion.div>
          ) : (
            alerts.map((alert, idx) => {
              const style = getPriorityStyle(alert.priority);
              const Icon = style.icon;
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`p-3 rounded-lg ${style.bg} border ${style.border}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 ${style.text} mt-0.5`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-semibold ${style.text} uppercase`}>
                          {alert.priority}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dismissAlert(alert.id)}
                          className="h-6 px-2 text-slate-500 hover:text-white text-xs"
                        >
                          Dismiss
                        </Button>
                      </div>
                      <p className="text-sm text-white mb-2">{alert.message}</p>
                      {alert.related_modules?.length > 0 && (
                        <div className="flex gap-1 mb-2">
                          {alert.related_modules.map((m, i) => (
                            <Badge key={i} className="bg-white/10 text-white text-xs">{m}</Badge>
                          ))}
                        </div>
                      )}
                      {getActionButton(alert)}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}