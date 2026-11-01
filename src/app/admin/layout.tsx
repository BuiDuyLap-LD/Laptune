import React from 'react';
import type { Metadata } from 'next';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminGuard from '@/components/admin/AdminGuard';

export const metadata: Metadata = {
  title: 'Laptune Admin - Control Center',
  description: 'Trang quản trị nội dung âm nhạc và phản hồi người dùng cho Laptune',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0e081c] text-white flex flex-col">
      {/* 1. Page-level Site Header with Navigation Bar */}
      <AdminHeader />

      {/* 2. Main Admin Workspace Container wrapped in Access Guard */}
      <AdminGuard>
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>
      </AdminGuard>
    </div>
  );
}
