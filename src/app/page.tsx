"use client"
import { useState, useRef, useEffect, useCallback } from "react"
import { createClient } from "@supabase/supabase-js"

// ── Design tokens ──────────────────────────────────────────────
const V = {
  bg:        "#07070F",
  card:      "#13131E",
  gold:      "#C9A84C",
  goldLight: "#E8C97A",
  goldDark:  "#8A6A2A",
  goldDim:   "rgba(201,168,76,0.12)",
  goldLine:  "rgba(201,168,76,0.25)",
  green:     "#34C77B",
  amber:     "#F5A623",
  silver:    "#A0A0B0",
  text:      "#F0EFE8",
  textMuted: "rgba(240,239,232,0.55)",
  textDim:   "rgba(240,239,232,0.38)",
  textFaint: "rgba(240,239,232,0.25)",
  border:    "rgba(255,255,255,0.06)",
  ctaGrad:   "linear-gradient(135deg, #B8922A, #C9A84C)",
  progGrad:  "linear-gradient(90deg, #8A6A2A, #C9A84C)",
  easeApple: "cubic-bezier(0.16, 1, 0.3, 1)",
  easeSpring:"cubic-bezier(0.34, 1.56, 0.64, 1)",
  easeInOut: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  fontMono:  '"SF Mono", ui-monospace, Menlo, Consolas, monospace',
}

const SUPA_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
const SUPA_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
const getSupabase = () => createClient(SUPA_URL, SUPA_ANON)

type Session = { access_token: string; user: { id: string; email?: string } }

// ── Types ──────────────────────────────────────────────────────
interface Property {
  id: string; name: string; area: string; developer: string
  transaction: "buy" | "rent" | "offplan"
  bedrooms: string; size: number; price: number; psf: number; areaPsf: number
  score: number; scoreLabel: string
  scores: { developer: number; layout: number; location: number; price: number; market: number }
  verdict: string; positive: string[]; risk: string[]
  imgBg: string; handover?: string; paymentPlan?: string
}
interface Profile {
  intent?: "buy" | "rent" | "invest"
  propertyType?: string; budget?: number
  category?: "residential" | "commercial"
  downpaymentPercent?: number; paymentPlanCapacity?: number
  timeline?: string; financeType?: string; area?: string
}
type Screen = "onboarding" | "home" | "qualify" | "thinking" | "swipe" | "list" | "saved"

// ── Property data ──────────────────────────────────────────────
const PROPERTIES: Property[] = [
  {
    id:"chic-tower", name:"Chic Tower", area:"Business Bay", developer:"Damac",
    transaction:"buy", bedrooms:"1", size:678, price:1_450_000, psf:2134, areaPsf:2306,
    score:87, scoreLabel:"Strong Match",
    scores:{developer:20, layout:17, location:17, price:23, market:10},
    verdict:"Canal view, 7.5% below avg, strong Emaar-grade layout — rare entry at this psf.",
    positive:["7.5% below Business Bay psf average","Metro 6 minutes · canal-facing","Efficient 1BR layout with balcony"],
    risk:["Building completed 2019 — older than typical entry"],
    imgBg:"linear-gradient(135deg, #2a1f0a, #4a3a1a 40%, #6e5420)",
  },
  {
    id:"creek-haven", name:"Creek Haven", area:"Creek Harbour", developer:"Emaar",
    transaction:"offplan", bedrooms:"1", size:742, price:1_280_000, psf:1725, areaPsf:2400,
    handover:"Q3 2027", paymentPlan:"60/40",
    score:93, scoreLabel:"Perfect Match",
    scores:{developer:24, layout:18, location:18, price:24, market:9},
    verdict:"Best-in-class Emaar entry on the Creek at 28% below current market average.",
    positive:["28% below area avg psf","Emaar delivery record: 98% on-time","Creek promenade + metro confirmed"],
    risk:["Construction risk — 3-year handover"],
    imgBg:"linear-gradient(135deg, #0c2030, #1a3a55 45%, #2e628a)",
  },
  {
    id:"belgravia-sq", name:"Belgravia Square", area:"JVC", developer:"Ellington",
    transaction:"buy", bedrooms:"2", size:1180, price:1_620_000, psf:1373, areaPsf:1473,
    score:86, scoreLabel:"Strong Match",
    scores:{developer:22, layout:18, location:16, price:22, market:8},
    verdict:"Ellington-grade interiors in JVC — 7% below market with strong rental demand.",
    positive:["7% below JVC avg psf","Ellington finishing quality","7.8% gross yield in the area"],
    risk:["JVC metro access still developing"],
    imgBg:"linear-gradient(135deg, #1a2010, #2e3a1e 45%, #4a5a2e)",
  },
  {
    id:"marina-pin", name:"Marina Pinnacle", area:"Dubai Marina", developer:"Damac",
    transaction:"buy", bedrooms:"2", size:1320, price:2_800_000, psf:2121, areaPsf:2187,
    score:80, scoreLabel:"Strong Match",
    scores:{developer:18, layout:17, location:17, price:20, market:8},
    verdict:"Sea-view 2BR in mature Marina stock — solid hold, yield-stable.",
    positive:["Full sea view, high floor","Marina walk + metro access"],
    risk:["Older building (2011)","Service charge 22% above area median"],
    imgBg:"linear-gradient(135deg, #0a1a28, #1a3550 45%, #305a82)",
  },
  {
    id:"terra-gardens", name:"Terra Gardens", area:"Expo City", developer:"Emaar",
    transaction:"offplan", bedrooms:"1", size:695, price:980_000, psf:1410, areaPsf:1600,
    handover:"Q1 2028", paymentPlan:"70/30",
    score:83, scoreLabel:"Strong Match",
    scores:{developer:22, layout:17, location:14, price:22, market:8},
    verdict:"Long-term play on Expo City — DLD fee waived, Emaar delivery.",
    positive:["1% DLD waived at launch","Emaar master-plan infrastructure","Below-avg entry psf"],
    risk:["4-year handover · long capital lockup"],
    imgBg:"linear-gradient(135deg, #1a1a2a, #2a2e4a 45%, #3e4a6e)",
  },
  {
    id:"marina-rent", name:"Marina Arcade", area:"Dubai Marina", developer:"Deyaar",
    transaction:"rent", bedrooms:"1", size:820, price:115_000, psf:140, areaPsf:155,
    score:84, scoreLabel:"Strong Match",
    scores:{developer:20, layout:17, location:18, price:21, market:8},
    verdict:"Furnished 1BR with marina view — 10% below area average rent.",
    positive:["10% below Marina avg rent","Walk to JBR + metro","Furnished, move-in ready"],
    risk:["Landlord requires 4-cheque structure"],
    imgBg:"linear-gradient(135deg, #0a1a28, #1a3550 45%, #305a82)",
  },
  {
    id:"mada-res", name:"Mada Residences", area:"Downtown Dubai", developer:"Artar",
    transaction:"buy", bedrooms:"studio", size:420, price:1_250_000, psf:2976, areaPsf:2980,
    score:91, scoreLabel:"Perfect Match",
    scores:{developer:22, layout:18, location:19, price:23, market:9},
    verdict:"Downtown studio at 24% below typical psf — Burj-adjacent, rare value.",
    positive:["24% below Downtown avg","Burj Khalifa view","Strong short-stay rental profile"],
    risk:["Small unit — 420 ft²"],
    imgBg:"linear-gradient(135deg, #1a0e14, #3a1a22 45%, #5e2e3a)",
  },
]

// ── Helpers ────────────────────────────────────────────────────
function fmtAED(n: number) {
  if (n >= 1_000_000) {
    const m = n / 1_000_000
    return `AED ${m.toFixed(n % 1_000_000 === 0 ? 0 : m >= 10 ? 1 : 2)}M`
  }
  if (n >= 1000) return `AED ${(n / 1000).toFixed(0)}K`
  return `AED ${n.toLocaleString()}`
}
function fmtRentYr(n: number) { return `AED ${(n / 1000).toFixed(0)}K/yr` }
function scoreColor(s: number) {
  if (s >= 85) return V.gold
  if (s >= 70) return V.silver
  return "#6E6E82"
}
function scoreBg(s: number) {
  if (s >= 85) return "rgba(201,168,76,0.14)"
  if (s >= 70) return "rgba(160,160,176,0.12)"
  return "rgba(110,110,130,0.10)"
}

function filterProperties(profile: Profile): Property[] {
  let props = [...PROPERTIES]
  if (profile.intent === "rent") props = props.filter(p => p.transaction === "rent")
  else if (profile.intent === "invest") props = props.filter(p => p.transaction === "offplan")
  else if (profile.intent === "buy") props = props.filter(p => p.transaction === "buy")
  return props.sort((a, b) => b.score - a.score)
}

// ── API listing mapper (for live Supabase data) ───────────────
interface ApiListing {
  id: string; title: string; listing_type: string
  price: number; price_per_sqft?: number; area_name?: string
  developer_name?: string; roi_projection?: number
  payment_plan_details?: { handover?: string; plan?: string }
  is_ready?: boolean; match_score: number; reasoning: string
}

const AREA_AVG_PSF: Record<string, number> = {
  "JVC": 950, "Business Bay": 1800, "Dubai South": 700,
  "Arjan": 850, "Dubai Hills": 1600, "Dubai Marina": 2000,
  "Palm Jumeirah": 3500, "Downtown Dubai": 2200, "Creek Harbour": 1500,
  "Emaar South": 650, "JLT": 1400, "DIFC": 2800,
}

function mapListingsToProperties(listings: ApiListing[]): Property[] {
  return listings.map(l => {
    const area = l.area_name ?? "Dubai"
    const psf  = l.price_per_sqft ?? 0
    const avg  = AREA_AVG_PSF[area] ?? psf
    const roi  = l.roi_projection ?? 0
    const s    = Math.min(100, Math.max(0, l.match_score))
    const belowPct = avg > 0 && psf > 0 ? Math.round((1 - psf / avg) * 100) : 0
    const positive: string[] = []
    if (belowPct > 0) positive.push(`${belowPct}% below ${area} avg psf`)
    if (roi > 0) positive.push(`${(roi * 100).toFixed(1)}% projected ROI`)
    if (l.is_ready) positive.push("Ready to move in")
    return {
      id: l.id, name: l.title, area,
      developer: l.developer_name ?? "Independent",
      transaction: (l.listing_type === "off-plan" ? "offplan" : l.listing_type) as "buy" | "rent" | "offplan",
      bedrooms: "—", size: 0,
      price: l.price, psf, areaPsf: avg,
      score: s,
      scoreLabel: s >= 90 ? "Perfect Match" : s >= 75 ? "Strong Match" : "Good Match",
      scores: {
        developer: Math.round(Math.min(25, s * 0.25)),
        layout:    Math.round(Math.min(20, s * 0.18)),
        location:  Math.round(Math.min(20, s * 0.18)),
        price:     Math.round(Math.min(25, s * 0.25)),
        market:    Math.round(Math.min(10, s * 0.10)),
      },
      verdict: l.reasoning, positive, risk: [],
      imgBg: `linear-gradient(135deg, ${areaTint(area.toLowerCase())})`,
      handover: l.payment_plan_details?.handover,
      paymentPlan: l.payment_plan_details?.plan,
    }
  })
}

function calculateQualificationScore(profile: Profile): { score: number; tier: "Gold" | "Silver" | "Bronze" } {
  let score = 50
  if (profile.timeline === "ready") score += 25
  else if (profile.timeline === "soon") score += 10
  if (profile.financeType === "cash" || profile.financeType === "1chq") score += 20
  else if (profile.financeType === "mortgage") score += 8
  else score += 4
  const budget = profile.budget ?? 0
  const intent = profile.intent ?? "buy"
  if (intent === "buy" || intent === "invest") {
    if (budget >= 5_000_000) score += 5
    else if (budget >= 2_000_000) score += 3
  } else {
    if (budget >= 200_000) score += 5
    else if (budget >= 100_000) score += 3
  }
  score = Math.min(100, score)
  const tier: "Gold" | "Silver" | "Bronze" = score >= 85 ? "Gold" : score >= 65 ? "Silver" : "Bronze"
  return { score, tier }
}

