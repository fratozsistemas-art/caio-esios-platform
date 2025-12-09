import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const AVAILABLE_THEMES = [
  { value: "executive_decisions", label: "Executive Decisions", icon: "👔", color: "purple" },
  { value: "strategic_insights", label: "Strategic Insights", icon: "🎯", color: "cyan" },
  { value: "financial_planning", label: "Financial Planning", icon: "💰", color: "green" },
  { value: "market", label: "Market Intelligence", icon: "📊", color: "blue" },
  { value: "transformation", label: "Digital Transformation", icon: "🚀", color: "indigo" },
  { value: "enterprise_risk", label: "Enterprise Risk", icon: "🛡️", color: "red" },
  { value: "ma_opportunities", label: "M&A Opportunities", icon: "🤝", color: "amber" },
  { value: "ai_strategy", label: "AI Strategy", icon: "🤖", color: "violet" },
  { value: "operations_intelligence", label: "Operations Intelligence", icon: "⚙️", color: "slate" },
  { value: "business_intelligence", label: "Business Intelligence", icon: "📈", color: "emerald" },
  { value: "growth", label: "Growth Strategy", icon: "📈", color: "teal" },
  { value: "innovation", label: "Innovation", icon: "💡", color: "yellow" },
  { value: "customer_success", label: "Customer Success", icon: "😊", color: "pink" },
  { value: "efficiency", label: "Efficiency", icon: "⚡", color: "orange" },
  { value: "execution", label: "Execution Excellence", icon: "✅", color: "lime" }
];

export default function ThemeSelector({ selectedThemes = [], onToggleTheme }) {
  const colorMap = {
    purple: "border-purple-500/40 bg-purple-500/20 text-purple-300",
    cyan: "border-cyan-500/40 bg-cyan-500/20 text-cyan-300",
    green: "border-green-500/40 bg-green-500/20 text-green-300",
    blue: "border-blue-500/40 bg-blue-500/20 text-blue-300",
    indigo: "border-indigo-500/40 bg-indigo-500/20 text-indigo-300",
    red: "border-red-500/40 bg-red-500/20 text-red-300",
    amber: "border-amber-500/40 bg-amber-500/20 text-amber-300",
    violet: "border-violet-500/40 bg-violet-500/20 text-violet-300",
    slate: "border-slate-500/40 bg-slate-500/20 text-slate-300",
    emerald: "border-emerald-500/40 bg-emerald-500/20 text-emerald-300",
    teal: "border-teal-500/40 bg-teal-500/20 text-teal-300",
    yellow: "border-yellow-500/40 bg-yellow-500/20 text-yellow-300",
    pink: "border-pink-500/40 bg-pink-500/20 text-pink-300",
    orange: "border-orange-500/40 bg-orange-500/20 text-orange-300",
    lime: "border-lime-500/40 bg-lime-500/20 text-lime-300"
  };

  return (
    <div>
      <p className="text-sm text-slate-400 mb-3">
        Selecione temas relevantes (múltipla escolha):
      </p>
      <div className="grid grid-cols-3 gap-2 max-h-[280px] overflow-y-auto pr-2">
        {AVAILABLE_THEMES.map((theme, idx) => {
          const isSelected = selectedThemes.includes(theme.value);
          
          return (
            <motion.button
              key={theme.value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              onClick={() => onToggleTheme(theme.value)}
              className={`relative p-3 rounded-lg border-2 text-left transition-all duration-200 hover:scale-[1.02] ${
                isSelected
                  ? colorMap[theme.color]
                  : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/30'
              }`}
            >
              {isSelected && (
                <CheckCircle className="absolute top-2 right-2 w-4 h-4" />
              )}
              <div className="text-xl mb-1">{theme.icon}</div>
              <p className="text-xs font-medium leading-tight pr-5">{theme.label}</p>
            </motion.button>
          );
        })}
      </div>
      {selectedThemes.length > 0 && (
        <p className="text-xs text-[#00D4FF] mt-3">
          {selectedThemes.length} tema{selectedThemes.length > 1 ? 's' : ''} selecionado{selectedThemes.length > 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}