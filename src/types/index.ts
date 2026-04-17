// ─── AI Intent ───────────────────────────────────────────────
export type Category =
  | "restaurants"
  | "homes"
  | "cars"
  | "products"
  | "gyms"
  | "schools"
  | "travel"
  | "beauty"
  | "health"
  | "activities"
  | "general";

export interface ParsedIntent {
  intent: "search" | "compare" | "book" | "info" | "multi";
  categories: Category[];
  location?: string;
  budget?: string;
  details: string;
  followUpQuestion?: string;
  readyToSearch: boolean;
  buyerStage?: "exploring" | "comparing" | "ready";
  priceSignal?: "budget" | "mid" | "luxury" | null;
  urgency?: "today" | "this-week" | "planning" | null;
}

// ─── Cards ───────────────────────────────────────────────────
export type CTAType = "call" | "buy" | "book" | "navigate" | "whatsapp";

export interface SwipeCard {
  id: string;
  category: Category;
  name: string;
  price: string;
  description: string;
  tags: string[];
  emoji: string;
  bgColor: string;
  sponsored: boolean;
  cta: {
    type: CTAType;
    label: string;
    value: string;
  };
  rating?: number;
  distance?: string;
  imageEmoji?: string;
}

// ─── App State ───────────────────────────────────────────────
export type AppScreen = "home" | "chat" | "swipe" | "saved";

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface AppState {
  screen: AppScreen;
  conversation: ConversationMessage[];
  parsedIntent: ParsedIntent | null;
  cards: SwipeCard[];
  savedCards: SwipeCard[];
  isLoading: boolean;
  currentCardIndex: number;
}

// ─── API ─────────────────────────────────────────────────────
export interface ConciergeRequest {
  message: string;
  conversationHistory: { role: "user" | "assistant"; content: string }[];
  sessionPrefs?: string;
}

export interface ConciergeResponse {
  reply: string;
  intent: ParsedIntent | null;
  cards: SwipeCard[];
}
