import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, ChevronDown, ChevronUp, CheckCircle2, 
  Clock, AlertCircle, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SubTeamProgressCard({ subTeam, isExpanded, onToggle }) {
  const { name, agents = [], status = 'running', progress = 0 } = subTeam;

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'running':
        return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-slate-400" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'running':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'pending':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <Card className={`bg-white/5 border ${getStatusColor()} cursor-pointer transition-all hover:bg-white/10`}>
      <div className="p-3" onClick={onToggle}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-white">{name}</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <Button variant="ghost" size="icon" className="h-6 w-6">
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-2">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">{agents.length} agents</span>
          <span className="text-white font-medium">{Math.round(progress)}%</span>
        </div>

        {/* Expanded View */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 pt-3 border-t border-white/10 space-y-2"
            >
              {agents.map((agent, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-white/5 rounded"
                >
                  <span className="text-xs text-white">{agent.name || agent}</span>
                  <Badge className="text-xs" variant="outline">
                    {agent.status || 'running'}
                  </Badge>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}