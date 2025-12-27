import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Users, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const userColors = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', 
  '#f59e0b', '#06b6d4', '#ef4444', '#84cc16'
];

const getUserColor = (email) => {
  const hash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return userColors[hash % userColors.length];
};

export default function PresenceIndicators({ activeUsers }) {
  if (!activeUsers || activeUsers.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Eye className="w-4 h-4 text-slate-400" />
      <div className="flex -space-x-2">
        <AnimatePresence>
          {activeUsers.slice(0, 5).map((user, idx) => {
            const color = getUserColor(user.user_email);
            const initials = user.user_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

            return (
              <motion.div
                key={user.user_email}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="relative group"
              >
                <div
                  className="w-8 h-8 rounded-full border-2 border-slate-900 flex items-center justify-center text-white text-xs font-bold cursor-pointer"
                  style={{ backgroundColor: color }}
                  title={user.user_name}
                >
                  {initials}
                </div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                  <div className="bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap border border-white/10">
                    {user.user_name}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-4 border-transparent border-t-slate-900" />
                  </div>
                </div>

                {/* Active pulse */}
                <div 
                  className="absolute inset-0 rounded-full animate-ping opacity-20"
                  style={{ backgroundColor: color }}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>

        {activeUsers.length > 5 && (
          <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-white text-xs font-bold">
            +{activeUsers.length - 5}
          </div>
        )}
      </div>
    </div>
  );
}

export { getUserColor };