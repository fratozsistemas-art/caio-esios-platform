import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MessageCircle, Send, ArrowRight, CheckCircle, Clock, 
  AlertCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MESSAGE_TYPE_CONFIG = {
  status_update: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Clock },
  data_request: { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: Send },
  data_response: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle },
  task_delegation: { color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: ArrowRight },
  validation_request: { color: 'bg-pink-500/20 text-pink-400 border-pink-500/30', icon: AlertCircle },
  validation_response: { color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', icon: CheckCircle }
};

export default function AgentCommunicationLog({ communicationLog, agentStates }) {
  const [expandedMessage, setExpandedMessage] = useState(null);
  const [filter, setFilter] = useState('all');

  if (!communicationLog || communicationLog.length === 0) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-cyan-400" />
            Inter-Agent Communication
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No inter-agent messages</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const messageTypes = [...new Set(communicationLog.map(m => m.type))];
  const filteredMessages = filter === 'all' 
    ? communicationLog 
    : communicationLog.filter(m => m.type === filter);

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-cyan-400" />
            Inter-Agent Communication
          </CardTitle>
          <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
            {communicationLog.length} messages
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className={filter === 'all' 
              ? 'bg-cyan-600 hover:bg-cyan-700 h-7' 
              : 'border-white/10 text-slate-400 hover:bg-white/10 h-7'
            }
          >
            All
          </Button>
          {messageTypes.map(type => {
            const config = MESSAGE_TYPE_CONFIG[type];
            return (
              <Button
                key={type}
                size="sm"
                variant={filter === type ? 'default' : 'outline'}
                onClick={() => setFilter(type)}
                className={filter === type 
                  ? 'bg-cyan-600 hover:bg-cyan-700 h-7 text-xs' 
                  : 'border-white/10 text-slate-400 hover:bg-white/10 h-7 text-xs'
                }
              >
                {type.replace(/_/g, ' ')}
              </Button>
            );
          })}
        </div>

        {/* Message Timeline */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {filteredMessages.map((message, idx) => {
              const config = MESSAGE_TYPE_CONFIG[message.type] || MESSAGE_TYPE_CONFIG.status_update;
              const Icon = config.icon;
              const isExpanded = expandedMessage === message.id;
              const fromAgent = Object.entries(agentStates).find(([id]) => id === message.from);
              const toAgent = message.to !== 'broadcast' 
                ? Object.entries(agentStates).find(([id]) => id === message.to)
                : null;

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="bg-white/5 rounded-lg border border-white/10 overflow-hidden"
                >
                  <div 
                    onClick={() => setExpandedMessage(isExpanded ? null : message.id)}
                    className="p-3 cursor-pointer hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={`${config.color} text-xs`}>
                              {message.type.replace(/_/g, ' ')}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-xs text-white">
                            <span className="font-medium">{fromAgent?.[1]?.agent_name || 'Unknown'}</span>
                            <ArrowRight className="w-3 h-3 inline mx-1 text-slate-500" />
                            <span className="font-medium">
                              {message.to === 'broadcast' ? 'All Agents' : (toAgent?.[1]?.agent_name || message.to)}
                            </span>
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
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
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <div className="bg-white/5 rounded p-2">
                          <p className="text-xs text-slate-400 mb-1">Payload:</p>
                          <pre className="text-xs text-slate-300 whitespace-pre-wrap">
                            {JSON.stringify(message.payload, null, 2)}
                          </pre>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className={`text-xs ${
                            message.status === 'processed' 
                              ? 'border-green-500/30 text-green-400' 
                              : 'border-yellow-500/30 text-yellow-400'
                          }`}>
                            {message.status}
                          </Badge>
                          <span className="text-xs text-slate-500">ID: {message.id}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Communication Stats */}
        <div className="border-t border-white/10 pt-3">
          <p className="text-xs text-slate-400 mb-2">Communication Statistics:</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-blue-500/10 rounded p-2">
              <p className="text-xs text-slate-400">Total Messages</p>
              <p className="text-lg font-bold text-white">{communicationLog.length}</p>
            </div>
            <div className="bg-green-500/10 rounded p-2">
              <p className="text-xs text-slate-400">Processed</p>
              <p className="text-lg font-bold text-white">
                {communicationLog.filter(m => m.status === 'processed').length}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}