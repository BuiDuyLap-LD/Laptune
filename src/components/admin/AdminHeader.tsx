'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShieldCheck,
  LayoutDashboard,
  Music,
  Users,
  Disc,
  ListMusic,
  MessageSquareText,
  Plus,
  LogOut,
  Radio,
  Bell,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: 'Tổng quan', href: '/admin', icon: LayoutDashboard },
  { name: 'Bài hát', href: '/admin/songs', icon: Music },
  { name: 'Nghệ sĩ', href: '/admin/artists', icon: Users },
  { name: 'Album', href: '/admin/albums', icon: Disc },
  { name: 'Playlist', href: '/admin/playlists', icon: ListMusic },
  { name: 'Phản hồi', href: '/admin/feedback', icon: MessageSquareText },
  { name: 'Thông báo', href: '/admin/notifications', icon: Bell },
];

export default function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [adminEmail, setAdminEmail] = useState<string>('buil14955@gmail.com');

  useEffect(() => {
    const getAdminUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setAdminEmail(user.email);
      }
    };
    getAdminUser();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const isCurrentPage = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="page-header w-full border-b border-purple-900/30 bg-[#120b22]/95 backdrop-blur-md sticky top-0 z-40">
      <div className="h-16 px-4 lg:px-8 flex items-center justify-between gap-4">
        {/* 1. Brand Mark: Logo LAPTUNE Studio / Admin CMS */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/admin"
            className="group flex items-center gap-2.5 transition-opacity hover:opacity-95"
            aria-label="Laptune Admin Studio"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-700 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-purple-600/30 flex items-center justify-center">
              <div className="w-full h-full bg-[#140c26] rounded-[10px] flex items-center justify-center">
                <Radio className="w-4 h-4 text-purple-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-wider bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
                  LAPTUNE
                </span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 tracking-wider">
                  Admin
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 font-medium">Control Center</span>
            </div>
          </Link>
        </div>

        {/* 2. Destination Links Navigation (Desktop): Chứa danh sách các liên kết đích */}
        <nav
          aria-label="Main"
          className="hidden md:flex items-center gap-1 overflow-x-auto py-1 scrollbar-none"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isCurrent = isCurrentPage(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isCurrent ? 'page' : undefined}
                className="admin-nav-link relative inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium text-zinc-400 border border-transparent transition-all duration-200 hover:text-white hover:bg-purple-950/40 aria-[current=page]:bg-purple-600/20 aria-[current=page]:text-purple-200 aria-[current=page]:border-purple-500/40 aria-[current=page]:font-semibold aria-[current=page]:shadow-[0_0_12px_rgba(168,85,247,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
              >
                <Icon className="w-4 h-4 transition-transform group-hover:scale-105" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* 3. Actions on the right: Phím tắt hành động nhanh & tài khoản */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Nút Về trang người dùng */}
          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950/40 hover:bg-purple-900/40 border border-purple-800/40 text-purple-300 hover:text-white text-xs font-medium transition-colors"
          >
            <span>Giao diện App</span>
          </Link>

          {/* Nút Upload nhạc nhanh */}
          <Link
            href="/admin/songs/upload"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-semibold shadow-md shadow-purple-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Tải nhạc mới</span>
            <span className="sm:hidden">Thêm</span>
          </Link>

          {/* Trạng thái và Email Admin */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-purple-950/40 border border-purple-900/40">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[11px] font-medium text-zinc-300 max-w-[140px] truncate">
              {adminEmail}
            </span>
          </div>

          {/* Nút Đăng xuất */}
          <button
            onClick={handleSignOut}
            title="Đăng xuất khỏi Admin"
            aria-label="Đăng xuất"
            className="inline-flex items-center justify-center p-2 rounded-lg text-zinc-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. Mobile Subnavigation Bar (chỉ hiện trên màn hình < 768px) */}
      <div className="md:hidden flex items-center gap-1.5 overflow-x-auto px-4 py-2 border-t border-purple-900/20 bg-[#100a1c]/95 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isCurrent = isCurrentPage(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isCurrent
                  ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white bg-purple-950/30 border border-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Style selector phụ trợ đảm bảo tuân thủ triệt để: Style state hoàn toàn từ thuộc tính [aria-current="page"] */}
      <style jsx>{`
        nav[aria-label="Main"] a[aria-current="page"] {
          background-color: rgba(147, 51, 234, 0.22);
          color: #f3e8ff;
          border-color: rgba(168, 85, 247, 0.45);
          box-shadow: 0 0 14px rgba(168, 85, 247, 0.22);
        }
      `}</style>
    </header>
  );
}

