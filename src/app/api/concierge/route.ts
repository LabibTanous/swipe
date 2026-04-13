import { NextRequest, NextResponse } from "next/server";
import { getCardsByCategory } from "@/lib/mockData";
import { ConciergeRequest, ConciergeResponse, ParsedIntent, Category } from "@/types";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";

const SYSTEM_PROMPT = `You are Sami — the AI concierge inside an app called Swipe.

Swipe is a universal concierge platform. Users can ask for ANYTHING:
- Find restaurants, homes, cars, products, gyms, schools, travel, beauty, health, activities
- Buy specific products ("I want to buy a gaming chair", "compare iPhones")
- Complex multi-need requests ("I'm moving to Dubai")
- General questions and help

YOUR PERSONALITY:
- You are like a knowledgeable local friend in Dubai
- Warm, direct, no corporate speak
- Short messages — max 2-3 sentences
- Use casual language

YOUR JOB:
1. Understand what the user needs
2. Have a brief natural conversation if you need more info
3. When you have enough info, output a STRUCTURED JSON block

WHEN TO OUTPUT JSON:
- You have enough info to find relevant results
- Usually after 1-2 exchanges max
- Never ask more than 2 follow-up questions

JSON FORMAT — output this EXACTLY when ready to search:
SWIPE_READY:{"intent":"search","categories":["restaurants"],"location":"Dubai","budget":"","details":"nice dinner tonight","readyToSearch":true}

CATEGORIES AVAILABLE:
- restaurants (any food/dining request)
- homes (rent, buy, property)
- cars (buy, lease, rent any vehicle)
- products (any physical product: TVs, phones, clothes, furniture, gaming gear, etc.)
- gyms (fitness, yoga, wellness)
- schools (education, nurseries)
- travel (holidays, hotels, flights)
- activities (things to do, entertainment, experiences)
- beauty (salons, spas, grooming)
- health (clinics, doctors, dentists)

MULTI-CATEGORY EXAMPLES:
- "I'm moving to Dubai" -> categories: ["homes","cars","schools","gyms"]
- "Plan my weekend" -> categories: ["restaurants","activities"]
- "I want to buy a black shirt" -> categories: ["products"]

RULES:
- If they say "I want to buy a TV" output JSON immediately, no questions
- For product requests, output JSON right away
- Be decisive. You are a concierge, not a form.
- For greetings like "hi" or "how are you" just respond naturally without JSON
- For "what do you do" explain the app briefly then ask what they need`;

function extractIntent(text: string): { reply: string; intent: ParsedIntent | null } {
  const match = text.match(/SWIPE_READY:\s*(\{[\s\S]*?\})\s*/);
  if (!match) return { reply: text.trim(), intent: null };
  try {
    const parsed = JSON.parse(match[1]) as ParsedIntent;
    const reply = text.replace(/SWIPE_READY:[\s\S]*?\}/, "").trim();
    return {
      reply: reply || "Perfect — here's what I found for you! Swipe right to save anything you like. 👇",
      intent: { ...parsed, readyToSearch: true },
    };
  } catch {
    return { reply: text.trim(), intent: null };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: ConciergeRequest = await req.json();
    const { message, conversationHistory } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
    }

    const contents = [
      { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
      { role: "model", parts: [{ text: "Understood! I am Sami, ready to help with anything." }] },
      ...(conversationHistory ?? []).map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }]
      })),
      { role: "user", parts: [{ text: message }] }
    ];

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 400 }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gemini API error: ${err}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
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
 
