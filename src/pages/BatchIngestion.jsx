import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, FileText, Loader2, CheckCircle, XCircle, AlertCircle,
  Download, Copy, Building2
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function BatchIngestion() {
  const [file, setFile] = useState(null);
  const [cnpjList, setCnpjList] = useState([]);
  const [results, setResults] = useState(null);
  const fileInputRef = useRef(null);

  const processBatchMutation = useMutation({
    mutationFn: (cnpjs) => base44.functions.invoke('batchIngestCompanies', { cnpj_list: cnpjs }),
    onSuccess: (response) => {
      setResults(response.data);
      toast.success('Batch ingestion concluída!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Erro no processamento em lote');
    }
  });

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    if (!uploadedFile.name.endsWith('.csv')) {
      toast.error('Por favor, envie um arquivo CSV');
      return;
    }

    setFile(uploadedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        // Parse CSV (simple parsing - assumes CNPJs are in first column)
        const lines = text.split('\n').filter(line => line.trim());
        const cnpjs = lines
          .map(line => line.split(',')[0].trim())
          .filter(cnpj => cnpj && cnpj.length >= 11); // Filter valid-looking CNPJs
        
        setCnpjList(cnpjs);
        toast.success(`${cnpjs.length} CNPJs encontrados no arquivo`);
      }
    };
    reader.readAsText(uploadedFile);
  };

  const handleProcess = () => {
    if (cnpjList.length === 0) {
      toast.error('Nenhum CNPJ para processar');
      return;
    }
    processBatchMutation.mutate(cnpjList);
  };

  const downloadTemplate = () => {
    const csv = 'CNPJ\n00.000.000/0000-00\n11.111.111/1111-11\n22.222.222/2222-22';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_cnpj.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadResults = () => {
    if (!results) return;
    
    const csv = [
      'CNPJ,Status,Legal Name,Industry,Already Existed,Conflict,Error',
      ...results.results.details.map(item => 
        `${item.cnpj},${item.status},${item.legal_name || ''},${item.industry || ''},${item.already_existed || false},${item.conflict || false},${item.error || ''}`
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch_ingestion_results_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Upload className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Batch Ingestion</h1>
          <p className="text-slate-400">Processe múltiplas empresas de uma vez via CSV</p>
        </div>
      </div>

      {/* Upload Section */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Upload CSV
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadTemplate}
              className="border-white/10 text-white hover:bg-white/10"
            >
              <Download className="w-4 h-4 mr-2" />
              Template
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div 
            className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500/50 transition-all"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-white mb-1">
              {file ? file.name : 'Clique para fazer upload de CSV'}
            </p>
            <p className="text-sm text-slate-400">
              {cnpjList.length > 0 
                ? `${cnpjList.length} CNPJs detectados` 
                : 'Formato: uma coluna com CNPJs'}
            </p>
          </div>

          {cnpjList.length > 0 && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-semibold">Preview</h4>
                <Badge className="bg-blue-500/20 text-blue-400">
                  {cnpjList.length} CNPJs
                </Badge>
              </div>
              <div className="bg-white/5 rounded p-3 max-h-40 overflow-y-auto">
                <div className="space-y-1 text-sm text-slate-300 font-mono">
                  {cnpjList.slice(0, 10).map((cnpj, idx) => (
                    <div key={idx}>{cnpj}</div>
                  ))}
                  {cnpjList.length > 10 && (
                    <div className="text-slate-500">... e mais {cnpjList.length - 10}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={handleProcess}
            disabled={cnpjList.length === 0 || processBatchMutation.isPending}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {processBatchMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando... (isso pode levar alguns minutos)
              </>
            ) : (
              <>
                <Building2 className="w-4 h-4 mr-2" />
                Processar {cnpjList.length} Empresas
              </>
            )}
          </Button>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-xs text-yellow-300">
            ⚠️ O processamento respeita o rate limit da Brasil API (2s entre requisições). 
            Para 100 empresas, espere ~3-4 minutos.
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-green-500/10 border-green-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-400 mb-1">Sucesso</p>
                    <p className="text-3xl font-bold text-white">{results.results.success}</p>
                  </div>
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-500/10 border-red-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-400 mb-1">Falhas</p>
                    <p className="text-3xl font-bold text-white">{results.results.failed}</p>
                  </div>
                  <XCircle className="w-10 h-10 text-red-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-yellow-500/10 border-yellow-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-400 mb-1">Duplicatas</p>
                    <p className="text-3xl font-bold text-white">{results.results.duplicates}</p>
                  </div>
                  <Copy className="w-10 h-10 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-orange-500/10 border-orange-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-400 mb-1">Conflitos</p>
                    <p className="text-3xl font-bold text-white">{results.results.conflicts}</p>
                  </div>
                  <AlertCircle className="w-10 h-10 text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Bar */}
          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Taxa de Sucesso</span>
                  <span className="text-white font-semibold">{results.summary.success_rate}</span>
                </div>
                <Progress 
                  value={(results.results.success / results.results.total) * 100} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Detailed Results */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Resultados Detalhados</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadResults}
                  className="border-white/10 text-white hover:bg-white/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {results.results.details.map((item, idx) => (
                  <div 
                    key={idx}
                    className={`p-3 rounded-lg border ${
                      item.status === 'success' 
                        ? 'bg-green-500/5 border-green-500/30' 
                        : 'bg-red-500/5 border-red-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-white">{item.cnpj}</span>
                          {item.status === 'success' ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-400" />
                          )}
                        </div>
                        {item.legal_name && (
                          <p className="text-sm text-slate-300">{item.legal_name}</p>
                        )}
                        {item.industry && (
                          <Badge className="mt-1 text-xs bg-blue-500/20 text-blue-400">
                            {item.industry}
                          </Badge>
                        )}
                        {item.error && (
                          <p className="text-xs text-red-400 mt-1">{item.error}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {item.already_existed && (
                          <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-400">
                            Existente
                          </Badge>
                        )}
                        {item.conflict && (
                          <Badge variant="outline" className="text-xs border-orange-500/30 text-orange-400">
                            Conflito
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}