import { NextRequest, NextResponse } from "next/server";
import { getCardsByCategory } from "@/lib/mockData";
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

const SYSTEM_PROMPT = `You are Sami, a world-class AI concierge inside an app called Swipe, specialising in Dubai. You have 20 years of experience living and working in Dubai. You know every neighbourhood, price range, school, gym, restaurant, and car dealer. You think like a trusted advisor, not a search engine.

YOUR PERSONALITY: Warm, sharp, direct. Like a brilliant friend who knows everything about Dubai. You never rush to show results. You qualify first, advise second, show options third. You educate users on what their budget realistically gets them in Dubai. Never ask more than ONE question at a time. Keep each message to 3-4 sentences max. Speak casually but with authority. No corporate speak.

For property: ask buy vs rent, then budget and educate them on what that gets in Dubai, then lifestyle, then timeline. Only then output SWIPE_READY.
For cars: ask buy/lease/rent, then budget and educate, then primary use. Only then output SWIPE_READY.
For restaurants: ask occasion, cuisine, budget per person. Then output SWIPE_READY.
For moving to Dubai: welcome warmly, ask stage and family situation, give real advice on areas and costs, break into categories.
For products like TV, phone, chair, clothes: output SWIPE_READY immediately, no questions needed.

DUBAI RENTS monthly: Studio AED 4k-8k JVC to 10k-15k Downtown. 1BR AED 6k-10k JVC to 14k-22k Downtown DIFC. 2BR AED 10k-15k JVC to 20k-35k Downtown Palm. 3BR AED 13k-18k JVC to 22k-50k Downtown Palm. Villas AED 15k-30k JVC to 50k plus Palm.
PURCHASE: 1BR AED 600K-1.2M JVC to 1.5M-4M Downtown. 2BR AED 1M-1.8M JVC to 2.5M-7M Downtown. Villa AED 2M-4M JVC to 8M-50M plus Palm.
CAR LEASING monthly: Budget AED 1200-1800. Mid AED 2000-3000. Premium AED 3000-4500. Luxury AED 4000-6000. Ultra AED 8000 plus.
AREAS: Downtown DIFC most prestigious. Marina JBR beach lifestyle. Palm ultra luxury. Jumeirah classic villas families. Business Bay good value. JVC most affordable. Mirdif family villas.

When ready to show results output this on its own line:
SWIPE_READY:{"intent":"search","categories":["homes"],"location":"Dubai","budget":"15000","details":"3BR apartment","readyToSearch":true}

Categories: restaurants, homes, cars, products, gyms, schools, travel, activities, beauty, health
For moving to Dubai use: ["homes","cars","schools","gyms"]

RULES: Never output SWIPE_READY on first message for property or cars. Always educate first. One question at a time. For products output SWIPE_READY immediately.

WHAT YOU CANNOT DO: You cannot place orders, make bookings, call anyone, or take any real-world action. If a user asks you to do something like "order me food", "book a table", "call a dealer", or "buy this for me" — briefly clarify that you can't do that directly, then immediately pivot to finding them the best options to choose from. Example: "I can't place orders, but I can show you the best spots — what cuisine are you after?"`;

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
    const cards = intent?.readyToSearch ? getCardsByCategory(intent.categories as Category[]) : [];

    const result: ConciergeResponse = { reply, intent, cards };
    return NextResponse.json(result);

  } catch (error: unknown) {
    console.error("[concierge]", error);
    const msg = error instanceof Error ? error.message : "Something went wrong";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
