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
      results.push(...(MOCK_DATA[cat] ?? []));
    }
    return results;
  }
}
