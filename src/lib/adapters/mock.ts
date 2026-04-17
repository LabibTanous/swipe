import { DataAdapter } from "./types";
import { Category, ParsedIntent, SwipeCard } from "@/types";
import { MOCK_DATA } from "@/lib/mockData";

export class MockAdapter implements DataAdapter {
  readonly categories: Category[] = [
    "restaurants", "homes", "cars", "products", "gyms",
    "schools", "travel", "activities", "beauty", "health",
  ];

  async fetch(intent: ParsedIntent): Promise<SwipeCard[]> {
    const results: SwipeCard[] = [];

    for (const cat of intent.categories) {
      let cards = MOCK_DATA[cat] ?? [];

      // Filter by cuisine/details when the user has specified a preference
      if (intent.details && cards.length > 0) {
        const keywords = intent.details
          .toLowerCase()
          .split(/[\s,]+/)
          .filter((w) => w.length > 2);

        const filtered = cards.filter((card) =>
          keywords.some(
            (kw) =>
              card.tags.some((t) => t.toLowerCase().includes(kw)) ||
              card.name.toLowerCase().includes(kw) ||
              card.description.toLowerCase().includes(kw)
          )
        );

        // Only apply filter if it found something — otherwise show everything
        if (filtered.length > 0) cards = filtered;
      }

      results.push(...cards);
    }

    return results;
  }
}
