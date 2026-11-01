'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Library,
  Heart,
  ListMusic,
  History,
  PlusCircle,
  Play,
  Music2,
  Clock3,
  LogIn,
  ListPlus,
  Trash2,
} from 'lucide-react';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { createClient } from '@/lib/supabase/client';
import { Song } from '@/types/database';
import { formatDuration, getSongArtistName } from '@/lib/utils';

function LibraryContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'favorites';
  const [activeTab, setActiveTab] = useState(initialTab);
  const { playSong, currentSong, isPlaying } = usePlayerStore();
  const {
    favorites,
    userPlaylists,
    isFavorite,
    toggleFavorite,
    openCreatePlaylistModal,
    openAddToPlaylistModal,
    deletePlaylist,
  } = useLibraryStore();

  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [historySongs, setHistorySongs] = useState<Song[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Đồng bộ tab từ URL search params khi người dùng click sidebar hoặc chuyển hướng
  useEffect(() => {
    const tab = searchParams?.get('tab');
    if (tab && (tab === 'favorites' || tab === 'playlists' || tab === 'history')) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Kiểm tra user & tải lịch sử nghe
  useEffect(() => {
    async function loadUserAndHistory() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          setIsLoadingHistory(true);
          const { data: hist } = await supabase
            .from('listening_history')
            .select('song_id, songs(*)')
            .eq('user_id', user.id)
            .order('listened_at', { ascending: false })
            .limit(25);

          if (hist) {
            const hList = hist
              .map((h: any) => h.songs)
              .filter((s): s is Song => Boolean(s && s.id));
            setHistorySongs(hList);
          }
        }
      } catch (err) {
        console.warn('Lỗi tải lịch sử:', err);
      } finally {
        setIsLoadingHistory(false);
      }
    }
    loadUserAndHistory();
  }, [supabase]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 select-none max-w-6xl mx-auto">
      {/* Header Thư viện */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Library className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Thư Viện Cá Nhân</h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              Quản lý bài hát yêu thích, playlist riêng và lịch sử nghe nhạc
            </p>
          </div>
        </div>

        {/* Nút hành động nhanh */}
        {activeTab === 'playlists' && (
          <button
            type="button"
            onClick={openCreatePlaylistModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/30 cursor-pointer self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tạo playlist mới</span>
          </button>
        )}
      </div>

      {/* Thông báo nếu chưa đăng nhập */}
      {!user && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 to-[#160d29] border border-purple-800/40 text-xs">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <LogIn className="w-5 h-5 text-purple-400 shrink-0" />
            <span className="text-zinc-300">
              Bạn đang ở chế độ khách. Đăng nhập để tự động sao lưu playlist và bài hát yêu thích lên đám mây vĩnh viễn.
            </span>
          </div>
          <Link
            href="/login"
            className="px-4 py-1.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-semibold shrink-0 transition-colors"
          >
            Đăng nhập ngay
          </Link>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-purple-900/30 pb-3">
        {[
          { id: 'favorites', label: 'Bài hát yêu thích', icon: Heart, count: favorites.length },
          { id: 'playlists', label: 'Playlist của tôi', icon: ListMusic, count: userPlaylists.length },
          { id: 'history', label: 'Nghe gần đây', icon: History, count: historySongs.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-purple-600/30 text-white border border-purple-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-purple-950/40 border border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-purple-400 fill-purple-400' : ''}`} />
              <span>{tab.label}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-950/80 text-purple-300">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Bài hát yêu thích */}
      {activeTab === 'favorites' && (
        <div className="space-y-3">
          {favorites.length > 0 ? (
            <div className="rounded-2xl border border-purple-900/30 bg-[#140c26]/80 divide-y divide-purple-900/20 overflow-hidden">
              {favorites.map((song) => {
                const isCurrent = currentSong?.id === song.id;
                const isFav = isFavorite(song.id);

                return (
                  <div
                    key={song.id}
                    className={`group flex items-center justify-between p-3.5 hover:bg-purple-950/20 transition-colors ${
                      isCurrent ? 'bg-purple-900/20' : ''
                    }`}
                  >
                    <div
                      onClick={() => playSong(song, favorites)}
                      className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer pr-4"
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
                        <h4
                          className={`text-xs font-semibold truncate ${
                            isCurrent ? 'text-pink-400' : 'text-white group-hover:text-pink-300'
                          }`}
                        >
                          {song.title}
                        </h4>
                        <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                          {getSongArtistName(song)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => openAddToPlaylistModal(song)}
                        title="Thêm vào playlist"
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-purple-300 hover:bg-purple-900/30 transition-colors cursor-pointer"
                      >
                        <ListPlus className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleFavorite(song)}
                        title={isFav ? 'Bỏ yêu thích' : 'Yêu thích'}
                        className="p-1.5 rounded-lg text-pink-500 hover:text-pink-400 hover:bg-pink-900/20 transition-colors cursor-pointer"
                      >
                        <Heart className="w-4 h-4 fill-pink-500" />
                      </button>

                      <span className="text-xs font-mono text-zinc-500 min-w-[36px] text-right">
                        {formatDuration(song.duration)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl border border-dashed border-purple-900/40 bg-[#140c26]/40 text-xs text-zinc-500 space-y-3">
              <Heart className="w-10 h-10 text-pink-400/40 mx-auto" />
              <p>Bạn chưa có bài hát yêu thích nào.</p>
              <Link
                href="/charts"
                className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-medium"
              >
                Khám phá Bảng xếp hạng →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Playlist của tôi */}
      {activeTab === 'playlists' && (
        <div className="space-y-4">
          {userPlaylists.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {userPlaylists.map((pl) => (
                <div
                  key={pl.id}
                  className="group relative p-3 rounded-2xl bg-[#140c26]/80 hover:bg-[#180f30] border border-purple-900/30 transition-all flex flex-col justify-between"
                >
                  <Link href={`/playlist/${pl.id}`} className="block">
                    <div className="aspect-square rounded-xl overflow-hidden mb-2.5 bg-[#18112a] relative">
                      {pl.cover_url ? (
                        <img
                          src={pl.cover_url}
                          alt={pl.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-purple-400 bg-gradient-to-br from-purple-900/40 to-pink-900/20">
                          <ListMusic className="w-10 h-10" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Play className="w-5 h-5 text-white fill-current" />
                      </div>
                    </div>
                    <h4 className="text-xs font-bold text-white group-hover:text-purple-300 truncate">
                      {pl.title}
                    </h4>
                  </Link>

                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-purple-900/20 text-[10px] text-zinc-400">
                    <span>{pl.is_public ? 'Công khai' : 'Riêng tư'}</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Bạn có muốn xóa playlist "${pl.title}" không?`)) {
                          deletePlaylist(pl.id);
                        }
                      }}
                      title="Xóa playlist"
                      className="p-1 rounded text-zinc-500 hover:text-pink-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl border border-dashed border-purple-900/40 bg-[#140c26]/40 text-xs text-zinc-500 space-y-3">
              <ListMusic className="w-10 h-10 text-purple-400/40 mx-auto" />
              <p>Bạn chưa tạo playlist cá nhân nào.</p>
              <button
                type="button"
                onClick={openCreatePlaylistModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-semibold cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Tạo playlist đầu tiên</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Nghe gần đây */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {isLoadingHistory ? (
            <div className="p-8 text-center text-xs text-zinc-500">Đang tải lịch sử...</div>
          ) : historySongs.length > 0 ? (
            <div className="rounded-2xl border border-purple-900/30 bg-[#140c26]/80 divide-y divide-purple-900/20 overflow-hidden">
              {historySongs.map((song) => (
                <div
                  key={song.id}
                  onClick={() => playSong(song, historySongs)}
                  className="group flex items-center justify-between p-3.5 hover:bg-purple-950/20 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#18112a] shrink-0">
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
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-white group-hover:text-purple-300 truncate">
                        {song.title}
                      </h4>
                      <p className="text-[11px] text-zinc-400 truncate">
                        {getSongArtistName(song)}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-zinc-500">
                    {formatDuration(song.duration)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl border border-dashed border-purple-900/40 bg-[#140c26]/40 text-xs text-zinc-500">
              <History className="w-10 h-10 text-purple-400/40 mx-auto mb-2" />
              Lịch sử phát nhạc sẽ tự động xuất hiện ở đây khi bạn nghe nhạc.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function LibraryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-zinc-500">Đang tải thư viện...</div>}>
      <LibraryContent />
    </Suspense>
  );
}
