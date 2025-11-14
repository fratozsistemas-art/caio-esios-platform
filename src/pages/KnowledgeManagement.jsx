import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Upload, FileText, Loader2, CheckCircle, XCircle, 
  Search, Tag, Eye, Trash2, BookOpen,
  TrendingUp, RefreshCw, BarChart3, Calendar, User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SecureFileUpload from "@/components/ui/SecureFileUpload";
import { toast } from "sonner";
import { format } from "date-fns";

export default function KnowledgeManagement() {
  const queryClient = useQueryClient();
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedSource, setSelectedSource] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // New source form state
  const [newSource, setNewSource] = useState({
    title: "",
    description: "",
    category: "strategy_document",
    tags: "",
    author: "",
    publication_date: "",
    access_level: "private"
  });

  const { data: sources = [], isLoading } = useQuery({
    queryKey: ['knowledgeSources'],
    queryFn: () => base44.entities.KnowledgeSource.list('-created_date'),
    initialData: [],
  });

  const createSourceMutation = useMutation({
    mutationFn: async (data) => base44.entities.KnowledgeSource.create(data),
    onSuccess: (newSource) => {
      queryClient.invalidateQueries({ queryKey: ['knowledgeSources'] });
      // Start indexing automatically
      indexSourceMutation.mutate({ knowledge_source_id: newSource.id });
    },
  });

  const indexSourceMutation = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('indexKnowledgeSource', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledgeSources'] });
      toast.success('✅ Indexação iniciada! O documento estará disponível em breve.');
    },
  });

  const deleteSourceMutation = useMutation({
    mutationFn: (id) => base44.entities.KnowledgeSource.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledgeSources'] });
      toast.success('✅ Documento removido da base de conhecimento');
    },
  });

  const categories = [
    { value: "strategy_document", label: "📋 Strategy Document", color: "blue" },
    { value: "market_research", label: "📊 Market Research", color: "green" },
    { value: "competitive_analysis", label: "🎯 Competitive Analysis", color: "red" },
    { value: "financial_report", label: "💰 Financial Report", color: "yellow" },
    { value: "technical_documentation", label: "🔧 Technical Docs", color: "purple" },
    { value: "case_study", label: "📚 Case Study", color: "pink" },
    { value: "industry_report", label: "🏭 Industry Report", color: "indigo" },
    { value: "internal_memo", label: "📝 Internal Memo", color: "gray" },
    { value: "meeting_notes", label: "📋 Meeting Notes", color: "slate" },
    { value: "product_specs", label: "🎨 Product Specs", color: "cyan" },
    { value: "customer_insights", label: "💡 Customer Insights", color: "orange" },
    { value: "regulatory_document", label: "⚖️ Regulatory Doc", color: "red" },
    { value: "other", label: "📄 Other", color: "gray" }
  ];

  const statusConfig = {
    pending: { icon: Loader2, color: "text-gray-400", bg: "bg-gray-500/20", text: "Aguardando", spin: true },
    processing: { icon: Loader2, color: "text-blue-400", bg: "bg-blue-500/20", text: "Processando", spin: true },
    indexed: { icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/20", text: "Indexado" },
    failed: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/20", text: "Falhou" }
  };

  const handleFileUpload = async (uploadedFiles) => {
    for (const { name, url, type, size } of uploadedFiles) {
      const fileTypeMap = {
        'application/pdf': 'pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        'text/plain': 'txt',
        'text/markdown': 'md',
        'application/vnd.ms-excel': 'xlsx',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
        'text/csv': 'csv'
      };

      await createSourceMutation.mutateAsync({
        ...newSource,
        title: newSource.title || name,
        file_url: url,
        file_name: name,
        file_type: fileTypeMap[type] || 'other',
        file_size_bytes: size,
        tags: newSource.tags.split(',').map(t => t.trim()).filter(Boolean),
        indexing_status: 'pending'
      });
    }

    setShowUploadDialog(false);
    setNewSource({
      title: "",
      description: "",
      category: "strategy_document",
      tags: "",
      author: "",
      publication_date: "",
      access_level: "private"
    });
  };

  const filteredSources = sources.filter(source => {
    const matchesSearch = !searchQuery || 
      source.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = filterCategory === "all" || source.category === filterCategory;
    const matchesStatus = filterStatus === "all" || source.indexing_status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const stats = {
    total: sources.length,
    indexed: sources.filter(s => s.indexing_status === 'indexed').length,
    processing: sources.filter(s => s.indexing_status === 'processing').length,
    totalUsage: sources.reduce((sum, s) => sum + (s.usage_count || 0), 0)
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <BookOpen className="w-10 h-10 text-blue-400" />
            Knowledge Management
          </h1>
          <p className="text-slate-400">
            Upload and manage documents for CAIO to reference and cite
          </p>
        </div>
        <Button
          onClick={() => setShowUploadDialog(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Total Documents</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
              <FileText className="w-10 h-10 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Indexed</p>
                <p className="text-3xl font-bold text-green-400">{stats.indexed}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Processing</p>
                <p className="text-3xl font-bold text-blue-400">{stats.processing}</p>
              </div>
              <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Total Citations</p>
                <p className="text-3xl font-bold text-purple-400">{stats.totalUsage}</p>
              </div>
              <BarChart3 className="w-10 h-10 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents, tags..."
                className="pl-10 bg-white/5 border-white/10 text-white"
              />
            </div>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="indexed">Indexed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <div className="grid gap-4">
        <AnimatePresence>
          {filteredSources.map((source, idx) => {
            const category = categories.find(c => c.value === source.category);
            const status = statusConfig[source.indexing_status] || statusConfig.pending;
            const StatusIcon = status.icon;

            return (
              <motion.div
                key={source.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      {/* Left: Document Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-6 h-6 text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-white mb-1 truncate">
                              {source.title}
                            </h3>
                            {source.description && (
                              <p className="text-sm text-slate-400 line-clamp-2 mb-2">
                                {source.description}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-2">
                              <Badge className={`bg-${category?.color}-500/20 text-${category?.color}-400 border-${category?.color}-500/30`}>
                                {category?.label || source.category}
                              </Badge>
                              <Badge className={`${status.bg} ${status.color} flex items-center gap-1`}>
                                <StatusIcon className={`w-3 h-3 ${status.spin ? 'animate-spin' : ''}`} />
                                {status.text}
                              </Badge>
                              {source.tags?.map(tag => (
                                <Badge key={tag} variant="outline" className="border-white/20 text-slate-300">
                                  <Tag className="w-3 h-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Metadata */}
                        <div className="flex flex-wrap gap-4 text-xs text-slate-400 ml-15">
                          <div className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {source.file_name}
                          </div>
                          {source.author && (
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {source.author}
                            </div>
                          )}
                          {source.usage_count > 0 && (
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              {source.usage_count} citations
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(source.created_date), 'MMM d, yyyy')}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex gap-2">
                        {source.indexing_status === 'indexed' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedSource(source);
                              setShowDetailDialog(true);
                            }}
                            className="text-slate-400 hover:text-white hover:bg-white/10"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        {source.indexing_status === 'failed' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => indexSourceMutation.mutate({ knowledge_source_id: source.id })}
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteSourceMutation.mutate(source.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-2xl bg-slate-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Upload Knowledge Source</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Title</label>
              <Input
                value={newSource.title}
                onChange={(e) => setNewSource({...newSource, title: e.target.value})}
                placeholder="Document title"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">Description</label>
              <Textarea
                value={newSource.description}
                onChange={(e) => setNewSource({...newSource, description: e.target.value})}
                placeholder="Brief description of the content"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Category</label>
                <Select value={newSource.category} onValueChange={(val) => setNewSource({...newSource, category: val})}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">Access Level</label>
                <Select value={newSource.access_level} onValueChange={(val) => setNewSource({...newSource, access_level: val})}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">🔒 Private (Only me)</SelectItem>
                    <SelectItem value="team">👥 Team</SelectItem>
                    <SelectItem value="organization">🏢 Organization</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Author (optional)</label>
                <Input
                  value={newSource.author}
                  onChange={(e) => setNewSource({...newSource, author: e.target.value})}
                  placeholder="Document author"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">Publication Date (optional)</label>
                <Input
                  type="date"
                  value={newSource.publication_date}
                  onChange={(e) => setNewSource({...newSource, publication_date: e.target.value})}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">Tags (comma-separated)</label>
              <Input
                value={newSource.tags}
                onChange={(e) => setNewSource({...newSource, tags: e.target.value})}
                placeholder="fintech, strategy, 2024"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <SecureFileUpload
              accept=".pdf,.docx,.txt,.md,.xlsx,.pptx,.csv"
              maxSize={50 * 1024 * 1024} // 50MB
              onUpload={handleFileUpload}
              onError={(error) => toast.error(`Upload error: ${error.message}`)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-white/10">
          {selectedSource && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white text-2xl">{selectedSource.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 text-white">
                {selectedSource.content_summary && (
                  <div>
                    <h3 className="text-lg font-semibold text-blue-400 mb-2">📄 Summary</h3>
                    <p className="text-slate-300">{selectedSource.content_summary}</p>
                  </div>
                )}

                {selectedSource.key_topics && selectedSource.key_topics.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-green-400 mb-2">🏷️ Key Topics</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedSource.key_topics.map((topic, idx) => (
                        <Badge key={idx} className="bg-green-500/20 text-green-400">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedSource.entities_mentioned && selectedSource.entities_mentioned.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-purple-400 mb-2">🏢 Entities Mentioned</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedSource.entities_mentioned.map((entity, idx) => (
                        <Badge key={idx} variant="outline" className="border-purple-500/30 text-purple-400">
                          {entity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedSource.quality_score && (
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-400 mb-2">⭐ Quality Score</h3>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-white/10 rounded-full h-4 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-yellow-500 to-green-500 h-full transition-all duration-300"
                          style={{ width: `${selectedSource.quality_score}%` }}
                        />
                      </div>
                      <span className="text-2xl font-bold text-yellow-400">{selectedSource.quality_score}/100</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}