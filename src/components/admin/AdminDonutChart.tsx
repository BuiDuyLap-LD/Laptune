'use client';

import React, { useState, useEffect } from 'react';
import { PieChart, Info, Music2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export interface DonutSlice {
  id: string;
  label: string;
  value: number;
  color: string;
}

interface AdminDonutChartProps {
  title?: string;
  totalLabel?: string;
  unit?: string;
}

const sliceColors = ['#a855f7', '#ec4899', '#06b6d4', '#f59e0b', '#10b981', '#8b5cf6'];

export default function AdminDonutChart({
  title = 'Phân bổ thể loại bài hát',
  totalLabel = 'Tổng bài hát',
  unit = 'bài',
}: AdminDonutChartProps) {
  const supabase = createClient();
  const [slices, setSlices] = useState<DonutSlice[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadGenreStats() {
      setIsLoading(true);
      try {
        const { data: songs } = await supabase.from('songs').select('genre');
        if (songs && songs.length > 0) {
          const counts: Record<string, number> = {};
          songs.forEach((s) => {
            const g = (typeof s.genre === 'string' ? s.genre : (s.genre as any)?.name) || 'Chưa phân loại';
            counts[g] = (counts[g] || 0) + 1;
          });

          const calculatedSlices: DonutSlice[] = Object.keys(counts)
            .slice(0, 5) // Tối đa 5 slices chuẩn
            .map((genreName, idx) => ({
              id: `genre-${idx}`,
              label: genreName,
              value: counts[genreName],
              color: sliceColors[idx % sliceColors.length],
            }));

          setSlices(calculatedSlices);
        } else {
          setSlices([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadGenreStats();
  }, [supabase]);

  const total = slices.reduce((acc, slice) => acc + slice.value, 0);

  // Kích thước SVG
  const size = 260;
  const center = size / 2;
  const outerRadius = 105;
  const innerRadius = 70; // SectorMark with innerRadius hole
  const popDistance = 10; // Khoảng dịch chuyển khi pop-out

  // Tính góc cho từng slice
  let currentAngle = -90; // Bắt đầu ở đỉnh 12 giờ
  const slicesWithAngles = slices.map((slice, index) => {
    const angle = total > 0 ? (slice.value / total) * 360 : 0;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle += angle;

    const midAngle = startAngle + angle / 2;
    const midRad = (midAngle * Math.PI) / 180;
    const popX = Math.cos(midRad) * popDistance;
    const popY = Math.sin(midRad) * popDistance;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = center + outerRadius * Math.cos(startRad);
    const y1 = center + outerRadius * Math.sin(startRad);
    const x2 = center + outerRadius * Math.cos(endRad);
    const y2 = center + outerRadius * Math.sin(endRad);

    const x3 = center + innerRadius * Math.cos(endRad);
    const y3 = center + innerRadius * Math.sin(endRad);
    const x4 = center + innerRadius * Math.cos(startRad);
    const y4 = center + innerRadius * Math.sin(startRad);

    const largeArcFlag = angle > 180 ? 1 : 0;

    const pathData = total > 0 ? [
      `M ${x1} ${y1}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
      'Z',
    ].join(' ') : '';

    const percentage = total > 0 ? ((slice.value / total) * 100).toFixed(1) : '0';

    return {
      ...slice,
      index,
      pathData,
      popX,
      popY,
      percentage,
    };
  });

  const activeSlice = hoveredIndex !== null ? slicesWithAngles[hoveredIndex] : null;

  return (
    <div className="p-6 rounded-2xl bg-[#140c26]/80 border border-purple-900/30 backdrop-blur-md flex flex-col justify-between">
      {/* Chart Header */}
      <div className="flex items-center justify-between pb-4 border-b border-purple-900/20 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-300">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">{title}</h3>
            <p className="text-xs text-zinc-400">Dữ liệu thực tế từ Supabase Database</p>
          </div>
        </div>
        <div className="text-[11px] font-medium text-purple-300 px-2 py-0.5 rounded-full bg-purple-950/60 border border-purple-800/40 flex items-center gap-1">
          <Info className="w-3 h-3" />
          <span>Interactive Donut</span>
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-xs text-zinc-500">Đang tính toán biểu đồ...</div>
      ) : total === 0 ? (
        <div className="py-12 text-center text-xs text-zinc-500 space-y-2">
          <Music2 className="w-10 h-10 text-purple-400/40 mx-auto" />
          <p>Chưa có dữ liệu bài hát nào để phân tích thể loại.</p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* 1. SVG Donut Chart with Center Hole */}
          <div className="relative shrink-0 flex items-center justify-center">
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              className="overflow-visible select-none"
              role="img"
              aria-label="Biểu đồ donut phân bố thể loại âm nhạc"
            >
              {slicesWithAngles.map((slice) => {
                const isHovered = hoveredIndex === slice.index;
                const transformStyle = isHovered
                  ? `translate(${slice.popX}px, ${slice.popY}px) scale(1.03)`
                  : 'translate(0px, 0px) scale(1)';

                return (
                  <path
                    key={slice.id}
                    d={slice.pathData}
                    fill={slice.color}
                    stroke="#140c26"
                    strokeWidth={3}
                    strokeLinejoin="round"
                    style={{
                      transform: transformStyle,
                      transformOrigin: `${center}px ${center}px`,
                      transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease, filter 0.2s ease',
                      opacity: hoveredIndex === null || isHovered ? 1 : 0.6,
                      filter: isHovered ? `drop-shadow(0 0 8px ${slice.color}80)` : 'none',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={() => setHoveredIndex(slice.index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                );
              })}
            </svg>

            {/* 2. Total / Active Value inside the Hole */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
              {activeSlice ? (
                <div className="animate-in fade-in zoom-in-95 duration-150">
                  <span className="text-[11px] font-semibold text-zinc-300 line-clamp-1">
                    {activeSlice.label}
                  </span>
                  <div
                    className="text-2xl font-black tracking-tight"
                    style={{ color: activeSlice.color }}
                  >
                    {activeSlice.value} <span className="text-xs font-semibold">{unit}</span>
                  </div>
                  <div className="text-[11px] font-bold text-zinc-400">
                    {activeSlice.percentage}%
                  </div>
                </div>
              ) : (
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                    {totalLabel}
                  </span>
                  <div className="text-2xl font-black text-white tracking-tight">
                    {total} <span className="text-xs font-semibold text-zinc-400">{unit}</span>
                  </div>
                  <div className="text-[10px] text-purple-300 font-medium">
                    100% toàn bộ
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. Legend in the Same Colors and Order */}
          <div className="flex-1 w-full flex flex-col gap-2">
            {slicesWithAngles.map((slice) => {
              const isHovered = hoveredIndex === slice.index;

              return (
                <div
                  key={slice.id}
                  onMouseEnter={() => setHoveredIndex(slice.index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer ${
                    isHovered
                      ? 'bg-purple-900/30 border border-purple-500/40 translate-x-1 shadow-sm'
                      : 'bg-[#18102d]/50 hover:bg-[#1a1233] border border-purple-900/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 transition-transform duration-200"
                      style={{
                        backgroundColor: slice.color,
                        transform: isHovered ? 'scale(1.3)' : 'scale(1)',
                        boxShadow: isHovered ? `0 0 8px ${slice.color}` : 'none',
                      }}
                    />
                    <span
                      className={`text-xs truncate transition-colors ${
                        isHovered ? 'text-white font-semibold' : 'text-zinc-300'
                      }`}
                    >
                      {slice.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs shrink-0">
                    <span className="font-bold text-white">
                      {slice.value} <span className="text-[10px] text-zinc-400 font-normal">{unit}</span>
                    </span>
                    <span
                      className="text-[11px] font-semibold w-11 text-right"
                      style={{ color: slice.color }}
                    >
                      {slice.percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
