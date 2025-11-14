import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Plus, Brain, Loader2, FileText, Upload, Zap, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import MessageBubble from "../components/chat/MessageBubble";
import ConversationList from "../components/chat/ConversationList";
import AIFeatures from "../components/chat/AIFeatures";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'sonner';
import { createPageUrl } from "@/utils";

export default function Chat() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  
  // Layout states
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (location.state?.quickAction) {
      const action = location.state.quickAction;
      const workspaceContext = location.state.workspaceContext;
      
      let contextPrefix = "";
      if (workspaceContext) {
        contextPrefix = `[Workspace: ${workspaceContext.workspace_name}`;
        if (workspaceContext.phase_name) {
          contextPrefix += ` - Phase: ${workspaceContext.phase_name}`;
        }
        contextPrefix += "]\n\n";
      }
      
      setInputMessage(`${contextPrefix}Activate Quick Action: ${action.title}\n\n${action.prompt_template}`);
    } else if (location.state?.workspaceContext) {
      const context = location.state.workspaceContext;
      setInputMessage(location.state.initialMessage || `[Workspace: ${context.workspace_name}]\n\nHello CAIO, I'm working on this workspace.`);
    }
  }, [location.state]);

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      try {
        return await base44.agents.listConversations({ agent_name: "caio_agent" });
      } catch (error) {
        console.error("Error fetching conversations:", error);
        return [];
      }
    },
    initialData: [],
  });

  const createConversationMutation = useMutation({
    mutationFn: async () => {
      return await base44.agents.createConversation({
        agent_name: "caio_agent",
        metadata: {
          name: `New Consultation ${new Date().toLocaleString()}`,
        }
      });
    },
    onSuccess: (newConversation) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setSelectedConversation(newConversation);
      setMessages(newConversation.messages || []);
    },
    onError: (error) => {
      console.error("Error creating conversation:", error);
      toast.error('Failed to create conversation');
    }
  });

  useEffect(() => {
    if (selectedConversation) {
      const unsubscribe = base44.agents.subscribeToConversation(
        selectedConversation.id,
        (data) => {
          setMessages(data.messages || []);
        }
      );
      return () => unsubscribe();
    }
  }, [selectedConversation?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const autoNameConversation = async (conversationId) => {
    try {
      await base44.functions.invoke('autoNameConversation', {
        conversation_id: conversationId
      });
      queryClient.invalidateQueries(['conversations']);
    } catch (error) {
      console.error('Auto-naming failed:', error);
    }
  };

  const sendMessageToAgent = async (messageContent) => {
    setIsSending(true);
    try {
      await base44.agents.addMessage(selectedConversation, {
        role: "user",
        content: messageContent,
        file_urls: uploadedFiles
      });
      
      if (selectedConversation?.id) {
        queryClient.invalidateQueries(['conversations', selectedConversation.id]);
        const conv = await base44.agents.getConversation(selectedConversation.id);
        const userMessageCount = conv?.messages?.filter(m => m.role === 'user')?.length || 0;
        
        if (userMessageCount === 1) {
          setTimeout(() => autoNameConversation(selectedConversation.id), 3000);
        }
      }
      
      setInputMessage("");
      setUploadedFiles([]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Error sending message. Please try again.");
    }
    setIsSending(false);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedConversation || isSending) return;
    await sendMessageToAgent(inputMessage);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedFiles(prev => [...prev, file_url]);
      toast.success('File uploaded');
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error('Failed to upload file');
    }
  };

  const handleSelectConversation = async (conversation) => {
    try {
      const fullConversation = await base44.agents.getConversation(conversation.id);
      setSelectedConversation(fullConversation);
      setMessages(fullConversation.messages || []);
    } catch (error) {
      console.error("Error loading conversation:", error);
      toast.error('Failed to load conversation');
    }
  };

  const handleNewConversation = () => {
    createConversationMutation.mutate();
  };

  const handleDeleteConversation = (deletedId) => {
    if (selectedConversation?.id === deletedId) {
      setSelectedConversation(null);
      setMessages([]);
    }
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
  };

  // Resize handler
  const startResizing = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = e.clientX;
      if (newWidth >= 200 && newWidth <= 500) {
        setSidebarWidth(newWidth);
      }
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

  return (
    <div className="h-[calc(100vh-6rem)] flex gap-0 relative">
      {/* Sidebar Toggle Button (when collapsed) */}
      {!sidebarOpen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(true)}
          className="absolute top-4 left-4 z-50 bg-white/10 hover:bg-white/20 border border-white/10"
        >
          <PanelLeftOpen className="w-5 h-5 text-white" />
        </Button>
      )}

      {/* Conversation List Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ width: `${sidebarWidth}px` }}
            className="relative flex-shrink-0"
          >
            <div className="h-full flex flex-col bg-white/5 border-r border-white/10 backdrop-blur-sm">
              {/* Header with collapse button */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h2 className="font-semibold text-white">Conversations</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  className="text-slate-400 hover:text-white hover:bg-white/10"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </Button>
              </div>

              {/* Conversation List */}
              <ConversationList
                conversations={conversations}
                selectedConversation={selectedConversation}
                onSelectConversation={handleSelectConversation}
                onNewConversation={handleNewConversation}
                onDeleteConversation={handleDeleteConversation}
              />
            </div>

            {/* Resize Handle */}
            <div
              onMouseDown={startResizing}
              className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500/50 transition-colors ${
                isResizing ? 'bg-blue-500' : 'bg-transparent'
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm overflow-hidden">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-white">CAIO - Chief AI Officer</h2>
                  <p className="text-sm text-slate-400">Always online, always strategic</p>
                </div>
              </div>
            </div>

            {/* AI Features Bar */}
            <AIFeatures 
              conversation={selectedConversation}
              onSuggestionClick={(suggestion) => setInputMessage(suggestion)}
            />

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <AnimatePresence mode="popLayout">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <MessageBubble message={message} />
                  </motion.div>
                ))}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-white/10">
              {uploadedFiles.length > 0 && (
                <div className="mb-3 flex gap-2">
                  {uploadedFiles.map((url, index) => (
                    <div key={index} className="px-3 py-2 rounded-lg bg-blue-500/20 text-blue-400 text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      File {index + 1}
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-3">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="border-white/20 text-white hover:bg-white/5"
                >
                  <Upload className="w-4 h-4" />
                </Button>
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask CAIO about strategies, analysis, ROI..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                  disabled={isSending}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isSending || !inputMessage.trim()}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6">
            <Card className="max-w-md w-full bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Welcome to CAIO
                </h3>
                <p className="text-slate-400 mb-6">
                  Start a new conversation to begin transforming data into validated strategies
                </p>
                <Button
                  onClick={handleNewConversation}
                  disabled={createConversationMutation.isPending}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 w-full"
                >
                  {createConversationMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      New Conversation
                    </>
                  )}
                </Button>
                
                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-sm text-slate-400 mb-3">Or start with a Quick Action:</p>
                  <div className="flex flex-col gap-2">
                    <Link to={createPageUrl("QuickActions")}>
                      <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/5">
                        <Zap className="w-4 h-4 mr-2" />
                        Browse 48+ Quick Actions
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}