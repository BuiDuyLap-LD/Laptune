'use client';

import React, { useEffect, useState } from 'react';
import {
  Bell,
  Plus,
  Send,
  Trash2,
  Sparkles,
  Music,
  Disc,
  ListMusic,
  MessageSquare,
  Info,
  ExternalLink,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { AppNotification, NotificationType } from '@/types/database';

export default function AdminNotificationsPage() {
  const supabase = createClient();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<NotificationType>('system');
  const [link, setLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ text: string; success: boolean } | null>(null);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setNotifications(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [supabase]);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    setMsg(null);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          title: title.trim(),
          content: content.trim(),
          type,
          link: link.trim() || null,
          user_id: null, // Broadcast to all users
        })
        .select('*')
        .single();

      if (error) {
        setMsg({ text: 'Lỗi khi gửi thông báo: ' + error.message, success: false });
      } else {
        setMsg({ text: 'Đã phát thông báo thành công đến tất cả người dùng!', success: true });
        setTitle('');
        setContent('');
        setLink('');
        setType('system');
        setIsCreating(false);
        if (data) {
          setNotifications((prev) => [data, ...prev]);
        }
      }
    } catch (err) {
      setMsg({ text: 'Đã xảy ra lỗi ngoài ý muốn.', success: false });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Bạn có chắc muốn xóa thông báo "${title}" không?`)) {
      const { error } = await supabase.from('notifications').delete().eq('id', id);
      if (!error) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }
    }
  };

  const getTypeInfo = (t: NotificationType) => {
    switch (t) {
      case 'song':
        return { icon: Music, label: 'Bài hát', color: 'text-purple-400 bg-purple-950/60 border-purple-800/40' };
      case 'album':
        return { icon: Disc, label: 'Album', color: 'text-pink-400 bg-pink-950/60 border-pink-800/40' };
      case 'playlist':
        return { icon: ListMusic, label: 'Playlist', color: 'text-cyan-400 bg-cyan-950/60 border-cyan-800/40' };
      case 'feedback':
        return { icon: MessageSquare, label: 'Phản hồi', color: 'text-amber-400 bg-amber-950/60 border-amber-800/40' };
      case 'update':
        return { icon: Sparkles, label: 'Tính năng', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40' };
      case 'system':
      default:
        return { icon: Info, label: 'Hệ thống', color: 'text-blue-400 bg-blue-950/60 border-blue-800/40' };
    }
  };

  return (
    <div className="space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Bell className="w-8 h-8 text-purple-400" />
            <span>Quản Lý Thông Báo & Hộp Thư</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Phát thông báo cập nhật, bài hát mới và tin tức chính thức đến toàn thể người dùng
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreating(!isCreating)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isCreating ? 'Đóng form' : 'Phát thông báo mới'}</span>
        </button>
      </div>

      {/* Thông báo feedback */}
      {msg && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold ${
            msg.success
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-pink-500/10 border border-pink-500/30 text-pink-300'
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* Form Tạo / Phát thông báo */}
      {isCreating && (
        <div className="p-6 rounded-2xl bg-[#140c26]/90 border border-purple-800/40 shadow-2xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Send className="w-4 h-4 text-purple-400" />
            <span>Soạn thông báo gửi người dùng</span>
          </h3>

          <form onSubmit={handleSendNotification} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  Tiêu đề thông báo <span className="text-pink-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Phát hành Album Vinahouse cực hot 2026..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#10081e] border border-purple-900/50 focus:border-purple-500 focus:outline-none text-xs text-white placeholder-zinc-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Phân loại</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as NotificationType)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#10081e] border border-purple-900/50 focus:border-purple-500 focus:outline-none text-xs text-white"
                >
                  <option value="system">Hệ thống</option>
                  <option value="song">Bài hát mới</option>
                  <option value="album">Album mới</option>
                  <option value="playlist">Playlist mới</option>
                  <option value="update">Tính năng mới</option>
                  <option value="feedback">Phản hồi người dùng</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Nội dung chi tiết <span className="text-pink-400">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Nội dung truyền tải đến người dùng trong hộp thư..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#10081e] border border-purple-900/50 focus:border-purple-500 focus:outline-none text-xs text-white placeholder-zinc-500 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Đường dẫn liên kết (Link) <span className="text-zinc-500">(Tùy chọn)</span>
              </label>
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="Ví dụ: /charts hoặc /album/123..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#10081e] border border-purple-900/50 focus:border-purple-500 focus:outline-none text-xs text-white placeholder-zinc-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/30 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Đang gửi...' : 'Phát thông báo'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Danh sách thông báo đã gửi */}
      <div className="rounded-2xl border border-purple-900/30 bg-[#140c26]/80 backdrop-blur-md overflow-hidden">
        <div className="py-3 px-4 border-b border-purple-900/20 flex items-center justify-between text-xs font-semibold text-zinc-400">
          <span>Danh sách thông báo đã phát ({notifications.length})</span>
        </div>

        <div className="divide-y divide-purple-900/10">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-zinc-500">Đang tải danh sách thông báo...</div>
          ) : notifications.length > 0 ? (
            notifications.map((item) => {
              const info = getTypeInfo(item.type);
              const Icon = info.icon;

              return (
                <div
                  key={item.id}
                  className="p-4 hover:bg-purple-950/20 transition-colors flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${info.color}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${info.color}`}>
                          {info.label}
                        </span>
                        <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">{item.content}</p>
                      {item.link && (
                        <div className="inline-flex items-center gap-1 text-[11px] text-purple-400">
                          <span>Link: {item.link}</span>
                          <ExternalLink className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-[11px] font-mono text-zinc-500">
                      {new Date(item.created_at).toLocaleString('vi-VN')}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id, item.title)}
                      title="Xóa thông báo này"
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-pink-400 hover:bg-pink-950/30 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center text-xs text-zinc-500 space-y-2">
              <Bell className="w-8 h-8 text-purple-400/30 mx-auto" />
              <p>Chưa có thông báo nào được phát.</p>
              <p className="text-[11px] text-zinc-600">Nhấn &quot;Phát thông báo mới&quot; để gửi thông báo đầu tiên.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