function areaTint(v: string): string {
  const map: Record<string, string> = {
    downtown:        "#1a0e14, #3a1a22 60%, #5e2e3a",
    "business bay":  "#2a1f0a, #4a3a1a 60%, #6e5420",
    "business-bay":  "#2a1f0a, #4a3a1a 60%, #6e5420",
    marina:          "#0a1a28, #1a3550 60%, #305a82",
    jvc:             "#1a2010, #2e3a1e 60%, #4a5a2e",
    creek:           "#0c2030, #1a3a55 60%, #2e628a",
    hills:           "#1c1a12, #3a362a 60%, #5c5544",
    expo:            "#1a1a2a, #2a2e4a 60%, #3e4a6e",
  }
  return map[v] || "#1a1a1e, #2a2a30"
}

// ── Icons ──────────────────────────────────────────────────────
const IconBuy = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11L12 4L21 11"/><path d="M5 10V20H19V10"/><path d="M9 20V14H15V20"/>
  </svg>
)
const IconRent = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L3 7.5V21H21V7.5L12 2Z"/><path d="M9 21V12H15V21"/>
  </svg>
)
const IconInvest = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 17L9 11L13 15L21 7"/><path d="M16 7H21V12"/>
  </svg>
)
const IconApt = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="3" width="16" height="18" rx="1"/>
    <path d="M8 7H10M14 7H16M8 11H10M14 11H16M8 15H10M14 15H16"/>
    <path d="M10 21V18H14V21"/>
  </svg>
)
const IconVilla = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12L12 5L21 12"/><path d="M5 11V20H19V11"/>
    <rect x="10" y="14" width="4" height="6"/>
  </svg>
)
const IconTown = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 20V9L8 6L13 9V20"/><path d="M13 9L18 6L21 9V20"/>
    <path d="M3 20H21"/><path d="M6 20V15H10V20"/><path d="M16 20V15H18V20"/>
  </svg>
)
const IconClock = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9"/><path d="M12 7V12L15.5 14"/>
  </svg>
)
const IconCalendar = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10H21"/>
    <path d="M8 3V7M16 3V7"/>
  </svg>
)
const IconCompass = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9"/><path d="M15.5 8.5L13 13L8.5 15.5L11 11L15.5 8.5Z"/>
  </svg>
)
const IconCash = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="1.5"/>
    <circle cx="12" cy="12" r="2.5"/>
  </svg>
)
const IconCards = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="1.5"/>
    <path d="M2 10H22"/><path d="M6 15H10"/>
  </svg>
)
const IconMixed = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3V21M5 7L12 3L19 7M5 17L12 21L19 17"/>
  </svg>
)
const IconOffice = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="17" rx="1"/>
    <path d="M3 9H21"/><path d="M8 9V4"/><path d="M16 9V4"/>
    <path d="M7 13H9M7 17H9M11 13H13M11 17H13M15 13H17M15 17H17"/>
  </svg>
)
const IconWarehouse = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 8L12 3L22 8V21H2V8Z"/>
    <rect x="8" y="14" width="8" height="7"/>
    <path d="M8 14H16"/>
  </svg>
)
const IconRetail = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3H5L6.68 12.39C6.77 12.83 7.15 13.16 7.6 13.16H17.4C17.85 13.16 18.23 12.83 18.32 12.39L20 4H5"/>
    <circle cx="8.5" cy="19.5" r="1.5"/><circle cx="17.5" cy="19.5" r="1.5"/>
  </svg>
)

// ── Shared small components ────────────────────────────────────
function ScoreChip({ score, label }: { score: number; label?: string }) {
  const color = scoreColor(score)
  const bg = scoreBg(score)
  return (
    <div className="anim-score-in" style={{
      display:"inline-flex", alignItems:"center", gap:6,
      padding:"5px 11px", borderRadius:999,
      background:bg, border:`1px solid ${color}40`, color,
      fontSize:11, fontWeight:700, fontFamily:V.fontMono, letterSpacing:"0.02em",
    }}>★ {score}{label ? ` · ${label.toUpperCase()}` : ""}</div>
  )
}

function PropertyHero({ prop, height = 200, compact = false, minimal = false }: {
  prop: Property; height?: number; compact?: boolean; minimal?: boolean
}) {
  return (
    <div style={{
      position:"relative", width:"100%", height, flexShrink:0,
      background:prop.imgBg, overflow:"hidden",
      borderRadius: compact ? 14 : 0,
    }}>
      <div style={{
        position:"absolute", inset:0,
        backgroundImage:"linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
        backgroundSize:"32px 32px", mixBlendMode:"overlay",
      }} />
      {!minimal && (
        <div style={{
          position:"absolute", top:12, right:12,
          padding:"4px 9px", borderRadius:999,
          background:"rgba(0,0,0,0.4)", backdropFilter:"blur(10px)",
          fontSize:9, fontWeight:700, letterSpacing:"0.25em",
          color:"rgba(201,168,76,0.9)", border:"1px solid rgba(201,168,76,0.25)",
        }}>{prop.transaction === "buy" ? "FOR SALE" : prop.transaction === "rent" ? "FOR RENT" : "OFF-PLAN"}</div>
      )}
      <div style={{
        position:"absolute", inset:0,
        background: minimal
          ? "linear-gradient(to top, rgba(0,0,0,0.35), transparent 65%)"
          : "linear-gradient(to top, rgba(0,0,0,0.75), transparent 55%)",
      }} />
      {!minimal && (
        <div style={{ position:"absolute", bottom:14, left:14, right:14 }}>
          <div style={{
            fontSize:9.5, fontWeight:700, letterSpacing:"0.3em",
            textTransform:"uppercase", color:"rgba(255,255,255,0.7)",
            textShadow:"0 2px 8px rgba(0,0,0,0.6)",
          }}>{prop.area}</div>
          <div style={{
            fontSize: compact ? 18 : 24, fontWeight:700, color:"#fff",
            letterSpacing:"-0.02em", lineHeight:1.1,
          }}>{prop.name}</div>
          <div style={{
            fontSize: compact ? 11 : 12, fontWeight:500,
            color:"rgba(255,255,255,0.55)", marginTop:3,
          }}>by {prop.developer} · {prop.bedrooms === "studio" ? "Studio" : `${prop.bedrooms} BR`} · {prop.size.toLocaleString()} ft²</div>
        </div>
      )}
    </div>
  )
}

// ── 1. ONBOARDING ─────────────────────────────────────────────
function OnbDots({ index, total }: { index: number; total: number }) {
  return (
    <div style={{ display:"flex", gap:6, alignItems:"center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} style={{
          height:4, borderRadius:999,
          width: i === index ? 22 : 4,
          background: i === index ? V.gold : i < index ? "rgba(201,168,76,0.45)" : "rgba(255,255,255,0.12)",
          transition:`width 0.45s ${V.easeApple}, background 0.3s ${V.easeApple}`,
        }} />
      ))}
    </div>
  )
}

function ProcessIllustration() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14, marginTop:36 }}>
      {[
        { n:"01", title:"You answer a few questions", sub:"Budget, timeline, intent — 90 seconds." },
        { n:"02", title:"AI analyzes the live market", sub:"Cross-checks 40k+ listings against DLD data." },
        { n:"03", title:"You get ranked properties", sub:"Scored on 5 dimensions. With a verdict." },
      ].map((row, i) => (
        <div key={i} className="anim-fade-up" style={{
          animationDelay:`${140 + i * 100}ms`,
          display:"flex", alignItems:"flex-start", gap:18,
          padding:"20px 20px 20px 18px", borderRadius:18,
          background:V.card, border:`1px solid ${V.border}`,
        }}>
          <span style={{
            fontFamily:V.fontMono, fontSize:11, fontWeight:700, letterSpacing:"0.18em",
            color:V.gold, paddingTop:3, flexShrink:0, minWidth:22,
          }}>{row.n}</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:15, fontWeight:600, color:"#fff", letterSpacing:"-0.01em", marginBottom:4, lineHeight:1.25 }}>{row.title}</div>
            <div style={{ fontSize:12.5, lineHeight:1.5, color:"rgba(240,239,232,0.48)" }}>{row.sub}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function TrustIllustration() {
  const rows = [
    { eyebrow:"MARKET INSIGHT", headline:"7.5% below area comp", body:"Every price shown against live DLD comparables.", tone:"gold" },
    { eyebrow:"RISK FLAG", headline:"Developer 14mo late on prior tower", body:"Delivery history, ESCROW status, litigation — checked.", tone:"amber" },
    { eyebrow:"REAL AFFORDABILITY", headline:"AED 2.4M realistic range", body:"Stress-tested against rates, DLD fees, maintenance.", tone:"green" },
  ]
  const toneMap: Record<string, { dot: string; label: string }> = {
    gold:  { dot:V.gold,  label:"rgba(201,168,76,0.75)" },
    amber: { dot:V.amber, label:"rgba(245,166,35,0.75)" },
    green: { dot:V.green, label:"rgba(52,199,123,0.75)" },
  }
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12, marginTop:36 }}>
      {rows.map((r, i) => {
        const t = toneMap[r.tone]
        return (
          <div key={i} className="anim-fade-up" style={{
            animationDelay:`${140 + i * 100}ms`,
            padding:"18px", borderRadius:18,
            background:V.card, border:`1px solid ${V.border}`,
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
              <span style={{ width:6, height:6, borderRadius:999, background:t.dot, boxShadow:`0 0 8px ${t.dot}66` }} />
              <span style={{ fontSize:9.5, fontWeight:700, letterSpacing:"0.25em", textTransform:"uppercase", color:t.label }}>{r.eyebrow}</span>
            </div>
            <div style={{ fontSize:15.5, fontWeight:600, color:"#fff", lineHeight:1.3, letterSpacing:"-0.01em", marginBottom:4 }}>{r.headline}</div>
            <div style={{ fontSize:12, lineHeight:1.5, color:"rgba(240,239,232,0.45)" }}>{r.body}</div>
          </div>
        )
      })}
    </div>
  )
}

