import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageSquare,
  Plus,
  ThumbsUp,
  Eye,
  CheckCircle,
  Pin,
  Lock,
  Clock,
  User,
  ArrowLeft,
  Send
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import moment from "moment";

export default function Forum() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showNewPostDialog, setShowNewPostDialog] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "general",
    tags: []
  });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const categories = [
    { id: "all", label: "Todos", icon: MessageSquare },
    { id: "general", label: "Geral" },
    { id: "questions", label: "Perguntas" },
    { id: "tips_tricks", label: "Dicas" },
    { id: "use_cases", label: "Casos de Uso" },
    { id: "feature_requests", label: "Sugestões" },
    { id: "bug_reports", label: "Bugs" }
  ];

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['forum-posts', selectedCategory],
    queryFn: async () => {
      const query = selectedCategory === "all" ? {} : { category: selectedCategory };
      return await base44.entities.ForumPost.filter(query, "-last_activity_at", 50);
    }
  });

  const { data: replies = [] } = useQuery({
    queryKey: ['forum-replies', selectedPost?.id],
    queryFn: () => base44.entities.ForumReply.filter({ post_id: selectedPost.id }, "created_date"),
    enabled: !!selectedPost
  });

  const createPostMutation = useMutation({
    mutationFn: (postData) => base44.entities.ForumPost.create({
      ...postData,
      author_email: user.email,
      author_name: user.full_name,
      last_activity_at: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['forum-posts']);
      setShowNewPostDialog(false);
      setNewPost({ title: "", content: "", category: "general", tags: [] });
      toast.success("Post criado com sucesso!");
    }
  });

  const createReplyMutation = useMutation({
    mutationFn: (content) => base44.entities.ForumReply.create({
      post_id: selectedPost.id,
      content,
      author_email: user.email,
      author_name: user.full_name
    }),
    onSuccess: async () => {
      // Update post reply count
      await base44.entities.ForumPost.update(selectedPost.id, {
        reply_count: (selectedPost.reply_count || 0) + 1,
        last_activity_at: new Date().toISOString()
      });
      queryClient.invalidateQueries(['forum-replies']);
      queryClient.invalidateQueries(['forum-posts']);
      setReplyContent("");
      toast.success("Resposta publicada!");
    }
  });

  const likePostMutation = useMutation({
    mutationFn: (postId) => {
      const post = posts.find(p => p.id === postId);
      const liked_by = post.liked_by || [];
      const hasLiked = liked_by.includes(user.email);
      
      return base44.entities.ForumPost.update(postId, {
        like_count: hasLiked ? (post.like_count || 0) - 1 : (post.like_count || 0) + 1,
        liked_by: hasLiked 
          ? liked_by.filter(e => e !== user.email)
          : [...liked_by, user.email]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['forum-posts']);
    }
  });

  const handleSubmitPost = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Faça login para criar posts");
      return;
    }
    createPostMutation.mutate(newPost);
  };

  const handleSubmitReply = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Faça login para responder");
      return;
    }
    if (!replyContent.trim()) return;
    createReplyMutation.mutate(replyContent);
  };

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#0d2847] to-[#1a1410] p-6">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setSelectedPost(null)}
            className="mb-6 text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Discussões
          </Button>

          {/* Post */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm mb-6">
            <CardContent className="p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#FFB800] flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">
                    {selectedPost.author_name?.charAt(0) || "U"}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white">{selectedPost.author_name}</span>
                    <span className="text-slate-500 text-sm">
                      {moment(selectedPost.created_date).fromNow()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[#00D4FF]/20 text-[#00D4FF]">
                      {selectedPost.category?.replace(/_/g, ' ')}
                    </Badge>
                    {selectedPost.is_pinned && (
                      <Badge variant="outline" className="border-yellow-500/40 text-yellow-500">
                        <Pin className="w-3 h-3 mr-1" />
                        Fixado
                      </Badge>
                    )}
                    {selectedPost.has_accepted_answer && (
                      <Badge variant="outline" className="border-green-500/40 text-green-500">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Resolvido
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-white mb-4">{selectedPost.title}</h1>
              <div className="prose prose-invert max-w-none mb-4">
                <p className="text-slate-300 whitespace-pre-wrap">{selectedPost.content}</p>
              </div>

              {selectedPost.tags && selectedPost.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedPost.tags.map((tag, i) => (
                    <Badge key={i} variant="outline" className="border-white/20 text-slate-300">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => user && likePostMutation.mutate(selectedPost.id)}
                  className="text-slate-400 hover:text-white"
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  {selectedPost.like_count || 0}
                </Button>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <MessageSquare className="w-4 h-4" />
                  <span>{selectedPost.reply_count || 0} respostas</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Eye className="w-4 h-4" />
                  <span>{selectedPost.view_count || 0} visualizações</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Replies */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">
              {replies.length} {replies.length === 1 ? 'Resposta' : 'Respostas'}
            </h2>
            <div className="space-y-4">
              {replies.map((reply, i) => (
                <motion.div
                  key={reply.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#9D4EDD] to-[#7B2CBF] flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">
                            {reply.author_name?.charAt(0) || "U"}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-white">{reply.author_name}</span>
                            <span className="text-slate-500 text-sm">
                              {moment(reply.created_date).fromNow()}
                            </span>
                            {reply.is_accepted && (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/40">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Resposta Aceita
                              </Badge>
                            )}
                          </div>
                          <p className="text-slate-300 whitespace-pre-wrap">{reply.content}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Reply Form */}
          {!selectedPost.is_locked && user && (
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-white mb-4">Sua Resposta</h3>
                <form onSubmit={handleSubmitReply}>
                  <Textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Escreva sua resposta..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 min-h-[150px] mb-4"
                  />
                  <Button
                    type="submit"
                    disabled={!replyContent.trim() || createReplyMutation.isPending}
                    className="bg-gradient-to-r from-[#00D4FF] to-[#FFB800]"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Publicar Resposta
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#0d2847] to-[#1a1410] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Fórum Comunitário</h1>
            <p className="text-slate-400">
              Troque experiências, tire dúvidas e aprenda com outros usuários
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(createPageUrl('CentralAjuda'))}
              className="border-white/20 text-white hover:bg-white/5"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            {user && (
              <Button
                onClick={() => setShowNewPostDialog(true)}
                className="bg-gradient-to-r from-[#00D4FF] to-[#FFB800]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Discussão
              </Button>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className={selectedCategory === cat.id
                ? "bg-[#00D4FF] text-white"
                : "border-white/20 text-slate-300 hover:bg-white/10"
              }
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Posts List */}
        {isLoading ? (
          <div className="text-center py-12 text-slate-400">Carregando discussões...</div>
        ) : posts.length === 0 ? (
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">Nenhuma discussão encontrada</p>
              {user && (
                <Button
                  onClick={() => setShowNewPostDialog(true)}
                  className="bg-gradient-to-r from-[#00D4FF] to-[#FFB800]"
                >
                  Criar Primeira Discussão
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {posts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card
                    onClick={() => setSelectedPost(post)}
                    className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#FFB800] flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold">
                            {post.author_name?.charAt(0) || "U"}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 mb-2">
                            <h3 className="font-bold text-white text-lg flex-1 line-clamp-2">
                              {post.title}
                            </h3>
                            {post.is_pinned && <Pin className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
                            {post.is_locked && <Lock className="w-4 h-4 text-slate-500 flex-shrink-0" />}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-slate-400 mb-3">
                            <span>{post.author_name}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {moment(post.last_activity_at || post.created_date).fromNow()}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <Badge className="bg-[#00D4FF]/20 text-[#00D4FF]">
                              {post.category?.replace(/_/g, ' ')}
                            </Badge>
                            <span className="flex items-center gap-1 text-slate-400">
                              <MessageSquare className="w-4 h-4" />
                              {post.reply_count || 0}
                            </span>
                            <span className="flex items-center gap-1 text-slate-400">
                              <ThumbsUp className="w-4 h-4" />
                              {post.like_count || 0}
                            </span>
                            <span className="flex items-center gap-1 text-slate-400">
                              <Eye className="w-4 h-4" />
                              {post.view_count || 0}
                            </span>
                            {post.has_accepted_answer && (
                              <Badge className="bg-green-500/20 text-green-400">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Resolvido
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* New Post Dialog */}
        {showNewPostDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-2xl"
            >
              <Card className="bg-[#0A1628] border-white/20">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-white mb-6">Nova Discussão</h2>
                  <form onSubmit={handleSubmitPost} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Título
                      </label>
                      <Input
                        required
                        value={newPost.title}
                        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                        placeholder="Título da discussão"
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Categoria
                      </label>
                      <select
                        required
                        value={newPost.category}
                        onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                      >
                        {categories.filter(c => c.id !== 'all').map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Conteúdo
                      </label>
                      <Textarea
                        required
                        value={newPost.content}
                        onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                        placeholder="Descreva sua questão ou compartilhe sua experiência..."
                        className="bg-white/5 border-white/10 text-white min-h-[200px]"
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowNewPostDialog(false)}
                        className="border-white/20 text-white"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={createPostMutation.isPending}
                        className="bg-gradient-to-r from-[#00D4FF] to-[#FFB800]"
                      >
                        Publicar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}