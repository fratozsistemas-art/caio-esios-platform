import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Calendar, Clock, Mail, Trash2, Plus } from "lucide-react";
import { motion } from "framer-motion";
import ScheduleEditor from "./ScheduleEditor";

export default function ScheduledReports({ schedules }) {
  const [showEditor, setShowEditor] = useState(false);
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => 
      base44.entities.ReportSchedule.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report_schedules'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ReportSchedule.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report_schedules'] });
    }
  });

  const getFrequencyLabel = (frequency) => {
    const labels = {
      daily: 'Every Day',
      weekly: 'Every Week',
      monthly: 'Every Month',
      quarterly: 'Every Quarter'
    };
    return labels[frequency] || frequency;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Scheduled Reports</h3>
          <p className="text-sm text-slate-400">Automate report generation and distribution</p>
        </div>
        <Button
          onClick={() => setShowEditor(true)}
          className="bg-purple-500 hover:bg-purple-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Schedule
        </Button>
      </div>

      {schedules.length === 0 ? (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-12 text-center">
            <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">No scheduled reports yet</p>
            <Button onClick={() => setShowEditor(true)} className="bg-purple-500 hover:bg-purple-600">
              <Plus className="w-4 h-4 mr-2" />
              Create Schedule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {schedules.map((schedule) => (
            <motion.div
              key={schedule.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="text-lg font-semibold text-white">{schedule.report_title}</h4>
                        <Badge className={schedule.is_active ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-slate-500/20 text-slate-400 border-slate-500/30'}>
                          {schedule.is_active ? 'Active' : 'Paused'}
                        </Badge>
                        <Badge variant="outline" className="border-white/20 text-slate-400">
                          {schedule.report_format?.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Calendar className="w-4 h-4" />
                          <span>{getFrequencyLabel(schedule.frequency)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Clock className="w-4 h-4" />
                          <span>at {schedule.time || '09:00'}</span>
                        </div>
                        {schedule.recipients && (
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Mail className="w-4 h-4" />
                            <span>{schedule.recipients.length} recipient{schedule.recipients.length !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </div>

                      {schedule.next_run && (
                        <p className="text-xs text-slate-500">
                          Next run: {new Date(schedule.next_run).toLocaleString()}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={schedule.is_active}
                        onCheckedChange={(checked) => 
                          toggleMutation.mutate({ id: schedule.id, is_active: checked })
                        }
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(schedule.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {showEditor && (
        <ScheduleEditor
          onClose={() => setShowEditor(false)}
          onSave={() => {
            setShowEditor(false);
            queryClient.invalidateQueries({ queryKey: ['report_schedules'] });
          }}
        />
      )}
    </div>
  );
}