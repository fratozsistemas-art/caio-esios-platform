import React from "react";
import { Shield, TrendingUp, AlertTriangle } from "lucide-react";

export default function StrategicHealthGauge({ score }) {
  const getHealthStatus = (s) => {
    if (s >= 80) return { label: "Excellent", color: "text-green-400", icon: TrendingUp, bg: "from-green-500/20 to-emerald-500/20" };
    if (s >= 60) return { label: "Good", color: "text-yellow-400", icon: Shield, bg: "from-yellow-500/20 to-amber-500/20" };
    if (s >= 40) return { label: "Needs Attention", color: "text-orange-400", icon: AlertTriangle, bg: "from-orange-500/20 to-red-500/20" };
    return { label: "Critical", color: "text-red-400", icon: AlertTriangle, bg: "from-red-500/20 to-rose-500/20" };
  };

  const status = getHealthStatus(score);
  const Icon = status.icon;

  // Calculate gauge angle (0-180 degrees)
  const angle = (score / 100) * 180;

  return (
    <div className="text-center">
      <div className="relative w-48 h-24 mx-auto mb-4">
        {/* Background arc */}
        <svg className="w-full h-full" viewBox="0 0 200 100">
          <path
            d="M 10 100 A 90 90 0 0 1 190 100"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="20"
            strokeLinecap="round"
          />
          {/* Colored arc */}
          <path
            d="M 10 100 A 90 90 0 0 1 190 100"
            fill="none"
            stroke={score >= 80 ? "#10B981" : score >= 60 ? "#F59E0B" : score >= 40 ? "#F97316" : "#EF4444"}
            strokeWidth="20"
            strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 283} 283`}
          />
        </svg>
        
        {/* Score display */}
        <div className="absolute inset-0 flex items-end justify-center pb-2">
          <div className="text-center">
            <span className={`text-4xl font-bold ${status.color}`}>{score}</span>
            <span className="text-lg text-slate-400">%</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        <Icon className={`w-5 h-5 ${status.color}`} />
        <span className={`font-semibold ${status.color}`}>{status.label}</span>
      </div>
      <p className="text-xs text-slate-400 mt-1">Strategic Alignment Score</p>
    </div>
  );
}