import { NextRequest, NextResponse } from "next/server";
import { runConcierge } from "@/lib/openai";
import { getCardsByCategory } from "@/lib/mockData";
import { ConciergeRequest, ConciergeResponse } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body: ConciergeRequest = await req.json();
    const { message, conversationHistory } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 500 });
    }

    // Call OpenAI
    const { reply, intent } = await runConcierge(message, conversationHistory ?? []);

    // If AI has understood the request, fetch cards
    const cards = intent?.readyToSearch
      ? getCardsByCategory(intent.categories)
      : [];

    const response: ConciergeResponse = { reply, intent, cards };
    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("[concierge]", error);
    const message = error instanceof Error ? error.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
