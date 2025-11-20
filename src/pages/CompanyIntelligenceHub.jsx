import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Building2,
  User,
  Globe,
  Share2,
  Loader2,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  FileText,
  Network
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function CompanyIntelligenceHub() {
  const navigate = useNavigate();
  const [searchMethod, setSearchMethod] = useState("cnpj");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [enrichmentStatus, setEnrichmentStatus] = useState(null);

  const searchMethods = [
    { id: "cnpj", label: "CNPJ", icon: Building2, placeholder: "00.000.000/0000-00" },
    { id: "company_name", label: "Company Name", icon: Building2, placeholder: "Ex: Nubank, Ambev" },
    { id: "ceo_name", label: "CEO Name", icon: User, placeholder: "Ex: João Silva CEO" },
    { id: "website", label: "Website", icon: Globe, placeholder: "https://..." },
    { id: "social_media", label: "Social Media", icon: Share2, placeholder: "LinkedIn, Twitter URL" }
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Por favor, insira um termo de busca");
      return;
    }

    setIsSearching(true);
    setResults(null);
    setEnrichmentStatus(null);

    try {
      let discoveryResult;

      switch (searchMethod) {
        case "cnpj":
          const { data: cvmData } = await base44.functions.invoke('fetchCompanyFromCNPJ', {
            cnpj: searchQuery
          });
          discoveryResult = cvmData;
          break;

        case "company_name":
          const companies = await base44.entities.Company.filter({
            name: { $regex: searchQuery, $options: 'i' }
          });
          discoveryResult = companies.length > 0 ? companies[0].data : null;
          break;

        case "ceo_name":
          const { data: searchResult } = await base44.integrations.Core.InvokeLLM({
            prompt: `Search for companies where the CEO or founder is named "${searchQuery}". Return company name, CNPJ if available, and website.`,
            add_context_from_internet: true,
            response_json_schema: {
              type: "object",
              properties: {
                company_name: { type: "string" },
                cnpj: { type: "string" },
                website: { type: "string" },
                ceo_name: { type: "string" }
              }
            }
          });
          discoveryResult = searchResult;
          break;

        case "website":
          const { data: websiteData } = await base44.integrations.Core.InvokeLLM({
            prompt: `Extract company information from this website: ${searchQuery}. Include company name, industry, description, and key executives.`,
            add_context_from_internet: true,
            response_json_schema: {
              type: "object",
              properties: {
                company_name: { type: "string" },
                industry: { type: "string" },
                description: { type: "string" },
                executives: { type: "array", items: { type: "string" } }
              }
            }
          });
          discoveryResult = websiteData;
          break;

        case "social_media":
          const { data: socialData } = await base44.integrations.Core.InvokeLLM({
            prompt: `Extract company information from this social media profile: ${searchQuery}. Include company name, industry, employee count, and recent activity.`,
            add_context_from_internet: true,
            response_json_schema: {
              type: "object",
              properties: {
                company_name: { type: "string" },
                industry: { type: "string" },
                employee_count: { type: "string" },
                recent_activity: { type: "string" }
              }
            }
          });
          discoveryResult = socialData;
          break;
      }

      if (discoveryResult) {
        setResults(discoveryResult);
        toast.success("Empresa descoberta com sucesso!");

        // Trigger AI enrichment
        enrichCompanyData(discoveryResult);
      } else {
        toast.error("Nenhuma empresa encontrada");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao buscar empresa");
    } finally {
      setIsSearching(false);
    }
  };

  const enrichCompanyData = async (companyData) => {
    setEnrichmentStatus({ status: "enriching", message: "Enriquecendo dados com IA..." });

    try {
      const { data: enriched } = await base44.functions.invoke('enrichCompanyData', {
        company_data: companyData
      });

      setEnrichmentStatus({ 
        status: "completed", 
        message: "Enriquecimento concluído",
        data: enriched
      });

      toast.success("Dados enriquecidos com IA!");
    } catch (error) {
      setEnrichmentStatus({ 
        status: "error", 
        message: "Erro no enriquecimento"
      });
    }
  };

  const handleAnalyzeCompany = () => {
    if (results) {
      navigate(createPageUrl("TSIProject"), {
        state: { companyData: results }
      });
    }
  };

  const currentMethod = searchMethods.find(m => m.id === searchMethod);
  const CurrentIcon = currentMethod?.icon || Search;

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Building2 className="w-10 h-10 text-cyan-400" />
            Company Intelligence Hub
          </h1>
          <p className="text-slate-400">
            Multi-source company discovery + AI-powered enrichment
          </p>
        </div>
        <Badge className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0">
          <Sparkles className="w-3 h-3 mr-1" />
          AI-Powered
        </Badge>
      </div>

      {/* Search Interface */}
      <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-cyan-500/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Search className="w-5 h-5 text-cyan-400" />
            Multi-Source Discovery
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Method Selector */}
          <Tabs value={searchMethod} onValueChange={setSearchMethod}>
            <TabsList className="grid grid-cols-5 bg-slate-800/50">
              {searchMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <TabsTrigger
                    key={method.id}
                    value={method.id}
                    className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {method.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>

          {/* Search Input */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <CurrentIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={currentMethod?.placeholder}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700"
            >
              {isSearching ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Discover
                </>
              )}
            </Button>
          </div>

          {/* Discovery Tips */}
          <Card className="bg-slate-800/30 border-slate-700">
            <CardContent className="p-4">
              <h4 className="text-white font-semibold mb-3 text-sm">Discovery Tips</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400">•</span>
                  <span><strong>CNPJ:</strong> Most accurate - validates against government sources</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400">•</span>
                  <span><strong>Company Name:</strong> May return multiple matches for disambiguation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400">•</span>
                  <span><strong>CEO Name:</strong> Works best with full name and "CEO" or "Presidente"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400">•</span>
                  <span><strong>Website:</strong> Extracts company info from website content</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400">•</span>
                  <span><strong>Social Media:</strong> Supports LinkedIn, Twitter/X, Facebook profiles</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Results */}
      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Company Overview */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Building2 className="w-6 h-6 text-cyan-400" />
                    {results.company_name || results.name || "Empresa Descoberta"}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAnalyzeCompany}
                      className="bg-purple-600/20 border-purple-500/30 text-purple-300 hover:bg-purple-600/30"
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Análise TSI Completa
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-cyan-600/20 border-cyan-500/30 text-cyan-300 hover:bg-cyan-600/30"
                    >
                      <Network className="w-4 h-4 mr-2" />
                      Ver no Knowledge Graph
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(results).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <p className="text-xs text-slate-400 uppercase">{key.replace(/_/g, ' ')}</p>
                      <p className="text-white">
                        {typeof value === 'object' ? JSON.stringify(value) : value || "N/A"}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Enrichment Status */}
            {enrichmentStatus && (
              <Card className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-purple-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {enrichmentStatus.status === "enriching" && (
                      <>
                        <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                        <span className="text-white">{enrichmentStatus.message}</span>
                      </>
                    )}
                    {enrichmentStatus.status === "completed" && (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-white">{enrichmentStatus.message}</span>
                      </>
                    )}
                    {enrichmentStatus.status === "error" && (
                      <>
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <span className="text-white">{enrichmentStatus.message}</span>
                      </>
                    )}
                  </div>
                  {enrichmentStatus.data && (
                    <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
                      <pre className="text-xs text-slate-300 whitespace-pre-wrap">
                        {JSON.stringify(enrichmentStatus.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}