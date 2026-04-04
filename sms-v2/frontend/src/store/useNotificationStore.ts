import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

export interface AppNotification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  timestamp: string;
  read: boolean;
}

interface NotificationState {
  socket: Socket | null;
  notifications: AppNotification[];
  unreadCount: number;
  connect: () => void;
  disconnect: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const useNotificationStore = create<NotificationState>((set, get) => ({
  socket: null,
  notifications: [],
  unreadCount: 0,
  connect: () => {
    if (get().socket) return;
    
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Socket.io connected:', socket.id);
    });

    // Lắng nghe sự kiện thông báo từ Server
    socket.on('notification', (data: any) => {
      const newNotif: AppNotification = {
        id: Math.random().toString(36).substring(7),
        message: data.message,
        type: data.type || 'info',
        timestamp: data.timestamp || new Date().toISOString(),
        read: false,
      };

      set((state) => ({
        notifications: [newNotif, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      }));
    });

    set({ socket });
  },
  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },
  markAsRead: (id) => {
    set((state) => {
      const notifs = state.notifications.map((n) => 
        n.id === id ? { ...n, read: true } : n
      );
      const unreadCount = notifs.filter(n => !n.read).length;
      return { notifications: notifs, unreadCount };
    });
  },
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  }
}));
