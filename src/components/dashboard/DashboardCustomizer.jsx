import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings, Grip } from "lucide-react";
import { motion, Reorder } from "framer-motion";
import { toast } from "sonner";

const AVAILABLE_WIDGETS = [
  { id: 'realtime', label: 'Real-Time Metrics', description: 'Live user activity and performance' },
  { id: 'engagement', label: 'User Engagement', description: 'Session data and trends' },
  { id: 'roi', label: 'ROI Projection', description: 'Financial performance tracking' },
  { id: 'adoption', label: 'Feature Adoption', description: 'Feature usage statistics' },
  { id: 'stats', label: 'Quick Stats', description: 'Key performance indicators' },
  { id: 'conversations', label: 'Recent Conversations', description: 'Latest chat activity' },
  { id: 'insights', label: 'Analysis Insights', description: 'AI-generated insights' },
  { id: 'graph', label: 'Knowledge Graph', description: 'Entity relationships' },
  { id: 'actions', label: 'Action Items', description: 'Pending tasks' },
  { id: 'crossplatform', label: 'Cross-Platform', description: 'Multi-source intelligence' },
  { id: 'proactive', label: 'Proactive Insights', description: 'Predictive analytics' },
  { id: 'predictive', label: 'Predictive Analysis', description: 'Future projections' }
];

export default function DashboardCustomizer({ currentLayout, onLayoutChange }) {
  const [open, setOpen] = useState(false);
  const [selectedWidgets, setSelectedWidgets] = useState(currentLayout || []);
  const [widgetOrder, setWidgetOrder] = useState(
    selectedWidgets.map(id => AVAILABLE_WIDGETS.find(w => w.id === id)).filter(Boolean)
  );

  const handleToggleWidget = (widgetId) => {
    const isSelected = selectedWidgets.includes(widgetId);
    const newSelected = isSelected
      ? selectedWidgets.filter(id => id !== widgetId)
      : [...selectedWidgets, widgetId];
    
    setSelectedWidgets(newSelected);
    setWidgetOrder(
      newSelected.map(id => AVAILABLE_WIDGETS.find(w => w.id === id)).filter(Boolean)
    );
  };

  const handleSave = () => {
    const orderedIds = widgetOrder.map(w => w.id);
    onLayoutChange(orderedIds);
    localStorage.setItem('dashboard_layout', JSON.stringify(orderedIds));
    toast.success('Dashboard layout saved!');
    setOpen(false);
  };

  const handleReset = () => {
    const defaultLayout = ['realtime', 'stats', 'engagement', 'roi', 'adoption', 'conversations'];
    setSelectedWidgets(defaultLayout);
    setWidgetOrder(
      defaultLayout.map(id => AVAILABLE_WIDGETS.find(w => w.id === id)).filter(Boolean)
    );
    toast.info('Layout reset to default');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">
          <Settings className="w-4 h-4 mr-2" />
          Customize
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">Customize Dashboard</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Widget Selection */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Select Widgets</h3>
            <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
              {AVAILABLE_WIDGETS.map(widget => (
                <div
                  key={widget.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedWidgets.includes(widget.id)
                      ? 'bg-blue-500/10 border-blue-500/30'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                  onClick={() => handleToggleWidget(widget.id)}
                >
                  <Checkbox
                    checked={selectedWidgets.includes(widget.id)}
                    onCheckedChange={() => handleToggleWidget(widget.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{widget.label}</p>
                    <p className="text-xs text-slate-400">{widget.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Widget Ordering */}
          {widgetOrder.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Arrange Order</h3>
              <Reorder.Group
                axis="y"
                values={widgetOrder}
                onReorder={setWidgetOrder}
                className="space-y-2"
              >
                {widgetOrder.map((widget) => (
                  <Reorder.Item key={widget.id} value={widget}>
                    <motion.div
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 cursor-move hover:bg-white/10"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Grip className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-white">{widget.label}</p>
                        <p className="text-xs text-slate-400">{widget.description}</p>
                      </div>
                    </motion.div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t border-white/10">
            <Button variant="outline" onClick={handleReset} className="border-white/10">
              Reset to Default
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)} className="border-white/10">
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                Save Layout
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}