function VerdictIllustration() {
  const dims = [
    { label:"Price", value:92 }, { label:"Location", value:88 },
    { label:"Developer", value:74 }, { label:"Yield", value:81 }, { label:"Risk", value:69 },
  ]
  return (
    <div className="anim-fade-up" style={{
      marginTop:36, animationDelay:"120ms",
      padding:"22px 22px 20px", borderRadius:22,
      background:"linear-gradient(160deg, rgba(201,168,76,0.12), rgba(201,168,76,0.02) 65%)",
      border:"1px solid rgba(201,168,76,0.22)",
    }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
        <span style={{ fontSize:9.5, fontWeight:700, letterSpacing:"0.3em", textTransform:"uppercase", color:"rgba(201,168,76,0.75)" }}>VERDICT · PREVIEW</span>
        <span style={{ fontFamily:V.fontMono, fontSize:11, fontWeight:700, letterSpacing:"0.05em", color:V.gold, background:"rgba(201,168,76,0.14)", border:"1px solid rgba(201,168,76,0.3)", padding:"4px 9px", borderRadius:999 }}>★ 87</span>
      </div>
      <p style={{ fontSize:19, fontStyle:"italic", fontWeight:500, color:V.goldLight, lineHeight:1.3, margin:"0 0 18px", letterSpacing:"-0.01em" }}>
        "Canal view, 7.5% below the JVC comp. Worth the look."
      </p>
      <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
        {dims.map((d, i) => (
          <div key={d.label} style={{ display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:10.5, fontWeight:500, color:"rgba(240,239,232,0.55)", minWidth:62, letterSpacing:"0.02em" }}>{d.label}</span>
            <div style={{ flex:1, height:4, borderRadius:999, background:"rgba(255,255,255,0.06)", overflow:"hidden" }}>
              <div className="onb-bar" style={{ height:"100%", width:`${d.value}%`, borderRadius:999, background:V.progGrad, animationDelay:`${350 + i * 80}ms` }} />
            </div>
            <span style={{ fontFamily:V.fontMono, fontSize:10.5, fontWeight:600, color:V.gold, minWidth:22, textAlign:"right" }}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [idx, setIdx] = useState(0)
  const [animKey, setAnimKey] = useState(0)
  const TOTAL = 4

  function next() {
    if (idx === TOTAL - 1) { onComplete(); return }
    setIdx(i => i + 1); setAnimKey(k => k + 1)
  }
  function back() {
    if (idx === 0) return
    setIdx(i => i - 1); setAnimKey(k => k + 1)
  }

  const screens = [
    { eyebrow:"DUBAI PROPERTY INTELLIGENCE", title:"Stop browsing.\nStart deciding.", sub:"AI-powered property decisions — scored, sourced, and sharp.", body:null, cta:"Continue", wordmark:true },
    { eyebrow:"HOW IT WORKS", title:"Three steps\nto a verdict.", sub:"No endless search. No agent hustle.", body:<ProcessIllustration />, cta:"Continue", wordmark:false },
    { eyebrow:"WHAT YOU GET", title:"Every claim,\nreferenced.", sub:"We don't rank by vibe. We rank by data you can audit.", body:<TrustIllustration />, cta:"Continue", wordmark:false },
    { eyebrow:"THE VERDICT", title:"One line.\nZero guesswork.", sub:"A senior broker's read — delivered in 90 seconds.", body:<VerdictIllustration />, cta:"Start", wordmark:false },
  ]
  const s = screens[idx]

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", width:"100%", background:V.bg, position:"relative" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 24px 0", flexShrink:0 }}>
        <button onClick={back} aria-label="Back" style={{
          width:36, height:36, borderRadius:999, border:"none",
          display:"flex", alignItems:"center", justifyContent:"center",
          background: idx > 0 ? "rgba(255,255,255,0.05)" : "transparent",
          color:"rgba(240,239,232,0.5)", fontSize:18, cursor:"pointer",
          opacity: idx > 0 ? 1 : 0, transition:"opacity 0.3s",
        }}>←</button>
        <OnbDots index={idx} total={TOTAL} />
        <button onClick={onComplete} style={{
          border:"none", background:"transparent",
          fontSize:13, fontWeight:500, color:"rgba(240,239,232,0.4)",
          cursor:"pointer", padding:"6px 4px",
          opacity: idx < TOTAL - 1 ? 1 : 0, transition:"opacity 0.3s",
        }}>Skip</button>
      </div>

      <div key={animKey} className="anim-phase-in" style={{ flex:1, padding:"24px 24px 0", overflowY:"auto", display:"flex", flexDirection:"column" }}>
        {s.wordmark && (
          <div style={{ display:"flex", alignItems:"center", gap:14, margin:"12px 0 52px" }}>
            <div style={{
              width:36, height:36, borderRadius:10,
              background:"linear-gradient(135deg, #8A6A2A, #C9A84C)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:18, fontWeight:900, color:"#07070F", letterSpacing:"-0.02em",
              boxShadow:"0 8px 24px rgba(201,168,76,0.25)",
            }}>V</div>
            <span style={{ fontSize:11, letterSpacing:"0.3em", fontWeight:600, color:"rgba(201,168,76,0.7)", textTransform:"uppercase" }}>VERDICT</span>
          </div>
        )}
        <span style={{
          fontSize:10, letterSpacing:"0.3em", fontWeight:600,
          color:"rgba(201,168,76,0.7)", textTransform:"uppercase",
          margin: s.wordmark ? "0 0 14px" : "28px 0 14px",
        }}>{s.eyebrow}</span>
        <h1 style={{ fontSize:40, fontWeight:700, letterSpacing:"-0.025em", color:"#fff", lineHeight:1.02, margin:"0 0 14px", whiteSpace:"pre-line" }}>{s.title}</h1>
        <p style={{ fontSize:16, lineHeight:1.45, fontWeight:400, color:"rgba(240,239,232,0.55)", margin:"0 0 8px", maxWidth:320 }}>{s.sub}</p>
        {s.body}
        <div style={{ flex:1, minHeight:24 }} />
      </div>

      <div style={{ padding:"16px 24px 28px", flexShrink:0 }}>
        <button onClick={next} style={{
          width:"100%", padding:"17px 20px", borderRadius:16, border:"none",
          background:V.ctaGrad, color:"#07070F",
          fontSize:16, fontWeight:700, letterSpacing:"-0.01em", cursor:"pointer",
          boxShadow:"0 10px 24px rgba(201,168,76,0.22)",
          transition:`transform 0.18s ${V.easeApple}`,
        }}
        onMouseDown={e => (e.currentTarget.style.transform = "scale(0.98)")}
        onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
        onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}>{s.cta}</button>
        {idx === TOTAL - 1 && (
          <p style={{ textAlign:"center", margin:"12px 0 0", fontSize:11, fontWeight:500, color:"rgba(240,239,232,0.35)" }}>
            Takes about 90 seconds · Free for buyers
          </p>
        )}
      </div>
    </div>
  )
}

// ── 2. QUALIFY FLOW ────────────────────────────────────────────
function rangeToArea(v: number, intent: string): string {
  if (intent === "rent") {
    if (v < 70_000)  return "JVC · Sports City · Silicon Oasis"
    if (v < 130_000) return "JLT · Business Bay · Barsha"
    if (v < 220_000) return "Marina · Downtown · Creek"
    return "DIFC · Dubai Hills · Palm"
  }
  if (intent === "invest") {
    if (v < 800_000)   return "Studios in JLT, JVC, Expo City"
    if (v < 1_500_000) return "Business Bay · Creek · JLT"
    if (v < 3_000_000) return "Downtown · Marina · MBR City"
    return "DIFC · Palm · Dubai Hills"
  }
  if (v < 1_500_000) return "Studio to 1BR in JVC, JLT, Sports City"
  if (v < 2_500_000) return "1–2BR in Business Bay, Marina, JLT"
  if (v < 5_000_000) return "2–3BR in Downtown, DIFC, Dubai Hills"
  return "Premium · Palm, One Za'abeel, DIFC"
}

const INTENT_RANGES: Record<string, {
  min: number; max: number; default: number
  realistic: (v: number) => [number, number]
  areaHint: (v: number) => string
}> = {
  buy:    { min:800_000,  max:15_000_000, default:1_600_000, realistic:(v)=>[Math.round(v*0.85/50_000)*50_000, Math.round(v*1.15/50_000)*50_000], areaHint:(v)=>rangeToArea(v,"buy") },
  rent:   { min:40_000,   max:450_000,    default:120_000,   realistic:(v)=>[Math.round(v*0.85/5_000)*5_000,   Math.round(v*1.15/5_000)*5_000],   areaHint:(v)=>rangeToArea(v,"rent") },
  invest: { min:400_000,  max:10_000_000, default:1_200_000, realistic:(v)=>[Math.round(v*0.90/50_000)*50_000, Math.round(v*1.25/50_000)*50_000], areaHint:(v)=>rangeToArea(v,"invest") },
}

function formatAED(n: number) {
  if (n >= 1_000_000) {
    const m = n / 1_000_000
    return `AED ${m.toFixed(m >= 10 || n % 1_000_000 === 0 ? (m >= 10 ? 1 : 0) : 2)}M`
  }
  if (n >= 1000) return `AED ${(n / 1000).toFixed(0)}K`
  return `AED ${n.toLocaleString()}`
}

function QProgress({ step, total, onBack, onSkip }: { step: number; total: number; onBack: () => void; onSkip?: () => void }) {
  const pct = (step / total) * 100
  return (
    <>
      <div style={{ height:3, background:"rgba(255,255,255,0.05)", position:"relative", flexShrink:0 }}>
        <div style={{ height:"100%", width:`${pct}%`, background:V.progGrad, transition:`width 0.55s ${V.easeApple}` }} />
      </div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px 4px", flexShrink:0 }}>
        <button onClick={onBack} aria-label="Back" style={{
          width:36, height:36, borderRadius:999, border:"none",
          background:"rgba(255,255,255,0.05)",
          color:"rgba(240,239,232,0.5)", fontSize:18, cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>←</button>
        <span style={{ fontSize:11, fontWeight:500, letterSpacing:"0.15em", color:"rgba(240,239,232,0.4)", fontFamily:V.fontMono }}>
          STEP {String(step).padStart(2,"0")} / {String(total).padStart(2,"0")}
        </span>
        {onSkip
          ? <button onClick={onSkip} style={{ border:"none", background:"transparent", fontSize:12.5, fontWeight:500, color:"rgba(240,239,232,0.45)", cursor:"pointer", padding:"6px 4px" }}>Skip</button>
          : <div style={{ width:36 }} />}
      </div>
    </>
  )
}

function QHeader({ eyebrow, title, context }: { eyebrow?: string; title: string; context?: string }) {
  return (
    <div style={{ margin:"8px 0 28px" }}>
      {eyebrow && (
        <div style={{ fontSize:10, fontWeight:600, letterSpacing:"0.3em", textTransform:"uppercase", color:"rgba(201,168,76,0.7)", marginBottom:12 }}>{eyebrow}</div>
      )}
      <h1 style={{ fontSize:30, fontWeight:700, letterSpacing:"-0.02em", color:"#fff", lineHeight:1.08, margin:"0 0 10px", whiteSpace:"pre-line" }}>{title}</h1>
      {context && (
        <p style={{ fontSize:13.5, lineHeight:1.5, fontStyle:"italic", color:"rgba(201,168,76,0.65)", margin:0, maxWidth:320 }}>{context}</p>
      )}
    </div>
  )
}

function BigOption({ icon, label, sub, note, selected, onClick, delay = 0 }: {
  icon: React.ReactNode; label: string; sub?: string; note?: string
  selected?: boolean; onClick: () => void; delay?: number
}) {
  return (
    <button onClick={onClick} className="anim-fade-up" style={{
      animationDelay:`${delay}ms`,
      width:"100%", display:"flex", alignItems:"center", gap:16,
      padding:"18px", marginBottom:12, borderRadius:18, border:"1px solid",
      borderColor: selected ? "rgba(201,168,76,0.45)" : V.border,
      background: selected ? V.goldDim : V.card,
      color:V.text, cursor:"pointer", textAlign:"left",
      transition:`transform 0.18s ${V.easeApple}, background 0.2s, border-color 0.2s, box-shadow 0.2s`,
      boxShadow: selected ? "0 0 0 4px rgba(201,168,76,0.08)" : "0 1px 0 rgba(0,0,0,0.2)",
    }}
    onMouseDown={e => (e.currentTarget.style.transform = "scale(0.985)")}
    onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
    onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}>
      <div style={{
        width:52, height:52, borderRadius:14,
        background: selected ? "linear-gradient(135deg, rgba(201,168,76,0.22), rgba(201,168,76,0.08))" : "rgba(255,255,255,0.03)",
        border:`1px solid ${selected ? "rgba(201,168,76,0.3)" : "rgba(255,255,255,0.05)"}`,
        display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
        color: selected ? V.gold : "rgba(240,239,232,0.75)",
      }}>{icon}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:16, fontWeight:600, letterSpacing:"-0.01em", color: selected ? V.gold : "#fff", marginBottom:2 }}>{label}</div>
        {sub && <div style={{ fontSize:12.5, lineHeight:1.4, color:"rgba(240,239,232,0.45)" }}>{sub}</div>}
      </div>
      {note && !selected && (
        <span style={{ fontSize:10, fontWeight:600, letterSpacing:"0.2em", textTransform:"uppercase", padding:"4px 9px", borderRadius:999, background:"rgba(255,255,255,0.05)", color:"rgba(240,239,232,0.55)" }}>{note}</span>
      )}
      <span style={{ fontSize:20, color: selected ? V.gold : "rgba(240,239,232,0.22)", marginLeft:2, transition:"color 0.2s" }}>{selected ? "✓" : "›"}</span>
    </button>
  )
}

