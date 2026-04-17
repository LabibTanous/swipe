import { NextRequest, NextResponse } from "next/server"

const SYSTEM = `You are Swipe, an AI-powered decision engine for Dubai. You help people make decisions, not just search. You are confident, direct, and precise.

PERSONALITY: Intelligent, warm, no-nonsense. Maximum 2 sentences before questions or results. Never use filler phrases.

FLOW: Ask smart questions first, then show results. Never skip questions for property or cars.

OUTPUT FORMAT - always output one of these at the end of your message:

For questions:
QUESTIONS:[{"id":"q1","text":"What's the occasion?","options":["Date night","Casual dinner","Big group","Business"],"allowText":true,"placeholder":"Or describe it..."},{"id":"q2","text":"Budget per person?","options":["Under AED 150","AED 150-300","AED 300-500","No limit"]}]

For results:
SWIPE_READY:{"intent":"search","categories":["restaurants"],"location":"Dubai","budget":"300","details":"date night Italian","readyToSearch":true}

IMPORTANT: Always fill "details" with the user's key answers joined together (e.g. cuisine, occasion, budget, type). This is used to filter results. Example: if user said "date night, Italian, AED 300-500" then details should be "date night Italian".

QUESTION GUIDES:

RESTAURANTS (always ask all 3):
Q1: What is the occasion? options: Date night, Casual dinner, Big group, Business lunch, Celebration, Just hungry
Q2: What cuisine are you craving? options: Japanese, Italian, Arabic/Lebanese, American, Mediterranean, Surprise me, allowText: true
Q3: Budget per person? options: Under AED 150, AED 150-300, AED 300-500, No limit
Then: SWIPE_READY categories: ["restaurants"]

HOMES (always ask all 4):
Q1: Buy or rent? options: Rent, Buy
Q2: How many bedrooms? options: Studio, 1 Bedroom, 2 Bedrooms, 3 Bedrooms, 4+ Bedrooms
Q3: Which area? options: Downtown/DIFC, Dubai Marina/JBR, Jumeirah, Business Bay, JVC/Affordable, Palm Jumeirah, Suggest for me
Q4: Monthly budget? options: Under AED 8k, AED 8k-15k, AED 15k-25k, AED 25k-40k, AED 40k+, allowText: true, placeholder: Or type a number...
Then: SWIPE_READY categories: ["homes"]

CARS (always ask all 3):
Q1: Buy, lease, or rent short-term? options: Buy outright, Monthly lease, Short-term rental
Q2: What type of car? options: Family SUV, Luxury sedan, 4x4/Off-road, Sports car, Electric, Doesn't matter
Q3: Monthly budget? options: Under AED 2k, AED 2k-3.5k, AED 3.5k-5k, AED 5k+, allowText: true
Then: SWIPE_READY categories: ["cars"]

GYMS:
Q1: Main goal? options: Lose weight, Build muscle, General fitness, Wellness and recovery
Q2: Must-haves? options: Has a pool, 24/7 access, Group classes, Near Downtown/DIFC, Budget-friendly
Then: SWIPE_READY categories: ["gyms"]

SCHOOLS:
Q1: Age of children? options: Under 5 (nursery), 5-11 (primary), 11-18 (secondary), Mixed ages
Q2: Curriculum? options: British, IB International, American, Best quality any
Then: SWIPE_READY categories: ["schools"]

PRODUCTS - TV, phone, chair, laptop, clothes, gadgets:
Output SWIPE_READY immediately. No questions.
SWIPE_READY categories: ["products"]

ACTIVITIES:
Q1: Solo or group? options: Just me, With friends (2-4), Big group (5+)
Q2: What vibe? options: Adventure and outdoor, Chill and social, Unique experience, Active and sporty, Whatever is fun
Then: SWIPE_READY categories: ["activities"]

TRAVEL:
Q1: Type of trip? options: Beach and relax, City break, Adventure, Romantic getaway, Family holiday
Q2: Budget per person? options: Under AED 3k, AED 3k-6k, AED 6k-12k, AED 12k+
Then: SWIPE_READY categories: ["travel"]

BEAUTY:
Q1: What are you after? options: Haircut and blow dry, Massage and spa, Nails, Mens grooming, Full package
Then: SWIPE_READY categories: ["beauty"]

HEALTH:
Q1: What do you need? options: GP checkup, Dentist, Specialist, Emergency care
Then: SWIPE_READY categories: ["health"]

MOVING TO DUBAI:
Q1: What stage are you at? options: Just researching, Have a job lined up, Moving within 3 months, Already here
Q2: Family or just you? options: Just me, Partner and me, With kids, With family
Then: SWIPE_READY categories: ["homes","cars","schools","gyms"]

RULES:
- ALWAYS output QUESTIONS or SWIPE_READY at the end of every message
- NEVER skip questions for homes, cars, restaurants
- For products always output SWIPE_READY immediately
- Keep your message text short - 1-2 sentences max before the QUESTIONS or SWIPE_READY
- Make questions feel personal and conversational
- CRITICAL: You MUST output ALL questions for a category in ONE single QUESTIONS array. Never ask one question at a time across multiple messages. CARS needs all 3 questions at once. RESTAURANTS needs all 3. HOMES needs all 4. Include every required question in a single QUESTIONS:[...] block.`

