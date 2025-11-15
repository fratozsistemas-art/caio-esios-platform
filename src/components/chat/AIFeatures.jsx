import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain, Sparkles, TrendingUp, Target, Users, Building2,
  ArrowRight, Loader2, RefreshCw, MessageSquare
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function AIFeatures({ conversationId, onPromptSelect }) {
  const [activeTab, setActiveTab] = useState("entities");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [entityData, setEntityData] = useState(null);
  const [suggestions, setSuggestions] = useState(null);

  const analyzeConversation = async () => {
    setIsAnalyzing(true);
    try {
      const response = await base44.functions.invoke('extractConversationEntities', {
        conversation_id: conversationId
      });

      if (response.data?.success) {
        setEntityData(response.data.analysis);
        toast.success('Conversation analyzed!');
      }
    } catch (error) {
      toast.error('Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateSuggestions = async () => {
    setIsSuggesting(true);
    try {
      const response = await base44.functions.invoke('generateFollowUpSuggestions', {
        conversation_id: conversationId
      });

      if (response.data?.success) {
        setSuggestions(response.data.suggestions);
        toast.success('Suggestions generated!');
      }
    } catch (error) {
      toast.error('Suggestion generation failed');
    } finally {
      setIsSuggesting(false);
    }
  };

  const handlePromptClick = (prompt) => {
    if (onPromptSelect) {
      onPromptSelect(prompt);
    }
  };

  const SENTIMENT_COLORS = {
    positive: 'bg-green-500/20 text-green-400 border-green-500/30',
    neutral: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    negative: 'bg-red-500/20 text-red-400 border-red-500/30',
    mixed: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  };

  const URGENCY_COLORS = {
    low: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    critical: 'bg-red-500/20 text-red-400 border-red-500/30'
  };

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            AI Insights
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={analyzeConversation}
              disabled={isAnalyzing}
              className="text-slate-400 hover:text-white"
            >
              {isAnalyzing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-white/5">
            <TabsTrigger value="entities">Entities</TabsTrigger>
            <TabsTrigger value="topics">Topics</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          </TabsList>

          <TabsContent value="entities" className="space-y-4 mt-4">
            {!entityData ? (
              <div className="text-center py-8">
                <Brain className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-400 mb-4">
                  Extract entities, topics, and sentiment from this conversation
                </p>
                <Button
                  onClick={analyzeConversation}
                  disabled={isAnalyzing}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Analyze Conversation
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Sentiment & Urgency */}
                {entityData.sentiment && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <div className="text-xs text-slate-400 mb-2">Sentiment</div>
                      <Badge className={SENTIMENT_COLORS[entityData.sentiment.overall]}>
                        {entityData.sentiment.overall}
                      </Badge>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <div className="text-xs text-slate-400 mb-2">Urgency</div>
                      <Badge className={URGENCY_COLORS[entityData.sentiment.urgency]}>
                        {entityData.sentiment.urgency}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Entities */}
                {entityData.entities && (
                  <div className="space-y-2">
                    {entityData.entities.companies?.length > 0 && (
                      <div>
                        <div className="text-xs text-slate-400 mb-2 flex items-center gap-2">
                          <Building2 className="w-3 h-3" />
                          Companies
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {entityData.entities.companies.map((company, idx) => (
                            <Badge key={idx} variant="outline" className="border-blue-500/30 text-blue-400">
                              {company}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {entityData.entities.technologies?.length > 0 && (
                      <div>
                        <div className="text-xs text-slate-400 mb-2">Technologies</div>
                        <div className="flex flex-wrap gap-1">
                          {entityData.entities.technologies.map((tech, idx) => (
                            <Badge key={idx} variant="outline" className="border-purple-500/30 text-purple-400">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Graph Correlation */}
                {entityData.graph_correlation && (
                  <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/30">
                    <div className="text-xs text-blue-400 font-medium mb-2">
                      Knowledge Graph Match
                    </div>
                    <div className="text-xs text-slate-400">
                      {entityData.graph_correlation.in_graph.length} entities already in graph •{' '}
                      {entityData.graph_correlation.new_entities.length} new entities discovered
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="topics" className="space-y-3 mt-4">
            {entityData?.topics?.length > 0 ? (
              entityData.topics.map((topic, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white/5 rounded-lg p-3 border border-white/10"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-sm text-white font-medium">{topic.topic}</div>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {Math.round(topic.relevance * 100)}%
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400">{topic.context}</p>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400">
                Analyze the conversation first to see topics
              </div>
            )}
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-4 mt-4">
            {!suggestions ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-400 mb-4">
                  Get AI-powered follow-up suggestions based on conversation history
                </p>
                <Button
                  onClick={generateSuggestions}
                  disabled={isSuggesting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSuggesting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Suggestions
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Immediate Prompts */}
                {suggestions.immediate_prompts?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-white mb-2">Suggested Prompts</h4>
                    <div className="space-y-2">
                      {suggestions.immediate_prompts.map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handlePromptClick(prompt.prompt)}
                          className="w-full text-left bg-white/5 hover:bg-white/10 rounded-lg p-3 border border-white/10 transition-all group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="text-sm text-white mb-1">{prompt.prompt}</div>
                              <div className="text-xs text-slate-400">{prompt.rationale}</div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors flex-shrink-0" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strategic Questions */}
                {suggestions.strategic_questions?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-white mb-2">Strategic Questions</h4>
                    <div className="space-y-2">
                      {suggestions.strategic_questions.map((q, idx) => (
                        <div key={idx} className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/30">
                          <div className="text-sm text-white mb-1">{q.question}</div>
                          <div className="text-xs text-slate-400">{q.purpose}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}