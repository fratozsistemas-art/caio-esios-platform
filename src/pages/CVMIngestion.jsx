import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Database, Download, Upload, CheckCircle, AlertCircle, 
  Loader2, Building2, Users, Network, TrendingUp, Info
} from "lucide-react";
import { toast } from "sonner";

export default function CVMIngestion() {
  const [limit, setLimit] = useState(50);
  const [fetchExecutives, setFetchExecutives] = useState(true);
  const [cvmData, setCvmData] = useState(null);
  const [ingestionResults, setIngestionResults] = useState(null);

  const fetchCVMMutation = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('fetchCVMCompanies', {
        limit: limit,
        fetch_executives: fetchExecutives
      });
      return data;
    },
    onSuccess: (data) => {
      setCvmData(data.data);
      toast.success(`Fetched ${data.data.companies.length} companies from CVM`);
    },
    onError: (error) => {
      toast.error(`Error fetching CVM data: ${error.message}`);
    }
  });

  const ingestMutation = useMutation({
    mutationFn: async () => {
      if (!cvmData) throw new Error('No data to ingest');
      
      const { data } = await base44.functions.invoke('ingestCVMToGraph', {
        companies: cvmData.companies,
        executives: cvmData.executives
      });
      return data;
    },
    onSuccess: (data) => {
      setIngestionResults(data.results);
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(`Error ingesting data: ${error.message}`);
    }
  });

  const handleFetch = () => {
    setCvmData(null);
    setIngestionResults(null);
    fetchCVMMutation.mutate();
  };

  const handleIngest = () => {
    ingestMutation.mutate();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Database className="w-8 h-8 text-blue-400" />
          CVM Data Ingestion
        </h1>
        <p className="text-slate-400 mt-1">
          Import Brazilian publicly traded companies from CVM (Comissão de Valores Mobiliários)
        </p>
      </div>

      {/* Info Banner */}
      <Card className="bg-blue-500/10 border-blue-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-400 font-medium mb-1">About CVM Data</p>
              <p className="text-xs text-slate-300">
                CVM is Brazil's securities regulator. This tool fetches publicly available data on traded companies, 
                their executives, and board members. All data comes from official public disclosure requirements 
                (CVM Instruction 480/2009).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-sm">Fetch Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-slate-400 text-xs">Number of Companies</Label>
            <Input
              type="number"
              min="10"
              max="500"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value))}
              className="bg-white/5 border-white/10 text-white mt-1"
            />
            <p className="text-xs text-slate-500 mt-1">
              Fetches top N active companies from CVM registry
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-slate-400 text-xs">Fetch Executives & Board</Label>
              <p className="text-xs text-slate-500 mt-1">
                Include executive and board member data (adds ~30s)
              </p>
            </div>
            <Switch
              checked={fetchExecutives}
              onCheckedChange={setFetchExecutives}
            />
          </div>

          <Button
            onClick={handleFetch}
            disabled={fetchCVMMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {fetchCVMMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Fetching from CVM...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Fetch CVM Data
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Fetched Data Preview */}
      {cvmData && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-sm">Fetched Data Preview</CardTitle>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Ready to Ingest
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <Building2 className="w-5 h-5 text-blue-400" />
                  <span className="text-2xl font-bold text-white">
                    {cvmData.companies.length}
                  </span>
                </div>
                <p className="text-xs text-slate-400">Companies</p>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  <span className="text-2xl font-bold text-white">
                    {cvmData.executives?.length || 0}
                  </span>
                </div>
                <p className="text-xs text-slate-400">Executives</p>
              </div>

              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <Network className="w-5 h-5 text-green-400" />
                  <span className="text-2xl font-bold text-white">
                    {cvmData.executives?.filter(e => e.is_current).length || 0}
                  </span>
                </div>
                <p className="text-xs text-slate-400">Current Roles</p>
              </div>
            </div>

            {/* Sample Companies */}
            <div>
              <p className="text-xs text-slate-400 mb-2">Sample Companies:</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {cvmData.companies.slice(0, 10).map((company, idx) => (
                  <div key={idx} className="bg-white/5 rounded p-2 border border-white/10">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">{company.name}</p>
                        <p className="text-xs text-slate-400">CNPJ: {company.cnpj}</p>
                      </div>
                      <Badge variant="outline" className="border-white/20 text-slate-400 text-xs">
                        {company.sector}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ingest Button */}
            <Button
              onClick={handleIngest}
              disabled={ingestMutation.isPending}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {ingestMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Ingesting to Knowledge Graph...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Ingest to Knowledge Graph
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Ingestion Results */}
      {ingestionResults && (
        <Card className="bg-green-500/10 border-green-500/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <CardTitle className="text-white text-sm">Ingestion Complete</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Results Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-slate-400">Companies Created</p>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {ingestionResults.companies_created}
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-slate-400">People Created</p>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {ingestionResults.people_created}
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-slate-400">Relationships Created</p>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {ingestionResults.relationships_created}
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-slate-400">Board Interlocks</p>
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {ingestionResults.board_interlocks_detected}
                </p>
              </div>
            </div>

            {/* Errors */}
            {ingestionResults.errors && ingestionResults.errors.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <p className="text-sm font-medium text-red-400">
                    {ingestionResults.errors.length} Errors
                  </p>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {ingestionResults.errors.slice(0, 10).map((error, idx) => (
                    <p key={idx} className="text-xs text-slate-300">• {error}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <p className="text-xs text-blue-400 font-medium mb-2">Next Steps:</p>
              <ul className="text-xs text-slate-300 space-y-1">
                <li>• View ingested data in the Knowledge Graph</li>
                <li>• Analyze board interlocks and company networks</li>
                <li>• Run AI queries to discover strategic relationships</li>
                <li>• Enrich companies with external data sources</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}