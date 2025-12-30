import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Mail, Volume2, MessageSquare, CheckSquare, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function NotificationPreferences({ onSave }) {
  const [preferences, setPreferences] = useState({
    desktopNotifications: false,
    soundAlerts: true,
    emailDigest: false,
    emailFrequency: 'daily',
    notifyOnMessages: true,
    notifyOnTaskAssignment: true,
    notifyOnCriticalTriggers: true,
    soundVolume: 0.5
  });

  useEffect(() => {
    const saved = localStorage.getItem('agent_notification_preferences');
    if (saved) {
      setPreferences(JSON.parse(saved));
    }
  }, []);

  const savePreferences = () => {
    localStorage.setItem('agent_notification_preferences', JSON.stringify(preferences));
    if (onSave) onSave(preferences);
    toast.success('Notification preferences saved');
    
    // Request desktop notification permission if enabled
    if (preferences.desktopNotifications && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          toast.success('Desktop notifications enabled');
        }
      });
    }
  };

  const updatePreference = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <Bell className="w-5 h-5 text-yellow-400" />
          Notification Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Desktop Notifications */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-400" />
              <Label className="text-white">Desktop Notifications</Label>
            </div>
            <Switch
              checked={preferences.desktopNotifications}
              onCheckedChange={(val) => updatePreference('desktopNotifications', val)}
            />
          </div>
          <p className="text-xs text-slate-400 ml-6">
            Show browser notifications for important events
          </p>
        </div>

        {/* Sound Alerts */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-slate-400" />
              <Label className="text-white">Sound Alerts</Label>
            </div>
            <Switch
              checked={preferences.soundAlerts}
              onCheckedChange={(val) => updatePreference('soundAlerts', val)}
            />
          </div>
          {preferences.soundAlerts && (
            <div className="ml-6">
              <Label className="text-xs text-slate-400 mb-2 block">Volume</Label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={preferences.soundVolume}
                onChange={(e) => updatePreference('soundVolume', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Email Digest */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" />
              <Label className="text-white">Email Digest</Label>
            </div>
            <Switch
              checked={preferences.emailDigest}
              onCheckedChange={(val) => updatePreference('emailDigest', val)}
            />
          </div>
          {preferences.emailDigest && (
            <div className="ml-6">
              <Label className="text-xs text-slate-400 mb-2 block">Frequency</Label>
              <Select
                value={preferences.emailFrequency}
                onValueChange={(val) => updatePreference('emailFrequency', val)}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realtime">Real-time</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="border-t border-white/10 pt-4 space-y-3">
          <h4 className="text-sm font-medium text-white">Notify me about:</h4>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-pink-400" />
              <Label className="text-white text-sm">Direct Messages</Label>
            </div>
            <Switch
              checked={preferences.notifyOnMessages}
              onCheckedChange={(val) => updatePreference('notifyOnMessages', val)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-orange-400" />
              <Label className="text-white text-sm">Task Assignments</Label>
            </div>
            <Switch
              checked={preferences.notifyOnTaskAssignment}
              onCheckedChange={(val) => updatePreference('notifyOnTaskAssignment', val)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <Label className="text-white text-sm">Critical Triggers</Label>
            </div>
            <Switch
              checked={preferences.notifyOnCriticalTriggers}
              onCheckedChange={(val) => updatePreference('notifyOnCriticalTriggers', val)}
            />
          </div>
        </div>

        <Button onClick={savePreferences} className="w-full bg-cyan-600 hover:bg-cyan-700">
          Save Preferences
        </Button>
      </CardContent>
    </Card>
  );
}