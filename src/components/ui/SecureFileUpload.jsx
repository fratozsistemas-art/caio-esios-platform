import { useState, useRef } from 'react';
import { Upload, X, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';

export function SecureFileUpload({
  accept = '.jpg,.jpeg,.png,.pdf,.csv,.xlsx',
  maxSize = 10 * 1024 * 1024,
  multiple = false,
  onUpload,
  onError,
  className = ''
}) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    const errors = [];
    
    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size exceeds ${formatFileSize(maxSize)}`);
    }

    // Check file type
    const allowedExtensions = accept.split(',').map(ext => ext.trim().toLowerCase());
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      errors.push(`File type ${fileExtension} not allowed`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    const newErrors = [];
    const validFiles = [];

    selectedFiles.forEach(file => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push({
          file,
          id: Math.random().toString(36).substr(2, 9),
          progress: 0,
          status: 'pending'
        });
      } else {
        newErrors.push(...validation.errors.map(err => `${file.name}: ${err}`));
      }
    });

    setErrors(newErrors);

    if (validFiles.length > 0) {
      if (multiple) {
        setFiles(prev => [...prev, ...validFiles]);
      } else {
        setFiles(validFiles);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    setUploading(true);
    const uploadedUrls = [];

    for (const fileData of pendingFiles) {
      try {
        setFiles(prev => prev.map(f => 
          f.id === fileData.id ? { ...f, status: 'uploading' } : f
        ));

        const { file_url } = await base44.integrations.Core.UploadFile({ 
          file: fileData.file 
        });

        uploadedUrls.push({
          name: fileData.file.name,
          url: file_url,
          size: fileData.file.size,
          type: fileData.file.type
        });

        setFiles(prev => prev.map(f => 
          f.id === fileData.id ? { ...f, status: 'completed', url: file_url } : f
        ));

      } catch (error) {
        console.error(`Error uploading ${fileData.file.name}:`, error);
        
        setFiles(prev => prev.map(f => 
          f.id === fileData.id ? { ...f, status: 'error', error: error.message } : f
        ));

        if (onError) {
          onError(error, fileData.file);
        }
      }
    }

    setUploading(false);

    if (onUpload && uploadedUrls.length > 0) {
      onUpload(uploadedUrls);
    }
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card className="bg-white/5 border-white/10 border-2 border-dashed hover:border-blue-500/50 transition-colors cursor-pointer">
        <CardContent className="p-8">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileSelect}
            className="hidden"
            id="secure-file-upload"
          />
          <label 
            htmlFor="secure-file-upload"
            className="cursor-pointer flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Upload className="w-8 h-8 text-blue-400" />
            </div>
            <div className="text-center">
              <p className="text-white font-medium mb-1">
                Click to upload or drag files
              </p>
              <p className="text-sm text-slate-400">
                Allowed types: {accept}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Max size: {formatFileSize(maxSize)}
              </p>
            </div>
          </label>
        </CardContent>
      </Card>

      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, index) => (
            <div key={index} className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map(fileData => (
            <Card key={fileData.id} className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {fileData.file.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatFileSize(fileData.file.size)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {fileData.status === 'pending' && (
                      <span className="text-xs text-slate-400">Pending</span>
                    )}
                    {fileData.status === 'uploading' && (
                      <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                    )}
                    {fileData.status === 'completed' && (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    )}
                    {fileData.status === 'error' && (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    )}
                    
                    {fileData.status !== 'uploading' && (
                      <button
                        onClick={() => removeFile(fileData.id)}
                        className="text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {files.some(f => f.status === 'pending') && (
        <Button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full bg-blue-500 hover:bg-blue-600"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload {files.filter(f => f.status === 'pending').length} file(s)
            </>
          )}
        </Button>
      )}
    </div>
  );
}

export default SecureFileUpload;