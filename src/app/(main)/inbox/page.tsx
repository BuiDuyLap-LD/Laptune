'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  Sparkles,
  Music,
  Disc,
  ListMusic,
  MessageSquare,
  CheckCheck,
  Trash2,
  ExternalLink,
  Info,
} from 'lucide-react';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { AppNotification, NotificationType } from '@/types/database';

export default function InboxPage() {
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationStore();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const displayedList =
    filter === 'unread' ? notifications.filter((n) => !n.is_read) : notifications;

  const getTypeBadge = (type: NotificationType) => {
    switch (type) {
      case 'song':
        return {
          icon: Music,
          label: 'Bài hát mới',
          color: 'text-purple-400 bg-purple-950/60 border-purple-800/40',
        };
      case 'album':
        return {
          icon: Disc,
          label: 'Album mới',
          color: 'text-pink-400 bg-pink-950/60 border-pink-800/40',
        };
      case 'playlist':
        return {
          icon: ListMusic,
          label: 'Playlist',
          color: 'text-cyan-400 bg-cyan-950/60 border-cyan-800/40',
        };
      case 'feedback':
        return {
          icon: MessageSquare,
          label: 'Phản hồi',
          color: 'text-amber-400 bg-amber-950/60 border-amber-800/40',
        };
      case 'update':
        return {
          icon: Sparkles,
          label: 'Tính năng mới',
          color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40',
        };
      case 'system':
      default:
        return {
          icon: Info,
          label: 'Hệ thống',
          color: 'text-blue-400 bg-blue-950/60 border-blue-800/40',
        };
    }
  };

  const formatNotificationTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 2) return 'Vừa xong';
      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      if (diffDays < 7) return `${diffDays} ngày trước`;
      return date.toLocaleDateString('vi-VN');
    } catch {
      return '';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto select-none">
      {/* Header Hộp thư */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-purple-900/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Hộp Thư & Thông Báo</span>
              {unreadCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500 text-white font-bold animate-pulse">
                  {unreadCount} mới
                </span>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              Nhận thông báo cập nhật bài hát, album và tin tức mới nhất từ hệ thống
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800/40 text-purple-300 hover:text-white text-xs font-semibold transition-all cursor-pointer self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-purple-400" />
            <span>Đánh dấu tất cả đã đọc</span>
          </button>
        )}
      </div>

      {/* Tabs Switcher: Tất cả / Chưa đọc */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-purple-600/30 text-white border border-purple-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-purple-950/30 border border-transparent'
          }`}
        >
          Tất cả ({notifications.length})
        </button>

        <button
          type="button"
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            filter === 'unread'
              ? 'bg-purple-600/30 text-white border border-purple-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-purple-950/30 border border-transparent'
          }`}
        >
          Chưa đọc ({unreadCount})
        </button>
      </div>

      {/* Danh sách thông báo thực tế */}
      <div className="space-y-3">
        {isLoading && notifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-500">Đang tải thông báo...</div>
        ) : displayedList.length > 0 ? (
          displayedList.map((item) => {
            const badge = getTypeBadge(item.type);
            const Icon = badge.icon;
            const isUnread = !item.is_read;

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (isUnread) markAsRead(item.id);
                }}
                className={`group p-4 rounded-2xl border transition-all relative overflow-hidden flex items-start gap-4 ${
                  isUnread
                    ? 'bg-[#18112c]/90 border-purple-700/50 shadow-md shadow-purple-950/40'
                    : 'bg-[#130b22]/70 border-purple-900/30 hover:border-purple-800/50'
                }`}
              >
                {/* Dấu chấm thông báo chưa đọc */}
                {isUnread && (
                  <span className="absolute top-4 left-2 w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
                )}

                {/* Icon phân loại */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${badge.color}`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Nội dung thông báo */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                      <h4
                        className={`text-sm font-bold truncate ${
                          isUnread ? 'text-white' : 'text-zinc-300'
                        }`}
                      >
                        {item.title}
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-500 shrink-0">
                      {formatNotificationTime(item.created_at)}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed">{item.content}</p>

                  {/* Hành động liên kết & Đánh dấu */}
                  <div className="pt-2 flex items-center justify-between">
                    {item.link ? (
                      <Link
                        href={item.link}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isUnread) markAsRead(item.id);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-semibold"
                      >
                        <span>Xem chi tiết</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <div />
                    )}

                    <div className="flex items-center gap-2">
                      {isUnread && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(item.id);
                          }}
                          className="text-[11px] text-zinc-400 hover:text-white px-2 py-1 rounded-lg hover:bg-purple-900/30 transition-colors cursor-pointer"
                        >
                          Đánh dấu đã đọc
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(item.id);
                        }}
                        title="Xóa thông báo này"
                        className="p-1 rounded-lg text-zinc-500 hover:text-pink-400 hover:bg-pink-950/30 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-16 text-center rounded-3xl border border-dashed border-purple-900/40 bg-[#140c26]/40 space-y-3">
            <Bell className="w-10 h-10 text-purple-400/40 mx-auto" />
            <h3 className="text-sm font-bold text-white">
              {filter === 'unread' ? 'Không có thông báo chưa đọc' : 'Hộp thư hiện đang trống'}
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              {filter === 'unread'
                ? 'Bạn đã xem hết tất cả các thông báo mới nhất.'
                : 'Bạn sẽ nhận được thông báo khi có bài hát, album mới phát hành hoặc các cập nhật chính thức từ Laptune.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
