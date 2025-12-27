import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const NetworkCollaborationContext = createContext(null);

export const useNetworkCollaboration = () => {
  const context = useContext(NetworkCollaborationContext);
  if (!context) {
    throw new Error('useNetworkCollaboration must be used within NetworkCollaborationProvider');
  }
  return context;
};

export function NetworkCollaborationProvider({ children, sessionId = 'network-map' }) {
  const [activeUsers, setActiveUsers] = useState([]);
  const [userCursors, setUserCursors] = useState({});
  const [sharedState, setSharedState] = useState({
    selectedNode: null,
    zoom: 1,
    pan: { x: 0, y: 0 }
  });
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(user => {
      if (user) {
        setCurrentUser(user);
        updatePresence(user);
      }
    });

    const interval = setInterval(() => {
      if (currentUser) {
        updatePresence(currentUser);
      }
      fetchActiveUsers();
    }, 3000);

    return () => {
      clearInterval(interval);
      if (currentUser) {
        removePresence(currentUser);
      }
    };
  }, [currentUser?.email]);

  const updatePresence = async (user) => {
    try {
      const existing = await base44.entities.UserPresence.filter({
        user_email: user.email,
        page_name: sessionId
      });

      const presenceData = {
        user_email: user.email,
        user_name: user.full_name,
        page_name: sessionId,
        is_active: true,
        last_activity: new Date().toISOString(),
        cursor_position: userCursors[user.email] || { x: 0, y: 0 },
        current_state: sharedState
      };

      if (existing && existing.length > 0) {
        await base44.entities.UserPresence.update(existing[0].id, presenceData);
      } else {
        await base44.entities.UserPresence.create(presenceData);
      }
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  };

  const removePresence = async (user) => {
    try {
      const existing = await base44.entities.UserPresence.filter({
        user_email: user.email,
        page_name: sessionId
      });

      if (existing && existing.length > 0) {
        await base44.entities.UserPresence.update(existing[0].id, {
          is_active: false
        });
      }
    } catch (error) {
      console.error('Error removing presence:', error);
    }
  };

  const fetchActiveUsers = async () => {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const allPresence = await base44.entities.UserPresence.list();
      
      const active = allPresence.filter(p => 
        p.page_name === sessionId &&
        p.is_active &&
        p.last_activity > fiveMinutesAgo &&
        p.user_email !== currentUser?.email
      );

      setActiveUsers(active);

      const cursors = {};
      active.forEach(p => {
        if (p.cursor_position) {
          cursors[p.user_email] = p.cursor_position;
        }
      });
      setUserCursors(cursors);
    } catch (error) {
      console.error('Error fetching active users:', error);
    }
  };

  const updateCursorPosition = (x, y) => {
    if (!currentUser) return;
    
    setUserCursors(prev => ({
      ...prev,
      [currentUser.email]: { x, y }
    }));
  };

  const updateSharedState = (updates) => {
    setSharedState(prev => ({
      ...prev,
      ...updates
    }));
  };

  return (
    <NetworkCollaborationContext.Provider
      value={{
        activeUsers,
        userCursors,
        sharedState,
        currentUser,
        updateCursorPosition,
        updateSharedState
      }}
    >
      {children}
    </NetworkCollaborationContext.Provider>
  );
}