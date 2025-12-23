import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { motion } from 'framer-motion';

/**
 * InlineHelpTip - Small help icon with popup explanation
 * Perfect for explaining specific fields, features, or concepts inline
 * 
 * Usage:
 * <InlineHelpTip content="This field accepts company names or CNPJs" />
 */

export default function InlineHelpTip({ 
  content, 
  title, 
  learnMoreUrl,
  learnMoreText = 'Learn More',
  size = 'sm'
}) {
  const [open, setOpen] = useState(false);

  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5'
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="inline-flex items-center justify-center rounded-full hover:bg-white/10 transition-colors p-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          <HelpCircle className={`${sizeClasses[size]} text-slate-400 hover:text-[#00D4FF] transition-colors cursor-help`} />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-72 bg-gradient-to-br from-[#0A2540] to-[#1A1D29] border-[#00D4FF]/30 p-0"
        align="start"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4"
        >
          {title && (
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-white font-semibold text-sm">{title}</h4>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                className="h-5 w-5 text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}
          
          <p className="text-slate-300 text-xs leading-relaxed mb-3">
            {content}
          </p>

          {learnMoreUrl && (
            <a
              href={learnMoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-[#00D4FF] hover:text-[#00E5FF] text-xs font-medium"
            >
              {learnMoreText}
              <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </motion.div>
      </PopoverContent>
    </Popover>
  );
}