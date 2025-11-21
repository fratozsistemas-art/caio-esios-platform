import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Trash2, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ConversationList({ 
  conversations, 
  selectedConversation, 
  onSelectConversation,
  onDeleteConversation 
}) {
  const queryClient = useQueryClient();

  const handleSelectConversation = async (conv) => {
    try {
      // Fetch full conversation with messages
      const fullConv = await base44.agents.getConversation(conv.id);
      onSelectConversation(fullConv);
    } catch (error) {
      console.error('Error loading conversation:', error);
      onSelectConversation(conv);
    }
  };

  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('deleteAllConversations', {
        agent_name: 'caio_agent'
      });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['conversations']);
      onDeleteConversation?.();
      toast.success(`${data.deleted_count} conversas deletadas`);
    },
    onError: () => {
      toast.error("Falha ao deletar conversas");
    }
  });

  const deleteSingleMutation = useMutation({
    mutationFn: async (conversationId) => {
      const conv = conversations.find(c => c.id === conversationId);
      await base44.agents.updateConversation(conversationId, {
        metadata: {
          ...conv.metadata,
          deleted: true,
          deleted_at: new Date().toISOString()
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['conversations']);
      onDeleteConversation?.();
      toast.success("Conversa deletada");
    },
    onError: (error) => {
      console.error('Erro ao deletar conversa:', error);
      toast.error("Falha ao deletar conversa");
    }
  });

  const handleDeleteAll = () => {
    if (confirm('Deletar todas as conversas? Isso não pode ser desfeito.')) {
      deleteAllMutation.mutate();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Conversas
        </h3>
        {conversations.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDeleteAll}
            disabled={deleteAllMutation.isPending}
            className="h-6 w-6 text-red-400 hover:text-red-300"
            title="Deletar todas conversas"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {conversations.map((conv) => {
          const isActive = selectedConversation?.id === conv.id;
          const displayName = conv.metadata?.name || 'Nova conversa';
          const messageCount = conv.messages?.length || 0;

          return (
            <div
              key={conv.id}
              className={`group relative rounded-lg transition-all cursor-pointer ${
                isActive 
                  ? 'bg-blue-500/20 border border-blue-500/30' 
                  : 'bg-white/5 hover:bg-white/10 border border-transparent'
              }`}
            >
              <div
                onClick={() => handleSelectConversation(conv)}
                className="p-3"
              >
                <div className="flex items-start gap-2">
                  <MessageSquare className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                      {displayName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-slate-500">
                        {format(new Date(conv.metadata?.created_at || conv.created_date), 'dd/MM HH:mm')}
                      </p>
                      {messageCount > 0 && (
                        <Badge variant="outline" className="border-white/20 text-slate-400 text-xs">
                          {messageCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="w-4 h-4 text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSingleMutation.mutate(conv.id);
                    }}
                    className="text-red-400"
                    disabled={deleteSingleMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Deletar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}

        {conversations.length === 0 && (
          <div className="text-center py-8">
            <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-500">Nenhuma conversa ainda</p>
          </div>
        )}
      </div>
    </div>
  );
}