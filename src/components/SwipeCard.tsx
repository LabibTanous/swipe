"use client";

import { SwipeCard as SwipeCardType } from "@/types";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  card: SwipeCardType;
  isTop: boolean;
  stackIndex: number; // 0 = top, 1 = second, 2 = third
  dragOffset?: number; // -1 to 1, for stamp visibility
}

export default function SwipeCard({ card, isTop, stackIndex, dragOffset = 0 }: Props) {
  const scale = 1 - stackIndex * 0.04;
  const translateY = stackIndex * 14;

  return (
    <motion.div
      className="absolute w-full rounded-[28px] overflow-hidden select-none"
      style={{
        scale,
        translateY,
        zIndex: 10 - stackIndex,
        pointerEvents: isTop ? "auto" : "none",
        boxShadow: isTop
          ? "0 24px 64px rgba(0,0,0,0.55), 0 4px 16px rgba(0,0,0,0.3)"
          : "0 8px 24px rgba(0,0,0,0.3)",
      }}
      animate={{ scale, y: translateY }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Hero image area */}
      <div
        className="relative w-full flex items-center justify-center overflow-hidden"
        style={{ height: 240, background: card.bgColor }}
      >
        <span style={{ fontSize: 96 }}>{card.emoji}</span>

        {/* Sponsored badge */}
        {card.sponsored && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-gradient-to-r from-gold to-gold-light text-black text-[10px] font-bold px-3 py-1.5 rounded-full">
            ⭐ Sponsored
          </div>
        )}

        {/* SAVE stamp */}
        <div
          className="absolute top-5 left-4 bg-green-500 text-white text-sm font-black px-3 py-1.5 rounded-xl border-[2.5px] border-white rotate-[-14deg] transition-opacity"
          style={{ opacity: Math.max(0, dragOffset * 2) }}
        >
          SAVE
        </div>

        {/* NOPE stamp */}
        <div
          className="absolute top-5 right-4 bg-red-500 text-white text-sm font-black px-3 py-1.5 rounded-xl border-[2.5px] border-white rotate-[14deg] transition-opacity"
          style={{ opacity: Math.max(0, -dragOffset * 2) }}
        >
          NOPE
        </div>
      </div>

      {/* Card body */}
      <div className="bg-bg-2 px-5 py-4">
        <div className="flex items-start justify-between mb-1.5">
          <h3 className="text-white font-bold text-[18px] leading-tight tracking-tight flex-1 pr-2">
            {card.name}
          </h3>
          {card.rating && (
            <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
              <Star size={12} className="text-gold fill-gold" />
              <span className="text-gold text-xs font-semibold">{card.rating}</span>
            </div>
          )}
        </div>

        <p className="text-gold text-sm font-medium mb-2.5">{card.price}</p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {card.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-medium text-white/50 bg-white/5 border border-white/[0.08] px-2.5 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        <p className="text-white/50 text-[13px] leading-relaxed">{card.description}</p>
      </div>
    </motion.div>
  );
}
