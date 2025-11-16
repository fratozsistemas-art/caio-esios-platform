import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Pause, Play, SkipForward, RotateCcw, 
  AlertTriangle, X, Send
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function InterventionPanel({ 
  orchestrationData, 
  onIntervene, 
  onClose 
}) {
  const [action, setAction] = useState('pause');
  const [customInstructions, setCustomInstructions] = useState('');
  const [targetAgent, setTargetAgent] = useState('all');

  const handleIntervene = () => {
    if (!action) {
      toast.error("Please select an intervention action");
      return;
    }

    const intervention = {
      action,
      target_agent: targetAgent,
      custom_instructions: customInstructions,
      timestamp: new Date().toISOString()
    };

    onIntervene?.(intervention);
    toast.success(`Intervention applied: ${action}`);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="border-t border-white/10 bg-gradient-to-br from-orange-500/5 to-red-500/5"
    >
      <Card className="bg-transparent border-0 shadow-none">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              Real-Time Intervention
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Take control of the orchestration flow
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Intervention Actions */}
          <div className="grid grid-cols-4 gap-2">
            <Button
              variant={action === 'pause' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAction('pause')}
              className={action === 'pause' ? 'bg-orange-600' : 'border-white/10'}
            >
              <Pause className="w-4 h-4 mr-1" />
              Pause
            </Button>
            <Button
              variant={action === 'resume' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAction('resume')}
              className={action === 'resume' ? 'bg-green-600' : 'border-white/10'}
            >
              <Play className="w-4 h-4 mr-1" />
              Resume
            </Button>
            <Button
              variant={action === 'skip' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAction('skip')}
              className={action === 'skip' ? 'bg-blue-600' : 'border-white/10'}
            >
              <SkipForward className="w-4 h-4 mr-1" />
              Skip
            </Button>
            <Button
              variant={action === 'replan' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAction('replan')}
              className={action === 'replan' ? 'bg-purple-600' : 'border-white/10'}
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Replan
            </Button>
          </div>

          {/* Target Agent Selection */}
          <div>
            <label className="text-xs text-slate-400 mb-2 block">
              Target Agent
            </label>
            <Select value={targetAgent} onValueChange={setTargetAgent}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                <SelectItem value="current">Current Agent</SelectItem>
                {orchestrationData?.agents_used?.map((agent, idx) => (
                  <SelectItem key={idx} value={agent}>
                    {agent}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Instructions */}
          {(action === 'replan' || action === 'skip') && (
            <div>
              <label className="text-xs text-slate-400 mb-2 block">
                Custom Instructions (optional)
              </label>
              <Textarea
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="Provide specific guidance for the agents..."
                className="bg-white/5 border-white/10 text-white resize-none h-20"
              />
            </div>
          )}

          {/* Action Description */}
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <p className="text-xs text-slate-300">
              {action === 'pause' && '⏸️ Pause the current execution. Agents will stop processing after the current step.'}
              {action === 'resume' && '▶️ Resume a paused orchestration. Agents will continue from where they stopped.'}
              {action === 'skip' && '⏭️ Skip the current agent and move to the next in the sequence.'}
              {action === 'replan' && '🔄 Force a re-planning phase. The orchestrator will reassess the execution plan.'}
            </p>
          </div>

          {/* Apply Button */}
          <Button
            onClick={handleIntervene}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            <Send className="w-4 h-4 mr-2" />
            Apply Intervention
          </Button>

          {/* Warning */}
          <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-200">
              Real-time interventions may affect the quality and coherence of the final output. 
              Use carefully in production scenarios.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}