import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, TrendingUp, TrendingDown, Target } from 'lucide-react';

const METRIC_TYPES = [
  { value: 'conversion', label: 'Conversion', icon: Target },
  { value: 'engagement', label: 'Engagement', icon: TrendingUp },
  { value: 'completion', label: 'Completion', icon: Target },
  { value: 'time_on_task', label: 'Time on Task', icon: TrendingDown },
  { value: 'custom', label: 'Custom', icon: Target }
];

export default function ABTestMetrics({ value = [], onChange }) {
  const [metrics, setMetrics] = useState(value || [
    { metric_name: 'conversion', metric_type: 'conversion', goal: 'maximize' }
  ]);

  const updateMetrics = (newMetrics) => {
    setMetrics(newMetrics);
    onChange?.(newMetrics);
  };

  const addMetric = () => {
    updateMetrics([
      ...metrics,
      { metric_name: '', metric_type: 'conversion', goal: 'maximize' }
    ]);
  };

  const removeMetric = (index) => {
    updateMetrics(metrics.filter((_, i) => i !== index));
  };

  const updateMetric = (index, updates) => {
    updateMetrics(metrics.map((m, i) => i === index ? { ...m, ...updates } : m));
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Target Metrics
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={addMetric}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Metric
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {metrics.map((metric, index) => {
          const metricType = METRIC_TYPES.find(t => t.value === metric.metric_type);
          const Icon = metricType?.icon || Target;

          return (
            <div key={index} className="p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded bg-green-500/20">
                  <Icon className="w-4 h-4 text-green-400" />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <Label className="text-white text-xs mb-1">Metric Name</Label>
                    <Input
                      value={metric.metric_name}
                      onChange={(e) => updateMetric(index, { metric_name: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white text-sm"
                      placeholder="e.g., signup_completion"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-white text-xs mb-1">Type</Label>
                      <Select
                        value={metric.metric_type}
                        onValueChange={(value) => updateMetric(index, { metric_type: value })}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {METRIC_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-white text-xs mb-1">Goal</Label>
                      <Select
                        value={metric.goal}
                        onValueChange={(value) => updateMetric(index, { goal: value })}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="maximize">Maximize</SelectItem>
                          <SelectItem value="minimize">Minimize</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {metric.metric_type !== 'custom' && (
                    <div>
                      <Label className="text-white text-xs mb-1">Target Value (optional)</Label>
                      <Input
                        type="number"
                        value={metric.target_value || ''}
                        onChange={(e) => updateMetric(index, { target_value: parseFloat(e.target.value) })}
                        className="bg-slate-800 border-slate-700 text-white text-sm"
                        placeholder="e.g., 75"
                      />
                    </div>
                  )}
                </div>
                
                {metrics.length > 1 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeMetric(index)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        {metrics.length === 0 && (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm mb-3">No metrics defined</p>
            <Button
              size="sm"
              onClick={addMetric}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Metric
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}