import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical, Trash2, Share2, Copy, FolderPlus, Edit3,
  Sparkles, Check, X
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function ConversationActions({ conversation, onDelete, compact = false }) {
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [shareEmails, setShareEmails] = useState("");
  const [projectName, setProjectName] = useState("");
  const [newName, setNewName] = useState(conversation?.metadata?.name || "");
  const queryClient = useQueryClient();

  const duplicateMutation = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('duplicateConversation', {
        conversation_id: conversation.id
      });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['conversations']);
      toast.success("Conversa duplicada com sucesso");
    },
    onError: () => {
      toast.error("Erro ao duplicar conversa");
    }
  });

  const shareMutation = useMutation({
    mutationFn: async (emails) => {
      const { data } = await base44.functions.invoke('shareConversation', {
        conversation_id: conversation.id,
        share_with_emails: emails
      });
      return data;
    },
    onSuccess: (data) => {
      toast.success("Conversa compartilhada!");
      navigator.clipboard.writeText(data.share_url);
      toast.info("Link copiado para a área de transferência");
      setShowShareDialog(false);
      setShareEmails("");
    },
    onError: () => {
      toast.error("Erro ao compartilhar conversa");
    }
  });

  const renameMutation = useMutation({
    mutationFn: async (name) => {
      await base44.asServiceRole.agents.updateConversation(conversation.id, {
        metadata: {
          ...conversation.metadata,
          name,
          custom_name: true
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['conversations']);
      toast.success("Conversa renomeada");
      setShowRenameDialog(false);
    },
    onError: () => {
      toast.error("Erro ao renomear conversa");
    }
  });

  const autoNameMutation = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('autoNameConversation', {
        conversation_id: conversation.id,
        force_rename: true
      });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['conversations']);
      if (!data.skipped) {
        toast.success(`Conversa renomeada: "${data.name}"`);
      }
    },
    onError: () => {
      toast.error("Erro ao gerar nome automático");
    }
  });

  const projectMutation = useMutation({
    mutationFn: async (project) => {
      await base44.asServiceRole.agents.updateConversation(conversation.id, {
        metadata: {
          ...conversation.metadata,
          project: project,
          project_assigned_at: new Date().toISOString()
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['conversations']);
      toast.success("Conversa adicionada ao projeto");
      setShowProjectDialog(false);
      setProjectName("");
    },
    onError: () => {
      toast.error("Erro ao adicionar ao projeto");
    }
  });

  const handleShare = () => {
    const emails = shareEmails.split(',').map(e => e.trim()).filter(e => e);
    shareMutation.mutate(emails);
  };

  if (!conversation) return null;

  const TriggerButton = compact ? (
    <Button variant="ghost" size="icon" className="h-8 w-8">
      <MoreVertical className="w-4 h-4" />
    </Button>
  ) : (
    <Button variant="outline" size="sm" className="border-white/10">
      <MoreVertical className="w-4 h-4 mr-2" />
      Ações
    </Button>
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {TriggerButton}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => setShowRenameDialog(true)}>
            <Edit3 className="w-4 h-4 mr-2" />
            Renomear
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => autoNameMutation.mutate()}
            disabled={autoNameMutation.isPending}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Nomear automaticamente
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowShareDialog(true)}>
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => duplicateMutation.mutate()}
            disabled={duplicateMutation.isPending}
          >
            <Copy className="w-4 h-4 mr-2" />
            Duplicar conversa
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowProjectDialog(true)}>
            <FolderPlus className="w-4 h-4 mr-2" />
            Adicionar a projeto
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onDelete} className="text-red-400">
            <Trash2 className="w-4 h-4 mr-2" />
            Deletar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="bg-slate-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Share2 className="w-5 h-5 text-blue-400" />
              Compartilhar Conversa
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Compartilhe esta conversa com outras pessoas
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-white">Emails (separados por vírgula)</Label>
              <Input
                placeholder="user1@example.com, user2@example.com"
                value={shareEmails}
                onChange={(e) => setShareEmails(e.target.value)}
                className="bg-white/5 border-white/10 text-white mt-2"
              />
              <p className="text-xs text-slate-500 mt-1">
                Deixe em branco para gerar apenas o link
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleShare}
              disabled={shareMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {shareMutation.isPending ? "Compartilhando..." : "Compartilhar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Project Dialog */}
      <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
        <DialogContent className="bg-slate-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-purple-400" />
              Adicionar a Projeto
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Organize esta conversa em um projeto
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label className="text-white">Nome do Projeto</Label>
            <Input
              placeholder="Ex: Análise de Mercado Q1"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="bg-white/5 border-white/10 text-white mt-2"
            />
            {conversation.metadata?.project && (
              <Badge className="bg-purple-500/20 text-purple-400 mt-2">
                Projeto atual: {conversation.metadata.project}
              </Badge>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProjectDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => projectMutation.mutate(projectName)}
              disabled={!projectName.trim() || projectMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent className="bg-slate-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-cyan-400" />
              Renomear Conversa
            </DialogTitle>
          </DialogHeader>
          <div>
            <Label className="text-white">Novo Nome</Label>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="bg-white/5 border-white/10 text-white mt-2"
              placeholder="Nome da conversa"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenameDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => renameMutation.mutate(newName)}
              disabled={!newName.trim() || renameMutation.isPending}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              Renomear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}