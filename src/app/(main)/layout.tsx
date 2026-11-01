'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import BottomNavigation from '@/components/layout/BottomNavigation';
import PlayerBottomBar from '@/components/player/PlayerBottomBar';
import AudioPlayer from '@/components/player/AudioPlayer';
import GlobalAlert from '@/components/ui/GlobalAlert';
import RatingPrompt from '@/components/ui/RatingPrompt';
import CreatePlaylistModal from '@/components/modals/CreatePlaylistModal';
import AddToPlaylistModal from '@/components/modals/AddToPlaylistModal';
import PWAInstallModal from '@/components/pwa/PWAInstallModal';
import FullPlayerModal from '@/components/player/FullPlayerModal';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { useNotificationStore } from '@/stores/useNotificationStore';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState<number>(240);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const initLibrary = useLibraryStore((state) => state.init);
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);

  useEffect(() => {
    initLibrary();
    fetchNotifications();
  }, [initLibrary, fetchNotifications]);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-[#100a1c] text-white flex overflow-hidden">
      {/* Trình phát Audio HTML5 ẩn để xử lý luồng âm thanh thực */}
      <AudioPlayer />

      {/* Trình phát nhạc toàn màn hình (Full Player Modal) */}
      <FullPlayerModal />

      {/* Global macOS NSAlert Modal Dialog */}
      <GlobalAlert />

      {/* Modal Tạo Playlist & Thêm vào Playlist */}
      <CreatePlaylistModal />
      <AddToPlaylistModal />

      {/* Cửa sổ thông báo & Hướng dẫn cài PWA về màn hình chính */}
      <PWAInstallModal />

      {/* Thông báo đánh giá nhỏ sau 5 phút (NSLevelIndicator .rating) không gián đoạn nhạc */}
      <RatingPrompt delayMinutes={5} />

      {/* 1. Desktop Resizable & Collapsible Split View Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
        width={sidebarWidth}
        onWidthChange={setSidebarWidth}
      />

      {/* 2. Main Content Split Pane */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Aligned Toolbar Boundary */}
        <Header />

        {/* Scrollable Viewport - Đệm đáy để không bị thanh Player che khuất nội dung */}
        <main className="flex-1 overflow-y-auto pb-40 md:pb-28">
          <div className="w-full max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* 3. Neumorphism (Soft UI) Persistent Audio Player Bar */}
      <PlayerBottomBar />

      {/* 4. Mobile Bottom Navigation (Nằm phía dưới Player trên màn hình nhỏ) */}
      <BottomNavigation />
    </div>
  );
}
