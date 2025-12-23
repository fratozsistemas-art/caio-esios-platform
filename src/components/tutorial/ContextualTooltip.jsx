import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lightbulb, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * ContextualTooltip - Smart tooltip system that appears based on user behavior
 * 
 * Usage:
 * <ContextualTooltip
 *   id="dashboard-metrics"
 *   title="Real-Time Metrics"
 *   content="These metrics update automatically every 30 seconds"
 *   position="bottom"
 *   trigger="hover"
 * />
 */

export default function ContextualTooltip({ 
  id, 
  title, 
  content, 
  position = 'bottom',
  trigger = 'auto', // 'auto', 'hover', 'click'
  delay = 2000,
  children,
  actionText,
  onAction
}) {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed this tooltip
    const dismissedTooltips = JSON.parse(localStorage.getItem('caio_dismissed_tooltips') || '[]');
    if (dismissedTooltips.includes(id)) {
      setDismissed(true);
      return;
    }

    // Auto-show after delay if trigger is 'auto'
    if (trigger === 'auto' && !dismissed) {
      const timer = setTimeout(() => {
        setShow(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [id, trigger, delay, dismissed]);

  const handleDismiss = () => {
    setShow(false);
    const dismissedTooltips = JSON.parse(localStorage.getItem('caio_dismissed_tooltips') || '[]');
    dismissedTooltips.push(id);
    localStorage.setItem('caio_dismissed_tooltips', JSON.stringify(dismissedTooltips));
    setDismissed(true);
  };

  const handleAction = () => {
    if (onAction) onAction();
    handleDismiss();
  };

  const positionClasses = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
    'bottom-left': 'top-full mt-2 left-0',
    'bottom-right': 'top-full mt-2 right-0'
  };

  if (dismissed) return children || null;

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => trigger === 'hover' && setShow(true)}
      onMouseLeave={() => trigger === 'hover' && setShow(false)}
      onClick={() => trigger === 'click' && setShow(!show)}
    >
      {children}
      
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: position.includes('top') ? 10 : -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: position.includes('top') ? 10 : -10 }}
            className={`absolute z-50 ${positionClasses[position]} w-72`}
          >
            <div className="bg-gradient-to-br from-[#0A2540] to-[#1A1D29] border border-[#C7A763]/40 rounded-xl shadow-2xl p-4 backdrop-blur-xl">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-[#C7A763]/5 rounded-xl blur-xl -z-10" />
              
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[#C7A763]/20 flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-4 h-4 text-[#E3C37B]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-semibold text-sm mb-1">{title}</h4>
                  <p className="text-slate-300 text-xs leading-relaxed">{content}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDismiss}
                  className="h-6 w-6 text-slate-400 hover:text-white flex-shrink-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {actionText && onAction && (
                  <Button
                    size="sm"
                    onClick={handleAction}
                    className="bg-[#C7A763] hover:bg-[#E3C37B] text-[#0A1628] text-xs h-7"
                  >
                    {actionText}
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="text-slate-400 hover:text-white text-xs h-7"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Got it
                </Button>
              </div>

              {/* Arrow pointer */}
              <div 
                className={`absolute w-3 h-3 rotate-45 bg-gradient-to-br from-[#0A2540] to-[#1A1D29] border-[#C7A763]/40 ${
                  position === 'bottom' ? '-top-1.5 left-1/2 -translate-x-1/2 border-t border-l' :
                  position === 'top' ? '-bottom-1.5 left-1/2 -translate-x-1/2 border-b border-r' :
                  position === 'right' ? '-left-1.5 top-1/2 -translate-y-1/2 border-l border-b' :
                  position === 'left' ? '-right-1.5 top-1/2 -translate-y-1/2 border-r border-t' :
                  position === 'bottom-left' ? '-top-1.5 left-6 border-t border-l' :
                  '-top-1.5 right-6 border-t border-l'
                }`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}