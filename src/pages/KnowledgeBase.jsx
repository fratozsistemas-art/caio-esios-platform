
import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, Search, Filter, Star, TrendingUp, Download, 
  Eye, Plus, FileText, Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function KnowledgeBase() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false); // Removed filterFramework state

  const { data: knowledgeItems = [] } = useQuery({
    queryKey: ['knowledgeBase'],
    queryFn: () => base44.entities.KnowledgeItem.list('-created_date'),
    initialData: [],
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: ({ id, isFavorite }) => 
      base44.entities.KnowledgeItem.update(id, { is_favorite: !isFavorite }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledgeBase'] });
    },
  });

  const filteredItems = knowledgeItems.filter(item => {
    const matchesSearch = !searchQuery || 
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = filterType === "all" || item.type === filterType;
    // Removed matchesFramework condition
    const matchesFavorite = !showFavoritesOnly || item.is_favorite;

    return matchesSearch && matchesType && matchesFavorite; // Updated return condition
  });

  const typeConfig = {
    strategy: { icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-500/20" },
    analysis: { icon: FileText, color: "text-purple-400", bg: "bg-purple-500/20" },
    framework: { icon: BookOpen, color: "text-green-400", bg: "bg-green-500/20" },
    playbook: { icon: FileText, color: "text-orange-400", bg: "bg-orange-500/20" },
    case_study: { icon: Star, color: "text-yellow-400", bg: "bg-yellow-500/20" }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <BookOpen className="w-10 h-10 text-blue-400" />
            Knowledge Base
          </h1>
          <p className="text-slate-400">
            Biblioteca de análises, frameworks e playbooks validados
          </p>
        </div>
        <Link to={createPageUrl("Chat")}>
          <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
            <Plus className="w-4 h-4 mr-2" />
            Nova Análise
          </Button>
        </Link>
      </div>

      {/* Search & Filters */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar análises, frameworks, tags..."
                className="bg-white/5 border-white/10 text-white pl-10"
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="strategy">Estratégias</SelectItem>
                <SelectItem value="analysis">Análises</SelectItem>
                <SelectItem value="framework">Frameworks</SelectItem>
                <SelectItem value="playbook">Playbooks</SelectItem>
                <SelectItem value="case_study">Casos de Estudo</SelectItem>
              </SelectContent>
            </Select>

            {/* Removed the Select component for framework filter */}

            <Button
              variant={showFavoritesOnly ? "default" : "outline"}
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={showFavoritesOnly 
                ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" 
                : "border-white/20 text-white"
              }
            >
              <Star className="w-4 h-4 mr-2" />
              Favoritos
            </Button>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Filter className="w-4 h-4" />
            <span>{filteredItems.length} items encontrados</span>
          </div>
        </CardContent>
      </Card>

      {/* Knowledge Items Grid */}
      {filteredItems.length === 0 ? (
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchQuery ? "Nenhum resultado encontrado" : "Knowledge Base vazia"}
            </h3>
            <p className="text-slate-400 mb-6">
              {searchQuery 
                ? "Tente ajustar os filtros ou buscar por outros termos"
                : "Comece criando análises com o CAIO para popular sua biblioteca"
              }
            </p>
            <Link to={createPageUrl("Chat")}>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/5">
                Criar Primeira Análise
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredItems.map((item) => {
              const config = typeConfig[item.type] || typeConfig.analysis;
              const Icon = config.icon;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 h-full flex flex-col">
                    <CardHeader className="border-b border-white/10">
                      <div className="flex justify-between items-start mb-2">
                        <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${config.color}`} />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleFavoriteMutation.mutate({ 
                            id: item.id, 
                            isFavorite: item.is_favorite 
                          })}
                          className="hover:bg-white/5"
                        >
                          <Star className={`w-4 h-4 ${item.is_favorite ? 'fill-yellow-400 text-yellow-400' : 'text-slate-400'}`} />
                        </Button>
                      </div>
                      <CardTitle className="text-white text-lg leading-tight">
                        {item.title}
                      </CardTitle>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {/* Removed the framework badge */}
                        {item.industry && (
                          <Badge variant="outline" className="border-white/20 text-slate-400">
                            {item.industry}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="p-6 flex-1 flex flex-col">
                      <p className="text-sm text-slate-300 mb-4 line-clamp-3">
                        {item.summary}
                      </p>

                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {item.tags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="text-xs px-2 py-1 rounded-full bg-white/5 text-slate-400">
                              {tag}
                            </span>
                          ))}
                          {item.tags.length > 3 && (
                            <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-slate-400">
                              +{item.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="mt-auto space-y-3">
                        {item.key_metrics && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">Métricas-chave</span>
                            <span className="text-green-400 font-medium">
                              {item.key_metrics}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(item.created_date).toLocaleDateString('pt-BR')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>{item.view_count || 0} views</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1 border-white/20 text-white hover:bg-white/5"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalhes
                          </Button>
                          {item.file_url && (
                            <Button
                              variant="outline"
                              size="icon"
                              className="border-white/20 text-white hover:bg-white/5"
                              onClick={() => window.open(item.file_url, '_blank')}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
