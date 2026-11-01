'use client';

import React, { useState } from 'react';
import { X, ListMusic, Plus, Check, Music2 } from 'lucide-react';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { getSongArtistName } from '@/lib/utils';

export default function AddToPlaylistModal() {
  const {
    addToPlaylistSong,
    closeAddToPlaylistModal,
    userPlaylists,
    addSongToPlaylist,
    openCreatePlaylistModal,
  } = useLibraryStore();

  const [loadingPlaylistId, setLoadingPlaylistId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ id: string; success: boolean; msg: string } | null>(null);

  if (!addToPlaylistSong) return null;

  const handleAdd = async (playlistId: string) => {
    setLoadingPlaylistId(playlistId);
    setFeedback(null);
    try {
      const res = await addSongToPlaylist(playlistId, addToPlaylistSong);
      setFeedback({ id: playlistId, success: res.success, msg: res.message });
      if (res.success) {
        setTimeout(() => {
          closeAddToPlaylistModal();
          setFeedback(null);
        }, 1200);
      }
    } finally {
      setLoadingPlaylistId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-[#160d29] border border-purple-800/40 p-6 shadow-2xl space-y-5 text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-900/30 pb-4">
          <div>
            <h3 className="text-base font-bold">Thêm vào Playlist</h3>
            <p className="text-xs text-zinc-400">Chọn playlist để lưu bài hát này</p>
          </div>
          <button
            type="button"
            onClick={closeAddToPlaylistModal}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-purple-900/30 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thông tin bài hát đang thêm */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#10081e] border border-purple-900/40">
          <div className="w-11 h-11 rounded-lg overflow-hidden bg-[#18112a] shrink-0">
            {addToPlaylistSong.cover_url ? (
              <img
                src={addToPlaylistSong.cover_url}
                alt={addToPlaylistSong.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-purple-400">
                <Music2 className="w-5 h-5" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-white truncate">{addToPlaylistSong.title}</h4>
            <p className="text-[11px] text-zinc-400 truncate mt-0.5">
              {getSongArtistName(addToPlaylistSong)}
            </p>
          </div>
        </div>

        {/* Thông báo feedback */}
        {feedback && (
          <div
            className={`p-3 rounded-xl text-xs font-medium ${
              feedback.success
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                : 'bg-pink-500/10 border border-pink-500/30 text-pink-300'
            }`}
          >
            {feedback.msg}
          </div>
        )}

        {/* Danh sách Playlists của người dùng */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {userPlaylists.length > 0 ? (
            userPlaylists.map((pl) => {
              const isLoadingThis = loadingPlaylistId === pl.id;
              const isAdded = feedback?.id === pl.id && feedback.success;

              return (
                <div
                  key={pl.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#120a22] hover:bg-purple-950/30 border border-purple-900/30 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-purple-900/30 flex items-center justify-center text-purple-400 shrink-0">
                      <ListMusic className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-white truncate">{pl.title}</h5>
                      <span className="text-[10px] text-zinc-400">
                        {pl.is_public ? 'Công khai' : 'Riêng tư'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAdd(pl.id)}
                    disabled={isLoadingThis || isAdded}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                      isAdded
                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                        : 'bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Đã thêm</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isLoadingThis ? 'Đang thêm...' : 'Thêm vào'}</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center rounded-xl border border-dashed border-purple-900/40 bg-[#10081e] text-xs text-zinc-400 space-y-3">
              <p>Bạn chưa có playlist nào.</p>
              <button
                type="button"
                onClick={() => {
                  closeAddToPlaylistModal();
                  openCreatePlaylistModal();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tạo playlist đầu tiên</span>
              </button>
            </div>
          )}
        </div>

        {/* Nút Tạo playlist mới nếu đã có playlist */}
        {userPlaylists.length > 0 && (
          <div className="pt-2 border-t border-purple-900/30">
            <button
              type="button"
              onClick={() => {
                closeAddToPlaylistModal();
                openCreatePlaylistModal();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#10081e] hover:bg-purple-950/40 border border-purple-900/40 text-xs font-semibold text-purple-300 hover:text-purple-200 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo thêm playlist mới</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

