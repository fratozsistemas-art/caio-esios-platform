import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function TemplateSelector({ templates, selectedTemplate, onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
      {templates.map((template, idx) => {
        const isSelected = selectedTemplate === template.value;
        
        return (
          <motion.div
            key={template.value}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card
              onClick={() => onSelect(template.value)}
              className={`cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                isSelected
                  ? 'bg-[#00D4FF]/20 border-[#00D4FF] shadow-[0_0_20px_rgba(0,212,255,0.3)]'
                  : 'bg-white/5 border-white/10 hover:border-white/30'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-3xl">{template.icon}</span>
                  {isSelected && (
                    <CheckCircle className="w-5 h-5 text-[#00D4FF]" />
                  )}
                </div>
                <h3 className={`font-semibold mb-1 ${isSelected ? 'text-[#00D4FF]' : 'text-white'}`}>
                  {template.label}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {template.description}
                </p>
                {template.themes && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {template.themes.slice(0, 2).map((theme, i) => (
                      <Badge 
                        key={i}
                        className={`text-[10px] ${
                          isSelected 
                            ? 'bg-[#00D4FF]/30 text-[#00D4FF] border-[#00D4FF]/40'
                            : 'bg-white/10 text-slate-400 border-white/20'
                        }`}
                      >
                        {theme.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}