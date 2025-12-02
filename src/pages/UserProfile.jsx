import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  User, Activity, Star, Users, UserPlus, UserMinus, 
  MessageSquare, Brain, Network, FileText, BarChart3,
  GitMerge, Zap, CheckSquare, TrendingUp, Award, Crown,
  Calendar, Clock, ArrowLeft
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import RecentActivitiesSection from '@/components/profile/RecentActivitiesSection';
import ExpertiseLevelsSection from '@/components/profile/ExpertiseLevelsSection';
import FollowersSection from '@/components/profile/FollowersSection';

export default function UserProfile() {
  const [currentUser, setCurrentUser] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [activeTab, setActiveTab] = useState('activity');
  const queryClient = useQueryClient();

  // Get user email from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const profileEmail = urlParams.get('email');

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  // Fetch profile user
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list()
  });

  useEffect(() => {
    if (users.length > 0) {
      const targetEmail = profileEmail || currentUser?.email;
      const user = users.find(u => u.email === targetEmail);
      setProfileUser(user || currentUser);
    }
  }, [users, profileEmail, currentUser]);

  // Check if current user follows this profile
  const { data: followStatus } = useQuery({
    queryKey: ['follow-status', currentUser?.email, profileUser?.email],
    queryFn: async () => {
      if (!currentUser || !profileUser || currentUser.email === profileUser.email) return null;
      const follows = await base44.entities.UserFollow.filter({
        follower_email: currentUser.email,
        following_email: profileUser.email
      });
      return follows.length > 0 ? follows[0] : null;
    },
    enabled: !!currentUser && !!profileUser
  });

  // Get follower/following counts
  const { data: followers = [] } = useQuery({
    queryKey: ['followers', profileUser?.email],
    queryFn: () => base44.entities.UserFollow.filter({ following_email: profileUser?.email }),
    enabled: !!profileUser
  });

  const { data: following = [] } = useQuery({
    queryKey: ['following', profileUser?.email],
    queryFn: () => base44.entities.UserFollow.filter({ follower_email: profileUser?.email }),
    enabled: !!profileUser
  });

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: async () => {
      if (followStatus) {
        await base44.entities.UserFollow.delete(followStatus.id);
      } else {
        await base44.entities.UserFollow.create({
          follower_email: currentUser.email,
          follower_name: currentUser.full_name,
          following_email: profileUser.email,
          following_name: profileUser.full_name
        });
        // Create notification
        await base44.entities.ActivityEvent.create({
          event_type: 'mention',
          actor_email: currentUser.email,
          actor_name: currentUser.full_name,
          entity_type: 'user_follow',
          entity_title: `${currentUser.full_name} começou a seguir você`,
          target_users: [profileUser.email]
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['follow-status']);
      queryClient.invalidateQueries(['followers']);
      toast.success(followStatus ? 'Deixou de seguir' : 'Seguindo!');
    }
  });

  const isOwnProfile = currentUser?.email === profileUser?.email;

  if (!profileUser) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-400">Carregando perfil...</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back Button */}
      {profileEmail && (
        <Link to={createPageUrl('Collaboration')}>
          <Button variant="ghost" className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>
      )}

      {/* Profile Header */}
      <Card className="bg-gradient-to-br from-[#00D4FF]/10 to-[#FFB800]/10 border-[#00D4FF]/30">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="w-24 h-24 border-4 border-[#00D4FF]/30">
              <AvatarFallback className="bg-gradient-to-br from-[#00D4FF] to-[#FFB800] text-[#0A1628] text-3xl font-bold">
                {profileUser.full_name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-white">{profileUser.full_name}</h1>
                {profileUser.role === 'admin' && (
                  <Badge className="bg-purple-500/20 text-purple-400">
                    <Crown className="w-3 h-3 mr-1" />
                    Admin
                  </Badge>
                )}
              </div>
              <p className="text-slate-400 mb-4">{profileUser.email}</p>

              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="text-xl font-bold text-white">{followers.length}</p>
                  <p className="text-slate-500">Seguidores</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-white">{following.length}</p>
                  <p className="text-slate-500">Seguindo</p>
                </div>
              </div>
            </div>

            {!isOwnProfile && currentUser && (
              <Button
                onClick={() => followMutation.mutate()}
                disabled={followMutation.isPending}
                className={followStatus 
                  ? "border-slate-600 text-slate-300 hover:bg-slate-800" 
                  : "bg-[#00D4FF] hover:bg-[#00E5FF] text-[#0A1628]"
                }
                variant={followStatus ? "outline" : "default"}
              >
                {followStatus ? (
                  <>
                    <UserMinus className="w-4 h-4 mr-2" />
                    Deixar de Seguir
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Seguir
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="activity" className="data-[state=active]:bg-[#00D4FF]/20 data-[state=active]:text-[#00D4FF]">
            <Activity className="w-4 h-4 mr-2" />
            Atividades
          </TabsTrigger>
          <TabsTrigger value="expertise" className="data-[state=active]:bg-[#00D4FF]/20 data-[state=active]:text-[#00D4FF]">
            <Award className="w-4 h-4 mr-2" />
            Especialização
          </TabsTrigger>
          <TabsTrigger value="followers" className="data-[state=active]:bg-[#00D4FF]/20 data-[state=active]:text-[#00D4FF]">
            <Users className="w-4 h-4 mr-2" />
            Conexões
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="mt-4">
          <RecentActivitiesSection userEmail={profileUser.email} />
        </TabsContent>

        <TabsContent value="expertise" className="mt-4">
          <ExpertiseLevelsSection userEmail={profileUser.email} />
        </TabsContent>

        <TabsContent value="followers" className="mt-4">
          <FollowersSection 
            userEmail={profileUser.email} 
            followers={followers} 
            following={following}
            currentUserEmail={currentUser?.email}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}