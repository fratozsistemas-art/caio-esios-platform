import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  MessageSquare, 
  Search, 
  Calendar, 
  Pin, 
  Trash2, 
  Eye,
  Clock,
  Tag,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";

export default function ConversationHistory() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [filterTag, setFilterTag] = useState(null);

  const { data: conversations = [], isLoading, refetch } = useQuery({
    queryKey: ['conversation_history'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const convs = await base44.entities.Conversation.filter({
        user_email: user.email
      });
      return convs.sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date));
    }
  });

  const { data: stats } = useQuery({
    queryKey: ['conversation_stats'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const allConvs = await base44.entities.Conversation.filter({
        user_email: user.email
      });
      
      const totalMessages = allConvs.reduce((sum, conv) => sum + (conv.messages?.length || 0), 0);
      const pinnedCount = allConvs.filter(c => c.is_pinned).length;
      
      return {
        total: allConvs.length,
        totalMessages,
        pinned: pinnedCount
      };
    }
  });

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = !searchQuery || 
      conv.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.last_message_preview?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTag = !filterTag || conv.tags?.includes(filterTag);
    
    return matchesSearch && matchesTag;
  });

  const allTags = [...new Set(conversations.flatMap(c => c.tags || []))];

  const handleDelete = async (convId) => {
    if (!confirm('Delete this conversation from history?')) return;
    
    try {
      await base44.entities.Conversation.delete(convId);
      toast.success('Conversation deleted');
      refetch();
    } catch (error) {
      toast.error('Failed to delete conversation');
    }
  };

  const handlePinToggle = async (conv) => {
    try {
      await base44.entities.Conversation.update(conv.id, {
        is_pinned: !conv.is_pinned
      });
      toast.success(conv.is_pinned ? 'Unpinned' : 'Pinned');
      refetch();
    } catch (error) {
      toast.error('Failed to update pin status');
    }
  };

  const handleResumeConversation = async (conv) => {
    try {
      // Create a new agent conversation with the historical messages
      const newConv = await base44.agents.createConversation({
        agent_name: "caio_agent",
        metadata: {
          resumed_from_history: conv.id,
          name: `Resumed: ${conv.title}`
        }
      });

      // Add historical messages to the new conversation
      for (const msg of conv.messages || []) {
        await base44.agents.addMessage(newConv, {
          role: msg.role,
          content: msg.content
        });
      }

      toast.success('Conversation resumed');
      navigate(createPageUrl('Chat'));
    } catch (error) {
      toast.error('Failed to resume conversation');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A2540] via-[#1A1D29] to-[#0F1419] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Conversation History</h1>
              <p className="text-slate-400">View and manage your past conversations</p>
            </div>
            <Button
              onClick={() => navigate(createPageUrl('Chat'))}
              className="bg-[#00D4FF] hover:bg-[#00B8E6] text-[#0A2540]"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              New Conversation
            </Button>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-white/5 border-[#00D4FF]/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Conversations</p>
                    <p className="text-2xl font-bold text-white">{stats?.total || 0}</p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-[#00D4FF]" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-[#00D4FF]/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Messages</p>
                    <p className="text-2xl font-bold text-white">{stats?.totalMessages || 0}</p>
                  </div>
                  <Clock className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-[#00D4FF]/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Pinned</p>
                    <p className="text-2xl font-bold text-white">{stats?.pinned || 0}</p>
                  </div>
                  <Pin className="w-8 h-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-[#00D4FF]/20 text-white placeholder:text-slate-400"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filterTag === null ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterTag(null)}
                className={filterTag === null ? "bg-[#00D4FF] text-[#0A2540]" : "border-[#00D4FF]/30 text-slate-300"}
              >
                All
              </Button>
              {allTags.map(tag => (
                <Button
                  key={tag}
                  variant={filterTag === tag ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterTag(tag)}
                  className={filterTag === tag ? "bg-[#00D4FF] text-[#0A2540]" : "border-[#00D4FF]/30 text-slate-300"}
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Conversation List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-[#00D4FF]/30 border-t-[#00D4FF] rounded-full animate-spin mx-auto" />
            <p className="text-slate-400 mt-4">Loading conversations...</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <Card className="bg-white/5 border-[#00D4FF]/20">
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-16 h-16 text-slate-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No conversations found</h3>
              <p className="text-slate-400 mb-6">Start a new conversation to see it here</p>
              <Button
                onClick={() => navigate(createPageUrl('Chat'))}
                className="bg-[#00D4FF] hover:bg-[#00B8E6] text-[#0A2540]"
              >
                Start Chatting
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredConversations.map((conv, idx) => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="bg-white/5 border-[#00D4FF]/20 hover:border-[#00D4FF]/40 transition-all cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {conv.is_pinned && <Pin className="w-4 h-4 text-yellow-400" />}
                          <h3 className="text-lg font-semibold text-white group-hover:text-[#00D4FF] transition-colors">
                            {conv.title}
                          </h3>
                        </div>

                        <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                          {conv.last_message_preview}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(conv.updated_date), 'MMM d, yyyy')}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {conv.messages?.length || 0} messages
                          </div>
                        </div>

                        {conv.tags && conv.tags.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {conv.tags.map(tag => (
                              <Badge key={tag} className="bg-[#00D4FF]/20 text-[#00D4FF] border-[#00D4FF]/30">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedConversation(conv)}
                          className="text-slate-400 hover:text-white hover:bg-white/10"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePinToggle(conv)}
                          className="text-slate-400 hover:text-yellow-400 hover:bg-yellow-400/10"
                        >
                          <Pin className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleResumeConversation(conv)}
                          className="text-slate-400 hover:text-[#00D4FF] hover:bg-[#00D4FF]/10"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(conv.id)}
                          className="text-slate-400 hover:text-red-400 hover:bg-red-400/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* View Conversation Modal */}
        <Dialog open={!!selectedConversation} onOpenChange={() => setSelectedConversation(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-[#0A2540] to-[#1A1D29] border-[#00D4FF]/30">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                {selectedConversation?.is_pinned && <Pin className="w-4 h-4 text-yellow-400" />}
                {selectedConversation?.title}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {selectedConversation?.messages?.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-[#00D4FF]/10 border border-[#00D4FF]/30 ml-12'
                      : 'bg-white/5 border border-white/10 mr-12'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={msg.role === 'user' ? 'bg-[#00D4FF]/20 text-[#00D4FF]' : 'bg-purple-500/20 text-purple-400'}>
                      {msg.role === 'user' ? 'You' : 'CAIO'}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {format(new Date(msg.timestamp), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <p className="text-slate-300 whitespace-pre-wrap">{msg.content}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => handleResumeConversation(selectedConversation)}
                className="flex-1 bg-[#00D4FF] hover:bg-[#00B8E6] text-[#0A2540]"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Resume Conversation
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedConversation(null)}
                className="border-[#00D4FF]/30 text-slate-300"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}