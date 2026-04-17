"use client"
import { useState, useCallback, useRef, useEffect } from "react"
import { SwipeCard } from "@/types"

type Screen = "home" | "onboarding" | "thinking" | "questions" | "swipe" | "picks"

interface Question {
  id: string
  text: string
  options?: string[]
  allowText?: boolean
  placeholder?: string
}

function parseAIResponse(text: string) {
  let reply = text
  let questions: Question[] = []
  let categories: string[] = []
  let details = ""
  let ready = false
  let budget = 0

  const swipeMatch = text.match(/SWIPE_READY:\s*(\{[^}]*\})/)
  if (swipeMatch) {
    try {
      const parsed = JSON.parse(swipeMatch[1])
      categories = parsed.categories || []
      details = parsed.details || ""
      budget = parsed.budget ? parseInt(parsed.budget) : 0
      ready = true
      reply = text.replace(/SWIPE_READY:\s*\{[^}]+\}/, "").trim()
    } catch {}
  }

  const qSearchIdx = text.search(/QUESTIONS:\s*\[/)
  if (qSearchIdx !== -1) {
    const bracketStart = text.indexOf("[", qSearchIdx)
    let depth = 1; let end = -1
    for (let i = bracketStart + 1; i < text.length; i++) {
      if (text[i] === "[") depth++
      else if (text[i] === "]") { depth--; if (depth === 0) { end = i + 1; break } }
    }
    if (end !== -1) {
      try {
        questions = JSON.parse(text.slice(bracketStart, end))
        reply = reply.replace(text.slice(qSearchIdx, end), "").trim()
      } catch {}
    }
  }

  return { reply, questions, categories, details, budget, ready }
}

// ── Haptic ────────────────────────────────────────────────────
function haptic(ms = 8) {
  if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(ms)
}

// ── Onboarding ────────────────────────────────────────────────
function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)
  const steps = [
    { icon: "💬", title: "Tell Swipe what you need", sub: "Just type naturally" },
    { icon: "✦",  title: "Answer a couple quick questions", sub: "2–3 at most, we promise" },
    { icon: "👆", title: "Swipe through the best options", sub: "Curated just for you" },
    { icon: "⚡", title: "Contact in one tap", sub: "WhatsApp or call instantly" },
  ]
  const allShown = step >= steps.length

  useEffect(() => {
    if (allShown) return
    const t = setTimeout(() => setStep(s => s + 1), 950)
    return () => clearTimeout(t)
  }, [step, allShown])

  return (
    <div className="anim-fade-in flex flex-col items-center justify-center h-full px-8 text-center bg-[#0d0d0d]">
      <div className="mb-12">
        <h1 className="text-[56px] font-black tracking-[-4px] text-white leading-none">swipe.</h1>
        <p className="text-[11px] tracking-[3px] uppercase text-white/30 mt-2.5">AI Decision Engine · Dubai</p>
      </div>

      <div className="w-full max-w-[300px] flex flex-col gap-4 mb-14">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-4"
            style={{
              opacity: i < step ? 1 : 0,
              transform: i < step ? "translateY(0)" : "translateY(14px)",
              transition: "opacity 0.45s cubic-bezier(0.16,1,0.3,1), transform 0.45s cubic-bezier(0.16,1,0.3,1)",
            }}>
            <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center text-xl flex-shrink-0">{s.icon}</div>
            <div className="text-left">
              <p className="text-white text-[15px] font-semibold leading-tight">{s.title}</p>
              <p className="text-white/40 text-[12px] mt-0.5">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ opacity: allShown ? 1 : 0, transform: allShown ? "translateY(0)" : "translateY(10px)", transition: "opacity 0.4s ease 0.15s, transform 0.4s ease 0.15s" }}>
        <button onClick={onDone}
          className="px-10 py-4 bg-white rounded-2xl text-[#0d0d0d] font-bold text-[16px] active:scale-95 transition-transform shadow-lg">
          Let&apos;s go →
        </button>
      </div>
    </div>
  )
}

