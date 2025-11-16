import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Loader2, CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function BatchIngestion() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [processingResults, setProcessingResults] = useState(null);

  const uploadFileMutation = useMutation({
    mutationFn: async (file) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      return file_url;
    },
    onSuccess: (fileUrl) => {
      setUploadedFile(fileUrl);
      toast.success('File uploaded successfully');
    },
    onError: () => {
      toast.error('File upload failed');
    }
  });

  const processFileMutation = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('bulkUploadCVMData', {
        file_url: uploadedFile
      });
      return data;
    },
    onSuccess: (data) => {
      setProcessingResults(data.results);
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error('Processing failed: ' + error.message);
    }
  });

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a CSV or XLSX file');
      return;
    }

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
          Batch Ingestion - CVM Data
        </h1>
        <p className="text-slate-400 mt-1">Upload CSV or XLSX files with CVM company data</p>
      </div>

      {/* Upload Section */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Upload File</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-white/20 rounded-lg p-12 text-center">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              disabled={isUploading || processFileMutation.isPending}
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center gap-4"
            >
              {isUploading ? (
                <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
              ) : (
                <FileText className="w-12 h-12 text-slate-400" />
              )}
              <div>
                <p className="text-white font-medium mb-1">
                  {uploadedFile ? 'File uploaded' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-sm text-slate-400">CSV or XLSX (max 10MB)</p>
              </div>
            </label>
          </div>

          {uploadedFile && (
            <div className="mt-4 flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-white">File ready for processing</span>
              </div>
              <Button
                onClick={() => processFileMutation.mutate()}
                disabled={processFileMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {processFileMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Process Data
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {processingResults && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Processing Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-white">{processingResults.total}</p>
                <p className="text-sm text-slate-400 mt-1">Total Records</p>
              </div>
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-400">{processingResults.success}</p>
                <p className="text-sm text-slate-400 mt-1">Success</p>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-purple-400">{processingResults.created}</p>
                <p className="text-sm text-slate-400 mt-1">Created</p>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-orange-400">{processingResults.updated}</p>
                <p className="text-sm text-slate-400 mt-1">Updated</p>
              </div>
            </div>

            {processingResults.errors?.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-white font-medium">
                      {processingResults.failed} errors found
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadErrorReport}
                    className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Error Report
                  </Button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {processingResults.errors.slice(0, 5).map((error, idx) => (
                    <div key={idx} className="bg-white/5 rounded p-2 text-sm">
                      <span className="text-red-400">Row {error.row}:</span>{' '}
                      <span className="text-slate-300">{error.error}</span>
                    </div>
                  ))}
                  {processingResults.errors.length > 5 && (
                    <p className="text-xs text-slate-400 text-center pt-2">
                      +{processingResults.errors.length - 5} more errors (download full report)
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-sm">Expected File Format</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 text-sm mb-3">Your CSV/XLSX file should contain these columns:</p>
          <div className="bg-slate-900/50 rounded-lg p-4 font-mono text-xs text-slate-300 space-y-1">
            <p><span className="text-blue-400">cnpj</span> (required) - Company tax ID</p>
            <p><span className="text-blue-400">razao_social</span> (required) - Legal company name</p>
            <p><span className="text-slate-500">nome_fantasia</span> - Trade name</p>
            <p><span className="text-slate-500">setor</span> - Industry sector</p>
            <p><span className="text-slate-500">capital_social</span> - Share capital</p>
            <p><span className="text-slate-500">data_registro</span> - Registration date</p>
            <p><span className="text-slate-500">situacao</span> - Status</p>
            <p><span className="text-slate-500">uf</span> - State</p>
            <p><span className="text-slate-500">municipio</span> - City</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}