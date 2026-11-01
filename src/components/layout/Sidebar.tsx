'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
import {
  Compass,
  TrendingUp,
  Radio,
  Library,
  Heart,
  ListMusic,
  History,
  Music2,
  PanelLeftClose,
  PanelLeftOpen,
  PlusCircle,
  Bell,
  MessageSquarePlus,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  width: number;
  onWidthChange: (newWidth: number) => void;
}

export default function Sidebar({
  isCollapsed,
  onToggleCollapse,
  width,
  onWidthChange,
}: SidebarProps) {
  const pathname = usePathname();
  const openCreatePlaylistModal = useLibraryStore((state) => state.openCreatePlaylistModal);
  const favoriteCount = useLibraryStore((state) => state.favorites.length);
  const playlistCount = useLibraryStore((state) => state.userPlaylists.length);
  const unreadNotifCount = useNotificationStore((state) => state.unreadCount);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartXRef = useRef<number>(0);
  const dragStartWidthRef = useRef<number>(width);

  // Xử lý kéo thả thanh ngăn cách (Draggable Divider - NSSplitView)
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartXRef.current = e.clientX;
    dragStartWidthRef.current = width;
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartXRef.current;
      const newWidth = Math.min(Math.max(dragStartWidthRef.current + deltaX, 200), 380);
      onWidthChange(newWidth);
    },
    [isDragging, onWidthChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const navLinks = [
    { label: 'Khám phá', href: '/', icon: Compass },
    { label: 'Bảng xếp hạng', href: '/charts', icon: TrendingUp },
    { label: 'Thể loại', href: '/genres', icon: Radio },
    {
      label: 'Hộp thư',
      href: '/inbox',
      icon: Bell,
      badge: unreadNotifCount > 0 ? unreadNotifCount : undefined,
    },
  ];

  const libraryLinks = [
    { label: 'Thư viện', href: '/library', icon: Library },
    {
      label: 'Bài hát yêu thích',
      href: '/favorites',
      icon: Heart,
      badge: favoriteCount > 0 ? favoriteCount : undefined,
    },
    {
      label: 'Playlist của tôi',
      href: '/playlists',
      icon: ListMusic,
      badge: playlistCount > 0 ? playlistCount : undefined,
    },
    { label: 'Góp ý & Báo lỗi', href: '/feedback', icon: MessageSquarePlus },
  ];

  return (
    <aside
      style={{ width: isCollapsed ? 76 : width }}
      className={`hidden md:flex flex-col relative shrink-0 bg-[#130c24] border-r border-purple-900/30 transition-[width] duration-150 ease-out select-none ${
        isDragging ? 'pointer-events-none cursor-col-resize select-none' : ''
      }`}
    >
      {/* 1. Header Toolbar Boundary - Đồng bộ đường phân cách (NSTrackingSeparatorToolbarItem) */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-purple-900/30">
        <Link
          href="/"
          className={`flex items-center gap-3 overflow-hidden transition-all ${
            isCollapsed ? 'justify-center w-full' : ''
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
            <Music2 className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-purple-100 to-purple-300 bg-clip-text text-transparent truncate">
              Laptune
            </span>
          )}
        </Link>

        {/* Nút thu gọn / mở rộng Sidebar (Native Collapse Behavior) */}
        {!isCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            title="Thu gọn Sidebar"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-purple-900/30 transition-colors cursor-pointer"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Khi Sidebar bị thu gọn, hiển thị nút mở lại */}
      {isCollapsed && (
        <div className="flex justify-center py-2 border-b border-purple-900/20">
          <button
            type="button"
            onClick={onToggleCollapse}
            title="Mở rộng Sidebar"
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-purple-900/30 transition-colors cursor-pointer"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* 2. Menu Điều Hướng Chính */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          {!isCollapsed && (
            <p className="px-3 mb-2 text-[11px] font-semibold tracking-wider uppercase text-zinc-500">
              Menu Chính
            </p>
          )}
          <nav className="space-y-1">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-purple-600/20 text-purple-300 border-l-[3px] border-purple-500 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <div className="relative">
                    <Icon
                      className={`w-5 h-5 shrink-0 transition-transform ${
                        isActive ? 'text-purple-400 scale-105' : 'group-hover:text-zinc-200'
                      }`}
                    />
                    {item.badge && isCollapsed && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-pink-500 ring-2 ring-[#130c24]" />
                    )}
                  </div>
                  {!isCollapsed && (
                    <span className="truncate flex-1">{item.label}</span>
                  )}
                  {!isCollapsed && item.badge && (
                    <span className="px-1.5 py-0.5 rounded-full bg-pink-500/20 border border-pink-500/30 text-pink-300 text-[10px] font-bold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Ngăn cách phân đoạn */}
        <div className="h-[1px] bg-purple-900/30 mx-2" />

        {/* 3. Phân Đoạn Thư Viện Cá Nhân */}
        <div>
          {!isCollapsed && (
            <p className="px-3 mb-2 text-[11px] font-semibold tracking-wider uppercase text-zinc-500">
              Thư Viện
            </p>
          )}
          <nav className="space-y-1">
            {libraryLinks.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-purple-600/20 text-purple-300 border-l-[3px] border-purple-500'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-transform ${
                      isActive ? 'text-purple-400 scale-105' : 'group-hover:text-zinc-200'
                    }`}
                  />
                  {!isCollapsed && <span className="truncate flex-1">{item.label}</span>}
                  {!isCollapsed && item.badge && (
                    <span className="px-1.5 py-0.5 rounded-full bg-pink-500/20 border border-pink-500/30 text-pink-300 text-[10px] font-bold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 4. Footer Sidebar - Nút tạo Playlist */}
      <div className="p-3 border-t border-purple-900/30">
        <button
          type="button"
          onClick={openCreatePlaylistModal}
          title="Tạo playlist mới"
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/40 border border-purple-800/40 text-purple-300 hover:text-purple-200 text-sm font-medium transition-colors cursor-pointer ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
        >
          <PlusCircle className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span className="truncate">Tạo playlist mới</span>}
        </button>
      </div>

      {/* 5. Draggable Divider (NSSplitView Divider Bar) */}
      {!isCollapsed && (
        <div
          onMouseDown={handleMouseDown}
          className={`absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-purple-500/50 transition-colors z-20 group ${
            isDragging ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]' : 'bg-transparent'
          }`}
        >
          <div className="w-full h-full" />
        </div>
      )}
    </aside>
  );
}

