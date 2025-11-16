import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function WorkflowExecutionMonitor({ executions, onClose }) {
  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="border-b border-white/10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Workflow Executions</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5 text-slate-400" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-3">
        {executions.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-sm">No executions yet</p>
          </div>
        ) : (
          executions.map((execution) => (
            <ExecutionCard key={execution.id} execution={execution} />
          ))
        )}
      </CardContent>
    </Card>
  );
}

function ExecutionCard({ execution }) {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'completed':
        return { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30' };
      case 'running':
        return { icon: Loader2, color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30' };
      case 'failed':
        return { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' };
      default:
        return { icon: Clock, color: 'text-slate-400', bg: 'bg-slate-500/20', border: 'border-slate-500/30' };
    }
  };

  const config = getStatusConfig(execution.status);
  const StatusIcon = config.icon;

  return (
    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-white font-medium">{execution.workflow_name}</h4>
          <p className="text-xs text-slate-400 mt-1">
            Started {format(new Date(execution.created_date), 'MMM d, HH:mm')}
          </p>
        </div>
        <Badge className={`${config.bg} ${config.color} ${config.border}`}>
          <StatusIcon className={`w-3 h-3 mr-1 ${execution.status === 'running' ? 'animate-spin' : ''}`} />
          {execution.status}
        </Badge>
      </div>

      {/* Progress */}
      {execution.status === 'running' && execution.current_step && (
        <div className="mb-3">
          <p className="text-xs text-slate-400 mb-2">
            Step: {execution.current_step} ({execution.completed_steps?.length || 0} completed)
          </p>
          <div className="w-full bg-white/5 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all"
              style={{ width: `${((execution.completed_steps?.length || 0) / 5) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="flex gap-4 text-xs text-slate-400">
        {execution.duration_seconds && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {execution.duration_seconds.toFixed(1)}s
          </span>
        )}
        {execution.completed_steps && (
          <span>{execution.completed_steps.length} steps completed</span>
        )}
      </div>

      {/* Error */}
      {execution.error_message && (
        <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400">
          {execution.error_message}
        </div>
      )}
    </div>
  );
}