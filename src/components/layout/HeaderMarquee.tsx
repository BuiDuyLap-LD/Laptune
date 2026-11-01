'use client';

import React, { useEffect, useState } from 'react';
import { Music, Flame, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface MarqueeItem {
  id: string;
  text: string;
  icon: React.ElementType;
}

export default function HeaderMarquee() {
  const supabase = createClient();
  const [items, setItems] = useState<MarqueeItem[]>([]);

  useEffect(() => {
    async function loadMarqueeData() {
      try {
        const { data: latestSongs } = await supabase
          .from('songs')
          .select('id, title, artist')
          .order('created_at', { ascending: false })
          .limit(4);

        if (latestSongs && latestSongs.length > 0) {
          const marqueeList: MarqueeItem[] = latestSongs.map((s) => ({
            id: s.id,
            text: `Bài hát mới: ${s.title} (${typeof s.artist === 'string' ? s.artist : 'Laptune'}) vừa được cập nhật`,
            icon: Music,
          }));

          marqueeList.push({
            id: 'brand-banner',
            text: 'Chào mừng bạn đến với LAPTUNE — Nền tảng nghe nhạc trực tuyến chất lượng cao',
            icon: Sparkles,
          });

          setItems(marqueeList);
        } else {
          setItems([
            {
              id: 'welcome-1',
              text: 'Chào mừng bạn đến với LAPTUNE — Nền tảng nghe nhạc trực tuyến chất lượng cao',
              icon: Sparkles,
            },
            {
              id: 'welcome-2',
              text: 'Âm thanh chuẩn Lossless • Không quảng cáo • Tự do trải nghiệm',
              icon: Flame,
            },
          ]);
        }
      } catch {
        setItems([
          {
            id: 'welcome-fallback',
            text: 'LAPTUNE — Nền tảng âm nhạc trực tuyến độc quyền',
            icon: Sparkles,
          },
        ]);
      }
    }
    loadMarqueeData();
  }, [supabase]);

  if (items.length === 0) return null;

  return (
    <div
      aria-label="Thông báo cập nhật trực tiếp"
      className="hidden md:flex items-center flex-1 max-w-xl mx-4 relative overflow-hidden select-none py-1 group"
    >
      <style>{`
        @keyframes headerMarqueeLoop {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
        .header-marquee-track {
          display: flex;
          width: max-content;
          will-change: transform;
          animation: headerMarqueeLoop 25s linear infinite;
        }
        .header-marquee-track:hover {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .header-marquee-track {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* Edge Fade Masks */}
      <div className="absolute left-0 inset-y-0 w-8 bg-gradient-to-r from-[#100a1c] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 inset-y-0 w-8 bg-gradient-to-l from-[#100a1c] to-transparent z-10 pointer-events-none" />

      {/* Marquee Track */}
      <div className="header-marquee-track">
        {/* Bản chính */}
        <div className="flex items-center shrink-0">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={`primary-${item.id}`}
                className="flex items-center gap-2 px-5 text-xs text-purple-200/90 hover:text-white transition-colors"
              >
                <Icon className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="font-medium whitespace-nowrap">{item.text}</span>
                <span className="text-purple-600/60 ml-3">•</span>
              </div>
            );
          })}
        </div>

        {/* Bản sao nhân đôi (Exactly-duplicated content) */}
        <div aria-hidden="true" className="flex items-center shrink-0">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={`secondary-${item.id}`}
                className="flex items-center gap-2 px-5 text-xs text-purple-200/90 hover:text-white transition-colors"
              >
                <Icon className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="font-medium whitespace-nowrap">{item.text}</span>
                <span className="text-purple-600/60 ml-3">•</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
