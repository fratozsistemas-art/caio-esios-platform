import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Share2, Users, Eye, MessageSquare, Loader2, 
  CheckCircle, Search, X, Mail, Link2
} from 'lucide-react';
import { toast } from 'sonner';

export default function ShareAnalysisDialog({ 
  trigger, 
  analysisType, // 'file_analysis' | 'data_analysis'
  analysisId,
  analysisTitle,
  onShared 
}) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [permission, setPermission] = useState('view'); // 'view' | 'comment'
  const [isSharing, setIsSharing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list()
  });

  const filteredUsers = users.filter(u => 
    u.email !== currentUser?.email &&
    (u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     u.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleUser = (email) => {
    setSelectedUsers(prev => 
      prev.includes(email) 
        ? prev.filter(e => e !== email)
        : [...prev, email]
    );
  };

  const handleShare = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Selecione pelo menos um usuário');
      return;
    }

    setIsSharing(true);
    try {
      // Create shared insight record
      await base44.entities.SharedInsight.create({
        title: analysisTitle,
        content: `Shared ${analysisType === 'file_analysis' ? 'File Analysis' : 'Data Analysis'}`,
        source_entity_type: analysisType,
        source_entity_id: analysisId,
        shared_by_email: currentUser.email,
        shared_by_name: currentUser.full_name,
        shared_with: selectedUsers,
        visibility: 'private',
        tags: [analysisType, permission]
      });

      // Create activity events for each recipient
      for (const email of selectedUsers) {
        await base44.entities.ActivityEvent.create({
          event_type: 'entity_shared',
          actor_email: currentUser.email,
          actor_name: currentUser.full_name,
          entity_type: analysisType,
          entity_id: analysisId,
          entity_title: analysisTitle,
          target_users: [email],
          metadata: { 
            permission,
            shared_type: analysisType
          }
        });
      }

      // Send notification emails
      const recipientNames = selectedUsers.map(email => 
        users.find(u => u.email === email)?.full_name || email
      ).join(', ');

      toast.success(`Análise compartilhada com ${recipientNames}`);
      queryClient.invalidateQueries(['sharedInsights']);
      queryClient.invalidateQueries(['activities']);
      
      setOpen(false);
      setSelectedUsers([]);
      setSearchQuery('');
      onShared?.();
    } catch (error) {
      console.error('Error sharing analysis:', error);
      toast.error('Erro ao compartilhar análise');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="border-[#00D4FF]/30 text-[#00D4FF] hover:bg-[#00D4FF]/10">
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#00D4FF]" />
            Compartilhar Análise
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Analysis Info */}
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <p className="text-sm text-slate-400">Compartilhando:</p>
            <p className="text-white font-medium truncate">{analysisTitle}</p>
            <Badge className="mt-2 bg-[#00D4FF]/20 text-[#00D4FF]">
              {analysisType === 'file_analysis' ? 'File Analyzer' : 'Advanced Data Analysis'}
            </Badge>
          </div>

          {/* Search Users */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white"
            />
          </div>

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map(email => {
                const user = users.find(u => u.email === email);
                return (
                  <Badge 
                    key={email} 
                    className="bg-[#00D4FF]/20 text-[#00D4FF] cursor-pointer hover:bg-[#00D4FF]/30"
                    onClick={() => toggleUser(email)}
                  >
                    {user?.full_name || email}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                );
              })}
            </div>
          )}

          {/* User List */}
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {filteredUsers.map(user => (
                <div 
                  key={user.email}
                  onClick={() => toggleUser(user.email)}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                    selectedUsers.includes(user.email) 
                      ? 'bg-[#00D4FF]/10 border border-[#00D4FF]/30' 
                      : 'bg-slate-800/50 hover:bg-slate-800 border border-transparent'
                  }`}
                >
                  <Checkbox 
                    checked={selectedUsers.includes(user.email)}
                    className="border-slate-600 data-[state=checked]:bg-[#00D4FF] data-[state=checked]:border-[#00D4FF]"
                  />
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gradient-to-br from-[#00D4FF] to-[#FFB800] text-[#0A1628] text-xs font-bold">
                      {user.full_name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{user.full_name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <p className="text-center text-slate-500 py-4">Nenhum usuário encontrado</p>
              )}
            </div>
          </ScrollArea>

          {/* Permission Level */}
          <div className="space-y-3">
            <Label className="text-slate-300">Nível de Permissão</Label>
            <RadioGroup value={permission} onValueChange={setPermission} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="view" id="view" className="border-slate-600" />
                <Label htmlFor="view" className="text-white flex items-center gap-2 cursor-pointer">
                  <Eye className="w-4 h-4 text-slate-400" />
                  Apenas Visualizar
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="comment" id="comment" className="border-slate-600" />
                <Label htmlFor="comment" className="text-white flex items-center gap-2 cursor-pointer">
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                  Comentar
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleShare}
              disabled={isSharing || selectedUsers.length === 0}
              className="flex-1 bg-[#00D4FF] hover:bg-[#00E5FF] text-[#0A1628]"
            >
              {isSharing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Compartilhando...
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}