'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquareText,
  Search,
  Star,
  User,
  EyeOff,
  Trash2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Feedback } from '@/types/database';

export default function AdminFeedbackPage() {
  const supabase = createClient();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const loadFeedbacks = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        setFeedbacks(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, [supabase]);

  const toggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus =
      currentStatus === 'new'
        ? 'reviewed'
        : currentStatus === 'reviewed'
        ? 'resolved'
        : 'new';

    setFeedbacks(prev =>
      prev.map(fb => (fb.id === id ? { ...fb, status: nextStatus as any } : fb))
    );

    try {
      await supabase.from('feedback').update({ status: nextStatus }).eq('id', id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa phản hồi này?')) {
      setFeedbacks(prev => prev.filter(fb => fb.id !== id));
      try {
        await supabase.from('feedback').delete().eq('id', id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredFeedbacks = feedbacks.filter((fb) => {
    const matchesSearch =
      fb.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fb.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (fb.sender_name && fb.sender_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'ALL' || fb.category === selectedCategory;

    const matchesStatus =
      selectedStatus === 'ALL' || fb.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalCount = feedbacks.length;
  const anonCount = feedbacks.filter(f => f.is_anonymous).length;
  const avgRating = totalCount > 0
    ? (feedbacks.reduce((acc, f) => acc + (f.rating || 5), 0) / totalCount).toFixed(1)
    : '5.0';

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <MessageSquareText className="w-7 h-7 text-purple-400" />
            <span>Hộp thư góp ý & Đánh giá</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Tổng cộng {feedbacks.length} ý kiến từ thính giả trong cơ sở dữ liệu Supabase
          </p>
        </div>

        {/* Thống kê nhanh */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-[#140c26]/90 border border-purple-900/30 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-xs text-zinc-300">Đánh giá TB:</span>
            <span className="text-xs font-bold text-white">{avgRating} / 5.0</span>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-[#140c26]/90 border border-purple-900/30 flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-zinc-300">Góp ý ẩn danh:</span>
            <span className="text-xs font-bold text-purple-300">{anonCount}</span>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="p-4 rounded-2xl bg-[#140c26]/80 border border-purple-900/30 backdrop-blur-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tiêu đề, nội dung hoặc người gửi..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#180f2f] border border-purple-900/40 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#180f2f] border border-purple-900/40 text-xs text-zinc-300 focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="ALL">Tất cả danh mục</option>
            <option value="feature">Góp ý tính năng</option>
            <option value="bug">Báo lỗi kỹ thuật</option>
            <option value="rating">Đánh giá trải nghiệm</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#180f2f] border border-purple-900/40 text-xs text-zinc-300 focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="new">Mới nhận</option>
            <option value="reviewed">Đang xem xét</option>
            <option value="resolved">Đã xử lý xong</option>
          </select>
        </div>
      </div>

      {/* Feedbacks List */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-zinc-500">Đang tải góp ý & phản hồi...</div>
      ) : filteredFeedbacks.length > 0 ? (
        <div className="space-y-4">
          {filteredFeedbacks.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-[#140c26]/80 hover:bg-[#180f30] border border-purple-900/30 hover:border-purple-500/40 transition-all duration-200 shadow-md space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-purple-900/20">
                <div className="flex items-center gap-2.5">
                  {item.is_anonymous ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      <EyeOff className="w-3 h-3" />
                      Ẩn danh
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
                      <User className="w-3 h-3" />
                      {item.sender_name || 'Người dùng'}
                    </span>
                  )}

                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < item.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-zinc-600'
                        }`}
                      />
                    ))}
                  </div>

                  <span className="text-[11px] text-zinc-500">
                    • {new Date(item.created_at).toLocaleString('vi-VN')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleStatus(item.id, item.status)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                      item.status === 'new'
                        ? 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
                        : item.status === 'reviewed'
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                    }`}
                    title="Bấm để đổi trạng thái xử lý"
                  >
                    {item.status === 'new' && '● Mới nhận'}
                    {item.status === 'reviewed' && '◔ Đang xem'}
                    {item.status === 'resolved' && '✔ Đã xử lý'}
                  </button>

                  <button
                    onClick={() => handleDeleteFeedback(item.id)}
                    className="p-1 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Xóa phản hồi"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-1">
                  {item.title}
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {item.content}
                </p>
              </div>

              <div className="pt-2 text-[11px] text-zinc-500 flex items-center justify-between">
                <span>Email: {item.is_anonymous ? 'Ẩn danh' : (item.sender_email || 'Không có')}</span>
                <span className="uppercase text-[10px] font-bold text-purple-400">
                  {item.category === 'feature' ? 'Góp ý tính năng' : item.category === 'bug' ? 'Báo lỗi hệ thống' : 'Đánh giá thính giả'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-dashed border-purple-900/40 bg-[#140c26]/50 text-xs text-zinc-500">
          Chưa có phản hồi hoặc góp ý nào từ thính giả.
        </div>
      )}
    </div>
  );
}
