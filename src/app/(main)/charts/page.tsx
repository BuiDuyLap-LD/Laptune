'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp, Flame, Play, Clock3, Music2, Headphones, Heart, ListPlus } from 'lucide-react';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { createClient } from '@/lib/supabase/client';
import { Song } from '@/types/database';
import { formatDuration, getSongArtistName } from '@/lib/utils';

export default function ChartsPage() {
  const { playSong, currentSong } = usePlayerStore();
  const { isFavorite, toggleFavorite, openAddToPlaylistModal } = useLibraryStore();
  const supabase = createClient();
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadChartSongs() {
      setIsLoading(true);
      try {
        const { data } = await supabase
          .from('songs')
          .select('*')
          .order('play_count', { ascending: false });

        if (data) {
          setSongs(data);
        }
      } catch (err) {
        console.error('Lỗi khi tải BXH:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadChartSongs();

    const handleStream = (e: Event) => {
      const customEvent = e as CustomEvent<{ songId: string; play_count: number }>;
      if (!customEvent.detail) return;
      setSongs((prev) =>
        prev
          .map((s) =>
            s.id === customEvent.detail.songId
              ? { ...s, play_count: (Number(s.play_count) || 0) + 1 }
              : s
          )
          .sort((a, b) => (Number(b.play_count) || 0) - (Number(a.play_count) || 0))
      );
    };

    window.addEventListener('laptune-stream-recorded', handleStream);
    return () => window.removeEventListener('laptune-stream-recorded', handleStream);
  }, [supabase]);

  return (
    <div className="space-y-8 px-4 sm:px-8 py-6 max-w-6xl mx-auto">
      {/* Banner BXH */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-800/40 via-purple-950/40 to-[#120a22] border border-purple-800/30 p-6 sm:p-8 flex items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 text-xs font-bold">
            <Flame className="w-3.5 h-3.5" />
            <span>Thời gian thực</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            #LaptuneChart
          </h1>
          <p className="text-zinc-300 text-xs sm:text-sm max-w-md">
            Bảng xếp hạng những ca khúc được yêu thích và nghe nhiều nhất trên hệ thống âm nhạc Laptune.
          </p>
        </div>
      </div>

      {/* Danh sách bài hát trong BXH */}
      <div className="rounded-2xl border border-purple-900/30 bg-[#140c26]/80 backdrop-blur-md overflow-hidden">
        <div className="grid grid-cols-12 py-3.5 px-4 text-xs font-semibold text-zinc-400 border-b border-purple-900/20 uppercase tracking-wider">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-6 sm:col-span-7">Bài hát</div>
          <div className="col-span-3 sm:col-span-2 text-right">Lượt nghe</div>
          <div className="col-span-2 text-right flex items-center justify-end gap-1">
            <Clock3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Thời lượng</span>
          </div>
        </div>

        <div className="divide-y divide-purple-900/10">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-zinc-500">Đang tải bảng xếp hạng...</div>
          ) : songs.length > 0 ? (
            songs.map((song, index) => {
              const isCurrent = currentSong?.id === song.id;
              return (
                <div
                  key={song.id}
                  onClick={() => playSong(song, songs)}
                  className={`grid grid-cols-12 items-center py-3.5 px-4 text-xs transition-colors cursor-pointer group ${
                    isCurrent ? 'bg-purple-900/25' : 'hover:bg-purple-950/20'
                  }`}
                >
                  <div className="col-span-1 text-center">
                    <span className={`font-black text-sm ${
                      index === 0 ? 'text-amber-400' : index === 1 ? 'text-cyan-400' : index === 2 ? 'text-pink-400' : 'text-zinc-500'
                    }`}>
                      {index + 1 < 10 ? `0${index + 1}` : index + 1}
                    </span>
                  </div>

                  <div className="col-span-6 sm:col-span-7 flex items-center gap-3 min-w-0 pr-2">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-[#18112a]">
                      {song.cover_url ? (
                        <img src={song.cover_url} alt={song.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-purple-400">
                          <Music2 className="w-5 h-5" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Play className="w-4 h-4 text-white fill-current" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className={`font-semibold truncate ${isCurrent ? 'text-purple-300' : 'text-white group-hover:text-purple-300'}`}>
                        {song.title}
                      </div>
                      <div className="text-[11px] text-zinc-400 truncate">
                        {getSongArtistName(song)}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-3 sm:col-span-2 text-right font-medium text-zinc-300">
                    <span className="flex items-center justify-end gap-1">
                      <Headphones className="w-3 h-3 text-purple-400" />
                      {song.play_count?.toLocaleString() || 0}
                    </span>
                  </div>

                  <div className="col-span-2 flex items-center justify-end gap-2 text-zinc-400 font-mono">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openAddToPlaylistModal(song);
                      }}
                      title="Thêm vào playlist"
                      className="p-1 rounded hover:text-purple-300 transition-colors cursor-pointer"
                    >
                      <ListPlus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(song);
                      }}
                      title={isFavorite(song.id) ? 'Bỏ thích' : 'Yêu thích'}
                      className="p-1 rounded hover:text-pink-400 transition-colors cursor-pointer"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          isFavorite(song.id) ? 'fill-pink-500 text-pink-500' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      />
                    </button>
                    <span className="hidden sm:inline text-right min-w-[36px]">
                      {formatDuration(song.duration)}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center text-xs text-zinc-500">
              Chưa có dữ liệu bài hát trong bảng xếp hạng.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
