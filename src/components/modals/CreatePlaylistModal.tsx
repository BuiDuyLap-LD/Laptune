'use client';

import React, { useState } from 'react';
import { X, ListMusic, Plus, Sparkles } from 'lucide-react';
import { useLibraryStore } from '@/stores/useLibraryStore';

export default function CreatePlaylistModal() {
  const { isCreatePlaylistOpen, closeCreatePlaylistModal, createPlaylist } = useLibraryStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isCreatePlaylistOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Vui lòng nhập tên playlist');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const result = await createPlaylist({
        title: title.trim(),
        description: description.trim(),
      });

      if (result) {
        setTitle('');
        setDescription('');
        closeCreatePlaylistModal();
      } else {
        setErrorMsg('Không thể tạo playlist. Vui lòng thử lại!');
      }
    } catch {
      setErrorMsg('Đã xảy ra lỗi ngoài ý muốn.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-[#160d29] border border-purple-800/40 p-6 shadow-2xl space-y-5 text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-900/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <ListMusic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Tạo Playlist mới</h3>
              <p className="text-xs text-zinc-400">Tạo danh sách phát nhạc riêng của bạn</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeCreatePlaylistModal}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-purple-900/30 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notice */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/30 text-xs text-pink-300">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Tên playlist <span className="text-pink-400">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Nhạc Chill Buổi Sáng, Đi Làm..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#10081e] border border-purple-900/50 focus:border-purple-500 focus:outline-none text-xs text-white placeholder-zinc-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Mô tả ngắn <span className="text-zinc-500">(Tùy chọn)</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ghi chú về tâm trạng hoặc chủ đề danh sách này..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#10081e] border border-purple-900/50 focus:border-purple-500 focus:outline-none text-xs text-white placeholder-zinc-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeCreatePlaylistModal}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-purple-950/40 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/30 cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Đang tạo...' : 'Tạo danh sách'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

