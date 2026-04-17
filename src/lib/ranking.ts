import { ParsedIntent, SwipeCard } from "@/types";

export function rankCards(cards: SwipeCard[], intent: ParsedIntent): SwipeCard[] {
  return cards
    .map((card) => ({ card, score: scoreCard(card, intent) }))
    .sort((a, b) => b.score - a.score)
    .map(({ card }) => card);
}

function scoreCard(card: SwipeCard, intent: ParsedIntent): number {
  let score = 0;

  // Paid placement — floats up but can't dominate over a 5-star result
  if (card.sponsored) score += 40;

  // Rating quality
  if (card.rating) {
    if (card.rating >= 4.7) score += 20;
    else if (card.rating >= 4.3) score += 12;
    else if (card.rating >= 4.0) score += 6;
  }

  // Budget signal match
  score += budgetScore(card, intent);

  // Real data (Google Places) gets a slight boost over mock placeholders
  if (card.id.startsWith("gp-")) score += 8;

  // Tag match against user's detail string
  if (intent.details) {
    const details = intent.details.toLowerCase();
    const matchedTags = card.tags.filter((t) =>
      details.includes(t.toLowerCase())
    ).length;
    score += matchedTags * 5;
  }

  // Buyer stage: ready buyers should see higher-confidence results first
  if (intent.buyerStage === "ready" && card.rating && card.rating >= 4.5) score += 10;

  return score;
}

function budgetScore(card: SwipeCard, intent: ParsedIntent): number {
  if (!intent.priceSignal) return 0;

  const price = card.price.toLowerCase();
  const isLuxury =
    price.includes("400+") ||
    price.includes("500+") ||
    price.includes("luxury") ||
    price.includes("28,000") ||
    price.includes("22,000");
  const isBudget =
    price.includes("under") ||
    price.includes("budget") ||
    price.includes("9,500") ||
    (price.includes("aed") && extractFirstNumber(price) < 150);

  if (intent.priceSignal === "luxury" && isLuxury) return 15;
  if (intent.priceSignal === "budget" && isBudget) return 15;
  if (intent.priceSignal === "mid" && !isLuxury && !isBudget) return 15;
  return 0;
}

function extractFirstNumber(str: string): number {
  const match = str.match(/[\d,]+/);
  if (!match) return 0;
  return parseInt(match[0].replace(/,/g, ""), 10);
}
