'use client';

import { useContext } from 'react';
import { NotificationContext, Notification } from '@/contexts/NotificationContext';

export function useNotification() {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  
  const showNotification = (notification: Omit<Notification, 'id'>) => {
    context.showNotification(notification);
  };
  
  return {
    showNotification,
    notifications: context.notifications,
    removeNotification: context.removeNotification
  };
}