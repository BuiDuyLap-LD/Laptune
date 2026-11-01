'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Settings,
  ShieldCheck,
  LogOut,
  Sliders,
  ChevronDown,
  Sparkles,
  MessageSquarePlus,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface AccountMenuProps {
  user: any;
  role: string;
}

export default function AccountMenu({ user, role }: AccountMenuProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Đóng menu khi nhấn Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSignOut = async () => {
    setIsOpen(false);
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const displayName =
    user.user_metadata?.full_name || user.email?.split('@')[0] || 'Người dùng';
  const displayInitial = displayName.charAt(0).toUpperCase();

  return (
    <div ref={menuRef} className="relative select-none">
      {/* 1. Status Item (NSStatusItem in NSStatusBar.system) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        title="Menu tài khoản"
        className={`flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full transition-all cursor-pointer ${
          isOpen
            ? 'bg-purple-600/30 ring-1 ring-purple-500/50 shadow-inner' // Highlighted State
            : 'hover:bg-purple-950/40 active:bg-purple-900/30'
        }`}
      >
        {/* Status Item Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 via-fuchsia-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-purple-500/25 shrink-0">
          {displayInitial}
        </div>

        {/* Status Item Label */}
        <span className="hidden sm:inline text-xs font-medium text-zinc-200 max-w-[130px] truncate">
          {user.email}
        </span>

        {/* Status Item Disclosure Indicator */}
        <ChevronDown
          className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-purple-300' : ''
          }`}
        />
      </button>

      {/* 2. NSMenu Dropdown */}
      {isOpen && (
        <div
          role="menu"
          aria-label="Menu tài khoản"
          className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-[#19112a]/95 backdrop-blur-2xl border border-purple-900/40 shadow-2xl shadow-purple-950/60 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          {/* Header Profile Item */}
          <div className="px-3 py-2.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 via-fuchsia-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-purple-500/30 shrink-0">
              {displayInitial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white truncate">
                  {displayName}
                </span>
                {role === 'admin' ? (
                  <span className="px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-semibold border border-purple-500/30">
                    Admin
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-medium">
                    Member
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 truncate mt-0.5">{user.email}</p>
            </div>
          </div>

          {/* Separator Item */}
          <div className="h-[1px] bg-purple-900/30 my-1 mx-2" />

          {/* NSMenuItem: Cài đặt tài khoản */}
          <Link
            href="/settings"
            onClick={() => setIsOpen(false)}
            role="menuitem"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-purple-600/20 active:bg-purple-600/30 transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Settings className="w-4 h-4 text-purple-400 group-hover:text-purple-300 transition-colors" />
              <span>Cài đặt tài khoản</span>
            </div>
            <kbd className="text-[10px] text-zinc-500 tracking-wider font-mono">⌘,</kbd>
          </Link>

          {/* NSMenuItem: Trang Admin (nếu role === 'admin') */}
          {role === 'admin' && (
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              role="menuitem"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-purple-300 hover:text-white hover:bg-purple-600/20 active:bg-purple-600/30 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-purple-400 group-hover:text-purple-300" />
                <span>Trang quản trị (Admin CMS)</span>
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            </Link>
          )}

          {/* NSMenuItem: Tùy chỉnh âm thanh */}
          <Link
            href="/settings?tab=audio"
            onClick={() => setIsOpen(false)}
            role="menuitem"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-purple-600/20 active:bg-purple-600/30 transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Sliders className="w-4 h-4 text-zinc-400 group-hover:text-purple-300 transition-colors" />
              <span>Chất lượng âm thanh</span>
            </div>
            <span className="text-[10px] text-purple-400 font-medium">320kbps</span>
          </Link>

          {/* NSMenuItem: Góp ý & Phản hồi */}
          <Link
            href="/feedback"
            onClick={() => setIsOpen(false)}
            role="menuitem"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-purple-600/20 active:bg-purple-600/30 transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <MessageSquarePlus className="w-4 h-4 text-pink-400 group-hover:text-pink-300 transition-colors" />
              <span>Góp ý & Báo lỗi</span>
            </div>
          </Link>

          {/* Separator Item */}
          <div className="h-[1px] bg-purple-900/30 my-1 mx-2" />

          {/* NSMenuItem: Đăng xuất */}
          <button
            type="button"
            onClick={handleSignOut}
            role="menuitem"
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-red-300 hover:text-red-200 hover:bg-red-500/10 active:bg-red-500/20 transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <LogOut className="w-4 h-4 text-red-400 group-hover:text-red-300 transition-colors" />
              <span>Đăng xuất</span>
            </div>
            <kbd className="text-[10px] text-zinc-500 tracking-wider font-mono">⌥Q</kbd>
          </button>
        </div>
      )}
    </div>
  );
}

