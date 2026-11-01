'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Settings,
  Shield,
  Volume2,
  LogOut,
  Check,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAlertStore } from '@/stores/useAlertStore';

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { showAlert } = useAlertStore();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [audioQuality, setAudioQuality] = useState('320'); // '128' | '320' | 'lossless'
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(profile);
      }
    };
    fetchUserData();
  }, [supabase]);

  // Hành động Đăng xuất có hộp thoại NSAlert xác nhận
  const handleConfirmSignOut = () => {
    showAlert({
      messageText: 'Bạn có chắc chắn muốn đăng xuất?',
      informativeText: 'Phiên làm việc hiện tại sẽ kết thúc. Bạn sẽ cần đăng nhập lại bằng Google để tiếp tục trải nghiệm đầy đủ kho nhạc.',
      primaryButtonText: 'Đăng xuất',
      cancelButtonText: 'Ở lại',
      showsSuppressionButton: false,
      onConfirm: async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
      },
    });
  };

  // Hành động Lưu Cài đặt có hộp thoại NSAlert xác nhận kèm checkbox Suppression
  const handleSavePreferences = () => {
    // Kiểm tra xem người dùng có từng chọn "Don't ask me again" chưa
    const isSuppressed = localStorage.getItem('laptune_suppress_settings_alert') === 'true';

    if (isSuppressed) {
      applySave();
      return;
    }

    showAlert({
      messageText: 'Xác nhận áp dụng cài đặt âm thanh mới?',
      informativeText: `Chất lượng phát nhạc sẽ được điều chỉnh thành mốc ${
        audioQuality === 'lossless' ? 'Lossless (FLAC)' : audioQuality + ' kbps'
      }. Thay đổi này sẽ ảnh hưởng trực tiếp đến băng thông mạng của bạn.`,
      primaryButtonText: 'Áp dụng ngay',
      cancelButtonText: 'Hủy bỏ',
      showsSuppressionButton: true,
      suppressionButtonText: "Không hỏi lại lần sau (Don't ask me again)",
      onConfirm: (suppressed) => {
        if (suppressed) {
          localStorage.setItem('laptune_suppress_settings_alert', 'true');
        }
        applySave();
      },
    });
  };

  const applySave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      {/* Tiêu đề trang Cài đặt */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Cài Đặt Tài Khoản</h1>
          <p className="text-xs sm:text-sm text-zinc-400">Quản lý hồ sơ và tùy chỉnh trải nghiệm phát nhạc</p>
        </div>
      </div>

      {/* 1. Phần Thông Tin Tài Khoản */}
      <div className="rounded-2xl bg-[#19112a]/80 border border-purple-900/40 p-6 space-y-6 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-purple-400" />
            Hồ sơ cá nhân
          </h2>
          {profile?.role === 'admin' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold">
              <Shield className="w-3 h-3" />
              Quản trị viên (Admin)
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500 via-fuchsia-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-purple-500/25 shrink-0">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="space-y-1">
            <div className="text-sm font-semibold text-white">
              {profile?.full_name || user?.user_metadata?.full_name || 'Người dùng Laptune'}
            </div>
            <div className="text-xs text-zinc-400">{user?.email || 'Chưa đăng nhập'}</div>
            <div className="text-[11px] text-zinc-500">
              Đăng nhập qua Google OAuth
            </div>
          </div>
        </div>
      </div>

      {/* 2. Phần Tùy Chọn Phát Nhạc (Audio Preferences) */}
      <div className="rounded-2xl bg-[#19112a]/80 border border-purple-900/40 p-6 space-y-4 backdrop-blur-xl">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-pink-400" />
          Chất lượng âm thanh phát trực tuyến
        </h2>
        <p className="text-xs text-zinc-400">
          Lựa chọn chất lượng stream để tối ưu giữa độ mượt mà và độ chi tiết của bài hát.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {[
            { id: '128', label: 'Tiêu chuẩn (128 kbps)', desc: 'Tiết kiệm dung lượng mạng' },
            { id: '320', label: 'Chất lượng cao (320 kbps)', desc: 'Âm thanh chi tiết & trong trẻo' },
            { id: 'lossless', label: 'Lossless (FLAC)', desc: 'Chất lượng phòng thu nguyên bản' },
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => setAudioQuality(item.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                audioQuality === item.id
                  ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-950/40'
                  : 'bg-[#140c22] border-purple-900/30 text-zinc-400 hover:border-purple-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold">{item.label}</span>
                {audioQuality === item.id && <Check className="w-4 h-4 text-purple-400" />}
              </div>
              <p className="text-[11px] text-zinc-500">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={handleSavePreferences}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-md shadow-purple-600/30 flex items-center gap-2 cursor-pointer"
          >
            {isSaved ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Đã lưu</span>
              </>
            ) : (
              <span>Lưu thay đổi</span>
            )}
          </button>
        </div>
      </div>

      {/* 3. Phần Đăng Xuất */}
      <div className="rounded-2xl bg-red-950/10 border border-red-900/30 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-red-300">Đăng xuất khỏi thiết bị này</h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Phiên đăng nhập hiện tại sẽ kết thúc và bạn có thể đăng nhập lại bất cứ lúc nào.
          </p>
        </div>
        <button
          type="button"
          onClick={handleConfirmSignOut}
          className="px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300 text-xs font-semibold transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
}
