import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  BookOpen,
  Video,
  MessageSquare,
  Headphones,
  ArrowRight,
  TrendingUp,
  Zap,
  Users,
  FileText,
  CheckCircle,
  PlayCircle
} from "lucide-react";
import { motion } from "framer-motion";

export default function CentralAjuda() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [popularArticles, setPopularArticles] = useState([]);

  useEffect(() => {
    // Fetch popular articles
    base44.entities.HelpArticle.filter(
      { status: "published", is_public: true },
      "-view_count",
      6
    ).then(setPopularArticles).catch(() => setPopularArticles([]));
  }, []);

  const sections = [
    {
      icon: BookOpen,
      title: "Base de Conhecimento",
      description: "Artigos detalhados sobre módulos TSI, funcionalidades e casos de uso",
      color: "#00D4FF",
      path: "BaseConhecimento",
      stats: "120+ artigos"
    },
    {
      icon: Video,
      title: "Tutoriais em Vídeo",
      description: "Guias passo a passo em vídeo para dominar a plataforma",
      color: "#FFB800",
      path: "Tutoriais",
      stats: "45+ vídeos"
    },
    {
      icon: MessageSquare,
      title: "Fórum Comunitário",
      description: "Troque experiências, dicas e aprenda com outros usuários",
      color: "#9D4EDD",
      path: "Forum",
      stats: "2.5K+ discussões"
    },
    {
      icon: Headphones,
      title: "Suporte Técnico",
      description: "Atendimento dedicado para clientes com planos pagos",
      color: "#00C8FF",
      path: "Suporte",
      stats: "Resposta em 24h"
    }
  ];

  const categories = [
    { name: "Começando", icon: Zap, count: 12 },
    { name: "Módulos TSI", icon: BookOpen, count: 33 },
    { name: "Integrações", icon: Users, count: 18 },
    { name: "Melhores Práticas", icon: TrendingUp, count: 24 },
    { name: "API & Webhooks", icon: FileText, count: 15 },
    { name: "Troubleshooting", icon: CheckCircle, count: 22 }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(createPageUrl('BaseConhecimento') + `?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#0d2847] to-[#1a1410] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Como Podemos Ajudar?
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Encontre respostas, tutoriais e suporte para aproveitar ao máximo o CAIO·AI
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Buscar na Central de Ajuda..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-6 bg-white/5 border-white/10 text-white placeholder:text-slate-500 text-lg"
              />
              <Button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[#00D4FF] to-[#FFB800]"
              >
                Buscar
              </Button>
            </div>
          </form>

          {/* Quick Stats */}
          <div className="flex justify-center gap-8 text-sm">
            <div className="flex items-center gap-2 text-slate-400">
              <BookOpen className="w-4 h-4" />
              <span>120+ artigos</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Video className="w-4 h-4" />
              <span>45+ vídeos</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <MessageSquare className="w-4 h-4" />
              <span>2.5K+ discussões</span>
            </div>
          </div>
        </motion.div>

        {/* Main Sections */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {sections.map((section, i) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card
                  onClick={() => navigate(createPageUrl(section.path))}
                  className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all cursor-pointer h-full"
                >
                  <CardContent className="p-6">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                      style={{
                        background: `linear-gradient(135deg, ${section.color}20, ${section.color}05)`,
                        boxShadow: `0 0 20px ${section.color}20`
                      }}
                    >
                      <Icon className="w-7 h-7" style={{ color: section.color }} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{section.title}</h3>
                    <p className="text-slate-400 text-sm mb-4">{section.description}</p>
                    <Badge className="bg-white/5 text-slate-300 border-white/10">
                      {section.stats}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Categories */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8">Navegue por Categoria</h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <Icon className="w-8 h-8 text-[#00D4FF] mx-auto mb-2" />
                      <div className="text-sm font-semibold text-white mb-1">{cat.name}</div>
                      <div className="text-xs text-slate-400">{cat.count} artigos</div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Popular Articles */}
        {popularArticles.length > 0 && (
          <div className="mb-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-white">Artigos Populares</h2>
              <Button
                variant="outline"
                onClick={() => navigate(createPageUrl('BaseConhecimento'))}
                className="border-white/20 text-white hover:bg-white/5"
              >
                Ver Todos
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {popularArticles.map((article, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card
                    onClick={() => navigate(createPageUrl('BaseConhecimento') + `?article=${article.id}`)}
                    className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all cursor-pointer h-full"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3 mb-3">
                        <FileText className="w-5 h-5 text-[#00D4FF] flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-white mb-2 line-clamp-2">
                            {article.title}
                          </h3>
                          <p className="text-sm text-slate-400 line-clamp-2">
                            {article.summary}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>{article.view_count} visualizações</span>
                        <span>{article.estimated_reading_time || 5} min</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-[#00D4FF]/20 to-[#00A8CC]/20 border-[#00D4FF]/40 backdrop-blur-sm">
            <CardContent className="p-8">
              <PlayCircle className="w-12 h-12 text-[#00D4FF] mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">
                Novo na Plataforma?
              </h3>
              <p className="text-slate-300 mb-6">
                Assista nosso guia de início rápido e comece a usar o CAIO·AI em minutos
              </p>
              <Button
                onClick={() => navigate(createPageUrl('Tutoriais'))}
                className="bg-[#00D4FF] hover:bg-[#00E5FF] text-white"
              >
                Assistir Guia de Início
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#9D4EDD]/20 to-[#7B2CBF]/20 border-[#9D4EDD]/40 backdrop-blur-sm">
            <CardContent className="p-8">
              <MessageSquare className="w-12 h-12 text-[#9D4EDD] mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">
                Precisa de Ajuda Personalizada?
              </h3>
              <p className="text-slate-300 mb-6">
                Nossa comunidade está pronta para ajudar. Faça sua pergunta no fórum!
              </p>
              <Button
                onClick={() => navigate(createPageUrl('Forum'))}
                className="bg-[#9D4EDD] hover:bg-[#B565F5] text-white"
              >
                Acessar Fórum
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}