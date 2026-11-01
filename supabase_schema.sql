-- ==============================================================================
-- KỊCH BẢN KHỞI TẠO CƠ SỞ DỮ LIỆU TOÀN DIỆN CHO LAPTUNE TRÊN SUPABASE
-- Tài khoản Admin tối cao duy nhất: buil14955@gmail.com
-- ==============================================================================

-- 0. CẤP QUYỀN SCHEMA & POSTGRES ROLES (BẮT BUỘC ĐỂ SUPABASE REST API TRUY CẬP ĐƯỢC)
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- 1. BẢNG HỒ SƠ NGƯỜI DÙNG (PROFILES)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Trigger tự động đồng bộ khi có người dùng đăng ký hoặc đăng nhập
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    CASE 
      WHEN LOWER(NEW.email) = 'buil14955@gmail.com' THEN 'admin'
      ELSE 'user'
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = CASE 
      WHEN LOWER(EXCLUDED.email) = 'buil14955@gmail.com' THEN 'admin'
      ELSE public.profiles.role
    END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Đồng bộ user hiện có trong auth.users nếu đã đăng ký trước đó
INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', split_part(email, '@', 1)),
  raw_user_meta_data->>'avatar_url',
  CASE WHEN LOWER(email) = 'buil14955@gmail.com' THEN 'admin' ELSE 'user' END
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  role = CASE WHEN LOWER(EXCLUDED.email) = 'buil14955@gmail.com' THEN 'admin' ELSE public.profiles.role END;

-- 2. BẢNG THỂ LOẠI (GENRES)
CREATE TABLE IF NOT EXISTS public.genres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  cover_url TEXT,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. BẢNG NGHỆ SĨ (ARTISTS)
CREATE TABLE IF NOT EXISTS public.artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. BẢNG ALBUM / EP
CREATE TABLE IF NOT EXISTS public.albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT,
  artist_id UUID REFERENCES public.artists(id) ON DELETE SET NULL,
  cover_url TEXT,
  release_year INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. BẢNG BÀI HÁT (SONGS)
CREATE TABLE IF NOT EXISTS public.songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  cover_url TEXT,
  duration TEXT,
  genre TEXT,
  mood TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS artist TEXT;
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS artist_id UUID REFERENCES public.artists(id) ON DELETE SET NULL;
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS album TEXT;
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS album_id UUID REFERENCES public.albums(id) ON DELETE SET NULL;
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS genre TEXT;
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS genre_id UUID REFERENCES public.genres(id) ON DELETE SET NULL;
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS mood TEXT;
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS duration TEXT;
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS audio_url TEXT;
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS cover_url TEXT;
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS play_count BIGINT DEFAULT 0;
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- 6. BẢNG PLAYLIST (DANH SÁCH PHÁT)
CREATE TABLE IF NOT EXISTS public.playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  is_official BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.playlists ADD COLUMN IF NOT EXISTS is_official BOOLEAN DEFAULT false;
ALTER TABLE public.playlists ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- 7. BẢNG CHI TIẾT BÀI HÁT TRONG PLAYLIST (PLAYLIST_SONGS)
CREATE TABLE IF NOT EXISTS public.playlist_songs (
  playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE,
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE,
  position INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (playlist_id, song_id)
);
ALTER TABLE public.playlist_songs ADD COLUMN IF NOT EXISTS position INT DEFAULT 0;

-- 8. BẢNG BÀI HÁT YÊU THÍCH (FAVORITES)
CREATE TABLE IF NOT EXISTS public.favorites (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (user_id, song_id)
);

-- 9. BẢNG LỊCH SỬ NGHE NHẠC (LISTENING_HISTORY)
CREATE TABLE IF NOT EXISTS public.listening_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE,
  listened_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. BẢNG GÓP Ý & BÁO LỖI & ĐÁNH GIÁ (FEEDBACK)
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_name TEXT,
  sender_email TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  category TEXT DEFAULT 'feature',
  rating INT DEFAULT 5,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 11. CẤU HÌNH STORAGE BUCKET CHO AUDIO VÀ COVERS
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('music', 'music', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Music Storage Read" ON storage.objects;
CREATE POLICY "Public Music Storage Read" ON storage.objects
FOR SELECT USING (bucket_id = 'music');

DROP POLICY IF EXISTS "Allow Upload into Music Storage" ON storage.objects;
CREATE POLICY "Allow Upload into Music Storage" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'music');

