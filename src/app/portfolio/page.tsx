"use client"
export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react"
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

interface PortfolioProperty {
  id: string
  purchase_price: number
  current_valuation: number
  annual_rent: number
  capital_invested: number
  acquisition_date: string
  area_name: string
}

interface FormState {
  area_name: string
  purchase_price: string
  current_valuation: string
  annual_rent: string
  capital_invested: string
  acquisition_date: string
}

const emptyForm: FormState = {
  area_name: "", purchase_price: "", current_valuation: "",
  annual_rent: "", capital_invested: "", acquisition_date: "",
}

function fmtAED(n: number) {
  if (!n) return "AED 0"
  if (n >= 1_000_000) return `AED ${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1000) return `AED ${(n / 1000).toFixed(0)}K`
  return `AED ${n.toLocaleString()}`
}

function StatTile({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: string }) {
  return (
    <div style={{ padding: "14px", borderRadius: 18, background: V.card, border: `1px solid ${V.border}` }}>
      <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(240,239,232,0.35)", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: tone ?? "#fff", letterSpacing: "-0.01em", lineHeight: 1.1, fontFamily: V.fontMono }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: tone ?? V.textDim, marginTop: 3, opacity: 0.8 }}>{sub}</div>}
    </div>
  )
}

function FormField({ label, value, onChange, type = "text", placeholder }: {
  label: string; value: string; onChange: (v: string) => void
  type?: string; placeholder?: string
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(240,239,232,0.4)", marginBottom: 6 }}>{label}</div>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", padding: "12px 14px", borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)",
          color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box",
        }}
      />
    </div>
  )
}

export default function PortfolioPage() {
  const [properties, setProperties] = useState<PortfolioProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [authErr, setAuthErr] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const setField = (k: keyof FormState) => (v: string) => setForm(f => ({ ...f, [k]: v }))

  async function load(uid: string) {
    const supabase = getSupabase()
    const { data } = await supabase
      .from("portfolio_properties")
      .select("*")
      .eq("user_id", uid)
      .order("acquisition_date", { ascending: false })
    setProperties(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    const supabase = getSupabase()
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { setAuthErr(true); setLoading(false); return }
      setUserId(data.session.user.id)
      load(data.session.user.id)
    })
  }, [])

  function openAdd() {
    setEditingId(null)
    setForm(emptyForm)
    setFormError(null)
    setShowForm(true)
  }

  function openEdit(p: PortfolioProperty) {
    setEditingId(p.id)
    setForm({
      area_name: p.area_name ?? "",
      purchase_price: p.purchase_price ? String(p.purchase_price) : "",
      current_valuation: p.current_valuation ? String(p.current_valuation) : "",
      annual_rent: p.annual_rent ? String(p.annual_rent) : "",
      capital_invested: p.capital_invested ? String(p.capital_invested) : "",
      acquisition_date: p.acquisition_date ?? "",
    })
    setFormError(null)
    setShowForm(true)
  }

  async function saveForm() {
    if (!form.area_name.trim()) { setFormError("Area name is required"); return }
    if (!form.purchase_price) { setFormError("Purchase price is required"); return }
    setSaving(true); setFormError(null)
    const supabase = getSupabase()
    const payload = {
      user_id: userId!,
      area_name: form.area_name.trim(),
      purchase_price: parseInt(form.purchase_price) || 0,
      current_valuation: parseInt(form.current_valuation) || 0,
      annual_rent: parseInt(form.annual_rent) || 0,
      capital_invested: parseInt(form.capital_invested) || parseInt(form.purchase_price) || 0,
      acquisition_date: form.acquisition_date || null,
    }
    if (editingId) {
      const { error } = await supabase.from("portfolio_properties").update(payload).eq("id", editingId).eq("user_id", userId!)
      if (error) { setFormError(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from("portfolio_properties").insert(payload)
      if (error) { setFormError(error.message); setSaving(false); return }
    }
    setSaving(false)
    setShowForm(false)
    if (userId) load(userId)
  }

  async function deleteProperty(id: string) {
    if (!userId) return
    const supabase = getSupabase()
    await supabase.from("portfolio_properties").delete().eq("id", id).eq("user_id", userId)
    setDeleteConfirm(null)
    load(userId)
  }

  const totalCapital = properties.reduce((s, p) => s + (p.capital_invested ?? 0), 0)
  const totalValue = properties.reduce((s, p) => s + (p.current_valuation ?? 0), 0)
  const totalRent = properties.reduce((s, p) => s + (p.annual_rent ?? 0), 0)
  const yieldPct = totalValue > 0 ? ((totalRent / totalValue) * 100).toFixed(1) : "0.0"
  const gainPct = totalCapital > 0 ? (((totalValue - totalCapital) / totalCapital) * 100).toFixed(1) : "0.0"

  return (
    <div style={{ display: "flex", justifyContent: "center", minHeight: "100vh", background: "#000" }}>
      <div style={{ width: "100%", maxWidth: 430, height: "100vh", overflowY: showForm ? "hidden" : "auto", background: V.bg, position: "relative" }}>

        {/* Header */}
        <div style={{ padding: "18px 20px 12px", borderBottom: `1px solid ${V.border}`, display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/" style={{ textDecoration: "none", width: 36, height: 36, borderRadius: 999, background: "rgba(255,255,255,0.05)", border: `1px solid ${V.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(240,239,232,0.5)", fontSize: 16 }}>←</Link>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(201,168,76,0.7)" }}>MY PORTFOLIO</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>Capital Tracker</div>
          </div>
          {!authErr && !loading && (
            <button onClick={openAdd} style={{
              padding: "8px 14px", borderRadius: 12, border: "none",
              background: V.ctaGrad, color: "#07070F", fontSize: 12, fontWeight: 700, cursor: "pointer",
            }}>+ Add</button>
          )}
        </div>

        {loading && (
          <div style={{ padding: "60px 20px", textAlign: "center", color: V.textDim, fontSize: 13 }}>Loading portfolio…</div>
        )}

        {authErr && !loading && (
          <div style={{ padding: "40px 24px", textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 900, color: V.gold, margin: "0 auto 16px" }}>V</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Sign in to view your portfolio</div>
            <p style={{ fontSize: 13, color: V.textMuted, marginBottom: 24 }}>Track capital, market value, rental income, and yield across all your properties.</p>
            <Link href="/" style={{ textDecoration: "none", display: "inline-block", padding: "13px 24px", borderRadius: 14, background: V.ctaGrad, color: "#07070F", fontSize: 14, fontWeight: 700 }}>← Back to App</Link>
          </div>
        )}

        {!loading && !authErr && (
          <div style={{ padding: "16px 20px 100px" }}>

            {/* Summary grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              <StatTile label="Capital In" value={fmtAED(totalCapital)} />
              <StatTile label="Market Value" value={fmtAED(totalValue)}
                sub={`${Number(gainPct) >= 0 ? "+" : ""}${gainPct}% gain`}
                tone={Number(gainPct) >= 0 ? V.green : V.amber} />
              <StatTile label="Annual Rent" value={fmtAED(totalRent)} />
              <StatTile label="Portfolio Yield" value={`${yieldPct}%`}
                tone={Number(yieldPct) >= 7 ? V.gold : Number(yieldPct) >= 5 ? V.green : "#fff"} />
            </div>

            {totalValue > 0 && (
              <div style={{ padding: "16px", borderRadius: 18, background: V.card, border: `1px solid ${V.border}`, marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(240,239,232,0.35)" }}>YIELD VS TARGET (7%)</div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: Number(yieldPct) >= 7 ? V.gold : V.amber, fontFamily: V.fontMono }}>{yieldPct}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(Number(yieldPct) / 7 * 100, 100)}%`, borderRadius: 999, background: Number(yieldPct) >= 7 ? V.progGrad : "linear-gradient(90deg, #8A6A2A, #F5A623)", transition: "width 0.7s" }} />
                </div>
              </div>
            )}

            {/* Properties list */}
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(240,239,232,0.35)", marginBottom: 12 }}>
              PROPERTIES ({properties.length})
            </div>

            {properties.length === 0 && (
              <div style={{ padding: "32px 20px", borderRadius: 20, background: V.card, border: `1px dashed ${V.border}`, textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 8, color: V.textDim }}>◻</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 4 }}>No properties yet</div>
                <div style={{ fontSize: 12, color: V.textMuted, marginBottom: 16 }}>Track capital invested, ROI, and rental yield.</div>
                <button onClick={openAdd} style={{ padding: "11px 20px", borderRadius: 12, border: "none", background: V.ctaGrad, color: "#07070F", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Add first property</button>
              </div>
            )}

            {properties.map((p) => {
              const gainPctProp = p.purchase_price > 0 ? (((p.current_valuation - p.purchase_price) / p.purchase_price) * 100).toFixed(1) : "0.0"
              const yieldProp = p.current_valuation > 0 ? ((p.annual_rent / p.current_valuation) * 100).toFixed(1) : "0.0"
              const isPositive = Number(gainPctProp) >= 0
              const gain = (p.current_valuation ?? 0) - (p.purchase_price ?? 0)
              return (
                <div key={p.id} style={{ marginBottom: 12, padding: "16px", borderRadius: 20, background: V.card, border: `1px solid ${V.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>{p.area_name || "Unknown Area"}</div>
                      <div style={{ fontSize: 11, color: V.textDim, marginTop: 2 }}>
                        {p.acquisition_date ? new Date(p.acquisition_date).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "—"}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, fontFamily: V.fontMono,
                        color: isPositive ? V.green : V.amber,
                        padding: "3px 8px", borderRadius: 999,
                        background: isPositive ? "rgba(52,199,123,0.1)" : "rgba(245,166,35,0.1)",
                        border: `1px solid ${isPositive ? "rgba(52,199,123,0.25)" : "rgba(245,166,35,0.25)"}`,
                      }}>{isPositive ? "+" : ""}{gainPctProp}%</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    {[
                      { label: "COST", value: fmtAED(p.purchase_price) },
                      { label: "VALUE", value: fmtAED(p.current_valuation) },
                      { label: "YIELD", value: `${yieldProp}%`, gold: true },
                    ].map((stat, j) => (
                      <div key={j} style={{ flex: 1, padding: "10px 8px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: `1px solid ${V.border}` }}>
                        <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(240,239,232,0.3)", marginBottom: 3 }}>{stat.label}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: stat.gold ? V.gold : "#fff", fontFamily: V.fontMono }}>{stat.value}</div>
                      </div>
                    ))}
                  </div>

                  {gain !== 0 && (
                    <div style={{ marginBottom: 12, fontSize: 11, fontStyle: "italic", color: isPositive ? V.green : V.amber, fontWeight: 500 }}>
                      {isPositive ? "+" : ""}{fmtAED(Math.abs(gain))} unrealised {isPositive ? "gain" : "loss"}
                    </div>
                  )}

                  {/* Edit / Delete row */}
                  {deleteConfirm === p.id ? (
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ flex: 1, fontSize: 12, color: V.red }}>Delete this property?</span>
                      <button onClick={() => deleteProperty(p.id)} style={{ padding: "8px 14px", borderRadius: 10, border: "none", background: "rgba(232,91,91,0.15)", color: V.red, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Delete</button>
                      <button onClick={() => setDeleteConfirm(null)} style={{ padding: "8px 14px", borderRadius: 10, border: `1px solid ${V.border}`, background: "transparent", color: V.textDim, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => openEdit(p)} style={{ flex: 1, padding: "9px", borderRadius: 10, border: `1px solid ${V.border}`, background: "rgba(255,255,255,0.03)", color: V.textMuted, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Edit</button>
                      <button onClick={() => setDeleteConfirm(p.id)} style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid rgba(232,91,91,0.2)", background: "rgba(232,91,91,0.06)", color: V.red, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Delete</button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Add / Edit Form sheet */}
        {showForm && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 50,
            background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "flex-end",
          }}>
            <div style={{
              width: "100%", background: "#13131E",
              borderRadius: "24px 24px 0 0", border: "1px solid rgba(255,255,255,0.08)",
              padding: "24px 20px 40px", maxHeight: "90vh", overflowY: "auto",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(201,168,76,0.7)", marginBottom: 4 }}>PORTFOLIO</div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff", margin: 0 }}>{editingId ? "Edit property" : "Add property"}</h2>
                </div>
                <button onClick={() => setShowForm(false)} style={{ width: 36, height: 36, borderRadius: 999, border: `1px solid ${V.border}`, background: "rgba(255,255,255,0.05)", color: V.textDim, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
              </div>

              {formError && (
                <div style={{ marginBottom: 14, padding: "11px 14px", borderRadius: 12, background: "rgba(232,91,91,0.1)", border: "1px solid rgba(232,91,91,0.25)", color: V.red, fontSize: 13 }}>{formError}</div>
              )}

              <FormField label="Area / Location" value={form.area_name} onChange={setField("area_name")} placeholder="e.g. Business Bay" />
              <FormField label="Purchase Price (AED)" type="number" value={form.purchase_price} onChange={setField("purchase_price")} placeholder="e.g. 1500000" />
              <FormField label="Current Valuation (AED)" type="number" value={form.current_valuation} onChange={setField("current_valuation")} placeholder="e.g. 1650000" />
              <FormField label="Annual Rent (AED)" type="number" value={form.annual_rent} onChange={setField("annual_rent")} placeholder="e.g. 105000" />
              <FormField label="Capital Invested (AED)" type="number" value={form.capital_invested} onChange={setField("capital_invested")} placeholder="Downpayment + costs, or full price" />
              <FormField label="Acquisition Date" type="date" value={form.acquisition_date} onChange={setField("acquisition_date")} />

              <button onClick={saveForm} disabled={saving} style={{
                width: "100%", padding: "15px", borderRadius: 14, border: "none",
                background: V.ctaGrad, color: "#07070F", fontSize: 15, fontWeight: 700,
                cursor: saving ? "wait" : "pointer", opacity: saving ? 0.7 : 1, marginTop: 8,
              }}>
                {saving ? "Saving…" : editingId ? "Save changes" : "Add property"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
