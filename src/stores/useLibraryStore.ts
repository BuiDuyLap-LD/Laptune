import { create } from 'zustand';
import { Song, Playlist } from '@/types/database';
import { createClient } from '@/lib/supabase/client';

interface LibraryState {
  favorites: Song[];
  favoriteIds: string[];
  userPlaylists: Playlist[];
  isCreatePlaylistOpen: boolean;
  addToPlaylistSong: Song | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  init: () => Promise<void>;
  isFavorite: (songId: string) => boolean;
  toggleFavorite: (song: Song) => Promise<boolean>;
  openCreatePlaylistModal: () => void;
  closeCreatePlaylistModal: () => void;
  createPlaylist: (data: { title: string; description?: string }) => Promise<Playlist | null>;
  deletePlaylist: (playlistId: string) => Promise<boolean>;
  openAddToPlaylistModal: (song: Song) => void;
  closeAddToPlaylistModal: () => void;
  addSongToPlaylist: (playlistId: string, song: Song) => Promise<{ success: boolean; message: string }>;
  removeSongFromPlaylist: (playlistId: string, songId: string) => Promise<boolean>;
}

const GUEST_FAVORITES_KEY = 'laptune_guest_favorites';
const GUEST_PLAYLISTS_KEY = 'laptune_guest_playlists';
const GUEST_PLAYLIST_SONGS_PREFIX = 'laptune_guest_ps_';

