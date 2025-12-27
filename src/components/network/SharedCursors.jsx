import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MousePointer2 } from 'lucide-react';
import { getUserColor } from './PresenceIndicators';

export default function SharedCursors({ cursors, activeUsers, containerRef }) {
  if (!cursors || !activeUsers) return null;

  return (
    <AnimatePresence>
      {activeUsers.map(user => {
        const cursor = cursors[user.user_email];
        if (!cursor) return null;

        const color = getUserColor(user.user_email);
        const userName = user.user_name || user.user_email.split('@')[0];

        return (
          <motion.div
            key={user.user_email}
            className="absolute pointer-events-none z-50"
            style={{
              left: cursor.x,
              top: cursor.y
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <MousePointer2
              className="w-5 h-5"
              style={{ color }}
              fill={color}
            />
            <div
              className="ml-3 -mt-1 px-2 py-0.5 rounded text-white text-xs font-medium whitespace-nowrap"
              style={{ backgroundColor: color }}
            >
              {userName}
            </div>
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
}