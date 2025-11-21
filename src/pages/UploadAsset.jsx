import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Copy, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function UploadAsset() {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedUrl(file_url);
      setFileName(file.name);
      toast.success("Arquivo enviado com sucesso!");
    } catch (error) {
      toast.error("Erro ao fazer upload");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(uploadedUrl);
    setCopied(true);
    toast.success("URL copiada!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-cyan-950 to-yellow-950 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Upload de Arquivos</h1>
        
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Enviar arquivos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-lg p-8 hover:border-cyan-500/50 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*,image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
                onChange={handleUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="bg-gradient-to-r from-cyan-500 to-yellow-500 hover:from-cyan-600 hover:to-yellow-600"
                size="lg"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    Selecionar Arquivo
                  </>
                )}
              </Button>
              <p className="text-slate-400 text-sm mt-4">
                Vídeos, imagens, PDFs, documentos e mais
              </p>
            </div>

            {uploadedUrl && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Upload concluído!</span>
                </div>

                {fileName && (
                  <div className="bg-slate-900/50 rounded-lg p-3">
                    <p className="text-slate-400 text-sm">
                      <strong>Arquivo:</strong> {fileName}
                    </p>
                  </div>
                )}

                <div className="bg-slate-900/50 rounded-lg p-4 space-y-3">
                  <p className="text-slate-400 text-sm font-medium">URL do arquivo:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-black/30 px-4 py-2 rounded text-cyan-400 text-sm overflow-x-auto">
                      {uploadedUrl}
                    </code>
                    <Button
                      onClick={copyToClipboard}
                      variant="outline"
                      size="icon"
                      className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                    >
                      {copied ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <p className="text-yellow-400 text-sm">
                    <strong>Próximo passo:</strong> Copie a URL e use onde precisar
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}