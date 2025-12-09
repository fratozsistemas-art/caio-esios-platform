import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SecureFileUpload } from "@/components/ui/SecureFileUpload";
import { Upload, FileText, Image, Video } from "lucide-react";
import { toast } from "sonner";

export default function FileUploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleUpload = (files) => {
    setUploadedFiles(prev => [...prev, ...files]);
    toast.success(`${files.length} file(s) uploaded successfully`);
  };

  const handleError = (error, file) => {
    toast.error(`Failed to upload ${file.name}: ${error.message}`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">File Upload</h1>
        <p className="text-[#94A3B8]">
          Upload images, videos, and documents for use across the platform
        </p>
      </div>

      <Card className="bg-[#1A1D29] border-[#00D4FF]/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Upload className="w-5 h-5 text-[#00D4FF]" />
            Upload Files
          </CardTitle>
          <CardDescription className="text-[#94A3B8]">
            Supported formats: Images (JPG, PNG), Videos (MP4), Documents (PDF, CSV, XLSX)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SecureFileUpload
            accept=".jpg,.jpeg,.png,.pdf,.csv,.xlsx,.mp4,.mov,.avi"
            maxSize={100 * 1024 * 1024}
            multiple={true}
            onUpload={handleUpload}
            onError={handleError}
          />
        </CardContent>
      </Card>

      {uploadedFiles.length > 0 && (
        <Card className="bg-[#1A1D29] border-[#00D4FF]/20">
          <CardHeader>
            <CardTitle className="text-white">Uploaded Files</CardTitle>
            <CardDescription className="text-[#94A3B8]">
              {uploadedFiles.length} file(s) uploaded
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {uploadedFiles.map((file, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-3 p-4 rounded-lg bg-[#0A2540]/50 border border-[#00D4FF]/10"
                >
                  {file.type?.startsWith('image/') && (
                    <Image className="w-5 h-5 text-[#00D4FF]" />
                  )}
                  {file.type?.startsWith('video/') && (
                    <Video className="w-5 h-5 text-[#8B5CF6]" />
                  )}
                  {!file.type?.startsWith('image/') && !file.type?.startsWith('video/') && (
                    <FileText className="w-5 h-5 text-[#94A3B8]" />
                  )}
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{file.name}</p>
                    <a 
                      href={file.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-[#00D4FF] hover:underline"
                    >
                      View file
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}