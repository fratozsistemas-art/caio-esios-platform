import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Clock, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { motion } from "framer-motion";

export default function ConversationHistoryWidget({ conversations = [] }) {
  const recentConversations = conversations
    .filter(c => !c.metadata?.deleted)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const totalMessages = conversations.reduce((sum, c) => 
    sum + (c.messages?.length || 0), 0
  );

  const todayConvos = conversations.filter(c => {
    const created = new Date(c.created_at);
    const today = new Date();
    return created.toDateString() === today.toDateString();
  }).length;

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            Recent Conversations
          </CardTitle>
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            {conversations.length} total
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-2xl font-bold text-white">{todayConvos}</div>
            <div className="text-xs text-slate-400">Today</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-2xl font-bold text-white">{totalMessages}</div>
            <div className="text-xs text-slate-400">Total Messages</div>
          </div>
        </div>

        <div className="space-y-2">
          {recentConversations.map((conv, idx) => (
            <motion.div
              key={conv.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link to={createPageUrl('Chat')}>
                <div className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-all border border-white/10">
                  <div className="flex items-start justify-between mb-1">
                    <div className="text-sm text-white font-medium truncate flex-1">
                      {conv.metadata?.name || 'Untitled Conversation'}
                    </div>
                    {conv.metadata?.persona && (
                      <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400">
                        {conv.metadata.persona.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    {new Date(conv.created_at).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}