DROP POLICY IF EXISTS "Allow Update Delete Music Storage" ON storage.objects;
CREATE POLICY "Allow Update Delete Music Storage" ON storage.objects
FOR ALL USING (bucket_id = 'music');

-- ==============================================================================
-- 12. CẤP QUYỀN (GRANT) TRUY CẬP CHO POSTGRES ROLES
-- ==============================================================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, anon, authenticated, service_role;

-- ==============================================================================
-- 13. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listening_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Feedback RLS
DROP POLICY IF EXISTS "Feedback insert public" ON public.feedback;
CREATE POLICY "Feedback insert public" ON public.feedback FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Feedback select all" ON public.feedback;
CREATE POLICY "Feedback select all" ON public.feedback FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Feedback update all" ON public.feedback;
CREATE POLICY "Feedback update all" ON public.feedback FOR UPDATE TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Feedback delete all" ON public.feedback;
CREATE POLICY "Feedback delete all" ON public.feedback FOR DELETE TO public USING (true);

-- Songs RLS
DROP POLICY IF EXISTS "Songs public select" ON public.songs;
CREATE POLICY "Songs public select" ON public.songs FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Songs all write" ON public.songs;
CREATE POLICY "Songs all write" ON public.songs FOR ALL TO public USING (true) WITH CHECK (true);

-- Artists, Albums, Genres, Playlists, Profiles, Favorites
DROP POLICY IF EXISTS "Artists public select" ON public.artists;
CREATE POLICY "Artists public select" ON public.artists FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Artists all write" ON public.artists;
CREATE POLICY "Artists all write" ON public.artists FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Albums public select" ON public.albums;
CREATE POLICY "Albums public select" ON public.albums FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Albums all write" ON public.albums;
CREATE POLICY "Albums all write" ON public.albums FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Genres public select" ON public.genres;
CREATE POLICY "Genres public select" ON public.genres FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Genres all write" ON public.genres;
CREATE POLICY "Genres all write" ON public.genres FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Playlists public select" ON public.playlists;
CREATE POLICY "Playlists public select" ON public.playlists FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Playlists all write" ON public.playlists;
CREATE POLICY "Playlists all write" ON public.playlists FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Playlist songs public select" ON public.playlist_songs;
CREATE POLICY "Playlist songs public select" ON public.playlist_songs FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Playlist songs all write" ON public.playlist_songs;
CREATE POLICY "Playlist songs all write" ON public.playlist_songs FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Profiles public select" ON public.profiles;
CREATE POLICY "Profiles public select" ON public.profiles FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Profiles all write" ON public.profiles;
CREATE POLICY "Profiles all write" ON public.profiles FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Favorites select" ON public.favorites;
CREATE POLICY "Favorites select" ON public.favorites FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Favorites all write" ON public.favorites;
CREATE POLICY "Favorites all write" ON public.favorites FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "History select" ON public.listening_history;
CREATE POLICY "History select" ON public.listening_history FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "History all write" ON public.listening_history;
CREATE POLICY "History all write" ON public.listening_history FOR ALL TO public USING (true) WITH CHECK (true);

-- ==============================================================================
-- 14. HÀM ATOMIC TĂNG LƯỢT NGHE BÀI HÁT (INCREMENT PLAY COUNT)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.increment_play_count(target_song_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.songs
  SET play_count = COALESCE(play_count, 0) + 1
  WHERE id = target_song_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.increment_play_count(UUID) TO postgres, anon, authenticated, service_role;

-- ==============================================================================
-- 15. BẢNG THÔNG BÁO VÀ HỘP THƯ (NOTIFICATIONS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'system',
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Notifications public select" ON public.notifications;
CREATE POLICY "Notifications public select" ON public.notifications FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Notifications all write" ON public.notifications;
CREATE POLICY "Notifications all write" ON public.notifications FOR ALL TO public USING (true) WITH CHECK (true);

GRANT ALL ON public.notifications TO postgres, anon, authenticated, service_role;


