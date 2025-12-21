import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Workflow, Star, Clock, Zap, Play, Sparkles, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { motion } from "framer-motion";

export default function WorkflowTemplates() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const { data: templates = [] } = useQuery({
    queryKey: ['workflow_templates'],
    queryFn: () => base44.entities.WorkflowTemplate.list()
  });

  const createFromTemplateMutation = useMutation({
    mutationFn: async (template) => {
      const workflow = await base44.entities.AgentWorkflow.create({
        ...template.workflow_config,
        name: `${template.workflow_config.name} (from template)`,
        status: 'active'
      });
      
      await base44.entities.WorkflowTemplate.update(template.id, {
        usage_count: (template.usage_count || 0) + 1
      });
      
      return workflow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['agent_workflows']);
      toast.success('Workflow criado a partir do template');
      navigate(createPageUrl('AgentOrchestration'));
    }
  });

  const loadAISuggestions = async () => {
    setIsLoadingSuggestions(true);
    try {
      const result = await base44.functions.invoke('suggestWorkflowTemplates');
      setAiSuggestions(result);
    } catch (error) {
      console.error('Failed to load AI suggestions:', error);
      toast.error('Failed to load AI suggestions');
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const featured = templates.filter(t => t.is_featured);
  const byCategory = templates.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Workflow className="w-8 h-8 text-purple-400" />
            Workflow Templates
          </h1>
          <p className="text-slate-400 mt-1">Templates pré-configurados para começar rapidamente</p>
        </div>
        <Button
          onClick={loadAISuggestions}
          disabled={isLoadingSuggestions}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          {isLoadingSuggestions ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              AI Suggestions
            </>
          )}
        </Button>
      </div>

      {/* AI Suggestions */}
      {aiSuggestions && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                AI-Suggested Templates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <p className="text-sm text-slate-300">{aiSuggestions.insights}</p>
                <p className="text-xs text-slate-500 mt-2">
                  Based on {aiSuggestions.based_on?.feedback_analyzed || 0} feedback items
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                {aiSuggestions.templates?.slice(0, 6).map((template, idx) => (
                  <div key={idx} className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-sm font-semibold text-white">{template.name}</h3>
                      <Badge className={
                        template.priority === 'high' ? 'bg-red-500/20 text-red-400 text-xs' :
                        template.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400 text-xs' :
                        'bg-green-500/20 text-green-400 text-xs'
                      }>
                        {template.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{template.description}</p>
                    <Badge className="bg-[#00D4FF]/20 text-[#00D4FF] text-xs">
                      {template.estimated_value}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {featured.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Featured Templates
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {featured.map(template => (
              <TemplateCard 
                key={template.id} 
                template={template} 
                onUse={() => createFromTemplateMutation.mutate(template)}
                isPending={createFromTemplateMutation.isPending}
              />
            ))}
          </div>
        </div>
      )}

      {Object.entries(byCategory).map(([category, templates]) => (
        <div key={category}>
          <h2 className="text-xl font-bold text-white mb-4 capitalize">{category}</h2>
          <div className="grid grid-cols-2 gap-4">
            {templates.map(template => (
              <TemplateCard 
                key={template.id} 
                template={template}
                onUse={() => createFromTemplateMutation.mutate(template)}
                isPending={createFromTemplateMutation.isPending}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TemplateCard({ template, onUse, isPending }) {
  return (
    <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-white text-lg">{template.name}</CardTitle>
            <p className="text-sm text-slate-400 mt-1">{template.description}</p>
          </div>
          {template.is_featured && <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            {template.category}
          </Badge>
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            <Zap className="w-3 h-3 mr-1" />
            {template.complexity}
          </Badge>
          <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">
            <Clock className="w-3 h-3 mr-1" />
            {template.estimated_duration}
          </Badge>
        </div>

        <div>
          <p className="text-xs text-slate-500 mb-2">Use Case:</p>
          <p className="text-sm text-slate-300">{template.use_case}</p>
        </div>

        <div>
          <p className="text-xs text-slate-500 mb-2">Required Inputs:</p>
          <div className="flex gap-2 flex-wrap">
            {template.required_inputs?.map((input, idx) => (
              <Badge key={idx} variant="outline" className="border-white/20 text-slate-300 text-xs">
                {input.name}{input.required && '*'}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <span className="text-xs text-slate-500">
            Usado {template.usage_count || 0}x
          </span>
          <Button 
            onClick={onUse}
            disabled={isPending}
            className="bg-purple-600 hover:bg-purple-700"
            size="sm"
          >
            <Play className="w-4 h-4 mr-1" />
            Use Template
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}