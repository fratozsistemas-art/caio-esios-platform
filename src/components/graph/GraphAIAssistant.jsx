import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Send, Loader2, MessageSquare, Lightbulb, Network } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function GraphAIAssistant({ onEntityClick }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your Knowledge Graph AI Assistant. Ask me anything about the entities, relationships, patterns, or insights in your knowledge graph.',
      timestamp: new Date().toISOString()
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const queryMutation = useMutation({
    mutationFn: async (query) => {
      const { data } = await base44.functions.invoke('queryGraphAI', {
        query: query,
        conversation_history: messages.slice(-6) // Últimas 3 trocas
      });
      return data;
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        relevant_entities: data.relevant_entities,
        relevant_relationships: data.relevant_relationships,
        insights: data.insights,
        suggested_queries: data.suggested_queries,
        confidence: data.confidence,
        timestamp: new Date().toISOString()
      }]);
    }
  });

  const handleSend = () => {
    if (!userInput.trim() || queryMutation.isPending) return;

    const query = userInput.trim();
    setUserInput('');

    setMessages(prev => [...prev, {
      role: 'user',
      content: query,
      timestamp: new Date().toISOString()
    }]);

    queryMutation.mutate(query);
  };

  const handleSuggestedQuery = (query) => {
    setUserInput(query);
  };

  return (
    <Card className="bg-gradient-to-br from-purple-500/5 to-blue-500/5 border-purple-500/20 h-full flex flex-col">
      <CardHeader className="border-b border-white/10">
        <CardTitle className="text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          Graph AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-4 space-y-4 overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((message, idx) => (
            <div key={idx} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white/10 text-slate-200'} rounded-lg p-3`}>
                {message.role === 'assistant' ? (
                  <div className="space-y-3">
                    <ReactMarkdown className="text-sm prose prose-invert max-w-none">
                      {message.content}
                    </ReactMarkdown>

                    {message.relevant_entities?.length > 0 && (
                      <div className="border-t border-white/10 pt-3">
                        <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                          <Network className="w-3 h-3" />
                          Relevant Entities:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {message.relevant_entities.map((entity, i) => (
                            <Badge
                              key={i}
                              className="bg-purple-500/20 text-purple-300 border-purple-500/30 cursor-pointer hover:bg-purple-500/30"
                              onClick={() => entity.node_id && onEntityClick?.(entity.node_id)}
                            >
                              {entity.label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {message.insights?.length > 0 && (
                      <div className="border-t border-white/10 pt-3">
                        <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                          <Lightbulb className="w-3 h-3" />
                          Key Insights:
                        </p>
                        <ul className="text-xs space-y-1 list-disc list-inside text-slate-300">
                          {message.insights.map((insight, i) => (
                            <li key={i}>{insight}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {message.suggested_queries?.length > 0 && (
                      <div className="border-t border-white/10 pt-3">
                        <p className="text-xs text-slate-400 mb-2">Suggested follow-ups:</p>
                        <div className="space-y-1">
                          {message.suggested_queries.map((query, i) => (
                            <button
                              key={i}
                              onClick={() => handleSuggestedQuery(query)}
                              className="text-xs text-blue-400 hover:text-blue-300 block"
                            >
                              → {query}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {message.confidence && (
                      <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
                        <span>Confidence:</span>
                        <Badge variant="outline" className="border-white/20">
                          {Math.round(message.confidence * 100)}%
                        </Badge>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm">{message.content}</p>
                )}
              </div>
            </div>
          ))}
          {queryMutation.isPending && (
            <div className="flex justify-start">
              <div className="bg-white/10 rounded-lg p-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                <span className="text-sm text-slate-300">Analyzing knowledge graph...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask about entities, relationships, patterns..."
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
          />
          <Button
            onClick={handleSend}
            disabled={!userInput.trim() || queryMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}