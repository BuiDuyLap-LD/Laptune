import { create } from 'zustand';
import { AppNotification } from '@/types/database';
import { createClient } from '@/lib/supabase/client';

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  isInitialized: boolean;

  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

const READ_NOTIFS_KEY = 'laptune_read_notifs';
const DELETED_NOTIFS_KEY = 'laptune_deleted_notifs';

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isInitialized: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    const supabase = createClient();

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let query = supabase.from('notifications').select('*').order('created_at', { ascending: false });

      if (user) {
        query = query.or(`user_id.is.null,user_id.eq.${user.id}`);
      } else {
        query = query.is('user_id', null);
      }

      const { data, error } = await query;

      if (!error && data) {
        let readIds: string[] = [];
        let deletedIds: string[] = [];

        if (typeof window !== 'undefined') {
          try {
            const r = localStorage.getItem(READ_NOTIFS_KEY);
            if (r) readIds = JSON.parse(r);
            const d = localStorage.getItem(DELETED_NOTIFS_KEY);
            if (d) deletedIds = JSON.parse(d);
          } catch {}
        }

        const filtered = data
          .filter((item: AppNotification) => !deletedIds.includes(item.id))
          .map((item: AppNotification) => ({
            ...item,
            is_read: item.is_read || readIds.includes(item.id),
          }));

        const unread = filtered.filter((n: AppNotification) => !n.is_read).length;

        set({
          notifications: filtered,
          unreadCount: unread,
          isInitialized: true,
        });
      } else {
        set({ notifications: [], unreadCount: 0, isInitialized: true });
      }
    } catch (err) {
      console.warn('Lỗi tải thông báo:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id: string) => {
    const { notifications } = get();
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, is_read: true } : n
    );
    const unread = updated.filter((n) => !n.is_read).length;
    set({ notifications: updated, unreadCount: unread });

    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(READ_NOTIFS_KEY);
        const readIds: string[] = raw ? JSON.parse(raw) : [];
        if (!readIds.includes(id)) {
          readIds.push(id);
          localStorage.setItem(READ_NOTIFS_KEY, JSON.stringify(readIds));
        }
      } catch {}
    }

    try {
      const supabase = createClient();
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
    } catch {}
  },

  markAllAsRead: async () => {
    const { notifications } = get();
    const allIds = notifications.map((n) => n.id);
    const updated = notifications.map((n) => ({ ...n, is_read: true }));

    set({ notifications: updated, unreadCount: 0 });

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(READ_NOTIFS_KEY, JSON.stringify(allIds));
      } catch {}
    }

    try {
      const supabase = createClient();
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', allIds);
    } catch {}
  },

  deleteNotification: async (id: string) => {
    const { notifications } = get();
    const updated = notifications.filter((n) => n.id !== id);
    const unread = updated.filter((n) => !n.is_read).length;

    set({ notifications: updated, unreadCount: unread });

    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(DELETED_NOTIFS_KEY);
        const deletedIds: string[] = raw ? JSON.parse(raw) : [];
        if (!deletedIds.includes(id)) {
          deletedIds.push(id);
          localStorage.setItem(DELETED_NOTIFS_KEY, JSON.stringify(deletedIds));
        }
      } catch {}
    }
  },
}));
