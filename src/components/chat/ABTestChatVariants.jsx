import React from 'react';
import ABTestWrapper from '@/components/abtesting/ABTestWrapper';
import { useABTest } from '@/components/abtesting/ABTestProvider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap, Brain } from 'lucide-react';

/**
 * A/B Testing for Chat Interface
 * Tests different AI response styles and UI layouts
 */
export default function ABTestChatVariants({ children }) {
  const { trackInteraction, trackConversion } = useABTest();

  return (
    <ABTestWrapper testName="chat_interface" fallback={children}>
      {(variant) => {
        // Track impression
        React.useEffect(() => {
          trackInteraction('chat_interface', 'chat_opened');
        }, []);

        // Variant-specific configurations
        const variantConfig = {
          control: {
            layout: 'traditional',
            aiStyle: 'detailed',
            quickActions: false,
            suggestionStyle: 'minimal'
          },
          variant_a: {
            layout: 'modern',
            aiStyle: 'concise',
            quickActions: true,
            suggestionStyle: 'prominent'
          }
        };

        const config = variantConfig[variant.id] || variantConfig.control;

        return (
          <div className="relative">
            {/* Variant indicator for testing */}
            <div className="absolute top-2 right-2 z-10">
              <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                Testing: {variant.name}
              </Badge>
            </div>

            {/* Quick Actions (variant A only) */}
            {config.quickActions && (
              <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
                <p className="text-xs text-slate-400 mb-2">Quick Start:</p>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      trackInteraction('chat_interface', 'quick_action_clicked');
                    }}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Brain className="w-3 h-3 mr-1" />
                    Analyze Market
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      trackInteraction('chat_interface', 'quick_action_clicked');
                    }}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Strategic Synthesis
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      trackInteraction('chat_interface', 'quick_action_clicked');
                    }}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    Generate Report
                  </Button>
                </div>
              </div>
            )}

            {/* Original children with variant context */}
            {typeof children === 'function' ? children(variant, config) : children}
          </div>
        );
      }}
    </ABTestWrapper>
  );
}