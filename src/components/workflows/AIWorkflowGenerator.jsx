import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, Loader2, CheckCircle, Zap, 
  TrendingUp, Clock, AlertCircle, ArrowRight, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function AIWorkflowGenerator({ onWorkflowGenerated }) {
  const [description, setDescription] = useState('');
  const [context, setContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWorkflow, setGeneratedWorkflow] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await base44.functions.invoke('generateWorkflowFromDescription', {
        description,
        context
      });
      setGeneratedWorkflow(result.workflow);
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const loadSuggestions = async () => {
    setIsLoadingSuggestions(true);
    try {
      const result = await base44.functions.invoke('suggestWorkflowTemplates');
      setSuggestions(result);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleUseTemplate = (template) => {
    setDescription(`Create a workflow for: ${template.description}\n\nUse Case: ${template.use_case}\n\nSteps: ${template.sample_steps.join(', ')}`);
  };

  const handleSaveWorkflow = async () => {
    try {
      const workflow = await base44.entities.AgentWorkflow.create({
        workflow_name: generatedWorkflow.name,
        workflow_description: generatedWorkflow.description,
        workflow_steps: generatedWorkflow.steps,
        category: generatedWorkflow.category,
        tags: generatedWorkflow.tags,
        is_active: false,
        metadata: {
          ai_generated: true,
          estimated_duration_minutes: generatedWorkflow.estimated_duration_minutes
        }
      });
      
      // Record positive feedback
      await base44.functions.invoke('learnFromFeedback', {
        suggestion_id: `generated_${generatedWorkflow.name}`,
        suggestion_type: 'workflow_generation',
        feedback_type: 'workflow_suggestion',
        rating: 5,
        comment: 'User created workflow from AI suggestion',
        metadata: { category: generatedWorkflow.category }
      });
      
      onWorkflowGenerated?.(workflow);
      setGeneratedWorkflow(null);
      setDescription('');
      setContext('');
      toast.success('Workflow created! AI is learning from your preferences.');
    } catch (error) {
      console.error('Failed to save workflow:', error);
      toast.error('Failed to save workflow');
    }
  };

  const handleRejectWorkflow = async () => {
    try {
      await base44.functions.invoke('learnFromFeedback', {
        suggestion_id: `generated_${generatedWorkflow.name}`,
        suggestion_type: 'workflow_generation',
        feedback_type: 'workflow_suggestion',
        rating: 2,
        comment: 'User rejected generated workflow',
        metadata: { category: generatedWorkflow.category }
      });
      setGeneratedWorkflow(null);
      toast.success('Thanks for the feedback! AI will improve.');
    } catch (error) {
      console.error('Failed to record feedback:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="generate">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="generate">Generate Workflow</TabsTrigger>
          <TabsTrigger value="templates" onClick={() => !suggestions && loadSuggestions()}>
            AI Suggestions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Describe Your Workflow
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-slate-300 mb-2 block">
                  What do you want this workflow to do?
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Example: Every Monday morning, fetch all feedback from last week, analyze sentiment, generate a summary report, and email it to the leadership team."
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 min-h-[120px]"
                />
              </div>

              <div>
                <label className="text-sm text-slate-300 mb-2 block">
                  Additional Context (optional)
                </label>
                <Textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Any specific requirements, data sources, or constraints..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!description || isGenerating}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Workflow
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Workflow Preview */}
          <AnimatePresence>
            {generatedWorkflow && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">{generatedWorkflow.name}</CardTitle>
                      <Badge className="bg-green-500/20 text-green-400">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Generated
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-300">{generatedWorkflow.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-xs text-slate-400 mb-1">Category</div>
                        <div className="text-sm text-white capitalize">{generatedWorkflow.category}</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-xs text-slate-400 mb-1">Steps</div>
                        <div className="text-sm text-white">{generatedWorkflow.steps.length}</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-xs text-slate-400 mb-1">Est. Duration</div>
                        <div className="text-sm text-white">{generatedWorkflow.estimated_duration_minutes}m</div>
                      </div>
                    </div>

                    {/* Steps Preview */}
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-2">Workflow Steps:</h4>
                      <div className="space-y-2">
                        {generatedWorkflow.steps.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-2 bg-white/5 rounded-lg">
                            <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-purple-400">{step.step_number}</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-white font-medium">{step.name}</p>
                              <p className="text-xs text-slate-400">{step.description}</p>
                              <Badge className="mt-1 bg-[#00D4FF]/20 text-[#00D4FF] text-xs">
                                {step.action_type}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {generatedWorkflow.tags?.map((tag, idx) => (
                        <Badge key={idx} className="bg-white/10 text-slate-300">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSaveWorkflow}
                          className="flex-1 bg-gradient-to-r from-[#00D4FF] to-[#00A8CC] hover:from-[#00E5FF] hover:to-[#00B8DC]"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Save Workflow
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleRejectWorkflow}
                          className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                        >
                          <ThumbsDown className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-center text-slate-500">
                        Your feedback helps AI improve future suggestions
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          {isLoadingSuggestions && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#00D4FF]" />
            </div>
          )}

          {suggestions && (
            <>
              <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30 mb-4">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-white font-semibold mb-1">AI Insights</p>
                      <p className="text-xs text-slate-300">{suggestions.insights}</p>
                      <p className="text-xs text-slate-500 mt-2">
                        Based on {suggestions.based_on?.feedback_analyzed || 0} feedback items and {suggestions.based_on?.workflows_analyzed || 0} existing workflows
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-4">
                {suggestions.templates?.map((template, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="bg-white/5 border-white/10 hover:border-purple-500/30 transition-all h-full">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-white text-base">{template.name}</CardTitle>
                          <Badge className={
                            template.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                            template.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }>
                            {template.priority}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-slate-300">{template.description}</p>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span className="text-slate-400">Value: {template.estimated_value}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <Zap className="w-3 h-3 text-slate-400" />
                            <span className="text-slate-400 capitalize">Complexity: {template.complexity}</span>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500 mb-1">Sample Steps:</p>
                          <ul className="space-y-1">
                            {template.sample_steps.slice(0, 3).map((step, i) => (
                              <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                                <span className="text-purple-400">•</span>
                                {step}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <Button
                          onClick={() => handleUseTemplate(template)}
                          variant="outline"
                          size="sm"
                          className="w-full border-purple-500/40 text-purple-400 hover:bg-purple-500/20"
                        >
                          Use Template
                          <ArrowRight className="w-3 h-3 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}