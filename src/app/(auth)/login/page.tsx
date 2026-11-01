'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Eye, EyeOff, Music2, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Xử lý đăng nhập bằng Google OAuth qua Supabase
  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      setErrorMessage(null);
      const redirectTo = `${window.location.origin}/auth/callback`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setIsGoogleLoading(false);
      }
    } catch (err) {
      setErrorMessage('Đã xảy ra lỗi khi kết nối với Google.');
      setIsGoogleLoading(false);
    }
  };

  // Xử lý submit form với email & password
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setErrorMessage('Không thể đăng nhập. Vui lòng kiểm tra lại thông tin.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#100a1c] text-white px-4 py-12 relative overflow-hidden">
      {/* Background Glow effects */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-pink-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#181128]/90 border border-purple-900/30 backdrop-blur-xl p-8 rounded-2xl shadow-2xl shadow-purple-950/40 relative z-10">
        {/* App Logo & Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Music2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-purple-100 to-purple-300 bg-clip-text text-transparent">
              Laptune
            </span>
          </Link>
          <h1 className="text-xl font-semibold text-zinc-100">Chào mừng trở lại</h1>
          <p className="text-sm text-zinc-400 mt-1">Đăng nhập để tiếp tục trải nghiệm âm nhạc</p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
            {errorMessage}
          </div>
        )}

        {/* 1. Federated Sign-in Buttons (Continue with Google) */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading}
            className="w-full h-11 flex items-center justify-center gap-3 bg-white hover:bg-zinc-100 active:scale-[0.99] transition-all text-zinc-900 font-medium rounded-xl shadow-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-zinc-700" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            )}
            <span>{isGoogleLoading ? 'Đang kết nối...' : 'Continue with Google'}</span>
          </button>
        </div>

        {/* 2. Sign-in Method Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-purple-900/40"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#181128] px-3 text-zinc-400 font-medium tracking-wider">or</span>
          </div>
        </div>

        {/* 3. Native Sign-in Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Labeled Email Field */}
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-zinc-300 mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
              placeholder="name@example.com"
              className="w-full h-11 px-3.5 rounded-xl bg-purple-950/20 border border-purple-900/50 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
            />
          </div>

          {/* Labeled Password Field with Visibility Toggle */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="block text-xs font-medium text-zinc-300">
                Password
              </label>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="w-full h-11 pl-3.5 pr-11 rounded-xl bg-purple-950/20 border border-purple-900/50 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-200 transition-colors focus:outline-none cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Eye className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="w-full h-11 mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.99] text-white font-medium text-sm rounded-xl transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign in'}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-zinc-500">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}

