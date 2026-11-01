import { Song } from './database';

export type RepeatMode = 'off' | 'all' | 'one';

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  seekTime: number | null;
  volume: number; // 0 -> 1
  isMuted: boolean;
  queue: Song[];
  queueIndex: number;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  isFullscreen: boolean;

  // Actions
  playSong: (song: Song, queue?: Song[]) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  nextSong: () => void;
  prevSong: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setQueue: (queue: Song[]) => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setIsFullscreen: (isOpen: boolean) => void;
  incrementCurrentSongPlayCount: () => void;
}

