"use client";

import { SwipeCard } from "@/types";
import { Phone, ShoppingCart, Calendar, ChevronLeft, ExternalLink, MessageCircle } from "lucide-react";
import clsx from "clsx";

interface Props {
  savedCards: SwipeCard[];
  onBack: () => void;
  onNewSearch: () => void;
}

const ctaConfig = {
  call: { icon: Phone, bg: "bg-green-500", label: "Call Now" },
  buy: { icon: ShoppingCart, bg: "bg-blue-500", label: "Buy Now" },
  book: { icon: Calendar, bg: "bg-bg-4 border border-border", label: "Book" },
  navigate: { icon: ExternalLink, bg: "bg-bg-4 border border-border", label: "View" },
  whatsapp: { icon: MessageCircle, bg: "bg-[#25D366]", label: "WhatsApp" },
};

export default function SavedScreen({ savedCards, onBack, onNewSearch }: Props) {
  const handleCTA = (card: SwipeCard) => {
    const { type, value } = card.cta;
    if (type === "call" || type === "whatsapp") {
      window.location.href = value;
    } else if (type === "buy" || type === "book" || type === "navigate") {
      window.open(value, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-3 px-5 py-3.5 border-b border-border">
        <button
          onClick={onBack}
          className="w-9 h-9 bg-bg-3 border border-border rounded-full flex items-center justify-center text-white/50"
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          <h1 className="text-white font-bold text-[17px] tracking-tight">Saved 💛</h1>
          <p className="text-white/40 text-xs mt-0.5">
            {savedCards.length} {savedCards.length === 1 ? "match" : "matches"}
          </p>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
        {savedCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center py-16">
            <span className="text-5xl">💛</span>
            <p className="text-white/50 text-sm leading-relaxed max-w-[220px]">
              Swipe right on anything you like and it&apos;ll appear here.
            </p>
          </div>
        ) : (
          <>
            {savedCards.map((card, i) => {
              const cta = ctaConfig[card.cta.type] || ctaConfig.book;
              const CtaIcon = cta.icon;

              return (
                <div
                  key={`${card.id}-${i}`}
                  className="bg-bg-2 border border-border rounded-[20px] p-4 flex items-center gap-3 animate-fade-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div
                    className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: card.bgColor }}
                  >
                    {card.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-[14px] leading-tight truncate">
                      {card.name}
                    </p>
                    <p className="text-gold text-[13px] font-medium mt-0.5">{card.price}</p>
                    <p className="text-white/35 text-[11px] mt-0.5 capitalize">
                      {card.category}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCTA(card)}
                    className={clsx(
                      "flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-bold whitespace-nowrap flex-shrink-0",
                      "text-white transition-all active:scale-95",
                      cta.bg
                    )}
                  >
                    <CtaIcon size={12} />
                    {card.cta.label}
                  </button>
                </div>
              );
            })}

            <button
              onClick={onNewSearch}
              className="w-full py-4 bg-white text-black font-bold text-[15px] rounded-2xl mt-2 active:scale-[0.98] transition-transform"
            >
              Search for Something Else →
            </button>
          </>
        )}
      </div>
    </div>
  );
}
