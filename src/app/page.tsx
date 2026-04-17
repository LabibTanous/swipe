"use client";

import { Component, ReactNode, useState, useCallback, useEffect, useMemo } from "react";
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

// ─── Error Boundary ──────────────────────────────────────────
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen gap-4 px-8 text-center bg-bg">
          <div className="text-5xl">⚠️</div>
          <h2 className="text-white font-bold text-lg">Something went wrong</h2>
          <p className="text-white/40 text-sm leading-relaxed">{this.state.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, message: "" })}
            className="px-6 py-3 bg-white text-black font-semibold rounded-2xl text-sm"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

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

const CAT_LABELS: Record<string, string> = {
  restaurants: "Restaurants", homes: "Homes", cars: "Cars",
  products: "Shopping", gyms: "Gyms", schools: "Schools",
  travel: "Travel", activities: "Activities", beauty: "Beauty",
  health: "Health",
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
  const [pendingQuery, setPendingQuery] = useState<string | null>(null);

  // ─── Session preference summary (passed to AI each request) ─
  const sessionPrefs = useMemo(() => {
    if (savedCards.length === 0) return undefined;
    const counts = savedCards.reduce((acc, card) => {
      acc[card.category] = (acc[card.category] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const top = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat, n]) => (n > 1 ? `${cat} ×${n}` : cat))
      .join(", ");
    return `User has saved ${savedCards.length} item(s) this session. Interests: ${top}.`;
  }, [savedCards]);

  // ─── Hydrate from localStorage on mount ───────────────────
  useEffect(() => {
    try {
      const storedSaved = localStorage.getItem("swipe_saved");
      if (storedSaved) setSavedCards(JSON.parse(storedSaved));
    } catch {}

    try {
      const storedConvo = localStorage.getItem("swipe_conversation");
      if (storedConvo) {
        const parsed = JSON.parse(storedConvo);
        setConversation(
          parsed.map((m: ConversationMessage & { timestamp: string }) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          }))
        );
      }
    } catch {}
  }, []);

  // ─── Persist saved cards ───────────────────────────────────
  useEffect(() => {
    try {
      localStorage.setItem("swipe_saved", JSON.stringify(savedCards));
    } catch {}
  }, [savedCards]);

  // ─── Persist conversation (last 30 messages) ──────────────
  useEffect(() => {
    try {
      localStorage.setItem(
        "swipe_conversation",
        JSON.stringify(conversation.slice(-30))
      );
    } catch {}
  }, [conversation]);

  const navTo = useCallback((next: AppScreen) => {
    setPrevScreen(screen);
    setScreen(next);
  }, [screen]);

  const dir = SCREEN_ORDER[screen] - SCREEN_ORDER[prevScreen];

  // ─── Fire pending query once chat screen has mounted ──────
  useEffect(() => {
    if (screen === "chat" && pendingQuery) {
      const query = pendingQuery;
      setPendingQuery(null);
      handleSend(query);
    }
    // handleSend is intentionally excluded — it's stable by the time
    // this fires because conversation has already been reset to []
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, pendingQuery]);

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
        sessionPrefs,
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

      const aiMsg: ConversationMessage = {
        role: "assistant",
        content: data.reply,
        timestamp: new Date(),
      };
      setConversation((prev) => [...prev, aiMsg]);

      if (data.intent?.readyToSearch && data.cards.length > 0) {
        setIntent(data.intent);
        setCards(data.cards);

        const cats = data.intent.categories;
        const title =
          cats.length === 1
            ? CAT_LABELS[cats[0]] ?? "Results"
            : `${cats.length} Categories`;
        setSwipeTitle(title);

        setTimeout(() => navTo("swipe"), 900);
      } else if (data.intent?.readyToSearch && data.cards.length === 0) {
        // AI was ready to search but no cards matched — tell the user
        const noResultsMsg: ConversationMessage = {
          role: "assistant",
          content: "Hmm, I couldn't find any matches for that right now. Try tweaking your search — different area, budget, or category?",
          timestamp: new Date(),
        };
        setConversation((prev) => [...prev, noResultsMsg]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      const errorMsg: ConversationMessage = {
        role: "assistant",
        content: msg.includes("429")
          ? "You're sending messages a bit fast — give it a moment and try again."
          : "Sorry, something went wrong. Check your API key in .env.local and try again.",
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
    try { localStorage.removeItem("swipe_conversation"); } catch {}
    navTo("home");
  }, [navTo]);

  // ─── Kick off from home ────────────────────────────────────
  const handleHomeSearch = useCallback((query: string) => {
    setConversation([]);
    setCards([]);
    setIntent(null);
    setPendingQuery(query);
    navTo("chat");
  }, [navTo]);

  // ─── Save / unsave a card ──────────────────────────────────
  const handleSave = useCallback((card: SwipeCard) => {
    setSavedCards((prev) => {
      if (prev.find((c) => c.id === card.id)) return prev;
      return [...prev, card];
    });
  }, []);

  const handleUnsave = useCallback((id: string) => {
    setSavedCards((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // ─── Render ────────────────────────────────────────────────
  return (
    <ErrorBoundary>
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
                  onUnsave={handleUnsave}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </ErrorBoundary>
  );
}
