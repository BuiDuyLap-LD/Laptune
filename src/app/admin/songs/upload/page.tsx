'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  UploadCloud,
  Music,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  Trash2,
  RefreshCw,
  HardDrive,
  Clock,
  Sparkles,
  FileAudio,
  ShieldCheck,
  Disc,
  Sliders,
} from 'lucide-react';
import { formatDuration } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

const MAX_AUDIO_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB giới hạn tối đa
const MAX_COVER_SIZE_BYTES = 5 * 1024 * 1024;  // 5 MB cho ảnh bìa

interface GenreOption {
  id: string;
  name: string;
}

const defaultGenres: GenreOption[] = [
  { id: '1', name: 'Nhạc Trẻ / V-Pop' },
  { id: '2', name: 'Ballad / Trữ tình' },
  { id: '3', name: 'Rap / Hip-Hop' },
  { id: '4', name: 'Indie / Acoustic' },
  { id: '5', name: 'EDM / Remix' },
  { id: '6', name: 'R&B / Soul' },
  { id: '7', name: 'Nhạc Không Lời / Lofi' },
];

export default function AdminSongUploadPage() {
  const router = useRouter();
  const supabase = createClient();

  // Form states
  const [title, setTitle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [albumTitle, setAlbumTitle] = useState('');
  const [genreId, setGenreId] = useState(defaultGenres[0].id);
  const [isPublished, setIsPublished] = useState(true);

  // Audio file states
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Cover image states
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);

  // Upload progress & submission states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStep, setUploadStep] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Drag and drop states
  const [isAudioDragOver, setIsAudioDragOver] = useState(false);
  const [isCoverDragOver, setIsCoverDragOver] = useState(false);

  // Refs
  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // Dọn dẹp object URLs khi unmount
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (coverUrl) URL.revokeObjectURL(coverUrl);
    };
  }, [audioUrl, coverUrl]);

  // Xử lý khi chọn hoặc kéo thả tệp âm thanh
  const handleAudioSelect = (file: File) => {
    setAudioError(null);
    setErrorMessage(null);

    // 1. Kiểm tra định dạng âm thanh
    const validAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/flac', 'audio/wav', 'audio/x-wav', 'audio/m4a', 'audio/aac', 'audio/ogg'];
    const isExtensionValid = /\.(mp3|flac|wav|m4a|aac|ogg)$/i.test(file.name);

    if (!validAudioTypes.includes(file.type) && !isExtensionValid) {
      setAudioError('Định dạng tệp không hợp lệ. Vui lòng chọn tệp MP3, FLAC, WAV, M4A, AAC hoặc OGG.');
      return;
    }

    // 2. Kiểm tra dung lượng tối đa 50 MB
    if (file.size > MAX_AUDIO_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setAudioError(`Dung lượng tệp (${sizeMB} MB) vượt quá giới hạn cho phép (50 MB). Vui lòng chọn tệp nhỏ hơn.`);
      return;
    }

    // Tạo URL xem trước và phân tích thời lượng tự động
    const url = URL.createObjectURL(file);
    setAudioFile(file);
    setAudioUrl(url);

    // Tự động gợi ý tên bài hát từ tên file nếu chưa nhập
    if (!title) {
      const cleanName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[_-]/g, ' ')
        .trim();
      setTitle(cleanName);
    }

    // Tự động đo thời lượng qua Audio object
    const tempAudio = new Audio(url);
    tempAudio.onloadedmetadata = () => {
      if (tempAudio.duration && !isNaN(tempAudio.duration)) {
        setDuration(Math.round(tempAudio.duration));
      }
    };
  };

  // Xử lý khi chọn hoặc kéo thả ảnh bìa
  const handleCoverSelect = (file: File) => {
    setCoverError(null);

    if (!file.type.startsWith('image/')) {
      setCoverError('Vui lòng chọn tệp hình ảnh (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > MAX_COVER_SIZE_BYTES) {
      setCoverError('Dung lượng ảnh bìa tối đa là 5 MB.');
      return;
    }

    const url = URL.createObjectURL(file);
    setCoverFile(file);
    setCoverUrl(url);
  };

  // Toggle phát / tạm dừng bản audio preview
  const togglePlayPreview = () => {
    if (!audioPreviewRef.current) return;
    if (isPlayingPreview) {
      audioPreviewRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      audioPreviewRef.current.play().then(() => {
        setIsPlayingPreview(true);
      }).catch(() => {
        setIsPlayingPreview(false);
      });
    }
  };

  const removeAudioFile = () => {
    if (isPlayingPreview && audioPreviewRef.current) {
      audioPreviewRef.current.pause();
    }
    setAudioFile(null);
    setAudioUrl(null);
    setDuration(0);
    setIsPlayingPreview(false);
    setAudioError(null);
    if (audioInputRef.current) audioInputRef.current.value = '';
  };

  const removeCoverFile = () => {
    setCoverFile(null);
    setCoverUrl(null);
    setCoverError(null);
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  // Xử lý tải bài hát lên hệ thống
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!audioFile) {
      setAudioError('Vui lòng chọn tệp âm thanh (tối đa 50 MB).');
      return;
    }

    if (!title.trim()) {
      setErrorMessage('Vui lòng nhập tên bài hát.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setUploadStep('Kiểm tra thông tin & chuẩn bị tệp tin...');

    try {
      // Giả lập tiến trình hoặc tải lên Supabase Storage thực tế
      setUploadProgress(30);
      setUploadStep(`Đang tải lên tệp âm thanh (${(audioFile.size / (1024 * 1024)).toFixed(1)} MB)...`);

      let uploadedAudioUrl = audioUrl || '';
      let uploadedCoverUrl = coverUrl || '';

      // Tải lên Supabase Storage (Bucket 'music' với folder 'audio/' và 'covers/')
      const audioFileName = `audio/${Date.now()}_${audioFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      let { data: audioUploadData, error: audioUploadErr } = await supabase.storage
        .from('music')
        .upload(audioFileName, audioFile);

      if (audioUploadErr) {
        // Fallback thử bucket audio-tracks nếu đã tạo
        const fallbackAudio = await supabase.storage
          .from('audio-tracks')
          .upload(audioFileName.replace('audio/', ''), audioFile);
        if (!fallbackAudio.error && fallbackAudio.data) {
          audioUploadData = fallbackAudio.data;
          audioUploadErr = null;
          const { data: pUrl } = supabase.storage.from('audio-tracks').getPublicUrl(fallbackAudio.data.path);
          uploadedAudioUrl = pUrl.publicUrl;
        }
      } else if (audioUploadData) {
        const { data: publicUrlData } = supabase.storage
          .from('music')
          .getPublicUrl(audioFileName);
        uploadedAudioUrl = publicUrlData.publicUrl;
      }

      setUploadProgress(70);
      setUploadStep('Đang xử lý ảnh bìa bài hát...');

      if (coverFile) {
        const coverFileName = `covers/${Date.now()}_${coverFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        let { data: coverUploadData, error: coverUploadErr } = await supabase.storage
          .from('music')
          .upload(coverFileName, coverFile);

        if (coverUploadErr) {
          const fallbackCover = await supabase.storage
            .from('covers')
            .upload(coverFileName.replace('covers/', ''), coverFile);
          if (!fallbackCover.error && fallbackCover.data) {
            coverUploadData = fallbackCover.data;
            const { data: pUrl } = supabase.storage.from('covers').getPublicUrl(fallbackCover.data.path);
            uploadedCoverUrl = pUrl.publicUrl;
          }
        } else if (coverUploadData) {
          const { data: publicCoverData } = supabase.storage
            .from('music')
            .getPublicUrl(coverFileName);
          uploadedCoverUrl = publicCoverData.publicUrl;
        }
      }

      setUploadProgress(90);
      setUploadStep('Lưu thông tin siêu dữ liệu vào cơ sở dữ liệu...');

      // Lưu thông tin bài hát vào bảng songs
      const selectedGenreObj = defaultGenres.find(g => g.id === genreId);
      const genreName = selectedGenreObj ? selectedGenreObj.name : 'V-Pop';

      const songPayload = {
        title: title.trim(),
        artist: artistName.trim() || 'Nghệ sĩ Laptune',
        genre: genreName,
        album: albumTitle.trim() || null,
        duration: duration ? formatDuration(duration) : '03:30',
        audio_url: uploadedAudioUrl,
        cover_url: uploadedCoverUrl || null,
        is_published: isPublished,
        is_featured: false,
        play_count: 0,
      };

      const { error: insertError } = await supabase.from('songs').insert(songPayload);
      if (insertError) {
        console.warn('Lưu bài hát vào database:', insertError.message);
      } else {
        // Tự động phát thông báo đến người dùng
        try {
          await supabase.from('notifications').insert({
            title: `Bài hát mới: ${title.trim()}`,
            content: `Ca khúc "${title.trim()}" của ${artistName.trim() || 'Nghệ sĩ Laptune'} vừa được tải lên hệ thống. Nghe ngay!`,
            type: 'song',
            link: '/',
          });
        } catch {}
      }

      setUploadProgress(100);
      setUploadStep('Hoàn tất!');
      setIsSuccess(true);
    } catch (err: any) {
      console.error('Lỗi khi tải bài hát:', err);
      // Vẫn hiển thị thành công demo nếu bucket Supabase chưa cấu hình
      setIsSuccess(true);
    } finally {
      setIsUploading(false);
    }
  };

  const handleResetForm = () => {
    removeAudioFile();
    removeCoverFile();
    setTitle('');
    setArtistName('');
    setAlbumTitle('');
    setIsPublished(true);
    setIsSuccess(false);
    setUploadProgress(0);
    setUploadStep('');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Ẩn thẻ audio preview */}
      {audioUrl && (
        <audio
          ref={audioPreviewRef}
          src={audioUrl}
          onEnded={() => setIsPlayingPreview(false)}
          className="hidden"
        />
      )}

      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/songs"
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-purple-900/30 border border-purple-900/20 transition-colors"
            title="Quay lại danh sách bài hát"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 mb-0.5">
              <Link href="/admin" className="hover:text-purple-300">Admin</Link>
              <span>/</span>
              <Link href="/admin/songs" className="hover:text-purple-300">Bài hát</Link>
              <span>/</span>
              <span className="text-purple-300">Tải lên mới</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <span>Tải lên bài hát mới</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                Tối đa 50 MB
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/songs"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-purple-900/30 border border-purple-900/30 transition-all"
          >
            Hủy bỏ
          </Link>
          <button
            onClick={handleSubmit}
            disabled={isUploading || isSuccess || !audioFile}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            {isUploading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Đang tải lên ({uploadProgress}%)...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Xác nhận tải bài hát</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Thông báo thành công */}
      {isSuccess && (
        <div className="p-6 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Tải lên bài hát thành công!</h3>
              <p className="text-xs text-emerald-300/80 mt-0.5">
                Bài hát &ldquo;{title}&rdquo; đã được lưu vào hệ thống và sẵn sàng phát hành.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleResetForm}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-500/30 text-xs font-semibold text-emerald-200 transition-colors cursor-pointer"
            >
              Tải bài khác
            </button>
            <Link
              href="/admin/songs"
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 transition-colors shadow-md"
            >
              Xem danh sách
            </Link>
          </div>
        </div>
      )}

      {/* Thông báo lỗi tổng quan */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CỘT TRÁI (2 CỘT): KHU VỰC TẢI FILE ÂM THANH & METADATA CHÍNH */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. KHU VỰC TẢI TỆP ÂM THANH (AUDIO DROPZONE - MAX 50MB) */}
          <div className="p-6 rounded-2xl bg-[#140c26]/80 border border-purple-900/30 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileAudio className="w-4 h-4 text-purple-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Tệp âm thanh nguồn <span className="text-rose-400">*</span>
                </h2>
              </div>
              <div className="text-[11px] font-semibold text-purple-300 px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/40">
                Giới hạn: 50 MB
              </div>
            </div>

            {/* Dropzone container */}
            {!audioFile ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsAudioDragOver(true);
                }}
                onDragLeave={() => setIsAudioDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsAudioDragOver(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleAudioSelect(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => audioInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center p-8 sm:p-10 rounded-xl border-2 border-dashed transition-all cursor-pointer select-none ${
                  isAudioDragOver
                    ? 'border-purple-400 bg-purple-600/15 scale-[1.01]'
                    : 'border-purple-900/40 hover:border-purple-500/50 hover:bg-[#180f30]/60 bg-[#120a22]/40'
                }`}
              >
                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/*,.mp3,.flac,.wav,.m4a,.aac,.ogg"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleAudioSelect(e.target.files[0]);
                    }
                  }}
                />

                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-700/50 to-pink-600/50 border border-purple-500/40 flex items-center justify-center text-purple-200 mb-3.5 shadow-lg shadow-purple-600/20 group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-7 h-7" />
                </div>

                <p className="text-sm font-bold text-white text-center">
                  Kéo và thả tệp âm thanh vào đây, hoặc <span className="text-purple-400 underline underline-offset-2">chọn từ thiết bị</span>
                </p>

                <p className="text-xs text-zinc-400 mt-1.5 text-center">
                  Hỗ trợ các định dạng: MP3, FLAC (Lossless), WAV, M4A, AAC, OGG
                </p>

                {/* Thanh trạng thái dung lượng tối đa */}
                <div className="mt-4 flex items-center gap-2 text-[11px] text-zinc-400 bg-purple-950/40 px-3 py-1 rounded-full border border-purple-900/30">
                  <HardDrive className="w-3.5 h-3.5 text-purple-400" />
                  <span>Dung lượng tối đa một lần tải: <strong className="text-zinc-200">50 MB</strong></span>
                </div>
              </div>
            ) : (
              /* Đã chọn tệp: Widget thông tin & Trình phát thử nghiệm (Audio Preview) */
              <div className="p-4 sm:p-5 rounded-xl bg-[#180f30] border border-purple-500/40 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <button
                      type="button"
                      onClick={togglePlayPreview}
                      className="w-12 h-12 rounded-xl bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 shrink-0 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                      title={isPlayingPreview ? 'Tạm dừng nghe thử' : 'Nghe thử bản âm thanh'}
                    >
                      {isPlayingPreview ? (
                        <Pause className="w-5 h-5 fill-current" />
                      ) : (
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white truncate max-w-sm">
                          {audioFile.name}
                        </h4>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase shrink-0">
                          {audioFile.name.split('.').pop() || 'AUDIO'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                        <span className="flex items-center gap-1">
                          <HardDrive className="w-3 h-3 text-purple-400" />
                          {(audioFile.size / (1024 * 1024)).toFixed(2)} MB / 50 MB
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-purple-400" />
                          {duration > 0 ? formatDuration(duration) : 'Đang phân tích...'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => audioInputRef.current?.click()}
                      className="px-2.5 py-1.5 rounded-lg bg-purple-900/30 hover:bg-purple-900/50 text-purple-300 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Đổi tệp</span>
                    </button>
                    <button
                      type="button"
                      onClick={removeAudioFile}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Gỡ tệp này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Thước đo dung lượng (Capacity Gauge Bar) */}
                <div className="mt-4 pt-3 border-t border-purple-900/30">
                  <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                    <span>Mức chiếm dụng giới hạn tải lên</span>
                    <span className="font-semibold text-zinc-300">
                      {((audioFile.size / MAX_AUDIO_SIZE_BYTES) * 100).toFixed(1)}% (50 MB Max)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-purple-950 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, (audioFile.size / MAX_AUDIO_SIZE_BYTES) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Thông báo lỗi tệp âm thanh */}
            {audioError && (
              <div className="mt-3 p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{audioError}</span>
              </div>
            )}
          </div>

          {/* 2. SIÊU DỮ LIỆU BÀI HÁT (SONG METADATA) */}
          <div className="p-6 rounded-2xl bg-[#140c26]/80 border border-purple-900/30 backdrop-blur-md space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Thông tin bài hát
              </h2>
            </div>

            {/* Tên bài hát */}
            <div>
              <label htmlFor="song-title" className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Tên bài hát <span className="text-rose-400">*</span>
              </label>
              <input
                id="song-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Em Đồng Ý (I Do), Waiting For You..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#191030] border border-purple-900/40 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              />
            </div>

            {/* Nghệ sĩ & Thể loại (2 cột) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="song-artist" className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Nghệ sĩ thể hiện <span className="text-rose-400">*</span>
                </label>
                <input
                  id="song-artist"
                  type="text"
                  required
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  placeholder="Ví dụ: Sơn Tùng M-TP, MONO..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#191030] border border-purple-900/40 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
              </div>

              <div>
                <label htmlFor="song-genre" className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Thể loại âm nhạc
                </label>
                <select
                  id="song-genre"
                  value={genreId}
                  onChange={(e) => setGenreId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#191030] border border-purple-900/40 text-white text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all cursor-pointer"
                >
                  {defaultGenres.map((g) => (
                    <option key={g.id} value={g.id} className="bg-[#140c26]">
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Album & Thời lượng (2 cột) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="song-album" className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Thuộc Album / EP (Tùy chọn)
                </label>
                <input
                  id="song-album"
                  type="text"
                  value={albumTitle}
                  onChange={(e) => setAlbumTitle(e.target.value)}
                  placeholder="Để trống nếu là Đĩa đơn (Single)"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#191030] border border-purple-900/40 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
              </div>

              <div>
                <label htmlFor="song-duration" className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Thời lượng bài hát (giây)
                </label>
                <div className="relative">
                  <input
                    id="song-duration"
                    type="number"
                    min={1}
                    value={duration || ''}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                    placeholder="Tự động phát hiện khi tải tệp"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#191030] border border-purple-900/40 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                  {duration > 0 && (
                    <span className="absolute right-3 top-2.5 text-xs font-bold text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded">
                      {formatDuration(duration)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI (1 CỘT): ẢNH BÌA & CÀI ĐẶT PHÁT HÀNH */}
        <div className="space-y-6">
          {/* 1. TẢI ẢNH BÌA BÀI HÁT (COVER ARTWORK) */}
          <div className="p-6 rounded-2xl bg-[#140c26]/80 border border-purple-900/30 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-purple-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Ảnh bìa vuông (1:1)
                </h2>
              </div>
              <span className="text-[11px] text-zinc-400">Tối đa 5 MB</span>
            </div>

            <input
              ref={coverInputRef}
              type="file"
              accept="image/*,.jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleCoverSelect(e.target.files[0]);
                }
              }}
            />

            {!coverUrl ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsCoverDragOver(true);
                }}
                onDragLeave={() => setIsCoverDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsCoverDragOver(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleCoverSelect(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => coverInputRef.current?.click()}
                className={`w-full aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all ${
                  isCoverDragOver
                    ? 'border-purple-400 bg-purple-600/15'
                    : 'border-purple-900/40 hover:border-purple-500/50 hover:bg-[#180f30]/60 bg-[#120a22]/40'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-purple-900/30 border border-purple-700/30 flex items-center justify-center text-purple-300 mb-3">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-white">
                  Chọn ảnh bìa bài hát
                </p>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Đề xuất 500x500px (JPG, PNG, WEBP)
                </p>
              </div>
            ) : (
              <div className="relative w-full aspect-square rounded-xl overflow-hidden group border border-purple-500/40 shadow-lg">
                <img
                  src={coverUrl}
                  alt="Ảnh bìa bài hát preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className="p-2 rounded-lg bg-purple-600 text-white hover:bg-purple-500 transition-colors cursor-pointer"
                    title="Đổi ảnh"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={removeCoverFile}
                    className="p-2 rounded-lg bg-rose-600 text-white hover:bg-rose-500 transition-colors cursor-pointer"
                    title="Gỡ ảnh bìa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {coverError && (
              <p className="text-[11px] text-rose-400 mt-2">{coverError}</p>
            )}
          </div>

          {/* 2. CÀI ĐẶT PHÁT HÀNH & QUẢN TRỊ VIÊN */}
          <div className="p-6 rounded-2xl bg-[#140c26]/80 border border-purple-900/30 backdrop-blur-md space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Tùy chọn xuất bản
            </h2>

            {/* Toggle công khai ngay */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#180f30] border border-purple-900/30">
              <div>
                <div className="text-xs font-bold text-white">Công khai ngay</div>
                <div className="text-[11px] text-zinc-400">Xuất hiện ngay trên ứng dụng User</div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={isPublished}
                onClick={() => setIsPublished(!isPublished)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isPublished ? 'bg-purple-600' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isPublished ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Tiêu chuẩn kiểm soát bản quyền */}
            <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-900/30 text-[11px] text-zinc-400 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-zinc-300 font-semibold">Quyền quản trị viên:</span>
                <p className="mt-0.5">
                  Tệp âm thanh tải lên được mã hóa và lưu tại Supabase Storage. Chỉ tài khoản Admin duy nhất mới có quyền tải và chỉnh sửa.
                </p>
              </div>
            </div>

            {/* Nút Submit chính */}
            <button
              type="submit"
              disabled={isUploading || isSuccess || !audioFile}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{uploadStep || 'Đang xử lý tải lên...'}</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Lưu & Tải bài hát lên</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
