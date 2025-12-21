import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function CSVImportPanel() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please select a valid CSV file');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      // Upload file first
      const { data: uploadData } = await base44.integrations.Core.UploadFile({ file });
      
      // Import CSV data
      const { data: importResult } = await base44.functions.invoke('importCSVData', {
        file_url: uploadData.file_url
      });

      setResult(importResult);
      setFile(null);
    } catch (err) {
      setError(err.message || 'Failed to import CSV');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-green-400" />
          CSV Data Import
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
          <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <Input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            id="csv-upload"
          />
          <label htmlFor="csv-upload">
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
              onClick={() => document.getElementById('csv-upload').click()}
            >
              Select CSV File
            </Button>
          </label>
          {file && (
            <div className="mt-3">
              <p className="text-sm text-white font-medium">{file.name}</p>
              <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(2)} KB</p>
            </div>
          )}
        </div>

        {file && !result && (
          <Button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full bg-green-500 hover:bg-green-600"
          >
            {uploading ? 'Importing...' : 'Import Data'}
          </Button>
        )}

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
          >
            <div className="flex items-start gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <div>
                <p className="text-white font-semibold">Import Successful</p>
                <p className="text-sm text-slate-400">
                  Imported {result.records_imported} records
                </p>
              </div>
            </div>

            {result.preview && result.preview.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-slate-500 mb-2">Preview (first 5 rows):</p>
                <div className="bg-black/30 rounded p-2 overflow-x-auto">
                  <pre className="text-xs text-slate-300">
                    {JSON.stringify(result.preview.slice(0, 5), null, 2)}
                  </pre>
                </div>
              </div>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={() => setResult(null)}
              className="mt-3 border-white/20 text-slate-400"
            >
              Import Another File
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}