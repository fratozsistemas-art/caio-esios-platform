import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  RefreshCw, AlertTriangle, CheckCircle, ArrowRight, 
  GitBranch, Zap, Shield, TrendingUp
} from 'lucide-react';

const REROUTE_STRATEGIES = [
  { value: 'fallback_agent', label: 'Fallback Agent', description: 'Use alternative agent on failure' },
  { value: 'retry_with_modifications', label: 'Retry with Modifications', description: 'Retry with adjusted parameters' },
  { value: 'skip_and_continue', label: 'Skip and Continue', description: 'Skip failed step, continue workflow' },
  { value: 'human_escalation', label: 'Human Escalation', description: 'Notify human for intervention' },
  { value: 'parallel_retry', label: 'Parallel Retry', description: 'Try multiple strategies simultaneously' }
];

const QUALITY_METRICS = [
  { value: 'confidence_score', label: 'Confidence Score' },
  { value: 'completeness', label: 'Response Completeness' },
  { value: 'relevance', label: 'Relevance Score' },
  { value: 'factual_accuracy', label: 'Factual Accuracy' }
];

export default function SelfCorrectionConfig({ config, onChange }) {
  const [localConfig, setLocalConfig] = useState(config || {
    enabled: false,
    max_corrections: 3,
    quality_threshold: 0.7,
    reroute_on_failure: true,
    reroute_strategy: 'fallback_agent',
    quality_metrics: ['confidence_score'],
    correction_rules: [],
    escalation_threshold: 2
  });

  const updateConfig = (updates) => {
    const newConfig = { ...localConfig, ...updates };
    setLocalConfig(newConfig);
    onChange?.(newConfig);
  };

  const addCorrectionRule = () => {
    updateConfig({
      correction_rules: [
        ...localConfig.correction_rules,
        {
          id: `rule_${Date.now()}`,
          condition: 'quality_below_threshold',
          action: 'retry',
          parameters: {}
        }
      ]
    });
  };

  const removeRule = (ruleId) => {
    updateConfig({
      correction_rules: localConfig.correction_rules.filter(r => r.id !== ruleId)
    });
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-purple-400" />
          Self-Correction Configuration
          {localConfig.enabled && (
            <Badge className="bg-green-500/20 text-green-400 ml-2">Active</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable Toggle */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-purple-400" />
            <div>
              <Label className="text-white">Enable Self-Correction</Label>
              <p className="text-xs text-slate-500">Allow agents to automatically retry and correct failures</p>
            </div>
          </div>
          <Switch
            checked={localConfig.enabled}
            onCheckedChange={(checked) => updateConfig({ enabled: checked })}
          />
        </div>

        {localConfig.enabled && (
          <>
            {/* Quality Threshold */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-slate-300">Quality Threshold</Label>
                <span className="text-sm text-purple-400 font-mono">
                  {Math.round(localConfig.quality_threshold * 100)}%
                </span>
              </div>
              <Slider
                value={[localConfig.quality_threshold * 100]}
                onValueChange={([value]) => updateConfig({ quality_threshold: value / 100 })}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-slate-500">
                Responses below this threshold will trigger correction attempts
              </p>
            </div>

            {/* Max Corrections */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Max Correction Attempts</Label>
                <Input
                  type="number"
                  value={localConfig.max_corrections}
                  onChange={(e) => updateConfig({ max_corrections: parseInt(e.target.value) || 3 })}
                  className="mt-2 bg-white/5 border-white/10 text-white"
                  min={1}
                  max={10}
                />
              </div>
              <div>
                <Label className="text-slate-300">Escalation Threshold</Label>
                <Input
                  type="number"
                  value={localConfig.escalation_threshold}
                  onChange={(e) => updateConfig({ escalation_threshold: parseInt(e.target.value) || 2 })}
                  className="mt-2 bg-white/5 border-white/10 text-white"
                  min={1}
                  max={10}
                />
              </div>
            </div>

            {/* Reroute Strategy */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-slate-300">Reroute Strategy on Failure</Label>
                <Switch
                  checked={localConfig.reroute_on_failure}
                  onCheckedChange={(checked) => updateConfig({ reroute_on_failure: checked })}
                />
              </div>
              
              {localConfig.reroute_on_failure && (
                <div className="grid grid-cols-1 gap-2 mt-3">
                  {REROUTE_STRATEGIES.map(strategy => (
                    <div
                      key={strategy.value}
                      onClick={() => updateConfig({ reroute_strategy: strategy.value })}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        localConfig.reroute_strategy === strategy.value
                          ? 'bg-purple-500/20 border-purple-500/50'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          localConfig.reroute_strategy === strategy.value
                            ? 'bg-purple-500'
                            : 'bg-white/20'
                        }`} />
                        <div>
                          <p className="text-sm text-white">{strategy.label}</p>
                          <p className="text-xs text-slate-500">{strategy.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quality Metrics */}
            <div className="space-y-3">
              <Label className="text-slate-300">Quality Metrics to Monitor</Label>
              <div className="flex flex-wrap gap-2">
                {QUALITY_METRICS.map(metric => (
                  <Badge
                    key={metric.value}
                    onClick={() => {
                      const metrics = localConfig.quality_metrics || [];
                      const newMetrics = metrics.includes(metric.value)
                        ? metrics.filter(m => m !== metric.value)
                        : [...metrics, metric.value];
                      updateConfig({ quality_metrics: newMetrics });
                    }}
                    className={`cursor-pointer transition-all ${
                      localConfig.quality_metrics?.includes(metric.value)
                        ? 'bg-purple-500/30 text-purple-300 border-purple-500/50'
                        : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {metric.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Correction Rules */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-slate-300">Custom Correction Rules</Label>
                <Button
                  size="sm"
                  onClick={addCorrectionRule}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Add Rule
                </Button>
              </div>
              
              {localConfig.correction_rules?.map((rule, idx) => (
                <div 
                  key={rule.id} 
                  className="p-3 bg-white/5 rounded-lg border border-white/10 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Rule #{idx + 1}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeRule(rule.id)}
                      className="h-6 w-6 p-0 text-red-400"
                    >
                      ×
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      value={rule.condition}
                      onValueChange={(value) => {
                        updateConfig({
                          correction_rules: localConfig.correction_rules.map(r =>
                            r.id === rule.id ? { ...r, condition: value } : r
                          )
                        });
                      }}
                    >
                      <SelectTrigger className="h-8 bg-white/5 border-white/10 text-white text-xs">
                        <SelectValue placeholder="Condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quality_below_threshold">Quality Below Threshold</SelectItem>
                        <SelectItem value="timeout">Timeout</SelectItem>
                        <SelectItem value="error">Error Response</SelectItem>
                        <SelectItem value="incomplete">Incomplete Response</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={rule.action}
                      onValueChange={(value) => {
                        updateConfig({
                          correction_rules: localConfig.correction_rules.map(r =>
                            r.id === rule.id ? { ...r, action: value } : r
                          )
                        });
                      }}
                    >
                      <SelectTrigger className="h-8 bg-white/5 border-white/10 text-white text-xs">
                        <SelectValue placeholder="Action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="retry">Retry</SelectItem>
                        <SelectItem value="reroute">Reroute</SelectItem>
                        <SelectItem value="skip">Skip</SelectItem>
                        <SelectItem value="escalate">Escalate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>

            {/* Visual Flow Preview */}
            <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
              <p className="text-xs text-purple-400 mb-3">Correction Flow Preview</p>
              <div className="flex items-center justify-center gap-2 text-xs">
                <div className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/20 rounded text-blue-400">
                  <Zap className="w-3 h-3" />
                  Execute
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500" />
                <div className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500/20 rounded text-yellow-400">
                  <TrendingUp className="w-3 h-3" />
                  Evaluate
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500" />
                <div className="flex items-center gap-1 px-3 py-1.5 bg-purple-500/20 rounded text-purple-400">
                  <RefreshCw className="w-3 h-3" />
                  Correct
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500" />
                <div className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 rounded text-green-400">
                  <CheckCircle className="w-3 h-3" />
                  Complete
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}