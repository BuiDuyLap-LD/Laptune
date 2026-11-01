'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Bell,
  MessageSquare,
  Sparkles,
  Music,
  HardDrive,
  CheckCircle2,
  Clock,
  Radio,
  FileText,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ActivityItem {
  id: string;
  type: 'feedback' | 'song' | 'rating' | 'system';
  title: string;
  description: string;
  timestamp: string;
  badge: string;
  badgeColor: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function AdminParallaxActivity() {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgLayerRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadActivities() {
      setIsLoading(true);
      try {
        const list: ActivityItem[] = [];

        // Lấy bài hát mới nhất từ Supabase
        const { data: songs } = await supabase
          .from('songs')
          .select('id, title, artist, created_at')
          .order('created_at', { ascending: false })
          .limit(3);

        if (songs) {
          songs.forEach((s) => {
            list.push({
              id: `song-${s.id}`,
              type: 'song',
              title: `Bài hát: ${s.title}`,
              description: `Thể hiện bởi ${typeof s.artist === 'string' ? s.artist : 'Nghệ sĩ'} • Đã sẵn sàng phát trực tuyến.`,
              timestamp: new Date(s.created_at).toLocaleDateString('vi-VN'),
              badge: 'Bài hát mới',
              badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
              icon: Music,
            });
          });
        }

        // Lấy feedback/góp ý mới nhất từ Supabase
        const { data: feedbacks } = await supabase
          .from('feedback')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);

        if (feedbacks) {
          feedbacks.forEach((fb) => {
            list.push({
              id: `fb-${fb.id}`,
              type: fb.category === 'rating' ? 'rating' : 'feedback',
              title: fb.title || 'Phản hồi từ thính giả',
              description: fb.content,
              timestamp: new Date(fb.created_at).toLocaleDateString('vi-VN'),
              badge: fb.is_anonymous ? 'Ẩn danh' : `${fb.rating} ★ Rating`,
              badgeColor: fb.category === 'rating'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'bg-purple-500/20 text-purple-300 border-purple-500/30',
              icon: fb.category === 'rating' ? Sparkles : MessageSquare,
            });
          });
        }

        setActivities(list);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadActivities();
  }, [supabase]);

  // Fallback JS scroll driver (chỉ biến đổi transform/opacity và tôn trọng prefers-reduced-motion)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const supportsScrollTimeline =
      typeof CSS !== 'undefined' &&
      CSS.supports &&
      CSS.supports('animation-timeline', 'scroll()');

    if (supportsScrollTimeline) return;

    const handleScroll = () => {
      if (!bgLayerRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (rect.top < windowHeight && rect.bottom > 0) {
        const scrolledOffset = (windowHeight - rect.top) * 0.15;
        bgLayerRef.current.style.transform = `translate3d(0, ${scrolledOffset}px, 0)`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative rounded-2xl overflow-hidden border border-purple-900/30 bg-[#120a22]/70 backdrop-blur-md shadow-xl"
      aria-label="Luồng thông báo và hoạt động thời gian thực"
    >
      {/* 1. BACKGROUND LAYER */}
      <div
        ref={bgLayerRef}
        aria-hidden="true"
        className="admin-parallax-bg absolute inset-x-0 -top-24 h-[140%] pointer-events-none select-none z-0"
      >
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-purple-600/15 blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-pink-600/10 blur-3xl" />
        <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-cyan-600/10 blur-3xl" />

        <div
          className="w-full h-full opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(168, 85, 247, 0.4) 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* 2. FOREGROUND LAYER */}
      <div className="relative z-10 p-6 sm:p-8 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-purple-900/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                Dòng sự kiện & Thông báo hệ thống
              </h3>
              <p className="text-xs text-zinc-400">
                Dữ liệu bài hát và phản hồi thực tế từ Supabase
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <Radio className="w-3 h-3 text-emerald-400" />
              Live Stream
            </span>
          </div>
        </div>

        {/* Danh sách thẻ thông báo hoạt động */}
        {isLoading ? (
          <div className="p-8 text-center text-xs text-zinc-500">Đang tải luồng sự kiện...</div>
        ) : activities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activities.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="group p-4 rounded-xl bg-[#170e2c]/85 hover:bg-[#1d1238] border border-purple-900/30 hover:border-purple-500/40 transition-all duration-200 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                      <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.timestamp}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-white group-hover:text-purple-200 transition-colors flex items-center gap-2">
                      <Icon className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>{item.title}</span>
                    </h4>

                    <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-10 text-center rounded-xl bg-[#140c26]/50 border border-purple-900/20 text-xs text-zinc-500">
            Chưa có sự kiện hoặc phản hồi nào được ghi nhận.
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes parallaxScroll {
          from {
            transform: translate3d(0, 0, 0);
            opacity: 0.5;
          }
          to {
            transform: translate3d(0, 28%, 0);
            opacity: 0.85;
          }
        }

        .admin-parallax-bg {
          animation: parallaxScroll linear both;
          animation-timeline: scroll();
          will-change: transform, opacity;
        }

        @media (prefers-reduced-motion: reduce) {
          .admin-parallax-bg {
            animation: none !important;
            transform: none !important;
            will-change: auto !important;
          }
        }
      `}</style>
    </section>
  );
}
