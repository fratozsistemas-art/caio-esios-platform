import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, Bell, User, Shield, Palette, Database, 
  Mail, MessageSquare, TrendingUp, CheckCircle, Save,
  RefreshCw, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

export default function UserSettings() {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({
    notifications: {
      email_alerts: true,
      agent_notifications: true,
      strategy_updates: true,
      knowledge_graph_updates: false,
      weekly_digest: true
    },
    preferences: {
      theme: 'dark',
      default_view: 'dashboard',
      analytics_frequency: 'daily',
      auto_save: true,
      tutorial_mode: false
    },
    privacy: {
      profile_visible: true,
      activity_visible: true,
      allow_mentions: true
    }
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      // Load user settings if they exist
      if (u.user_settings) {
        setSettings(u.user_settings);
      }
    });
  }, []);

  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings) => {
      await base44.auth.updateMe({
        user_settings: newSettings
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      toast.success('Settings saved successfully!');
    }
  });

  const resetOnboardingMutation = useMutation({
    mutationFn: async () => {
      await base44.auth.updateMe({
        onboarding_completed: false,
        onboarding_date: null
      });
    },
    onSuccess: () => {
      toast.success('Onboarding reset! Refresh the page to start again.');
    }
  });

  const handleSaveSettings = () => {
    saveSettingsMutation.mutate(settings);
  };

  const updateNotification = (key, value) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: value
      }
    });
  };

  const updatePreference = (key, value) => {
    setSettings({
      ...settings,
      preferences: {
        ...settings.preferences,
        [key]: value
      }
    });
  };

  const updatePrivacy = (key, value) => {
    setSettings({
      ...settings,
      privacy: {
        ...settings.privacy,
        [key]: value
      }
    });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-400">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Settings className="w-8 h-8 text-[#00D4FF]" />
          User Settings
        </h1>
        <p className="text-slate-400 mt-1">Manage your account preferences and notifications</p>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Palette className="w-4 h-4 mr-2" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="privacy">
            <Shield className="w-4 h-4 mr-2" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="account">
            <User className="w-4 h-4 mr-2" />
            Account
          </TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#00D4FF]" />
                Email Notifications
              </CardTitle>
              <CardDescription>Choose what emails you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white font-medium">Email Alerts</Label>
                  <p className="text-sm text-slate-400">Receive important alerts via email</p>
                </div>
                <Switch
                  checked={settings.notifications.email_alerts}
                  onCheckedChange={(v) => updateNotification('email_alerts', v)}
                />
              </div>
              <Separator className="bg-white/10" />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white font-medium">Strategy Updates</Label>
                  <p className="text-sm text-slate-400">Get notified when strategies are completed</p>
                </div>
                <Switch
                  checked={settings.notifications.strategy_updates}
                  onCheckedChange={(v) => updateNotification('strategy_updates', v)}
                />
              </div>
              <Separator className="bg-white/10" />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white font-medium">Weekly Digest</Label>
                  <p className="text-sm text-slate-400">Receive a weekly summary of your activity</p>
                </div>
                <Switch
                  checked={settings.notifications.weekly_digest}
                  onCheckedChange={(v) => updateNotification('weekly_digest', v)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#00D4FF]" />
                In-App Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white font-medium">Agent Notifications</Label>
                  <p className="text-sm text-slate-400">Notifications from AI agents</p>
                </div>
                <Switch
                  checked={settings.notifications.agent_notifications}
                  onCheckedChange={(v) => updateNotification('agent_notifications', v)}
                />
              </div>
              <Separator className="bg-white/10" />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white font-medium">Knowledge Graph Updates</Label>
                  <p className="text-sm text-slate-400">New connections and insights</p>
                </div>
                <Switch
                  checked={settings.notifications.knowledge_graph_updates}
                  onCheckedChange={(v) => updateNotification('knowledge_graph_updates', v)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Interface Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Default View</Label>
                <select
                  value={settings.preferences.default_view}
                  onChange={(e) => updatePreference('default_view', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-lg p-2"
                >
                  <option value="dashboard">Dashboard</option>
                  <option value="chat">Chat</option>
                  <option value="knowledge_graph">Knowledge Graph</option>
                  <option value="strategies">Strategies</option>
                </select>
              </div>
              <Separator className="bg-white/10" />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white font-medium">Auto-Save</Label>
                  <p className="text-sm text-slate-400">Automatically save your work</p>
                </div>
                <Switch
                  checked={settings.preferences.auto_save}
                  onCheckedChange={(v) => updatePreference('auto_save', v)}
                />
              </div>
              <Separator className="bg-white/10" />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white font-medium">Tutorial Mode</Label>
                  <p className="text-sm text-slate-400">Show helpful hints and tooltips</p>
                </div>
                <Switch
                  checked={settings.preferences.tutorial_mode}
                  onCheckedChange={(v) => updatePreference('tutorial_mode', v)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#00D4FF]" />
                Analytics Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Label className="text-white">Analytics Update Frequency</Label>
              <select
                value={settings.preferences.analytics_frequency}
                onChange={(e) => updatePreference('analytics_frequency', e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white rounded-lg p-2"
              >
                <option value="realtime">Real-time</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Privacy Controls</CardTitle>
              <CardDescription>Manage who can see your activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white font-medium">Profile Visible</Label>
                  <p className="text-sm text-slate-400">Allow others to view your profile</p>
                </div>
                <Switch
                  checked={settings.privacy.profile_visible}
                  onCheckedChange={(v) => updatePrivacy('profile_visible', v)}
                />
              </div>
              <Separator className="bg-white/10" />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white font-medium">Activity Visible</Label>
                  <p className="text-sm text-slate-400">Show your activity in feeds</p>
                </div>
                <Switch
                  checked={settings.privacy.activity_visible}
                  onCheckedChange={(v) => updatePrivacy('activity_visible', v)}
                />
              </div>
              <Separator className="bg-white/10" />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white font-medium">Allow Mentions</Label>
                  <p className="text-sm text-slate-400">Let others mention you in comments</p>
                </div>
                <Switch
                  checked={settings.privacy.allow_mentions}
                  onCheckedChange={(v) => updatePrivacy('allow_mentions', v)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Full Name</Label>
                <Input
                  value={user.full_name}
                  disabled
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Email</Label>
                <Input
                  value={user.email}
                  disabled
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Role</Label>
                <Badge className="bg-purple-500/20 text-purple-400">
                  {user.role || 'user'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#00D4FF]/10 to-[#FFB800]/10 border-[#00D4FF]/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#FFB800]" />
                Onboarding
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-slate-300 text-sm">
                Want to restart the personalized onboarding experience?
              </p>
              <Button
                onClick={() => resetOnboardingMutation.mutate()}
                variant="outline"
                className="border-[#00D4FF]/30 text-[#00D4FF] hover:bg-[#00D4FF]/10"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset Onboarding
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <Card className="bg-gradient-to-r from-[#00D4FF]/10 to-[#FFB800]/10 border-[#00D4FF]/30">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold">Save Changes</h3>
            <p className="text-sm text-slate-400">Don't forget to save your preferences</p>
          </div>
          <Button
            onClick={handleSaveSettings}
            disabled={saveSettingsMutation.isPending}
            className="bg-gradient-to-r from-[#00D4FF] to-[#FFB800] hover:from-[#00E5FF] hover:to-[#FFC520] text-[#0A1628]"
          >
            <Save className="w-4 h-4 mr-2" />
            {saveSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}