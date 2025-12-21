import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Folder, FileText, Image, Package, Download, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function ArtifactExplorer({ run }) {
  const [currentPath, setCurrentPath] = useState("");

  const { data: artifacts = [], isLoading } = useQuery({
    queryKey: ['mlflow_artifacts', run?.info?.run_id, currentPath],
    queryFn: async () => {
      if (!run) return [];
      const { data } = await base44.functions.invoke('mlflowClient', {
        action: 'listArtifacts',
        data: {
          run_id: run.info.run_id,
          path: currentPath
        }
      });
      return data.artifacts;
    },
    enabled: !!run
  });

  const getFileIcon = (isDir, path) => {
    if (isDir) return <Folder className="w-5 h-5 text-yellow-400" />;
    
    const ext = path.split('.').pop().toLowerCase();
    if (['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(ext)) {
      return <Image className="w-5 h-5 text-cyan-400" />;
    }
    if (['txt', 'json', 'csv', 'md'].includes(ext)) {
      return <FileText className="w-5 h-5 text-green-400" />;
    }
    return <Package className="w-5 h-5 text-slate-400" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (!run) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-12 text-center">
          <Package className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400">Select a run to explore artifacts</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Package className="w-5 h-5 text-cyan-400" />
            Artifacts - Run {run.info.run_name || run.info.run_id.substring(0, 8)}
          </span>
          {currentPath && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const parts = currentPath.split('/');
                parts.pop();
                setCurrentPath(parts.join('/'));
              }}
              className="border-white/20 text-slate-300 hover:bg-white/10"
            >
              Back
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-12">
            <Package className="w-8 h-8 text-cyan-400 animate-pulse mx-auto mb-2" />
            <p className="text-slate-400">Loading artifacts...</p>
          </div>
        ) : artifacts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">No artifacts found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {artifacts.map((artifact, idx) => (
              <motion.div
                key={artifact.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
              >
                <div
                  className={`flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all ${artifact.is_dir ? 'cursor-pointer' : ''}`}
                  onClick={() => {
                    if (artifact.is_dir) {
                      setCurrentPath(artifact.path);
                    }
                  }}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {getFileIcon(artifact.is_dir, artifact.path)}
                    <div className="flex-1">
                      <p className="text-white font-medium">{artifact.path.split('/').pop()}</p>
                      {!artifact.is_dir && (
                        <p className="text-xs text-slate-400">{formatFileSize(artifact.file_size)}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!artifact.is_dir && (
                      <Badge variant="outline" className="border-white/20 text-slate-400 text-xs">
                        {artifact.path.split('.').pop().toUpperCase()}
                      </Badge>
                    )}
                    {artifact.is_dir ? (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-cyan-400 hover:bg-cyan-500/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          // In a real implementation, this would download the artifact
                          console.log('Download artifact:', artifact.path);
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}