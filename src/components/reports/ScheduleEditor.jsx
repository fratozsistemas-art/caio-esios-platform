import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ScheduleEditor({ onClose, onSave }) {
  const [config, setConfig] = useState({
    report_title: "",
    report_template: "executive_summary",
    report_format: "pdf",
    frequency: "weekly",
    time: "09:00",
    recipients: "",
    is_active: true
  });

  const handleSave = async () => {
    await base44.entities.ReportSchedule.create({
      ...config,
      recipients: config.recipients.split(',').map(e => e.trim()).filter(Boolean),
      next_run: calculateNextRun(config.frequency, config.time)
    });
    onSave();
  };

  const calculateNextRun = (frequency, time) => {
    const now = new Date();
    const [hours, minutes] = time.split(':');
    const nextRun = new Date(now);
    nextRun.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }

    return nextRun.toISOString();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#0B0F1A] border border-white/10 rounded-2xl max-w-2xl w-full"
        >
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Schedule Report</h2>
                <p className="text-sm text-slate-400">Automate report generation</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <Label className="text-white mb-2">Report Title</Label>
              <Input
                value={config.report_title}
                onChange={(e) => setConfig({ ...config, report_title: e.target.value })}
                placeholder="Weekly Executive Summary"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white mb-2">Template</Label>
                <Select value={config.report_template} onValueChange={(value) => setConfig({ ...config, report_template: value })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="executive_summary">Executive Summary</SelectItem>
                    <SelectItem value="detailed_analysis">Detailed Analysis</SelectItem>
                    <SelectItem value="competitive_landscape">Competitive Landscape</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white mb-2">Format</Label>
                <Select value={config.report_format} onValueChange={(value) => setConfig({ ...config, report_format: value })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white mb-2">Frequency</Label>
                <Select value={config.frequency} onValueChange={(value) => setConfig({ ...config, frequency: value })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white mb-2">Time</Label>
                <Input
                  type="time"
                  value={config.time}
                  onChange={(e) => setConfig({ ...config, time: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            <div>
              <Label className="text-white mb-2">Recipients (comma-separated emails)</Label>
              <Input
                value={config.recipients}
                onChange={(e) => setConfig({ ...config, recipients: e.target.value })}
                placeholder="john@company.com, jane@company.com"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>

          <div className="p-6 border-t border-white/10 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} className="border-white/20 text-slate-400">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!config.report_title}
              className="bg-gradient-to-r from-purple-500 to-pink-500"
            >
              Create Schedule
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}