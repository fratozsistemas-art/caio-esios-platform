import React from "react";
import { Badge } from "@/components/ui/badge";

const MODULES = ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "M9", "M10", "M11"];

const MODULE_COLORS = {
  M1: "#3B82F6", M2: "#8B5CF6", M3: "#06B6D4", M4: "#10B981", M5: "#F59E0B",
  M6: "#F97316", M7: "#EF4444", M8: "#6366F1", M9: "#14B8A6", M10: "#EC4899", M11: "#F59E0B"
};

export default function SynergyMap({ synergies }) {
  // Build connection matrix
  const connections = {};
  synergies?.forEach(syn => {
    const modules = syn.modules_to_combine || [];
    modules.forEach((m1, i) => {
      modules.forEach((m2, j) => {
        if (i < j) {
          const key = `${m1}-${m2}`;
          connections[key] = (connections[key] || 0) + 1;
        }
      });
    });
  });

  const maxConnections = Math.max(...Object.values(connections), 1);

  return (
    <div className="space-y-4">
      {/* Module Grid */}
      <div className="flex flex-wrap gap-2 justify-center">
        {MODULES.map(m => (
          <div
            key={m}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold"
            style={{ 
              background: `${MODULE_COLORS[m]}30`,
              color: MODULE_COLORS[m],
              border: `1px solid ${MODULE_COLORS[m]}50`
            }}
          >
            {m}
          </div>
        ))}
      </div>

      {/* Connection List */}
      <div className="space-y-2">
        {Object.entries(connections)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([key, count]) => {
            const [m1, m2] = key.split('-');
            const strength = (count / maxConnections) * 100;
            return (
              <div key={key} className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Badge style={{ background: `${MODULE_COLORS[m1]}30`, color: MODULE_COLORS[m1] }}>{m1}</Badge>
                  <span className="text-slate-500">↔</span>
                  <Badge style={{ background: `${MODULE_COLORS[m2]}30`, color: MODULE_COLORS[m2] }}>{m2}</Badge>
                </div>
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                    style={{ width: `${strength}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400">{count} synergies</span>
              </div>
            );
          })}
      </div>

      {Object.keys(connections).length === 0 && (
        <p className="text-sm text-slate-500 text-center py-4">
          Run modules and Strategy Coach to map synergies
        </p>
      )}
    </div>
  );
}