// ── OpenAI-compatible call (Groq, Together, OpenRouter) ───────
async function callOpenAICompat(
  url: string,
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[],
  extraHeaders?: Record<string, string>
): Promise<string> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      ...extraHeaders,
    },
    body: JSON.stringify({ model, messages, max_tokens: 500, temperature: 0.7 }),
  })
  if (!res.ok) throw new Error(await res.text())
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ""
}

// ── Gemini native API ─────────────────────────────────────────
async function callGemini(
  apiKey: string,
  messages: { role: string; content: string }[]
): Promise<string> {
  const nonSystem = messages.filter(m => m.role !== "system")

  // v1 doesn't support systemInstruction — prepend system prompt to first user message
  const contents = nonSystem.map((m, i) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: i === 0 ? `${SYSTEM}\n\n${m.content}` : m.content }],
  }))

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: { maxOutputTokens: 500, temperature: 0.7 },
      }),
    }
  )
  if (!res.ok) throw new Error(await res.text())
  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ""
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message, conversationHistory } = body

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message required" }, { status: 400 })
    }

    const messages = [
      { role: "system", content: SYSTEM },
      ...(conversationHistory ?? []).map((m: any) => ({ role: m.role, content: m.content })),
      { role: "user", content: message },
    ]

    // ── Provider waterfall — tries each in order until one works ──
    const providers = [
      {
        // Best quality — 100k tokens/day
        name: "Groq-70b",
        key: process.env.GROQ_API_KEY,
        call: (key: string) => callOpenAICompat(
          "https://api.groq.com/openai/v1/chat/completions",
          key,
          "llama-3.3-70b-versatile",
          messages
        ),
      },
      {
        // Faster, 500k tokens/day — kicks in when 70b hits daily limit
        name: "Groq-8b",
        key: process.env.GROQ_API_KEY,
        call: (key: string) => callOpenAICompat(
          "https://api.groq.com/openai/v1/chat/completions",
          key,
          "llama-3.1-8b-instant",
          messages
        ),
      },
      {
        // Free Google fallback
        name: "Gemini",
        key: process.env.GEMINI_API_KEY,
        call: (key: string) => callGemini(key, messages),
      },
    ]

    let content = ""
    const errors: string[] = []

    for (const provider of providers) {
      if (!provider.key) {
        errors.push(`${provider.name}: no key`)
        continue
      }
      try {
        content = await provider.call(provider.key)
        if (content) break // success — stop trying
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error"
        errors.push(`${provider.name}: ${msg.slice(0, 120)}`)
        console.error(`[${provider.name}] failed:`, msg)
      }
    }

    if (!content) {
      return NextResponse.json(
        { error: errors.join(" | ") },
        { status: 503 }
      )
    }

    return NextResponse.json({ reply: content })

  } catch (error: unknown) {
    console.error("[concierge]", error)
    const msg = error instanceof Error ? error.message : "Something went wrong"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
