import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Play, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RecommendedVideos({ onVideoSelect }) {
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['video_recommendations'],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('generateVideoRecommendations', {});
      return data;
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
        <CardContent className="p-12 text-center">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-[#94A3B8]">Analyzing your preferences...</p>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations?.recommendations || recommendations.recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Recommended For You</h2>
            <p className="text-sm text-[#94A3B8]">
              Based on your viewing history • {recommendations.watch_count || 0} videos watched
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.recommendations.map((video, idx) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card 
              className="bg-[#1A1D29] border-purple-500/30 hover:bg-[#0A2540] cursor-pointer transition-all duration-300 group overflow-hidden hover:border-purple-500/50"
              onClick={() => onVideoSelect(video)}
            >
              <div className="relative aspect-video bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center overflow-hidden">
                {video.thumbnail && (
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-purple-500/80 group-hover:bg-purple-500 flex items-center justify-center transition-all group-hover:scale-110 relative z-10">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                </div>
                <Badge className="absolute top-2 left-2 bg-purple-500/90 text-white border-0 z-10">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Recommended
                </Badge>
              </div>
              <CardHeader className="p-4">
                <CardTitle className="text-white text-base group-hover:text-purple-400 transition-colors line-clamp-2">
                  {video.title}
                </CardTitle>
                <p className="text-xs text-[#94A3B8] mt-2 line-clamp-2">
                  {video.reason}
                </p>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                <Badge className="bg-[#00D4FF]/20 text-[#00D4FF] text-xs">
                  {video.category}
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}