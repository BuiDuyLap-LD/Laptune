'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Music,
  Plus,
  Search,
  Play,
  Pause,
  Trash2,
  Eye,
  EyeOff,
  Headphones,
} from 'lucide-react';
import { formatDuration, getSongArtistName, getSongGenreName } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { Song } from '@/types/database';

export default function AdminSongsPage() {
  const supabase = createClient();
  const [songs, setSongs] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSongs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        setSongs(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSongs();

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

  // Toggle Play / Pause preview
  const handlePlayPreview = (song: Song) => {
    if (currentPlayingId === song.id) {
      audioElement?.pause();
      setCurrentPlayingId(null);
    } else {
      if (audioElement) {
        audioElement.pause();
      }
      const audio = new Audio(song.audio_url);
      audio.play().catch(() => {});
      audio.onended = () => setCurrentPlayingId(null);
      setAudioElement(audio);
      setCurrentPlayingId(song.id);
    }
  };

  // Toggle Published Status trong Supabase
  const togglePublish = async (id: string, currentStatus: boolean | undefined) => {
    const nextStatus = !currentStatus;
    setSongs(prev =>
      prev.map(song =>
        song.id === id ? { ...song, is_published: nextStatus } : song
      )
    );
    try {
      await supabase.from('songs').update({ is_published: nextStatus }).eq('id', id);
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Song trong Supabase
  const handleDeleteSong = async (id: string, title: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa bài hát "${title}" khỏi hệ thống?`)) {
      setSongs(prev => prev.filter(s => s.id !== id));
      if (currentPlayingId === id) {
        audioElement?.pause();
        setCurrentPlayingId(null);
      }
      try {
        await supabase.from('songs').delete().eq('id', id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredSongs = songs.filter(song => {
    const artistName = getSongArtistName(song);
    const genreName = getSongGenreName(song);
    const matchesSearch =
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artistName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'ALL' || genreName.includes(selectedGenre);
    const matchesStatus =
      selectedStatus === 'ALL' ||
      (selectedStatus === 'PUBLISHED' && song.is_published !== false) ||
      (selectedStatus === 'DRAFT' && song.is_published === false);

    return matchesSearch && matchesGenre && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header with Breadcrumb & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Music className="w-7 h-7 text-purple-400" />
            <span>Kho bài hát độc quyền</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Tổng cộng {songs.length} bài hát trong cơ sở dữ liệu Supabase
          </p>
        </div>

        <Link
          href="/admin/songs/upload"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tải bài hát mới (Max 50MB)</span>
        </Link>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#140c26]/80 border border-purple-900/30 backdrop-blur-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên bài hát hoặc nghệ sĩ..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#180f2f] border border-purple-900/40 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#180f2f] border border-purple-900/40 text-xs text-zinc-300 focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="ALL">Tất cả thể loại</option>
            <option value="Nhạc Trẻ">Nhạc Trẻ / Pop</option>
            <option value="V-Pop">V-Pop</option>
            <option value="Ballad">Ballad / R&B</option>
            <option value="Rap">Rap / Hip-Hop</option>
            <option value="EDM">EDM / Remix</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#180f2f] border border-purple-900/40 text-xs text-zinc-300 focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PUBLISHED">Đang phát hành</option>
            <option value="DRAFT">Bản nháp</option>
          </select>
        </div>
      </div>

      {/* 3. Songs Data Table */}
      <div className="rounded-2xl border border-purple-900/30 bg-[#140c26]/80 backdrop-blur-md overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#180f30] text-zinc-400 uppercase font-semibold border-b border-purple-900/30 tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">Phát</th>
                <th className="py-3.5 px-4">Bài hát & Nghệ sĩ</th>
                <th className="py-3.5 px-4">Thể loại</th>
                <th className="py-3.5 px-4">Thời lượng</th>
                <th className="py-3.5 px-4">Lượt nghe</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-900/20">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    Đang tải danh sách bài hát từ Supabase...
                  </td>
                </tr>
              ) : filteredSongs.length > 0 ? (
                filteredSongs.map((song) => {
                  const isPlaying = currentPlayingId === song.id;

                  return (
                    <tr
                      key={song.id}
                      className="hover:bg-purple-950/20 transition-colors group"
                    >
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handlePlayPreview(song)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ${
                            isPlaying
                              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/40 animate-pulse'
                              : 'bg-purple-900/30 text-purple-300 hover:bg-purple-600 hover:text-white'
                          }`}
                          title={isPlaying ? 'Tạm dừng nghe thử' : 'Nghe thử'}
                        >
                          {isPlaying ? (
                            <Pause className="w-3.5 h-3.5 fill-current" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {song.cover_url ? (
                            <img
                              src={song.cover_url}
                              alt={song.title}
                              className="w-10 h-10 rounded-lg object-cover border border-purple-900/30 shadow-sm shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-purple-950/40 border border-purple-900/30 flex items-center justify-center text-purple-400 shrink-0">
                              <Music className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-white text-sm truncate group-hover:text-purple-300 transition-colors">
                              {song.title}
                            </div>
                            <div className="text-zinc-400 text-xs truncate">
                              {getSongArtistName(song)}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-md bg-purple-950/60 text-purple-300 border border-purple-800/40 font-medium">
                          {getSongGenreName(song)}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-zinc-300">
                        {formatDuration(song.duration)}
                      </td>

                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1.5 text-zinc-300 font-semibold">
                          <Headphones className="w-3.5 h-3.5 text-purple-400" />
                          {song.play_count?.toLocaleString() || 0}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => togglePublish(song.id, song.is_published)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border cursor-pointer transition-colors ${
                            song.is_published !== false
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-zinc-800/80 text-zinc-400 border-zinc-700 hover:bg-zinc-800'
                          }`}
                          title="Bấm để đổi trạng thái phát hành"
                        >
                          {song.is_published !== false ? (
                            <>
                              <Eye className="w-3 h-3 text-emerald-400" />
                              <span>Đang phát hành</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 text-zinc-400" />
                              <span>Bản nháp</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteSong(song.id, song.title)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Xóa bài hát"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    Chưa có bài hát nào trong cơ sở dữ liệu. Nhấn &ldquo;Tải bài hát mới&rdquo; để thêm bài hát.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
