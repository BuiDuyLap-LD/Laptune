'use client';

import React, { useState, useEffect } from 'react';
import { Star, X, Check, Heart, Sparkles, MessageSquare } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const STORAGE_KEY = 'laptune_rating_dismissed';

interface RatingPromptProps {
  delayMinutes?: number; // Mặc định hiển thị sau 5 phút nghe nhạc
}

export default function RatingPrompt({ delayMinutes = 5 }: RatingPromptProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [note, setNote] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    // Kiểm tra xem người dùng đã từng đánh giá hoặc tắt thông báo chưa
    try {
      const isDismissed = localStorage.getItem(STORAGE_KEY);
      if (isDismissed) return;
    } catch {
      // ignore
    }

    // Thiết lập đếm ngược thời gian cụ thể (mặc định 5 phút = 300.000 ms)
    const delayMs = delayMinutes * 60 * 1000;
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [delayMinutes]);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, 'dismissed');
    } catch {
      // ignore
    }
  };

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setIsSubmitted(true);
    try {
      localStorage.setItem(STORAGE_KEY, 'submitted');
      const { data: { user } } = await supabase.auth.getUser();

      await supabase.from('feedback').insert({
        user_id: user?.id || null,
        sender_name: user?.user_metadata?.full_name || 'Thính giả đánh giá nhanh',
        sender_email: user?.email || 'listener@laptune.vn',
        is_anonymous: false,
        category: 'rating',
        rating: rating,
        title: `Đánh giá ${rating} sao trải nghiệm nghe nhạc`,
        content: note.trim() || 'Người dùng gửi đánh giá từ cửa sổ nhắc nhở.',
        status: 'new',
      });
    } catch {
      // ignore
    }

    // Tự động đóng sau khi cảm ơn 2 giây
    setTimeout(() => {
      setIsVisible(false);
    }, 2200);
  };

  if (!isVisible) return null;

  // NSLevelIndicator Threshold Coloring (warningValue & criticalValue)
  const currentRatingValue = hoverRating || rating;
  const getThresholdLabel = () => {
    if (currentRatingValue === 0) return 'Chọn số sao đánh giá';
    if (currentRatingValue <= 2) return 'Cần cải thiện (Critical)';
    if (currentRatingValue === 3) return 'Khá ổn (Warning)';
    if (currentRatingValue === 4) return 'Rất tốt (Good)';
    return 'Tuyệt vời & Yêu thích! (Excellent)';
  };

  const getThresholdColor = () => {
    if (currentRatingValue === 0) return 'text-zinc-500';
    if (currentRatingValue <= 2) return 'text-rose-400'; // Critical Value
    if (currentRatingValue === 3) return 'text-amber-400'; // Warning Value
    return 'text-purple-400'; // High Satisfaction
  };

  return (
    <aside
      aria-label="Đánh giá ứng dụng"
      className="fixed bottom-36 md:bottom-24 left-3 right-3 sm:left-auto sm:right-6 z-40 sm:w-96 rounded-2xl bg-[#19112a]/95 border border-purple-800/40 p-4 shadow-2xl shadow-purple-950/80 backdrop-blur-2xl animate-in slide-in-from-bottom-5 fade-in duration-200 select-none"
    >
      {/* Nút đóng góc trên (không làm gián đoạn nhạc) */}
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Tắt thông báo đánh giá"
        title="Để sau"
        className="absolute top-3 right-3 p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-purple-900/30 transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>

      {isSubmitted ? (
        /* Trạng thái đã gửi đánh giá */
        <div className="py-3 text-center space-y-2 animate-in zoom-in-95 duration-150">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <Check className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white">Cảm ơn bạn đã đánh giá!</h4>
          <p className="text-xs text-zinc-400">
            Ý kiến của bạn giúp chúng tôi nâng cấp chất lượng kho nhạc ngày càng hay hơn.
          </p>
        </div>
      ) : (
        /* Form đánh giá NSLevelIndicator (.rating style) */
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center gap-2.5 pr-6">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
                Bạn thấy Laptune thế nào?
              </h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Dành 10 giây chấm điểm trải nghiệm nhé!
              </p>
            </div>
          </div>

          {/* NSLevelIndicator: .rating Style (5 Stars with threshold coloring) */}
          <div className="py-1 flex flex-col items-center justify-center gap-1.5">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isLit = (hoverRating || rating) >= star;
                const isCritical = (hoverRating || rating) <= 2;
                const isWarning = (hoverRating || rating) === 3;

                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-125 active:scale-95 cursor-pointer focus-visible:outline-none"
                    aria-label={`${star} sao`}
                  >
                    <Star
                      className={`w-6 h-6 transition-colors duration-150 ${
                        isLit
                          ? isCritical
                            ? 'text-rose-400 fill-rose-400'
                            : isWarning
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-purple-400 fill-purple-400'
                          : 'text-zinc-600'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Threshold Label Indicator */}
            <span className={`text-[11px] font-semibold transition-colors duration-150 ${getThresholdColor()}`}>
              {getThresholdLabel()}
            </span>
          </div>

          {/* Ô nhập ghi chú ngắn tùy chọn */}
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Bạn có góp ý thêm gì không? (Tùy chọn)"
            className="w-full h-8 px-3 rounded-lg bg-purple-950/30 border border-purple-900/40 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
          />

          {/* Nút hành động */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleDismiss}
              className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer"
            >
              Để sau
            </button>
            <button
              type="submit"
              disabled={rating === 0}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-purple-600/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              Gửi đánh giá
            </button>
          </div>
        </form>
      )}
    </aside>
  );
}

