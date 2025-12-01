import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const statusColors = {
  online: 'bg-green-500',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
  offline: 'bg-slate-400'
};

export default function UserPresenceIndicator({ entityType, entityId, compact = false }) {
  const [activeUsers, setActiveUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const init = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
      
      // Update own presence
      const existingPresence = await base44.entities.UserPresence.filter({
        user_email: user.email
      });

      const presenceData = {
        user_email: user.email,
        user_name: user.full_name,
        status: 'online',
        current_page: window.location.pathname,
        current_entity_type: entityType,
        current_entity_id: entityId,
        last_active_at: new Date().toISOString()
      };

      if (existingPresence.length > 0) {
        await base44.entities.UserPresence.update(existingPresence[0].id, presenceData);
      } else {
        await base44.entities.UserPresence.create(presenceData);
      }
    };

    init();

    // Poll for active users
    const pollInterval = setInterval(async () => {
      if (entityType && entityId) {
        const users = await base44.entities.UserPresence.filter({
          current_entity_type: entityType,
          current_entity_id: entityId
        });
        
        // Filter users active in last 5 minutes
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        const activeNow = users.filter(u => u.last_active_at > fiveMinutesAgo);
        setActiveUsers(activeNow);
      }
    }, 10000);

    return () => {
      clearInterval(pollInterval);
      // Set offline on unmount
      if (currentUser) {
        base44.entities.UserPresence.filter({ user_email: currentUser.email })
          .then(presence => {
            if (presence.length > 0) {
              base44.entities.UserPresence.update(presence[0].id, { status: 'offline' });
            }
          });
      }
    };
  }, [entityType, entityId]);

  if (activeUsers.length === 0) return null;

  const displayUsers = compact ? activeUsers.slice(0, 3) : activeUsers;
  const remainingCount = activeUsers.length - displayUsers.length;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        <div className="flex -space-x-2">
          {displayUsers.map((user) => (
            <Tooltip key={user.user_email}>
              <TooltipTrigger>
                <div className="relative">
                  <Avatar className="w-8 h-8 border-2 border-slate-800">
                    <AvatarFallback className="bg-gradient-to-br from-[#00D4FF] to-[#FFB800] text-[#0A1628] text-xs font-bold">
                      {user.user_name?.charAt(0) || user.user_email?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span className={cn(
                    "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-800",
                    statusColors[user.status]
                  )} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{user.user_name}</p>
                <p className="text-xs text-slate-400 capitalize">{user.status}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
        {remainingCount > 0 && (
          <span className="text-xs text-slate-400 ml-1">+{remainingCount}</span>
        )}
        {!compact && (
          <span className="text-xs text-slate-400 ml-2">
            {activeUsers.length} viewing
          </span>
        )}
      </div>
    </TooltipProvider>
  );
}