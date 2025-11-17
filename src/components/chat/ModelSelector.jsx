import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Brain, Cpu, Sparkles, Settings, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function ModelSelector({ selectedModel, onModelChange }) {
  const { data: fineTunedAgents = [] } = useQuery({
    queryKey: ['fine_tuned_agents_active'],
    queryFn: async () => {
      const agents = await base44.entities.FineTunedAgent.filter({ 
        is_active: true,
        status: 'deployed'
      });
      return agents;
    }
  });

  const baseModels = [
    { 
      value: 'standard', 
      label: 'Standard LLM', 
      icon: Brain,
      description: 'Fast, general-purpose model',
      badge: 'Default'
    },
    { 
      value: 'claude', 
      label: 'Claude (Anthropic)', 
      icon: Sparkles,
      description: 'Advanced reasoning for complex analysis',
      badge: 'Premium'
    }
  ];

  const allModels = [
    ...baseModels,
    ...fineTunedAgents.map(agent => ({
      value: `fine_tuned_${agent.id}`,
      label: agent.model_name,
      icon: Cpu,
      description: `Fine-tuned for ${agent.base_agent_type}`,
      badge: 'Custom',
      agentType: agent.base_agent_type,
      benchmarks: agent.performance_benchmarks
    }))
  ];

  const currentModel = allModels.find(m => m.value === selectedModel) || baseModels[0];
  const Icon = currentModel.icon;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-white/5 border-white/10 text-white hover:bg-white/10"
        >
          <Icon className="w-4 h-4 mr-2" />
          {currentModel.label}
          <Settings className="w-3 h-3 ml-2 text-slate-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-slate-900 border-white/10" align="end">
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-medium text-white mb-2">Select AI Model</h3>
            <p className="text-xs text-slate-400 mb-3">
              Choose the model that best fits your task complexity
            </p>
          </div>

          {/* Base Models */}
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">Base Models</p>
            <div className="space-y-2">
              {baseModels.map(model => {
                const ModelIcon = model.icon;
                const isSelected = selectedModel === model.value;
                return (
                  <button
                    key={model.value}
                    onClick={() => onModelChange(model.value)}
                    className={`w-full flex items-start gap-3 p-3 rounded-lg transition-all ${
                      isSelected
                        ? 'bg-blue-500/20 border border-blue-500/30'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'bg-blue-500/30' : 'bg-white/10'
                    }`}>
                      <ModelIcon className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-slate-400'}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-white">{model.label}</p>
                        <Badge className={`text-xs ${
                          model.badge === 'Premium' 
                            ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                            : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        }`}>
                          {model.badge}
                        </Badge>
                        {isSelected && <CheckCircle className="w-3 h-3 text-blue-400 ml-auto" />}
                      </div>
                      <p className="text-xs text-slate-400">{model.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fine-Tuned Models */}
          {fineTunedAgents.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-2">Fine-Tuned Models</p>
              <div className="space-y-2">
                {fineTunedAgents.map(agent => {
                  const modelValue = `fine_tuned_${agent.id}`;
                  const isSelected = selectedModel === modelValue;
                  return (
                    <button
                      key={agent.id}
                      onClick={() => onModelChange(modelValue)}
                      className={`w-full flex items-start gap-3 p-3 rounded-lg transition-all ${
                        isSelected
                          ? 'bg-purple-500/20 border border-purple-500/30'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-purple-500/30' : 'bg-white/10'
                      }`}>
                        <Cpu className={`w-4 h-4 ${isSelected ? 'text-purple-400' : 'text-slate-400'}`} />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-white">{agent.model_name}</p>
                          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                            Custom
                          </Badge>
                          {isSelected && <CheckCircle className="w-3 h-3 text-purple-400 ml-auto" />}
                        </div>
                        <p className="text-xs text-slate-400">
                          Fine-tuned for {agent.base_agent_type}
                        </p>
                        {agent.performance_benchmarks && (
                          <div className="flex gap-2 mt-1">
                            <span className="text-xs text-green-400">
                              Accuracy: {Math.round(agent.performance_benchmarks.accuracy || 0)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}