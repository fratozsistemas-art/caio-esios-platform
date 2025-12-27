import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Search, Clock, Eye, TrendingUp, Sparkles, Calendar, ArrowUpDown } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function Videos() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  // Fetch YouTube videos from database
  const { data: youtubeVideos = [], isLoading } = useQuery({
    queryKey: ['youtube_videos'],
    queryFn: async () => {
      const posts = await base44.entities.BlogPost.filter({
        youtube_video_id: { $exists: true },
        status: 'published'
      });
      return posts.map(post => ({
        id: post.id,
        title: post.title,
        description: post.excerpt || post.content?.substring(0, 150) + '...',
        thumbnail: post.featured_image,
        duration: 'N/A',
        views: post.view_count ? `${(post.view_count / 1000).toFixed(1)}K` : '0',
        category: post.category?.toLowerCase() || 'ai',
        embedUrl: post.video_embed_url,
        publishedAt: post.published_at,
        isYouTube: true
      }));
    }
  });

  // Placeholder videos (agenda de publicação - 2 por semana)
  const placeholderVideos = [
    {
      id: 'placeholder-1',
      title: "Coming Soon: AI Strategy Implementation Workshop",
      description: "Hands-on workshop on implementing AI strategies in your organization",
      thumbnail: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f4a0b77dcf6281433ddc4b/37d64ece6_CAIOAI-semfundo.png",
      duration: "TBD",
      views: "Coming Soon",
      category: "workshop",
      embedUrl: null,
      isPlaceholder: true,
      scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next week
    },
    {
      id: 'placeholder-2',
      title: "Coming Soon: Advanced Knowledge Graph Techniques",
      description: "Deep dive into advanced techniques for building strategic knowledge graphs",
      thumbnail: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f4a0b77dcf6281433ddc4b/37d64ece6_CAIOAI-semfundo.png",
      duration: "TBD",
      views: "Coming Soon",
      category: "tutorial",
      embedUrl: null,
      isPlaceholder: true,
      scheduledDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // Two weeks
    }
  ];

  // Combine real and placeholder videos
  const allVideos = [...youtubeVideos, ...placeholderVideos];

  const staticVideos = [
    {
      id: 1,
      title: "CAIO·AI Platform Overview",
      description: "Complete introduction to TSI v9.3 methodology and 11 cognitive modules",
      thumbnail: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f4a0b77dcf6281433ddc4b/37d64ece6_CAIOAI-semfundo.png",
      duration: "15:30",
      views: "12.4K",
      category: "overview",
      embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
    },
    {
      id: 2,
      title: "Strategic Synthesis with M5 Module",
      description: "Deep dive into M5 Strategic Synthesis and how it transforms analysis",
      thumbnail: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f4a0b77dcf6281433ddc4b/37d64ece6_CAIOAI-semfundo.png",
      duration: "22:15",
      views: "8.9K",
      category: "modules",
      embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
    },
    {
      id: 3,
      title: "Knowledge Graph Navigation",
      description: "Interactive demonstration of 10K+ connections and strategic pathfinding",
      thumbnail: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f4a0b77dcf6281433ddc4b/37d64ece6_CAIOAI-semfundo.png",
      duration: "18:45",
      views: "15.2K",
      category: "features",
      embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
    },
    {
      id: 4,
      title: "Vector Decision Engine in Action",
      description: "Real-world case study of strategic vector analysis and projection",
      thumbnail: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f4a0b77dcf6281433ddc4b/37d64ece6_CAIOAI-semfundo.png",
      duration: "25:00",
      views: "10.7K",
      category: "case-studies",
      embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
    },
    {
      id: 5,
      title: "Multi-Agent Orchestration Demo",
      description: "How autonomous agents collaborate for strategic intelligence",
      thumbnail: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f4a0b77dcf6281433ddc4b/37d64ece6_CAIOAI-semfundo.png",
      duration: "20:30",
      views: "9.8K",
      category: "features",
      embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
    },
    {
      id: 6,
      title: "M&A Due Diligence Walkthrough",
      description: "Complete M&A analysis workflow from data upload to final report",
      thumbnail: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f4a0b77dcf6281433ddc4b/37d64ece6_CAIOAI-semfundo.png",
      duration: "30:15",
      views: "18.3K",
      category: "case-studies",
      embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
    }
  ];

  const categories = [
    { id: "all", label: "All Videos", count: 0 },
    { id: "ai", label: "AI & Technology", count: 0 },
    { id: "strategy", label: "Strategy", count: 0 },
    { id: "tutorial", label: "Tutorials", count: 0 },
    { id: "workshop", label: "Workshops", count: 0 },
    { id: "overview", label: "Platform Overview", count: 0 },
    { id: "modules", label: "TSI Modules", count: 0 },
    { id: "features", label: "Features", count: 0 },
    { id: "case-studies", label: "Case Studies", count: 0 }
  ];

  const sortOptions = [
    { value: "date", label: "Date (Newest)" },
    { value: "date-asc", label: "Date (Oldest)" },
    { value: "views", label: "Views (High to Low)" },
    { value: "views-asc", label: "Views (Low to High)" },
    { value: "duration", label: "Duration (Longest)" },
    { value: "duration-asc", label: "Duration (Shortest)" },
    { value: "title", label: "Title (A-Z)" }
  ];

  // Helper function to parse duration string to seconds
  const parseDuration = (duration) => {
    if (!duration || duration === 'TBD' || duration === 'N/A') return 0;
    const parts = duration.split(':').map(p => parseInt(p) || 0);
    if (parts.length === 2) return parts[0] * 60 + parts[1]; // mm:ss
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]; // hh:mm:ss
    return 0;
  };

  // Helper function to parse views string to number
  const parseViews = (views) => {
    if (!views || views === 'Coming Soon') return 0;
    const str = views.toString().toLowerCase();
    if (str.includes('k')) return parseFloat(str) * 1000;
    if (str.includes('m')) return parseFloat(str) * 1000000;
    return parseInt(str) || 0;
  };

  const filteredAndSortedVideos = useMemo(() => {
    // Combine all videos
    const combined = [...allVideos, ...staticVideos];
    
    // Filter by search and category
    let filtered = combined.filter(video => {
      const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           video.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || video.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort videos
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          const dateA = a.isPlaceholder ? a.scheduledDate : new Date(a.publishedAt || 0);
          const dateB = b.isPlaceholder ? b.scheduledDate : new Date(b.publishedAt || 0);
          return dateB - dateA;
        
        case "date-asc":
          const dateAsc1 = a.isPlaceholder ? a.scheduledDate : new Date(a.publishedAt || 0);
          const dateAsc2 = b.isPlaceholder ? b.scheduledDate : new Date(b.publishedAt || 0);
          return dateAsc1 - dateAsc2;
        
        case "views":
          return parseViews(b.views) - parseViews(a.views);
        
        case "views-asc":
          return parseViews(a.views) - parseViews(b.views);
        
        case "duration":
          return parseDuration(b.duration) - parseDuration(a.duration);
        
        case "duration-asc":
          return parseDuration(a.duration) - parseDuration(b.duration);
        
        case "title":
          return a.title.localeCompare(b.title);
        
        default:
          return 0;
      }
    });

    return filtered;
  }, [allVideos, staticVideos, searchQuery, selectedCategory, sortBy]);

  // Update category counts
  const categoriesWithCounts = categories.map(cat => {
    if (cat.id === "all") {
      return { ...cat, count: allVideos.length + staticVideos.length };
    }
    const count = [...allVideos, ...staticVideos].filter(v => v.category === cat.id).length;
    return { ...cat, count };
  });

  const [selectedVideo, setSelectedVideo] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A2540] via-[#1A1D29] to-[#0F1419] p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00D4FF] to-[#8B5CF6] flex items-center justify-center">
              <Play className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Video Library</h1>
              <p className="text-[#94A3B8]">Tutorials, demos and strategic intelligence insights</p>
            </div>
          </div>
        </motion.div>

        <Card className="bg-[#1A1D29] border-[#00D4FF]/20 mb-6">
          <CardContent className="p-6 space-y-4">
            <div className="flex gap-4 flex-wrap items-end">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search videos..."
                    className="pl-10 bg-[#0A2540] border-[#00D4FF]/30 text-white placeholder:text-[#94A3B8]"
                  />
                </div>
              </div>
              <div className="w-[200px]">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-[#0A2540] border-[#00D4FF]/30 text-white">
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1D29] border-[#00D4FF]/30">
                    {sortOptions.map((option) => (
                      <SelectItem 
                        key={option.value} 
                        value={option.value}
                        className="text-white hover:bg-[#0A2540]"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <p className="text-xs text-[#94A3B8] mb-2 uppercase tracking-wide">Categories</p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categoriesWithCounts.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? "default" : "outline"}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={selectedCategory === cat.id 
                      ? "bg-[#00D4FF] text-[#0A2540] hover:bg-[#00B8E6] font-medium whitespace-nowrap" 
                      : "bg-[#1A1D29] border-[#00D4FF]/30 text-[#94A3B8] hover:bg-[#0A2540] hover:border-[#00D4FF]/50 hover:text-white whitespace-nowrap"}
                  >
                    {cat.label}
                    {cat.count > 0 && (
                      <Badge className="ml-2 bg-white/10 text-white border-0 text-xs">
                        {cat.count}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <p className="text-sm text-[#94A3B8]">
                Showing <span className="text-white font-medium">{filteredAndSortedVideos.length}</span> video{filteredAndSortedVideos.length !== 1 ? 's' : ''}
              </p>
              {filteredAndSortedVideos.filter(v => v.isPlaceholder).length > 0 && (
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                  {filteredAndSortedVideos.filter(v => v.isPlaceholder).length} upcoming
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <Card className="bg-[#1A1D29] border-[#00D4FF]/20 overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-video w-full">
                  <iframe
                    src={selectedVideo.embedUrl}
                    className="w-full h-full"
                    title={selectedVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedVideo.title}</h2>
                  <p className="text-[#94A3B8] mb-4">{selectedVideo.description}</p>
                  <div className="flex items-center gap-4 text-sm text-[#94A3B8]">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {selectedVideo.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {selectedVideo.views} views
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedVideos.map((video, idx) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card 
                className={`bg-[#1A1D29] border-[#00D4FF]/20 ${video.isPlaceholder ? 'opacity-75' : 'hover:bg-[#0A2540] cursor-pointer'} transition-all duration-300 group overflow-hidden`}
                onClick={() => !video.isPlaceholder && setSelectedVideo(video)}
              >
                <div className="relative aspect-video bg-gradient-to-br from-[#0A2540] to-[#1A1D29] flex items-center justify-center overflow-hidden">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-24 h-24 object-contain opacity-50 group-hover:opacity-70 transition-opacity"
                  />
                  {video.isPlaceholder ? (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="text-center">
                        <Calendar className="w-12 h-12 text-[#00D4FF] mx-auto mb-2" />
                        <p className="text-xs text-white font-medium">Scheduled</p>
                        <p className="text-xs text-slate-400">
                          {new Date(video.scheduledDate).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-[#00D4FF]/80 group-hover:bg-[#00D4FF] flex items-center justify-center transition-all group-hover:scale-110">
                          <Play className="w-8 h-8 text-white ml-1" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white">
                        {video.duration}
                      </div>
                    </>
                  )}
                </div>
                <CardHeader className="p-4">
                  <CardTitle className="text-white text-base group-hover:text-[#00D4FF] transition-colors line-clamp-2">
                    {video.title}
                  </CardTitle>
                  <CardDescription className="text-[#94A3B8] text-sm line-clamp-2">
                    {video.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0">
                  <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                    <div className="flex items-center gap-1">
                      {video.isPlaceholder ? (
                        <>
                          <Calendar className="w-3 h-3" />
                          {new Date(video.scheduledDate).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3" />
                          {video.views}
                        </>
                      )}
                    </div>
                    <Badge className={video.isPlaceholder ? "bg-purple-500/20 text-purple-400 text-xs" : "bg-[#00D4FF]/20 text-[#00D4FF] text-xs"}>
                      {video.isPlaceholder ? 'Coming Soon' : video.category}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}