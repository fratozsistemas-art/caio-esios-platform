import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Upload, FileText, Loader2, CheckCircle, AlertCircle, Download, 
  Database, FileSpreadsheet, Image, FileJson, Sparkles, Brain,
  Table, List, Building2
} from 'lucide-react';
import { toast } from 'sonner';

const FILE_TYPES = {
  csv: { icon: FileSpreadsheet, label: 'CSV/Excel', accept: '.csv,.xlsx,.xls', color: 'text-green-400' },
  pdf: { icon: FileText, label: 'PDF', accept: '.pdf', color: 'text-red-400' },
  image: { icon: Image, label: 'Imagem', accept: '.png,.jpg,.jpeg,.webp', color: 'text-blue-400' },
  json: { icon: FileJson, label: 'JSON', accept: '.json', color: 'text-yellow-400' },
  text: { icon: FileText, label: 'Texto', accept: '.txt,.md,.doc,.docx', color: 'text-purple-400' }
};

const EXTRACTION_MODES = [
  { value: 'cvm_companies', label: 'Empresas CVM', icon: Building2, description: 'Dados de empresas listadas na CVM' },
  { value: 'financial_data', label: 'Dados Financeiros', icon: Table, description: 'Balanços, DRE, fluxo de caixa' },
  { value: 'contacts', label: 'Contatos/Leads', icon: List, description: 'Lista de contatos ou leads' },
  { value: 'custom', label: 'Schema Customizado', icon: FileJson, description: 'Defina seu próprio schema' },
  { value: 'auto', label: 'Detecção Automática', icon: Brain, description: 'IA detecta estrutura automaticamente' }
];

