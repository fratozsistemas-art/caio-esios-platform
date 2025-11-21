import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  BookOpen,
  Clock,
  Eye,
  ThumbsUp,
  ThumbsDown,
  ArrowLeft,
  ChevronRight,
  Filter,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

export default function BaseConhecimento() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || "");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedArticleId, setSelectedArticleId] = useState(searchParams.get('article'));

  const categories = [
    { id: "all", label: "Todos" },
    { id: "getting_started", label: "Começando" },
    { id: "tsi_modules", label: "Módulos TSI" },
    { id: "features", label: "Funcionalidades" },
    { id: "integrations", label: "Integrações" },
    { id: "best_practices", label: "Melhores Práticas" },
    { id: "troubleshooting", label: "Troubleshooting" },
    { id: "api_docs", label: "API & Docs" }
  ];

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['help-articles', selectedCategory, searchQuery],
    queryFn: async () => {
      let query = { status: "published", is_public: true };
      if (selectedCategory !== "all") {
        query.category = selectedCategory;
      }
      const results = await base44.entities.HelpArticle.filter(query, "-view_count", 100);
      
      // Client-side search if query exists
      if (searchQuery.trim()) {
        const lower = searchQuery.toLowerCase();
        return results.filter(a => 
          a.title.toLowerCase().includes(lower) ||
          a.summary?.toLowerCase().includes(lower) ||
          a.tags?.some(t => t.toLowerCase().includes(lower))
        );
      }
      return results;
    }
  });

  const { data: selectedArticle } = useQuery({
    queryKey: ['help-article', selectedArticleId],
    queryFn: () => base44.entities.HelpArticle.filter({ id: selectedArticleId }).then(r => r[0]),
    enabled: !!selectedArticleId
  });

  const incrementViewMutation = useMutation({
    mutationFn: (articleId) => 
      base44.entities.HelpArticle.update(articleId, { 
        view_count: (selectedArticle?.view_count || 0) + 1 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['help-article', selectedArticleId]);
    }
  });

  const feedbackMutation = useMutation({
    mutationFn: ({ articleId, helpful }) => {
      const article = selectedArticle;
      return base44.entities.HelpArticle.update(articleId, {
        helpful_count: helpful ? (article.helpful_count || 0) + 1 : article.helpful_count,
        not_helpful_count: !helpful ? (article.not_helpful_count || 0) + 1 : article.not_helpful_count
      });
    },
    onSuccess: () => {
      toast.success("Obrigado pelo feedback!");
      queryClient.invalidateQueries(['help-article', selectedArticleId]);
    }
  });

  useEffect(() => {
    if (selectedArticleId && selectedArticle) {
      incrementViewMutation.mutate(selectedArticleId);
    }
  }, [selectedArticleId]);

  const handleSelectArticle = (articleId) => {
    setSelectedArticleId(articleId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#0d2847] to-[#1a1410] p-6">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setSelectedArticleId(null)}
            className="mb-6 text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Artigos
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm mb-6">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Badge className="bg-[#00D4FF]/20 text-[#00D4FF]">
                    {selectedArticle.category?.replace(/_/g, ' ')}
                  </Badge>
                  {selectedArticle.subcategory && (
                    <Badge variant="outline" className="border-white/20 text-slate-300">
                      {selectedArticle.subcategory}
                    </Badge>
                  )}
                </div>

                <h1 className="text-4xl font-bold text-white mb-4">
                  {selectedArticle.title}
                </h1>

                <div className="flex items-center gap-6 text-sm text-slate-400 mb-8">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{selectedArticle.estimated_reading_time || 5} min de leitura</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>{selectedArticle.view_count || 0} visualizações</span>
                  </div>
                </div>

                {selectedArticle.video_url && (
                  <div className="mb-8 rounded-lg overflow-hidden aspect-video bg-black/50">
                    <iframe
                      src={selectedArticle.video_url}
                      className="w-full h-full"
                      allowFullScreen
                      title={selectedArticle.title}
                    />
                  </div>
                )}

                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown>{selectedArticle.content}</ReactMarkdown>
                </div>

                {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-white/10">
                    {selectedArticle.tags.map((tag, i) => (
                      <Badge key={i} variant="outline" className="border-white/20 text-slate-300">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Feedback */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm mb-6">
              <CardContent className="p-6">
                <p className="text-white mb-4">Este artigo foi útil?</p>
                <div className="flex gap-4">
                  <Button
                    onClick={() => feedbackMutation.mutate({ articleId: selectedArticle.id, helpful: true })}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Sim ({selectedArticle.helpful_count || 0})
                  </Button>
                  <Button
                    onClick={() => feedbackMutation.mutate({ articleId: selectedArticle.id, helpful: false })}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <ThumbsDown className="w-4 h-4 mr-2" />
                    Não ({selectedArticle.not_helpful_count || 0})
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Related Articles */}
            {selectedArticle.related_articles && selectedArticle.related_articles.length > 0 && (
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Artigos Relacionados</h3>
                  <div className="space-y-3">
                    {selectedArticle.related_articles.slice(0, 3).map((relId, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                        onClick={() => handleSelectArticle(relId)}
                      >
                        <BookOpen className="w-4 h-4 text-[#00D4FF]" />
                        <span className="text-slate-300 flex-1">Related Article {i + 1}</span>
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#0d2847] to-[#1a1410] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Base de Conhecimento</h1>
            <p className="text-slate-400">
              Documentação completa sobre módulos TSI, funcionalidades e casos de uso
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate(createPageUrl('CentralAjuda'))}
            className="border-white/20 text-white hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Buscar artigos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
                className={selectedCategory === cat.id
                  ? "bg-[#00D4FF] text-white hover:bg-[#00E5FF]"
                  : "border-white/20 text-slate-300 hover:bg-white/10"
                }
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-slate-400">Carregando artigos...</div>
        ) : articles.length === 0 ? (
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Nenhum artigo encontrado</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {articles.map((article, i) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card
                    onClick={() => handleSelectArticle(article.id)}
                    className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all cursor-pointer h-full"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3 mb-3">
                        <BookOpen className="w-5 h-5 text-[#00D4FF] flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <Badge className="bg-[#00D4FF]/20 text-[#00D4FF] text-xs mb-2">
                            {article.category?.replace(/_/g, ' ')}
                          </Badge>
                          <h3 className="font-bold text-white mb-2 line-clamp-2">
                            {article.title}
                          </h3>
                          <p className="text-sm text-slate-400 line-clamp-3">
                            {article.summary}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500 pt-3 border-t border-white/5">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {article.view_count || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {article.estimated_reading_time || 5} min
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}