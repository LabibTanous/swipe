"use client"
export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"

const SUPA_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPA_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const getSupabase = () => createClient(SUPA_URL, SUPA_ANON)

const V = {
  bg: "#07070F", card: "#13131E", gold: "#C9A84C", goldLight: "#E8C97A",
  goldDim: "rgba(201,168,76,0.12)", green: "#34C77B", amber: "#F5A623", red: "#E85B5B",
  text: "#F0EFE8", textMuted: "rgba(240,239,232,0.55)", textDim: "rgba(240,239,232,0.38)",
  textFaint: "rgba(240,239,232,0.25)", border: "rgba(255,255,255,0.06)",
  ctaGrad: "linear-gradient(135deg, #B8922A, #C9A84C)", progGrad: "linear-gradient(90deg, #8A6A2A, #C9A84C)",
  easeApple: "cubic-bezier(0.16, 1, 0.3, 1)", fontMono: '"SF Mono", ui-monospace, Menlo, Consolas, monospace',
}

type Tab = "available" | "mine" | "wallet"

interface BuyerProfile {
  id?: string
  budget_min: number
  budget_max: number
  purpose: string
  tier: string
  qualification_score?: number
}

interface AvailableLead {
  id: string
  price_to_unlock: number
  buyer_profiles: BuyerProfile | null
}

interface Assignment {
  id: string
  lead_id: string
  unlocked_at: string
  sla_breached: boolean
  contacted_at: string | null
  leads: { id: string; buyer_profiles: BuyerProfile | null } | null
}

type Session = { access_token: string; user: { id: string; email?: string } }

function fmtAEDFils(fils: number) {
  const aed = fils / 100
  if (aed >= 1000) return `AED ${aed.toLocaleString()}`
  return `AED ${aed.toFixed(0)}`
}

function fmtBudget(min: number, max: number) {
  const f = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : `${(n / 1000).toFixed(0)}K`
  return `AED ${f(min)} – ${f(max)}`
}

function getSLAStatus(unlockedAt: string): { remaining: number; color: string; pct: number } {
  const elapsed = (Date.now() - new Date(unlockedAt).getTime()) / 60000
  const remaining = Math.max(0, 60 - elapsed)
  const color = remaining <= 0 ? V.red : remaining <= 15 ? V.amber : V.green
  return { remaining: Math.round(remaining), color, pct: remaining / 60 }
}

function tierColor(tier: string) {
  if (tier === "Gold") return V.gold
  if (tier === "Silver") return "#A0A0B0"
  return "#6E6E82"
}

