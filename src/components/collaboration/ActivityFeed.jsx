import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageSquare, Target, Brain, FileText, Network, 
  Users, Plus, Edit, Trash, Share2, Clock
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

export default function ActivityFeed({ limit = 20 }) {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activity_feed', limit],
    queryFn: async () => {
      const [conversations, strategies, analyses, kgNodes] = await Promise.all([
        base44.agents.listConversations({ agent_name: 'caio_agent' }),
        base44.entities.Strategy.list('-created_date', limit),
        base44.entities.Analysis.list('-created_date', limit),
        base44.entities.KnowledgeGraphNode.list('-created_date', limit)
      ]);

      const activities = [
        ...conversations.slice(0, limit / 4).map(c => ({
          id: `conv-${c.id}`,
          type: 'conversation',
          title: c.metadata?.name || 'New conversation',
          user: c.metadata?.user_email || 'Unknown',
          timestamp: c.created_date,
          icon: MessageSquare,
          color: 'text-blue-400'
        })),
        ...strategies.slice(0, limit / 4).map(s => ({
          id: `strat-${s.id}`,
          type: 'strategy',
          title: s.title,
          user: s.created_by,
          timestamp: s.created_date,
          icon: Target,
          color: 'text-purple-400',
          badge: s.category
        })),
        ...analyses.slice(0, limit / 4).map(a => ({
          id: `analysis-${a.id}`,
          type: 'analysis',
          title: a.title,
          user: a.created_by,
          timestamp: a.created_date,
          icon: Brain,
          color: 'text-green-400',
          badge: a.type
        })),
        ...kgNodes.slice(0, limit / 4).map(n => ({
          id: `node-${n.id}`,
          type: 'kg_node',
          title: `New ${n.node_type}: ${n.label}`,
          user: n.created_by,
          timestamp: n.created_date,
          icon: Network,
          color: 'text-orange-400',
          badge: n.node_type
        }))
      ];

      return activities
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
    },
    refetchInterval: 30000
  });

  const getActionText = (type) => {
    switch (type) {
      case 'conversation': return 'started';
      case 'strategy': return 'created';
      case 'analysis': return 'completed';
      case 'kg_node': return 'added';
      default: return 'updated';
    }
  };

  if (isLoading) {
    return <div className="text-slate-400">Loading activity...</div>;
  }

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-400" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex gap-3 pb-4 border-b border-white/10 last:border-0">
                  <div className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-white text-sm">
                        <span className="font-medium">{activity.user}</span>
                        {' '}{getActionText(activity.type)}{' '}
                        <span className="font-medium">{activity.title}</span>
                      </p>
                      {activity.badge && (
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs flex-shrink-0">
                          {activity.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}

            {activities.length === 0 && (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No recent activity</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}