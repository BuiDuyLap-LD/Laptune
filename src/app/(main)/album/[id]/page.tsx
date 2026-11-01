'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Play, Clock3, Disc, Music2, ArrowLeft, Calendar, Heart, ListPlus } from 'lucide-react';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { createClient } from '@/lib/supabase/client';
import { Album, Song } from '@/types/database';
import { formatDuration, getSongArtistName } from '@/lib/utils';

export default function AlbumDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { playSong } = usePlayerStore();
  const { isFavorite, toggleFavorite, openAddToPlaylistModal } = useLibraryStore();
  const supabase = createClient();

  const [album, setAlbum] = useState<Album | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAlbumData() {
      setIsLoading(true);
      try {
        const { data: albData } = await supabase
          .from('albums')
          .select('*')
          .eq('id', resolvedParams.id)
          .single();

        if (albData) {
          setAlbum(albData);

          const { data: songsData } = await supabase
            .from('songs')
            .select('*')
            .or(`album_id.eq.${resolvedParams.id},album.eq.${albData.title}`)
            .order('created_at', { ascending: true });

          if (songsData) {
            setSongs(songsData);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadAlbumData();
  }, [resolvedParams.id, supabase]);

  if (isLoading) {
    return <div className="p-12 text-center text-xs text-zinc-500">Đang tải album...</div>;
  }

  if (!album) {
    return (
      <div className="p-12 text-center space-y-4 max-w-md mx-auto">
        <Disc className="w-12 h-12 text-purple-400/50 mx-auto" />
        <h2 className="text-xl font-bold text-white">Không tìm thấy Album</h2>
        <p className="text-xs text-zinc-400">Album này không tồn tại hoặc đã bị gỡ bỏ.</p>
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300">
          <ArrowLeft className="w-4 h-4" />
          <span>Về trang chủ</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 select-none max-w-5xl mx-auto">
      {/* Header Album */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 pb-6 border-b border-purple-900/30">
        <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl overflow-hidden shadow-2xl shrink-0 border border-purple-800/40 bg-[#140c26]">
          {album.cover_url ? (
            <img
              src={album.cover_url}
              alt={album.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-purple-400">
              <Disc className="w-16 h-16" />
            </div>
          )}
        </div>

        <div className="space-y-3 text-center md:text-left flex-1 min-w-0">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-pink-400 px-3 py-1 rounded-full bg-pink-950/60 border border-pink-800/40 flex items-center gap-1">
              <Disc className="w-3.5 h-3.5" />
              Album / EP
            </span>
            {album.release_year && (
              <span className="text-xs text-zinc-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                {album.release_year}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight line-clamp-2">
            {album.title}
          </h1>

          <p className="text-sm font-semibold text-purple-300">
            {album.artist || 'Nhiều nghệ sĩ'}
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-4">
            {songs.length > 0 && (
              <button
                type="button"
                onClick={() => playSong(songs[0], songs)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Phát Album</span>
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
          <div className="col-span-8">Bài hát</div>
          <div className="col-span-3 text-right flex items-center justify-end gap-1">
            <Clock3 className="w-3.5 h-3.5" />
            <span>Thời lượng</span>
          </div>
        </div>

        {songs.length > 0 ? (
          songs.map((song, index) => (
            <div
              key={song.id}
              onClick={() => playSong(song, songs)}
              className="grid grid-cols-12 items-center py-3 px-4 rounded-xl hover:bg-purple-950/20 transition-colors cursor-pointer group text-xs"
            >
              <div className="col-span-1 text-center font-bold text-zinc-500 group-hover:text-purple-400">
                {index + 1}
              </div>
              <div className="col-span-8 flex items-center gap-3 min-w-0 pr-2">
                <div className="w-9 h-9 rounded-lg overflow-hidden bg-[#18112a] shrink-0">
                  {song.cover_url ? (
                    <img src={song.cover_url} alt={song.title} className="w-full h-full object-cover" />
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
              <div className="col-span-3 flex items-center justify-end gap-2 text-right font-mono text-zinc-400">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openAddToPlaylistModal(song);
                  }}
                  title="Thêm vào playlist"
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-purple-300 transition-colors cursor-pointer"
                >
                  <ListPlus className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(song);
                  }}
                  title={isFavorite(song.id) ? 'Bỏ yêu thích' : 'Yêu thích'}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-pink-400 transition-colors cursor-pointer"
                >
                  <Heart className={`w-3.5 h-3.5 ${isFavorite(song.id) ? 'fill-pink-500 text-pink-500' : ''}`} />
                </button>

                <span className="min-w-[36px] text-right">
                  {formatDuration(song.duration)}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-xs text-zinc-500">
            Album này chưa có bài hát nào được gán.
          </div>
        )}
      </div>
    </div>
  );
}
