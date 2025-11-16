import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Settings2, GripVertical, Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const AVAILABLE_WIDGETS = [
  { id: 'quick_stats', label: 'Quick Stats', category: 'overview', defaultVisible: true },
  { id: 'conversation_history', label: 'Recent Conversations', category: 'activity', defaultVisible: true },
  { id: 'analysis_insights', label: 'Analysis Insights', category: 'intelligence', defaultVisible: true },
  { id: 'knowledge_graph', label: 'Knowledge Graph', category: 'intelligence', defaultVisible: true },
  { id: 'action_items', label: 'Action Items', category: 'tasks', defaultVisible: true },
  { id: 'proactive_insights', label: 'Proactive Insights', category: 'intelligence', defaultVisible: true },
  { id: 'predictive_analysis', label: 'Predictive Analysis', category: 'intelligence', defaultVisible: false },
  { id: 'cross_platform', label: 'Cross-Platform Insights', category: 'intelligence', defaultVisible: false },
  { id: 'performance', label: 'System Performance', category: 'monitoring', defaultVisible: false },
  { id: 'notifications', label: 'Notifications', category: 'activity', defaultVisible: true }
];

export default function DashboardCustomizer({ widgetConfig, onConfigChange }) {
  const [open, setOpen] = useState(false);
  const [localConfig, setLocalConfig] = useState(widgetConfig || AVAILABLE_WIDGETS.map(w => ({ 
    id: w.id, 
    visible: w.defaultVisible, 
    order: AVAILABLE_WIDGETS.indexOf(w) 
  })));

  const toggleWidget = (widgetId) => {
    setLocalConfig(prev => 
      prev.map(w => w.id === widgetId ? { ...w, visible: !w.visible } : w)
    );
  };

  const handleSave = () => {
    onConfigChange(localConfig);
    setOpen(false);
  };

  const groupedWidgets = AVAILABLE_WIDGETS.reduce((acc, widget) => {
    if (!acc[widget.category]) acc[widget.category] = [];
    acc[widget.category].push(widget);
    return acc;
  }, {});

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
          <Settings2 className="w-4 h-4 mr-2" />
          Customize Dashboard
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">Dashboard Customization</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 max-h-[60vh] overflow-y-auto">
          {Object.entries(groupedWidgets).map(([category, widgets]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                {category}
              </h3>
              <div className="space-y-2">
                {widgets.map((widget) => {
                  const config = localConfig.find(c => c.id === widget.id);
                  return (
                    <div
                      key={widget.id}
                      className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <GripVertical className="w-4 h-4 text-slate-500 cursor-move" />
                      <Checkbox
                        checked={config?.visible}
                        onCheckedChange={() => toggleWidget(widget.id)}
                        className="border-white/20"
                      />
                      <span className="flex-1 text-white text-sm">{widget.label}</span>
                      {config?.visible ? (
                        <Eye className="w-4 h-4 text-green-400" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}