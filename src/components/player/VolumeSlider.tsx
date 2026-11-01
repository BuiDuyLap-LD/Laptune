'use client';

import React, { useState } from 'react';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';
import { usePlayerStore } from '@/stores/usePlayerStore';

interface VolumeSliderProps {
  numberOfTickMarks?: number; // Mặc định 5 mốc: 0%, 25%, 50%, 75%, 100%
  allowsTickMarkValuesOnly?: boolean; // Snap chặt vào các mốc tick marks
}

export default function VolumeSlider({
  numberOfTickMarks = 5,
  allowsTickMarkValuesOnly = true,
}: VolumeSliderProps) {
  const { volume, isMuted, setVolume, toggleMute } = usePlayerStore();
  const [isHovered, setIsHovered] = useState(false);

  // Tính toán các mốc tick marks phân bổ đều từ 0 đến 1
  const tickMarks = Array.from({ length: numberOfTickMarks }, (_, i) => i / (numberOfTickMarks - 1));
  const stepValue = allowsTickMarkValuesOnly ? 1 / (numberOfTickMarks - 1) : 0.01;

  const currentVolume = isMuted ? 0 : volume;
  const currentPercent = currentVolume * 100;

  // Xử lý thay đổi âm lượng liên tục khi kéo (isContinuous = true)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
  };

  const getVolumeIcon = () => {
    if (isMuted || currentVolume === 0) return <VolumeX className="w-4 h-4 text-pink-400" />;
    if (currentVolume < 0.5) return <Volume1 className="w-4 h-4 text-zinc-300 group-hover:text-white" />;
    return <Volume2 className="w-4 h-4 text-zinc-300 group-hover:text-white" />;
  };

  return (
    <div
      className="flex items-center gap-2.5 relative select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Nút bật/tắt tiếng (Mute Toggle) */}
      <button
        type="button"
        onClick={toggleMute}
        aria-label={isMuted ? 'Bật âm thanh' : 'Tắt tiếng'}
        title={isMuted ? 'Bật âm thanh' : 'Tắt tiếng'}
        className="w-8 h-8 rounded-full bg-[#191228] flex items-center justify-center transition-all cursor-pointer group focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none"
        style={{
          boxShadow: isMuted
            ? 'inset -2px -2px 5px rgba(255, 255, 255, 0.04), inset 2px 2px 6px rgba(0, 0, 0, 0.85)'
            : '-3px -3px 7px rgba(255, 255, 255, 0.045), 3px 3px 8px rgba(0, 0, 0, 0.7)',
        }}
      >
        {getVolumeIcon()}
      </button>

      {/* Cụm thanh trượt NSSlider với Track, Round Knob và Tick Marks bên dưới */}
      <div className="relative w-28 sm:w-32 flex flex-col items-center justify-center py-2">
        {/* Tooltip hiển thị phần trăm khi hover */}
        {isHovered && (
          <div
            className="absolute -top-6 px-1.5 py-0.5 rounded bg-zinc-900 border border-purple-900/40 text-[10px] font-bold text-purple-300 shadow-md transition-all -translate-x-1/2 pointer-events-none"
            style={{ left: `${currentPercent}%` }}
          >
            {Math.round(currentPercent)}%
          </div>
        )}

        {/* 1. Track chính (Horizontal linear style) */}
        <div
          className="relative w-full h-1.5 rounded-full bg-purple-950/60 overflow-visible flex items-center cursor-pointer"
          style={{
            boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.8)',
          }}
        >
          {/* Leading side of track: Tinted with accent color */}
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-[width] duration-75"
            style={{ width: `${currentPercent}%` }}
          />

          {/* Round Knob (NSSlider round knob) */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.6)] border border-purple-200 transition-transform hover:scale-110 active:scale-95 pointer-events-none"
            style={{ left: `${currentPercent}%` }}
          />
        </div>

        {/* 2. Discrete Tick Marks (tickMarkPosition = .below) */}
        <div className="relative w-full h-2 mt-1.5 flex items-start">
          {tickMarks.map((tick, index) => {
            const isPassed = currentVolume >= tick;
            const tickPercent = tick * 100;
            return (
              <div
                key={index}
                className="absolute flex flex-col items-center -translate-x-1/2 cursor-pointer group"
                style={{ left: `${tickPercent}%` }}
                onClick={() => setVolume(tick)}
                title={`Mức âm lượng: ${Math.round(tickPercent)}%`}
              >
                {/* Vạch kẻ tick mark */}
                <div
                  className={`w-[1.5px] h-1.5 rounded-full transition-colors ${
                    isPassed ? 'bg-purple-400' : 'bg-purple-900/60'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* 3. Input range ẩn phủ lên trên để hỗ trợ native dragging & accessibility (isContinuous = true) */}
        <input
          type="range"
          min="0"
          max="1"
          step={stepValue}
          value={currentVolume}
          onChange={handleChange}
          aria-label="Điều chỉnh âm lượng"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(currentPercent)}
          aria-valuetext={`${Math.round(currentPercent)}%`}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}

