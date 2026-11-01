'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Play, Heart, Clock3, Disc, Music2, ArrowLeft, Trash2, ListPlus } from 'lucide-react';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { createClient } from '@/lib/supabase/client';
import { Playlist, Song } from '@/types/database';
import { formatDuration, getSongArtistName } from '@/lib/utils';

export default function PlaylistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { playSong } = usePlayerStore();
  const {
    isFavorite,
    toggleFavorite,
    openAddToPlaylistModal,
    removeSongFromPlaylist,
  } = useLibraryStore();
  const supabase = createClient();

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function loadPlaylistData() {
      setIsLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) setCurrentUserId(user.id);

        if (resolvedParams.id.startsWith('guest_pl_')) {
          // Playlist khách trên localStorage
          if (typeof window !== 'undefined') {
            try {
              const rawPls = localStorage.getItem('laptune_guest_playlists');
              if (rawPls) {
                const pls: Playlist[] = JSON.parse(rawPls);
                const found = pls.find((p) => p.id === resolvedParams.id);
                if (found) setPlaylist(found);
              }
              const rawSongs = localStorage.getItem(`laptune_guest_ps_${resolvedParams.id}`);
              if (rawSongs) {
                setSongs(JSON.parse(rawSongs));
              }
            } catch {}
          }
        } else {
          // Playlist Supabase
          const { data: plData } = await supabase
            .from('playlists')
            .select('*')
            .eq('id', resolvedParams.id)
            .single();

          if (plData) {
            setPlaylist(plData);

            // Tải danh sách bài hát trong playlist qua bảng playlist_songs
            const { data: psData } = await supabase
              .from('playlist_songs')
              .select('song_id, songs(*)')
              .eq('playlist_id', resolvedParams.id)
              .order('created_at', { ascending: true });

            if (psData) {
              const list = psData
                .map((ps: any) => ps.songs)
                .filter((s): s is Song => Boolean(s && s.id));
              setSongs(list);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadPlaylistData();
  }, [resolvedParams.id, supabase]);

  const handleRemoveSong = async (songId: string, songTitle: string) => {
    if (confirm(`Bạn có chắc muốn xóa "${songTitle}" khỏi playlist này?`)) {
      await removeSongFromPlaylist(resolvedParams.id, songId);
      setSongs((prev) => prev.filter((s) => s.id !== songId));
    }
  };

  if (isLoading) {
    return <div className="p-12 text-center text-xs text-zinc-500">Đang tải danh sách phát...</div>;
  }

  if (!playlist) {
    return (
      <div className="p-12 text-center space-y-4 max-w-md mx-auto">
        <Disc className="w-12 h-12 text-purple-400/50 mx-auto" />
        <h2 className="text-xl font-bold text-white">Không tìm thấy Playlist</h2>
        <p className="text-xs text-zinc-400">Danh sách phát này không tồn tại hoặc đã bị gỡ bỏ.</p>
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300">
          <ArrowLeft className="w-4 h-4" />
          <span>Về trang chủ</span>
        </Link>
      </div>
    );
  }

  const isOwner =
    resolvedParams.id.startsWith('guest_pl_') ||
    (playlist.user_id && currentUserId && playlist.user_id === currentUserId);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 select-none max-w-5xl mx-auto">
      {/* Header Playlist */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 pb-6 border-b border-purple-900/30">
        <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-3xl overflow-hidden shadow-2xl shrink-0 border border-purple-800/40 bg-[#140c26]">
          {playlist.cover_url ? (
            <img
              src={playlist.cover_url}
              alt={playlist.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-purple-400 bg-gradient-to-br from-purple-900/40 to-pink-900/20">
              <Disc className="w-16 h-16" />
            </div>
          )}
        </div>

        <div className="space-y-3 text-center md:text-left flex-1 min-w-0">
          <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-800/40">
            {playlist.is_official ? 'Playlist Tuyển Chọn' : 'Playlist Cá Nhân'}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight line-clamp-2">
            {playlist.title}
          </h1>
          {playlist.description && (
            <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 leading-relaxed">
              {playlist.description}
            </p>
          )}

          <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-4">
            {songs.length > 0 && (
              <button
                type="button"
                onClick={() => playSong(songs[0], songs)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Phát tất cả</span>
              </button>
            )}
            <span className="text-xs text-zinc-400">
              {songs.length} bài hát
            </span>
          </div>
        </div>
      </div>

      {/* Danh sách bài hát */}
      <div className="space-y-2">
        <div className="grid grid-cols-12 py-2 px-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider border-b border-purple-900/20">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-7 sm:col-span-8">Bài hát</div>
          <div className="col-span-4 sm:col-span-3 text-right flex items-center justify-end gap-1">
            <Clock3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Thời lượng</span>
          </div>
        </div>

        {songs.length > 0 ? (
          songs.map((song, index) => {
            const isFav = isFavorite(song.id);

            return (
              <div
                key={song.id}
                className="grid grid-cols-12 items-center py-3 px-4 rounded-xl hover:bg-purple-950/20 transition-colors group text-xs"
              >
                <div
                  onClick={() => playSong(song, songs)}
                  className="col-span-1 text-center font-bold text-zinc-500 group-hover:text-purple-400 cursor-pointer"
                >
                  {index + 1}
                </div>

                <div
                  onClick={() => playSong(song, songs)}
                  className="col-span-7 sm:col-span-8 flex items-center gap-3 min-w-0 pr-2 cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg overflow-hidden bg-[#18112a] shrink-0">
                    {song.cover_url ? (
                      <img
                        src={song.cover_url}
                        alt={song.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-purple-400">
                        <Music2 className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-white group-hover:text-purple-300 truncate">
                      {song.title}
                    </div>
                    <div className="text-[11px] text-zinc-400 truncate">
                      {getSongArtistName(song)}
                    </div>
                  </div>
                </div>

                <div className="col-span-4 sm:col-span-3 flex items-center justify-end gap-2.5 font-mono text-zinc-400">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openAddToPlaylistModal(song);
                    }}
                    title="Thêm vào playlist khác"
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-purple-300 hover:bg-purple-900/30 transition-colors cursor-pointer"
                  >
                    <ListPlus className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(song);
                    }}
                    title={isFav ? 'Bỏ yêu thích' : 'Yêu thích'}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-pink-400 transition-colors cursor-pointer"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-pink-500 text-pink-500' : ''}`} />
                  </button>

                  {isOwner && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveSong(song.id, song.title);
                      }}
                      title="Xóa bài hát khỏi playlist này"
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-pink-400 hover:bg-pink-900/20 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <span className="text-xs min-w-[36px] text-right">
                    {formatDuration(song.duration)}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center rounded-2xl border border-dashed border-purple-900/40 bg-[#140c26]/40 text-xs text-zinc-500 space-y-3">
            <Disc className="w-8 h-8 text-purple-400/40 mx-auto" />
            <p>Danh sách phát này chưa có bài hát nào.</p>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-medium"
            >
              Khám phá bài hát để thêm vào →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
