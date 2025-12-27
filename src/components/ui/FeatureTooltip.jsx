import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, Info } from 'lucide-react';

export default function FeatureTooltip({ 
  children, 
  content, 
  side = "top",
  showIcon = true,
  iconType = "info"
}) {
  const Icon = iconType === "help" ? HelpCircle : Info;
  
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          {showIcon ? (
            <button className="inline-flex items-center">
              {children}
              <Icon className="w-4 h-4 ml-1 text-slate-400 hover:text-slate-300 transition-colors" />
            </button>
          ) : (
            children
          )}
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          className="max-w-xs bg-slate-900 border-slate-700 text-white p-3"
        >
          <p className="text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}