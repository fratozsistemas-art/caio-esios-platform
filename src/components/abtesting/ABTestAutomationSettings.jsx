import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Zap, Calendar, GitBranch, PauseCircle, Trophy } from 'lucide-react';

export default function ABTestAutomationSettings({ value = {}, onChange }) {
  const settings = {
    auto_start: value?.auto_start ?? false,
    auto_declare_winner: value?.auto_declare_winner ?? true,
    min_confidence: value?.min_confidence ?? 95,
    min_sample_size: value?.min_sample_size ?? 100,
    auto_pause_low_performance: value?.auto_pause_low_performance ?? false,
    auto_deploy: value?.auto_deploy ?? false,
    deployment_environment: value?.deployment_environment ?? 'production',
    ...value
  };

  const updateSetting = (key, val) => {
    onChange({ ...settings, [key]: val });
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-400" />
          <CardTitle className="text-white">Automation Settings</CardTitle>
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 ml-auto">
            Smart Testing
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Auto Start */}
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Calendar className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <Label className="text-white font-medium">Auto-Start Scheduled Tests</Label>
              <p className="text-sm text-slate-400 mt-1">
                Automatically start tests when their start_date is reached
              </p>
            </div>
          </div>
          <Switch
            checked={settings.auto_start}
            onCheckedChange={(checked) => updateSetting('auto_start', checked)}
          />
        </div>

        {/* Auto Declare Winner */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3 flex-1">
              <Trophy className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div>
                <Label className="text-white font-medium">Auto-Declare Winner</Label>
                <p className="text-sm text-slate-400 mt-1">
                  Automatically complete tests when statistical significance is reached
                </p>
              </div>
            </div>
            <Switch
              checked={settings.auto_declare_winner}
              onCheckedChange={(checked) => updateSetting('auto_declare_winner', checked)}
            />
          </div>

          {settings.auto_declare_winner && (
            <div className="ml-8 space-y-3 pl-4 border-l-2 border-white/10">
              <div>
                <Label className="text-sm text-slate-400">Minimum Confidence Level (%)</Label>
                <Input
                  type="number"
                  min="80"
                  max="99"
                  value={settings.min_confidence}
                  onChange={(e) => updateSetting('min_confidence', parseInt(e.target.value))}
                  className="bg-slate-800 border-slate-700 text-white mt-1"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Default: 95% (industry standard)
                </p>
              </div>

              <div>
                <Label className="text-sm text-slate-400">Minimum Sample Size (per variant)</Label>
                <Input
                  type="number"
                  min="50"
                  max="10000"
                  value={settings.min_sample_size}
                  onChange={(e) => updateSetting('min_sample_size', parseInt(e.target.value))}
                  className="bg-slate-800 border-slate-700 text-white mt-1"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Minimum impressions required before declaring a winner
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Auto Pause Low Performance */}
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3 flex-1">
            <PauseCircle className="w-5 h-5 text-orange-400 mt-0.5" />
            <div>
              <Label className="text-white font-medium">Auto-Pause Low Performance</Label>
              <p className="text-sm text-slate-400 mt-1">
                Pause tests with {"<"}1% conversion rate after 500+ impressions
              </p>
            </div>
          </div>
          <Switch
            checked={settings.auto_pause_low_performance}
            onCheckedChange={(checked) => updateSetting('auto_pause_low_performance', checked)}
          />
        </div>

        {/* Auto Deploy */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3 flex-1">
              <GitBranch className="w-5 h-5 text-green-400 mt-0.5" />
              <div>
                <Label className="text-white font-medium">Auto-Deploy Winners</Label>
                <p className="text-sm text-slate-400 mt-1">
                  Automatically deploy winning variants via CI/CD pipeline
                </p>
              </div>
            </div>
            <Switch
              checked={settings.auto_deploy}
              onCheckedChange={(checked) => updateSetting('auto_deploy', checked)}
            />
          </div>

          {settings.auto_deploy && (
            <div className="ml-8 pl-4 border-l-2 border-white/10">
              <Label className="text-sm text-slate-400">Deployment Environment</Label>
              <Select
                value={settings.deployment_environment}
                onValueChange={(value) => updateSetting('deployment_environment', value)}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 mt-1">
                Where winning variants will be deployed
              </p>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-white/10">
          <p className="text-xs text-slate-400">
            💡 <strong>Tip:</strong> Automation runs every 5 minutes via scheduled job. You can also trigger manually from the dashboard.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}