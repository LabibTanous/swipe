"use client";

import { useState, KeyboardEvent } from "react";
import { Send } from "lucide-react";

const PILLS = [
  "🍽️ Where to eat tonight",
  "🏠 Find me a flat in Dubai",
  "🎮 Buy a gaming chair",
  "🤙 Activities with friends",
];

const MAX_INPUT_LENGTH = 500;

interface Props {
  onSearch: (query: string) => void;
  savedCount: number;
  onViewSaved: () => void;
}

export default function HomeScreen({ onSearch, savedCount, onViewSaved }: Props) {
  const [input, setInput] = useState("");

  const go = () => {
    const val = input.trim();
    if (!val || val.length > MAX_INPUT_LENGTH) return;
    onSearch(val);
    setInput("");
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") go();
  };

  return (
    <div className="flex flex-col h-full justify-center items-center px-6">
      {/* Saved button top-right */}
      {savedCount > 0 && (
        <button
          onClick={onViewSaved}
          className="absolute top-14 right-5 flex items-center gap-1.5 px-3.5 py-2 bg-bg-3 border border-border rounded-full text-[13px] font-semibold text-gold animate-fade-in"
        >
          💛 {savedCount} saved
        </button>
      )}

      {/* Logo */}
      <div className="mb-12 text-center animate-fade-up">
        <h1 className="text-[64px] font-black tracking-[-5px] leading-none bg-gradient-to-b from-white via-white/90 to-white/40 bg-clip-text text-transparent font-display">
          swipe.
        </h1>
        <p className="text-white/35 text-[13px] font-medium tracking-[3px] uppercase mt-2">
          AI Concierge
        </p>
      </div>

      {/* Search bar */}
      <div className="w-full relative mb-4 animate-fade-up [animation-delay:100ms]">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, MAX_INPUT_LENGTH))}
          onKeyDown={handleKey}
          placeholder="What do you need?"
          autoFocus
          maxLength={MAX_INPUT_LENGTH}
          className="w-full bg-bg-2 border border-border focus:border-white/20 rounded-[28px] px-5 pr-14 py-[18px] text-white text-[16px] placeholder-white/25 outline-none transition-all"
        />
        <button
          onClick={go}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-[42px] h-[42px] bg-white rounded-full flex items-center justify-center text-black transition-all active:scale-90 disabled:opacity-30"
          disabled={!input.trim()}
        >
          <Send size={16} />
        </button>
      </div>

      {/* Example pills */}
      <div className="flex flex-wrap justify-center gap-2 animate-fade-up [animation-delay:200ms]">
        {PILLS.map((pill) => (
          <button
            key={pill}
            onClick={() => onSearch(pill.replace(/^\S+\s/, ""))}
            className="px-4 py-2 bg-bg-2 border border-border rounded-full text-[13px] font-medium text-white/50 hover:text-white hover:bg-bg-3 transition-all active:scale-95"
          >
            {pill}
          </button>
        ))}
      </div>
    </div>
  );
}
