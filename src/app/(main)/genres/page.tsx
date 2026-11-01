'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Radio, Music2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const defaultColors = [
  'from-pink-600 to-rose-700',
  'from-purple-600 to-indigo-800',
  'from-amber-600 to-orange-800',
  'from-teal-600 to-emerald-800',
  'from-blue-600 to-cyan-800',
  'from-violet-600 to-fuchsia-800',
];

export default function GenresPage() {
  const router = useRouter();
  const supabase = createClient();
  const [genres, setGenres] = useState<{ id?: string; name: string; color?: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadGenres() {
      setIsLoading(true);
      try {
        // Thử lấy từ bảng genres
        const { data: dbGenres } = await supabase.from('genres').select('*');
        if (dbGenres && dbGenres.length > 0) {
          setGenres(dbGenres);
        } else {
          // Lấy distinct genre từ bảng songs
          const { data: songs } = await supabase.from('songs').select('genre');
          if (songs && songs.length > 0) {
            const uniqueGenres = Array.from(new Set(songs.map(s => typeof s.genre === 'string' ? s.genre : (s.genre as any)?.name).filter(Boolean)));
            setGenres(uniqueGenres.map((g, idx) => ({
              name: g as string,
              color: defaultColors[idx % defaultColors.length],
            })));
          } else {
            setGenres([]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadGenres();
  }, [supabase]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
          <Radio className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Chủ Đề & Thể Loại</h1>
          <p className="text-xs sm:text-sm text-zinc-400">Khám phá âm nhạc theo thể loại thực tế</p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-xs text-zinc-500">Đang tải thể loại âm nhạc...</div>
      ) : genres.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {genres.map((g, index) => (
            <div
              key={g.name || index}
              onClick={() => router.push(`/search?q=${encodeURIComponent(g.name)}`)}
              className={`h-28 rounded-2xl bg-gradient-to-br ${g.color || defaultColors[index % defaultColors.length]} p-4 flex items-end font-bold text-white shadow-lg cursor-pointer hover:scale-[1.02] active:scale-95 transition-all`}
            >
              <span>{g.name}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-[#140c26]/40 border border-purple-900/20 text-xs text-zinc-500">
          <Music2 className="w-10 h-10 text-purple-400/40 mx-auto mb-2" />
          Chưa có thể loại bài hát nào trong cơ sở dữ liệu.
        </div>
      )}
    </div>
  );
}