// ── Auth Form ─────────────────────────────────────────────────
function AuthForm({ onSuccess }: { onSuccess: (sess: Session) => void }) {
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
        else setInfo("Check your email to confirm your account, then sign in.")
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
    <div style={{ display: "flex", justifyContent: "center", minHeight: "100vh", background: "#000" }}>
      <div style={{ width: "100%", maxWidth: 430, height: "100vh", background: V.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px" }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: "linear-gradient(135deg, #8A6A2A, #C9A84C)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, color: "#07070F", marginBottom: 20 }}>V</div>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(201,168,76,0.7)", marginBottom: 6 }}>BROKER TERMINAL</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", textAlign: "center", marginBottom: 6, lineHeight: 1.1 }}>
          {mode === "signin" ? "Sign in" : "Create account"}
        </h1>
        <p style={{ fontSize: 13, color: V.textMuted, textAlign: "center", marginBottom: 28, lineHeight: 1.5 }}>
          Manage leads, track SLA times, and top up your wallet.
        </p>

        {error && (
          <div style={{ width: "100%", marginBottom: 14, padding: "11px 14px", borderRadius: 12, background: "rgba(232,91,91,0.1)", border: "1px solid rgba(232,91,91,0.25)", color: V.red, fontSize: 13 }}>{error}</div>
        )}
        {info && (
          <div style={{ width: "100%", marginBottom: 14, padding: "11px 14px", borderRadius: 12, background: "rgba(52,199,123,0.08)", border: "1px solid rgba(52,199,123,0.2)", color: V.green, fontSize: 13 }}>{info}</div>
        )}

        <input
          type="email" placeholder="Email address" value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 15, outline: "none", marginBottom: 12, boxSizing: "border-box" }}
        />
        <input
          type="password" placeholder="Password" value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
          style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 15, outline: "none", marginBottom: 20, boxSizing: "border-box" }}
        />

        <button onClick={submit} disabled={loading} style={{
          width: "100%", padding: "15px", borderRadius: 14, border: "none",
          background: V.ctaGrad, color: "#07070F", fontSize: 15, fontWeight: 700,
          cursor: loading ? "wait" : "pointer", marginBottom: 16, opacity: loading ? 0.7 : 1,
        }}>
          {loading ? "…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>

        <p style={{ fontSize: 13, color: V.textDim, margin: "0 0 20px" }}>
          {mode === "signin" ? "No account? " : "Have an account? "}
          <button onClick={() => { setMode(m => m === "signin" ? "signup" : "signin"); setError(null); setInfo(null) }}
            style={{ border: "none", background: "transparent", color: V.gold, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            {mode === "signin" ? "Create one" : "Sign in"}
          </button>
        </p>

        <Link href="/" style={{ textDecoration: "none", fontSize: 12, color: V.textDim }}>← Back to App</Link>
      </div>
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────
export default function BrokerPage() {
  const [session, setSession] = useState<Session | null>(null)
  const [tab, setTab] = useState<Tab>("available")
  const [balance, setBalance] = useState(0)
  const [availableLeads, setAvailableLeads] = useState<AvailableLead[]>([])
  const [myAssignments, setMyAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [unlocking, setUnlocking] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 30_000)
    return () => clearInterval(t)
  }, [])

  const loadData = useCallback(async (sess: Session) => {
    setLoading(true)
    const supabase = getSupabase()
    const [walletRes, leadsRes, assignRes] = await Promise.all([
      supabase.from("wallets").select("balance").eq("user_id", sess.user.id).single(),
      supabase.from("leads")
        .select("id, price_to_unlock, buyer_profiles(id, budget_min, budget_max, purpose, tier, qualification_score)")
        .eq("status", "available").limit(30),
      supabase.from("lead_assignments")
        .select("id, lead_id, unlocked_at, sla_breached, contacted_at, leads(id, buyer_profiles(budget_min, budget_max, purpose, tier, qualification_score))")
        .eq("broker_id", sess.user.id)
        .order("unlocked_at", { ascending: false }).limit(30),
    ])
    setBalance(walletRes.data?.balance ?? 0)
    setAvailableLeads((leadsRes.data as unknown as AvailableLead[]) ?? [])
    setMyAssignments((assignRes.data as unknown as Assignment[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    const supabase = getSupabase()
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        const s = data.session as unknown as Session
        setSession(s)
        loadData(s)
      } else {
        setLoading(false)
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, sess) => {
      if (sess) {
        const s = sess as unknown as Session
        setSession(s)
        loadData(s)
      } else {
        setSession(null)
        setLoading(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [loadData])

  async function unlockLead(leadId: string) {
    if (!session || unlocking) return
    setUnlocking(leadId); setError(null)
    try {
      const res = await fetch("/api/leads/unlock", {
        method: "POST",
        headers: { "Authorization": `Bearer ${session.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ leadId }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Unlock failed"); return }
      await loadData(session)
      setTab("mine")
    } finally {
      setUnlocking(null)
    }
  }

  async function markContacted(assignmentId: string) {
    if (!session) return
    const supabase = getSupabase()
    await supabase.from("lead_assignments")
      .update({ contacted_at: new Date().toISOString() })
      .eq("id", assignmentId)
    await loadData(session)
  }

  async function signOut() {
    const supabase = getSupabase()
    await supabase.auth.signOut()
    setSession(null)
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", minHeight: "100vh", background: "#000" }}>
        <div style={{ width: "100%", maxWidth: 430, height: "100vh", background: V.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 13, color: V.textDim }}>Loading…</div>
        </div>
      </div>
    )
  }

  if (!session) {
    return <AuthForm onSuccess={(sess) => { setSession(sess); loadData(sess) }} />
  }

  const pendingLeads = myAssignments.filter(a => !a.contacted_at && !a.sla_breached)
  const breachedLeads = myAssignments.filter(a => a.sla_breached)

  return (
    <div style={{ display: "flex", justifyContent: "center", minHeight: "100vh", background: "#000" }}>
      <div style={{ width: "100%", maxWidth: 430, height: "100vh", overflow: "hidden", background: V.bg, display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ padding: "14px 20px 12px", borderBottom: `1px solid ${V.border}`, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link href="/" style={{ textDecoration: "none", width: 32, height: 32, borderRadius: 999, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(240,239,232,0.5)", fontSize: 14 }}>←</Link>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(201,168,76,0.7)" }}>BROKER TERMINAL</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>Lead Marketplace</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ padding: "6px 12px", borderRadius: 12, background: V.goldDim, border: "1px solid rgba(201,168,76,0.3)", textAlign: "right" }}>
                <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: "0.2em", color: "rgba(201,168,76,0.6)", textTransform: "uppercase" }}>WALLET</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: V.gold, fontFamily: V.fontMono }}>{fmtAEDFils(balance)}</div>
              </div>
              <button onClick={signOut} title="Sign out" style={{ width: 32, height: 32, borderRadius: 999, background: "rgba(255,255,255,0.05)", border: `1px solid ${V.border}`, color: V.textDim, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>↩</button>
            </div>
          </div>

          {pendingLeads.length > 0 && (
            <div style={{ marginTop: 10, padding: "8px 12px", borderRadius: 10, background: "rgba(245,166,35,0.1)", border: "1px solid rgba(245,166,35,0.25)", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: V.amber, flexShrink: 0 }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: V.amber }}>
                {pendingLeads.length} lead{pendingLeads.length > 1 ? "s" : ""} awaiting response within 1 hour
              </span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", padding: "12px 20px 0", gap: 8, flexShrink: 0 }}>
          {(["available", "mine", "wallet"] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: "9px 6px", borderRadius: 11,
              background: tab === t ? V.goldDim : "transparent",
              border: `1px solid ${tab === t ? "rgba(201,168,76,0.35)" : V.border}`,
              color: tab === t ? V.gold : V.textDim,
              fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
              cursor: "pointer",
            }}>
              {t === "available" ? `Leads (${availableLeads.length})`
                : t === "mine" ? `Mine (${myAssignments.length})`
                : "Wallet"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 20px 32px" }}>
          {error && (
            <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(232,91,91,0.1)", border: "1px solid rgba(232,91,91,0.25)", color: V.red, fontSize: 12, fontWeight: 500, marginBottom: 12 }}>
              {error}
            </div>
          )}

          {/* Available Leads */}
          {tab === "available" && (
            <>
              {availableLeads.length === 0 && (
                <div style={{ padding: "40px 20px", textAlign: "center", color: V.textDim, fontSize: 13 }}>No available leads right now.</div>
              )}
              {availableLeads.map(lead => {
                const bp = lead.buyer_profiles
                return (
                  <div key={lead.id} style={{ marginBottom: 12, padding: "16px", borderRadius: 20, background: V.card, border: `1px solid ${V.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(240,239,232,0.35)", marginBottom: 4 }}>VERIFIED BUYER</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>
                          {bp ? fmtBudget(bp.budget_min, bp.budget_max) : "Budget undisclosed"}
                        </div>
                        <div style={{ fontSize: 11, color: V.textDim, marginTop: 2 }}>{bp?.purpose ?? "Undisclosed intent"}</div>
                      </div>
                      {bp?.tier && (
                        <span style={{
                          padding: "4px 10px", borderRadius: 999, fontSize: 10, fontWeight: 700,
                          letterSpacing: "0.15em", textTransform: "uppercase",
                          color: tierColor(bp.tier), background: `${tierColor(bp.tier)}18`,
                          border: `1px solid ${tierColor(bp.tier)}40`,
                        }}>{bp.tier}</span>
                      )}
                    </div>
                    {bp?.qualification_score !== undefined && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                        <div style={{ height: 4, flex: 1, borderRadius: 999, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${bp.qualification_score}%`, background: V.progGrad, borderRadius: 999 }} />
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: V.gold, fontFamily: V.fontMono, minWidth: 32 }}>Q{bp.qualification_score}</span>
                      </div>
                    )}
                    <button onClick={() => unlockLead(lead.id)} disabled={!!unlocking} style={{
                      width: "100%", padding: "13px", borderRadius: 12, border: "none",
                      background: unlocking === lead.id ? "rgba(201,168,76,0.1)" : V.ctaGrad,
                      color: unlocking === lead.id ? V.gold : "#07070F",
                      fontSize: 13, fontWeight: 700, cursor: unlocking ? "wait" : "pointer",
                    }}>
                      {unlocking === lead.id ? "Unlocking…" : `Unlock · AED ${(lead.price_to_unlock / 100).toFixed(0)}`}
                    </button>
                  </div>
                )
              })}
            </>
          )}

          {/* My Assignments */}
          {tab === "mine" && (
            <>
              {myAssignments.length === 0 && (
                <div style={{ padding: "40px 20px", textAlign: "center", color: V.textDim, fontSize: 13 }}>No leads unlocked yet.</div>
              )}
              {myAssignments.map(a => {
                const sla = (!a.contacted_at && !a.sla_breached) ? getSLAStatus(a.unlocked_at) : null
                const bp = a.leads?.buyer_profiles
                return (
                  <div key={a.id} style={{ marginBottom: 12, padding: "16px", borderRadius: 20, background: V.card, border: `1px solid ${a.sla_breached ? "rgba(232,91,91,0.3)" : sla && sla.remaining <= 15 ? "rgba(245,166,35,0.3)" : V.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(240,239,232,0.35)", marginBottom: 4 }}>
                          LEAD #{a.lead_id.slice(-6).toUpperCase()}
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>
                          {bp ? fmtBudget(bp.budget_min, bp.budget_max) : "Budget unlocked"}
                        </div>
                        <div style={{ fontSize: 11, color: V.textDim, marginTop: 2 }}>{bp?.purpose ?? "Intent disclosed"}</div>
                      </div>
                      {a.sla_breached ? (
                        <span style={{ padding: "4px 10px", borderRadius: 999, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", color: V.red, background: "rgba(232,91,91,0.12)", border: "1px solid rgba(232,91,91,0.3)" }}>SLA BREACHED</span>
                      ) : a.contacted_at ? (
                        <span style={{ padding: "4px 10px", borderRadius: 999, fontSize: 9.5, fontWeight: 700, color: V.green, background: "rgba(52,199,123,0.1)", border: "1px solid rgba(52,199,123,0.25)" }}>CONTACTED</span>
                      ) : sla ? (
                        <span style={{ padding: "4px 10px", borderRadius: 999, fontSize: 9.5, fontWeight: 700, color: sla.color, background: `${sla.color}18`, border: `1px solid ${sla.color}40` }}>
                          {sla.remaining}m LEFT
                        </span>
                      ) : null}
                    </div>

                    {sla && sla.remaining > 0 && (
                      <div style={{ height: 4, borderRadius: 999, background: "rgba(255,255,255,0.06)", overflow: "hidden", marginBottom: 12 }}>
                        <div style={{
                          height: "100%", width: `${sla.pct * 100}%`, borderRadius: 999,
                          background: sla.remaining <= 15 ? `linear-gradient(90deg, ${V.red}, ${V.amber})` : V.progGrad,
                          transition: "width 0.5s linear",
                        }} />
                      </div>
                    )}

                    {a.sla_breached && (
                      <div style={{ padding: "8px 12px", borderRadius: 10, background: "rgba(232,91,91,0.08)", border: "1px solid rgba(232,91,91,0.2)", marginBottom: 10, fontSize: 12, color: V.red, fontWeight: 500 }}>
                        SLA breached — lead returned to pool for re-assignment.
                      </div>
                    )}

                    {!a.contacted_at && !a.sla_breached && (
                      <button onClick={() => markContacted(a.id)} style={{
                        width: "100%", padding: "11px", borderRadius: 11,
                        border: "1px solid rgba(52,199,123,0.35)",
                        background: "rgba(52,199,123,0.08)", color: V.green,
                        fontSize: 12, fontWeight: 700, cursor: "pointer",
                      }}>
                        ✓ Mark as contacted
                      </button>
                    )}
                  </div>
                )
              })}
            </>
          )}

          {/* Wallet */}
          {tab === "wallet" && (
            <>
              <div style={{ padding: "24px 20px 20px", borderRadius: 22, background: "linear-gradient(160deg, rgba(201,168,76,0.14), rgba(201,168,76,0.02))", border: "1px solid rgba(201,168,76,0.22)", marginBottom: 20, textAlign: "center" }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(201,168,76,0.7)", marginBottom: 8 }}>WALLET BALANCE</div>
                <div style={{ fontSize: 44, fontWeight: 700, color: V.gold, letterSpacing: "-0.03em", fontFamily: V.fontMono }}>{fmtAEDFils(balance)}</div>
                <div style={{ fontSize: 12, color: V.textDim, marginTop: 4 }}>Pre-paid · AED 150 per lead unlock</div>
              </div>

              <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(240,239,232,0.35)", marginBottom: 12 }}>TOP UP</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                {[500, 1000, 2500, 5000].map(amt => (
                  <button key={amt} onClick={() => alert(`Payment gateway integration required for AED ${amt} top-up.`)} style={{
                    padding: "16px", borderRadius: 16, background: V.card,
                    border: `1px solid ${V.border}`, color: "#fff",
                    cursor: "pointer", fontFamily: V.fontMono,
                  }}>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: V.textDim, marginBottom: 4 }}>AED</div>
                    <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}>{amt.toLocaleString()}</div>
                    <div style={{ fontSize: 10, color: V.textDim, marginTop: 2 }}>{Math.floor(amt / 150)} leads</div>
                  </button>
                ))}
              </div>

              <div style={{ padding: "14px 16px", borderRadius: 14, background: V.card, border: `1px solid ${V.border}`, marginBottom: 12 }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: V.textDim, marginBottom: 6 }}>SIGNED IN AS</div>
                <div style={{ fontSize: 13, color: V.textMuted, fontFamily: V.fontMono }}>{session.user.email ?? session.user.id.slice(0, 16) + "…"}</div>
              </div>

              <p style={{ fontSize: 11, color: V.textFaint, textAlign: "center", lineHeight: 1.5 }}>
                Funds are non-refundable.<br />AED 150 is deducted per lead unlock.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
