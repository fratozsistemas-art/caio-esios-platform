
import React from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Trash2, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      // It's crucial to filter out soft-deleted conversations before attempting to delete them
      // from the backend function. Assuming the 'deleteAllConversations' function will
      // handle only non-deleted ones or an empty list if all are soft-deleted.
      // If `deleteAllConversations` truly hard deletes everything, then the filter below isn't needed.
      // For now, based on the `agent_name` param, it seems to be a bulk operation
      // rather than acting on specific soft-deleted ones.
      const { data } = await base44.functions.invoke('deleteAllConversations', {
        agent_name: 'caio_agent' // Assuming this is the correct agent name from context
      });
      return data;
    },
    onSuccess: (data) => {
      // Invalidate queries to refetch the updated list of conversations
      queryClient.invalidateQueries(['conversations']);
      // Trigger a callback to the parent component, useful if the selected conversation was deleted
      onDeleteConversation?.(); 
      toast.success(`${data.deleted_count || 0} conversations deleted`); // Provide a default count
    },
    onError: (error) => {
      console.error("Failed to delete all conversations:", error);
      toast.error("Failed to delete conversations");
    }
  });

  const deleteSingleMutation = useMutation({
    mutationFn: async (conversationId) => {
      const conv = conversations.find(c => c.id === conversationId);
      if (!conv) {
        throw new Error("Conversation not found.");
      }
      // Soft delete by updating metadata
      await base44.asServiceRole.agents.updateConversation(conversationId, {
        metadata: {
          ...conv.metadata,
          deleted: true,
          deleted_at: new Date().toISOString()
        }
      });
    },
    onSuccess: () => {
      // Invalidate queries to refetch the updated list of conversations
      queryClient.invalidateQueries(['conversations']);
      // Trigger a callback to the parent component, useful if the selected conversation was deleted
      onDeleteConversation?.(); 
      toast.success("Conversation deleted");
    },
    onError: (error) => {
      console.error("Failed to delete single conversation:", error);
      toast.error("Failed to delete conversation");
    }
  });

  const handleDeleteAll = () => {
    // Only allow deletion if there are active conversations to delete
    const activeConversations = conversations.filter(c => !c.metadata?.deleted);
    if (activeConversations.length === 0) {
      toast.info("No conversations to delete.");
      return;
    }

    if (window.confirm('Delete all conversations? This cannot be undone.')) {
      deleteAllMutation.mutate();
    }
  };

  // Filter out soft-deleted conversations for display
  const activeConversations = conversations.filter(conv => !conv.metadata?.deleted);

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Conversations
        </h3>
        {activeConversations.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDeleteAll}
            disabled={deleteAllMutation.isPending}
            className="h-6 w-6 text-red-400 hover:text-red-300"
            title="Delete all conversations"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {activeConversations.map((conv) => {
          const isActive = selectedConversation?.id === conv.id;
          const displayName = conv.metadata?.name || 'New conversation';
          const messageCount = conv.messages?.length || 0;
          const isDeleting = deleteSingleMutation.isPending && deleteSingleMutation.variables === conv.id;

          return (
            <div
              key={conv.id}
              className={`group relative rounded-lg transition-all cursor-pointer ${
                isActive 
                  ? 'bg-blue-500/20 border border-blue-500/30' 
                  : 'bg-white/5 hover:bg-white/10 border border-transparent'
              } ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <div
                onClick={() => onSelectConversation(conv)}
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
                        {/* Use conv.created_date as fallback if metadata?.created_at is missing */}
                        {format(new Date(conv.metadata?.created_at || conv.created_date), 'MMM d, HH:mm')}
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
                    disabled={isDeleting} // Disable dropdown trigger while deleting this item
                  >
                    <MoreVertical className="w-4 h-4 text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => deleteSingleMutation.mutate(conv.id)}
                    className="text-red-400"
                    disabled={isDeleting} // Disable menu item while deleting
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}

        {activeConversations.length === 0 && (
          <div className="text-center py-8">
            <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No conversations yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
