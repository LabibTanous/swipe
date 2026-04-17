import { ParsedIntent, SwipeCard, Category } from "@/types";
import { DataAdapter } from "./types";
import { MockAdapter } from "./mock";
import { GooglePlacesAdapter } from "./google-places";
import { rankCards } from "@/lib/ranking";

// ─── Registry ─────────────────────────────────────────────────
// Real adapters are registered when their API key is available.
// Mock adapter is always the final fallback.
const realAdapters: DataAdapter[] = [];

if (process.env.GOOGLE_PLACES_API_KEY) {
  realAdapters.push(new GooglePlacesAdapter(process.env.GOOGLE_PLACES_API_KEY));
  console.log("[adapters] Google Places adapter registered");
} else {
  console.warn("[adapters] GOOGLE_PLACES_API_KEY not set — using mock data only");
}

const mockAdapter = new MockAdapter();

// ─── Main fetch ───────────────────────────────────────────────
export async function fetchCards(intent: ParsedIntent): Promise<SwipeCard[]> {
  const allCards: SwipeCard[] = [];

  for (const category of intent.categories) {
    const realAdapter = realAdapters.find((a) =>
      a.categories.includes(category as Category)
    );

    if (realAdapter) {
      try {
        const cards = await realAdapter.fetch({ ...intent, categories: [category as Category] });
        if (cards.length > 0) {
          allCards.push(...cards);
          continue;
        }
      } catch (err) {
        console.error(`[adapter] ${category} real adapter failed, falling back`, err);
      }
    }

    // Fall back to mock for this category
    const mockCards = await mockAdapter.fetch({ ...intent, categories: [category as Category] });
    allCards.push(...mockCards);
  }

  return rankCards(allCards, intent);
}