export default function BatchIngestion() {
  const [activeTab, setActiveTab] = useState('structured');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [processingResults, setProcessingResults] = useState(null);
  const [extractionMode, setExtractionMode] = useState('cvm_companies');
  const [extractedData, setExtractedData] = useState(null);
  const [customSchema, setCustomSchema] = useState('');

  const uploadFileMutation = useMutation({
    mutationFn: async (file) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      return file_url;
    },
    onSuccess: (fileUrl) => {
      setUploadedFileUrl(fileUrl);
      toast.success('Arquivo enviado com sucesso');
    },
    onError: () => {
      toast.error('Falha no upload');
    }
  });

  const processFileMutation = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('bulkUploadCVMData', {
        file_url: uploadedFileUrl
      });
      return data;
    },
    onSuccess: (data) => {
      setProcessingResults(data.results);
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error('Erro no processamento: ' + error.message);
    }
  });

  const extractDataMutation = useMutation({
    mutationFn: async () => {
      const schema = getSchemaForMode(extractionMode, customSchema);
      
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url: uploadedFileUrl,
        json_schema: schema
      });
      
      return result;
    },
    onSuccess: (data) => {
      if (data.status === 'success') {
        setExtractedData(data.output);
        toast.success('Dados extraídos com sucesso!');
      } else {
        toast.error('Erro na extração: ' + data.details);
      }
    },
    onError: (error) => {
      toast.error('Erro na extração: ' + error.message);
    }
  });

  const getSchemaForMode = (mode, custom) => {
    switch (mode) {
      case 'cvm_companies':
        return {
          type: "array",
          items: {
            type: "object",
            properties: {
              cnpj: { type: "string", description: "CNPJ da empresa" },
              razao_social: { type: "string", description: "Razão social" },
              nome_fantasia: { type: "string", description: "Nome fantasia" },
              setor: { type: "string", description: "Setor de atuação" },
              capital_social: { type: "number", description: "Capital social" },
              situacao: { type: "string", description: "Situação cadastral" },
              uf: { type: "string", description: "Estado" },
              municipio: { type: "string", description: "Município" }
            }
          }
        };
      case 'financial_data':
        return {
          type: "array",
          items: {
            type: "object",
            properties: {
              company_name: { type: "string" },
              period: { type: "string" },
              revenue: { type: "number" },
              net_income: { type: "number" },
              ebitda: { type: "number" },
              total_assets: { type: "number" },
              total_liabilities: { type: "number" },
              equity: { type: "number" }
            }
          }
        };
      case 'contacts':
        return {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              email: { type: "string" },
              phone: { type: "string" },
              company: { type: "string" },
              position: { type: "string" },
              linkedin: { type: "string" }
            }
          }
        };
      case 'custom':
        try {
          return JSON.parse(custom);
        } catch {
          return { type: "object", properties: {} };
        }
      case 'auto':
      default:
        return {
          type: "object",
          properties: {
            extracted_data: { type: "array", items: { type: "object" } },
            summary: { type: "string" },
            data_type: { type: "string" },
            row_count: { type: "number" }
          }
        };
    }
  };

  const handleFileSelect = async (e, allowedMimeTypes) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsUploading(true);
    setExtractedData(null);
    setProcessingResults(null);
    
    try {
      await uploadFileMutation.mutateAsync(file);
    } finally {
      setIsUploading(false);
    }
  };

  const handleStructuredFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Por favor, envie um arquivo CSV ou XLSX');
      return;
    }

    setFileName(file.name);
    setIsUploading(true);
    await uploadFileMutation.mutateAsync(file);
    setIsUploading(false);
  };

  const downloadErrorReport = () => {
    if (!processingResults?.errors) return;

    const csv = [
      ['Row', 'CNPJ', 'Company Name', 'Error'],
      ...processingResults.errors.map(e => [
        e.row,
        e.data?.cnpj || '',
        e.data?.razao_social || '',
        e.error
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'processing_errors.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Upload className="w-8 h-8 text-blue-400" />
          Batch Ingestion
          <Badge className="bg-cyan-500/20 text-cyan-400">Multi-formato</Badge>
        </h1>
        <p className="text-slate-400 mt-1">
          Extraia dados estruturados e não-estruturados de diversos tipos de arquivos
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/5">
          <TabsTrigger value="structured" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Dados Estruturados (CSV/Excel)
          </TabsTrigger>
          <TabsTrigger value="unstructured" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Brain className="w-4 h-4 mr-2" />
            Extração IA (PDF/Imagem/Texto)
          </TabsTrigger>
        </TabsList>

        {/* Structured Data Tab */}
        <TabsContent value="structured" className="mt-6 space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Upload de Arquivo Estruturado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-white/20 rounded-lg p-12 text-center">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleStructuredFileSelect}
                  className="hidden"
                  id="structured-file-upload"
                  disabled={isUploading || processFileMutation.isPending}
                />
                <label
                  htmlFor="structured-file-upload"
                  className="cursor-pointer flex flex-col items-center gap-4"
                >
                  {isUploading ? (
                    <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="w-12 h-12 text-green-400" />
                  )}
                  <div>
                    <p className="text-white font-medium mb-1">
                      {uploadedFileUrl && activeTab === 'structured' ? `Arquivo: ${fileName}` : 'Clique para enviar ou arraste'}
                    </p>
                    <p className="text-sm text-slate-400">CSV ou XLSX (máx 10MB)</p>
                  </div>
                </label>
              </div>

              {uploadedFileUrl && activeTab === 'structured' && (
                <div className="mt-4 flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-white">Arquivo pronto para processamento</span>
                  </div>
                  <Button
                    onClick={() => processFileMutation.mutate()}
                    disabled={processFileMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {processFileMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Database className="w-4 h-4 mr-2" />
                        Processar Dados CVM
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instructions for Structured */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-sm">Formato Esperado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-sm mb-3">Seu arquivo CSV/XLSX deve conter estas colunas:</p>
              <div className="bg-slate-900/50 rounded-lg p-4 font-mono text-xs text-slate-300 space-y-1">
                <p><span className="text-blue-400">cnpj</span> (obrigatório) - CNPJ da empresa</p>
                <p><span className="text-blue-400">razao_social</span> (obrigatório) - Nome legal</p>
                <p><span className="text-slate-500">nome_fantasia</span> - Nome fantasia</p>
                <p><span className="text-slate-500">setor</span> - Setor de atuação</p>
                <p><span className="text-slate-500">capital_social</span> - Capital social</p>
                <p><span className="text-slate-500">data_registro</span> - Data de registro</p>
                <p><span className="text-slate-500">situacao</span> - Situação</p>
                <p><span className="text-slate-500">uf</span> - Estado</p>
                <p><span className="text-slate-500">municipio</span> - Cidade</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Unstructured Data Tab */}
        <TabsContent value="unstructured" className="mt-6 space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Extração Inteligente com IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload */}
              <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls,.pdf,.png,.jpg,.jpeg,.webp,.json,.txt,.md,.doc,.docx"
                  onChange={(e) => handleFileSelect(e)}
                  className="hidden"
                  id="unstructured-file-upload"
                  disabled={isUploading || extractDataMutation.isPending}
                />
                <label
                  htmlFor="unstructured-file-upload"
                  className="cursor-pointer flex flex-col items-center gap-4"
                >
                  {isUploading ? (
                    <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
                  ) : (
                    <Brain className="w-12 h-12 text-purple-400" />
                  )}
                  <div>
                    <p className="text-white font-medium mb-1">
                      {uploadedFileUrl && activeTab === 'unstructured' ? `Arquivo: ${fileName}` : 'Clique para enviar qualquer arquivo'}
                    </p>
                    <p className="text-sm text-slate-400">PDF, Imagem, CSV, Excel, JSON, Texto</p>
                  </div>
                </label>
              </div>

              {/* Extraction Mode Selection */}
              {uploadedFileUrl && activeTab === 'unstructured' && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-slate-300">Modo de Extração</Label>
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-2">
                      {EXTRACTION_MODES.map(mode => {
                        const Icon = mode.icon;
                        return (
                          <div
                            key={mode.value}
                            onClick={() => setExtractionMode(mode.value)}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              extractionMode === mode.value
                                ? 'bg-purple-500/20 border-purple-500/50'
                                : 'bg-white/5 border-white/10 hover:border-white/20'
                            }`}
                          >
                            <Icon className="w-5 h-5 text-purple-400 mb-2" />
                            <p className="text-sm text-white font-medium">{mode.label}</p>
                            <p className="text-xs text-slate-500 mt-1">{mode.description}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {extractionMode === 'custom' && (
                    <div>
                      <Label className="text-slate-300">Schema JSON Customizado</Label>
                      <textarea
                        value={customSchema}
                        onChange={(e) => setCustomSchema(e.target.value)}
                        placeholder='{"type": "object", "properties": {...}}'
                        className="w-full mt-2 p-3 bg-slate-900/50 border border-white/10 rounded-lg text-white font-mono text-sm h-32"
                      />
                    </div>
                  )}

                  <Button
                    onClick={() => extractDataMutation.mutate()}
                    disabled={extractDataMutation.isPending}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    {extractDataMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Extraindo dados com IA...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Extrair Dados
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Extracted Data Preview */}
          {extractedData && (
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Dados Extraídos
                  <Badge className="bg-green-500/20 text-green-400">
                    {Array.isArray(extractedData) ? `${extractedData.length} registros` : 'Objeto'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900/50 rounded-lg p-4 max-h-96 overflow-auto">
                  <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap">
                    {JSON.stringify(extractedData, null, 2)}
                  </pre>
                </div>
                <div className="flex gap-3 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const blob = new Blob([JSON.stringify(extractedData, null, 2)], { type: 'application/json' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'extracted_data.json';
                      a.click();
                      window.URL.revokeObjectURL(url);
                    }}
                    className="bg-white/5 border-white/10 text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download JSON
                  </Button>
                  {Array.isArray(extractedData) && extractedData.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        const headers = Object.keys(extractedData[0]);
                        const csv = [
                          headers.join(','),
                          ...extractedData.map(row => 
                            headers.map(h => JSON.stringify(row[h] ?? '')).join(',')
                          )
                        ].join('\n');
                        const blob = new Blob([csv], { type: 'text/csv' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'extracted_data.csv';
                        a.click();
                        window.URL.revokeObjectURL(url);
                      }}
                      className="bg-white/5 border-white/10 text-white"
                    >
                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                      Download CSV
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Supported Formats */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-sm">Formatos Suportados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {Object.entries(FILE_TYPES).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <div key={key} className="flex items-center gap-2 p-3 bg-slate-900/50 rounded-lg">
                      <Icon className={`w-5 h-5 ${config.color}`} />
                      <span className="text-sm text-slate-300">{config.label}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Results Section for Structured Data */}
      {processingResults && activeTab === 'structured' && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Resultados do Processamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-white">{processingResults.total}</p>
                <p className="text-sm text-slate-400 mt-1">Total</p>
              </div>
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-400">{processingResults.success}</p>
                <p className="text-sm text-slate-400 mt-1">Sucesso</p>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-purple-400">{processingResults.created}</p>
                <p className="text-sm text-slate-400 mt-1">Criados</p>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-orange-400">{processingResults.updated}</p>
                <p className="text-sm text-slate-400 mt-1">Atualizados</p>
              </div>
            </div>

            {processingResults.errors?.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-white font-medium">
                      {processingResults.failed} erros encontrados
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadErrorReport}
                    className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar Relatório de Erros
                  </Button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {processingResults.errors.slice(0, 5).map((error, idx) => (
                    <div key={idx} className="bg-white/5 rounded p-2 text-sm">
                      <span className="text-red-400">Linha {error.row}:</span>{' '}
                      <span className="text-slate-300">{error.error}</span>
                    </div>
                  ))}
                  {processingResults.errors.length > 5 && (
                    <p className="text-xs text-slate-400 text-center pt-2">
                      +{processingResults.errors.length - 5} erros adicionais (baixar relatório completo)
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}