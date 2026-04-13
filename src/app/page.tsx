"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AppScreen,
  ConversationMessage,
  ParsedIntent,
  SwipeCard,
  ConciergeRequest,
  ConciergeResponse,
} from "@/types";
import HomeScreen from "@/components/HomeScreen";
import ConciergeChat from "@/components/ConciergeChat";
import SwipeDeck from "@/components/SwipeDeck";
import SavedScreen from "@/components/SavedScreen";

// ─── Screen transition variants ──────────────────────────────
const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? "100%" : "-20%",
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({
    x: dir > 0 ? "-20%" : "100%",
    opacity: 0,
  }),
};

const transition = { type: "tween", ease: [0.4, 0, 0.2, 1], duration: 0.38 };

// ─── Screen ordering for direction ───────────────────────────
const SCREEN_ORDER: Record<AppScreen, number> = {
  home: 0, chat: 1, swipe: 2, saved: 3,
};

export default function App() {
  const [screen, setScreen] = useState<AppScreen>("home");
  const [prevScreen, setPrevScreen] = useState<AppScreen>("home");
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [cards, setCards] = useState<SwipeCard[]>([]);
  const [savedCards, setSavedCards] = useState<SwipeCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [swipeTitle, setSwipeTitle] = useState("Results");
  const [intent, setIntent] = useState<ParsedIntent | null>(null);

  const navTo = useCallback((next: AppScreen) => {
    setPrevScreen(screen);
    setScreen(next);
  }, [screen]);

  const dir = SCREEN_ORDER[screen] - SCREEN_ORDER[prevScreen];

  // ─── Send message to AI ────────────────────────────────────
  const handleSend = useCallback(async (message: string) => {
    setIsLoading(true);

    const userMsg: ConversationMessage = {
      role: "user",
      content: message,
      timestamp: new Date(),
    };
    setConversation((prev) => [...prev, userMsg]);

    try {
      const historyForAPI = conversation.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const body: ConciergeRequest = {
        message,
        conversationHistory: historyForAPI,
      };

      const res = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data: ConciergeResponse = await res.json();

      if (!res.ok) {
        throw new Error((data as { error?: string }).error ?? "Request failed");
      }

      // Add AI reply to conversation
      const aiMsg: ConversationMessage = {
        role: "assistant",
        content: data.reply,
        timestamp: new Date(),
      };
      setConversation((prev) => [...prev, aiMsg]);

      // If we have cards ready, go to swipe deck
      if (data.intent?.readyToSearch && data.cards.length > 0) {
        setIntent(data.intent);
        setCards(data.cards);

        // Build a nice title from categories
        const catLabels: Record<string, string> = {
          restaurants: "Restaurants", homes: "Homes", cars: "Cars",
          products: "Shopping", gyms: "Gyms", schools: "Schools",
          travel: "Travel", activities: "Activities", beauty: "Beauty",
          health: "Health",
        };
        const cats = data.intent.categories;
        const title =
          cats.length === 1
            ? catLabels[cats[0]] ?? "Results"
            : `${cats.length} Categories`;
        setSwipeTitle(title);

        // Small delay so user reads the reply
        setTimeout(() => navTo("swipe"), 900);
      }
    } catch (err) {
      const errorMsg: ConversationMessage = {
        role: "assistant",
        content:
          "Sorry, something went wrong. Check your API key in .env.local and try again.",
        timestamp: new Date(),
      };
      setConversation((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [conversation, navTo]);

  // ─── New search ────────────────────────────────────────────
  const handleNewSearch = useCallback(() => {
    setConversation([]);
    setCards([]);
    setIntent(null);
    navTo("home");
  }, [navTo]);

  // ─── Kick off from home ────────────────────────────────────
  const handleHomeSearch = useCallback((query: string) => {
    setConversation([]);
    setCards([]);
    setIntent(null);
    navTo("chat");
    // Small delay so chat screen is mounted before sending
    setTimeout(() => handleSend(query), 100);
  }, [handleSend, navTo]);

  // ─── Save a card ───────────────────────────────────────────
  const handleSave = useCallback((card: SwipeCard) => {
    setSavedCards((prev) => {
      if (prev.find((c) => c.id === card.id)) return prev;
      return [...prev, card];
    });
  }, []);

  // ─── Render ────────────────────────────────────────────────
  return (
    <div className="flex justify-center bg-bg min-h-screen">
      <div className="relative w-full max-w-[430px] h-screen overflow-hidden bg-bg">
        {/* Status bar */}
        <div className="absolute top-0 left-0 right-0 z-10 flex justify-between px-6 pt-4 text-[12px] font-semibold text-white/30 pointer-events-none">
          <span>9:41</span>
          <span>● ● ●</span>
        </div>

        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={screen}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
            className="absolute inset-0 flex flex-col pt-10"
          >
            {screen === "home" && (
              <HomeScreen
                onSearch={handleHomeSearch}
                savedCount={savedCards.length}
                onViewSaved={() => navTo("saved")}
              />
            )}

            {screen === "chat" && (
              <ConciergeChat
                conversation={conversation}
                onSend={handleSend}
                isLoading={isLoading}
                onBack={handleNewSearch}
                isFirstMessage={conversation.length === 0}
              />
            )}

            {screen === "swipe" && (
              <SwipeDeck
                cards={cards}
                onSave={handleSave}
                onDone={() => navTo("saved")}
                onBack={() => navTo("chat")}
                title={swipeTitle}
              />
            )}

            {screen === "saved" && (
              <SavedScreen
                savedCards={savedCards}
                onBack={() => navTo(cards.length > 0 ? "swipe" : "home")}
                onNewSearch={handleNewSearch}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
