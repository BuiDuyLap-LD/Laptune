'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, LogIn, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = createClient();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setIsAuthorized(false);
          return;
        }

        setCurrentUserEmail(user.email ?? null);

        // Kiểm tra đúng tài khoản Admin duy nhất
        const ADMIN_EMAIL = 'buil14955@gmail.com';
        if (user.email === ADMIN_EMAIL) {
          setIsAuthorized(true);
        } else {
          // Nếu đăng nhập bằng tài khoản user khác
          setIsAuthorized(false);
        }
      } catch (err) {
        setIsAuthorized(false);
      }
    };

    checkAdminAccess();
  }, [supabase]);

  if (isAuthorized === false) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-2xl bg-[#160d2e] border border-rose-500/40 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
            <Lock className="w-7 h-7" />
          </div>

          <h2 className="text-xl font-bold text-white">
            {currentUserEmail ? 'Truy cập bị từ chối' : 'Yêu cầu đăng nhập Admin'}
          </h2>
          <p className="text-xs text-zinc-300 leading-relaxed">
            {currentUserEmail
              ? `Trang quản trị này chỉ dành riêng cho tài khoản quản trị viên tối cao (buil14955@gmail.com). Tài khoản hiện tại của bạn (${currentUserEmail}) không có quyền hạn.`
              : 'Vui lòng đăng nhập với tài khoản Quản trị viên (buil14955@gmail.com) để truy cập Trung tâm điều khiển Laptune.'}
          </p>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 rounded-xl bg-purple-900/40 hover:bg-purple-900/60 border border-purple-700/40 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              Về trang nghe nhạc
            </button>
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition-colors cursor-pointer"
            >
              Đăng nhập tài khoản Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

