'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, TrendingUp, Library, Bell } from 'lucide-react';
import { useNotificationStore } from '@/stores/useNotificationStore';

interface NavDestination {
  label: string;
  href: string;
  icon: React.ElementType;
}

const DESTINATIONS: NavDestination[] = [
  {
    label: 'Khám phá',
    href: '/',
    icon: Compass,
  },
  {
    label: 'Bảng xếp hạng',
    href: '/charts',
    icon: TrendingUp,
  },
  {
    label: 'Thư viện',
    href: '/library',
    icon: Library,
  },
  {
    label: 'Hộp thư',
    href: '/inbox',
    icon: Bell,
  },
];

interface BottomNavigationProps {
  className?: string;
}

export default function BottomNavigation({ className = '' }: BottomNavigationProps) {
  const pathname = usePathname();
  const unreadCount = useNotificationStore((state) => state.unreadCount);

  return (
    <nav
      aria-label="Chính"
      className={`fixed bottom-0 left-0 right-0 z-50 bg-[#181128]/95 backdrop-blur-xl border-t border-purple-900/30 md:hidden ${className}`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
        {DESTINATIONS.map((dest) => {
          const isActive =
            pathname === dest.href ||
            (dest.href === '/library' && (pathname === '/favorites' || pathname === '/playlists'));
          const Icon = dest.icon;

          return (
            <Link
              key={dest.href}
              href={dest.href}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex-1 flex flex-col items-center justify-center py-1 transition-none select-none ${
                isActive
                  ? 'text-purple-400'
                  : 'text-zinc-400 hover:text-zinc-200 active:text-zinc-300'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`w-5 h-5 transition-none ${
                    isActive ? 'stroke-[2.5px] scale-105' : 'stroke-[1.75px]'
                  }`}
                  aria-hidden="true"
                />

                {/* Count Badge on Inbox (tabBarBadge / .badge(_:)) */}
                {dest.href === '/inbox' && unreadCount > 0 && (
                  <span
                    aria-label={`${unreadCount} thông báo chưa đọc`}
                    className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-pink-500 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-[#181128] leading-none"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>

              <span
                className={`text-[11px] mt-1 font-medium tracking-tight truncate max-w-full px-1 ${
                  isActive ? 'font-semibold text-purple-300' : 'text-zinc-400'
                }`}
              >
                {dest.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

