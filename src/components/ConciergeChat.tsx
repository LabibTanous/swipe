"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { ConversationMessage } from "@/types";
import { Send, ChevronLeft, Loader2 } from "lucide-react";
import clsx from "clsx";

const EXAMPLE_PROMPTS = [
  "Find me somewhere nice to eat tonight 🍽️",
  "I'm moving to Dubai, help me with everything",
  "I want to buy a gaming chair",
  "Plan a weekend activity with friends",
];

const MAX_INPUT_LENGTH = 500;

interface Props {
  conversation: ConversationMessage[];
  onSend: (message: string) => void;
  isLoading: boolean;
  onBack: () => void;
  isFirstMessage: boolean;
}

export default function ConciergeChat({
  conversation,
  onSend,
  isLoading,
  onBack,
  isFirstMessage,
}: Props) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, isLoading]);

  const handleSend = () => {
    const val = input.trim();
    if (!val || isLoading || val.length > MAX_INPUT_LENGTH) return;
    setInput("");
    onSend(val);
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse2" />
          <span className="text-white font-semibold text-[14px]">Sami · AI Concierge</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3 scroll-smooth">
        {isFirstMessage && conversation.length === 0 && (
          <div className="animate-fade-up">
            <div className="bg-bg-3 rounded-[20px] rounded-bl-[5px] px-4 py-3.5 max-w-[85%]">
              <p className="text-white text-[15px] leading-relaxed">
                Hey! 👋 I&apos;m Sami. What do you need today?
              </p>
            </div>
          </div>
        )}

        {conversation.map((msg, i) => (
          <div
            key={i}
            className={clsx(
              "flex flex-col gap-1 animate-fade-up",
              msg.role === "user" ? "items-end" : "items-start"
            )}
          >
            <div
              className={clsx(
                "px-4 py-3.5 rounded-[20px] text-[15px] leading-relaxed max-w-[85%]",
                msg.role === "user"
                  ? "bg-white text-black rounded-br-[5px] font-medium"
                  : "bg-bg-3 text-white rounded-bl-[5px]"
              )}
            >
              {msg.content}
            </div>
            <span className="text-white/25 text-[11px] px-1">
              {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start animate-fade-up">
            <div className="bg-bg-3 px-4 py-3.5 rounded-[20px] rounded-bl-[5px] flex gap-1.5 items-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:0ms]" />
              <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:150ms]" />
              <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick replies — only shown at start */}
      {isFirstMessage && conversation.length === 0 && (
        <div className="flex-shrink-0 px-5 pb-3 flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => onSend(p)}
              className="px-4 py-2 bg-bg-3 border border-border-2 rounded-full text-[13px] font-medium text-white/70 hover:bg-bg-4 hover:text-white transition-all active:scale-95"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="flex-shrink-0 flex items-end gap-3 px-4 pb-7 pt-3 border-t border-border bg-bg">
        <div className="flex-1 flex flex-col">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, MAX_INPUT_LENGTH))}
            onKeyDown={handleKey}
            placeholder="Ask me anything..."
            rows={1}
            className={clsx(
              "w-full bg-bg-3 border border-border rounded-[22px] px-4 py-3",
              "text-white text-[15px] placeholder-white/30 resize-none outline-none",
              "max-h-[100px] leading-relaxed",
              "focus:border-white/20 transition-colors",
              input.length >= MAX_INPUT_LENGTH && "border-red-500/50"
            )}
            style={{ height: "auto" }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = `${el.scrollHeight}px`;
            }}
          />
          {input.length > MAX_INPUT_LENGTH * 0.8 && (
            <span className={clsx(
              "text-[11px] text-right px-2 pt-1",
              input.length >= MAX_INPUT_LENGTH ? "text-red-400" : "text-white/30"
            )}>
              {input.length}/{MAX_INPUT_LENGTH}
            </span>
          )}
        </div>
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className={clsx(
            "w-[42px] h-[42px] rounded-full flex items-center justify-center flex-shrink-0 transition-all",
            input.trim() && !isLoading
              ? "bg-white text-black shadow-[0_4px_16px_rgba(255,255,255,0.15)] active:scale-90"
              : "bg-bg-3 text-white/20 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
        </button>
      </div>
    </div>
  );
}
