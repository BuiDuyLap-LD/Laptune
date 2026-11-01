export type UserRole = 'admin' | 'user';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at?: string;
}

export interface Artist {
  id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Genre {
  id: string;
  name: string;
  cover_url: string | null;
  color?: string | null;
  created_at: string;
}

export interface Album {
  id: string;
  title: string;
  artist?: string | null;
  artist_id?: string | null;
  cover_url: string | null;
  release_year?: number | null;
  created_at: string;
  artists?: Artist | null;
}

export interface Song {
  id: string;
  title: string;
  artist?: string | Artist | null;
  artist_id?: string | null;
  album?: string | Album | null;
  album_id?: string | null;
  genre?: string | Genre | null;
  genre_id?: string | null;
  mood?: string | null;
  duration?: number | string;
  audio_url: string;
  cover_url: string | null;
  play_count?: number;
  is_published?: boolean;
  is_featured?: boolean;
  created_at: string;
  artists?: Artist | null;
  albums?: Album | null;
  genres?: Genre | null;
}

export interface Playlist {
  id: string;
  user_id?: string | null;
  title: string;
  description?: string | null;
  cover_url: string | null;
  is_official?: boolean;
  is_public?: boolean;
  created_at: string;
  songs_count?: number;
}

export interface PlaylistSong {
  playlist_id: string;
  song_id: string;
  position?: number;
  created_at?: string;
  songs?: Song;
}

export interface Favorite {
  user_id: string;
  song_id: string;
  created_at: string;
  songs?: Song;
}

export interface ListeningHistory {
  id: string;
  user_id: string;
  song_id: string;
  listened_at: string;
  songs?: Song;
}

export interface Feedback {
  id: string;
  user_id?: string | null;
  sender_name?: string | null;
  sender_email?: string | null;
  is_anonymous: boolean;
  category: 'feature' | 'bug' | 'rating' | 'other';
  rating: number;
  title: string;
  content: string;
  status: 'new' | 'reviewed' | 'resolved';
  created_at: string;
}

export type NotificationType = 'system' | 'song' | 'album' | 'playlist' | 'feedback' | 'update';

export interface AppNotification {
  id: string;
  user_id?: string | null;
  title: string;
  content: string;
  type: NotificationType;
  link?: string | null;
  is_read?: boolean;
  created_at: string;
}

