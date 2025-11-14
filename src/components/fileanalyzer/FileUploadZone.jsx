import React, { useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export default function FileUploadZone({ onFileUpload, isUploading, uploadProgress }) {
  const [dragActive, setDragActive] = React.useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFileUpload(files);
    }
  }, [onFileUpload]);

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      onFileUpload(files);
    }
  };

  return (
    <Card
      className={cn(
        "bg-white/5 border-white/10 backdrop-blur-sm transition-all duration-300",
        dragActive && "border-blue-500 bg-blue-500/10",
        isUploading && "opacity-75"
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <CardContent className="p-12">
        <div className="text-center">
          {isUploading ? (
            <div className="space-y-4">
              <Loader2 className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-spin" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Processando arquivo...
              </h3>
              <Progress value={uploadProgress} className="h-2 mb-4" />
              <p className="text-sm text-slate-400">
                {uploadProgress < 40 && "Fazendo upload..."}
                {uploadProgress >= 40 && uploadProgress < 60 && "Detectando tipo de arquivo..."}
                {uploadProgress >= 60 && uploadProgress < 80 && "Extraindo dados..."}
                {uploadProgress >= 80 && "Gerando insights e ações..."}
              </p>
            </div>
          ) : (
            <>
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-6">
                <Upload className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-2">
                Arraste arquivos aqui
              </h3>
              <p className="text-slate-400 mb-6">
                ou clique para selecionar do seu computador
              </p>
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileInput}
                accept=".pdf,.xlsx,.xls,.csv,.pptx,.json"
                disabled={isUploading}
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium cursor-pointer hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
              >
                <FileText className="w-5 h-5" />
                Selecionar Arquivo
              </label>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {['Excel', 'PDF', 'CSV', 'PowerPoint'].map(type => (
                  <span
                    key={type}
                    className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-sm"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}