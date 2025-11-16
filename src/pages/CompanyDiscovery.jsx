import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, Building2, Loader2, Plus, TrendingUp, Users,
  MapPin, ExternalLink, BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { motion } from "framer-motion";

export default function CompanyDiscovery() {
  const [cnpjInput, setCnpjInput] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const queryClient = useQueryClient();

  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: () => base44.entities.Company.list('-created_date', 50)
  });

  const fetchCompanyMutation = useMutation({
    mutationFn: (cnpj) => base44.functions.invoke('fetchCompanyFromCNPJ', { cnpj }),
    onSuccess: (response) => {
      setSearchResults(response.data);
      toast.success('Empresa encontrada e salva!');
      queryClient.invalidateQueries(['companies']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Erro ao buscar empresa');
    }
  });

  const handleSearch = () => {
    if (!cnpjInput) {
      toast.error('Digite um CNPJ');
      return;
    }
    fetchCompanyMutation.mutate(cnpjInput);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Company Discovery</h1>
          <p className="text-slate-400">Busque empresas por CNPJ ou explore a base</p>
        </div>
      </div>

      {/* Search Section */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Search className="w-5 h-5" />
            Buscar por CNPJ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Input
              placeholder="00.000.000/0000-00"
              value={cnpjInput}
              onChange={(e) => setCnpjInput(e.target.value)}
              className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
            />
            <Button
              onClick={handleSearch}
              disabled={fetchCompanyMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {fetchCompanyMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Buscar
                </>
              )}
            </Button>
          </div>

          {searchResults && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-500/10 border border-green-500/30 rounded-lg p-4"
            >
              <h4 className="text-white font-semibold mb-2">{searchResults.company.legal_name}</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-400">CNPJ:</span>
                  <span className="text-white ml-2">{searchResults.company.cnpj}</span>
                </div>
                <div>
                  <span className="text-slate-400">Indústria:</span>
                  <span className="text-white ml-2">{searchResults.company.industry}</span>
                </div>
                <div>
                  <span className="text-slate-400">Status:</span>
                  <Badge className={`ml-2 ${searchResults.company.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {searchResults.company.status}
                  </Badge>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Companies Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">
            Empresas Cadastradas ({companies.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((company, idx) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-1">{company.legal_name}</h3>
                      <p className="text-sm text-slate-400">{company.trade_name}</p>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {company.industry}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    {company.employees_count && (
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <Users className="w-4 h-4 text-slate-400" />
                        {company.employees_count} funcionários
                      </div>
                    )}
                    {company.revenue_millions && (
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <TrendingUp className="w-4 h-4 text-slate-400" />
                        R$ {company.revenue_millions}M receita
                      </div>
                    )}
                    {company.address?.city && (
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {company.address.city}, {company.address.state}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link to={createPageUrl(`CompanyProfile?id=${company.id}`)} className="flex-1">
                      <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Ver Perfil
                      </Button>
                    </Link>
                    {company.website && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/10 text-white hover:bg-white/10"
                        onClick={() => window.open(company.website, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {companies.length === 0 && (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="py-12 text-center">
              <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-400">Nenhuma empresa cadastrada ainda</p>
              <p className="text-sm text-slate-500 mt-1">Use a busca por CNPJ para adicionar empresas</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}