function BudgetStep({ intent, onAdvance }: { intent: "buy" | "rent" | "invest"; onAdvance: (v: { budget: number }) => void }) {
  const cfg = INTENT_RANGES[intent]
  const [value, setValue] = useState(cfg.default)
  const [committed, setCommitted] = useState(false)
  const [text, setText] = useState(formatAED(cfg.default))

  function syncText(n: number) { setText(formatAED(n)) }
  function commit() { setCommitted(true) }

  function handleSlider(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Number(e.target.value)
    setValue(v); syncText(v)
    if (committed) setCommitted(false)
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^\d.]/g, "")
    const v = Number(raw) * (raw.includes(".") && Number(raw) < 100 ? 1_000_000 : 1)
    setText(e.target.value)
    if (!isNaN(v) && v >= cfg.min && v <= cfg.max) {
      setValue(v)
      if (committed) setCommitted(false)
    }
  }

  const quicks = intent === "rent"
    ? [80_000, 120_000, 180_000, 260_000]
    : intent === "invest"
      ? [800_000, 1_500_000, 3_000_000, 5_000_000]
      : [1_500_000, 2_500_000, 4_000_000, 7_500_000]

  const pct = ((value - cfg.min) / (cfg.max - cfg.min)) * 100
  const [realisticLo, realisticHi] = cfg.realistic(value)
  const areaHint = cfg.areaHint(value)

  return (
    <>
      <div style={{ margin:"4px 0 22px", padding:"22px 20px 20px", borderRadius:22, background:V.card, border:`1px solid ${V.border}` }}>
        <div style={{ fontSize:10, fontWeight:600, letterSpacing:"0.3em", textTransform:"uppercase", color:"rgba(240,239,232,0.38)", marginBottom:6 }}>
          {intent === "rent" ? "ANNUAL BUDGET" : intent === "invest" ? "CAPITAL AVAILABLE" : "READY TO SPEND"}
        </div>
        <input
          type="text"
          value={text}
          onChange={handleInput}
          onBlur={() => syncText(value)}
          style={{ width:"100%", border:"none", background:"transparent", padding:0, outline:"none", fontFamily:V.fontMono, fontSize:38, fontWeight:700, letterSpacing:"-0.03em", color:V.gold }}
        />
        {intent === "rent" && (
          <div style={{ marginTop:2, fontSize:12, color:"rgba(240,239,232,0.4)" }}>
            per year · approx. {formatAED(Math.round(value / 12 / 1000) * 1000)}/mo
          </div>
        )}
        <div style={{ marginTop:20 }}>
          <div style={{ position:"relative", height:28, display:"flex", alignItems:"center" }}>
            <div style={{ position:"absolute", left:0, right:0, height:4, borderRadius:999, background:"rgba(255,255,255,0.08)" }} />
            <div style={{ position:"absolute", left:0, width:`${pct}%`, height:4, borderRadius:999, background:V.progGrad, transition:"width 0.1s linear" }} />
            <input type="range" min={cfg.min} max={cfg.max}
              step={intent === "rent" ? 1000 : 25_000} value={value}
              onChange={handleSlider} className="q-slider"
              style={{ WebkitAppearance:"none", appearance:"none", position:"absolute", left:0, right:0, width:"100%", height:28, background:"transparent", cursor:"pointer", zIndex:2, outline:"none" }}
            />
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:6, fontSize:10.5, fontWeight:500, color:"rgba(240,239,232,0.3)", fontFamily:V.fontMono }}>
            <span>{formatAED(cfg.min)}</span><span>{formatAED(cfg.max)}</span>
          </div>
        </div>
      </div>

      <div style={{ fontSize:10, fontWeight:600, letterSpacing:"0.25em", textTransform:"uppercase", color:"rgba(240,239,232,0.32)", marginBottom:8 }}>QUICK PICKS</div>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:8 }}>
        {quicks.map(q => (
          <button key={q} onClick={() => { setValue(q); syncText(q); setCommitted(false) }}
            style={{
              padding:"10px 14px", borderRadius:999,
              border:`1px solid ${value === q ? "rgba(201,168,76,0.4)" : V.border}`,
              background: value === q ? V.goldDim : "rgba(255,255,255,0.02)",
              color: value === q ? V.gold : "rgba(240,239,232,0.7)",
              fontSize:13, fontWeight:600, cursor:"pointer", transition:"all 0.18s",
            }}>{formatAED(q)}</button>
        ))}
      </div>

      {committed && (
        <div className="anim-reveal-down" style={{
          marginTop:20, padding:18, borderRadius:20,
          background:"linear-gradient(170deg, rgba(201,168,76,0.14), rgba(201,168,76,0.03) 70%)",
          border:"1px solid rgba(201,168,76,0.28)",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
            <span className="anim-gold-pulse" style={{ width:8, height:8, borderRadius:999, background:V.gold, boxShadow:"0 0 10px rgba(201,168,76,0.6)" }} />
            <span style={{ fontSize:9.5, fontWeight:700, letterSpacing:"0.3em", textTransform:"uppercase", color:"rgba(201,168,76,0.75)" }}>VERDICT · AI READ</span>
          </div>
          <p style={{ fontSize:17, fontStyle:"italic", fontWeight:500, color:V.goldLight, lineHeight:1.35, margin:"0 0 12px", letterSpacing:"-0.005em" }}>
            "Based on {formatAED(value)}, your realistic range is{" "}
            <span style={{ fontStyle:"normal", fontFamily:V.fontMono, fontWeight:700, color:V.gold }}>
              {formatAED(realisticLo)}–{formatAED(realisticHi)}
            </span>
            {intent === "rent" ? " / yr" : ""}."
          </p>
          <div style={{ display:"flex", gap:10, padding:"10px 12px", borderRadius:12, background:"rgba(0,0,0,0.25)", border:"1px solid rgba(201,168,76,0.12)" }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.25em", textTransform:"uppercase", color:"rgba(240,239,232,0.35)", marginBottom:3 }}>TYPICAL FIT</div>
              <div style={{ fontSize:12, fontWeight:500, lineHeight:1.4, color:"rgba(240,239,232,0.8)" }}>{areaHint}</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ flex:1, minHeight:16 }} />
      <button onClick={committed ? (() => onAdvance({ budget: value })) : commit}
        style={{
          marginTop:24, width:"100%", padding:"17px 20px", borderRadius:16, border:"none",
          background:V.ctaGrad, color:"#07070F",
          fontSize:16, fontWeight:700, letterSpacing:"-0.01em", cursor:"pointer",
          boxShadow:"0 10px 24px rgba(201,168,76,0.22)",
          transition:`transform 0.18s ${V.easeApple}`,
        }}
        onMouseDown={e => (e.currentTarget.style.transform = "scale(0.98)")}
        onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
        onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}>
        {committed ? "Continue" : "See my realistic range"}
      </button>
    </>
  )
}

// ── Off-Plan: Payment Plan Capacity step ──────────────────
function PaymentPlanStep({ budget, onAdvance }: {
  budget: number
  onAdvance: (v: { downpaymentPercent: number; paymentPlanCapacity: number }) => void
}) {
  const [dpPct, setDpPct] = useState(20)
  const [monthly, setMonthly] = useState(10_000)
  const dpAmount = Math.round(budget * (dpPct / 100))
  const MONTHLY_MIN = 3_000
  const MONTHLY_MAX = 50_000
  const pct = ((monthly - MONTHLY_MIN) / (MONTHLY_MAX - MONTHLY_MIN)) * 100

  return (
    <>
      <div style={{ margin:"4px 0 18px", padding:"20px", borderRadius:22, background:V.card, border:`1px solid ${V.border}` }}>
        <div style={{ fontSize:10, fontWeight:600, letterSpacing:"0.3em", textTransform:"uppercase", color:"rgba(240,239,232,0.38)", marginBottom:12 }}>DOWNPAYMENT</div>
        <div style={{ display:"flex", gap:8, marginBottom:8 }}>
          {[10, 20, 30, 40].map(p => (
            <button key={p} onClick={() => setDpPct(p)} style={{
              flex:1, padding:"12px 6px", borderRadius:12,
              border:`1px solid ${dpPct === p ? "rgba(201,168,76,0.45)" : V.border}`,
              background: dpPct === p ? V.goldDim : "rgba(255,255,255,0.02)",
              color: dpPct === p ? V.gold : "rgba(240,239,232,0.7)",
              fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:V.fontMono,
            }}>{p}%</button>
          ))}
        </div>
        <div style={{ fontSize:12, color:"rgba(240,239,232,0.4)", marginTop:4, fontFamily:V.fontMono }}>
          = {formatAED(dpAmount)} upfront
        </div>
      </div>

      <div style={{ margin:"0 0 18px", padding:"20px", borderRadius:22, background:V.card, border:`1px solid ${V.border}` }}>
        <div style={{ fontSize:10, fontWeight:600, letterSpacing:"0.3em", textTransform:"uppercase", color:"rgba(240,239,232,0.38)", marginBottom:8 }}>MONTHLY PAYMENT CAPACITY</div>
        <div style={{ fontFamily:V.fontMono, fontSize:32, fontWeight:700, letterSpacing:"-0.03em", color:V.gold, marginBottom:16 }}>
          {formatAED(monthly)}<span style={{ fontSize:14, fontWeight:500, color:"rgba(240,239,232,0.4)" }}>/mo</span>
        </div>
        <div style={{ position:"relative", height:28, display:"flex", alignItems:"center" }}>
          <div style={{ position:"absolute", left:0, right:0, height:4, borderRadius:999, background:"rgba(255,255,255,0.08)" }} />
          <div style={{ position:"absolute", left:0, width:`${pct}%`, height:4, borderRadius:999, background:V.progGrad, transition:"width 0.1s linear" }} />
          <input type="range" min={MONTHLY_MIN} max={MONTHLY_MAX} step={1_000} value={monthly}
            onChange={e => setMonthly(Number(e.target.value))} className="q-slider"
            style={{ WebkitAppearance:"none", appearance:"none", position:"absolute", left:0, right:0, width:"100%", height:28, background:"transparent", cursor:"pointer", zIndex:2, outline:"none" }}
          />
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:6, fontSize:10.5, fontWeight:500, color:"rgba(240,239,232,0.3)", fontFamily:V.fontMono }}>
          <span>AED 3K</span><span>AED 50K</span>
        </div>
      </div>

      <div style={{ flex:1, minHeight:16 }} />
      <button onClick={() => onAdvance({ downpaymentPercent: dpPct, paymentPlanCapacity: monthly })}
        style={{
          marginTop:24, width:"100%", padding:"17px 20px", borderRadius:16, border:"none",
          background:V.ctaGrad, color:"#07070F",
          fontSize:16, fontWeight:700, letterSpacing:"-0.01em", cursor:"pointer",
          boxShadow:"0 10px 24px rgba(201,168,76,0.22)",
          transition:`transform 0.18s ${V.easeApple}`,
        }}
        onMouseDown={e => (e.currentTarget.style.transform = "scale(0.98)")}
        onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
        onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}>
        Find off-plan zones
      </button>
    </>
  )
}

