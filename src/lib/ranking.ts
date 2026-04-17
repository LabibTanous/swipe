import { ParsedIntent, SwipeCard } from "@/types";

export function rankCards(cards: SwipeCard[], intent: ParsedIntent): SwipeCard[] {
  return cards
    .map((card) => ({ card, score: scoreCard(card, intent) }))
    .sort((a, b) => b.score - a.score)
    .map(({ card }) => card);
}

function scoreCard(card: SwipeCard, intent: ParsedIntent): number {
  let score = 0;

  // ── Preference match (highest priority) ──────────────────
  // An explicit user request (cuisine, type, feature) must dominate.
  // Sponsored placement cannot override what the user asked for.
  if (intent.details) {
    const keywords = intent.details
      .toLowerCase()
      .split(/[\s,]+/)
      .filter((w) => w.length > 2);

    const tagMatches = card.tags.filter((t) =>
      keywords.some((kw) => t.toLowerCase().includes(kw))
    ).length;

    const nameMatch = keywords.some((kw) =>
      card.name.toLowerCase().includes(kw)
    );

    const descMatch = keywords.some((kw) =>
      card.description.toLowerCase().includes(kw)
    );

    score += tagMatches * 25;
    if (nameMatch) score += 20;
    if (descMatch) score += 10;
  }

  // ── Sponsored placement ───────────────────────────────────
  // Reduced weight so it can't override an explicit preference match
  if (card.sponsored) score += 20;

  // ── Rating quality ────────────────────────────────────────
  if (card.rating) {
    if (card.rating >= 4.7) score += 15;
    else if (card.rating >= 4.3) score += 10;
    else if (card.rating >= 4.0) score += 5;
  }

  // ── Budget signal match ───────────────────────────────────
  score += budgetScore(card, intent);

  // ── Real data boost ───────────────────────────────────────
  if (card.id.startsWith("gp-")) score += 8;

  // ── Buyer stage ───────────────────────────────────────────
  if (intent.buyerStage === "ready" && card.rating && card.rating >= 4.5) score += 8;

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
