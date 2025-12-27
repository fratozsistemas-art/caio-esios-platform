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
  Settings,
  TrendingUp 
} from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import YouTubeSyncPanel from '../components/blog/YouTubeSyncPanel';

export default function Blog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [showSync, setShowSync] = useState(false);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blog_posts'],
    queryFn: () => base44.entities.BlogPost.list('-published_at')
  });

  const filteredPosts = posts.filter(post =>
    post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const featuredPosts = posts.filter(p => p.is_featured);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-cyan-400" />
            Blog & Resources
          </h1>
          <p className="text-slate-400 mt-1">
            Insights, tutorials, and updates on AI and strategic intelligence
          </p>
        </div>

        <Dialog open={showSync} onOpenChange={setShowSync}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Youtube className="w-4 h-4 mr-2" />
              Sync YouTube
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-white/20">
            <DialogHeader>
              <DialogTitle className="text-white">YouTube Channel Sync</DialogTitle>
            </DialogHeader>
            <YouTubeSyncPanel />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search posts..."
          className="pl-12 bg-white/5 border-white/10 text-white"
        />
      </div>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && !searchTerm && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Featured Posts</h2>
          <div className="grid grid-cols-2 gap-6">
            {featuredPosts.slice(0, 2).map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card 
                  className="bg-white/5 border-white/10 cursor-pointer hover:bg-white/10 transition-all overflow-hidden"
                  onClick={() => setSelectedPost(post)}
                >
                  {post.featured_image && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-white text-lg line-clamp-2">
                        {post.title}
                      </CardTitle>
                      {post.youtube_video_id && (
                        <Youtube className="w-5 h-5 text-red-500 flex-shrink-0" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-400 text-sm line-clamp-3 mb-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.published_at).toLocaleDateString('pt-BR')}
                      </span>
                      {post.view_count > 0 && (
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {post.view_count.toLocaleString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* All Posts */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">
          {searchTerm ? 'Search Results' : 'Recent Posts'}
        </h2>
        {isLoading ? (
          <p className="text-slate-400 text-center py-8">Loading posts...</p>
        ) : filteredPosts.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No posts found</p>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {filteredPosts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card 
                  className="bg-white/5 border-white/10 cursor-pointer hover:bg-white/10 transition-all h-full"
                  onClick={() => setSelectedPost(post)}
                >
                  {post.featured_image && (
                    <div className="h-32 overflow-hidden">
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex items-start gap-2">
                      <CardTitle className="text-white text-sm line-clamp-2 flex-1">
                        {post.title}
                      </CardTitle>
                      {post.youtube_video_id && (
                        <Youtube className="w-4 h-4 text-red-500 flex-shrink-0" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-400 text-xs line-clamp-2 mb-2">
                      {post.excerpt}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">
                        {post.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.published_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
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
                {selectedPost.youtube_video_id && (
                  <Badge className="bg-red-500/20 text-red-400">
                    <Youtube className="w-3 h-3 mr-1" />
                    YouTube
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-400 mt-2">
                <span>{selectedPost.author}</span>
                <span>•</span>
                <span>{new Date(selectedPost.published_at).toLocaleDateString('pt-BR')}</span>
                {selectedPost.view_count > 0 && (
                  <>
                    <span>•</span>
                    <span>{selectedPost.view_count.toLocaleString('pt-BR')} views</span>
                  </>
                )}
              </div>
            </DialogHeader>
            
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown>{selectedPost.content}</ReactMarkdown>
            </div>

            {selectedPost.tags && selectedPost.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
                {selectedPost.tags.map((tag, idx) => (
                  <Badge key={idx} className="bg-white/10 text-slate-300">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}