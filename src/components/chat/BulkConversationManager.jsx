import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MessageSquare, Trash2, Search, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function BulkConversationManager() {
  const [selectedConversations, setSelectedConversations] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['all-conversations'],
    queryFn: async () => {
      try {
        const convs = await base44.agents.listConversations({});
        return convs.filter(c => !c.metadata?.deleted);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        return [];
      }
    }
  });

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const name = conv.metadata?.name || conv.id;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const toggleConversation = (id) => {
    setSelectedConversations(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedConversations.length === filteredConversations.length) {
      setSelectedConversations([]);
    } else {
      setSelectedConversations(filteredConversations.map(c => c.id));
    }
  };

  const handleDeleteClick = () => {
    if (selectedConversations.length === 0) {
      toast.error('Selecione ao menos uma conversa');
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setShowConfirmDialog(false);

    let successCount = 0;
    let failCount = 0;

    try {
      for (const conversationId of selectedConversations) {
        try {
          await base44.functions.invoke('deleteAllConversations', { 
            conversation_id: conversationId 
          });
          successCount++;
        } catch (error) {
          console.error(`Failed to delete conversation ${conversationId}:`, error);
          failCount++;
        }
      }

      queryClient.invalidateQueries(['all-conversations']);
      setSelectedConversations([]);

      if (failCount === 0) {
        toast.success(`${successCount} conversa(s) deletada(s) com sucesso`);
      } else {
        toast.warning(`${successCount} deletada(s), ${failCount} falhou(aram)`);
      }
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error('Erro ao deletar conversas');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#C7A763]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-[#C7A763]/10 to-[#E3C37B]/10 border-[#C7A763]/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C7A763] to-[#E3C37B] flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-[#06101F]" />
              </div>
              <div>
                <CardTitle className="text-white">Gerenciar Conversas</CardTitle>
                <p className="text-sm text-slate-400">
                  {conversations.length} conversa(s) total
                </p>
              </div>
            </div>
            {selectedConversations.length > 0 && (
              <Button
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Deletar Selecionadas ({selectedConversations.length})
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Search & Select All */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Buscar conversas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white"
              />
            </div>
            <Button
              variant="outline"
              onClick={toggleSelectAll}
              className="border-[#C7A763]/30 text-[#E3C37B] hover:bg-[#C7A763]/10"
            >
              {selectedConversations.length === filteredConversations.length && filteredConversations.length > 0
                ? 'Desmarcar Todas'
                : 'Selecionar Todas'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Conversations List */}
      {filteredConversations.length === 0 ? (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="py-12 text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-slate-500 opacity-50" />
            <p className="text-slate-400">
              {searchQuery ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa disponível'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredConversations.map((conversation) => {
              const isSelected = selectedConversations.includes(conversation.id);
              const conversationName = conversation.metadata?.name || `Conversa ${conversation.id.slice(0, 8)}`;
              const messageCount = conversation.messages?.length || 0;
              const lastActivity = conversation.updated_date 
                ? new Date(conversation.updated_date).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'N/A';

              return (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    className={`cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#C7A763]/10 border-[#C7A763]/40'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-[#C7A763]/20'
                    }`}
                    onClick={() => toggleConversation(conversation.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleConversation(conversation.id)}
                          className="border-[#C7A763]/30"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-white font-medium truncate">
                              {conversationName}
                            </h3>
                            <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                              {messageCount} msg
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-400">
                            Última atividade: {lastActivity}
                          </p>
                        </div>
                        {isSelected && (
                          <CheckCircle className="w-5 h-5 text-[#C7A763] flex-shrink-0" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-slate-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              Você está prestes a deletar {selectedConversations.length} conversa(s).
              Esta ação marcará as conversas como deletadas (soft delete).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="border-white/10"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Confirmar Exclusão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deleting Overlay */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="bg-slate-900 border-white/10 p-6">
            <div className="flex items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-[#C7A763]" />
              <div>
                <p className="text-white font-medium">Deletando conversas...</p>
                <p className="text-sm text-slate-400">Por favor, aguarde</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}