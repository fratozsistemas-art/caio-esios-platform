import React, { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { HelpCircle, X, Lightbulb, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * FeatureTooltip - Contextual tooltip for complex features
 * Usage: <FeatureTooltip id="unique-id" title="Feature Name" content="Explanation...">
 *          <YourComponent />
 *        </FeatureTooltip>
 */
export function FeatureTooltip({ 
  children, 
  id, 
  title, 
  content, 
  tips = [],
  side = 'top',
  showIcon = false,
  variant = 'default' // 'default' | 'pro' | 'new'
}) {
  const [open, setOpen] = useState(false);

  const variantStyles = {
    default: {
      bg: 'from-slate-800 to-slate-900',
      border: 'border-slate-700',
      accent: '#00D4FF'
    },
    pro: {
      bg: 'from-purple-900/90 to-slate-900',
      border: 'border-purple-500/30',
      accent: '#A855F7'
    },
    new: {
      bg: 'from-amber-900/90 to-slate-900',
      border: 'border-amber-500/30',
      accent: '#FFB800'
    }
  };

  const style = variantStyles[variant];

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center gap-1 cursor-help">
            {children}
            {showIcon && (
              <HelpCircle className="w-4 h-4 text-slate-400 hover:text-[#00D4FF] transition-colors" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          className={`max-w-sm p-0 bg-gradient-to-br ${style.bg} ${style.border} border shadow-xl`}
          sideOffset={8}
        >
          <div className="p-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                {variant === 'pro' && <Sparkles className="w-4 h-4 text-purple-400" />}
                {variant === 'new' && <Lightbulb className="w-4 h-4 text-amber-400" />}
                <h4 className="font-semibold text-white text-sm">{title}</h4>
              </div>
              {variant !== 'default' && (
                <span 
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ 
                    background: `${style.accent}20`, 
                    color: style.accent 
                  }}
                >
                  {variant === 'pro' ? 'PRO TIP' : 'NEW'}
                </span>
              )}
            </div>

            {/* Content */}
            <p className="text-sm text-slate-300 leading-relaxed mb-3">{content}</p>

            {/* Tips */}
            {tips.length > 0 && (
              <div className="bg-white/5 rounded-lg p-3">
                <ul className="space-y-1.5">
                  {tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-400">
                      <span style={{ color: style.accent }}>•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Arrow indicator */}
          <div 
            className="absolute w-2 h-2 rotate-45"
            style={{
              background: 'linear-gradient(135deg, rgb(30, 41, 59), rgb(15, 23, 42))',
              ...(side === 'top' ? { bottom: '-4px', left: '50%', transform: 'translateX(-50%) rotate(45deg)' } : {}),
              ...(side === 'bottom' ? { top: '-4px', left: '50%', transform: 'translateX(-50%) rotate(45deg)' } : {}),
              ...(side === 'left' ? { right: '-4px', top: '50%', transform: 'translateY(-50%) rotate(45deg)' } : {}),
              ...(side === 'right' ? { left: '-4px', top: '50%', transform: 'translateY(-50%) rotate(45deg)' } : {}),
            }}
          />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * InfoBadge - Inline help badge for field labels
 */
export function InfoBadge({ content, variant = 'default' }) {
  return (
    <FeatureTooltip
      id="info-badge"
      title="Info"
      content={content}
      variant={variant}
    >
      <HelpCircle className="w-3.5 h-3.5 text-slate-500 hover:text-[#00D4FF] transition-colors cursor-help" />
    </FeatureTooltip>
  );
}

/**
 * NewFeatureBadge - Badge to highlight new features
 */
export function NewFeatureBadge({ 
  children, 
  title, 
  description,
  tips = []
}) {
  return (
    <FeatureTooltip
      id="new-feature"
      title={title}
      content={description}
      tips={tips}
      variant="new"
    >
      <div className="relative inline-flex">
        {children}
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
        </span>
      </div>
    </FeatureTooltip>
  );
}

export default FeatureTooltip;