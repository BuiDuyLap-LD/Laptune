import { Song } from '@/types/database';

/**
 * Format thời lượng thành chuỗi mm:ss (hỗ trợ cả số giây hoặc chuỗi "mm:ss")
 */
export function formatDuration(duration: number | string | undefined | null): string {
  if (duration === undefined || duration === null) return '00:00';

  if (typeof duration === 'string' && duration.includes(':')) {
    return duration;
  }

  const seconds = typeof duration === 'string' ? parseFloat(duration) : duration;
  if (isNaN(seconds) || seconds < 0) return '00:00';

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const formattedSecs = secs < 10 ? `0${secs}` : `${secs}`;

  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    const formattedMins = remainingMins < 10 ? `0${remainingMins}` : `${remainingMins}`;
    return `${hrs}:${formattedMins}:${formattedSecs}`;
  }

  const formattedMins = mins < 10 ? `0${mins}` : `${mins}`;
  return `${formattedMins}:${formattedSecs}`;
}

/**
 * Chuyển đổi duration dạng string "mm:ss" thành số giây (number)
 */
export function parseDurationToSeconds(duration: number | string | undefined | null): number {
  if (!duration) return 0;
  if (typeof duration === 'number') return duration;
  if (typeof duration === 'string' && duration.includes(':')) {
    const parts = duration.split(':').map(Number);
    if (parts.length === 2) {
      return (parts[0] * 60) + parts[1];
    }
    if (parts.length === 3) {
      return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
    }
  }
  const parsed = parseFloat(duration);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Lấy tên nghệ sĩ thể hiện an toàn từ Song object
 */
export function getSongArtistName(song?: Song | null): string {
  if (!song) return 'Nghệ sĩ';
  if (typeof song.artist === 'string' && song.artist.trim()) return song.artist;
  if (song.artist && typeof song.artist === 'object' && 'name' in song.artist) {
    return song.artist.name;
  }
  if (song.artists?.name) return song.artists.name;
  return 'Nghệ sĩ';
}

/**
 * Lấy tên album an toàn từ Song object
 */
export function getSongAlbumTitle(song?: Song | null): string {
  if (!song) return 'Laptune Release';
  if (typeof song.album === 'string' && song.album.trim()) return song.album;
  if (song.album && typeof song.album === 'object' && 'title' in song.album) {
    return song.album.title;
  }
  if (song.albums?.title) return song.albums.title;
  return 'Laptune Release';
}

/**
 * Lấy tên thể loại an toàn từ Song object
 */
export function getSongGenreName(song?: Song | null): string {
  if (!song) return 'Chưa phân loại';
  if (typeof song.genre === 'string' && song.genre.trim()) return song.genre;
  if (song.genre && typeof song.genre === 'object' && 'name' in song.genre) {
    return song.genre.name;
  }
  if (song.genres?.name) return song.genres.name;
  return 'Chưa phân loại';
}

/**
 * Ghép nối classNames tiện lợi
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
