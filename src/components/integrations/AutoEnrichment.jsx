import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Sparkles, Loader2, Users, Handshake, Linkedin, 
  Play, CheckCircle, AlertCircle, TrendingUp
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function AutoEnrichment() {
  const queryClient = useQueryClient();
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [lastResults, setLastResults] = useState(null);

  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: () => base44.entities.Company.list()
  });

  const enrichMutation = useMutation({
    mutationFn: (companyId) => base44.functions.invoke('enrichCompanyData', {
      company_id: companyId || undefined
    }),
    onSuccess: (response) => {
      const { results } = response.data;
      setLastResults(results);
      
      const successMsg = selectedCompanyId 
        ? `Empresa enriquecida: ${results.executives_found} executivos, ${results.partnerships_found} parcerias, ${results.linkedin_profiles_linked} LinkedIn`
        : `${results.processed} empresas enriquecidas com sucesso!`;
      
      toast.success(successMsg);
      queryClient.invalidateQueries(['companies']);
      queryClient.invalidateQueries(['people']);
      queryClient.invalidateQueries(['companyRelationships']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.details || 'Enriquecimento falhou');
    }
  });

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          Enriquecimento Automatizado de Dados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-300">
          Extração automática de executivos, parcerias e perfis do LinkedIn usando IA
        </p>

        <div className="bg-white/5 rounded-lg p-4 border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Users className="w-4 h-4 text-blue-400" />
            <span>Extrai executivos de documentos CVM e filings públicos</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Handshake className="w-4 h-4 text-green-400" />
            <span>Identifica parcerias estratégicas em notícias</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Linkedin className="w-4 h-4 text-blue-600" />
            <span>Vincula perfis do LinkedIn automaticamente</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-slate-400">Empresa (opcional - deixe vazio para processar todas)</label>
          <Select value={selectedCompanyId || 'all'} onValueChange={(v) => setSelectedCompanyId(v === 'all' ? null : v)}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Selecione uma empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as empresas</SelectItem>
              {companies.map(company => (
                <SelectItem key={company.id} value={company.id}>
                  {company.legal_name || company.trade_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => enrichMutation.mutate(selectedCompanyId)}
          disabled={enrichMutation.isPending}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          {enrichMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enriquecendo...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Iniciar Enriquecimento
            </>
          )}
        </Button>

        {lastResults && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 rounded-lg p-4 border border-white/10"
          >
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-white">Resultados do Último Enriquecimento</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-slate-400">Empresas Processadas</div>
                <div className="text-lg font-bold text-white">{lastResults.processed}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Executivos Encontrados</div>
                <div className="text-lg font-bold text-blue-400">{lastResults.executives_found}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Parcerias Identificadas</div>
                <div className="text-lg font-bold text-green-400">{lastResults.partnerships_found}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">LinkedIn Vinculados</div>
                <div className="text-lg font-bold text-purple-400">{lastResults.linkedin_profiles_linked}</div>
              </div>
            </div>

            {lastResults.errors && lastResults.errors.length > 0 && (
              <div className="mt-3 bg-red-500/10 rounded-lg p-3 border border-red-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-3 h-3 text-red-400" />
                  <span className="text-xs font-medium text-red-400">Erros ({lastResults.errors.length})</span>
                </div>
                {lastResults.errors.slice(0, 3).map((err, idx) => (
                  <div key={idx} className="text-xs text-slate-300 mb-1">
                    • {err.company_name}: {err.error}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/30">
          <p className="text-xs text-blue-300">
            💡 O processo usa IA para buscar informações públicas e validadas. 
            Dados são adicionados automaticamente às entidades Person, CompanyRelationship e Company.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}