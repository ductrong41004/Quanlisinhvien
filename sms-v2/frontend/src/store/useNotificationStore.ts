import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import axiosInstance from '../api/axiosInstance';

export interface AppNotification {
  _id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

interface NotificationState {
  socket: Socket | null;
  notifications: AppNotification[];
  unreadCount: number;
  totalPages: number;
  currentPage: number;
  loading: boolean;

  // Actions
  connect: () => void;
  disconnect: () => void;
  fetchNotifications: (page?: number) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const useNotificationStore = create<NotificationState>((set, get) => ({
  socket: null,
  notifications: [],
  unreadCount: 0,
  totalPages: 1,
  currentPage: 1,
  loading: false,

  connect: () => {
    if (get().socket) return;

    const token = localStorage.getItem('access_token');
    if (!token) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      auth: { token }, // Gửi JWT token khi handshake
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected');
    });

    // Nhận thông báo real-time từ server
    socket.on('notification', (data: any) => {
      const notif: AppNotification = {
        _id: data.id || data._id || Math.random().toString(36),
        message: data.message,
        type: data.type || 'info',
        isRead: false,
        link: data.link,
        createdAt: data.createdAt || new Date().toISOString(),
      };

      set((state) => ({
        notifications: [notif, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      }));
    });

    set({ socket });

    // Fetch initial data
    get().fetchNotifications();
    get().fetchUnreadCount();
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, notifications: [], unreadCount: 0 });
    }
  },

  fetchNotifications: async (page = 1) => {
    set({ loading: true });
    try {
      const resp = await axiosInstance.get('/notifications', {
        params: { page, limit: 20 },
      });
      const { data, totalPages } = resp.data;

      if (page === 1) {
        set({ notifications: data, totalPages, currentPage: page, loading: false });
      } else {
        set((state) => ({
          notifications: [...state.notifications, ...data],
          totalPages,
          currentPage: page,
          loading: false,
        }));
      }
    } catch {
      set({ loading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const resp = await axiosInstance.get('/notifications/unread-count');
      set({ unreadCount: resp.data.count });
    } catch {
      // ignore
    }
  },

  markAsRead: async (id: string) => {
    try {
      await axiosInstance.patch(`/notifications/${id}/read`);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === id ? { ...n, isRead: true } : n,
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch {
      // ignore
    }
  },

  markAllAsRead: async () => {
    try {
      await axiosInstance.patch('/notifications/read-all');
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch {
      // ignore
    }
  },
}));
