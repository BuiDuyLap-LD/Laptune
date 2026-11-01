'use client';

import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Download,
  Share,
  PlusSquare,
  Monitor,
  CheckCircle2,
  X,
  Sparkles,
  Zap,
  Music2,
  Layers,
  ArrowRight,
  MoreVertical,
} from 'lucide-react';

type PlatformType = 'ios' | 'android' | 'desktop';

export default function PWAInstallModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [platform, setPlatform] = useState<PlatformType>('android');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Nhận diện thiết bị người dùng
    const ua = navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    const isAndroid = /Android/.test(ua);

    if (isIOS) {
      setPlatform('ios');
    } else if (isAndroid) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }

    // 2. Kiểm tra xem người dùng có đang chạy trong chế độ PWA Standalone không
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      // Nếu đã cài đặt và đang mở app PWA, không cần mở modal
      return;
    }

    // 3. Mặc định xuất hiện mỗi lần truy cập trang web (theo yêu cầu)
    // Cho độ trễ 600ms để trang tải mượt mà trước khi popup xuất hiện
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 600);

    // 4. Bắt sự kiện beforeinstallprompt (Chrome / Android / Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsOpen(false);
    });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsOpen(false);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.warn('Lỗi kích hoạt cài đặt PWA:', err);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen || isInstalled) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-install-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in select-none"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-3xl bg-[#160d29] border border-purple-800/40 p-6 sm:p-7 shadow-2xl shadow-purple-950/60 text-white space-y-6 overflow-hidden"
      >
        {/* Glow trang trí nền */}
        <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-pink-600/20 blur-3xl pointer-events-none" />

        {/* Nút đóng tự do */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Đóng thông báo"
          title="Đóng thông báo (Esc)"
          className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-purple-900/40 transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Thông báo cài PWA */}
        <div className="flex items-center gap-4 pr-8">
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-600/40 shrink-0">
            <Music2 className="w-7 h-7 text-white" />
            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-[#160d29] border border-purple-500/40 text-[9px] font-black text-pink-300">
              PWA
            </span>
          </div>

          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3 text-pink-400" />
              <span>Trải nghiệm trọn vẹn</span>
            </div>
            <h2 id="pwa-install-title" className="text-lg sm:text-xl font-black text-white tracking-tight">
              Cài Đặt Laptune Về Màn Hình Chính
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Sử dụng như ứng dụng gốc, mượt mà và không tốn dung lượng
            </p>
          </div>
        </div>

        {/* 3 Lợi ích nổi bật */}
        <div className="grid grid-cols-3 gap-2 text-center py-1">
          <div className="p-2.5 rounded-xl bg-[#120a22]/80 border border-purple-900/30">
            <Zap className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <div className="text-[11px] font-bold text-white">Khởi chạy tức thì</div>
            <div className="text-[9px] text-zinc-400">1 chạm từ màn hình</div>
          </div>
          <div className="p-2.5 rounded-xl bg-[#120a22]/80 border border-purple-900/30">
            <Layers className="w-4 h-4 text-purple-400 mx-auto mb-1" />
            <div className="text-[11px] font-bold text-white">Toàn màn hình</div>
            <div className="text-[9px] text-zinc-400">Không thanh URL</div>
          </div>
          <div className="p-2.5 rounded-xl bg-[#120a22]/80 border border-purple-900/30">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <div className="text-[11px] font-bold text-white">Âm thanh nền</div>
            <div className="text-[9px] text-zinc-400">Phát khi khóa máy</div>
          </div>
        </div>

        {/* Nút cài đặt trực tiếp (nếu trình duyệt hỗ trợ native prompt) */}
        {deferredPrompt && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleInstallClick}
              className="w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-sm shadow-xl shadow-purple-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Cài đặt ứng dụng ngay</span>
            </button>
            <p className="text-[10px] text-center text-zinc-400">
              Nhấn để mở hộp thoại cài đặt tự động của trình duyệt
            </p>
          </div>
        )}

        {/* Bộ chuyển đổi thiết bị (Device Tabs) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
            <span>Hướng dẫn cài đặt chi tiết cho thiết bị:</span>
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#10081e] border border-purple-900/40">
              <button
                type="button"
                onClick={() => setPlatform('ios')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  platform === 'ios'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>iPhone / iPad</span>
              </button>
              <button
                type="button"
                onClick={() => setPlatform('android')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  platform === 'android'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>Android</span>
              </button>
              <button
                type="button"
                onClick={() => setPlatform('desktop')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  platform === 'desktop'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>Máy tính</span>
              </button>
            </div>
          </div>

          {/* Hướng dẫn Platform 1: iOS (Safari iPhone / iPad) */}
          {platform === 'ios' && (
            <div className="p-4 rounded-2xl bg-[#120a22] border border-purple-900/40 space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-purple-600/30 text-purple-300 font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </div>
                <div className="flex-1 text-zinc-300 leading-relaxed">
                  Mở Laptune trên trình duyệt <strong>Safari</strong>, nhấn vào biểu tượng{' '}
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300 font-semibold">
                    <Share className="w-3.5 h-3.5 text-blue-400" />
                    <span>Chia sẻ</span>
                  </span>{' '}
                  ở thanh công cụ dưới cùng màn hình.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-purple-600/30 text-purple-300 font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </div>
                <div className="flex-1 text-zinc-300 leading-relaxed">
                  Cuộn xuống và chọn mục{' '}
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-950 border border-purple-800 text-pink-300 font-semibold">
                    <PlusSquare className="w-3.5 h-3.5" />
                    <span>Thêm vào MH chính</span>
                  </span>{' '}
                  (Add to Home Screen).
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-purple-600/30 text-purple-300 font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </div>
                <div className="flex-1 text-zinc-300 leading-relaxed">
                  Nhấn nút <strong>&quot;Thêm&quot;</strong> (Add) ở góc trên bên phải để hoàn tất cài đặt ứng dụng.
                </div>
              </div>
            </div>
          )}

          {/* Hướng dẫn Platform 2: Android (Chrome / Edge / Cốc Cốc) */}
          {platform === 'android' && (
            <div className="p-4 rounded-2xl bg-[#120a22] border border-purple-900/40 space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-purple-600/30 text-purple-300 font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </div>
                <div className="flex-1 text-zinc-300 leading-relaxed">
                  Nhấn vào biểu tượng <strong>Menu 3 chấm (⋮)</strong> ở góc trên bên phải trình duyệt Chrome.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-purple-600/30 text-purple-300 font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </div>
                <div className="flex-1 text-zinc-300 leading-relaxed">
                  Chọn dòng{' '}
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300 font-semibold">
                    <Download className="w-3.5 h-3.5 text-pink-400" />
                    <span>Cài đặt ứng dụng</span>
                  </span>{' '}
                  hoặc <strong>&quot;Thêm vào màn hình chính&quot;</strong>.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-purple-600/30 text-purple-300 font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </div>
                <div className="flex-1 text-zinc-300 leading-relaxed">
                  Xác nhận <strong>&quot;Cài đặt&quot;</strong> để biểu tượng Laptune xuất hiện trên màn hình điện thoại.
                </div>
              </div>
            </div>
          )}

          {/* Hướng dẫn Platform 3: Desktop (Windows / Mac - Chrome / Edge) */}
          {platform === 'desktop' && (
            <div className="p-4 rounded-2xl bg-[#120a22] border border-purple-900/40 space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-purple-600/30 text-purple-300 font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </div>
                <div className="flex-1 text-zinc-300 leading-relaxed">
                  Nhìn vào phía bên phải thanh địa chỉ URL của trình duyệt, nhấn vào biểu tượng{' '}
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300 font-semibold">
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Cài đặt Laptune</span>
                  </span>.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-purple-600/30 text-purple-300 font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </div>
                <div className="flex-1 text-zinc-300 leading-relaxed">
                  Nhấn <strong>&quot;Cài đặt&quot;</strong> (Install) trong hộp thoại xác nhận để mở Laptune dưới dạng ứng dụng độc lập trên Desktop.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer: Nút đóng tự do */}
        <div className="pt-2 flex items-center justify-between border-t border-purple-900/30">
          <span className="text-[11px] text-zinc-500">
            Bạn có thể đóng cửa sổ này bất cứ lúc nào
          </span>
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800/40 text-purple-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
          >
            Để sau / Tiếp tục nghe nhạc
          </button>
        </div>
      </div>
    </div>
  );
}

