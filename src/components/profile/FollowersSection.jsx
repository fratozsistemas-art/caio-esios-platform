import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, UserPlus, UserMinus, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function FollowersSection({ userEmail, followers, following, currentUserEmail }) {
  const [tab, setTab] = useState('followers');
  const queryClient = useQueryClient();

  const toggleFollowMutation = useMutation({
    mutationFn: async ({ targetEmail, targetName, isFollowing, followId }) => {
      if (isFollowing) {
        await base44.entities.UserFollow.delete(followId);
      } else {
        const currentUser = await base44.auth.me();
        await base44.entities.UserFollow.create({
          follower_email: currentUserEmail,
          follower_name: currentUser.full_name,
          following_email: targetEmail,
          following_name: targetName
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['followers']);
      queryClient.invalidateQueries(['following']);
      queryClient.invalidateQueries(['follow-status']);
    }
  });

  const renderUserCard = (user, type) => {
    const email = type === 'follower' ? user.follower_email : user.following_email;
    const name = type === 'follower' ? user.follower_name : user.following_name;
    
    // Check if current user follows this person
    const isFollowingThisUser = following.some(f => f.following_email === email);
    const isSelf = email === currentUserEmail;

    return (
      <motion.div
        key={user.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:border-slate-600 transition-colors"
      >
        <Link 
          to={createPageUrl('UserProfile') + `?email=${encodeURIComponent(email)}`}
          className="flex items-center gap-3 flex-1"
        >
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-gradient-to-br from-[#00D4FF] to-[#FFB800] text-[#0A1628] font-bold">
              {name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-white truncate">{name}</p>
            <p className="text-xs text-slate-500 truncate">{email}</p>
          </div>
          <ExternalLink className="w-4 h-4 text-slate-500" />
        </Link>

        {!isSelf && currentUserEmail && (
          <Button
            size="sm"
            variant={isFollowingThisUser ? "outline" : "default"}
            onClick={(e) => {
              e.preventDefault();
              const followRecord = following.find(f => f.following_email === email);
              toggleFollowMutation.mutate({
                targetEmail: email,
                targetName: name,
                isFollowing: isFollowingThisUser,
                followId: followRecord?.id
              });
            }}
            disabled={toggleFollowMutation.isPending}
            className={isFollowingThisUser 
              ? "border-slate-600 text-slate-300 hover:bg-slate-800 ml-3" 
              : "bg-[#00D4FF] hover:bg-[#00E5FF] text-[#0A1628] ml-3"
            }
          >
            {isFollowingThisUser ? (
              <>
                <UserMinus className="w-3 h-3 mr-1" />
                Seguindo
              </>
            ) : (
              <>
                <UserPlus className="w-3 h-3 mr-1" />
                Seguir
              </>
            )}
          </Button>
        )}
      </motion.div>
    );
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-[#00D4FF]" />
          Conexões
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-slate-800/50 border border-slate-700 mb-4">
            <TabsTrigger value="followers" className="data-[state=active]:bg-[#00D4FF]/20 data-[state=active]:text-[#00D4FF]">
              Seguidores ({followers.length})
            </TabsTrigger>
            <TabsTrigger value="following" className="data-[state=active]:bg-[#00D4FF]/20 data-[state=active]:text-[#00D4FF]">
              Seguindo ({following.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="followers">
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {followers.map(user => renderUserCard(user, 'follower'))}
                {followers.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500">Nenhum seguidor ainda</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="following">
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {following.map(user => renderUserCard(user, 'following'))}
                {following.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500">Não está seguindo ninguém</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}