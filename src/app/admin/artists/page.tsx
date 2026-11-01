'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Music,
  Trash2,
  X,
  Sparkles,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Artist } from '@/types/database';

export default function AdminArtistsPage() {
  const supabase = createClient();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // New artist form states
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const loadArtists = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('artists')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        setArtists(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadArtists();
  }, [supabase]);

  const handleCreateArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const newArtistPayload = {
        name: name.trim(),
        bio: bio.trim() || null,
        avatar_url: avatarUrl.trim() || null,
      };

      const { data, error } = await supabase
        .from('artists')
        .insert(newArtistPayload)
        .select()
        .single();

      if (data) {
        setArtists([data, ...artists]);
      } else {
        // Fallback local update
        setArtists([{ id: `temp-${Date.now()}`, ...newArtistPayload, created_at: new Date().toISOString() }, ...artists]);
      }

      setIsModalOpen(false);
      setName('');
      setBio('');
      setAvatarUrl('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteArtist = async (id: string, artistName: string) => {
    if (confirm(`Bạn có chắc muốn xóa nghệ sĩ "${artistName}"?`)) {
      setArtists(prev => prev.filter(a => a.id !== id));
      try {
        await supabase.from('artists').delete().eq('id', id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredArtists = artists.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.bio && a.bio.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-purple-400" />
            <span>Hồ sơ Nghệ sĩ</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Tổng cộng {artists.length} nghệ sĩ trong cơ sở dữ liệu Supabase
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm nghệ sĩ mới</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="p-4 rounded-2xl bg-[#140c26]/80 border border-purple-900/30 backdrop-blur-md">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm nghệ sĩ theo tên hoặc tiểu sử..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#180f2f] border border-purple-900/40 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Artists Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-zinc-500">Đang tải danh sách nghệ sĩ...</div>
      ) : filteredArtists.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredArtists.map((artist) => (
            <div
              key={artist.id}
              className="group relative p-5 rounded-2xl bg-[#140c26]/80 hover:bg-[#180f30] border border-purple-900/30 hover:border-purple-500/40 transition-all duration-200 shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="relative mx-auto w-24 h-24 mb-4">
                  {artist.avatar_url ? (
                    <img
                      src={artist.avatar_url}
                      alt={artist.name}
                      className="w-full h-full rounded-full object-cover border-2 border-purple-500/40 shadow-lg group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-purple-950/40 border-2 border-purple-500/40 flex items-center justify-center text-purple-400 shadow-lg">
                      <Users className="w-8 h-8" />
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <h3 className="font-bold text-white text-base group-hover:text-purple-300 transition-colors">
                    {artist.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed text-center">
                    {artist.bio || 'Chưa có tiểu sử.'}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-purple-900/20 flex items-center justify-between text-xs">
                <span className="text-[11px] text-zinc-500">
                  {new Date(artist.created_at).toLocaleDateString('vi-VN')}
                </span>
                <button
                  onClick={() => handleDeleteArtist(artist.id, artist.name)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="Xóa nghệ sĩ"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-dashed border-purple-900/40 bg-[#140c26]/50 text-xs text-zinc-500">
          Chưa có hồ sơ nghệ sĩ nào trong cơ sở dữ liệu. Nhấn &ldquo;Thêm nghệ sĩ mới&rdquo; để tạo.
        </div>
      )}

      {/* Modal: Thêm Nghệ Sĩ Mới */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#160d2e] border border-purple-500/40 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-purple-900/30">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Thêm hồ sơ nghệ sĩ mới</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-purple-900/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateArtist} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Tên nghệ sĩ / Ca sĩ <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Đen Vâu, Vũ., Hoàng Thùy Linh..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#120824] border border-purple-900/40 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Đường dẫn ảnh đại diện (Avatar URL)
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#120824] border border-purple-900/40 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Tiểu sử tóm tắt
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Giới thiệu phong cách và thành tựu âm nhạc..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#120824] border border-purple-900/40 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-purple-900/30 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all cursor-pointer"
                >
                  Lưu nghệ sĩ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
