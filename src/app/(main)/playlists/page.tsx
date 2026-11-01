'use client';

import React from 'react';
import Link from 'next/link';
import { ListMusic, Plus, Trash2, Globe, Lock, Play } from 'lucide-react';
import { useLibraryStore } from '@/stores/useLibraryStore';

export default function PlaylistsPage() {
  const {
    userPlaylists,
    openCreatePlaylistModal,
    deletePlaylist,
    isLoading,
  } = useLibraryStore();

  const handleDelete = async (e: React.MouseEvent, plId: string, title: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`Bạn có chắc chắn muốn xóa playlist "${title}" không?`)) {
      await deletePlaylist(plId);
    }
  };

  return (
    <div className="space-y-8 px-4 sm:px-8 py-6 max-w-6xl mx-auto select-none">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-800/40 via-purple-950/40 to-[#120a22] border border-purple-800/30 p-6 sm:p-8 flex flex-col md:flex-row md:items-end justify-between gap-6 shadow-xl">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
            <ListMusic className="w-3.5 h-3.5" />
            <span>Thư viện cá nhân</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Playlist của tôi
          </h1>
          <p className="text-zinc-300 text-xs sm:text-sm max-w-md leading-relaxed">
            Tự do biên tập và phát triển những danh sách bài hát mang phong cách riêng của bạn.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreatePlaylistModal}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo playlist mới</span>
        </button>
      </div>

      {/* Grid danh sách Playlists */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-zinc-500">Đang tải danh sách playlist...</div>
      ) : userPlaylists.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {userPlaylists.map((pl) => (
            <div
              key={pl.id}
              className="group relative p-3 rounded-2xl bg-[#140c26]/80 hover:bg-[#1a0f33] border border-purple-900/30 hover:border-purple-600/40 transition-all flex flex-col justify-between shadow-lg"
            >
              <Link href={`/playlist/${pl.id}`} className="block">
                <div className="aspect-square rounded-xl overflow-hidden mb-3 bg-[#18112a] relative shadow-inner">
                  {pl.cover_url ? (
                    <img
                      src={pl.cover_url}
                      alt={pl.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-purple-400/80 bg-gradient-to-br from-purple-900/40 to-pink-900/20">
                      <ListMusic className="w-12 h-12" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-purple-300 truncate">
                    {pl.title}
                  </h4>
                  {pl.description && (
                    <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                      {pl.description}
                    </p>
                  )}
                </div>
              </Link>

              <div className="flex items-center justify-between pt-3 mt-2 border-t border-purple-900/20 text-[10px] text-zinc-400">
                <span className="inline-flex items-center gap-1">
                  {pl.is_public ? (
                    <>
                      <Globe className="w-3 h-3 text-cyan-400" />
                      <span>Công khai</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3 text-zinc-500" />
                      <span>Riêng tư</span>
                    </>
                  )}
                </span>

                <button
                  type="button"
                  onClick={(e) => handleDelete(e, pl.id, pl.title)}
                  title="Xóa playlist này"
                  className="p-1 rounded text-zinc-500 hover:text-pink-400 hover:bg-pink-950/40 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-16 text-center rounded-3xl border border-dashed border-purple-900/40 bg-[#140c26]/40 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto">
            <ListMusic className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Chưa có danh sách phát nào</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Tạo danh sách phát đầu tiên của bạn để gom nhóm những giai điệu yêu thích cho từng khoảnh khắc.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreatePlaylistModal}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo playlist đầu tiên</span>
          </button>
        </div>
      )}
    </div>
  );
}

