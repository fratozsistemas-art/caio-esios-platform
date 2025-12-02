import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, Clock, Building2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function PlaybookCard({ playbook, goalInfo, onView, onDelete }) {
  const GoalIcon = goalInfo?.icon || Building2;

  const getStatusBadge = (status) => {
    const styles = {
      draft: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      reviewed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      approved: "bg-green-500/20 text-green-400 border-green-500/30",
      archived: "bg-slate-500/20 text-slate-400 border-slate-500/30"
    };
    return styles[status] || styles.draft;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      <Card className={`bg-${goalInfo?.color || 'cyan'}-500/5 border-${goalInfo?.color || 'cyan'}-500/20 hover:border-${goalInfo?.color || 'cyan'}-500/40 transition-all cursor-pointer`} onClick={onView}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <GoalIcon className={`w-8 h-8 text-${goalInfo?.color || 'cyan'}-400`} />
            <Badge className={getStatusBadge(playbook.status)}>{playbook.status}</Badge>
          </div>

          <h3 className="text-white font-semibold mb-2 line-clamp-2">{playbook.title}</h3>
          
          <div className="flex items-center gap-2 mb-3">
            <Badge className="bg-white/10 text-slate-300 text-xs">{playbook.industry}</Badge>
            <Badge className="bg-white/10 text-slate-300 text-xs">{playbook.company_size}</Badge>
          </div>

          {playbook.executive_summary && (
            <p className="text-xs text-slate-400 line-clamp-2 mb-3">
              {playbook.executive_summary}
            </p>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Sparkles className="w-3 h-3" />
              {playbook.source_insights_count || 0} insights
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => { e.stopPropagation(); onView(); }}
                className="h-8 px-2 text-slate-400 hover:text-white"
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="h-8 px-2 text-slate-400 hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}