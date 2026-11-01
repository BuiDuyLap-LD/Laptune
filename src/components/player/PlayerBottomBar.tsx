'use client';

import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Maximize2,
  Music2,
  ListPlus,
} from 'lucide-react';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { formatDuration, getSongArtistName } from '@/lib/utils';
import VolumeSlider from './VolumeSlider';

export default function PlayerBottomBar() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    isShuffle,
    repeatMode,
    togglePlay,
    nextSong,
    prevSong,
    seekTo,
    toggleShuffle,
    toggleRepeat,
    setIsFullscreen,
  } = usePlayerStore();

  const { isFavorite, toggleFavorite, openAddToPlaylistModal } = useLibraryStore();
  const isFav = currentSong ? isFavorite(currentSong.id) : false;

  // CSS Box-shadow pairs Neumorphism (Soft UI) cho nền Matte #191228
  const raisedShadow =
    '-4px -4px 9px rgba(255, 255, 255, 0.045), 4px 4px 10px rgba(0, 0, 0, 0.7)';
  const pressedShadow =
    'inset -3px -3px 7px rgba(255, 255, 255, 0.04), inset 3px 3px 8px rgba(0, 0, 0, 0.85)';
  const grooveInset =
    'inset -2px -2px 5px rgba(255, 255, 255, 0.03), inset 2px 2px 6px rgba(0, 0, 0, 0.85)';

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = (parseFloat(e.target.value) / 100) * duration;
    seekTo(time);
  };

  const displayTitle = currentSong?.title || 'Chưa phát bài hát';
  const displayArtist = currentSong ? getSongArtistName(currentSong) : 'Chọn một bài hát để bắt đầu';
  const displayCover = currentSong?.cover_url;

  return (
    <aside
      aria-label="Trình phát nhạc"
      className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 h-20 md:h-22 bg-[#191228] px-3 sm:px-6 flex items-center justify-between select-none transition-all motion-reduce:transition-none"
      style={{
        boxShadow: '0 -8px 24px rgba(0, 0, 0, 0.65)',
      }}
    >
      {/* 1. Bên Trái: Thông tin bài hát & Yêu thích */}
      <div className="flex items-center gap-2.5 sm:gap-3 w-auto sm:w-1/4 max-w-[155px] sm:max-w-[280px] shrink-0">
        {/* Khung ảnh thumbnail dạng Neumorphic Raised (Nhấn để mở Full Player) */}
        <div
          onClick={() => currentSong && setIsFullscreen(true)}
          title="Mở trình phát toàn màn hình"
          className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-2xl bg-[#191228] flex items-center justify-center shrink-0 overflow-hidden cursor-pointer active:scale-95 transition-transform"
          style={{ boxShadow: raisedShadow }}
        >
          {displayCover ? (
            <img
              src={displayCover}
              alt={displayTitle}
              className="w-full h-full object-cover rounded-2xl"
            />
          ) : (
            <Music2 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400/80" />
          )}
        </div>

        <div
          onClick={() => currentSong && setIsFullscreen(true)}
          title="Mở trình phát toàn màn hình"
          className="min-w-0 flex-1 cursor-pointer"
        >
          <h4 className="text-xs sm:text-sm font-semibold text-zinc-100 truncate hover:text-purple-300">
            {displayTitle}
          </h4>
          <p className="text-[10px] sm:text-xs text-zinc-400 truncate mt-0.5">
            {displayArtist}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Nút thả tim (Neumorphic Pressed khi đã thích) */}
          <button
            type="button"
            disabled={!currentSong}
            onClick={() => currentSong && toggleFavorite(currentSong)}
            aria-label={isFav ? 'Xóa khỏi bài hát yêu thích' : 'Thêm vào bài hát yêu thích'}
            title={isFav ? 'Đã yêu thích (Bấm để bỏ)' : 'Thêm vào bài hát yêu thích'}
            className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#191228] flex items-center justify-center transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none motion-reduce:transition-none disabled:opacity-40"
            style={{
              boxShadow: isFav ? pressedShadow : raisedShadow,
            }}
          >
            <Heart
              className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-colors ${
                isFav ? 'fill-pink-500 text-pink-500' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            />
          </button>

          {/* Nút thêm vào Playlist */}
          {currentSong && (
            <button
              type="button"
              onClick={() => openAddToPlaylistModal(currentSong)}
              title="Thêm bài này vào playlist"
              aria-label="Thêm bài này vào playlist"
              className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#191228] flex items-center justify-center transition-all cursor-pointer hover:text-purple-300 text-zinc-400 focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none motion-reduce:transition-none"
              style={{ boxShadow: raisedShadow }}
            >
              <ListPlus className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Ở Giữa: Cụm điều khiển chính & Thanh tiến độ (Seek bar) */}
      <div className="flex flex-col items-center justify-center flex-1 max-w-xl px-2 sm:px-6">
        {/* Cụm nút Playback */}
        <div className="flex items-center gap-3 sm:gap-5 mb-1.5">
          {/* Nút Shuffle (Hiện trên tablet & desktop, trên mobile xem ở Full Player) */}
          <button
            type="button"
            onClick={toggleShuffle}
            aria-label="Phát xáo trộn"
            title="Phát xáo trộn"
            className="hidden sm:flex w-8 h-8 rounded-full bg-[#191228] items-center justify-center transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none motion-reduce:transition-none"
            style={{
              boxShadow: isShuffle ? pressedShadow : raisedShadow,
            }}
          >
            <Shuffle
              className={`w-3.5 h-3.5 ${
                isShuffle ? 'text-purple-400' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            />
          </button>

          {/* Nút Previous */}
          <button
            type="button"
            onClick={prevSong}
            aria-label="Bài trước"
            title="Bài trước"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#191228] flex items-center justify-center transition-all active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none motion-reduce:transition-none"
            style={{ boxShadow: raisedShadow }}
          >
            <SkipBack className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-300 hover:text-white" />
          </button>

          {/* Saturated Accent: Nút Play / Pause chính */}
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Tạm dừng' : 'Phát'}
            title={isPlaying ? 'Tạm dừng' : 'Phát'}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-purple-600 via-purple-500 to-pink-500 flex items-center justify-center text-white cursor-pointer active:scale-95 transition-transform motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none shrink-0"
            style={{
              boxShadow:
                '-4px -4px 10px rgba(168, 85, 247, 0.25), 4px 4px 14px rgba(0, 0, 0, 0.75), 0 0 16px rgba(168, 85, 247, 0.4)',
            }}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
            ) : (
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white translate-x-0.5" />
            )}
          </button>

          {/* Nút Next */}
          <button
            type="button"
            onClick={nextSong}
            aria-label="Bài kế tiếp"
            title="Bài kế tiếp"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#191228] flex items-center justify-center transition-all active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none motion-reduce:transition-none"
            style={{ boxShadow: raisedShadow }}
          >
            <SkipForward className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-300 hover:text-white" />
          </button>

          {/* Nút Repeat (Hiện trên tablet & desktop, trên mobile xem ở Full Player) */}
          <button
            type="button"
            onClick={toggleRepeat}
            aria-label="Lặp lại"
            title={`Lặp lại: ${repeatMode}`}
            className="hidden sm:flex w-8 h-8 rounded-full bg-[#191228] items-center justify-center transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none motion-reduce:transition-none"
            style={{
              boxShadow: repeatMode !== 'off' ? pressedShadow : raisedShadow,
            }}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-3.5 h-3.5 text-purple-400" />
            ) : (
              <Repeat
                className={`w-3.5 h-3.5 ${
                  repeatMode === 'all' ? 'text-purple-400' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              />
            )}
          </button>
        </div>

        {/* Thanh Tiến Độ Thời Gian (Neumorphic Inset Groove) */}
        <div className="w-full flex items-center gap-2.5">
          <span className="text-[11px] font-medium text-zinc-400 tabular-nums w-8 text-right">
            {formatDuration(currentTime)}
          </span>

          <div
            className="relative flex-1 h-2 rounded-full bg-[#191228] overflow-hidden flex items-center cursor-pointer group"
            style={{ boxShadow: grooveInset }}
          >
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
            <input
              type="range"
              min="0"
              max="100"
              value={progressPercent || 0}
              onChange={handleSeek}
              aria-label="Tua thời gian bài hát"
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>

          <span className="text-[11px] font-medium text-zinc-500 tabular-nums w-8">
            {formatDuration(duration)}
          </span>
        </div>
      </div>

      {/* 3. Bên Phải: NSSlider Native macOS Volume Slider & Phóng to */}
      <div className="hidden sm:flex items-center justify-end gap-3 w-1/4 min-w-[160px] max-w-[260px]">
        {/* macOS Native Volume Slider (NSSlider with Discrete Tick Marks) */}
        <VolumeSlider numberOfTickMarks={5} allowsTickMarkValuesOnly={false} />

        {/* Nút mở toàn màn hình */}
        <button
          type="button"
          onClick={() => setIsFullscreen(true)}
          aria-label="Mở toàn màn hình"
          title="Mở toàn màn hình"
          className="w-9 h-9 rounded-full bg-[#191228] flex items-center justify-center transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none motion-reduce:transition-none shrink-0"
          style={{ boxShadow: raisedShadow }}
        >
          <Maximize2 className="w-4 h-4 text-zinc-400 hover:text-white" />
        </button>
      </div>
    </aside>
  );
}
