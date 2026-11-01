'use client';

import { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { getSongArtistName, getSongAlbumTitle } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { Song } from '@/types/database';

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasCountedStreamRef = useRef<boolean>(false);
  const accumulatedTimeRef = useRef<number>(0);
  const lastPlayTimeRef = useRef<number>(0);
  const supabase = createClient();

  const {
    currentSong,
    isPlaying,
    volume,
    isMuted,
    repeatMode,
    seekTime,
    nextSong,
    setCurrentTime,
    setDuration,
    incrementCurrentSongPlayCount,
  } = usePlayerStore();

  // Reset biến đếm và cờ khi đổi sang bài hát mới
  useEffect(() => {
    hasCountedStreamRef.current = false;
    accumulatedTimeRef.current = 0;
    lastPlayTimeRef.current = 0;
  }, [currentSong?.id]);

  // Đồng bộ Tua (Seek) chính xác từ UI xuống audio element
  useEffect(() => {
    if (seekTime !== null && audioRef.current) {
      audioRef.current.currentTime = seekTime;
      lastPlayTimeRef.current = seekTime;
      usePlayerStore.setState({ seekTime: null });
    }
  }, [seekTime]);

  // Hàm ghi nhận lượt nghe hợp lệ (Đạt chuẩn công nghiệp 30s của Spotify / Apple Music / Zing MP3)
  const recordValidStream = async (song: Song) => {
    if (hasCountedStreamRef.current) return;
    hasCountedStreamRef.current = true;

    // 1. Tăng ngay lập tức trên Zustand store để giao diện cập nhật mượt mà
    incrementCurrentSongPlayCount();

    // 2. Phát event nội bộ để các màn hình đang mở (Bảng xếp hạng, Quản lý bài hát) tăng số realtime
    const nextCount = (Number(song.play_count) || 0) + 1;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('laptune-stream-recorded', {
          detail: { songId: song.id, play_count: nextCount },
        })
      );
    }

    // 3. Ghi nhận an toàn vào Supabase
    try {
      // Gọi hàm RPC atomic (chống race-condition khi nhiều người nghe cùng lúc)
      const { error: rpcError } = await supabase.rpc('increment_play_count', {
        target_song_id: song.id,
      });

      // Nếu RPC chưa được tạo hoặc gặp lỗi, fallback cập nhật qua UPDATE trực tiếp
      if (rpcError) {
        const { data: latest } = await supabase
          .from('songs')
          .select('play_count')
          .eq('id', song.id)
          .single();

        const actualNext = (Number(latest?.play_count) || Number(song.play_count) || 0) + 1;
        await supabase
          .from('songs')
          .update({ play_count: actualNext })
          .eq('id', song.id);
      }

      // 4. Ghi nhận vào lịch sử nghe nhạc listening_history nếu người dùng đã đăng nhập
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('listening_history').insert({
          user_id: user.id,
          song_id: song.id,
        });
      }
    } catch (err) {
      console.warn('Ghi nhận lượt nghe:', err);
    }
  };

  // Đồng bộ Play / Pause
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Xử lý chặn autoplay của trình duyệt
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentSong]);

  // Đồng bộ Volume & Mute
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Đồng bộ Media Session API (cho màn hình khóa & tai nghe Bluetooth)
  useEffect(() => {
    if ('mediaSession' in navigator && currentSong) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title,
        artist: getSongArtistName(currentSong),
        album: getSongAlbumTitle(currentSong),
        artwork: [
          {
            src: currentSong.cover_url || '/placeholder-album.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      });

      navigator.mediaSession.setActionHandler('play', () => usePlayerStore.getState().resume());
      navigator.mediaSession.setActionHandler('pause', () => usePlayerStore.getState().pause());
      navigator.mediaSession.setActionHandler('previoustrack', () => usePlayerStore.getState().prevSong());
      navigator.mediaSession.setActionHandler('nexttrack', () => usePlayerStore.getState().nextSong());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined && audioRef.current) {
          audioRef.current.currentTime = details.seekTime;
          usePlayerStore.getState().setCurrentTime(details.seekTime);
        }
      });
    }
  }, [currentSong]);

  return (
    <audio
      ref={audioRef}
      src={currentSong?.audio_url}
      onTimeUpdate={() => {
        if (!audioRef.current || !currentSong) return;
        const curTime = audioRef.current.currentTime;
        setCurrentTime(curTime);

        // Chống gian lận bằng cách tua: Chỉ cộng dồn thời gian nghe nếu đang phát tự nhiên (delta < 2s)
        const delta = curTime - lastPlayTimeRef.current;
        lastPlayTimeRef.current = curTime;
        if (delta > 0 && delta < 2.0 && isPlaying) {
          accumulatedTimeRef.current += delta;
        }

        // Quy tắc tính 1 stream hợp lệ theo chuẩn Spotify / Zing MP3:
        // Đạt tối thiểu 30 giây nghe thực tế, hoặc đạt quá 50% thời lượng nếu bài hát ngắn hơn 30s
        const totalDuration = audioRef.current.duration || 60;
        const streamThreshold = Math.min(30, Math.max(5, totalDuration * 0.5));

        if (accumulatedTimeRef.current >= streamThreshold && !hasCountedStreamRef.current) {
          recordValidStream(currentSong);
        }
      }}
      onLoadedMetadata={() => {
        if (audioRef.current) {
          setDuration(audioRef.current.duration);
        }
      }}
      onEnded={() => {
        // Đảm bảo nếu bài hát kết thúc mà chưa kịp chạm ngưỡng (ví dụ bài hát quá ngắn)
        if (currentSong && !hasCountedStreamRef.current) {
          recordValidStream(currentSong);
        }

        if (repeatMode === 'one' && audioRef.current) {
          // Lặp lại bài này: reset lại bộ đếm để lần nghe tiếp theo được tính stream mới
          hasCountedStreamRef.current = false;
          accumulatedTimeRef.current = 0;
          lastPlayTimeRef.current = 0;
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {});
        } else {
          nextSong();
        }
      }}
      preload="auto"
    />
  );
}
