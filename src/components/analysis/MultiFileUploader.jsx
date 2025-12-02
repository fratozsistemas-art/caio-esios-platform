import React, { useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, Loader2, X, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function MultiFileUploader({ onFilesUploaded, acceptedTypes = [".csv", ".xlsx", ".xls"] }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState([]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const validateFile = (file) => {
    const extension = `.${file.name.split('.').pop().toLowerCase()}`;
    if (!acceptedTypes.includes(extension)) {
      return { valid: false, error: `Tipo não suportado: ${extension}` };
    }
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      return { valid: false, error: "Arquivo muito grande (máx. 50MB)" };
    }
    return { valid: true };
  };

  const uploadFiles = async (files) => {
    const validFiles = [];
    const uploadingState = [];

    for (const file of files) {
      const validation = validateFile(file);
      if (validation.valid) {
        const id = `${file.name}-${Date.now()}`;
        validFiles.push({ file, id });
        uploadingState.push({ id, name: file.name, progress: 0, status: "uploading" });
      } else {
        toast.error(`${file.name}: ${validation.error}`);
      }
    }

    if (validFiles.length === 0) return;

    setUploadingFiles(uploadingState);

    const uploadedResults = [];

    for (const { file, id } of validFiles) {
      try {
        setUploadingFiles(prev => 
          prev.map(f => f.id === id ? { ...f, progress: 30 } : f)
        );

        const result = await base44.integrations.Core.UploadFile({ file });

        setUploadingFiles(prev => 
          prev.map(f => f.id === id ? { ...f, progress: 100, status: "completed" } : f)
        );

        uploadedResults.push({
          id,
          name: file.name,
          url: result.file_url,
          size: file.size,
          type: file.type
        });
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        setUploadingFiles(prev => 
          prev.map(f => f.id === id ? { ...f, status: "error", error: error.message } : f)
        );
        toast.error(`Erro ao carregar ${file.name}`);
      }
    }

    // Clear uploading state after short delay
    setTimeout(() => {
      setUploadingFiles([]);
    }, 1500);

    if (uploadedResults.length > 0) {
      onFilesUploaded(uploadedResults);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      uploadFiles(files);
    }
  }, []);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      uploadFiles(files);
    }
    e.target.value = "";
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          isDragging
            ? "border-[#00D4FF] bg-[#00D4FF]/10"
            : "border-white/20 hover:border-white/40 bg-white/5"
        }`}
      >
        <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? "text-[#00D4FF]" : "text-slate-400"}`} />
        <h3 className="text-lg font-medium text-white mb-2">
          Arraste arquivos aqui
        </h3>
        <p className="text-slate-400 text-sm mb-4">
          ou clique para selecionar
        </p>
        <input
          type="file"
          multiple
          accept={acceptedTypes.join(",")}
          onChange={handleFileSelect}
          className="hidden"
          id="multi-file-input"
        />
        <label htmlFor="multi-file-input">
          <Button asChild className="bg-[#00D4FF] hover:bg-[#00E5FF] text-[#0A1628]">
            <span>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Selecionar Arquivos
            </span>
          </Button>
        </label>
        <p className="text-xs text-slate-500 mt-4">
          Formatos aceitos: CSV, Excel (.xlsx, .xls) • Máx. 50MB por arquivo
        </p>
      </div>

      {/* Upload Progress */}
      <AnimatePresence>
        {uploadingFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {uploadingFiles.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  file.status === "completed"
                    ? "bg-green-500/10 border-green-500/30"
                    : file.status === "error"
                    ? "bg-red-500/10 border-red-500/30"
                    : "bg-blue-500/10 border-blue-500/30"
                }`}
              >
                {file.status === "uploading" && (
                  <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                )}
                {file.status === "completed" && (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                )}
                {file.status === "error" && (
                  <X className="w-5 h-5 text-red-400" />
                )}
                <div className="flex-1">
                  <p className="text-sm text-white">{file.name}</p>
                  {file.status === "uploading" && (
                    <div className="h-1 bg-slate-700 rounded-full mt-1 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${file.progress}%` }}
                        className="h-full bg-blue-400"
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}