'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Play, Music2, Clock3, ListPlus, Sparkles, Compass } from 'lucide-react';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { formatDuration, getSongArtistName } from '@/lib/utils';

export default function FavoritesPage() {
  const { playSong, currentSong, isPlaying } = usePlayerStore();
  const {
    favorites,
    isFavorite,
    toggleFavorite,
    openAddToPlaylistModal,
    isLoading,
  } = useLibraryStore();

  return (
    <div className="space-y-8 px-4 sm:px-8 py-6 max-w-6xl mx-auto select-none">
      {/* Banner Yêu thích */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-900/40 via-purple-950/40 to-[#120a22] border border-pink-900/30 p-6 sm:p-8 flex flex-col md:flex-row md:items-end justify-between gap-6 shadow-xl">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 text-xs font-bold">
            <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
            <span>Thư viện cá nhân</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Bài hát yêu thích
          </h1>
          <p className="text-zinc-300 text-xs sm:text-sm max-w-md leading-relaxed">
            Tuyển tập tất cả những ca khúc bạn yêu thích nhất trên hệ thống âm nhạc Laptune.
          </p>

          <div className="pt-2 flex items-center gap-4">
            {favorites.length > 0 && (
              <button
                type="button"
                onClick={() => playSong(favorites[0], favorites)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-pink-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Phát tất cả</span>
              </button>
            )}
            <span className="text-xs text-zinc-400 font-medium">
              {favorites.length} bài hát đã lưu
            </span>
          </div>
        </div>
      </div>

      {/* Danh sách bài hát yêu thích */}
      <div className="rounded-2xl border border-purple-900/30 bg-[#140c26]/80 backdrop-blur-md overflow-hidden">
        <div className="grid grid-cols-12 py-3.5 px-4 text-xs font-semibold text-zinc-400 border-b border-purple-900/20 uppercase tracking-wider">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-7 sm:col-span-8">Bài hát</div>
          <div className="col-span-4 sm:col-span-3 text-right flex items-center justify-end gap-1">
            <Clock3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Thời lượng</span>
          </div>
        </div>

        <div className="divide-y divide-purple-900/10">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-zinc-500">Đang tải bài hát yêu thích...</div>
          ) : favorites.length > 0 ? (
            favorites.map((song, index) => {
              const isCurrent = currentSong?.id === song.id;
              const isFav = isFavorite(song.id);

              return (
                <div
                  key={song.id}
                  className={`grid grid-cols-12 items-center py-3 px-4 hover:bg-purple-950/20 transition-colors group text-xs ${
                    isCurrent ? 'bg-purple-900/20' : ''
                  }`}
                >
                  {/* Số thứ tự hoặc icon phát */}
                  <div
                    onClick={() => playSong(song, favorites)}
                    className="col-span-1 text-center font-bold text-zinc-500 group-hover:text-purple-400 cursor-pointer"
                  >
                    {isCurrent && isPlaying ? (
                      <span className="inline-block w-3.5 h-3.5 text-pink-400 animate-pulse">▶</span>
                    ) : (
                      index + 1
                    )}
                  </div>

                  {/* Chi tiết bài hát */}
                  <div
                    onClick={() => playSong(song, favorites)}
                    className="col-span-7 sm:col-span-8 flex items-center gap-3.5 min-w-0 pr-2 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#18112a] shrink-0 relative">
                      {song.cover_url ? (
                        <img
                          src={song.cover_url}
                          alt={song.title}
                          className="w-full h-full object-cover"
                        />
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
                      <div
                        className={`font-semibold truncate ${
                          isCurrent ? 'text-pink-400' : 'text-white group-hover:text-pink-300'
                        }`}
                      >
                        {song.title}
                      </div>
                      <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                        {getSongArtistName(song)}
                      </div>
                    </div>
                  </div>

                  {/* Hành động & Thời lượng */}
                  <div className="col-span-4 sm:col-span-3 flex items-center justify-end gap-3 font-mono text-zinc-400">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openAddToPlaylistModal(song);
                      }}
                      title="Thêm vào Playlist"
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-purple-300 hover:bg-purple-900/30 transition-colors cursor-pointer"
                    >
                      <ListPlus className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(song);
                      }}
                      title={isFav ? 'Bỏ yêu thích' : 'Yêu thích'}
                      className="p-1.5 rounded-lg text-pink-500 hover:text-pink-400 hover:bg-pink-900/20 transition-colors cursor-pointer"
                    >
                      <Heart className="w-4 h-4 fill-pink-500" />
                    </button>

                    <span className="text-xs min-w-[36px] text-right">
                      {formatDuration(song.duration)}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mx-auto">
                <Heart className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Chưa có bài hát yêu thích</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Hãy nhấn vào biểu tượng trái tim khi đang nghe bài hát bất kỳ để lưu vào danh sách yêu thích của bạn.
                </p>
              </div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-semibold transition-all shadow-lg"
              >
                <Compass className="w-4 h-4" />
                <span>Khám phá bài hát ngay</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