// ── Card ──────────────────────────────────────────────────────
function Card({ card, onLike, onPass, onDragProgress, position }: {
  card: SwipeCard
  onLike: () => void
  onPass: () => void
  onDragProgress?: (p: number) => void
  position: number
}) {
  const el = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const curX = useRef(0)
  const lastX = useRef(0)
  const lastT = useRef(0)
  const velX = useRef(0)
  const dragging = useRef(false)

  const gx = (e: MouseEvent | TouchEvent) => "touches" in e ? e.touches[0].clientX : e.clientX

  const start = (e: React.MouseEvent | React.TouchEvent) => {
    dragging.current = true
    startX.current = gx(e.nativeEvent)
    lastX.current = 0; lastT.current = Date.now(); velX.current = 0; curX.current = 0
    if (el.current) el.current.style.transition = "none"
  }

  const move = useCallback((e: MouseEvent | TouchEvent) => {
    if (!dragging.current || !el.current) return
    const now = Date.now()
    const x = gx(e) - startX.current
    velX.current = (x - lastX.current) / Math.max(1, now - lastT.current)
    lastX.current = x; lastT.current = now; curX.current = x
    el.current.style.transform = `translateX(${x}px) rotate(${x * 0.055}deg)`
    onDragProgress?.(Math.min(1, Math.abs(x) / 120))
    const L = el.current.querySelector(".ls") as HTMLElement
    const N = el.current.querySelector(".ns") as HTMLElement
    if (x > 30) {
      if (L) L.style.opacity = String(Math.min(1, (x - 30) / 55))
      if (N) N.style.opacity = "0"
    } else if (x < -30) {
      if (N) N.style.opacity = String(Math.min(1, (-x - 30) / 55))
      if (L) L.style.opacity = "0"
    } else {
      if (L) L.style.opacity = "0"
      if (N) N.style.opacity = "0"
    }
  }, [onDragProgress])

  const end = useCallback(() => {
    if (!dragging.current || !el.current) return
    dragging.current = false
    const x = curX.current; const vel = velX.current
    const goRight = x > 80 || (x > 20 && vel > 0.5)
    const goLeft  = x < -80 || (x < -20 && vel < -0.5)
    const L = el.current.querySelector(".ls") as HTMLElement
    const N = el.current.querySelector(".ns") as HTMLElement
    if (goRight) {
      haptic(12)
      el.current.style.transition = "transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.3s"
      el.current.style.transform = `translateX(130vw) rotate(26deg)`
      el.current.style.opacity = "0"
      setTimeout(onLike, 260)
    } else if (goLeft) {
      haptic(8)
      el.current.style.transition = "transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.3s"
      el.current.style.transform = `translateX(-130vw) rotate(-26deg)`
      el.current.style.opacity = "0"
      setTimeout(onPass, 260)
    } else {
      el.current.style.transition = "transform 0.5s cubic-bezier(0.175,0.885,0.32,1.275)"
      el.current.style.transform = ""
      if (L) L.style.opacity = "0"
      if (N) N.style.opacity = "0"
    }
    curX.current = 0
    onDragProgress?.(0)
  }, [onLike, onPass, onDragProgress])

  useEffect(() => {
    window.addEventListener("mousemove", move)
    window.addEventListener("touchmove", move, { passive: false })
    window.addEventListener("mouseup", end)
    window.addEventListener("touchend", end)
    return () => {
      window.removeEventListener("mousemove", move)
      window.removeEventListener("touchmove", move)
      window.removeEventListener("mouseup", end)
      window.removeEventListener("touchend", end)
    }
  }, [move, end])

  return (
    <div ref={el} onMouseDown={start} onTouchStart={start}
      className="w-full h-full cursor-grab active:cursor-grabbing select-none relative overflow-hidden"
      style={{ touchAction: "none" }}>

      {/* Full-bleed background */}
      {card.image
        ? <img src={card.image} alt={card.name} className="absolute inset-0 w-full h-full object-cover"
            onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
        : <div className="absolute inset-0 flex items-center justify-center" style={{ background: card.bgColor || "#1a1a2e" }}>
            <span style={{ fontSize: 120 }}>{card.emoji}</span>
          </div>
      }

      {/* Gradients */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 30%)" }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.8) 28%, rgba(0,0,0,0.15) 58%, transparent 80%)" }} />

      {/* Top badges */}
      <div className="absolute top-14 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
        {card.demand_indicator && (
          <span className="bg-black/50 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1.5 rounded-full border border-white/15">
            {card.demand_indicator}
          </span>
        )}
        {card.sponsored && (
          <span className="ml-auto bg-[#ff6b35]/90 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full tracking-wide">
            ⭐ Featured
          </span>
        )}
      </div>

      {/* SAVE / NOPE stamps */}
      <div className="ls absolute top-[36%] left-4 z-20 pointer-events-none"
        style={{ opacity: 0, transform: "rotate(-14deg)" }}>
        <div className="bg-emerald-500 text-white font-black px-5 py-2.5 rounded-2xl text-[17px] border-2 border-white shadow-lg">
          SAVE ✓
        </div>
      </div>
      <div className="ns absolute top-[36%] right-4 z-20 pointer-events-none"
        style={{ opacity: 0, transform: "rotate(14deg)" }}>
        <div className="bg-red-500 text-white font-black px-5 py-2.5 rounded-2xl text-[17px] border-2 border-white shadow-lg">
          NOPE ✕
        </div>
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-32 pt-8 z-10 pointer-events-none">
        <div className="flex items-center gap-2 mb-2.5">
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${position === 0 ? "bg-[#ff6b35] text-white" : "bg-white/15 text-white/80"}`}>
            {position === 0 ? "⚡ TOP PICK" : "✓ GOOD MATCH"}
          </span>
          {card.rating && <span className="text-[13px] text-white/60 font-medium">★ {card.rating}</span>}
        </div>
        <h3 className="text-white text-[28px] font-black tracking-tight leading-tight mb-1.5">{card.name}</h3>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[15px] font-bold text-white">{card.price}</span>
          {card.distance && <>
            <span className="text-white/25">·</span>
            <span className="text-[13px] text-white/55">📍 {card.distance}</span>
          </>}
        </div>
        {card.ai_summary && (
          <p className="text-[13px] text-white/60 leading-relaxed mb-3">{card.ai_summary}</p>
        )}
        <div className="flex flex-wrap gap-1.5">
          {card.tags.slice(0, 3).map(t => (
            <span key={t} className="text-[11px] text-white/60 bg-white/10 px-2.5 py-1 rounded-full border border-white/10">{t}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Save Toast (replaces big overlay) ────────────────────────
function SaveToast({ card }: { card: SwipeCard }) {
  return (
    <div className="anim-toast fixed bottom-32 left-0 right-0 flex justify-center z-50 pointer-events-none px-6">
      <div className="bg-[#1c1c1e] border border-white/15 rounded-2xl px-5 py-3.5 flex items-center gap-3 shadow-2xl max-w-[320px] w-full">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: card.bgColor || "#2a2a2a" }}>{card.emoji}</div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-[14px] truncate">{card.name}</p>
          <p className="text-white/40 text-[12px]">Added to Your Picks</p>
        </div>
        <span className="text-emerald-400 text-[18px] flex-shrink-0">✓</span>
      </div>
    </div>
  )
}

// ── Contact Sheet ─────────────────────────────────────────────
function ContactSheet({ card, onClose, sessionId }: { card: SwipeCard; onClose: () => void; sessionId: string }) {
  const go = (type: string, val: string) => {
    haptic(10)
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listing_id: card.id, cta_type: type, session_id: sessionId }),
    }).catch(() => {})
    if (type === "call" || type === "book" || type === "whatsapp") window.location.href = val
    else window.open(val, "_blank", "noopener")
  }

  const waMessage = encodeURIComponent(`Hi, I found ${card.name} on Swipe. Is this still available?`)
  const hasWhatsApp = card.cta.type === "call" || card.cta.type === "book" || card.cta.type === "whatsapp"
  const waUrl = card.cta.type === "whatsapp"
    ? `${card.cta.value}?text=${waMessage}`
    : `https://wa.me/${card.cta.value.replace(/\D/g, "")}?text=${waMessage}`

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center anim-fade-in"
      style={{ background: "rgba(0,0,0,0.65)" }} onClick={onClose}>
      <div className="anim-slide-up w-full max-w-[430px] bg-[#1a1a1a] rounded-t-[28px] px-5 pt-2 pb-10 border-t border-white/8"
        onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-white/15 rounded-full mx-auto mb-6 mt-2" />

        {/* Card info */}
        <div className="flex items-center gap-4 mb-6 px-1">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-[28px] flex-shrink-0"
            style={{ background: card.bgColor || "#2a2a2a" }}>{card.emoji}</div>
          <div>
            <p className="font-bold text-[17px] text-white leading-tight">{card.name}</p>
            <p className="text-[14px] text-white/45 mt-0.5">{card.price}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {hasWhatsApp && (
            <button onClick={() => go("whatsapp", waUrl)}
              className="w-full py-4 rounded-2xl text-white text-[15px] font-bold flex items-center justify-center gap-2.5 active:scale-[0.97] transition-transform"
              style={{ background: "#25d366" }}>
              <span className="text-[18px]">💬</span> WhatsApp
            </button>
          )}
          {card.cta.type !== "whatsapp" && (
            <button onClick={() => go(card.cta.type, card.cta.value)}
              className="w-full py-4 rounded-2xl text-[15px] font-semibold bg-white/8 text-white flex items-center justify-center gap-2.5 border border-white/10 active:scale-[0.97] transition-transform"
              style={{ background: "rgba(255,255,255,0.08)" }}>
              <span className="text-[18px]">{card.cta.type === "call" || card.cta.type === "book" ? "📞" : "🛒"}</span>
              {card.cta.label}
            </button>
          )}
          {card.cta.type !== "buy" && (
            <button onClick={() => window.open(`https://maps.google.com?q=${encodeURIComponent(card.name + " Dubai")}`, "_blank")}
              className="w-full py-4 rounded-2xl text-[15px] font-semibold text-white flex items-center justify-center gap-2.5 border border-white/10 active:scale-[0.97] transition-transform"
              style={{ background: "rgba(255,255,255,0.06)" }}>
              <span className="text-[18px]">📍</span> View on Map
            </button>
          )}
          <button onClick={onClose} className="w-full py-4 rounded-2xl text-[14px] text-white/35 active:text-white/60 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

