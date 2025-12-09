import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Play, Search, Clock, Eye, TrendingUp, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function Videos() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const videos = [
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
    { id: "all", label: "All Videos" },
    { id: "overview", label: "Platform Overview" },
    { id: "modules", label: "TSI Modules" },
    { id: "features", label: "Features" },
    { id: "case-studies", label: "Case Studies" }
  ];

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || video.category === selectedCategory;
    return matchesSearch && matchesCategory;
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
          <CardContent className="p-6">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search videos..."
                className="pl-10 bg-[#0A2540] border-[#00D4FF]/30 text-white placeholder:text-[#94A3B8]"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={selectedCategory === cat.id 
                    ? "bg-[#00D4FF] text-[#0A2540] hover:bg-[#00B8E6] font-medium whitespace-nowrap" 
                    : "bg-[#1A1D29] border-[#00D4FF]/30 text-[#94A3B8] hover:bg-[#0A2540] hover:border-[#00D4FF]/50 hover:text-white whitespace-nowrap"}
                >
                  {cat.label}
                </Button>
              ))}
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
          {filteredVideos.map((video, idx) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card 
                className="bg-[#1A1D29] border-[#00D4FF]/20 hover:bg-[#0A2540] cursor-pointer transition-all duration-300 group overflow-hidden"
                onClick={() => setSelectedVideo(video)}
              >
                <div className="relative aspect-video bg-gradient-to-br from-[#0A2540] to-[#1A1D29] flex items-center justify-center overflow-hidden">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-24 h-24 object-contain opacity-50 group-hover:opacity-70 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-[#00D4FF]/80 group-hover:bg-[#00D4FF] flex items-center justify-center transition-all group-hover:scale-110">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white">
                    {video.duration}
                  </div>
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
                      <Eye className="w-3 h-3" />
                      {video.views}
                    </div>
                    <Badge className="bg-[#00D4FF]/20 text-[#00D4FF] text-xs">
                      {video.category}
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