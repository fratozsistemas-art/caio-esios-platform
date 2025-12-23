import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * FeatureHighlight - Highlight new or important features
 * Appears as a pulsing badge/overlay to draw attention
 * 
 * Usage:
 * <FeatureHighlight
 *   featureId="workflow-designer-v2"
 *   title="New: Workflow Designer"
 *   description="Build visual AI workflows with drag & drop"
 *   badge="NEW"
 *   position="top-right"
 * >
 *   <YourComponent />
 * </FeatureHighlight>
 */

export default function FeatureHighlight({
  featureId,
  title,
  description,
  badge = 'NEW',
  position = 'top-right',
  autoShow = true,
  delay = 1000,
  children,
  onDismiss
}) {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if feature has been acknowledged
    const acknowledgedFeatures = JSON.parse(
      localStorage.getItem('caio_acknowledged_features') || '[]'
    );
    
    if (acknowledgedFeatures.includes(featureId)) {
      setDismissed(true);
      return;
    }

    // Auto-show after delay
    if (autoShow && !dismissed) {
      const timer = setTimeout(() => {
        setShow(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [featureId, autoShow, delay, dismissed]);

  const handleAcknowledge = () => {
    setShow(false);
    const acknowledgedFeatures = JSON.parse(
      localStorage.getItem('caio_acknowledged_features') || '[]'
    );
    acknowledgedFeatures.push(featureId);
    localStorage.setItem('caio_acknowledged_features', JSON.stringify(acknowledgedFeatures));
    setDismissed(true);
    if (onDismiss) onDismiss();
  };

  const positionClasses = {
    'top-right': 'top-0 right-0',
    'top-left': 'top-0 left-0',
    'bottom-right': 'bottom-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'top-center': 'top-0 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2'
  };

  return (
    <div className="relative inline-block">
      {children}
      
      {/* Pulsing Badge */}
      {!dismissed && (
        <div 
          className={`absolute ${positionClasses[position]} -translate-y-2 translate-x-2 cursor-pointer z-30`}
          onClick={() => setShow(true)}
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg">
              <Sparkles className="w-3 h-3 mr-1" />
              {badge}
            </Badge>
          </motion.div>
        </div>
      )}

      {/* Feature Callout */}
      <AnimatePresence>
        {show && !dismissed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute top-full mt-4 left-1/2 -translate-x-1/2 z-50 w-80"
          >
            <div className="bg-gradient-to-br from-purple-600/90 to-pink-600/90 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 p-4">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl blur-xl -z-10" />
              
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-white" />
                  <h4 className="text-white font-bold">{title}</h4>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleAcknowledge}
                  className="h-6 w-6 text-white/70 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-white/90 text-sm mb-4 leading-relaxed">
                {description}
              </p>

              <Button
                size="sm"
                onClick={handleAcknowledge}
                className="w-full bg-white text-purple-600 hover:bg-white/90 font-semibold"
              >
                Got it, thanks!
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>

              {/* Arrow */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 bg-gradient-to-br from-purple-600 to-pink-600 border-t border-l border-white/20" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}