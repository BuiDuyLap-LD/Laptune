'use client';

import React, { useEffect } from 'react';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Music2,
  Volume2,
  VolumeX,
  ListPlus,
  Disc,
} from 'lucide-react';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { formatDuration, getSongArtistName } from '@/lib/utils';

export default function FullPlayerModal() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    isFullscreen,
    queue,
    queueIndex,
    togglePlay,
    nextSong,
    prevSong,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    setIsFullscreen,
  } = usePlayerStore();

  const { isFavorite, toggleFavorite, openAddToPlaylistModal } = useLibraryStore();

  // Khóa cuộn trang khi mở toàn màn hình
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  // Đóng bằng phím Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, setIsFullscreen]);

  if (!isFullscreen || !currentSong) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isFav = isFavorite(currentSong.id);
  const nextTrack = queueIndex + 1 < queue.length ? queue[queueIndex + 1] : queue[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Trình phát nhạc toàn màn hình"
      className="fixed inset-0 z-50 bg-gradient-to-b from-[#1c1135] via-[#120a22] to-[#0c0617] text-white flex flex-col justify-between p-4 sm:p-8 animate-in slide-in-from-bottom duration-300 select-none overflow-y-auto"
    >
      {/* 1. Header Toolbar */}
      <div className="flex items-center justify-between w-full max-w-lg mx-auto pb-4">
        <button
          type="button"
          onClick={() => setIsFullscreen(false)}
          title="Thu nhỏ trình phát (Esc)"
          className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        <div className="text-center">
          <span className="text-[10px] font-bold tracking-widest text-purple-400 uppercase">
            Đang phát từ Laptune
          </span>
          <p className="text-xs font-semibold text-zinc-300 line-clamp-1">
            {typeof currentSong.album === 'string'
              ? currentSong.album
              : currentSong.album?.title || 'Tuyển tập đặc sắc'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => openAddToPlaylistModal(currentSong)}
          title="Thêm bài hát vào Playlist"
          className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-purple-300 transition-colors cursor-pointer"
        >
          <ListPlus className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Đĩa Vinyl & Ảnh bìa nổi bật */}
      <div className="flex-1 flex flex-col items-center justify-center my-4 max-w-lg mx-auto w-full">
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto">
          {/* Đĩa Vinyl quay phía sau khi phát nhạc */}
          <div
            className={`absolute inset-0 rounded-full bg-[#0a0514] border-4 border-zinc-800 shadow-2xl flex items-center justify-center transition-transform ${
              isPlaying ? 'animate-[spin_12s_linear_infinite]' : ''
            }`}
            style={{
              boxShadow: '0 0 50px rgba(168, 85, 247, 0.25), 0 20px 40px rgba(0,0,0,0.8)',
            }}
          >
            {/* Rãnh đĩa nhựa Vinyl */}
            <div className="w-3/4 h-3/4 rounded-full border border-zinc-800/60" />
            <div className="w-1/2 h-1/2 rounded-full border border-zinc-800/80" />
          </div>

          {/* Ảnh bìa tròn tâm đĩa */}
          <div className="absolute inset-4 rounded-3xl overflow-hidden shadow-2xl border-2 border-purple-500/30 bg-[#160d29]">
            {currentSong.cover_url ? (
              <img
                src={currentSong.cover_url}
                alt={currentSong.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-purple-900 to-pink-900 text-purple-300">
                <Music2 className="w-20 h-20" />
              </div>
            )}
          </div>
        </div>

        {/* Tiêu đề & Nghệ sĩ & Nút Favorite */}
        <div className="w-full flex items-center justify-between gap-4 mt-8 px-2">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight line-clamp-1">
              {currentSong.title}
            </h1>
            <p className="text-sm font-semibold text-purple-300 line-clamp-1 mt-0.5">
              {getSongArtistName(currentSong)}
            </p>
          </div>

          <button
            type="button"
            onClick={() => toggleFavorite(currentSong)}
            title={isFav ? 'Bỏ yêu thích' : 'Yêu thích'}
            className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-transform active:scale-90 cursor-pointer shrink-0"
          >
            <Heart
              className={`w-6 h-6 transition-colors ${
                isFav ? 'fill-pink-500 text-pink-500' : 'text-zinc-400 hover:text-white'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 3. Controls, Timeline Slider & Next track */}
      <div className="w-full max-w-lg mx-auto space-y-5 pb-4">
        {/* Seek Progress Bar */}
        <div className="space-y-1.5">
          <div className="relative h-2 rounded-full bg-white/10 overflow-hidden flex items-center cursor-pointer group">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
            <input
              type="range"
              min="0"
              max="100"
              value={progressPercent || 0}
              onChange={(e) => {
                const time = (parseFloat(e.target.value) / 100) * duration;
                seekTo(time);
              }}
              aria-label="Tua thời gian"
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>{formatDuration(currentTime)}</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-between px-2">
          {/* Nút Shuffle */}
          <button
            type="button"
            onClick={toggleShuffle}
            title="Phát xáo trộn"
            className={`p-2.5 rounded-full transition-colors cursor-pointer ${
              isShuffle ? 'text-purple-400 bg-purple-600/20' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Shuffle className="w-5 h-5" />
          </button>

          {/* Bài trước */}
          <button
            type="button"
            onClick={prevSong}
            title="Bài trước"
            className="p-3 rounded-full text-zinc-200 hover:text-white hover:bg-white/10 transition-transform active:scale-95 cursor-pointer"
          >
            <SkipBack className="w-7 h-7 fill-current" />
          </button>

          {/* Nút Play / Pause khổng lồ */}
          <button
            type="button"
            onClick={togglePlay}
            title={isPlaying ? 'Tạm dừng' : 'Phát'}
            className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-tr from-purple-600 via-pink-600 to-purple-600 hover:scale-105 active:scale-95 transition-all text-white flex items-center justify-center shadow-xl shadow-purple-600/40 cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 fill-current" />
            ) : (
              <Play className="w-8 h-8 fill-current ml-1" />
            )}
          </button>

          {/* Bài kế tiếp */}
          <button
            type="button"
            onClick={nextSong}
            title="Bài kế tiếp"
            className="p-3 rounded-full text-zinc-200 hover:text-white hover:bg-white/10 transition-transform active:scale-95 cursor-pointer"
          >
            <SkipForward className="w-7 h-7 fill-current" />
          </button>

          {/* Lặp lại */}
          <button
            type="button"
            onClick={toggleRepeat}
            title={`Lặp lại: ${repeatMode}`}
            className={`p-2.5 rounded-full transition-colors cursor-pointer ${
              repeatMode !== 'off' ? 'text-purple-400 bg-purple-600/20' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-5 h-5" />
            ) : (
              <Repeat className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Volume Slider */}
        <div className="flex items-center gap-3 px-4 pt-1">
          <button
            type="button"
            onClick={toggleMute}
            className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-pink-400" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            aria-label="Âm lượng"
            className="w-full h-1.5 rounded-full bg-white/10 accent-purple-500 cursor-pointer"
          />
        </div>

        {/* Up Next Mini Banner */}
        {nextTrack && (
          <div
            onClick={nextSong}
            className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-pointer text-xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                Tiếp theo:
              </span>
              <span className="font-semibold text-zinc-200 truncate">{nextTrack.title}</span>
              <span className="text-zinc-400 truncate">• {getSongArtistName(nextTrack)}</span>
            </div>
            <SkipForward className="w-3.5 h-3.5 text-purple-400 shrink-0 ml-2" />
          </div>
        )}
      </div>
    </div>
  );
}

