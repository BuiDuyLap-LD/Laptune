import { create } from 'zustand';
import { PlayerState, RepeatMode } from '@/types/player';
import { Song } from '@/types/database';

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  seekTime: null,
  volume: 0.8,
  isMuted: false,
  queue: [],
  queueIndex: -1,
  repeatMode: 'off',
  isShuffle: false,
  isFullscreen: false,

  playSong: (song: Song, queue?: Song[]) => {
    const currentQueue = queue || get().queue;
    let nextIndex = currentQueue.findIndex((s) => s.id === song.id);

    let updatedQueue = currentQueue;
    if (nextIndex === -1) {
      updatedQueue = [song, ...currentQueue];
      nextIndex = 0;
    }

    set({
      currentSong: song,
      queue: updatedQueue,
      queueIndex: nextIndex,
      isPlaying: true,
      currentTime: 0,
    });
  },

  togglePlay: () => {
    const { currentSong, isPlaying } = get();
    if (!currentSong) return;
    set({ isPlaying: !isPlaying });
  },

  pause: () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),

  nextSong: () => {
    const { queue, queueIndex, isShuffle, repeatMode } = get();
    if (queue.length === 0) return;

    if (repeatMode === 'one') {
      set({ currentTime: 0, isPlaying: true });
      return;
    }

    let nextIdx = queueIndex + 1;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else if (nextIdx >= queue.length) {
      if (repeatMode === 'all') {
        nextIdx = 0;
      } else {
        set({ isPlaying: false });
        return;
      }
    }

    const nextSong = queue[nextIdx];
    if (nextSong) {
      set({
        currentSong: nextSong,
        queueIndex: nextIdx,
        isPlaying: true,
        currentTime: 0,
      });
    }
  },

  prevSong: () => {
    const { queue, queueIndex, currentTime } = get();
    if (queue.length === 0) return;

    // Nếu đã nghe > 3 giây thì ấn prev sẽ replay lại bài hiện tại
    if (currentTime > 3) {
      set({ currentTime: 0 });
      return;
    }

    const prevIdx = queueIndex > 0 ? queueIndex - 1 : queue.length - 1;
    const prevSong = queue[prevIdx];
    if (prevSong) {
      set({
        currentSong: prevSong,
        queueIndex: prevIdx,
        isPlaying: true,
        currentTime: 0,
      });
    }
  },

  seekTo: (time: number) => set({ seekTime: time, currentTime: time }),
  setVolume: (volume: number) => set({ volume, isMuted: volume === 0 }),
  toggleMute: () => {
    const { isMuted, volume } = get();
    set({ isMuted: !isMuted, volume: isMuted ? (volume === 0 ? 0.8 : volume) : 0 });
  },

  toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),

  toggleRepeat: () => {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const currentIdx = modes.indexOf(get().repeatMode);
    const nextMode = modes[(currentIdx + 1) % modes.length];
    set({ repeatMode: nextMode });
  },

  setQueue: (queue: Song[]) => set({ queue }),
  addToQueue: (song: Song) => {
    const { queue } = get();
    if (!queue.find((s) => s.id === song.id)) {
      set({ queue: [...queue, song] });
    }
  },
  removeFromQueue: (index: number) => {
    const { queue, queueIndex } = get();
    const newQueue = queue.filter((_, i) => i !== index);
    let newIndex = queueIndex;
    if (index < queueIndex) {
      newIndex--;
    }
    set({ queue: newQueue, queueIndex: newIndex });
  },

  setCurrentTime: (time: number) => set({ currentTime: time }),
  setDuration: (duration: number) => set({ duration }),
  setIsFullscreen: (isOpen: boolean) => set({ isFullscreen: isOpen }),

  incrementCurrentSongPlayCount: () => {
    const { currentSong, queue, queueIndex } = get();
    if (!currentSong) return;
    const nextCount = (Number(currentSong.play_count) || 0) + 1;
    const updatedSong = {
      ...currentSong,
      play_count: nextCount,
    };
    const updatedQueue = [...queue];
    if (queueIndex >= 0 && queueIndex < queue.length) {
      updatedQueue[queueIndex] = updatedSong;
    }
    set({
      currentSong: updatedSong,
      queue: updatedQueue,
    });
  },
}));

