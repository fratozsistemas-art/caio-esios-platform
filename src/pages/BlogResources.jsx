import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Youtube, 
  Calendar, 
  Eye, 
  ArrowLeft,
  FileText,
  Video,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { createPageUrl } from '../utils';
import { Link } from 'react-router-dom';

export default function BlogResources() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['public_blog_posts'],
    queryFn: () => base44.entities.BlogPost.filter({ status: 'published' }, '-published_at')
  });

  const categories = ['all', ...new Set(posts.map(p => p.category))];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchTerm || 
      post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const featuredPosts = posts.filter(p => p.is_featured).slice(0, 2);
  const videoArticles = posts.filter(p => p.youtube_video_id);
  const textArticles = posts.filter(p => !p.youtube_video_id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A2540] via-[#1A1D29] to-[#0F1419]">
      {/* Header */}
      <div className="bg-[#0A2540]/95 backdrop-blur-lg border-b border-[#00D4FF]/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('Landing')}>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-cyan-400" />
                  Blog & Resources
                </h1>
                <p className="text-slate-400 text-sm">
                  Insights, tutorials, and updates on AI and strategic intelligence
                </p>
              </div>
            </div>
            <Link to={createPageUrl('Landing')}>
              <img 
                src="https://base44.app/api/apps/68f4a0b77dcf6281433ddc4b/files/public/68f4a0b77dcf6281433ddc4b/37d64ece6_CAIOAI-semfundo.png" 
                alt="CAIO·AI" 
                className="w-10 h-10 object-contain"
              />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search articles, videos, and resources..."
              className="pl-12 bg-white/5 border-white/10 text-white"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(cat => (
              <Button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                className={selectedCategory === cat ? 
                  "bg-cyan-500 hover:bg-cyan-600" : 
                  "border-white/20 text-white hover:bg-white/10"
                }
              >
                {cat === 'all' ? 'All' : cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Total Articles</p>
                  <p className="text-2xl font-bold text-white">{textArticles.length}</p>
                </div>
                <FileText className="w-8 h-8 text-cyan-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Video Content</p>
                  <p className="text-2xl font-bold text-white">{videoArticles.length}</p>
                </div>
                <Video className="w-8 h-8 text-red-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Total Views</p>
                  <p className="text-2xl font-bold text-white">
                    {posts.reduce((sum, p) => sum + (p.view_count || 0), 0).toLocaleString()}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-purple-400 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && !searchTerm && selectedCategory === 'all' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              Featured Content
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {featuredPosts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card 
                    className="bg-white/5 border-white/10 cursor-pointer hover:bg-white/10 transition-all overflow-hidden h-full group"
                    onClick={() => setSelectedPost(post)}
                  >
                    {post.featured_image && (
                      <div className="h-56 overflow-hidden relative">
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {post.youtube_video_id && (
                          <div className="absolute top-4 right-4">
                            <Badge className="bg-red-500/90 text-white backdrop-blur-sm">
                              <Youtube className="w-3 h-3 mr-1" />
                              Video
                            </Badge>
                          </div>
                        )}
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-white text-lg line-clamp-2 group-hover:text-cyan-400 transition-colors">
                        {post.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-400 text-sm line-clamp-3 mb-4">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(post.published_at).toLocaleDateString()}
                          </span>
                          {post.view_count > 0 && (
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {post.view_count.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">
                          {post.category}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* All Posts Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">
            {searchTerm || selectedCategory !== 'all' ? 'Search Results' : 'All Content'}
            <span className="text-slate-500 text-sm ml-2">({filteredPosts.length})</span>
          </h2>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-slate-400">Loading content...</div>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400">No content found</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredPosts.map((post, idx) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card 
                      className="bg-white/5 border-white/10 cursor-pointer hover:bg-white/10 transition-all h-full group"
                      onClick={() => setSelectedPost(post)}
                    >
                      {post.featured_image && (
                        <div className="h-40 overflow-hidden relative">
                          <img
                            src={post.featured_image}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {post.youtube_video_id && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                              <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
                                <Youtube className="w-6 h-6 text-white" />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      <CardHeader className="pb-2">
                        <CardTitle className="text-white text-sm line-clamp-2 group-hover:text-cyan-400 transition-colors">
                          {post.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-400 text-xs line-clamp-2 mb-3">
                          {post.excerpt}
                        </p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">
                            {post.category}
                          </Badge>
                          {post.youtube_video_id && (
                            <Badge className="bg-red-500/20 text-red-400 text-xs">
                              Video
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(post.published_at).toLocaleDateString()}
                          </span>
                          {post.view_count > 0 && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {post.view_count.toLocaleString()}
                              </span>
                            </>
                          )}
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

      {/* Post Detail Modal */}
      {selectedPost && (
        <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-white/20">
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <DialogTitle className="text-white text-2xl flex-1">
                  {selectedPost.title}
                </DialogTitle>
                <div className="flex gap-2">
                  <Badge className="bg-cyan-500/20 text-cyan-400">
                    {selectedPost.category}
                  </Badge>
                  {selectedPost.youtube_video_id && (
                    <Badge className="bg-red-500/20 text-red-400">
                      <Youtube className="w-3 h-3 mr-1" />
                      Video
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-400 mt-2">
                <span>{selectedPost.author}</span>
                <span>•</span>
                <span>{new Date(selectedPost.published_at).toLocaleDateString()}</span>
                {selectedPost.view_count > 0 && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {selectedPost.view_count.toLocaleString()} views
                    </span>
                  </>
                )}
              </div>
            </DialogHeader>

            {/* YouTube Video Embed */}
            {selectedPost.youtube_video_id && (
              <div className="aspect-video rounded-lg overflow-hidden mb-6">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${selectedPost.youtube_video_id}`}
                  title={selectedPost.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            )}
            
            {/* Content */}
            <div className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-slate-300 prose-a:text-cyan-400 prose-strong:text-white prose-code:text-cyan-400 prose-code:bg-white/10 prose-pre:bg-slate-800">
              <ReactMarkdown>{selectedPost.content}</ReactMarkdown>
            </div>

            {/* Tags */}
            {selectedPost.tags && selectedPost.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-6 border-t border-white/10 mt-6">
                {selectedPost.tags.map((tag, idx) => (
                  <Badge key={idx} className="bg-white/10 text-slate-300 border-white/20">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Footer */}
      <div className="border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-400 text-sm">
              © 2025 ESIOS CAIO Platform. All rights reserved.
            </p>
            <Link to={createPageUrl('Landing')}>
              <Button variant="outline" className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/20">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}