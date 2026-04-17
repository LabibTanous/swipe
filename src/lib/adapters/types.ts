import { Category, ParsedIntent, SwipeCard } from "@/types";

export interface DataAdapter {
  readonly categories: Category[];
  fetch(intent: ParsedIntent): Promise<SwipeCard[]>;
}
