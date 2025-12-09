import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Settings, Key, CheckCircle, AlertCircle, Database, Search } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function APIManagement() {
  const [searchQuery, setSearchQuery] = useState("");

  const apiServices = [
    {
      id: "openai",
      name: "OpenAI",
      description: "GPT-4, embeddings, and AI completions",
      status: "connected",
      category: "ai",
      keyName: "OPENAI_API_KEY",
      hasKey: true
    },
    {
      id: "anthropic",
      name: "Anthropic Claude",
      description: "Claude AI models for strategic analysis",
      status: "connected",
      category: "ai",
      keyName: "ANTHROPIC_API_KEY",
      hasKey: true
    },
    {
      id: "stripe",
      name: "Stripe",
      description: "Payment processing and subscriptions",
      status: "error",
      category: "payment",
      keyName: "STRIPE_SECRET_KEY",
      hasKey: true,
      error: "Invalid API Key"
    },
    {
      id: "neo4j",
      name: "Neo4j",
      description: "Graph database for knowledge connections",
      status: "connected",
      category: "database",
      keyName: "NEO4J_URI",
      hasKey: true
    },
    {
      id: "alpha-vantage",
      name: "Alpha Vantage",
      description: "Financial market data and analytics",
      status: "connected",
      category: "data",
      keyName: "ALPHA_VANTAGE_API_KEY",
      hasKey: true
    },
    {
      id: "finnhub",
      name: "Finnhub",
      description: "Real-time stock market data",
      status: "connected",
      category: "data",
      keyName: "FINNHUB_API_KEY",
      hasKey: true
    },
    {
      id: "news-api",
      name: "News API",
      description: "Global news and sentiment analysis",
      status: "connected",
      category: "data",
      keyName: "NEWS_API_KEY",
      hasKey: true
    },
    {
      id: "bloomberg",
      name: "Bloomberg Terminal",
      description: "Professional financial data",
      status: "disconnected",
      category: "data",
      keyName: "BLOOMBERG_API_KEY",
      hasKey: false
    }
  ];

  const categories = [
    { id: "all", label: "All Services" },
    { id: "ai", label: "AI Models" },
    { id: "data", label: "Data Sources" },
    { id: "database", label: "Databases" },
    { id: "payment", label: "Payments" }
  ];

  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredServices = apiServices.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusIcon = (status) => {
    switch(status) {
      case "connected": return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "error": return <AlertCircle className="w-5 h-5 text-red-400" />;
      default: return <AlertCircle className="w-5 h-5 text-[#94A3B8]" />;
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case "connected": return <Badge className="bg-green-400/20 text-green-400">Connected</Badge>;
      case "error": return <Badge className="bg-red-400/20 text-red-400">Error</Badge>;
      default: return <Badge className="bg-[#94A3B8]/20 text-[#94A3B8]">Not Configured</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00D4FF] to-[#8B5CF6] flex items-center justify-center">
          <Settings className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">API Management</h1>
          <p className="text-[#94A3B8]">Configure external service integrations and API keys</p>
        </div>
      </div>

      <Card className="bg-[#1A1D29] border-[#00D4FF]/20">
        <CardContent className="p-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search API services..."
              className="pl-10 bg-[#0A2540] border-[#00D4FF]/30 text-white placeholder:text-[#94A3B8]"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat.id)}
                className={selectedCategory === cat.id 
                  ? "bg-[#00D4FF] text-[#0A2540] hover:bg-[#00B8E6] font-medium whitespace-nowrap" 
                  : "bg-[#1A1D29] border-[#00D4FF]/30 text-[#94A3B8] hover:bg-[#0A2540] hover:border-[#00D4FF]/50 hover:text-white whitespace-nowrap"}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {filteredServices.map((service, idx) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="bg-[#1A1D29] border-[#00D4FF]/20 hover:bg-[#0A2540] transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(service.status)}
                    <div>
                      <CardTitle className="text-white text-lg">{service.name}</CardTitle>
                      <CardDescription className="text-[#94A3B8] text-sm">
                        {service.description}
                      </CardDescription>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(service.status)}
                  <Badge className="bg-[#8B5CF6]/20 text-[#8B5CF6]">{service.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {service.error && (
                  <div className="mb-3 p-3 rounded-lg bg-red-400/10 border border-red-400/20">
                    <p className="text-red-400 text-sm">{service.error}</p>
                  </div>
                )}
                <div className="space-y-3">
                  <div>
                    <Label className="text-[#94A3B8] text-xs">Environment Variable</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 px-3 py-2 rounded bg-[#0A2540] border border-[#00D4FF]/20 text-[#00D4FF] text-sm font-mono">
                        {service.keyName}
                      </code>
                      {service.hasKey && <Key className="w-4 h-4 text-green-400" />}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-[#00D4FF]/30 text-[#00D4FF] hover:bg-[#00D4FF]/10"
                    onClick={() => toast.info("Configure in Dashboard → Settings → Environment Variables")}
                  >
                    {service.hasKey ? "Update Configuration" : "Configure API Key"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}