"use client";

import { useState, useRef, useCallback } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { SwipeCard as SwipeCardType } from "@/types";
import SwipeCard from "./SwipeCard";
import { X, Info, Check, ChevronLeft } from "lucide-react";
import clsx from "clsx";

interface Props {
  cards: SwipeCardType[];
  onSave: (card: SwipeCardType) => void;
  onDone: () => void;
  onBack: () => void;
  title: string;
}

export default function SwipeDeck({ cards, onSave, onDone, onBack, title }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const dragX = useMotionValue(0);
  const cardRotation = useTransform(dragX, [-200, 200], [-22, 22]);
  const dragOffsetNorm = useTransform(dragX, [-150, 150], [-1, 1]);
  const [dragOffsetVal, setDragOffsetVal] = useState(0);
  const isDragging = useRef(false);

  const remaining = cards.slice(currentIndex);
  const total = cards.length;
  const done = currentIndex >= total;

  const flyOut = useCallback(
    async (direction: "left" | "right") => {
      const x = direction === "right" ? 600 : -600;
      await animate(dragX, x, { duration: 0.35, ease: [0.4, 0, 0.2, 1] });
      if (direction === "right") onSave(cards[currentIndex]);
      setCurrentIndex((i) => i + 1);
      dragX.set(0);
      setDragOffsetVal(0);
    },
    [cards, currentIndex, dragX, onSave]
  );

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number } }) => {
      isDragging.current = false;
      if (info.offset.x > 88) flyOut("right");
      else if (info.offset.x < -88) flyOut("left");
      else animate(dragX, 0, { type: "spring", stiffness: 400, damping: 30 });
    },
    [flyOut, dragX]
  );

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-6 px-8 text-center animate-fade-up">
        <div className="text-6xl">✨</div>
        <div>
          <h2 className="text-white font-bold text-xl tracking-tight mb-2">All done!</h2>
          <p className="text-white/50 text-sm leading-relaxed">
            Check your saved items or search for something else.
          </p>
        </div>
        <button
          onClick={onDone}
          className="w-full py-4 bg-gradient-to-r from-gold to-gold-light text-black font-bold text-base rounded-2xl"
        >
          View Saved Items →
        </button>
        <button onClick={onBack} className="text-white/40 text-sm">
          Search for something else
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-3 px-5 py-3.5 border-b border-border">
        <button
          onClick={onBack}
          className="w-9 h-9 bg-bg-3 border border-border rounded-full flex items-center justify-center text-white/50 flex-shrink-0"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="font-semibold text-white text-[16px] flex-1 tracking-tight">{title}</span>
        <span className="text-white/40 text-[12px] font-semibold bg-bg-3 px-3 py-1.5 rounded-full border border-border">
          {currentIndex + 1} / {total}
        </span>
      </div>

      {/* Card stack */}
      <div className="flex-1 relative flex items-center justify-center px-4 py-3">
        {/* Stack of up to 3 cards */}
        {remaining.slice(0, 3).map((card, i) => (
          i === 0 ? (
            <motion.div
              key={card.id}
              className="absolute w-full cursor-grab active:cursor-grabbing"
              style={{ x: dragX, rotate: cardRotation, zIndex: 10 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.8}
              onDrag={(_, info) => {
                isDragging.current = true;
                setDragOffsetVal(info.offset.x / 150);
              }}
              onDragEnd={handleDragEnd}
            >
              <SwipeCard card={card} isTop stackIndex={0} dragOffset={dragOffsetVal} />
            </motion.div>
          ) : (
            <SwipeCard key={card.id} card={card} isTop={false} stackIndex={i} dragOffset={0} />
          )
        ))}

        {/* Swipe hint */}
        <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-4 pointer-events-none">
          <span className="text-[11px] font-semibold text-red-500/50">✕ Nope</span>
          <span className="text-[11px] text-white/20">— swipe —</span>
          <span className="text-[11px] font-semibold text-green-500/50">✓ Save</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex-shrink-0 flex items-center justify-center gap-4 px-6 pb-8 pt-2">
        <button
          onClick={() => flyOut("left")}
          className={clsx(
            "w-[60px] h-[60px] rounded-full flex items-center justify-center text-xl transition-all",
            "bg-bg-3 border border-red-500/30 text-red-500",
            "hover:bg-red-500/10 active:scale-90"
          )}
        >
          <X size={22} />
        </button>
        <button
          onClick={() => {}}
          className="w-[46px] h-[46px] rounded-full flex items-center justify-center bg-bg-3 border border-border text-white/40 hover:bg-bg-4 active:scale-90 transition-all"
        >
          <Info size={16} />
        </button>
        <button
          onClick={() => flyOut("right")}
          className={clsx(
            "w-[60px] h-[60px] rounded-full flex items-center justify-center text-xl transition-all",
            "bg-green-500 text-white",
            "shadow-[0_8px_24px_rgba(52,199,89,0.3)] hover:bg-green-400 active:scale-90"
          )}
        >
          <Check size={22} />
        </button>
      </div>
    </div>
  );
}
