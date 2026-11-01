'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Music2, Play, Headphones, Heart, ListPlus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Song } from '@/types/database';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { formatDuration, getSongArtistName } from '@/lib/utils';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const supabase = createClient();
  const { playSong } = usePlayerStore();
  const { isFavorite, toggleFavorite, openAddToPlaylistModal } = useLibraryStore();

  const [results, setResults] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function searchSongs() {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const { data } = await supabase
          .from('songs')
          .select('*')
          .or(`title.ilike.%${query}%,artist.ilike.%${query}%`);

        if (data) {
          setResults(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    searchSongs();
  }, [query, supabase]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
          <Search className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Tìm Kiếm Âm Nhạc</h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            {query ? `Kết quả cho từ khóa: "${query}"` : 'Nhập từ khóa để tìm bài hát từ cơ sở dữ liệu'}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-zinc-500">Đang tìm kiếm bài hát...</div>
      ) : query && results.length > 0 ? (
        <div className="rounded-2xl border border-purple-900/30 bg-[#140c26]/80 divide-y divide-purple-900/20 overflow-hidden">
          {results.map((song) => (
            <div
              key={song.id}
              onClick={() => playSong(song, results)}
              className="group flex items-center justify-between p-3.5 hover:bg-purple-950/20 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#18112a] shrink-0">
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
                  <h4 className="text-xs font-semibold text-white group-hover:text-purple-300 truncate">
                    {song.title}
                  </h4>
                  <p className="text-[11px] text-zinc-400 truncate">
                    {getSongArtistName(song)} {song.genre ? `• ${song.genre}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono text-zinc-500">
                <span className="hidden sm:flex items-center gap-1 text-zinc-400">
                  <Headphones className="w-3 h-3 text-purple-400" />
                  {song.play_count?.toLocaleString() || 0}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openAddToPlaylistModal(song);
                  }}
                  title="Thêm vào playlist"
                  className="p-1 rounded text-zinc-500 hover:text-purple-300 transition-colors cursor-pointer"
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
                <span>{formatDuration(song.duration)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : query ? (
        <div className="rounded-xl border border-dashed border-purple-900/30 bg-[#181128]/40 p-12 text-center text-zinc-400 text-sm">
          Không tìm thấy bài hát nào khớp với &ldquo;{query}&rdquo;.
        </div>
      ) : (
        <div className="rounded-xl border border-purple-900/30 bg-[#181128]/60 p-12 text-center text-zinc-400 text-sm">
          Nhập tên bài hát hoặc ca sĩ vào thanh tìm kiếm phía trên để bắt đầu.
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-zinc-500">Đang tải trang tìm kiếm...</div>}>
      <SearchResults />
    </Suspense>
  );
}
