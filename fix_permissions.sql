-- ==============================================================================
-- FIX QUYỀN TRUY CẬP (GRANT PERMISSIONS) VÀ RLS CHO SUPABASE
-- Dán và nhấn RUN đoạn này trong SQL Editor của Supabase để mở khóa kết nối
-- ==============================================================================

-- 1. CẤP QUYỀN POSTGRES (BẮT BUỘC ĐỂ SUPABASE API ĐỌC / GHI ĐƯỢC BẢNG)
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, anon, authenticated, service_role;

-- 2. CẤP QUYỀN GỬI VÀ XEM PHẢN HỒI (FEEDBACK & ĐÁNH GIÁ)
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Feedback insert public" ON public.feedback;
CREATE POLICY "Feedback insert public" ON public.feedback 
FOR INSERT TO public 
WITH CHECK (true);

DROP POLICY IF EXISTS "Feedback select all" ON public.feedback;
CREATE POLICY "Feedback select all" ON public.feedback 
FOR SELECT TO public 
USING (true);

DROP POLICY IF EXISTS "Feedback update all" ON public.feedback;
CREATE POLICY "Feedback update all" ON public.feedback 
FOR UPDATE TO public 
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Feedback delete all" ON public.feedback;
CREATE POLICY "Feedback delete all" ON public.feedback 
FOR DELETE TO public 
USING (true);

-- 3. CẤP QUYỀN ĐỌC / GHI CHO CÁC BẢNG NỘI DUNG (SONGS, ARTISTS, ALBUMS, PLAYLISTS)
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Songs public select" ON public.songs;
CREATE POLICY "Songs public select" ON public.songs FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Songs all write" ON public.songs;
CREATE POLICY "Songs all write" ON public.songs FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Artists public select" ON public.artists;
CREATE POLICY "Artists public select" ON public.artists FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Artists all write" ON public.artists;
CREATE POLICY "Artists all write" ON public.artists FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Albums public select" ON public.albums;
CREATE POLICY "Albums public select" ON public.albums FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Albums all write" ON public.albums;
CREATE POLICY "Albums all write" ON public.albums FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE public.genres ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Genres public select" ON public.genres;
CREATE POLICY "Genres public select" ON public.genres FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Genres all write" ON public.genres;
CREATE POLICY "Genres all write" ON public.genres FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Playlists public select" ON public.playlists;
CREATE POLICY "Playlists public select" ON public.playlists FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Playlists all write" ON public.playlists;
CREATE POLICY "Playlists all write" ON public.playlists FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Playlist songs public select" ON public.playlist_songs;
CREATE POLICY "Playlist songs public select" ON public.playlist_songs FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Playlist songs all write" ON public.playlist_songs;
CREATE POLICY "Playlist songs all write" ON public.playlist_songs FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Profiles public select" ON public.profiles;
CREATE POLICY "Profiles public select" ON public.profiles FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Profiles all write" ON public.profiles;
CREATE POLICY "Profiles all write" ON public.profiles FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Favorites select" ON public.favorites;
CREATE POLICY "Favorites select" ON public.favorites FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Favorites all write" ON public.favorites;
CREATE POLICY "Favorites all write" ON public.favorites FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE public.listening_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "History select" ON public.listening_history;
CREATE POLICY "History select" ON public.listening_history FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "History all write" ON public.listening_history;
CREATE POLICY "History all write" ON public.listening_history FOR ALL TO public USING (true) WITH CHECK (true);

-- 4. HÀM ATOMIC TĂNG LƯỢT NGHE BÀI HÁT (CHỐNG LỖI CONCURRENCY KHI NHIỀU NGƯỜI CÙNG NGHE)
CREATE OR REPLACE FUNCTION public.increment_play_count(target_song_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.songs
  SET play_count = COALESCE(play_count, 0) + 1
  WHERE id = target_song_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.increment_play_count(UUID) TO postgres, anon, authenticated, service_role;

-- 5. BẢNG THÔNG BÁO VÀ HỘP THƯ (NOTIFICATIONS)
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



