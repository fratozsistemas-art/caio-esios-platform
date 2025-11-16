import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, X, Loader2, Plus, Menu, MessageSquare, Zap, GitMerge, Activity } from "lucide-react";
import { toast } from "sonner";
import { createPageUrl } from "../utils";
import { Link } from "react-router-dom";
import ConversationList from "../components/chat/ConversationList";
import MessageBubble from "../components/chat/MessageBubble";
import AgentPersonaSelector from "../components/chat/AgentPersonaSelector";
import MessageFeedback from "../components/chat/MessageFeedback";
import ConversationSummary from "../components/chat/ConversationSummary";
import ShareDialog from "../components/collaboration/ShareDialog";
import AnalysisPanel from "../components/chat/AnalysisPanel";
import AIFeatures from "../components/chat/AIFeatures";
import AgentOrchestrationPanel from "../components/chat/AgentOrchestrationPanel";
import OrchestrationDashboard from "../components/orchestration/OrchestrationDashboard";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function Chat() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [agentPersona, setAgentPersona] = useState('strategic_advisor');
  const [useOrchestration, setUseOrchestration] = useState(false);
  const [lastOrchestration, setLastOrchestration] = useState(null);
  const [showOrchestrationDashboard, setShowOrchestrationDashboard] = useState(false);
  const [activeOrchestration, setActiveOrchestration] = useState(null);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const resizeRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const { data: conversations = [], refetch: refetchConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const allConvs = await base44.agents.listConversations({
        agent_name: "caio_agent"
      });
      return allConvs.filter(c => !c.metadata?.deleted);
    }
  });

  useEffect(() => {
    if (!selectedConversation) return;

    const unsubscribe = base44.agents.subscribeToConversation(
      selectedConversation.id,
      (data) => {
        setMessages(data.messages || []);
      }
    );

    return () => unsubscribe();
  }, [selectedConversation?.id]);

  useEffect(() => {
    if (selectedConversation && messages.length === 2 && !selectedConversation.metadata?.name) {
      const userMessage = messages.find(m => m.role === 'user');
      if (userMessage?.content) {
        base44.functions.invoke('autoNameConversation', {
          conversation_id: selectedConversation.id
        }).then(() => {
          refetchConversations();
        });
      }
    }
  }, [messages, selectedConversation]);

  const handleCreateConversation = async () => {
    try {
      const newConv = await base44.agents.createConversation({
        agent_name: "caio_agent",
        metadata: {
          created_at: new Date().toISOString(),
          persona: agentPersona,
          orchestration_enabled: useOrchestration
        }
      });
      setSelectedConversation(newConv);
      setMessages([]);
      refetchConversations();
    } catch (error) {
      toast.error("Failed to create conversation");
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        return { name: file.name, url: file_url };
      });
      
      const uploaded = await Promise.all(uploadPromises);
      setUploadedFiles(prev => [...prev, ...uploaded]);
      toast.success(`${files.length} file(s) uploaded`);
    } catch (error) {
      toast.error("File upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendMessage = async () => {
    if ((!userInput.trim() && uploadedFiles.length === 0) || !selectedConversation || isSending) return;

    const messageContent = userInput.trim();
    const filesToSend = [...uploadedFiles];

    setUserInput("");
    setUploadedFiles([]);
    setIsSending(true);

    try {
      if (useOrchestration) {
        // Show dashboard for orchestration
        setShowOrchestrationDashboard(true);
        
        const { data } = await base44.functions.invoke('orchestrateAgents', {
          user_message: messageContent,
          conversation_id: selectedConversation.id,
          conversation_history: messages,
          user_profile_id: selectedConversation.metadata?.behavioral_profile_id
        });

        if (data.success) {
          setLastOrchestration(data.orchestration);
          setActiveOrchestration(data.orchestration);
          
          await base44.agents.addMessage(selectedConversation, {
            role: "user",
            content: messageContent,
            file_urls: filesToSend.map(f => f.url)
          });

          await base44.agents.addMessage(selectedConversation, {
            role: "assistant",
            content: data.response.content,
            metadata: {
              orchestration: data.orchestration,
              crv_scores: data.response.crv_scores,
              source_agents: data.response.source_agents
            }
          });

          toast.success(`Orchestrated ${data.orchestration.agents_used.length} agents`);
          
          // Close dashboard after completion
          setTimeout(() => {
            setShowOrchestrationDashboard(false);
            setActiveOrchestration(null);
          }, 3000);
        }
      } else {
        await base44.agents.addMessage(selectedConversation, {
          role: "user",
          content: messageContent || "Analyze these files",
          file_urls: filesToSend.map(f => f.url)
        });
      }
    } catch (error) {
      toast.error("Failed to send message");
      console.error(error);
      setShowOrchestrationDashboard(false);
      setActiveOrchestration(null);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePersonaChange = async (newPersona) => {
    setAgentPersona(newPersona);
    
    if (selectedConversation) {
      const currentMetadata = selectedConversation.metadata || {};
      await base44.asServiceRole.agents.updateConversation(selectedConversation.id, {
        metadata: {
          ...currentMetadata,
          persona: newPersona,
          persona_changed_at: new Date().toISOString()
        }
      });
      
      toast.success(`Switched to ${newPersona.replace('_', ' ')} persona`);
    }
  };

  const handleOrchestrationIntervention = (intervention) => {
    console.log('Intervention requested:', intervention);
    toast.info(`Intervention applied: ${intervention.action}`);
    // In production, this would send the intervention to the backend
  };

  const startResize = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = Math.min(Math.max(e.clientX, 250), 500);
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleSuggestedPrompt = (prompt) => {
    setUserInput(prompt);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
      {/* Orchestration Dashboard Overlay */}
      {showOrchestrationDashboard && activeOrchestration && (
        <OrchestrationDashboard
          orchestrationData={activeOrchestration}
          isActive={isSending}
          onClose={() => {
            setShowOrchestrationDashboard(false);
            setActiveOrchestration(null);
          }}
          onIntervene={handleOrchestrationIntervention}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`${sidebarOpen ? 'block' : 'hidden'} lg:block border-r border-white/10 bg-slate-900/50 backdrop-blur-xl flex flex-col relative`}
        style={{ width: sidebarOpen ? `${sidebarWidth}px` : '0px' }}
      >
        <div className="p-4 border-b border-white/10">
          <Button
            onClick={handleCreateConversation}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Conversation
          </Button>
        </div>

        <ConversationList
          conversations={conversations}
          selectedConversation={selectedConversation}
          onSelectConversation={setSelectedConversation}
          onDeleteConversation={refetchConversations}
        />

        <div
          ref={resizeRef}
          className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500/50 transition-colors"
          onMouseDown={startResize}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="border-b border-white/10 bg-slate-900/50 backdrop-blur-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden text-white"
                >
                  <Menu className="w-5 h-5" />
                </Button>
                <div>
                  <h2 className="text-white font-semibold">
                    {selectedConversation?.metadata?.name || "CAIO Strategic Intelligence"}
                  </h2>
                  <p className="text-sm text-slate-400">
                    {useOrchestration ? '🤖 Multi-agent orchestration enabled' : 'AI-powered strategic advisor'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Orchestration Toggle */}
                <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                  <GitMerge className="w-4 h-4 text-purple-400" />
                  <Label htmlFor="orchestration" className="text-xs text-slate-300 cursor-pointer">
                    Orchestration
                  </Label>
                  <Switch
                    id="orchestration"
                    checked={useOrchestration}
                    onCheckedChange={setUseOrchestration}
                  />
                </div>

                {/* Dashboard Toggle */}
                {lastOrchestration && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setActiveOrchestration(lastOrchestration);
                      setShowOrchestrationDashboard(true);
                    }}
                    className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    View Dashboard
                  </Button>
                )}

                {selectedConversation && (
                  <>
                    <AnalysisPanel conversationId={selectedConversation.id} />
                    <ShareDialog
                      conversationId={selectedConversation.id}
                      existingShares={selectedConversation.metadata?.shared_with || []}
                    />
                    {messages.length > 0 && (
                      <ConversationSummary 
                        conversation={selectedConversation}
                        messages={messages}
                      />
                    )}
                  </>
                )}
                <AgentPersonaSelector
                  currentPersona={agentPersona}
                  onPersonaChange={handlePersonaChange}
                />
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {!selectedConversation ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <MessageSquare className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Welcome to CAIO</h3>
                  <p className="text-slate-400 max-w-md">
                    Your AI-powered strategic intelligence assistant with multi-agent orchestration.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleCreateConversation}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Start New Conversation
                  </Button>
                  <Link to={createPageUrl('QuickActions')}>
                    <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">
                      <Zap className="w-4 h-4 mr-2" />
                      Browse Quick Actions
                    </Button>
                  </Link>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto">
                    <MessageSquare className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Start the conversation</h3>
                    <p className="text-slate-400">Ask me anything about strategy, markets, or analysis</p>
                    {useOrchestration && (
                      <p className="text-purple-400 text-sm mt-2">
                        ⚡ Multi-agent orchestration active
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-6">
                {messages.map((message, idx) => (
                  <div key={idx}>
                    <MessageBubble message={message} />
                    {message.role === 'assistant' && (
                      <MessageFeedback
                        conversationId={selectedConversation.id}
                        messageId={message.id || `msg-${idx}`}
                      />
                    )}
                    {message.metadata?.orchestration && (
                      <div className="mt-3">
                        <AgentOrchestrationPanel orchestrationData={message.metadata.orchestration} />
                      </div>
                    )}
                  </div>
                ))}
                {isSending && (
                  <div className="flex items-center gap-3 text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">
                      {useOrchestration ? 'Orchestrating agents...' : 'CAIO is thinking...'}
                    </span>
                  </div>
                )}
                {lastOrchestration && isSending && (
                  <AgentOrchestrationPanel orchestrationData={lastOrchestration} />
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          {selectedConversation && (
            <div className="border-t border-white/10 bg-slate-900/50 backdrop-blur-xl p-4">
              <div className="max-w-4xl mx-auto">
                {uploadedFiles.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {uploadedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg text-sm border border-blue-500/30">
                        <Paperclip className="w-3 h-3" />
                        <span>{file.name}</span>
                        <button
                          onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== idx))}
                          className="hover:text-blue-300"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="border-white/10 text-white hover:bg-white/10"
                  >
                    {isUploading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Paperclip className="w-5 h-5" />
                    )}
                  </Button>

                  <Textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask CAIO anything..."
                    className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-slate-500 resize-none"
                    rows={1}
                  />

                  <Button
                    onClick={handleSendMessage}
                    disabled={isSending || (!userInput.trim() && uploadedFiles.length === 0)}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar for AI features */}
        {selectedConversation && messages.length > 0 && (
          <div className="lg:w-96 border-t lg:border-t-0 lg:border-l border-white/10 bg-slate-900/50 backdrop-blur-xl overflow-y-auto">
            <div className="p-4">
              <AIFeatures 
                conversationId={selectedConversation.id}
                onPromptSelect={handleSuggestedPrompt}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}