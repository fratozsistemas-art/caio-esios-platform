import { useEffect, useRef } from "react";
import { toast } from "sonner";

export function useNotifications() {
  const audioContextRef = useRef(null);

  useEffect(() => {
    // Initialize audio context for sound alerts
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  }, []);

  const playNotificationSound = (volume = 0.5) => {
    if (!audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  };

  const showDesktopNotification = (title, body, icon = '🔔') => {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f4a0b77dcf6281433ddc4b/7729afe9c_LogoOficial-ESIOSCASIO-nobackground.png',
        badge: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f4a0b77dcf6281433ddc4b/7729afe9c_LogoOficial-ESIOSCASIO-nobackground.png',
        tag: 'agent-collab',
        requireInteraction: false
      });
    }
  };

  const notify = (type, message, options = {}) => {
    const preferences = JSON.parse(localStorage.getItem('agent_notification_preferences') || '{}');
    
    // Check if this notification type is enabled
    const typeEnabled = {
      message: preferences.notifyOnMessages !== false,
      task: preferences.notifyOnTaskAssignment !== false,
      critical: preferences.notifyOnCriticalTriggers !== false
    };

    if (!typeEnabled[type]) return;

    // Toast notification
    const toastFn = {
      message: toast.info,
      task: toast.success,
      critical: toast.error
    }[type] || toast.info;

    toastFn(message, options);

    // Desktop notification
    if (preferences.desktopNotifications !== false) {
      const titles = {
        message: '💬 New Message',
        task: '✅ Task Assignment',
        critical: '⚠️ Critical Alert'
      };
      showDesktopNotification(titles[type], message);
    }

    // Sound alert
    if (preferences.soundAlerts !== false) {
      playNotificationSound(preferences.soundVolume || 0.5);
    }
  };

  const requestPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  };

  return {
    notify,
    playNotificationSound,
    showDesktopNotification,
    requestPermission
  };
}