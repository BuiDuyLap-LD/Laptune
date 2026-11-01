'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Play,
  Sparkles,
  Flame,
  Radio,
  Disc,
  Users,
  Heart,
  Music2,
  Headphones,
  ListPlus,
  Calendar,
} from 'lucide-react';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { createClient } from '@/lib/supabase/client';
import { Song, Playlist, Artist, Album } from '@/types/database';
import { formatDuration, getSongArtistName } from '@/lib/utils';

export default function HomePage() {
  const { playSong, currentSong, isPlaying } = usePlayerStore();
  const { isFavorite, toggleFavorite, openAddToPlaylistModal } = useLibraryStore();
  const supabase = createClient();

  const [songs, setSongs] = useState<Song[]>([]);
  const [featuredSong, setFeaturedSong] = useState<Song | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // 1. Tải danh sách bài hát từ Supabase
        const { data: songsData } = await supabase
          .from('songs')
          .select('*')
          .order('created_at', { ascending: false });

        if (songsData && songsData.length > 0) {
          setSongs(songsData);
          // Chọn bài hát nổi bật (is_featured = true hoặc bài đầu tiên)
          const featured = songsData.find(s => s.is_featured) || songsData[0];
          setFeaturedSong(featured);
        } else {
          setSongs([]);
          setFeaturedSong(null);
        }

        // 2. Tải playlist chính thức
        const { data: playlistsData } = await supabase
          .from('playlists')
          .select('*')
          .eq('is_public', true)
          .limit(6);

        if (playlistsData) {
          setPlaylists(playlistsData);
        }

        // 3. Tải nghệ sĩ
        const { data: artistsData } = await supabase
          .from('artists')
          .select('*')
          .limit(6);

        if (artistsData) {
          setArtists(artistsData);
        }

        // 4. Tải Album & Tuyển tập EP từ Supabase
        const { data: albumsData } = await supabase
          .from('albums')
          .select('*')
          .order('created_at', { ascending: false });

        if (albumsData) {
          setAlbums(albumsData);
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu từ Supabase:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();

    const handleStream = (e: Event) => {
      const customEvent = e as CustomEvent<{ songId: string; play_count: number }>;
      if (!customEvent.detail) return;
      setSongs((prev) =>
        prev.map((s) =>
          s.id === customEvent.detail.songId
            ? { ...s, play_count: (Number(s.play_count) || 0) + 1 }
            : s
        )
      );
    };

    window.addEventListener('laptune-stream-recorded', handleStream);
    return () => window.removeEventListener('laptune-stream-recorded', handleStream);
  }, [supabase]);

  const topSongs = [...songs]
    .sort((a, b) => (Number(b.play_count) || 0) - (Number(a.play_count) || 0))
    .slice(0, 5);

  return (
    <div className="space-y-10 px-4 sm:px-8 py-6">
      {/* 1. Hero Banner: Bài hát nổi bật thực tế từ cơ sở dữ liệu */}
      {featuredSong ? (
        <section aria-label="Bài hát nổi bật" className="relative">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/40 via-purple-950/20 to-transparent border border-purple-800/30 p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl backdrop-blur-sm">
            <div className="relative z-10 max-w-xl space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Nổi bật hôm nay</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white line-clamp-2">
                {featuredSong.title}
              </h1>
              <p className="text-zinc-300 text-sm sm:text-base font-medium">
                {getSongArtistName(featuredSong)} {featuredSong.genre ? `• ${featuredSong.genre}` : ''}
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-4">
                <button
                  onClick={() => playSong(featuredSong, songs)}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Phát ngay</span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleFavorite(featuredSong)}
                  title={isFavorite(featuredSong.id) ? 'Bỏ yêu thích' : 'Yêu thích'}
                  className="p-3 rounded-full bg-purple-900/40 hover:bg-purple-800/50 border border-purple-700/40 text-pink-400 hover:text-pink-300 transition-all cursor-pointer"
                >
                  <Heart className={`w-4 h-4 ${isFavorite(featuredSong.id) ? 'fill-pink-500 text-pink-500' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={() => openAddToPlaylistModal(featuredSong)}
                  title="Thêm vào Playlist"
                  className="p-3 rounded-full bg-purple-900/40 hover:bg-purple-800/50 border border-purple-700/40 text-purple-300 hover:text-purple-200 transition-all cursor-pointer"
                >
                  <ListPlus className="w-4 h-4" />
                </button>
                <div className="text-xs text-zinc-400 flex items-center gap-1.5 font-medium">
                  <Headphones className="w-3.5 h-3.5 text-purple-400" />
                  <span>{featuredSong.play_count?.toLocaleString() || 0} lượt nghe</span>
                </div>
              </div>
            </div>

            {/* Ảnh bìa nổi bật */}
            <div className="relative group shrink-0">
              <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-2xl overflow-hidden shadow-2xl border-2 border-purple-500/30 bg-[#19112a]">
                {featuredSong.cover_url ? (
                  <img
                    src={featuredSong.cover_url}
                    alt={featuredSong.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-purple-950/40 text-purple-400">
                    <Music2 className="w-16 h-16" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      ) : !isLoading && (
        <section className="p-8 rounded-3xl bg-purple-950/20 border border-purple-900/30 text-center space-y-3">
          <Music2 className="w-12 h-12 text-purple-400/60 mx-auto" />
          <h2 className="text-lg font-bold text-white">Chưa có bài hát nào trong cơ sở dữ liệu</h2>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Hệ thống đang kết nối dữ liệu thật từ Supabase. Quản trị viên có thể tải lên các bài hát mới đầu tiên tại trang Admin.
          </p>
        </section>
      )}

      {/* 2. Mới phát hành (Danh sách bài hát thực tế) */}
      <section aria-label="Mới phát hành" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Mới phát hành</h2>
          </div>
          {songs.length > 0 && (
            <span className="text-xs text-zinc-400">{songs.length} bài hát</span>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-purple-950/20 border border-purple-900/20 animate-pulse" />
            ))}
          </div>
        ) : songs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {songs.map((song) => {
              const isCurrent = currentSong?.id === song.id;
              return (
                <div
                  key={song.id}
                  onClick={() => playSong(song, songs)}
                  className={`group flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-purple-900/30 border-purple-500/50 shadow-md shadow-purple-900/20'
                      : 'bg-[#18112a]/50 hover:bg-[#1f1537] border-purple-900/20 hover:border-purple-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-[#120a22]">
                      {song.cover_url ? (
                        <img
                          src={song.cover_url}
                          alt={song.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-purple-400">
                          <Music2 className="w-6 h-6" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Play className="w-5 h-5 text-white fill-current" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <h3 className={`text-xs font-semibold truncate ${isCurrent ? 'text-purple-300' : 'text-white group-hover:text-purple-300'}`}>
                        {song.title}
                      </h3>
                      <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                        {getSongArtistName(song)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 pl-2 shrink-0">
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
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl bg-[#140c26]/40 border border-purple-900/20 text-xs text-zinc-500">
            Chưa có bài hát nào được phát hành.
          </div>
        )}
      </section>

      {/* 3. Bảng xếp hạng Hot (#LaptuneChart) */}
      {topSongs.length > 0 && (
        <section aria-label="Bảng xếp hạng Hot" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-pink-500" />
              <h2 className="text-xl font-bold text-white">#LaptuneChart Hot</h2>
            </div>
            <Link href="/charts" className="text-xs font-medium text-purple-400 hover:text-purple-300">
              Xem tất cả →
            </Link>
          </div>

          <div className="rounded-2xl border border-purple-900/30 bg-[#140c26]/80 backdrop-blur-md divide-y divide-purple-900/20 overflow-hidden">
            {topSongs.map((song, index) => (
              <div
                key={song.id}
                onClick={() => playSong(song, topSongs)}
                className="group flex items-center justify-between px-4 py-3 hover:bg-purple-950/20 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className={`w-5 text-center font-black text-sm ${index === 0 ? 'text-amber-400' : index === 1 ? 'text-cyan-400' : index === 2 ? 'text-pink-400' : 'text-zinc-500'}`}>
                    0{index + 1}
                  </span>
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-[#18112a]">
                    {song.cover_url ? (
                      <img src={song.cover_url} alt={song.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-purple-400">
                        <Music2 className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white group-hover:text-purple-300 truncate">
                      {song.title}
                    </h4>
                    <p className="text-[11px] text-zinc-400 truncate">
                      {getSongArtistName(song)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs shrink-0">
                  <span className="text-zinc-400 flex items-center gap-1">
                    <Headphones className="w-3.5 h-3.5 text-purple-400" />
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
                  <span className="font-mono text-zinc-500">
                    {formatDuration(song.duration)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Tuyển tập Playlist chính thức (Chỉ hiện nếu có trong DB) */}
      {playlists.length > 0 && (
        <section aria-label="Playlist chính thức" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Disc className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-bold text-white">Playlist Tuyển Chọn</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {playlists.map((pl) => (
              <Link
                key={pl.id}
                href={`/playlist/${pl.id}`}
                className="group p-3 rounded-2xl bg-[#140c26]/60 hover:bg-[#1a1130] border border-purple-900/20 hover:border-purple-500/40 transition-all flex flex-col justify-between"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-2.5 bg-[#18112a]">
                  {pl.cover_url ? (
                    <img src={pl.cover_url} alt={pl.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-purple-400">
                      <Disc className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-xs text-white group-hover:text-purple-300 truncate">
                  {pl.title}
                </h3>
                {pl.description && (
                  <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                    {pl.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 5. Nghệ sĩ (Chỉ hiện nếu có trong DB) */}
      {artists.length > 0 && (
        <section aria-label="Nghệ sĩ" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-bold text-white">Nghệ Sĩ Nổi Bật</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {artists.map((artist) => (
              <div key={artist.id} className="group text-center space-y-2">
                <div className="relative mx-auto w-24 h-24 rounded-full overflow-hidden border-2 border-purple-900/40 group-hover:border-purple-400 transition-all bg-[#18112a]">
                  {artist.avatar_url ? (
                    <img src={artist.avatar_url} alt={artist.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-purple-400">
                      <Users className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <h4 className="text-xs font-bold text-white group-hover:text-purple-300 truncate">
                  {artist.name}
                </h4>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. Kho Album & Tuyển Tập EP (Chỉ hiện nếu có trong DB) */}
      {albums.length > 0 && (
        <section aria-label="Kho Album & EP" className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Disc className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Kho Album & Tuyển Tập EP</h2>
                <p className="text-xs text-zinc-400">Các đĩa nhạc và album phát hành chính thức</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-purple-300 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-800/40">
              {albums.length} album
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {albums.map((album) => (
              <Link
                key={album.id}
                href={`/album/${album.id}`}
                className="group relative p-3.5 rounded-2xl bg-[#140c26]/70 hover:bg-[#1a1033] border border-purple-900/30 hover:border-purple-500/40 transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-purple-950/40"
              >
                <div>
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-[#18112a] shadow-inner">
                    {album.cover_url ? (
                      <img
                        src={album.cover_url}
                        alt={album.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-purple-400/80 bg-gradient-to-br from-purple-950/50 to-pink-950/20">
                        <Disc className="w-12 h-12" />
                      </div>
                    )}

                    {/* Năm phát hành */}
                    {album.release_year && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1 border border-white/10">
                        <Calendar className="w-3 h-3 text-purple-400" />
                        <span>{album.release_year}</span>
                      </div>
                    )}

                    {/* Overlay Play khi Hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>

                  <h3 className="font-bold text-xs text-white group-hover:text-purple-300 transition-colors truncate">
                    {album.title}
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5 truncate">
                    {album.artist || 'Nhiều nghệ sĩ'}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-purple-900/20 flex items-center justify-between text-[10px] text-zinc-500 font-medium">
                  <span className="uppercase tracking-wider">Album chính thức</span>
                  <span>{album.release_year || 'Mới'}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
