import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckSquare, Clock, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const PRIORITY_COLORS = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
};

export default function ActionItemsWidget({ actionItems = [] }) {
  const pendingItems = actionItems.filter(item => !item.completed);
  const urgentItems = pendingItems.filter(item => 
    item.priority === 'critical' || item.priority === 'high'
  );

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-green-400" />
            Action Items
          </CardTitle>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            {pendingItems.length} pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-2xl font-bold text-white">{urgentItems.length}</div>
            <div className="text-xs text-slate-400">High Priority</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-2xl font-bold text-white">{actionItems.length}</div>
            <div className="text-xs text-slate-400">Total Items</div>
          </div>
        </div>

        <div className="space-y-2">
          {pendingItems.slice(0, 4).map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white/5 rounded-lg p-3 border border-white/10 hover:bg-white/10 transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="text-sm text-white font-medium line-clamp-2 flex-1">
                  {item.title || item.task}
                </div>
                <Badge className={PRIORITY_COLORS[item.priority]}>
                  {item.priority}
                </Badge>
              </div>
              {item.timeframe && (
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="w-3 h-3" />
                  {item.timeframe}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {urgentItems.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-red-400">
                You have {urgentItems.length} high-priority items requiring immediate attention
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}