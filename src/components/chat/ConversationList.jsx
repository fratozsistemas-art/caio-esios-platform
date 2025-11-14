import React from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, MessageSquare, Briefcase, TrendingUp, Zap, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "sonner";

export default function ConversationList({
  conversations,
  selectedConversation,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation
}) {
  const [deletingId, setDeletingId] = React.useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [conversationToDelete, setConversationToDelete] = React.useState(null);

  const getConversationIcon = (conversation) => {
    const name = conversation.metadata?.name?.toLowerCase() || '';
    
    if (name.includes('market') || name.includes('mercado')) return TrendingUp;
    if (name.includes('strategy') || name.includes('estratégia')) return Briefcase;
    if (name.includes('quick action') || name.includes('análise')) return Zap;
    
    return MessageSquare;
  };

  const getConversationTitle = (conversation) => {
    if (conversation.metadata?.auto_named && conversation.metadata?.name) {
      return conversation.metadata.name;
    }
    
    if (conversation.metadata?.name && conversation.metadata.name !== 'Nova Conversa') {
      return conversation.metadata.name;
    }
    
    const firstUserMsg = conversation.messages?.find(m => 
      m.role === 'user' && m.content && m.content.trim().length > 0
    );
    
    if (firstUserMsg) {
      const preview = firstUserMsg.content.substring(0, 40);
      return preview.length < firstUserMsg.content.length ? preview + '...' : preview;
    }
    
    return 'Nova Conversa';
  };

  const getRelativeTime = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: ptBR 
      });
    } catch {
      return format(new Date(dateString), "dd/MM/yyyy");
    }
  };

  const groupedConversations = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const groups = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: []
    };

    // Filter out deleted conversations
    const activeConversations = conversations.filter(conv => !conv.metadata?.deleted);

    activeConversations.forEach(conv => {
      const convDate = new Date(conv.created_date);
      convDate.setHours(0, 0, 0, 0);
      
      if (convDate.getTime() === today.getTime()) {
        groups.today.push(conv);
      } else if (convDate.getTime() === yesterday.getTime()) {
        groups.yesterday.push(conv);
      } else if (convDate >= lastWeek) {
        groups.thisWeek.push(conv);
      } else {
        groups.older.push(conv);
      }
    });

    return groups;
  }, [conversations]);

  const handleDeleteClick = (e, conversation, title) => {
    e.stopPropagation();
    setConversationToDelete({ id: conversation.id, title });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!conversationToDelete) return;
    
    setDeletingId(conversationToDelete.id);
    setDeleteDialogOpen(false);
    
    try {
      toast.loading('Excluindo conversa...', { id: 'delete-toast' });
      
      const { data } = await base44.functions.invoke('deleteConversation', {
        conversation_id: conversationToDelete.id
      });
      
      toast.dismiss('delete-toast');
      
      if (data.success) {
        if (onDeleteConversation) {
          onDeleteConversation(conversationToDelete.id);
        }
        toast.success('✅ Conversa excluída com sucesso!');
      } else {
        toast.error(`❌ ${data.error || 'Erro ao excluir conversa'}`);
      }
      
    } catch (error) {
      console.error('Delete conversation error:', error);
      toast.dismiss('delete-toast');
      
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao excluir conversa';
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setDeletingId(null);
      setConversationToDelete(null);
    }
  };

  const renderConversation = (conversation) => {
    const Icon = getConversationIcon(conversation);
    const title = getConversationTitle(conversation);
    const isActive = selectedConversation?.id === conversation.id;
    const isDeleting = deletingId === conversation.id;

    return (
      <div
        key={conversation.id}
        className={cn(
          "group relative mb-1",
          isDeleting && "opacity-50 pointer-events-none"
        )}
      >
        <div
          className={cn(
            "flex items-start gap-3 p-3 rounded-lg transition-all duration-200 cursor-pointer pr-12",
            isActive
              ? "bg-white/10 border border-white/20"
              : "hover:bg-white/5 border border-transparent"
          )}
          onClick={() => onSelectConversation(conversation)}
        >
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
            isActive ? "bg-blue-500/20" : "bg-white/5 group-hover:bg-white/10"
          )}>
            <Icon className={cn(
              "w-4 h-4",
              isActive ? "text-blue-400" : "text-slate-400 group-hover:text-slate-300"
            )} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className={cn(
              "font-medium text-sm mb-1 line-clamp-2",
              isActive ? "text-white" : "text-slate-300 group-hover:text-white"
            )}>
              {title}
            </div>
            <div className="text-xs text-slate-500">
              {getRelativeTime(conversation.created_date)}
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => handleDeleteClick(e, conversation, title)}
          disabled={isDeleting}
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2",
            "h-8 w-8",
            "text-slate-500 hover:text-red-400 hover:bg-red-500/10",
            "opacity-0 group-hover:opacity-100 transition-opacity",
            isActive && "opacity-100"
          )}
          title="Excluir conversa"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    );
  };

  const activeConversationsCount = conversations.filter(c => !c.metadata?.deleted).length;

  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <Button
            onClick={onNewConversation}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Conversa
          </Button>
        </div>

        <ScrollArea className="flex-1 p-2">
          {activeConversationsCount === 0 ? (
            <div className="text-center py-8 px-4">
              <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-400">
                Nenhuma conversa ainda
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {groupedConversations.today.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Hoje
                  </div>
                  <div className="mt-2">
                    {groupedConversations.today.map(renderConversation)}
                  </div>
                </div>
              )}

              {groupedConversations.yesterday.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Ontem
                  </div>
                  <div className="mt-2">
                    {groupedConversations.yesterday.map(renderConversation)}
                  </div>
                </div>
              )}

              {groupedConversations.thisWeek.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Esta Semana
                  </div>
                  <div className="mt-2">
                    {groupedConversations.thisWeek.map(renderConversation)}
                  </div>
                </div>
              )}

              {groupedConversations.older.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Mais Antigas
                  </div>
                  <div className="mt-2">
                    {groupedConversations.older.map(renderConversation)}
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir conversa?"
        description={`Tem certeza que deseja excluir "${conversationToDelete?.title}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={handleConfirmDelete}
        variant="danger"
      />
    </>
  );
}