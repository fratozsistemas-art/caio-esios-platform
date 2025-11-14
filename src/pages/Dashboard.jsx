
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Zap, FileText, TrendingUp,
  Network, Target, Sparkles, ArrowRight, BarChart3, CheckCircle, BookOpen, Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { toast, Toaster } from 'react-hot-toast'; // Import Toaster as well

export default function Dashboard() {
  const queryClient = useQueryClient(); // Added
  const [user, setUser] = useState(null);
  const [testingClaude, setTestingClaude] = useState(false); // Added
  const [claudeTestResult, setClaudeTestResult] = useState(null); // Added

  useEffect(() => {
    base44.auth.me()
      .then(u => setUser(u))
      .catch(() => setUser(null));
  }, []);

  const { data: strategies = [] } = useQuery({
    queryKey: ['strategies'],
    queryFn: () => base44.entities.Strategy.list('-created_date', 5),
    initialData: [],
  });

  const { data: analyses = [] } = useQuery({
    queryKey: ['analyses'],
    queryFn: () => base44.entities.Analysis.list('-created_date', 5),
    initialData: [],
  });

  const { data: knowledgeSources = [] } = useQuery({
    queryKey: ['knowledgeSources'],
    queryFn: () => base44.entities.KnowledgeSource.filter({ is_active: true }),
    initialData: [],
  });

  const quickLinks = [
    {
      icon: MessageSquare,
      title: "Chat with CAIO",
      description: "Strategic conversation powered by TSI v7.0",
      link: createPageUrl("Chat"),
      color: "from-blue-500 to-purple-500",
      badge: "v7.0"
    },
    {
      icon: Zap,
      title: "Quick Actions",
      description: "48+ ready-to-use frameworks",
      link: createPageUrl("QuickActions"),
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: FileText,
      title: "File Analyzer",
      description: "Upload & analyze documents",
      link: createPageUrl("FileAnalyzer"),
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Network,
      title: "Knowledge Graph",
      description: "Explore strategic connections",
      link: createPageUrl("KnowledgeGraph"),
      color: "from-orange-500 to-red-500"
    },
    {
      icon: BookOpen,
      title: "Knowledge Base",
      description: "Manage documents for CAIO",
      link: createPageUrl("KnowledgeManagement"),
      color: "from-cyan-500 to-blue-500",
      badge: "NEW"
    }
  ];

  const stats = [
    {
      icon: Target,
      title: "Active Strategies",
      value: strategies.filter(s => s.status === 'validated' || s.status === 'analyzing').length,
      color: "text-blue-400",
      bg: "bg-blue-500/20"
    },
    {
      icon: BarChart3,
      title: "Analyses Complete",
      value: analyses.filter(a => a.status === 'completed').length,
      color: "text-green-400",
      bg: "bg-green-500/20"
    },
    {
      icon: BookOpen,
      title: "Knowledge Sources",
      value: knowledgeSources.filter(k => k.indexing_status === 'indexed').length,
      color: "text-purple-400",
      bg: "bg-purple-500/20"
    },
    {
      icon: TrendingUp,
      title: "ROI Impact",
      value: strategies.length > 0 ? `${Math.round(strategies.reduce((sum, s) => sum + (s.roi_estimate || 0), 0) / strategies.length)}%` : "0%",
      color: "text-orange-400",
      bg: "bg-orange-500/20"
    }
  ];

  const testClaudeIntegration = async () => {
    setTestingClaude(true);
    setClaudeTestResult(null);

    try {
      const { data } = await base44.functions.invoke('claudeAnalysis', {
        prompt: "Analyze the FinTech market opportunity in Brazil in 2024. Focus on: 1) Market size and growth, 2) Key players, 3) Emerging trends, 4) Strategic opportunities.",
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2048,
        temperature: 0.7,
        response_format: "json",
        json_schema: {
          type: "object",
          properties: {
            market_size_usd: { type: "number" },
            growth_rate_yoy: { type: "number" },
            key_players: { type: "array", items: { type: "string" } },
            emerging_trends: { type: "array", items: { type: "string" } },
            strategic_opportunities: { type: "array", items: { type: "string" } },
            confidence_score: { type: "number" }
          }
        }
      });

      setClaudeTestResult(data);
      toast.success('✅ Claude integration working!');
    } catch (error) {
      console.error('Claude test failed:', error);
      toast.error(`❌ Claude test failed: ${error.message}`);
      setClaudeTestResult({ error: error.message });
    } finally {
      setTestingClaude(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <Toaster position="bottom-right" /> {/* Added Toaster */}
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Dashboard
          </h1>
          <p className="text-slate-400">
            Strategic Intelligence Overview
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={testClaudeIntegration}
            disabled={testingClaude}
            variant="outline"
            className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
          >
            {testingClaude ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing Claude...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Test Claude API
              </>
            )}
          </Button>
          <Link to={createPageUrl("Chat")}>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat with CAIO
            </Button>
          </Link>
        </div>
      </div>

      {/* Claude Test Result */}
      {claudeTestResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Claude API Test Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              {claudeTestResult.error ? (
                <div className="text-red-400">
                  ❌ Error: {claudeTestResult.error}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-white/5">
                      <p className="text-sm text-slate-400 mb-1">Market Size</p>
                      <p className="text-2xl font-bold text-white">
                        ${(claudeTestResult.result?.market_size_usd / 1000000000).toFixed(1)}B
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-white/5">
                      <p className="text-sm text-slate-400 mb-1">Growth Rate</p>
                      <p className="text-2xl font-bold text-green-400">
                        {claudeTestResult.result?.growth_rate_yoy}% YoY
                      </p>
                    </div>
                  </div>

                  {claudeTestResult.result?.key_players && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-300 mb-2">Key Players</h4>
                      <div className="flex flex-wrap gap-2">
                        {claudeTestResult.result.key_players.map((player, idx) => (
                          <Badge key={idx} className="bg-blue-500/20 text-blue-400">
                            {player}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {claudeTestResult.metadata && (
                    <div className="pt-4 border-t border-white/10 flex items-center gap-4 text-xs text-slate-500">
                      <span>Model: {claudeTestResult.metadata.model}</span>
                      <span>Tokens: {claudeTestResult.metadata.usage.total_tokens}</span>
                      <span>Duration: {claudeTestResult.metadata.duration_ms}ms</span>
                      <span>Confidence: {claudeTestResult.result?.confidence_score}%</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-400">{stat.title}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + idx * 0.1 }}
            >
              <Link to={link.link}>
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${link.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <link.icon className="w-6 h-6 text-white" />
                      </div>
                      {link.badge && (
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          {link.badge}
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                      {link.title}
                    </h3>
                    <p className="text-sm text-slate-400 mb-3">{link.description}</p>
                    <div className="flex items-center text-blue-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                      Open
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Strategies */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-400" />
              Recent Strategies
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {strategies.length > 0 ? (
              <div className="space-y-3">
                {strategies.map((strategy) => (
                  <div key={strategy.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-white truncate">{strategy.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="text-xs bg-blue-500/20 text-blue-400">
                          {strategy.category}
                        </Badge>
                        {strategy.status === 'validated' && (
                          <CheckCircle className="w-3 h-3 text-green-400" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No strategies yet</p>
                <Button
                  size="sm"
                  onClick={() => window.location.href = createPageUrl("Chat")}
                  className="mt-3 bg-blue-500 hover:bg-blue-600"
                >
                  Create Strategy with CAIO
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Analyses */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-400" />
              Recent Analyses
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {analyses.length > 0 ? (
              <div className="space-y-3">
                {analyses.map((analysis) => (
                  <div key={analysis.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-white truncate">{analysis.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="text-xs bg-green-500/20 text-green-400">
                          {analysis.type}
                        </Badge>
                        {analysis.confidence_score && (
                          <span className="text-xs text-slate-400">
                            {analysis.confidence_score}% confidence
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No analyses yet</p>
                <Button
                  size="sm"
                  onClick={() => window.location.href = createPageUrl("FileAnalyzer")}
                  className="mt-3 bg-green-500 hover:bg-green-600"
                >
                  Analyze File
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
