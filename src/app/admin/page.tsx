'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Music,
  Users,
  Disc,
  ListMusic,
  MessageSquareText,
  Upload,
  ArrowUpRight,
  ShieldCheck,
  HardDrive,
  Activity,
  Headphones,
} from 'lucide-react';
import AdminDonutChart from '@/components/admin/AdminDonutChart';
import AdminParallaxActivity from '@/components/admin/AdminParallaxActivity';
import { createClient } from '@/lib/supabase/client';

export default function AdminDashboardPage() {
  const supabase = createClient();
  const [counts, setCounts] = useState({
    songs: 0,
    artists: 0,
    albums: 0,
    playlists: 0,
    feedback: 0,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const [
          { count: songsCount },
          { count: artistsCount },
          { count: albumsCount },
          { count: playlistsCount },
          { count: feedbackCount },
        ] = await Promise.all([
          supabase.from('songs').select('*', { count: 'exact', head: true }),
          supabase.from('artists').select('*', { count: 'exact', head: true }),
          supabase.from('albums').select('*', { count: 'exact', head: true }),
          supabase.from('playlists').select('*', { count: 'exact', head: true }),
          supabase.from('feedback').select('*', { count: 'exact', head: true }),
        ]);

        setCounts({
          songs: songsCount || 0,
          artists: artistsCount || 0,
          albums: albumsCount || 0,
          playlists: playlistsCount || 0,
          feedback: feedbackCount || 0,
        });
      } catch (err) {
        console.error(err);
      }
    }

    loadStats();
  }, [supabase]);

  const stats = [
    { label: 'Tổng bài hát', value: counts.songs.toString(), icon: Music, href: '/admin/songs', color: 'from-purple-600 to-indigo-600' },
    { label: 'Nghệ sĩ', value: counts.artists.toString(), icon: Users, href: '/admin/artists', color: 'from-blue-600 to-cyan-600' },
    { label: 'Album phát hành', value: counts.albums.toString(), icon: Disc, href: '/admin/albums', color: 'from-pink-600 to-rose-600' },
    { label: 'Playlist chính thức', value: counts.playlists.toString(), icon: ListMusic, href: '/admin/playlists', color: 'from-amber-600 to-orange-600' },
    { label: 'Góp ý thính giả', value: counts.feedback.toString(), icon: MessageSquareText, href: '/admin/feedback', color: 'from-emerald-600 to-teal-600' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Welcome & Overview Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-purple-900/30 via-[#18102c] to-[#120b22] border border-purple-800/30">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              Tài khoản Admin
            </span>
            <span className="text-xs text-zinc-400">buil14955@gmail.com</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Trung tâm quản trị âm nhạc LAPTUNE
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Quản lý kho nhạc độc quyền, nghệ sĩ, album và theo dõi phản hồi đóng góp từ thính giả.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/songs/upload"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Tải bài hát mới</span>
          </Link>
        </div>
      </div>

      {/* 2. Quick Metrics Grid (Real counts from Supabase) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="group p-4 rounded-xl bg-[#160e29]/70 hover:bg-[#1a1130] border border-purple-900/20 hover:border-purple-500/40 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.color} p-2 flex items-center justify-center text-white shadow-md`}>
                  <Icon className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-purple-300 transition-colors" />
              </div>
              <div className="text-2xl font-bold text-white group-hover:text-purple-200 transition-colors">
                {stat.value}
              </div>
              <div className="text-xs text-zinc-400 font-medium mt-1">
                {stat.label}
              </div>
            </Link>
          );
        })}
      </div>

      {/* 3. Data Visualization: Donut Chart Section & System Storage Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Donut Chart (Chiếm 2 cột) */}
        <div className="lg:col-span-2">
          <AdminDonutChart
            title="Cơ cấu thể loại trong kho nhạc"
            totalLabel="Tổng bài hát"
            unit="bài"
          />
        </div>

        {/* Thẻ phụ trợ: Tình trạng lưu trữ & Tần suất phát nhạc */}
        <div className="p-6 rounded-2xl bg-[#140c26]/80 border border-purple-900/30 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-purple-900/20 mb-4">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Dung lượng Supabase</h3>
              </div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                Khả dụng
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-zinc-400">Audio Bucket (music/audio)</span>
                  <span className="text-white font-semibold">Khả dụng / 1 GB Free</span>
                </div>
                <div className="w-full h-2 rounded-full bg-purple-950/60 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-[15%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-zinc-400">Covers Bucket (music/covers)</span>
                  <span className="text-white font-semibold">Khả dụng / 1 GB Free</span>
                </div>
                <div className="w-full h-2 rounded-full bg-purple-950/60 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full w-[5%]" />
                </div>
              </div>

              <div className="pt-2 border-t border-purple-900/20">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <Headphones className="w-3.5 h-3.5 text-purple-400" />
                    Tổng bài hát hiện tại
                  </span>
                  <span className="text-purple-300 font-bold">{counts.songs} bài</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-purple-900/20 flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Trạng thái DB: Kết nối
            </span>
            <Link
              href="/admin/songs/upload"
              className="text-purple-300 hover:text-white font-semibold transition-colors"
            >
              Upload thêm →
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Real-time Notifications & Activity: Parallax Scrolling Section */}
      <AdminParallaxActivity />
    </div>
  );
}
