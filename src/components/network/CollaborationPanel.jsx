import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { getUserColor } from './PresenceIndicators';

export default function CollaborationPanel({ activeUsers, currentActivity }) {
  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white text-sm flex items-center gap-2">
          <Users className="w-4 h-4 text-green-400" />
          Active Collaborators
          <Badge className="ml-auto bg-green-500/20 text-green-400">
            {activeUsers.length} online
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {activeUsers.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-slate-400">No other users online</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeUsers.map((user, idx) => {
              const color = getUserColor(user.user_email);
              const initials = user.user_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

              return (
                <motion.div
                  key={user.user_email}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-3 p-2 bg-white/5 rounded-lg border border-white/10"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold relative"
                    style={{ backgroundColor: color }}
                  >
                    {initials}
                    <div 
                      className="absolute inset-0 rounded-full animate-ping opacity-20"
                      style={{ backgroundColor: color }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">
                      {user.user_name}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Activity className="w-3 h-3 text-green-400" />
                      <span>
                        Active {Math.floor((Date.now() - new Date(user.last_activity)) / 1000)}s ago
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}