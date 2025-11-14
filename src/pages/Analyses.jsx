
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Database, Upload, CheckCircle, Clock, AlertCircle, Loader2, Eye, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AnalysisDetailModal from "@/components/analysis/AnalysisDetailModal"; // Keeping the original absolute import path
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "sonner";
import { ListSkeleton } from "@/components/ui/SkeletonLoader";

export default function Analyses() {
  const queryClient = useQueryClient();
  const [showUpload, setShowUpload] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false); // New state variable
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [analysisToDelete, setAnalysisToDelete] = useState(null);
  const [uploadData, setUploadData] = useState({
    title: "",
    type: "market",
    file: null
  });
  const [isUploading, setIsUploading] = useState(false);

  const { data: analyses = [], isLoading } = useQuery({
    queryKey: ['analyses'],
    queryFn: () => base44.entities.Analysis.list('-created_date'),
    initialData: [],
  });

  const createAnalysisMutation = useMutation({
    mutationFn: (data) => base44.entities.Analysis.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyses'] });
      setShowUpload(false);
      setUploadData({ title: "", type: "market", file: null });
      toast.success('✅ Analysis created successfully and is being processed!');
    },
    onError: (error) => {
      toast.error(`❌ Error creating analysis: ${error.message}`);
    }
  });

  const deleteAnalysisMutation = useMutation({
    mutationFn: (analysisId) => base44.entities.Analysis.delete(analysisId),
    onSuccess: (_, deletedAnalysisId) => {
      queryClient.invalidateQueries({ queryKey: ['analyses'] });
      if (selectedAnalysis?.id === deletedAnalysisId) {
        setSelectedAnalysis(null);
        setShowDetailModal(false); // Close detail modal if the selected analysis is deleted
      }
      toast.success('✅ Analysis deleted successfully');
    },
    onError: (error) => {
      toast.error(`❌ Error deleting analysis: ${error.message}`);
    }
  });

  const handleDeleteClick = (e, analysis) => {
    e.stopPropagation(); // Prevent card's onClick from firing
    setAnalysisToDelete(analysis);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (analysisToDelete) {
      try {
        await deleteAnalysisMutation.mutateAsync(analysisToDelete.id);
        setDeleteDialogOpen(false);
        setAnalysisToDelete(null);
      } catch (error) {
        // Error already handled in mutation's onError
      }
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadData(prev => ({ ...prev, file }));
    }
  };

  const handleCreateAnalysis = async () => {
    if (!uploadData.title || !uploadData.file) {
      toast.error('Title and file are required to create an analysis.');
      return;
    }

    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: uploadData.file });
      
      await createAnalysisMutation.mutateAsync({
        title: uploadData.title,
        type: uploadData.type,
        data_file_url: file_url,
        status: "queued"
      });
    } catch (error) {
      console.error("Error creating analysis:", error);
      toast.error(`❌ Error uploading file or creating analysis: ${error.message}`);
    }
    setIsUploading(false);
  };

  const handleViewAnalysis = (analysis) => {
    setSelectedAnalysis(analysis);
    setShowDetailModal(true);
  };

  const statusConfig = {
    queued: { icon: Clock, color: "text-slate-400", bg: "bg-slate-500/20", text: "Queued" },
    processing: { icon: Loader2, color: "text-blue-400", bg: "bg-blue-500/20", text: "Processing", spin: true },
    completed: { icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/20", text: "Completed" },
    failed: { icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/20", text: "Failed" }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Analyses
          </h1>
          <p className="text-slate-400">
            Upload and analyze data with advanced AI
          </p>
        </div>
        <Button
          onClick={() => setShowUpload(!showUpload)}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
        >
          <Upload className="w-4 h-4 mr-2" />
          New Analysis
        </Button>
      </div>

      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="text-white">Create New Analysis</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Title</label>
                  <Input
                    value={uploadData.title}
                    onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Analysis name"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Analysis Type</label>
                  <Select
                    value={uploadData.type}
                    onValueChange={(value) => setUploadData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="market">Market</SelectItem>
                      <SelectItem value="competitive">Competitive</SelectItem>
                      <SelectItem value="financial">Financial</SelectItem>
                      <SelectItem value="operational">Operational</SelectItem>
                      <SelectItem value="risk">Risk</SelectItem>
                      <SelectItem value="opportunity">Opportunity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Data File</label>
                  <div className="flex gap-3">
                    <Input
                      type="file"
                      onChange={handleFileUpload}
                      className="bg-white/5 border-white/10 text-white"
                      accept=".csv,.xlsx,.json,.pdf"
                    />
                  </div>
                  {uploadData.file && (
                    <p className="text-sm text-green-400 mt-2">
                      Selected file: {uploadData.file.name}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleCreateAnalysis}
                    disabled={!uploadData.title || !uploadData.file || isUploading}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Create Analysis
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowUpload(false)}
                    className="border-white/20 text-white hover:bg-white/5"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <ListSkeleton count={3} />
      ) : analyses.length === 0 ? ( // Assuming analyses is the source for filteredAnalyses if no filter logic provided
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <Database className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No analyses yet
            </h3>
            <p className="text-slate-400 mb-6">
              Upload data to start generating AI-powered analyses
            </p>
            <Button
              onClick={() => setShowUpload(true)}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/5"
            >
              Start First Analysis
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analyses.map((analysis, index) => { // Using 'analyses' as 'filteredAnalyses' as no filtering logic was provided
            const config = statusConfig[analysis.status] || statusConfig.queued;
            const StatusIcon = config.icon;
            
            return (
              <motion.div
                key={analysis.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 cursor-pointer group relative"
                  onClick={() => handleViewAnalysis(analysis)} // Updated onClick handler
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDeleteClick(e, analysis)}
                    disabled={deleteAnalysisMutation.isPending}
                    className="absolute top-4 right-4 z-10 h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>

                  <CardHeader className="border-b border-white/10">
                    <div className="flex justify-between items-start pr-10">
                      <CardTitle className="text-white text-lg group-hover:text-blue-300 transition-colors">
                        {analysis.title}
                      </CardTitle>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${config.bg} ${config.color} flex items-center gap-1`}>
                        <StatusIcon className={`w-3 h-3 ${config.spin ? 'animate-spin' : ''}`} />
                        {config.text}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Type</span>
                      <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-medium">
                        {analysis.type}
                      </span>
                    </div>
                    
                    {analysis.framework_used && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Framework</span>
                        <span className="text-sm text-white font-medium">
                          {analysis.framework_used}
                        </span>
                      </div>
                    )}

                    {analysis.confidence_score && (
                      <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        <span className="text-sm text-slate-400">Confidence</span>
                        <span className="text-lg font-semibold text-green-400">
                          {analysis.confidence_score}%
                        </span>
                      </div>
                    )}

                    <div className="pt-3 flex items-center justify-center text-sm text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="w-4 h-4 mr-2" />
                      Click to view details
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Analysis?"
        description={`Are you sure you want to delete "${analysisToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete Analysis"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        variant="danger"
      />

      {/* Analysis Detail Modal */}
      <AnalysisDetailModal
        analysis={selectedAnalysis}
        isOpen={showDetailModal} // Changed prop name from 'open' to 'isOpen'
        onClose={() => setShowDetailModal(false)} // Updated onClose handler
      />
    </div>
  );
}
