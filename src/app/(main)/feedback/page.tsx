'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  MessageSquarePlus,
  Send,
  Lightbulb,
  Bug,
  Music,
  HelpCircle,
  EyeOff,
  UserCheck,
  CheckCircle2,
  Smile,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'suggestion', label: 'Góp ý cải thiện', icon: Lightbulb, desc: 'Đề xuất giao diện, tính năng mới' },
  { id: 'bug', label: 'Báo lỗi kỹ thuật', icon: Bug, desc: 'Lỗi phát nhạc, đứng app, lỗi hiển thị' },
  { id: 'song_request', label: 'Yêu cầu bài hát', icon: Music, desc: 'Gợi ý bài hát/album bạn muốn Admin thêm' },
  { id: 'other', label: 'Vấn đề khác', icon: HelpCircle, desc: 'Góp ý chung hoặc câu hỏi khác' },
];

const RATINGS = [
  { value: 1, label: 'Rất tệ', emoji: '😞' },
  { value: 2, label: 'Tệ', emoji: '🙁' },
  { value: 3, label: 'Bình thường', emoji: '😐' },
  { value: 4, label: 'Tốt', emoji: '😊' },
  { value: 5, label: 'Tuyệt vời', emoji: '😍' },
];

export default function FeedbackPage() {
  const [category, setCategory] = useState('suggestion');
  const [rating, setRating] = useState<number | null>(4);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error: insertError } = await supabase.from('feedback').insert({
        user_id: user?.id || null,
        sender_name: isAnonymous ? 'Người dùng ẩn danh' : (user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Thính giả Laptune'),
        sender_email: isAnonymous ? 'anonymous@laptune.vn' : (user?.email || 'guest@laptune.vn'),
        is_anonymous: isAnonymous,
        category: category,
        rating: rating || 5,
        title: title.trim(),
        content: content.trim(),
        status: 'new',
      });

      if (insertError) {
        console.error('Lỗi khi gửi phản hồi lên Supabase:', insertError);
        setErrorMessage(`Không thể gửi phản hồi: ${insertError.message}`);
        return;
      }

      setIsSubmitted(true);
    } catch (err: any) {
      console.error('Lỗi gửi phản hồi:', err);
      setErrorMessage(err?.message || 'Có lỗi xảy ra khi gửi phản hồi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setTitle('');
    setContent('');
    setIsAnonymous(false);
    setIsSubmitted(false);
    setErrorMessage(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-8 select-none">
      {/* Tiêu đề trang */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
          <MessageSquarePlus className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Góp Ý & Báo Lỗi</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Ý kiến của bạn là động lực giúp Admin hoàn thiện Laptune tốt hơn mỗi ngày
          </p>
        </div>
      </div>

      {isSubmitted ? (
        /* Trạng thái gửi thành công */
        <div className="rounded-3xl bg-[#19112a]/90 border border-purple-900/40 p-8 sm:p-12 text-center space-y-4 backdrop-blur-xl animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-white">Cảm ơn bạn đã gửi phản hồi!</h2>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-md mx-auto">
              Nội dung của bạn đã được chuyển thẳng tới Admin. {isAnonymous ? 'Phản hồi đã được gửi ẩn danh an toàn.' : 'Admin sẽ xem xét và phản hồi sớm nhất có thể.'}
            </p>
          </div>
          <div className="pt-4">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              Gửi một góp ý khác
            </button>
          </div>
        </div>
      ) : (
        /* Form Phản hồi & Góp ý */
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Chọn thể loại phản hồi */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Chủ đề phản hồi
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <div
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-950/40'
                        : 'bg-[#19112a]/70 border-purple-900/30 text-zinc-400 hover:border-purple-800 hover:text-zinc-200'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-purple-500 text-white' : 'bg-purple-950/40 text-purple-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white">{cat.label}</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5 leading-tight">{cat.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Tiêu đề phản hồi */}
          <div className="space-y-2">
            <label htmlFor="feedback-title" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Tiêu đề ngắn gọn
            </label>
            <input
              id="feedback-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Đề xuất thêm tính năng hẹn giờ ngủ..."
              className="w-full h-11 px-4 rounded-xl bg-[#19112a]/80 border border-purple-900/40 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
            />
          </div>

          {/* 3. Nội dung chi tiết */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="feedback-content" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Chi tiết nội dung
              </label>
              <span className="text-[11px] text-zinc-500">{content.length}/1000 ký tự</span>
            </div>
            <textarea
              id="feedback-content"
              required
              rows={5}
              maxLength={1000}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Mô tả cụ thể vấn đề bạn gặp phải, hoặc ý tưởng của bạn về cách cải thiện Laptune..."
              className="w-full p-4 rounded-xl bg-[#19112a]/80 border border-purple-900/40 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* 4. Đánh giá trải nghiệm chung */}
          <div className="p-4 rounded-2xl bg-[#19112a]/60 border border-purple-900/30 space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Bạn đánh giá thế nào về trải nghiệm nghe nhạc hiện tại?
            </label>
            <div className="flex items-center justify-around sm:justify-start sm:gap-6 pt-1">
              {RATINGS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setRating(item.value)}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all cursor-pointer ${
                    rating === item.value
                      ? 'scale-110 text-purple-300 font-bold'
                      : 'opacity-60 hover:opacity-100 text-zinc-400'
                  }`}
                >
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="text-[10px]">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 5. Khối Checkbox Ẩn Danh (Anonymous Toggle) */}
          <div
            onClick={() => setIsAnonymous(!isAnonymous)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
              isAnonymous
                ? 'bg-purple-950/30 border-purple-600/50 shadow-md'
                : 'bg-[#19112a]/60 border-purple-900/30 hover:border-purple-800'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  isAnonymous ? 'bg-purple-600 text-white' : 'bg-purple-950/40 text-zinc-400'
                }`}
              >
                {isAnonymous ? <EyeOff className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-white">
                  Gửi dưới dạng ẩn danh (Anonymous)
                </h4>
                <p className="text-[11px] text-zinc-400 mt-0.5 leading-tight">
                  {isAnonymous
                    ? 'Danh tính của bạn được bảo mật tuyệt đối. Admin chỉ nhìn thấy nội dung góp ý.'
                    : 'Thông tin tài khoản của bạn sẽ được gửi kèm để Admin có thể phản hồi lại.'}
                </p>
              </div>
            </div>

            {/* Custom Checkbox Toggle */}
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={() => {}} // handled by parent onClick
              className="w-5 h-5 rounded-md border-purple-800 bg-purple-950/60 text-purple-600 focus:ring-0 cursor-pointer shrink-0"
            />
          </div>

          {/* 6. Nút Gửi phản hồi */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !content.trim()}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 active:scale-95 text-white text-xs sm:text-sm font-semibold shadow-xl shadow-purple-600/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Đang gửi...' : 'Gửi góp ý cho Admin'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

