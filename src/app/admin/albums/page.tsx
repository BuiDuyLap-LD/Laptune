'use client';

import React, { useState, useEffect } from 'react';
import {
  Disc,
  Plus,
  Search,
  Calendar,
  Music,
  Trash2,
  X,
  Sparkles,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Album } from '@/types/database';

export default function AdminAlbumsPage() {
  const supabase = createClient();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [releaseYear, setReleaseYear] = useState<number>(new Date().getFullYear());
  const [coverUrl, setCoverUrl] = useState('');

  const loadAlbums = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('albums')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        setAlbums(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlbums();
  }, [supabase]);

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim()) return;

    try {
      const newAlbumPayload = {
        title: title.trim(),
        artist: artist.trim(),
        release_year: releaseYear || 2026,
        cover_url: coverUrl.trim() || null,
      };

      const { data } = await supabase
        .from('albums')
        .insert(newAlbumPayload)
        .select()
        .single();

      if (data) {
        setAlbums([data, ...albums]);
        // Tự động phát thông báo tới người dùng
        try {
          await supabase.from('notifications').insert({
            title: `Album mới: ${data.title}`,
            content: `Album "${data.title}" của ${data.artist || 'nghệ sĩ'} vừa được phát hành chính thức trên Laptune. Thưởng thức ngay!`,
            type: 'album',
            link: `/album/${data.id}`,
          });
        } catch {}
      } else {
        setAlbums([{ id: `temp-${Date.now()}`, ...newAlbumPayload, created_at: new Date().toISOString() }, ...albums]);
      }

      setIsModalOpen(false);
      setTitle('');
      setArtist('');
      setCoverUrl('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAlbum = async (id: string, albumTitle: string) => {
    if (confirm(`Bạn có chắc muốn xóa album "${albumTitle}"?`)) {
      setAlbums(prev => prev.filter(a => a.id !== id));
      try {
        await supabase.from('albums').delete().eq('id', id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredAlbums = albums.filter(a =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.artist && a.artist.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Disc className="w-7 h-7 text-purple-400" />
            <span>Kho Album & EP</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Tổng cộng {albums.length} album trong cơ sở dữ liệu Supabase
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo album mới</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-[#140c26]/80 border border-purple-900/30 backdrop-blur-md">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên album hoặc nghệ sĩ..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#180f2f] border border-purple-900/40 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Albums Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-zinc-500">Đang tải danh sách album...</div>
      ) : filteredAlbums.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredAlbums.map((album) => (
            <div
              key={album.id}
              className="group p-4 rounded-2xl bg-[#140c26]/80 hover:bg-[#180f30] border border-purple-900/30 hover:border-purple-500/40 transition-all duration-200 shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-square rounded-xl overflow-hidden mb-3.5 shadow-md bg-[#18112a]">
                  {album.cover_url ? (
                    <img
                      src={album.cover_url}
                      alt={album.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-purple-400">
                      <Disc className="w-10 h-10" />
                    </div>
                  )}
                  {album.release_year && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[11px] font-bold text-white flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-purple-400" />
                      <span>{album.release_year}</span>
                    </div>
                  )}
                </div>

                <h3 className="font-bold text-white text-base group-hover:text-purple-300 transition-colors truncate">
                  {album.title}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5 truncate">
                  {album.artist || 'Nhiều nghệ sĩ'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-purple-900/20 flex items-center justify-between text-xs">
                <span className="text-[11px] text-zinc-500">
                  {new Date(album.created_at).toLocaleDateString('vi-VN')}
                </span>

                <button
                  onClick={() => handleDeleteAlbum(album.id, album.title)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="Xóa album"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-dashed border-purple-900/40 bg-[#140c26]/50 text-xs text-zinc-500">
          Chưa có album nào trong cơ sở dữ liệu. Nhấn &ldquo;Tạo album mới&rdquo; để thêm.
        </div>
      )}

      {/* Modal: Tạo Album Mới */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#160d2e] border border-purple-500/40 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-purple-900/30">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Tạo Album / EP mới</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-purple-900/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAlbum} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Tên Album <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Hoàng, DreAMEE, Lớp 12..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#120824] border border-purple-900/40 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Nghệ sĩ phát hành <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="Ví dụ: Hoàng Thùy Linh, AMEE..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#120824] border border-purple-900/40 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Năm phát hành
                </label>
                <input
                  type="number"
                  min={1990}
                  max={2030}
                  value={releaseYear}
                  onChange={(e) => setReleaseYear(parseInt(e.target.value) || 2026)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#120824] border border-purple-900/40 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  URL Ảnh bìa Album
                </label>
                <input
                  type="url"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#120824] border border-purple-900/40 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-purple-500"
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
                  Tạo Album
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