export const useLibraryStore = create<LibraryState>((set, get) => ({
  favorites: [],
  favoriteIds: [],
  userPlaylists: [],
  isCreatePlaylistOpen: false,
  addToPlaylistSong: null,
  isLoading: false,
  isInitialized: false,

  init: async () => {
    set({ isLoading: true });
    const supabase = createClient();
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // 1. Tải bài hát yêu thích từ Supabase
        const { data: favs } = await supabase
          .from('favorites')
          .select('song_id, songs(*)')
          .eq('user_id', user.id);

        let remoteFavSongs: Song[] = [];
        if (favs) {
          remoteFavSongs = favs
            .map((f: any) => f.songs)
            .filter((s): s is Song => Boolean(s && s.id));
        }

        // Tải thêm dữ liệu khách lưu tạm nếu có và đồng bộ lên
        let localFavs: Song[] = [];
        if (typeof window !== 'undefined') {
          try {
            const raw = localStorage.getItem(GUEST_FAVORITES_KEY);
            if (raw) localFavs = JSON.parse(raw);
          } catch {}
        }

        const mergedFavMap = new Map<string, Song>();
        remoteFavSongs.forEach((s) => mergedFavMap.set(s.id, s));
        for (const localSong of localFavs) {
          if (!mergedFavMap.has(localSong.id)) {
            mergedFavMap.set(localSong.id, localSong);
            // Sync lên Supabase ngầm
            try {
              await supabase
                .from('favorites')
                .insert({ user_id: user.id, song_id: localSong.id });
            } catch {}
          }
        }
        const finalFavs = Array.from(mergedFavMap.values());

        // 2. Tải Playlist người dùng từ Supabase
        const { data: pls } = await supabase
          .from('playlists')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        set({
          favorites: finalFavs,
          favoriteIds: finalFavs.map((s) => s.id),
          userPlaylists: pls || [],
          isInitialized: true,
        });
      } else {
        // Chế độ khách (Guest) - Đọc từ LocalStorage
        let localFavs: Song[] = [];
        let localPlaylists: Playlist[] = [];
        if (typeof window !== 'undefined') {
          try {
            const rawFavs = localStorage.getItem(GUEST_FAVORITES_KEY);
            if (rawFavs) localFavs = JSON.parse(rawFavs);
            const rawPls = localStorage.getItem(GUEST_PLAYLISTS_KEY);
            if (rawPls) localPlaylists = JSON.parse(rawPls);
          } catch {}
        }
        set({
          favorites: localFavs,
          favoriteIds: localFavs.map((s) => s.id),
          userPlaylists: localPlaylists,
          isInitialized: true,
        });
      }
    } catch (err) {
      console.warn('Lỗi khởi tạo Library store:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  isFavorite: (songId: string) => {
    return get().favoriteIds.includes(songId);
  },

  toggleFavorite: async (song: Song) => {
    const { favorites, favoriteIds } = get();
    const isCurrentlyFav = favoriteIds.includes(song.id);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let newFavorites: Song[];
    let newFavoriteIds: string[];

    if (isCurrentlyFav) {
      newFavorites = favorites.filter((s) => s.id !== song.id);
      newFavoriteIds = favoriteIds.filter((id) => id !== song.id);
    } else {
      newFavorites = [song, ...favorites];
      newFavoriteIds = [song.id, ...favoriteIds];
    }

    set({ favorites: newFavorites, favoriteIds: newFavoriteIds });

    // Lưu vào LocalStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(GUEST_FAVORITES_KEY, JSON.stringify(newFavorites));
      } catch {}
    }

    // Đồng bộ Supabase nếu đã đăng nhập
    if (user) {
      try {
        if (isCurrentlyFav) {
          await supabase
            .from('favorites')
            .delete()
            .eq('user_id', user.id)
            .eq('song_id', song.id);
        } else {
          await supabase
            .from('favorites')
            .insert({ user_id: user.id, song_id: song.id });
        }
      } catch (err) {
        console.warn('Lỗi đồng bộ favorite lên Supabase:', err);
      }
    }

    return !isCurrentlyFav;
  },

  openCreatePlaylistModal: () => set({ isCreatePlaylistOpen: true }),
  closeCreatePlaylistModal: () => set({ isCreatePlaylistOpen: false }),

  createPlaylist: async ({ title, description }) => {
    if (!title.trim()) return null;
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from('playlists')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description?.trim() || null,
          is_official: false,
          is_public: true,
        })
        .select('*')
        .single();

      if (error) {
        console.error('Lỗi tạo playlist Supabase:', error);
        return null;
      }

      set((state) => ({
        userPlaylists: [data, ...state.userPlaylists],
        isCreatePlaylistOpen: false,
      }));
      return data;
    } else {
      // Guest local playlist
      const newPl: Playlist = {
        id: `guest_pl_${Date.now()}`,
        title: title.trim(),
        description: description?.trim() || null,
        cover_url: null,
        is_official: false,
        is_public: true,
        created_at: new Date().toISOString(),
      };

      const updated = [newPl, ...get().userPlaylists];
      set({ userPlaylists: updated, isCreatePlaylistOpen: false });
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(GUEST_PLAYLISTS_KEY, JSON.stringify(updated));
        } catch {}
      }
      return newPl;
    }
  },

  deletePlaylist: async (playlistId: string) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user && !playlistId.startsWith('guest_pl_')) {
      await supabase.from('playlists').delete().eq('id', playlistId);
    }

    const updated = get().userPlaylists.filter((p) => p.id !== playlistId);
    set({ userPlaylists: updated });

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(GUEST_PLAYLISTS_KEY, JSON.stringify(updated));
      } catch {}
    }
    return true;
  },

  openAddToPlaylistModal: (song: Song) => set({ addToPlaylistSong: song }),
  closeAddToPlaylistModal: () => set({ addToPlaylistSong: null }),

  addSongToPlaylist: async (playlistId: string, song: Song) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user && !playlistId.startsWith('guest_pl_')) {
      // Kiểm tra trùng
      const { data: existing } = await supabase
        .from('playlist_songs')
        .select('song_id')
        .eq('playlist_id', playlistId)
        .eq('song_id', song.id)
        .maybeSingle();

      if (existing) {
        return { success: false, message: 'Bài hát đã có trong playlist này rồi!' };
      }

      const { error } = await supabase.from('playlist_songs').insert({
        playlist_id: playlistId,
        song_id: song.id,
      });

      if (error) {
        return { success: false, message: 'Không thể thêm bài hát. Vui lòng thử lại!' };
      }

      return { success: true, message: 'Đã thêm vào danh sách phát thành công!' };
    } else {
      // LocalStorage guest
      if (typeof window !== 'undefined') {
        const key = `${GUEST_PLAYLIST_SONGS_PREFIX}${playlistId}`;
        let songs: Song[] = [];
        try {
          const raw = localStorage.getItem(key);
          if (raw) songs = JSON.parse(raw);
        } catch {}

        if (songs.some((s) => s.id === song.id)) {
          return { success: false, message: 'Bài hát đã có trong playlist này rồi!' };
        }

        songs.push(song);
        localStorage.setItem(key, JSON.stringify(songs));
      }
      return { success: true, message: 'Đã thêm vào danh sách phát thành công!' };
    }
  },

  removeSongFromPlaylist: async (playlistId: string, songId: string) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user && !playlistId.startsWith('guest_pl_')) {
      await supabase
        .from('playlist_songs')
        .delete()
        .eq('playlist_id', playlistId)
        .eq('song_id', songId);
    }

    if (typeof window !== 'undefined') {
      const key = `${GUEST_PLAYLIST_SONGS_PREFIX}${playlistId}`;
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const songs: Song[] = JSON.parse(raw);
          const filtered = songs.filter((s) => s.id !== songId);
          localStorage.setItem(key, JSON.stringify(filtered));
        }
      } catch {}
    }

    return true;
  },
}));
