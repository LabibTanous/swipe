import { NextRequest, NextResponse } from "next/server";
import { getCardsByCategory } from "@/lib/mockData";
import { SYSTEM_PROMPT } from "@/lib/systemPrompt";
import { ConciergeRequest, ConciergeResponse, ParsedIntent, Category } from "@/types";

// ─── Rate limiting (10 requests per minute per IP) ───────────
const RATE_LIMIT_REQUESTS = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;
const rateLimitMap = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const timestamps = (rateLimitMap.get(ip) ?? []).filter((t) => t > windowStart);
  if (timestamps.length >= RATE_LIMIT_REQUESTS) return true;
  rateLimitMap.set(ip, [...timestamps, now]);
  return false;
}

// ─── Valid categories set for sanitising AI output ───────────
const VALID_CATEGORIES = new Set<Category>([
  "restaurants", "homes", "cars", "products", "gyms",
  "schools", "travel", "activities", "beauty", "health",
]);

function extractIntent(text: string): { reply: string; intent: ParsedIntent | null } {
  const match = text.match(/SWIPE_READY:\s*(\{[\s\S]*?\})/);
  if (!match) return { reply: text.trim(), intent: null };
  try {
    const parsed = JSON.parse(match[1]) as ParsedIntent;
    const reply = text.replace(/SWIPE_READY:\s*\{[\s\S]*?\}/, "").trim();
    return {
      reply: reply || "Perfect — here's what I found for you! Swipe right to save anything you like.",
      intent: { ...parsed, readyToSearch: true },
    };
  } catch {
    return { reply: text.trim(), intent: null };
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
    }

    const body: ConciergeRequest = await req.json();
    const { message, conversationHistory } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (message.length > 500) {
      return NextResponse.json({ error: "Message too long (max 500 characters)" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GROQ_API_KEY not configured" }, { status: 500 });
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(conversationHistory ?? []).map((m) => ({
        role: m.role,
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages,
        max_tokens: 600,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Groq API error: ${err}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "";
    const { reply, intent } = extractIntent(content);

    // Strip any categories the AI hallucinated that don't exist in mock data
    const safeCategories = (intent?.categories ?? []).filter((c): c is Category =>
      VALID_CATEGORIES.has(c as Category)
    );

    const cards =
      intent?.readyToSearch && safeCategories.length > 0
        ? getCardsByCategory(safeCategories)
        : [];

    const result: ConciergeResponse = {
      reply,
      intent: intent ? { ...intent, categories: safeCategories } : null,
      cards,
    };
    return NextResponse.json(result);

  } catch (error: unknown) {
    console.error("[concierge]", error);
    const msg = error instanceof Error ? error.message : "Something went wrong";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
