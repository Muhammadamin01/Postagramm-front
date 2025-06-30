import React, { createContext, useState, useEffect } from 'react';
import io from 'socket.io-client';
import { getNotifications } from '../API/notificationService';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!userId || !token) return;

    const sock = io('https://postagramm-backend.onrender.com', { transports: ['websocket'] });
    setSocket(sock);

    sock.on('connect', () => {
      sock.emit('join', userId);
    });

    sock.on('newNotification', (notification) => {
      setNotifications(prev => {
        if (!prev.some(n => n._id === notification._id)) {
          return [notification, ...prev];
        }
        return prev;
      });
    });

    sock.on('notificationUpdated', (data) => {
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === data.notificationId
            ? { ...notif, isRead: data.isRead }
            : notif
        )
      );
    });

    const fetchNotifications = async () => {
      try {
        const res = await getNotifications(userId, token);
        setNotifications(res.data || []);
      } catch {
        setNotifications([]);
      }
    };
    fetchNotifications();

    return () => {
      sock.disconnect();
    };
  }, [userId, token]);

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications, socket }}>
      {children}
    </NotificationContext.Provider>
  );
};