import React from "react";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, ArrowRight } from "lucide-react";

export default function InsightCard({ insight }) {
  return (
    <div className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all">
      <div className="flex items-start gap-3">
        <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-white">{insight.title || insight.insight || insight}</p>
          {insight.source_modules && (
            <div className="flex items-center gap-1 mt-2">
              {insight.source_modules.map((m, i) => (
                <Badge key={i} className="bg-cyan-500/20 text-cyan-400 text-xs">{m}</Badge>
              ))}
            </div>
          )}
          {insight.recommended_action && (
            <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
              <ArrowRight className="w-3 h-3" />
              {insight.recommended_action}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}