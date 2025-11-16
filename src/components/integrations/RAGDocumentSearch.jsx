import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, FileText, Loader2, Upload, BookOpen, ExternalLink
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function RAGDocumentSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  const searchMutation = useMutation({
    mutationFn: (searchQuery) => base44.functions.invoke('ragDocumentSearch', { 
      query: searchQuery,
      top_k: 5
    }),
    onSuccess: (response) => {
      setResults(response.data);
      if (response.data.results?.length === 0) {
        toast.info('Nenhum documento encontrado');
      }
    },
    onError: () => toast.error('Erro na busca')
  });

  const indexMutation = useMutation({
    mutationFn: (data) => base44.functions.invoke('indexDocument', data),
    onSuccess: (response) => {
      toast.success(`Documento indexado: ${response.data.chunks_created} chunks criados`);
    },
    onError: () => toast.error('Erro ao indexar documento')
  });

  const handleSearch = () => {
    if (!query.trim()) {
      toast.error('Digite uma pergunta');
      return;
    }
    searchMutation.mutate(query);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await indexMutation.mutateAsync({
        file_url,
        file_name: file.name
      });
    } catch (error) {
      toast.error('Erro no upload');
    } finally {
      setUploadingFile(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            RAG Document Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Faça uma pergunta sobre seus documentos..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
            />
            <Button
              onClick={handleSearch}
              disabled={searchMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {searchMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
              className="hidden"
              id="doc-upload"
            />
            <label htmlFor="doc-upload">
              <Button
                variant="outline"
                size="sm"
                disabled={uploadingFile || indexMutation.isPending}
                className="border-white/10 text-white hover:bg-white/10"
                asChild
              >
                <span>
                  {uploadingFile || indexMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Upload & Index Document
                </span>
              </Button>
            </label>
            <span className="text-xs text-slate-400">
              Suporta PDF, DOC, DOCX, TXT
            </span>
          </div>
        </CardContent>
      </Card>

      {results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {results.answer && (
            <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white text-base">Resposta</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-200 leading-relaxed">{results.answer}</p>
                {results.citations && results.citations.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-slate-400 mb-2">Citações:</p>
                    <div className="space-y-1">
                      {results.citations.map((citation, idx) => (
                        <div key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="text-purple-400">[{idx + 1}]</span>
                          <span>{citation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {results.relevant_documents && results.relevant_documents.length > 0 && (
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-base">Documentos Relevantes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {results.relevant_documents.map((doc, idx) => (
                  <div key={idx} className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-400" />
                        <span className="text-white font-medium">{doc.file_name}</span>
                      </div>
                      <Badge className="bg-purple-500/20 text-purple-400">
                        Score: {(doc.relevance_score * 100).toFixed(0)}%
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-300 mb-2">{doc.content.slice(0, 200)}...</p>
                    {doc.relevance_reason && (
                      <p className="text-xs text-slate-400 italic">→ {doc.relevance_reason}</p>
                    )}
                    {doc.file_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(doc.file_url, '_blank')}
                        className="mt-2 border-white/10 text-white hover:bg-white/10"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Ver Documento
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
}