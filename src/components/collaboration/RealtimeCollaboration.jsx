import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Users, Circle } from 'lucide-react';

export default function RealtimeCollaboration({ workspaceId }) {
  const [activeUsers, setActiveUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  useEffect(() => {
    if (!workspaceId || !currentUser) return;

    // Simular presença (em produção, usar WebSockets)
    const updatePresence = async () => {
      try {
        const workspace = await base44.entities.Workspace.filter({ id: workspaceId });
        if (workspace.length === 0) return;

        const now = new Date().toISOString();
        const currentPresence = workspace[0].metadata?.active_users || [];
        
        // Remover usuários inativos (>2min)
        const activePresence = currentPresence.filter(u => {
          const lastSeen = new Date(u.last_seen);
          const diff = Date.now() - lastSeen.getTime();
          return diff < 120000; // 2 minutos
        });

        // Atualizar ou adicionar usuário atual
        const updatedPresence = activePresence.filter(u => u.email !== currentUser.email);
        updatedPresence.push({
          email: currentUser.email,
          full_name: currentUser.full_name,
          last_seen: now,
          cursor_position: null
        });

        await base44.entities.Workspace.update(workspaceId, {
          metadata: {
            ...workspace[0].metadata,
            active_users: updatedPresence
          }
        });

        setActiveUsers(updatedPresence);
      } catch (error) {
        console.error('Presence update error:', error);
      }
    };

    updatePresence();
    const interval = setInterval(updatePresence, 30000); // Atualizar a cada 30s

    return () => clearInterval(interval);
  }, [workspaceId, currentUser]);

  if (activeUsers.length <= 1) return null;

  return (
    <Card className="bg-white/5 border-white/10">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Users className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-slate-400">Active collaborators:</span>
          <div className="flex -space-x-2">
            {activeUsers.filter(u => u.email !== currentUser?.email).map((user, idx) => (
              <div
                key={idx}
                className="relative"
                title={user.full_name}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-slate-900">
                  <span className="text-white text-xs font-medium">
                    {user.full_name?.charAt(0) || 'U'}
                  </span>
                </div>
                <Circle className="absolute -bottom-0.5 -right-0.5 w-3 h-3 text-green-400 fill-green-400" />
              </div>
            ))}
          </div>
          <Badge variant="outline" className="border-white/20 text-slate-400">
            {activeUsers.length - 1} online
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}