function QualifyFlow({ onDone, onBack }: { onDone: (profile: Profile) => void; onBack: () => void }) {
  const [step, setStep] = useState(1)
  const [animKey, setAnimKey] = useState(0)
  const [profile, setProfile] = useState<Profile>({})
  const TOTAL = 6

  function advance(updates: Partial<Profile>) {
    const next = { ...profile, ...updates }
    setProfile(next)
    if (step >= TOTAL) { onDone(next); return }
    setStep(s => s + 1); setAnimKey(k => k + 1)
  }
  function skip() { advance({}) }
  function back() {
    if (step === 1) { onBack(); return }
    setStep(s => s - 1); setAnimKey(k => k + 1)
  }

  const intent = (profile.intent || "buy") as "buy" | "rent" | "invest"

  const AREAS: { v: string; label: string; yield?: string; note?: string }[] = {
    buy: [
      { v:"downtown", label:"Downtown / DIFC", note:"Lifestyle" },
      { v:"business-bay", label:"Business Bay", yield:"7.1%" },
      { v:"marina", label:"Dubai Marina", yield:"6.2%" },
      { v:"jvc", label:"JVC / JLT", yield:"7.8%" },
      { v:"creek", label:"Creek Harbour", yield:"6.8%" },
      { v:"hills", label:"Dubai Hills", yield:"5.9%" },
    ],
    rent: [
      { v:"downtown", label:"Downtown / DIFC", note:"Zero commute" },
      { v:"business-bay", label:"Business Bay", note:"Metro linked" },
      { v:"marina", label:"Dubai Marina", note:"Waterfront" },
      { v:"jvc", label:"JVC / JLT", note:"Best value" },
    ],
    invest: [
      { v:"creek", label:"Creek Harbour", yield:"6.8%", note:"Fastest growing" },
      { v:"business-bay", label:"Business Bay", yield:"7.1%" },
      { v:"jvc", label:"JVC / JLT", yield:"7.8%", note:"Best yield" },
      { v:"expo", label:"Expo City", yield:"6.5%+" },
    ],
  }[intent]

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", width:"100%", background:V.bg }}>
      <QProgress step={step} total={TOTAL} onBack={back} onSkip={step > 1 ? skip : undefined} />
      <div key={animKey} className="anim-phase-in" style={{ flex:1, padding:"6px 24px 28px", overflowY:"auto", display:"flex", flexDirection:"column" }}>

        {step === 1 && (
          <>
            <QHeader eyebrow="QUALIFICATION" title={"What are you\nlooking to do?"} context="RERA-grade qualification. Zero cost to buyers." />
            <BigOption icon={<IconBuy />} label="Buy a property" sub="Ready market or off-plan" delay={40} onClick={() => advance({ intent:"buy" })} />
            <BigOption icon={<IconRent />} label="Rent a property" sub="Apartments, villas & townhouses" delay={120} onClick={() => advance({ intent:"rent" })} />
            <BigOption icon={<IconInvest />} label="Invest in off-plan" sub="Score launches · qualify developers" note="YIELD" delay={200} onClick={() => advance({ intent:"invest" })} />
          </>
        )}

        {step === 2 && (
          <>
            <QHeader eyebrow="PROPERTY TYPE" title="What type of property?"
              context={intent === "invest" ? "Type drives yield profile and tenant demand."
                : intent === "rent" ? "Residential or commercial — different RERA rules apply."
                : "Each has a different spec, cost, and paperwork."} />
            <BigOption icon={<IconApt />} label="Apartment" sub="Studio to 4BR · towers & mid-rise" delay={40}
              onClick={() => advance({ propertyType:"apartment", category:"residential" })} />
            <BigOption icon={<IconVilla />} label="Villa" sub="Standalone · 3–7BR · private plot" delay={120}
              onClick={() => advance({ propertyType:"villa", category:"residential" })} />
            <BigOption icon={<IconTown />} label="Townhouse" sub="Semi-detached · community living" delay={200}
              onClick={() => advance({ propertyType:"townhouse", category:"residential" })} />
            {intent === "rent" && (
              <>
                <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.3em", textTransform:"uppercase", color:"rgba(240,239,232,0.25)", margin:"10px 0 6px", paddingLeft:2 }}>COMMERCIAL</div>
                <BigOption icon={<IconOffice />} label="Office" sub="Open plan · serviced · fitted units" delay={280}
                  onClick={() => advance({ propertyType:"office", category:"commercial" })} />
                <BigOption icon={<IconWarehouse />} label="Warehouse" sub="Al Quoz · Dubai South · JAFZA" delay={360}
                  onClick={() => advance({ propertyType:"warehouse", category:"commercial" })} />
                <BigOption icon={<IconRetail />} label="Retail" sub="Mall · strip · high street units" delay={440}
                  onClick={() => advance({ propertyType:"retail", category:"commercial" })} />
              </>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <QHeader eyebrow={intent === "rent" ? "ANNUAL BUDGET" : "CAPITAL READY"}
              title={intent === "rent" ? "How much can you\nspend per year?" : intent === "invest" ? "How much capital\ndo you have ready?" : "How much do you\nhave ready?"}
              context={intent === "invest" ? "Total — not just the deposit." : intent === "rent" ? "Gross annual, before DEWA and Ejari." : "Cash or mortgage-ready. We'll stress-test it."} />
            <BudgetStep intent={intent} onAdvance={advance} />
          </>
        )}

        {step === 4 && (
          <>
            <QHeader eyebrow="TIMELINE" title={"When are you\nready to transact?"} context="Your timeline determines lead priority." />
            <BigOption icon={<IconClock />} label="Ready now" sub="0–90 days · I can move fast" note="PRIORITY" delay={40} onClick={() => advance({ timeline:"ready" })} />
            <BigOption icon={<IconCalendar />} label="Planning ahead" sub="3–6 months · gathering info" note="WARM" delay={120} onClick={() => advance({ timeline:"soon" })} />
            <BigOption icon={<IconCompass />} label="Exploring the market" sub="No fixed timeline yet" delay={200} onClick={() => advance({ timeline:"browsing" })} />
          </>
        )}

        {step === 5 && (
          <>
            <QHeader eyebrow="FINANCING"
              title={intent === "rent" ? "How are you paying?" : "How are you buying?"}
              context={intent === "rent" ? "Chequing structure changes landlord preference." : "Shapes which properties and structures qualify."} />
            {intent === "rent" ? (
              <>
                <BigOption icon={<IconCash />} label="1 cheque" sub="Best negotiating position" note="PRIORITY" delay={40} onClick={() => advance({ financeType:"1chq" })} />
                <BigOption icon={<IconCards />} label="2–4 cheques" sub="Standard market structure" delay={120} onClick={() => advance({ financeType:"multichq" })} />
                <BigOption icon={<IconCards />} label="12 cheques" sub="Monthly · limited inventory" delay={200} onClick={() => advance({ financeType:"monthly" })} />
              </>
            ) : (
              <>
                <BigOption icon={<IconCash />} label="Cash buyer" sub="Full amount available — no mortgage" note="HIGHEST" delay={40} onClick={() => advance({ financeType:"cash" })} />
                <BigOption icon={<IconCards />} label="Mortgage buyer" sub="Bank financing · pre-approval helps" delay={120} onClick={() => advance({ financeType:"mortgage" })} />
                <BigOption icon={<IconMixed />} label="Mixed" sub="Part cash, part mortgage" delay={200} onClick={() => advance({ financeType:"mixed" })} />
              </>
            )}
          </>
        )}

        {step === 6 && intent === "invest" && (
          <>
            <QHeader eyebrow="PAYMENT PLAN"
              title={"Structure your\noff-plan entry."}
              context="We'll match zones where your cashflow qualifies." />
            <PaymentPlanStep budget={profile.budget ?? 1_200_000} onAdvance={advance} />
          </>
        )}

        {step === 6 && intent !== "invest" && (
          <>
            <QHeader eyebrow="PREFERRED AREAS"
              title={"Which areas\nare you drawn to?"}
              context="Pick one — we'll score the best matches." />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {AREAS.map((a, i) => (
                <button key={a.v} onClick={() => advance({ area:a.v })}
                  className="anim-fade-up"
                  style={{
                    animationDelay:`${40 + i * 60}ms`,
                    display:"flex", flexDirection:"column", alignItems:"flex-start",
                    padding:"16px 16px 18px", borderRadius:18, textAlign:"left",
                    background:V.card, border:`1px solid ${V.border}`,
                    color:V.text, cursor:"pointer",
                    transition:`transform 0.18s ${V.easeApple}`,
                  }}
                  onMouseDown={e => (e.currentTarget.style.transform = "scale(0.98)")}
                  onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
                  onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}>
                  <div style={{ width:"100%", height:52, borderRadius:12, background:`linear-gradient(135deg, ${areaTint(a.v)})`, marginBottom:12, border:"1px solid rgba(255,255,255,0.04)" }} />
                  <div style={{ fontSize:14, fontWeight:600, color:"#fff", letterSpacing:"-0.01em", marginBottom:4 }}>{a.label}</div>
                  {a.yield && <span style={{ fontSize:11, fontWeight:700, color:V.green, fontFamily:V.fontMono }}>{a.yield} yield</span>}
                  {a.note && !a.yield && <span style={{ fontSize:11, color:"rgba(240,239,232,0.5)" }}>{a.note}</span>}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── 3. THINKING ────────────────────────────────────────────────
function ThinkingScreen({ profile, onDone }: { profile: Profile; onDone: (props: Property[]) => void }) {
  const lines = profile.intent === "invest" ? [
    "Running yield calculations…",
    "Checking developer delivery records…",
    "Comparing entry price vs secondary…",
    "Flagging payment plan risks…",
    "Generating broker-grade briefs…",
  ] : [
    "Scanning DLD transaction records…",
    "Comparing price/sqft to area comps…",
    "Evaluating developer track records…",
    "Scoring layout and livability…",
    "Generating AI verdicts…",
  ]
  const [idx, setIdx] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const ti = setInterval(() => setIdx(i => Math.min(i + 1, lines.length - 1)), 700)
    const tp = setInterval(() => setProgress(p => Math.min(p + 2, 100)), 60)

    async function fetchAndDone() {
      let props: Property[] = []
      try {
        const res = await fetch("/api/match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            purpose: profile.intent === "invest" ? "off-plan" : profile.intent ?? "buy",
            category: profile.category ?? "residential",
            budget: profile.budget ?? 2_000_000,
            subType: profile.propertyType,
            downpaymentPercent: profile.downpaymentPercent ?? 20,
            monthlyCapacity: profile.paymentPlanCapacity ?? 10_000,
          }),
        })
        if (res.ok) {
          const data = await res.json()
          const listings: ApiListing[] = data.listings ?? []
          if (listings.length > 0) props = mapListingsToProperties(listings)
        }
      } catch (_) { /* fall through to static data */ }

      if (props.length === 0) props = filterProperties(profile)
      await new Promise(r => setTimeout(r, 3200))
      clearInterval(ti); clearInterval(tp)
      setProgress(100)
      setTimeout(() => onDone(props), 150)
    }

    fetchAndDone()
    return () => { clearInterval(ti); clearInterval(tp) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      height:"100%", padding:"0 32px", textAlign:"center", background:V.bg,
    }}>
      <div className="anim-gold-pulse" style={{
        width:84, height:84, borderRadius:24,
        background:"linear-gradient(135deg, rgba(201,168,76,0.14), rgba(201,168,76,0.02))",
        border:"1px solid rgba(201,168,76,0.22)",
        display:"flex", alignItems:"center", justifyContent:"center", marginBottom:28,
      }}>
        <span style={{ fontSize:34, fontWeight:900, letterSpacing:"-0.04em", color:V.gold }}>V</span>
      </div>
      <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.3em", textTransform:"uppercase", color:"rgba(201,168,76,0.7)", marginBottom:12 }}>VERDICT · ANALYSIS</div>
      <h2 style={{ fontSize:26, fontWeight:700, color:"#fff", margin:"0 0 10px", letterSpacing:"-0.02em", lineHeight:1.1 }}>Analyzing your brief</h2>
      <p style={{ fontSize:13, color:"rgba(240,239,232,0.45)", margin:"0 0 32px", maxWidth:260, lineHeight:1.5 }}>Cross-checking 40,000+ listings against live DLD data.</p>
      <div style={{ width:180, height:3, borderRadius:999, background:"rgba(255,255,255,0.06)", marginBottom:24, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${progress}%`, background:V.progGrad, transition:"width 0.06s linear" }} />
      </div>
      <p key={idx} className="anim-fade-up" style={{ fontSize:12.5, fontStyle:"italic", color:"rgba(201,168,76,0.65)", margin:0, minHeight:20 }}>{lines[idx]}</p>
    </div>
  )
}

// ── 4. SWIPE RESULTS ───────────────────────────────────────────
function PropertyCard({ prop, behind, topRef, onDown, onMove, onUp, hint = 0 }: {
  prop: Property; behind?: boolean
  topRef?: React.RefObject<HTMLDivElement>
  onDown?: (e: React.PointerEvent) => void
  onMove?: (e: React.PointerEvent) => void
  onUp?: (e: React.PointerEvent) => void
  hint?: number
}) {
  return (
    <div ref={topRef}
      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
      style={{
        position:"absolute", top:16, left:20, right:20, bottom:20,
        borderRadius:24, overflow:"hidden",
        background:V.card, border:`1px solid ${V.border}`,
        boxShadow: behind ? "0 10px 30px rgba(0,0,0,0.3)" : "0 20px 60px rgba(0,0,0,0.55)",
        transform: behind ? "translateY(14px) scale(0.96)" : "translateX(0) rotate(0)",
        opacity: behind ? 0.8 : 1,
        touchAction:"none",
        cursor: behind ? "default" : "grab",
        display:"flex", flexDirection:"column",
      }}>
      <PropertyHero prop={prop} height={260} />
      <div style={{ padding:"16px 18px 18px", flex:1, display:"flex", flexDirection:"column" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
          <div>
            <div style={{ fontSize:11, fontWeight:600, color:"rgba(240,239,232,0.45)", letterSpacing:"0.02em", marginBottom:3 }}>
              {prop.transaction === "rent" ? "ANNUAL RENT" : prop.transaction === "offplan" ? "FROM" : "PRICE"}
            </div>
            <div style={{ fontSize:22, fontWeight:700, color:"#fff", letterSpacing:"-0.02em", fontFamily:V.fontMono }}>
              {prop.transaction === "rent" ? fmtRentYr(prop.price) : fmtAED(prop.price)}
            </div>
          </div>
          <ScoreChip score={prop.score} label={prop.scoreLabel} />
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:12, background:"rgba(52,199,123,0.08)", border:"1px solid rgba(52,199,123,0.2)", marginBottom:12 }}>
          <span style={{ width:6, height:6, borderRadius:999, background:V.green }} />
          <span style={{ fontSize:12, fontWeight:500, color:V.green, flex:1 }}>
            AED {prop.psf.toLocaleString()}/ft² · <span style={{ color:"rgba(52,199,123,0.7)" }}>vs area avg {prop.areaPsf.toLocaleString()}</span>
          </span>
        </div>
        <div style={{ padding:"12px 14px", borderRadius:14, background:"linear-gradient(170deg, rgba(201,168,76,0.1), rgba(201,168,76,0.02))", border:"1px solid rgba(201,168,76,0.2)", flex:1 }}>
          <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.3em", textTransform:"uppercase", color:"rgba(201,168,76,0.7)", marginBottom:5 }}>VERDICT</div>
          <p style={{ fontSize:13, fontStyle:"italic", fontWeight:500, color:V.goldLight, lineHeight:1.4, margin:0 }}>"{prop.verdict}"</p>
        </div>
      </div>
    </div>
  )
}

function ActionBtn({ onClick, color, label, icon, accent }: { onClick: () => void; color: string; label: string; icon: string; accent?: boolean }) {
  return (
    <button onClick={onClick} aria-label={label} style={{
      width:64, height:64, borderRadius:999,
      background: accent ? "linear-gradient(135deg, rgba(201,168,76,0.18), rgba(201,168,76,0.04))" : "rgba(255,255,255,0.04)",
      border:`1.5px solid ${accent ? "rgba(201,168,76,0.45)" : "rgba(255,255,255,0.08)"}`,
      color, fontSize:22, fontWeight:700, cursor:"pointer",
      boxShadow: accent ? "0 6px 20px rgba(201,168,76,0.15)" : "none",
      transition:`transform 0.15s ${V.easeApple}`,
    }}
    onMouseDown={e => (e.currentTarget.style.transform = "scale(0.9)")}
    onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
    onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}>{icon}</button>
  )
}

function SwipeResults({ properties, onSave, onComplete, saved }: {
  properties: Property[]; onSave: (p: Property) => void; onComplete: () => void; saved: Property[]
}) {
  const [stack, setStack] = useState(() => [...properties])
  const [detail, setDetail] = useState<Property | null>(null)
  const topRef = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const curX = useRef(0)
  const dragging = useRef(false)
  const moved = useRef(false)
  const [hint, setHint] = useState(0)

  const top = stack[0]
  const next = stack[1]

  useEffect(() => {
    if (stack.length === 0) {
      const t = setTimeout(onComplete, 500)
      return () => clearTimeout(t)
    }
  }, [stack.length])

  function handleChoice(dir: number) {
    if (!top) return
    if (topRef.current) {
      topRef.current.style.transition = `transform 0.42s ${V.easeInOut}, opacity 0.42s`
      topRef.current.style.transform = `translateX(${dir * 440}px) rotate(${dir * 14}deg)`
      topRef.current.style.opacity = "0"
    }
    if (dir > 0) onSave(top)
    setTimeout(() => { setStack(s => s.slice(1)); setHint(0) }, 360)
  }

  function onDown(e: React.PointerEvent) {
    dragging.current = true; moved.current = false
    startX.current = e.clientX; curX.current = 0
    if (topRef.current) {
      topRef.current.setPointerCapture(e.pointerId)
      topRef.current.style.transition = "none"
    }
  }
  function onMove(e: React.PointerEvent) {
    if (!dragging.current) return
    const dx = e.clientX - startX.current
    if (Math.abs(dx) > 6) moved.current = true
    curX.current = dx
    if (topRef.current) topRef.current.style.transform = `translateX(${dx}px) rotate(${dx / 22}deg)`
    setHint(Math.max(-1, Math.min(1, dx / 100)))
  }
  function onUp() {
    if (!dragging.current) return
    dragging.current = false
    const dx = curX.current
    if (Math.abs(dx) > 110) {
      handleChoice(dx > 0 ? 1 : -1)
    } else {
      if (topRef.current) {
        topRef.current.style.transition = `transform 0.5s ${V.easeSpring}`
        topRef.current.style.transform = "translateX(0) rotate(0)"
      }
      setHint(0)
      if (!moved.current && top) setDetail(top)
    }
  }

  if (detail) {
    return <DetailSheet prop={detail} saved={saved.some(x => x.id === detail.id)}
      onSave={() => { onSave(detail); setDetail(null) }} onClose={() => setDetail(null)} />
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", background:V.bg, position:"relative" }}>
      <div style={{ padding:"14px 20px 12px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
        <div>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.3em", textTransform:"uppercase", color:"rgba(201,168,76,0.7)", marginBottom:4 }}>RANKED MATCHES</div>
          <div style={{ fontSize:18, fontWeight:700, color:"#fff", letterSpacing:"-0.01em" }}>{properties.length} properties scored</div>
        </div>
        <button onClick={onComplete} style={{
          padding:"8px 14px", borderRadius:999,
          background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)",
          color:"rgba(240,239,232,0.7)", fontSize:12, fontWeight:600, cursor:"pointer",
        }}>View list</button>
      </div>

      <div style={{ flex:1, position:"relative", padding:"8px 20px 16px", display:"flex", alignItems:"center", justifyContent:"center" }}>
        {stack.length === 0 && (
          <div style={{ textAlign:"center", color:V.textDim }}>
            <div style={{ fontSize:36, marginBottom:12 }}>✓</div>
            <div style={{ fontSize:16, color:"#fff", fontWeight:600 }}>All reviewed</div>
          </div>
        )}
        {next && <PropertyCard key={next.id} prop={next} behind />}
        {top && <PropertyCard key={top.id} prop={top} topRef={topRef} onDown={onDown} onMove={onMove} onUp={onUp} hint={hint} />}

        {top && (
          <>
            <div style={{
              position:"absolute", top:"18%", left:36,
              padding:"8px 14px", borderRadius:10,
              border:"2px solid rgba(232,91,91,0.8)", color:"rgba(232,91,91,0.9)",
              fontSize:13, fontWeight:800, letterSpacing:"0.15em",
              transform:`rotate(-12deg) scale(${Math.max(0, -hint)})`,
              opacity:Math.max(0, -hint), transition:"opacity 0.15s, transform 0.15s",
              pointerEvents:"none",
            }}>PASS</div>
            <div style={{
              position:"absolute", top:"18%", right:36,
              padding:"8px 14px", borderRadius:10,
              border:`2px solid rgba(201,168,76,0.9)`, color:V.gold,
              fontSize:13, fontWeight:800, letterSpacing:"0.15em",
              transform:`rotate(12deg) scale(${Math.max(0, hint)})`,
              opacity:Math.max(0, hint), transition:"opacity 0.15s, transform 0.15s",
              pointerEvents:"none",
            }}>SAVE</div>
          </>
        )}
      </div>

      <div style={{ padding:"0 20px 16px", display:"flex", alignItems:"center", justifyContent:"center", gap:18, flexShrink:0 }}>
        <ActionBtn onClick={() => handleChoice(-1)} color="#E85B5B" label="Pass" icon="✕" />
        <div style={{ fontSize:11, fontWeight:600, color:"rgba(240,239,232,0.35)", fontFamily:V.fontMono, letterSpacing:"0.2em", minWidth:52, textAlign:"center" }}>
          {properties.length - stack.length + 1} / {properties.length}
        </div>
        <ActionBtn onClick={() => handleChoice(1)} color={V.gold} label="Save" icon="★" accent />
      </div>
    </div>
  )
}

// ── 5. DETAIL SHEET ────────────────────────────────────────────
function DetailSheet({ prop, saved, onSave, onClose, onContact, contacted }: {
  prop: Property; saved: boolean; onSave: () => void; onClose: () => void
  onContact?: () => void; contacted?: boolean
}) {
  return (
    <div className="anim-phase-in" style={{
      position:"absolute", inset:0, zIndex:30,
      display:"flex", flexDirection:"column",
      background:V.bg, overflow:"hidden",
    }}>
      <div style={{ position:"relative", flexShrink:0 }}>
        <PropertyHero prop={prop} height={260} />
        <div style={{ position:"absolute", bottom:14, left:14, right:14 }}>
          <div style={{ fontSize:9.5, fontWeight:700, letterSpacing:"0.3em", textTransform:"uppercase", color:"rgba(255,255,255,0.7)", textShadow:"0 2px 8px rgba(0,0,0,0.6)", marginBottom:6 }}>{prop.area}</div>
          <div style={{ fontSize:26, fontWeight:700, color:"#fff", letterSpacing:"-0.02em", lineHeight:1.05 }}>{prop.name}</div>
          <div style={{ fontSize:12, fontWeight:500, color:"rgba(255,255,255,0.6)", marginTop:4, letterSpacing:"0.02em" }}>
            by {prop.developer} · {prop.bedrooms === "studio" ? "Studio" : `${prop.bedrooms} BR`} · {prop.size.toLocaleString()} ft²
          </div>
        </div>
        <button onClick={onClose} style={{
          position:"absolute", top:14, left:14,
          width:36, height:36, borderRadius:999,
          background:"rgba(0,0,0,0.55)", backdropFilter:"blur(10px)",
          border:"1px solid rgba(255,255,255,0.1)",
          color:"#fff", fontSize:16, cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>←</button>
        <div style={{ position:"absolute", top:14, right:14, padding:"6px 10px", borderRadius:999, background:"rgba(0,0,0,0.55)", backdropFilter:"blur(10px)", border:"1px solid rgba(201,168,76,0.3)" }}>
          <ScoreChip score={prop.score} label={prop.scoreLabel} />
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"18px 20px 100px" }}>
        <div style={{ display:"flex", gap:8, marginBottom:16 }}>
          {[
            { label: prop.transaction === "rent" ? "ANNUAL" : "PRICE", value: prop.transaction === "rent" ? fmtRentYr(prop.price) : fmtAED(prop.price), sub: undefined, tone:"#fff" },
            { label:"PRICE/FT²", value:`AED ${prop.psf.toLocaleString()}`, sub:`vs avg ${prop.areaPsf.toLocaleString()}`, tone: prop.psf < prop.areaPsf ? V.green : "#fff" },
            { label:"SIZE", value:prop.size.toLocaleString(), sub:"sq ft", tone:"#fff" },
          ].map((t, i) => (
            <div key={i} style={{ flex:1, padding:"12px 10px", borderRadius:14, background:V.card, border:`1px solid ${V.border}` }}>
              <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.25em", textTransform:"uppercase", color:"rgba(240,239,232,0.35)", marginBottom:4 }}>{t.label}</div>
              <div style={{ fontSize:15, fontWeight:700, color:t.tone, letterSpacing:"-0.01em", lineHeight:1.1, fontFamily:V.fontMono }}>{t.value}</div>
              {t.sub && <div style={{ fontSize:10, color:"rgba(240,239,232,0.35)", marginTop:2 }}>{t.sub}</div>}
            </div>
          ))}
        </div>

        <div style={{ padding:16, borderRadius:18, marginBottom:16, background:"linear-gradient(170deg, rgba(201,168,76,0.14), rgba(201,168,76,0.02))", border:"1px solid rgba(201,168,76,0.28)" }}>
          <div style={{ fontSize:9.5, fontWeight:700, letterSpacing:"0.3em", textTransform:"uppercase", color:"rgba(201,168,76,0.75)", marginBottom:8 }}>AI VERDICT</div>
          <p style={{ fontSize:16, fontStyle:"italic", fontWeight:500, color:V.goldLight, lineHeight:1.35, margin:0 }}>"{prop.verdict}"</p>
        </div>

        {prop.scores && (
          <div style={{ padding:16, borderRadius:18, marginBottom:16, background:V.card, border:`1px solid ${V.border}` }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.25em", textTransform:"uppercase", color:"rgba(240,239,232,0.5)", marginBottom:12 }}>5-DIMENSION SCORE</div>
            {Object.entries(prop.scores).map(([k, v], i) => {
              const max = ({ developer:25, layout:20, location:20, price:25, market:10 } as Record<string, number>)[k] || 20
              return (
                <div key={k} style={{ marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                    <span style={{ fontSize:11, fontWeight:500, textTransform:"capitalize", color:"rgba(240,239,232,0.65)" }}>{k}</span>
                    <span style={{ fontSize:11, fontWeight:700, color:V.gold, fontFamily:V.fontMono }}>{v}/{max}</span>
                  </div>
                  <div style={{ height:4, borderRadius:999, background:"rgba(255,255,255,0.05)", overflow:"hidden" }}>
                    <div className="onb-bar" style={{ height:"100%", width:`${(v/max)*100}%`, borderRadius:999, background:V.progGrad, animationDelay:`${120 + i * 60}ms` }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {prop.positive.length > 0 && (
          <div style={{ padding:16, borderRadius:18, marginBottom:12, background:V.card, border:`1px solid ${V.border}` }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.25em", textTransform:"uppercase", color:V.green, marginBottom:10 }}>▲ WORKING IN YOUR FAVOR</div>
            {prop.positive.map((x, i) => (
              <div key={i} style={{ display:"flex", gap:10, padding:"6px 0", fontSize:13, color:"rgba(240,239,232,0.8)", lineHeight:1.4 }}>
                <span style={{ color:V.green, flexShrink:0 }}>+</span><span>{x}</span>
              </div>
            ))}
          </div>
        )}

        {prop.risk.length > 0 && (
          <div style={{ padding:16, borderRadius:18, background:V.card, border:`1px solid ${V.border}` }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.25em", textTransform:"uppercase", color:V.amber, marginBottom:10 }}>⚠ RISK FLAGS</div>
            {prop.risk.map((x, i) => (
              <div key={i} style={{ display:"flex", gap:10, padding:"6px 0", fontSize:13, color:"rgba(240,239,232,0.8)", lineHeight:1.4 }}>
                <span style={{ color:V.amber, flexShrink:0 }}>!</span><span>{x}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"14px 20px 28px", background:"linear-gradient(to top, #07070F 60%, rgba(7,7,15,0.8) 85%, transparent)", display:"flex", gap:10 }}>
        <button onClick={onSave} disabled={saved} style={{
          flex:1, padding:16, borderRadius:14,
          border: saved ? "none" : "1px solid rgba(255,255,255,0.1)",
          background: saved ? "rgba(201,168,76,0.12)" : "rgba(255,255,255,0.04)",
          color: saved ? V.gold : "rgba(240,239,232,0.7)",
          fontSize:14, fontWeight:700, cursor: saved ? "default" : "pointer",
        }}>{saved ? "★ Saved" : "★ Save"}</button>
        {onContact && (
          <button onClick={contacted ? undefined : onContact} style={{
            flex:2, padding:16, borderRadius:14, border:"none",
            background: contacted ? "rgba(52,199,123,0.15)" : V.ctaGrad,
            color: contacted ? V.green : "#07070F",
            fontSize:14, fontWeight:700, cursor: contacted ? "default" : "pointer", letterSpacing:"-0.01em",
          }}>{contacted ? "✓ Agent notified" : "Contact Agent"}</button>
        )}
      </div>
    </div>
  )
}

// ── 6. LIST VIEW ───────────────────────────────────────────────
function ListResults({ properties, saved, onOpen, onOpenSaved, onRestart }: {
  properties: Property[]; saved: Property[]
  onOpen: (p: Property) => void; onOpenSaved: () => void; onRestart: () => void
}) {
  const [detail, setDetail] = useState<Property | null>(null)

  function handleOpen(p: Property) {
    setDetail(p)
    onOpen(p)
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", background:V.bg, position:"relative" }}>
      {detail && (
        <DetailSheet prop={detail} saved={saved.some(x => x.id === detail.id)}
          onSave={() => {}} onClose={() => setDetail(null)} />
      )}
      <div style={{ padding:"18px 20px 12px", flexShrink:0, display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
        <div>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.3em", textTransform:"uppercase", color:"rgba(201,168,76,0.7)", marginBottom:6 }}>YOUR SHORTLIST</div>
          <h1 style={{ fontSize:28, fontWeight:700, color:"#fff", letterSpacing:"-0.02em", margin:0, lineHeight:1.05 }}>{properties.length} matches<br/>scored.</h1>
        </div>
        <button onClick={onOpenSaved} style={{
          padding:"9px 13px", borderRadius:999,
          background: saved.length > 0 ? V.goldDim : "rgba(255,255,255,0.05)",
          border:`1px solid ${saved.length > 0 ? "rgba(201,168,76,0.3)" : "rgba(255,255,255,0.06)"}`,
          color: saved.length > 0 ? V.gold : "rgba(240,239,232,0.6)",
          fontSize:12, fontWeight:600, cursor:"pointer",
          display:"flex", alignItems:"center", gap:6,
        }}>★ {saved.length}</button>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"4px 20px 24px" }}>
        {properties.map((p, i) => {
          const isSaved = saved.some(x => x.id === p.id)
          return (
            <button key={p.id} onClick={() => handleOpen(p)} className="anim-fade-up"
              style={{ animationDelay:`${i * 60}ms`, width:"100%", marginBottom:12, padding:0, border:"none", background:"transparent", cursor:"pointer", textAlign:"left", borderRadius:20, overflow:"hidden", display:"block", transition:`transform 0.18s ${V.easeApple}` }}
              onMouseDown={e => (e.currentTarget.style.transform = "scale(0.985)")}
              onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}>
              <div style={{ display:"flex", gap:14, alignItems:"stretch", padding:12, borderRadius:20, background:V.card, border:`1px solid ${V.border}`, position:"relative" }}>
                <div style={{
                  position:"absolute", top:-6, left:6,
                  padding:"2px 8px", borderRadius:999,
                  background: i === 0 ? V.ctaGrad : "rgba(255,255,255,0.08)",
                  color: i === 0 ? "#07070F" : "rgba(240,239,232,0.6)",
                  fontSize:9, fontWeight:800, letterSpacing:"0.12em", fontFamily:V.fontMono,
                }}>#{i+1}</div>
                <div style={{ width:96, flexShrink:0, borderRadius:12, overflow:"hidden" }}>
                  <PropertyHero prop={p} height={110} compact minimal />
                </div>
                <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column" }}>
                  <div style={{ display:"flex", alignItems:"flex-start", gap:6, marginBottom:4 }}>
                    <div style={{ fontSize:15, fontWeight:700, color:"#fff", letterSpacing:"-0.01em", flex:1, minWidth:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</div>
                    {isSaved && <span style={{ fontSize:11, color:V.gold }}>★</span>}
                  </div>
                  <div style={{ fontSize:11, color:"rgba(240,239,232,0.4)", marginBottom:8 }}>{p.area} · {p.bedrooms === "studio" ? "Studio" : `${p.bedrooms} BR`}</div>
                  <div style={{ fontSize:15, fontWeight:700, color:"#fff", fontFamily:V.fontMono, letterSpacing:"-0.01em", marginBottom:"auto" }}>
                    {p.transaction === "rent" ? fmtRentYr(p.price) : fmtAED(p.price)}
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:8 }}>
                    <ScoreChip score={p.score} />
                    {p.psf < p.areaPsf && (
                      <span style={{ fontSize:10, fontWeight:700, color:V.green, padding:"3px 8px", borderRadius:999, background:"rgba(52,199,123,0.1)", border:"1px solid rgba(52,199,123,0.2)", letterSpacing:"0.05em" }}>
                        {Math.round((1 - p.psf / p.areaPsf) * 100)}% BELOW
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
        <button onClick={onRestart} style={{
          width:"100%", padding:14, marginTop:8,
          border:"1px dashed rgba(255,255,255,0.1)", borderRadius:16,
          background:"transparent", color:"rgba(240,239,232,0.45)",
          fontSize:12, fontWeight:600, cursor:"pointer", letterSpacing:"0.02em",
        }}>Refine my brief</button>
      </div>
    </div>
  )
}

// ── 7. SAVED ───────────────────────────────────────────────────
function SavedScreen({ saved, onOpen, onBack }: {
  saved: Property[]; onOpen: (p: Property) => void; onBack: () => void
}) {
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", background:V.bg }}>
      <div style={{ padding:"14px 20px 10px", flexShrink:0, display:"flex", alignItems:"center", gap:10 }}>
        <button onClick={onBack} style={{ width:36, height:36, borderRadius:999, border:"none", background:"rgba(255,255,255,0.05)", color:"rgba(240,239,232,0.5)", fontSize:18, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>←</button>
        <div style={{ flex:1 }} />
      </div>

      <div style={{ padding:"4px 20px 12px", flexShrink:0 }}>
        <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.3em", textTransform:"uppercase", color:"rgba(201,168,76,0.7)", marginBottom:6 }}>YOUR BRIEFINGS</div>
        <h1 style={{ fontSize:28, fontWeight:700, color:"#fff", letterSpacing:"-0.02em", margin:0, lineHeight:1.05 }}>
          {saved.length} {saved.length === 1 ? "property" : "properties"}<br/>saved.
        </h1>
        <p style={{ fontSize:13, color:"rgba(240,239,232,0.45)", margin:"8px 0 0", maxWidth:300 }}>
          Open any briefing to share with an agent — vetted, sourced, ready.
        </p>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"12px 20px 24px" }}>
        {saved.length === 0 && (
          <div style={{ marginTop:40, padding:24, borderRadius:20, background:V.card, border:`1px dashed ${V.border}`, textAlign:"center" }}>
            <div style={{ fontSize:28, marginBottom:8, color:"rgba(240,239,232,0.38)" }}>★</div>
            <div style={{ fontSize:14, fontWeight:600, color:"#fff", marginBottom:4 }}>No saved briefings yet</div>
            <div style={{ fontSize:12, color:"rgba(240,239,232,0.45)" }}>Swipe right on any result to save it here.</div>
          </div>
        )}
        {saved.map((p, i) => (
          <button key={p.id} onClick={() => onOpen(p)} className="anim-fade-up"
            style={{ animationDelay:`${i * 60}ms`, width:"100%", marginBottom:12, padding:0, border:"none", background:"transparent", cursor:"pointer", textAlign:"left", borderRadius:20, overflow:"hidden", display:"block" }}>
            <div style={{ borderRadius:20, overflow:"hidden", background:V.card, border:`1px solid ${V.border}` }}>
              <PropertyHero prop={p} height={140} minimal />
              <div style={{ padding:"14px 16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10, marginBottom:8 }}>
                  <div>
                    <div style={{ fontSize:15, fontWeight:700, color:"#fff", letterSpacing:"-0.01em" }}>{p.name}</div>
                    <div style={{ fontSize:11, color:"rgba(240,239,232,0.45)", marginTop:2 }}>{p.area} · {p.developer}</div>
                  </div>
                  <ScoreChip score={p.score} />
                </div>
                <p style={{ fontSize:12, fontStyle:"italic", color:V.goldLight, margin:0, lineHeight:1.4, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" } as React.CSSProperties}>"{p.verdict}"</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── 8. HOME (returning users) ──────────────────────────────────
function HomeScreen({ saved, onStartNew, onOpenSaved, onOpen }: {
  saved: Property[]; onStartNew: () => void; onOpenSaved: () => void; onOpen: (p: Property) => void
}) {
  const topPick = saved[0]
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", background:V.bg, overflowY:"auto" }}>
      <div style={{ padding:"18px 20px 20px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:9, background:"linear-gradient(135deg, #8A6A2A, #C9A84C)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:900, color:"#07070F" }}>V</div>
            <span style={{ fontSize:10, letterSpacing:"0.3em", fontWeight:600, color:"rgba(201,168,76,0.7)", textTransform:"uppercase" }}>VERDICT</span>
          </div>
          <button onClick={onOpenSaved} style={{
            padding:"8px 13px", borderRadius:999,
            background: saved.length > 0 ? V.goldDim : "rgba(255,255,255,0.05)",
            border:`1px solid ${saved.length > 0 ? "rgba(201,168,76,0.3)" : "rgba(255,255,255,0.06)"}`,
            color: saved.length > 0 ? V.gold : "rgba(240,239,232,0.6)",
            fontSize:12, fontWeight:600, cursor:"pointer",
          }}>★ {saved.length} saved</button>
        </div>

        <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.3em", textTransform:"uppercase", color:"rgba(240,239,232,0.4)", marginBottom:8 }}>WELCOME BACK</div>
        <h1 style={{ fontSize:32, fontWeight:700, color:"#fff", letterSpacing:"-0.025em", margin:"0 0 8px", lineHeight:1.05 }}>Your market,<br/>this week.</h1>
        <p style={{ fontSize:14, color:"rgba(240,239,232,0.5)", margin:"0 0 24px", lineHeight:1.45, maxWidth:320 }}>
          {saved.length > 0 ? `${saved.length} saved ${saved.length === 1 ? "property" : "properties"} in your briefings.` : "Start a brief to get AI-ranked results."}
        </p>

        {topPick && (
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.25em", textTransform:"uppercase", color:"rgba(201,168,76,0.7)", marginBottom:10 }}>★ TOP PICK</div>
            <button onClick={() => onOpen(topPick)} style={{ width:"100%", padding:0, border:"none", background:"transparent", cursor:"pointer", textAlign:"left", borderRadius:22, overflow:"hidden", display:"block" }}>
              <div style={{ borderRadius:22, overflow:"hidden", background:V.card, border:"1px solid rgba(201,168,76,0.25)", boxShadow:"0 10px 40px rgba(0,0,0,0.4)" }}>
                <PropertyHero prop={topPick} height={160} />
                <div style={{ padding:"14px 16px 16px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                    <div style={{ fontSize:16, fontWeight:700, color:"#fff" }}>{topPick.transaction === "rent" ? fmtRentYr(topPick.price) : fmtAED(topPick.price)}</div>
                    <ScoreChip score={topPick.score} label={topPick.scoreLabel} />
                  </div>
                  <p style={{ fontSize:12.5, fontStyle:"italic", color:V.goldLight, margin:0, lineHeight:1.4 }}>"{topPick.verdict}"</p>
                </div>
              </div>
            </button>
          </div>
        )}

        <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.25em", textTransform:"uppercase", color:"rgba(240,239,232,0.4)", marginBottom:10 }}>QUICK START</div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {[
            { label:"Start a new brief",    sub:"Re-qualify for a different search",  icon:"＋" },
            { label:"Refine current brief",  sub:"Tweak budget, area, or type",        icon:"⇄" },
          ].map((q, i) => (
            <button key={i} onClick={onStartNew} style={{
              display:"flex", alignItems:"center", gap:14, padding:"14px 16px", borderRadius:16,
              background:V.card, border:`1px solid ${V.border}`,
              color:V.text, textAlign:"left", cursor:"pointer",
              transition:`transform 0.18s ${V.easeApple}`,
            }}
            onMouseDown={e => (e.currentTarget.style.transform = "scale(0.98)")}
            onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}>
              <div style={{ width:34, height:34, borderRadius:10, background:"rgba(201,168,76,0.1)", border:"1px solid rgba(201,168,76,0.2)", display:"flex", alignItems:"center", justifyContent:"center", color:V.gold, fontSize:16, fontWeight:700 }}>{q.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:600, color:"#fff" }}>{q.label}</div>
                <div style={{ fontSize:11, color:"rgba(240,239,232,0.45)", marginTop:2 }}>{q.sub}</div>
              </div>
              <span style={{ fontSize:16, color:"rgba(240,239,232,0.2)" }}>›</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── AUTH MODAL ────────────────────────────────────────────────
function AuthModal({ onSuccess, onClose }: {
  onSuccess: (sess: Session) => void; onClose: () => void
}) {
  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  async function submit() {
    if (!email.trim() || !password) { setError("Email and password required"); return }
    setLoading(true); setError(null); setInfo(null)
    const supabase = getSupabase()
    try {
      if (mode === "signup") {
        const { data, error: err } = await supabase.auth.signUp({ email, password })
        if (err) throw err
        if (data.session) onSuccess(data.session as unknown as Session)
        else setInfo("Check your email to confirm, then sign in.")
      } else {
        const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
        if (err) throw err
        if (data.session) onSuccess(data.session as unknown as Session)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:100,
      background:"rgba(0,0,0,0.75)", backdropFilter:"blur(8px)",
      display:"flex", alignItems:"flex-end", justifyContent:"center",
    }}>
      <div style={{
        width:"100%", maxWidth:430,
        background:"#13131E", borderRadius:"24px 24px 0 0",
        border:"1px solid rgba(255,255,255,0.08)",
        padding:"28px 24px 44px",
      }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <div>
            <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.3em", textTransform:"uppercase", color:"rgba(201,168,76,0.7)", marginBottom:4 }}>VERDICT · BUYER PORTAL</div>
            <h2 style={{ fontSize:22, fontWeight:700, color:"#fff", margin:0, letterSpacing:"-0.02em" }}>{mode === "signin" ? "Sign in" : "Create account"}</h2>
          </div>
          <button onClick={onClose} style={{ width:36, height:36, borderRadius:999, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.05)", color:"rgba(240,239,232,0.6)", fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
        </div>
        <p style={{ fontSize:13, color:"rgba(240,239,232,0.45)", margin:"0 0 20px" }}>
          Save and contact agents. Free for buyers.
        </p>
        {error && <div style={{ marginBottom:14, padding:"11px 14px", borderRadius:12, background:"rgba(232,91,91,0.1)", border:"1px solid rgba(232,91,91,0.25)", color:"#E85B5B", fontSize:13 }}>{error}</div>}
        {info  && <div style={{ marginBottom:14, padding:"11px 14px", borderRadius:12, background:"rgba(52,199,123,0.08)", border:"1px solid rgba(52,199,123,0.2)", color:"#34C77B", fontSize:13 }}>{info}</div>}
        <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)}
          style={{ width:"100%", padding:"13px 15px", borderRadius:13, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.04)", color:"#fff", fontSize:15, outline:"none", marginBottom:12, boxSizing:"border-box" }} />
        <input type="password" placeholder="Password (min 6 chars)" value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
          style={{ width:"100%", padding:"13px 15px", borderRadius:13, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.04)", color:"#fff", fontSize:15, outline:"none", marginBottom:20, boxSizing:"border-box" }} />
        <button onClick={submit} disabled={loading} style={{
          width:"100%", padding:"15px", borderRadius:14, border:"none",
          background:V.ctaGrad, color:"#07070F", fontSize:15, fontWeight:700,
          cursor:loading ? "wait" : "pointer", opacity:loading ? 0.7 : 1, marginBottom:14,
        }}>{loading ? "…" : mode === "signin" ? "Sign in" : "Create account"}</button>
        <p style={{ textAlign:"center", margin:0, fontSize:13, color:"rgba(240,239,232,0.45)" }}>
          {mode === "signin" ? "No account? " : "Have an account? "}
          <button onClick={() => { setMode(m => m === "signin" ? "signup" : "signin"); setError(null); setInfo(null) }}
            style={{ border:"none", background:"transparent", color:V.gold, fontSize:13, fontWeight:600, cursor:"pointer" }}>
            {mode === "signin" ? "Create one" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  )
}

// ── SAVE TOAST ────────────────────────────────────────────────
function SaveToast({ name }: { name: string }) {
  return (
    <div className="anim-toast" style={{
      position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)",
      padding:"12px 20px", borderRadius:16, zIndex:50,
      background:V.card, border:"1px solid rgba(201,168,76,0.3)", color:V.goldLight,
      boxShadow:"0 8px 32px rgba(0,0,0,0.5)",
      fontSize:13, fontWeight:600, display:"flex", gap:8, alignItems:"center",
      whiteSpace:"nowrap",
    }}>★ {name} saved to briefings</div>
  )
}

// ── MAIN APP ──────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>("onboarding")
  const [profile, setProfile] = useState<Profile>({})
  const [properties, setProperties] = useState<Property[]>([])
  const [saved, setSaved] = useState<Property[]>([])
  const [toast, setToast] = useState<string | null>(null)
  const [detailFromSaved, setDetailFromSaved] = useState<Property | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auth
  const [session, setSession] = useState<Session | null>(null)
  const [showAuth, setShowAuth] = useState(false)
  const [pendingContact, setPendingContact] = useState<Property | null>(null)
  const [contactedIds, setContactedIds] = useState<Set<string>>(new Set())
  const [contactingId, setContactingId] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("verdict_seen")) {
      setScreen("home")
    }
    const supabase = getSupabase()
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setSession(data.session as unknown as Session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, sess) => {
      setSession(sess as unknown as Session | null)
    })
    return () => subscription.unsubscribe()
  }, [])

  function showToast(name: string) {
    setToast(name)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2800)
  }

  function onQualifyDone(p: Profile) {
    setProfile(p)
    setScreen("thinking")
  }

  function onSave(prop: Property) {
    setSaved(prev => prev.find(x => x.id === prop.id) ? prev : [...prev, prop])
    showToast(prop.name)
  }

  async function doContactAgent(prop: Property, sess: Session) {
    setContactingId(prop.id)
    try {
      const { score, tier } = calculateQualificationScore(profile)
      const res = await fetch("/api/leads/create", {
        method: "POST",
        headers: { "Authorization": `Bearer ${sess.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: null, profile, qualificationScore: score, tier }),
      })
      if (res.ok) {
        setContactedIds(prev => { const s = new Set(prev); s.add(prop.id); return s })
        showToast(`Agent connected for ${prop.name}`)
      } else {
        const d = await res.json()
        showToast(d.error ?? "Failed to connect agent")
      }
    } catch (_) {
      showToast("Network error — try again")
    } finally {
      setContactingId(null)
    }
  }

  function handleContactAgent(prop: Property) {
    if (contactedIds.has(prop.id) || contactingId) return
    if (!session) {
      setPendingContact(prop)
      setShowAuth(true)
      return
    }
    doContactAgent(prop, session)
  }

  function onAuthSuccess(sess: Session) {
    setSession(sess)
    setShowAuth(false)
    if (pendingContact) {
      const p = pendingContact
      setPendingContact(null)
      doContactAgent(p, sess)
    }
  }

  return (
    <div style={{ display:"flex", justifyContent:"center", minHeight:"100vh", background:"#000" }}>
      <div style={{ position:"relative", width:"100%", maxWidth:430, height:"100vh", overflow:"hidden", background:V.bg }}>

        {screen === "onboarding" && (
          <Onboarding onComplete={() => {
            if (typeof window !== "undefined") localStorage.setItem("verdict_seen", "1")
            setScreen("qualify")
          }} />
        )}

        {screen === "home" && (
          <div style={{ position:"relative", height:"100%" }}>
            <HomeScreen
              saved={saved}
              onStartNew={() => { setProfile({}); setScreen("qualify") }}
              onOpenSaved={() => setScreen("saved")}
              onOpen={p => setDetailFromSaved(p)}
            />
            {detailFromSaved && (
              <DetailSheet
                prop={detailFromSaved}
                saved={saved.some(x => x.id === detailFromSaved.id)}
                onSave={() => onSave(detailFromSaved)}
                onClose={() => setDetailFromSaved(null)}
                onContact={() => handleContactAgent(detailFromSaved)}
                contacted={contactedIds.has(detailFromSaved.id)}
              />
            )}
          </div>
        )}

        {screen === "qualify" && (
          <QualifyFlow onDone={onQualifyDone} onBack={() => setScreen("onboarding")} />
        )}

        {screen === "thinking" && (
          <ThinkingScreen profile={profile} onDone={(props) => { setProperties(props); setScreen("swipe") }} />
        )}

        {screen === "swipe" && (
          <div style={{ position:"relative", height:"100%" }}>
            <SwipeResults properties={properties} onSave={onSave} onComplete={() => setScreen("list")} saved={saved} />
          </div>
        )}

        {screen === "list" && (
          <ListResults
            properties={properties}
            saved={saved}
            onOpen={() => {}}
            onOpenSaved={() => setScreen("saved")}
            onRestart={() => { setProfile({}); setScreen("qualify") }}
          />
        )}

        {screen === "saved" && (
          <div style={{ position:"relative", height:"100%" }}>
            <SavedScreen saved={saved} onOpen={p => setDetailFromSaved(p)} onBack={() => setScreen("list")} />
            {detailFromSaved && (
              <DetailSheet
                prop={detailFromSaved}
                saved={saved.some(x => x.id === detailFromSaved.id)}
                onSave={() => onSave(detailFromSaved)}
                onClose={() => setDetailFromSaved(null)}
                onContact={() => handleContactAgent(detailFromSaved)}
                contacted={contactedIds.has(detailFromSaved.id)}
              />
            )}
          </div>
        )}

        {showAuth && (
          <AuthModal
            onSuccess={onAuthSuccess}
            onClose={() => { setShowAuth(false); setPendingContact(null) }}
          />
        )}

        {toast && <SaveToast name={toast} />}
      </div>
    </div>
  )
}
