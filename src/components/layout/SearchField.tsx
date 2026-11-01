'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Clock, TrendingUp, Trash2 } from 'lucide-react';

const STORAGE_KEY = 'laptune_recent_searches';

const DEFAULT_TRENDING = [
  'V-Pop Hits 2026',
  'Acoustic Chill',
  'Nhạc Indie Việt Hay Nhất',
  'Lofi Thư Giãn Học Tập',
];

export default function SearchField() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Tải danh sách tìm kiếm gần đây từ LocalStorage (NSSearchFieldCell.searchMenuTemplate)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch {
      // Bỏ qua lỗi parsing nếu có
    }
  }, []);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpenMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lưu từ khóa vào tìm kiếm gần đây
  const saveSearchTerm = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...recentSearches.filter((item) => item !== trimmed)].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleSearch = (termToSearch?: string) => {
    const finalTerm = (termToSearch ?? query).trim();
    if (finalTerm) {
      saveSearchTerm(finalTerm);
      setIsOpenMenu(false);
      router.push(`/search?q=${encodeURIComponent(finalTerm)}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const handleDeleteRecentItem = (e: React.MouseEvent, item: string) => {
    e.stopPropagation();
    const updated = recentSearches.filter((s) => s !== item);
    setRecentSearches(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleClearAllRecent = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      {/* 1. Form tìm kiếm chính (NSSearchField semantics) */}
      <form onSubmit={handleSubmit} className="relative w-full">
        {/* Leading Search Button */}
        <button
          type="button"
          onClick={() => {
            setIsOpenMenu(!isOpenMenu);
            inputRef.current?.focus();
          }}
          aria-label="Tìm kiếm"
          title="Mở menu tìm kiếm gần đây"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-purple-300 transition-colors p-1 cursor-pointer"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Search Input Field */}
        <input
          ref={inputRef}
          type="search"
          role="searchbox"
          value={query}
          onFocus={() => setIsOpenMenu(true)}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsOpenMenu(false);
            }
          }}
          placeholder="Tìm kiếm bài hát, nghệ sĩ, album..."
          className="w-full h-10 pl-10 pr-9 rounded-full bg-purple-950/30 border border-purple-900/40 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors [&::-webkit-search-cancel-button]:hidden"
        />

        {/* Trailing Cancel / Clear Button (Chỉ hiện khi có văn bản nhập vào) */}
        {query.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Xóa nội dung tìm kiếm"
            title="Xóa nội dung"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-zinc-700/60 hover:bg-zinc-600 flex items-center justify-center text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </form>

      {/* 2. Menu tìm kiếm gần đây & Gợi ý (NSSearchFieldCell.searchMenuTemplate) */}
      {isOpenMenu && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#19112a] border border-purple-900/40 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden z-50 py-2.5 animate-in fade-in duration-100">
          {/* Lịch sử tìm kiếm gần đây */}
          {recentSearches.length > 0 && (
            <div className="mb-2">
              <div className="flex items-center justify-between px-4 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-purple-400" />
                  Tìm kiếm gần đây
                </span>
                <button
                  type="button"
                  onClick={handleClearAllRecent}
                  className="hover:text-red-400 transition-colors text-[10px] lowercase font-normal flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                  Xóa tất cả
                </button>
              </div>

              <div className="space-y-0.5 px-1.5">
                {recentSearches.map((item) => (
                  <div
                    key={item}
                    onClick={() => {
                      setQuery(item);
                      handleSearch(item);
                    }}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-zinc-300 hover:bg-purple-900/20 hover:text-purple-200 cursor-pointer transition-colors group"
                  >
                    <span className="truncate flex-1">{item}</span>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteRecentItem(e, item)}
                      title="Xóa mục này"
                      className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-zinc-200 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dải phân cách */}
          {recentSearches.length > 0 && <div className="h-[1px] bg-purple-900/20 my-1 mx-3" />}

          {/* Từ khóa phổ biến / Gợi ý */}
          <div>
            <div className="px-4 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3 text-pink-400" />
              Gợi ý nổi bật
            </div>
            <div className="space-y-0.5 px-1.5">
              {DEFAULT_TRENDING.map((trend) => (
                <div
                  key={trend}
                  onClick={() => {
                    setQuery(trend);
                    handleSearch(trend);
                  }}
                  className="px-3 py-2 rounded-xl text-xs text-zinc-300 hover:bg-purple-900/20 hover:text-purple-200 cursor-pointer transition-colors flex items-center gap-2"
                >
                  <Search className="w-3 h-3 text-zinc-500" />
                  <span className="truncate">{trend}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

