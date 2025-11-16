import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bug, MessageSquare, Code, Database, Activity, 
  Copy, Download, ChevronDown, ChevronUp, Terminal
} from 'lucide-react';
import { toast } from 'sonner';

export default function DebugPanel({ execution, selectedAgentId }) {
  const [expandedLogs, setExpandedLogs] = useState(new Set());
  const [activeTab, setActiveTab] = useState('state');

  if (!execution) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-12 text-center">
          <Bug className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No execution selected</p>
        </CardContent>
      </Card>
    );
  }

  const agentState = selectedAgentId && execution.agent_states?.[selectedAgentId];
  const logs = execution.logs || [];
  const communicationLog = execution.communication_log || [];
  
  const agentLogs = selectedAgentId 
    ? logs.filter(log => log.agent_id === selectedAgentId || log.message.includes(selectedAgentId))
    : logs;

  const agentMessages = selectedAgentId
    ? communicationLog.filter(msg => msg.from === selectedAgentId || msg.to === selectedAgentId)
    : communicationLog;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const downloadJSON = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded');
  };

  const toggleLog = (logId) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Bug className="w-5 h-5 text-orange-400" />
            Debug Panel
            {selectedAgentId && (
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                {selectedAgentId}
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => downloadJSON(execution, `execution-${execution.id}.json`)}
              className="h-7 w-7 text-slate-400 hover:text-white"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="state" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
              <Database className="w-4 h-4 mr-2" />
              Agent State
            </TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
              <MessageSquare className="w-4 h-4 mr-2" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="llm" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
              <Code className="w-4 h-4 mr-2" />
              LLM Calls
            </TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400">
              <Terminal className="w-4 h-4 mr-2" />
              Logs
            </TabsTrigger>
          </TabsList>

          {/* Agent State Tab */}
          <TabsContent value="state" className="space-y-4 mt-4">
            {agentState ? (
              <div className="space-y-3">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-blue-400">Current State</p>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => copyToClipboard(JSON.stringify(agentState, null, 2))}
                      className="h-6 w-6"
                    >
                      <Copy className="w-3 h-3 text-blue-400" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500">Status:</span>
                      <span className="text-white ml-2">{agentState.status}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Retries:</span>
                      <span className="text-white ml-2">{agentState.retries || 0}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Messages Sent:</span>
                      <span className="text-white ml-2">{agentState.messages_sent || 0}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Messages Received:</span>
                      <span className="text-white ml-2">{agentState.messages_received || 0}</span>
                    </div>
                  </div>
                </div>

                {agentState.inputs && (
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-xs font-medium text-slate-400 mb-2">Inputs:</p>
                    <pre className="text-xs text-slate-300 whitespace-pre-wrap max-h-48 overflow-auto">
                      {JSON.stringify(agentState.inputs, null, 2)}
                    </pre>
                  </div>
                )}

                {agentState.outputs && (
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-xs font-medium text-slate-400 mb-2">Outputs:</p>
                    <pre className="text-xs text-slate-300 whitespace-pre-wrap max-h-48 overflow-auto">
                      {JSON.stringify(agentState.outputs, null, 2)}
                    </pre>
                  </div>
                )}

                {agentState.error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <p className="text-xs font-medium text-red-400 mb-2">Error:</p>
                    <p className="text-xs text-red-300">{agentState.error}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Database className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">
                  {selectedAgentId ? 'No state data for selected agent' : 'Select an agent to view state'}
                </p>
              </div>
            )}
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-2 mt-4 max-h-96 overflow-y-auto">
            {agentMessages.length > 0 ? (
              agentMessages.map((msg, idx) => (
                <div key={idx} className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={`${
                        msg.type === 'data_request' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                        msg.type === 'task_delegation' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                        msg.type === 'status_update' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        'bg-slate-500/20 text-slate-400 border-slate-500/30'
                      } text-xs`}>
                        {msg.type}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {msg.processed && (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                        Processed
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mb-2">
                    <span className="text-blue-400">{msg.from}</span>
                    {' → '}
                    <span className="text-purple-400">{msg.to}</span>
                  </div>
                  {msg.payload && (
                    <pre className="text-xs text-slate-300 whitespace-pre-wrap bg-black/20 rounded p-2">
                      {JSON.stringify(msg.payload, null, 2)}
                    </pre>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No messages logged</p>
              </div>
            )}
          </TabsContent>

          {/* LLM Calls Tab */}
          <TabsContent value="llm" className="space-y-2 mt-4 max-h-96 overflow-y-auto">
            {agentState?.llm_calls && agentState.llm_calls.length > 0 ? (
              agentState.llm_calls.map((call, idx) => {
                const isExpanded = expandedLogs.has(`llm-${idx}`);
                return (
                  <div key={idx} className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Code className="w-4 h-4 text-green-400" />
                        <span className="text-xs text-green-400 font-medium">
                          LLM Call #{idx + 1}
                        </span>
                        {call.duration_ms && (
                          <Badge className="bg-white/10 text-slate-300 text-xs">
                            {call.duration_ms}ms
                          </Badge>
                        )}
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => toggleLog(`llm-${idx}`)}
                        className="h-6 w-6"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </Button>
                    </div>

                    {isExpanded && (
                      <div className="space-y-2 mt-3">
                        {call.prompt && (
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Prompt:</p>
                            <pre className="text-xs text-slate-300 whitespace-pre-wrap bg-black/30 rounded p-2 max-h-48 overflow-auto">
                              {call.prompt}
                            </pre>
                          </div>
                        )}
                        {call.response && (
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Response:</p>
                            <pre className="text-xs text-slate-300 whitespace-pre-wrap bg-black/30 rounded p-2 max-h-48 overflow-auto">
                              {typeof call.response === 'string' ? call.response : JSON.stringify(call.response, null, 2)}
                            </pre>
                          </div>
                        )}
                        {call.parameters && (
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Parameters:</p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {Object.entries(call.parameters).map(([key, value]) => (
                                <div key={key}>
                                  <span className="text-slate-500">{key}:</span>
                                  <span className="text-white ml-2">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <Code className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No LLM calls logged</p>
              </div>
            )}
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-2 mt-4 max-h-96 overflow-y-auto">
            {agentLogs.length > 0 ? (
              agentLogs.map((log, idx) => (
                <div 
                  key={idx} 
                  className={`rounded-lg p-2 border text-xs ${
                    log.level === 'error' ? 'bg-red-500/10 border-red-500/20' :
                    log.level === 'warn' ? 'bg-yellow-500/10 border-yellow-500/20' :
                    log.level === 'info' ? 'bg-blue-500/10 border-blue-500/20' :
                    'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Badge className={`${
                      log.level === 'error' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      log.level === 'warn' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                      log.level === 'info' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                      'bg-slate-500/20 text-slate-400 border-slate-500/30'
                    } text-xs`}>
                      {log.level}
                    </Badge>
                    <span className="text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-slate-300">{log.message}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Terminal className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No logs available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}