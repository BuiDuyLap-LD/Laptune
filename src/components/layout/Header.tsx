'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import SearchField from './SearchField';
import AccountMenu from './AccountMenu';
import HeaderMarquee from './HeaderMarquee';

export default function Header() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string>('user');

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (profile?.role) {
          setRole(profile.role);
        }
      }
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-purple-900/30 bg-[#100a1c]/80 backdrop-blur-md sticky top-0 z-30">
      {/* 1. Native Search Field (NSSearchField) */}
      <SearchField />

      {/* 2. Dải cuộn thông báo thời gian thực (Marquee Strip) lấp đầy khoảng trống */}
      <HeaderMarquee />

      {/* 3. Menu Bar Extras: Phía bên phải (NSStatusBar.system) */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Nút Admin nếu là Admin */}
        {role === 'admin' && (
          <Link
            href="/admin"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-600/20 border border-purple-500/40 text-purple-300 hover:bg-purple-600/30 text-xs font-semibold transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin CMS</span>
          </Link>
        )}

        {/* Status Item & Dropdown Menu */}
        {user ? (
          <AccountMenu user={user} role={role} />
        ) : (
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/30 transition-all cursor-pointer"
          >
            <User className="w-3.5 h-3.5" />
            <span>Đăng nhập</span>
          </Link>
        )}
      </div>
    </header>
  );
}
