import { useState, useEffect } from 'react';
import type { Notification } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const NOTIFICATIONS_KEY = 'roadmap_notifications';

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (user) {
      const stored = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
      setNotifications(stored.filter((n: Notification) => n.userId === user.id));
    } else {
      setNotifications([]);
    }
  }, [user]);

  const saveNotifications = (newNotifications: Notification[]) => {
    const allNotifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
    const otherNotifications = allNotifications.filter((n: Notification) => n.userId !== user?.id);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([...otherNotifications, ...newNotifications]));
    setNotifications(newNotifications);
  };

  const addNotification = (title: string, message: string, type: Notification['type']) => {
    if (!user) return;
    
    const notification: Notification = {
      id: crypto.randomUUID(),
      userId: user.id,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
    };
    
    saveNotifications([notification, ...notifications]);
    
    // Browser notification
    if (window.Notification && window.Notification.permission === 'granted') {
      new window.Notification(title, { body: message });
    }
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    saveNotifications(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  const deleteNotification = (id: string) => {
    saveNotifications(notifications.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return { notifications, unreadCount, addNotification, markAsRead, markAllAsRead, deleteNotification };
}
