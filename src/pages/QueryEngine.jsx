import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Search, Loader2, Target, Brain, Sparkles, 
  TrendingUp, ArrowRight, Lightbulb, DollarSign, AlertCircle, Flame
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function QueryEngine() {
  const queryClient = useQueryClient();
  const [queryMode, setQueryMode] = useState("template"); // template | custom
  const [queryCategory, setQueryCategory] = useState("competitive"); // competitive | market | investment | innovation | growth
  const [queryType, setQueryType] = useState("find_similar_companies");
  const [params, setParams] = useState({});
  const [customQuery, setCustomQuery] = useState("");
  const [results, setResults] = useState(null);
  const [isQuerying, setIsQuerying] = useState(false);

  // ✅ EXPANDED: 20+ Query Types Organized by Category
  const queryCategories = {
    competitive: {
      title: "Competitive Intelligence",
      icon: Target,
      color: "from-red-500 to-orange-500",
      queries: [
        {
          value: "find_similar_companies",
          label: "🔍 Find Similar Companies",
          description: "Companies with similar profile (industry, stage, geography)",
          params: ["industry", "geography", "stage", "revenue_range"]
        },
        {
          value: "identify_direct_competitors",
          label: "🎯 Identify Direct Competitors",
          description: "Find companies competing in same market/segment",
          params: ["company_name", "product_category", "geography"]
        },
        {
          value: "competitive_positioning",
          label: "📊 Competitive Positioning Analysis",
          description: "Where does company stand vs competitors",
          params: ["company_name", "competitors", "dimensions"]
        },
        {
          value: "competitor_moves_tracking",
          label: "👀 Track Competitor Moves",
          description: "Recent strategic moves (pivots, acquisitions, launches)",
          params: ["competitor_names", "time_period", "move_type"]
        }
      ]
    },
    market: {
      title: "Market Intelligence",
      icon: TrendingUp,
      color: "from-blue-500 to-cyan-500",
      queries: [
        {
          value: "market_size_estimation",
          label: "📈 Estimate Market Size",
          description: "TAM/SAM/SOM calculation for specific market",
          params: ["industry", "geography", "customer_segment"]
        },
        {
          value: "identify_market_gaps",
          label: "🎯 Identify Market Gaps",
          description: "Underserved segments and white space opportunities",
          params: ["industry", "geography", "constraint"]
        },
        {
          value: "market_entry_barriers",
          label: "🚧 Analyze Entry Barriers",
          description: "Barriers to entering specific market",
          params: ["industry", "geography", "company_stage"]
        },
        {
          value: "emerging_market_trends",
          label: "🌊 Emerging Trends Detection",
          description: "Early signals of market shifts and trends",
          params: ["industry", "time_horizon", "signal_type"]
        }
      ]
    },
    investment: {
      title: "Investment & M&A",
      icon: DollarSign,
      color: "from-green-500 to-emerald-500",
      queries: [
        {
          value: "identify_acquisition_targets",
          label: "🎯 Find Acquisition Targets",
          description: "Companies that fit acquisition criteria",
          params: ["industry", "revenue_range", "geography", "strategic_fit"]
        },
        {
          value: "valuation_benchmarking",
          label: "💰 Valuation Benchmarking",
          description: "Compare valuation multiples vs peers",
          params: ["company_name", "metric", "peer_group"]
        },
        {
          value: "funding_pattern_analysis",
          label: "💵 Funding Patterns",
          description: "Analyze funding trends in sector",
          params: ["industry", "stage", "time_period"]
        },
        {
          value: "investor_thesis_mapping",
          label: "🧠 Map Investor Thesis",
          description: "What types of companies are VCs backing",
          params: ["investor_name", "sector", "stage"]
        }
      ]
    },
    innovation: {
      title: "Innovation & Technology",
      icon: Lightbulb,
      color: "from-purple-500 to-pink-500",
      queries: [
        {
          value: "technology_adoption_curve",
          label: "📡 Technology Adoption Analysis",
          description: "Who's adopting what tech and when",
          params: ["technology", "industry", "adoption_stage"]
        },
        {
          value: "patent_landscape",
          label: "📜 Patent Landscape Mapping",
          description: "Patent activity in specific domain",
          params: ["technology_domain", "geography", "time_period"]
        },
        {
          value: "innovation_velocity",
          label: "⚡ Innovation Velocity",
          description: "Rate of innovation in industry",
          params: ["industry", "metric", "benchmark_period"]
        },
        {
          value: "tech_stack_comparison",
          label: "🔧 Tech Stack Comparison",
          description: "Compare technology choices across companies",
          params: ["companies", "tech_category"]
        }
      ]
    },
    growth: {
      title: "Growth & Strategy",
      icon: Flame,
      color: "from-orange-500 to-yellow-500",
      queries: [
        {
          value: "growth_playbooks",
          label: "📚 Find Growth Playbooks",
          description: "Strategies that drove growth for similar companies",
          params: ["industry", "growth_stage", "constraint"]
        },
        {
          value: "channel_effectiveness",
          label: "📣 Channel Effectiveness",
          description: "Which acquisition channels work best",
          params: ["industry", "customer_segment", "stage"]
        },
        {
          value: "pricing_strategy_analysis",
          label: "💵 Pricing Strategy Benchmarking",
          description: "How competitors price similar products",
          params: ["product_category", "customer_segment", "geography"]
        },
        {
          value: "partnership_opportunities",
          label: "🤝 Identify Partnership Opportunities",
          description: "Companies for strategic partnerships",
          params: ["company_profile", "partnership_type", "geography"]
        }
      ]
    },
    risk: {
      title: "Risk & Threats",
      icon: AlertCircle,
      color: "from-red-500 to-pink-500",
      queries: [
        {
          value: "disruptive_threats",
          label: "⚠️ Identify Disruptive Threats",
          description: "Emerging threats to business model",
          params: ["industry", "business_model", "time_horizon"]
        },
        {
          value: "dependency_analysis",
          label: "🔗 Dependency Risk Analysis",
          description: "Over-dependence on specific partners/tech",
          params: ["company_name", "dependency_type"]
        },
        {
          value: "regulatory_landscape",
          label: "📋 Regulatory Risk Mapping",
          description: "Regulatory changes affecting industry",
          params: ["industry", "geography", "regulation_type"]
        }
      ]
    }
  };

  // ✅ Get current category queries
  const currentCategoryQueries = queryCategories[queryCategory]?.queries || [];
  const currentQuery = currentCategoryQueries.find(q => q.value === queryType);

  // ✅ ENHANCED: Sample queries with real business scenarios
  const sampleQueries = [
    {
      category: "competitive",
      title: "Nubank Competitive Landscape",
      description: "Find Brazilian FinTech companies competing with Nubank",
      icon: Target,
      action: () => {
        setQueryMode("template");
        setQueryCategory("competitive");
        setQueryType("identify_direct_competitors");
        setParams({ 
          company_name: "Nubank", 
          product_category: "Digital Banking", 
          geography: "Brasil" 
        });
      }
    },
    {
      category: "market",
      title: "SaaS Market Size - Brasil",
      description: "Estimate TAM/SAM/SOM for B2B SaaS in Brazil",
      icon: TrendingUp,
      action: () => {
        setQueryMode("template");
        setQueryCategory("market");
        setQueryType("market_size_estimation");
        setParams({ 
          industry: "B2B SaaS", 
          geography: "Brasil", 
          customer_segment: "SMB" 
        });
      }
    },
    {
      category: "investment",
      title: "HealthTech Acquisition Targets",
      description: "Companies in HealthTech for potential acquisition",
      icon: DollarSign,
      action: () => {
        setQueryMode("template");
        setQueryCategory("investment");
        setQueryType("identify_acquisition_targets");
        setParams({ 
          industry: "HealthTech", 
          revenue_range: "$1M-$10M", 
          geography: "LATAM",
          strategic_fit: "telehealth platform" 
        });
      }
    },
    {
      category: "innovation",
      title: "AI Adoption in E-commerce",
      description: "Which e-commerce companies are adopting AI/ML",
      icon: Lightbulb,
      action: () => {
        setQueryMode("template");
        setQueryCategory("innovation");
        setQueryType("technology_adoption_curve");
        setParams({ 
          technology: "AI/ML for personalization", 
          industry: "E-commerce", 
          adoption_stage: "early_adopters" 
        });
      }
    },
    {
      category: "growth",
      title: "FinTech Growth Playbooks",
      description: "Strategies that drove 10x growth in FinTech",
      icon: Flame,
      action: () => {
        setQueryMode("template");
        setQueryCategory("growth");
        setQueryType("growth_playbooks");
        setParams({ 
          industry: "FinTech", 
          growth_stage: "series_a_to_b", 
          constraint: "growth_10x_in_2years" 
        });
      }
    },
    {
      category: "risk",
      title: "Regulatory Risks - FinTech Brasil",
      description: "Upcoming regulatory changes affecting FinTech",
      icon: AlertCircle,
      action: () => {
        setQueryMode("template");
        setQueryCategory("risk");
        setQueryType("regulatory_landscape");
        setParams({ 
          industry: "FinTech", 
          geography: "Brasil", 
          regulation_type: "banking_regulation" 
        });
      }
    }
  ];

  const handleQuery = async () => {
    setIsQuerying(true);
    setResults(null);
    
    try {
      if (queryMode === "custom") {
        // ✅ Custom query mode - use LLM to interpret
        const { data } = await base44.functions.invoke('queryKnowledgeGraph', {
          query_type: "custom_natural_language",
          params: { natural_language_query: customQuery }
        });
        setResults(data);
      } else {
        // Template query mode
        const { data } = await base44.functions.invoke('queryKnowledgeGraph', {
          query_type: queryType,
          params
        });
        setResults(data);
      }
    } catch (error) {
      console.error('Query error:', error);
      alert(`Erro ao consultar grafo: ${error.message}`);
    }
    
    setIsQuerying(false);
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Search className="w-10 h-10 text-blue-400" />
            Query Engine
          </h1>
          <p className="text-slate-400">
            Advanced knowledge graph queries for strategic intelligence
          </p>
        </div>
      </div>

      {/* Query Mode Selector */}
      <Tabs value={queryMode} onValueChange={setQueryMode} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white/5">
          <TabsTrigger value="template">Template Queries</TabsTrigger>
          <TabsTrigger value="custom">Custom Query</TabsTrigger>
        </TabsList>

        {/* Template Mode */}
        <TabsContent value="template" className="space-y-6">
          {/* Category Selector */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Query Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(queryCategories).map(([key, cat]) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setQueryCategory(key);
                        setQueryType(cat.queries[0].value);
                        setParams({});
                      }}
                      className={`p-4 rounded-xl border transition-all ${
                        queryCategory === key
                          ? 'border-blue-500 bg-gradient-to-r ' + cat.color + ' bg-opacity-10'
                          : 'border-white/10 hover:border-white/20 bg-white/5'
                      }`}
                    >
                      <Icon className="w-6 h-6 mx-auto mb-2 text-white" />
                      <p className="text-sm font-medium text-white text-center">
                        {cat.title}
                      </p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Query Builder */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-white">Build Query</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Query Type */}
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Query Type</label>
                <Select value={queryType} onValueChange={(val) => {
                  setQueryType(val);
                  setParams({});
                }}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currentCategoryQueries.map((q) => (
                      <SelectItem key={q.value} value={q.value}>
                        {q.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {currentQuery && (
                  <p className="text-sm text-slate-500 mt-2">{currentQuery.description}</p>
                )}
              </div>

              {/* Dynamic Parameters */}
              {currentQuery?.params && (
                <div className="grid md:grid-cols-2 gap-4">
                  {currentQuery.params.map((paramName) => (
                    <div key={paramName}>
                      <label className="text-sm text-slate-400 mb-2 block capitalize">
                        {paramName.replace(/_/g, ' ')}
                      </label>
                      <Input
                        value={params[paramName] || ''}
                        onChange={(e) => setParams({...params, [paramName]: e.target.value})}
                        placeholder={`Enter ${paramName.replace(/_/g, ' ')}`}
                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                      />
                    </div>
                  ))}
                </div>
              )}

              <Button
                onClick={handleQuery}
                disabled={isQuerying}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                {isQuerying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Querying...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Execute Query
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Query Mode */}
        <TabsContent value="custom" className="space-y-6">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                Natural Language Query
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-2 block">
                  Ask anything about the knowledge graph
                </label>
                <Textarea
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  placeholder="Ex: Find companies in FinTech that received Series A funding in 2023 and are expanding to LATAM..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 min-h-[120px]"
                />
              </div>

              <Button
                onClick={handleQuery}
                disabled={isQuerying || !customQuery.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isQuerying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Query with AI
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Results */}
      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  Query Results ({results.count} items)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {Array.isArray(results.results) ? (
                  <div className="space-y-4">
                    {results.results.map((result, idx) => (
                      <Card key={idx} className="bg-white/5 border-white/10">
                        <CardContent className="p-4">
                          <pre className="text-sm text-slate-300 whitespace-pre-wrap">
                            {JSON.stringify(result, null, 2)}
                          </pre>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <pre className="text-sm text-slate-300 overflow-auto">
                    {JSON.stringify(results.results, null, 2)}
                  </pre>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sample Queries */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="text-white">Sample Queries</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sampleQueries.map((sample, idx) => (
              <button
                key={idx}
                onClick={sample.action}
                className="text-left p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <sample.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1 group-hover:text-blue-300 transition-colors">
                      {sample.title}
                    </h3>
                    <p className="text-sm text-slate-400">{sample.description}</p>
                    <Badge className="mt-2 bg-purple-500/20 text-purple-400 text-xs">
                      {sample.category}
                    </Badge>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}