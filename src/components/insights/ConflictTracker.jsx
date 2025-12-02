import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ConflictTracker({ conflicts }) {
  const [expandedId, setExpandedId] = useState(null);
  const [resolvedIds, setResolvedIds] = useState([]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "high": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default: return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    }
  };

  const toggleResolved = (id) => {
    setResolvedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  if (!conflicts || conflicts.length === 0) {
    return (
      <Card className="bg-green-500/10 border-green-500/30">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">No Conflicts Detected</h3>
          <p className="text-sm text-slate-400">Your strategic modules are aligned</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {conflicts.map((conflict, idx) => {
        const isResolved = resolvedIds.includes(idx);
        const isExpanded = expandedId === idx;

        return (
          <Card 
            key={idx} 
            className={`${isResolved ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'} transition-all`}
          >
            <CardContent className="p-4">
              <div 
                className="flex items-start justify-between cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : idx)}
              >
                <div className="flex items-start gap-3">
                  {isResolved ? (
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                  )}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {conflict.modules_involved?.map((m, i) => (
                        <React.Fragment key={i}>
                          <Badge className="bg-white/10 text-white text-xs">{m}</Badge>
                          {i < conflict.modules_involved.length - 1 && <span className="text-red-400">⚡</span>}
                        </React.Fragment>
                      ))}
                    </div>
                    <p className={`text-sm ${isResolved ? 'text-slate-400 line-through' : 'text-white'}`}>
                      {conflict.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getSeverityColor(conflict.severity)}>{conflict.severity}</Badge>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                      {conflict.resolution_options?.map((res, i) => (
                        <div 
                          key={i} 
                          className={`p-3 rounded-lg ${res.recommended ? 'bg-green-500/10 border border-green-500/30' : 'bg-white/5'}`}
                        >
                          <div className="flex items-start gap-2">
                            {res.recommended && <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />}
                            <div>
                              <p className="text-sm text-white">{res.option}</p>
                              <p className="text-xs text-slate-400 mt-1">Trade-off: {res.trade_off}</p>
                            </div>
                          </div>
                        </div>
                      ))}

                      <Button
                        onClick={(e) => { e.stopPropagation(); toggleResolved(idx); }}
                        variant="outline"
                        size="sm"
                        className={isResolved ? "border-green-500/50 text-green-400" : "border-white/20 text-white"}
                      >
                        {isResolved ? "Mark as Unresolved" : "Mark as Resolved"}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}