const PILLS = [
  { label: "🍽 Dinner tonight",        q: "Where to eat tonight" },
  { label: "🏠 Find me a flat",         q: "Find me a flat in Dubai" },
  { label: "🚗 I want a car",           q: "I want to buy a car" },
  { label: "🏋️ Best gym",              q: "Find me a gym" },
  { label: "🌴 Weekend activities",     q: "Weekend activities in Dubai" },
  { label: "✈️ Quick getaway",          q: "Plan a travel getaway" },
  { label: "💅 Spa day",               q: "I want a spa day" },
  { label: "🏫 Schools for kids",       q: "Find schools for my kids" },
]

const GREETINGS = ["hi", "hello", "hey", "what can you do", "how does this work", "help", "what is this", "what is swipe"]

export default function App() {
  const [screen, setScreen] = useState<Screen>("home")
  const [query, setQuery] = useState("")
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [cards, setCards] = useState<SwipeCard[]>([])
  const [cardIdx, setCardIdx] = useState(0)
  const [picks, setPicks] = useState<SwipeCard[]>([])
  const [contact, setContact] = useState<SwipeCard | null>(null)
  const [toast, setToast] = useState<SwipeCard | null>(null)
  const [loading, setLoading] = useState(false)
  const [freeText, setFreeText] = useState("")
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null)
  const [history, setHistory] = useState<{ role: "user" | "assistant"; content: string }[]>([])
  const [title, setTitle] = useState("Results")
  const [dragProgress, setDragProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sessionId = useRef(
    typeof window !== "undefined"
      ? (sessionStorage.getItem("swipe_sid") || (() => {
          const id = crypto.randomUUID()
          sessionStorage.setItem("swipe_sid", id)
          return id
        })())
      : "ssr"
  )

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("swipe_seen")) {
      setScreen("onboarding")
    }
  }, [])

  const showToast = (card: SwipeCard) => {
    setToast(card)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2000)
  }

  const callAI = useCallback(async (msg: string, hist: { role: "user" | "assistant"; content: string }[], originalQuery?: string) => {
    setLoading(true)
    try {
      const res = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, conversationHistory: hist }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      const newHist = [...hist, { role: "user" as const, content: msg }, { role: "assistant" as const, content: data.reply }]
      setHistory(newHist)
      const { questions: qs, categories, details, budget, ready } = parseAIResponse(data.reply)
      if (ready && categories.length > 0) {
        const searchTerm = originalQuery || details || msg
        const params = new URLSearchParams({ categories: categories.join(","), query: searchTerm, budget: String(budget) })
        const cardsRes = await fetch(`/api/cards?${params}`)
        const cardsData = await cardsRes.json()
        setCards(cardsData.cards ?? [])
        setCardIdx(0)
        const labels: Record<string, string> = { restaurants: "Restaurants", homes: "Homes", cars: "Cars", products: "Shopping", gyms: "Gyms", schools: "Schools", travel: "Travel", activities: "Activities", beauty: "Beauty", health: "Health" }
        setTitle(categories.length === 1 ? (labels[categories[0]] || "Results") : "Top Matches")
        setScreen("swipe")
      } else if (qs.length > 0) {
        setQuestions(qs); setCurrentQ(0); setAnswers([]); setScreen("questions")
      } else {
        setScreen("home")
      }
    } catch (err: unknown) {
      const m = err instanceof Error ? err.message : "Something went wrong"
      setErrorMsg(m)
      setScreen("home")
    } finally {
      setLoading(false)
    }
  }, [])

  const search = (q: string) => {
    if (!q.trim() || loading) return
    haptic(8)
    setErrorMsg("")
    if (GREETINGS.some(g => q.toLowerCase().trim() === g || q.toLowerCase().trim().startsWith(g + " "))) {
      setScreen("onboarding"); return
    }
    setQuery(q); setHistory([]); setScreen("thinking")
    callAI(q, [], q)
  }

  const answer = (a: string) => {
    haptic(8)
    setSelectedOpt(a)
    setTimeout(() => {
      setSelectedOpt(null)
      const newA = [...answers, a]
      setAnswers(newA)
      if (currentQ + 1 < questions.length) {
        setCurrentQ(q => q + 1)
      } else {
        const msg = `${query}. My answers: ${newA.join(", ")}`
        setScreen("thinking")
        callAI(msg, history, query)
      }
    }, 150)
  }

  const like = (card: SwipeCard) => {
    setPicks(p => p.find(c => c.id === card.id) ? p : [...p, card])
    showToast(card)
    setCardIdx(i => i + 1)
  }

  const pass = () => { haptic(6); setCardIdx(i => i + 1) }
  const rem = cards.slice(cardIdx)

  return (
    <div className="flex justify-center min-h-screen bg-black">
      <div className="relative w-full max-w-[430px] h-screen overflow-hidden bg-[#0d0d0d]">

        {/* ── ONBOARDING ── */}
        {screen === "onboarding" && (
          <OnboardingScreen onDone={() => { localStorage.setItem("swipe_seen", "1"); setScreen("home") }} />
        )}

        {/* ── HOME ── */}
        {screen === "home" && (
          <div key="home" className="anim-fade-up flex flex-col items-center justify-center h-full px-6">
            <div className="mb-10 text-center">
              <h1 className="text-[62px] font-black tracking-[-5px] leading-none text-white">swipe.</h1>
              <p className="text-[11px] font-medium tracking-[3px] uppercase text-white/25 mt-2.5">AI Decision Engine · Dubai</p>
            </div>

            {/* Input */}
            <div className="w-full relative mb-5">
              <input
                ref={inputRef}
                type="text"
                placeholder="What do you need?"
                className="w-full rounded-[28px] px-5 pr-14 py-[18px] text-white text-[16px] placeholder-white/25 outline-none border border-white/10 focus:border-white/30 transition-colors"
                style={{ background: "rgba(255,255,255,0.07)" }}
                onKeyDown={e => e.key === "Enter" && search((e.target as HTMLInputElement).value)}
              />
              <button
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-[42px] h-[42px] bg-white rounded-full flex items-center justify-center active:scale-90 transition-transform shadow-md"
                onClick={() => inputRef.current && search(inputRef.current.value)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0d0d0d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>

            {/* Pills — horizontal scroll */}
            <div className="w-full overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              <div className="flex gap-2 w-max px-0.5">
                {PILLS.map(p => (
                  <button key={p.q} onClick={() => search(p.q)}
                    className="flex-shrink-0 px-3.5 py-2 rounded-full text-[13px] text-white/55 active:text-white active:scale-95 transition-all border border-white/10"
                    style={{ background: "rgba(255,255,255,0.06)" }}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {picks.length > 0 && (
              <button onClick={() => setScreen("picks")}
                className="mt-6 px-5 py-2.5 bg-white rounded-full text-[#0d0d0d] text-[13px] font-bold active:scale-95 transition-transform shadow-md">
                💛 {picks.length} saved
              </button>
            )}

            {errorMsg && (
              <div className="mt-4 w-full px-4 py-3.5 rounded-2xl border border-red-500/20" style={{ background: "rgba(239,68,68,0.08)" }}>
                <p className="text-[12px] text-red-400 text-center leading-relaxed">{errorMsg}</p>
              </div>
            )}

            <a href="/list-your-business" className="mt-8 text-[12px] text-white/18 hover:text-white/40 transition-colors">
              List your business →
            </a>
          </div>
        )}

        {/* ── THINKING ── */}
        {screen === "thinking" && (
          <div key="thinking" className="anim-fade-in flex flex-col items-center justify-center h-full gap-6 bg-[#0d0d0d]">
            <div className="text-center">
              <p className="anim-pulse text-[44px] font-black tracking-[-3px] text-white leading-none mb-8">swipe.</p>
              <div className="flex gap-2 justify-center">
                {[0,1,2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/60"
                    style={{ animation: `bounce 1s ease-in-out ${i * 0.15}s infinite` }} />
                ))}
              </div>
              <p className="text-[13px] text-white/35 mt-4 tracking-wide">Finding the best options...</p>
            </div>
          </div>
        )}

        {/* ── QUESTIONS ── */}
        {screen === "questions" && questions[currentQ] && (
          <div key={`q-${currentQ}`} className="anim-fade-up flex flex-col h-full px-6 pt-14 pb-8 bg-[#0d0d0d]">
            {/* Header */}
            <div className="flex items-center gap-3 mb-10">
              <button onClick={() => setScreen("home")}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xl flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.08)" }}>‹</button>
              <div className="flex-1 h-[2px] bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
              </div>
              {questions.length > 1 && (
                <span className="text-[11px] font-semibold text-white/30 flex-shrink-0">{currentQ + 1}/{questions.length}</span>
              )}
            </div>

            <div className="flex-1 flex flex-col justify-center overflow-y-auto">
              <h2 className="text-[30px] font-bold tracking-tight text-white leading-tight mb-8">
                {questions[currentQ].text}
              </h2>

              {questions[currentQ].options && (
                <div className="flex flex-col gap-2.5 mb-4">
                  {questions[currentQ].options!.map(opt => (
                    <button key={opt} onClick={() => answer(opt)}
                      className="w-full py-4 px-5 rounded-2xl text-white text-[15px] font-medium text-left flex items-center justify-between active:scale-[0.97] transition-all border"
                      style={{
                        background: selectedOpt === opt ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.07)",
                        borderColor: selectedOpt === opt ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.08)",
                        transition: "background 0.15s, border-color 0.15s, transform 0.1s",
                      }}>
                      <span>{opt}</span>
                      <span className="text-white/30 text-lg">›</span>
                    </button>
                  ))}
                </div>
              )}

              {questions[currentQ].allowText && (
                <div>
                  {questions[currentQ].options && (
                    <p className="text-[11px] text-white/22 text-center mb-3">— or type your own —</p>
                  )}
                  <div className="flex gap-2">
                    <input value={freeText} onChange={e => setFreeText(e.target.value)}
                      placeholder={questions[currentQ].placeholder || "Type here..."}
                      className="flex-1 rounded-2xl px-4 py-3.5 text-white text-[15px] outline-none placeholder-white/22 border border-white/10 focus:border-white/30 transition-colors"
                      style={{ background: "rgba(255,255,255,0.07)" }}
                      onKeyDown={e => { if (e.key === "Enter" && freeText.trim()) { answer(freeText); setFreeText("") } }} />
                    <button onClick={() => { if (freeText.trim()) { answer(freeText); setFreeText("") } }}
                      className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0d0d0d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {loading && (
              <div className="flex justify-center gap-1.5 mt-4">
                {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
              </div>
            )}
          </div>
        )}

        {/* ── SWIPE ── */}
        {screen === "swipe" && (
          <div key="swipe" className="relative h-full bg-black">
            <div className="absolute inset-0">
              {rem.length === 0 ? (
                <div className="anim-fade-up absolute inset-0 flex items-center justify-center text-center px-6 bg-[#0d0d0d]">
                  <div>
                    <div className="text-5xl mb-5">✨</div>
                    <p className="font-bold text-[22px] text-white mb-2">That&apos;s all of them</p>
                    <p className="text-[14px] text-white/40 mb-8">
                      {picks.length > 0 ? `${picks.length} saved to Your Picks` : "Swipe right on anything you like"}
                    </p>
                    <div className="flex flex-col gap-3">
                      {picks.length > 0 && (
                        <button onClick={() => setScreen("picks")}
                          className="px-6 py-3.5 bg-white rounded-full text-[#0d0d0d] text-[14px] font-bold active:scale-95 transition-transform">
                          💛 View Your Picks
                        </button>
                      )}
                      <button onClick={() => setScreen("home")}
                        className="px-6 py-3.5 rounded-full text-white text-[14px] font-semibold border border-white/15 active:scale-95 transition-transform"
                        style={{ background: "rgba(255,255,255,0.06)" }}>
                        🔍 Search Again
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                rem.slice(0, 3).map((card, i) => (
                  <div key={card.id} className="absolute"
                    style={{
                      top: i === 0 ? 0 : i * 8,
                      left: i === 0 ? 0 : i * 5,
                      right: i === 0 ? 0 : i * 5,
                      bottom: 0,
                      zIndex: 10 - i,
                      borderRadius: i === 0 ? 0 : "20px",
                      overflow: "hidden",
                      transform: i > 0
                        ? `scale(${(1 - i * 0.04) + (dragProgress * i * 0.035)}) translateY(${-dragProgress * i * 6}px)`
                        : undefined,
                      transformOrigin: "bottom center",
                      transition: i > 0 ? "transform 0.15s ease" : undefined,
                    }}>
                    {i === 0 && (
                      <Card card={card} onLike={() => like(card)} onPass={pass} onDragProgress={setDragProgress} position={cardIdx} />
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Floating header */}
            {rem.length > 0 && (
              <div className="absolute top-0 left-0 right-0 z-30 px-4 pt-12 pb-5 pointer-events-none"
                style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)" }}>
                <div className="flex items-center gap-3 pointer-events-auto">
                  <button onClick={() => setScreen("home")}
                    className="w-9 h-9 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white text-xl border border-white/15 active:scale-90 transition-transform flex-shrink-0">
                    ‹
                  </button>
                  <div className="flex-1">
                    <span className="text-white font-semibold text-[15px] block leading-tight">{title}</span>
                    <div className="h-[2px] bg-white/15 rounded-full mt-1.5 overflow-hidden">
                      <div className="h-full bg-white rounded-full transition-all duration-400"
                        style={{ width: cards.length > 0 ? `${(cardIdx / cards.length) * 100}%` : "0%" }} />
                    </div>
                  </div>
                  <span className="text-white/40 text-[12px] font-semibold flex-shrink-0">
                    {Math.min(cardIdx + 1, cards.length)}/{cards.length}
                  </span>
                </div>
              </div>
            )}

            {/* Floating action buttons */}
            {rem.length > 0 && (
              <div className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-center gap-5 pb-10 pt-8"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)" }}>

                {/* Pass */}
                <button onClick={pass}
                  className="w-[60px] h-[60px] rounded-full flex items-center justify-center active:scale-90 transition-transform border border-white/15"
                  style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>

                {/* Contact / Info */}
                <button onClick={() => rem[0] && setContact(rem[0])}
                  className="w-[46px] h-[46px] rounded-full flex items-center justify-center active:scale-90 transition-transform border border-white/10"
                  style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(10px)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="8" strokeWidth="3" /><line x1="12" y1="12" x2="12" y2="16" />
                  </svg>
                </button>

                {/* Like */}
                <button onClick={() => rem[0] && like(rem[0])}
                  className="w-[60px] h-[60px] rounded-full bg-white flex items-center justify-center active:scale-90 transition-transform shadow-xl">
                  <svg width="22" height="20" viewBox="0 0 24 22" fill="none" stroke="#0d0d0d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="#0d0d0d" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── YOUR PICKS ── */}
        {screen === "picks" && (
          <div key="picks" className="anim-fade-up flex flex-col h-full bg-[#0d0d0d]">
            <div className="px-5 pt-14 pb-4 border-b border-[#1c1c1e] flex items-center gap-3">
              <button onClick={() => setScreen("home")}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xl flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.08)" }}>‹</button>
              <div>
                <h2 className="font-bold text-[22px] tracking-tight text-white">Your Picks 💛</h2>
                <p className="text-[13px] text-white/30">{picks.length} saved</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-2.5">
              {picks.length === 0
                ? <div className="text-center py-14">
                    <div className="text-5xl mb-3">💛</div>
                    <p className="text-[14px] text-white/35">Swipe right on things you like</p>
                  </div>
                : picks.map(item => (
                  <div key={item.id} className="rounded-2xl p-4 flex items-center gap-3 border border-[#2c2c2e] active:scale-[0.98] transition-transform"
                    style={{ background: "rgba(255,255,255,0.05)" }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: item.bgColor || "#2a2a2a" }}>{item.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[14px] text-white truncate">{item.name}</p>
                      <p className="text-[12px] text-white/40 mt-0.5">{item.price}</p>
                    </div>
                    <button onClick={() => setContact(item)}
                      className="px-4 py-2 bg-white rounded-full text-[#0d0d0d] text-[12px] font-bold flex-shrink-0 active:scale-95 transition-transform">
                      Contact
                    </button>
                  </div>
                ))
              }
              <button onClick={() => setScreen("home")}
                className="w-full py-4 bg-white rounded-2xl text-[#0d0d0d] font-bold text-[15px] mt-2 active:scale-[0.98] transition-transform">
                Search Something Else
              </button>
            </div>
          </div>
        )}

        {/* Save Toast */}
        {toast && <SaveToast card={toast} />}

        {/* Contact Sheet */}
        {contact && <ContactSheet card={contact} onClose={() => setContact(null)} sessionId={sessionId.current} />}
      </div>
    </div>
  )
}
