"use client";

import React, { useState, useRef, useCallback } from "react";
import { MoveHorizontal, Eye } from "lucide-react";
import { BeforeAfterItem } from "@/types";

interface BeforeAfterSliderProps {
  item: BeforeAfterItem;
  isBn: boolean;
  onViewDetails?: (item: BeforeAfterItem) => void;
}

export function BeforeAfterSlider({ item, isBn, onViewDetails }: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const width = rect.width;
      const percent = Math.min(Math.max((x / width) * 100, 0), 100);
      setSliderPosition(percent);
    },
    []
  );

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };

  return (
    <div className="group rounded-2xl bg-white border border-zinc-200/80 shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
      {/* Slider Viewport */}
      <div
        ref={containerRef}
        onClick={handleContainerClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className="relative w-full aspect-4/3 bg-zinc-950 overflow-hidden select-none cursor-ew-resize"
      >
        {/* AFTER Image (Full background layer) */}
        <img
          src={item.afterImageUrl}
          alt={isBn ? item.title.bn : item.title.en}
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
          draggable={false}
        />

        {/* BEFORE Image (Clipped layer on top) */}
        <div
          className="absolute inset-0 overflow-hidden select-none pointer-events-none"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={item.beforeImageUrl}
            alt={isBn ? item.title.bn : item.title.en}
            className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
            style={{
              width: containerRef.current ? `${containerRef.current.offsetWidth}px` : "100%",
              maxWidth: "none",
            }}
            draggable={false}
          />
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <span className="px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-black tracking-wider text-white uppercase shadow-sm">
            BEFORE
          </span>
        </div>
        <div className="absolute top-3 right-3 z-10 pointer-events-none">
          <span className="px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-black tracking-wider text-white uppercase shadow-sm">
            AFTER
          </span>
        </div>

        {/* Divider Line & Knob */}
        <div
          className="absolute top-0 bottom-0 z-20 pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Vertical line */}
          <div className="absolute inset-y-0 -left-[1.5px] w-[3px] bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)]" />

          {/* Central Handle Knob */}
          <div className="absolute top-1/2 -left-4 -translate-y-1/2 w-8 h-8 rounded-full bg-white text-zinc-900 shadow-xl flex items-center justify-center border-2 border-zinc-900/10 cursor-ew-resize">
            <MoveHorizontal className="w-4 h-4 text-zinc-800" />
          </div>
        </div>

        {/* Hover Hint */}
        <div className="absolute bottom-2 inset-x-0 flex justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-semibold text-white/90">
            {isBn ? "তুলনা করতে ডানে-বামে টানুন" : "Drag to compare"}
          </span>
        </div>
      </div>

      {/* Card Caption Footer */}
      <div className="p-4 sm:p-5 bg-white flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <h3 className="text-sm sm:text-base font-bold text-zinc-900 tracking-tight">
              {isBn ? item.title.bn : item.title.en}
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 shrink-0">
              {item.category}
            </span>
          </div>

          {item.desc && (
            <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
              {isBn ? item.desc.bn : item.desc.en}
            </p>
          )}
        </div>

        {onViewDetails && (
          <div className="pt-3 mt-3 border-t border-zinc-100 flex items-center justify-between">
            <span className="text-[11px] font-medium text-zinc-400">
              {isBn ? "ক্লিনিক্যাল ফলাফল" : "Verified Patient Result"}
            </span>
            <button
              onClick={() => onViewDetails(item)}
              className="inline-flex items-center gap-1 text-xs font-bold text-zinc-800 hover:text-black hover:underline cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isBn ? "বিস্তারিত দেখুন" : "View Case"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
