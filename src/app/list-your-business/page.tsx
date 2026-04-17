"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

const CATEGORIES = [
  { value: "restaurants", label: "🍽 Restaurant / Cafe" },
  { value: "homes", label: "🏠 Real Estate" },
  { value: "cars", label: "🚗 Cars / Automotive" },
  { value: "gyms", label: "🏋️ Gym / Fitness" },
  { value: "beauty", label: "💅 Beauty / Spa / Grooming" },
  { value: "health", label: "🏥 Health / Medical" },
  { value: "activities", label: "🌴 Activities / Experiences" },
  { value: "travel", label: "✈️ Travel / Tourism" },
  { value: "schools", label: "🏫 Schools / Education" },
  { value: "products", label: "🛍 Products / Shopping" },
]

const CTA_TYPES = [
  { value: "call", label: "📞 Phone Call" },
  { value: "whatsapp", label: "💬 WhatsApp" },
  { value: "book", label: "📅 Booking Link" },
  { value: "buy", label: "🛒 Website / Buy" },
]

export default function ListYourBusiness() {
  const router = useRouter()
  const [form, setForm] = useState({
    category: "",
    name: "",
    price: "",
    description: "",
    tags: "",
    emoji: "",
    cta_type: "call",
    cta_value: "",
    submitter_name: "",
    submitter_email: "",
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const ctaLabel = CTA_TYPES.find(c => c.value === form.cta_type)?.label.split(" ").slice(1).join(" ") || "Contact"
  const ctaPlaceholder =
    form.cta_type === "call" ? "+971 50 123 4567" :
    form.cta_type === "whatsapp" ? "https://wa.me/971501234567" :
    form.cta_type === "book" ? "+971 50 123 4567 or booking URL" :
    "https://yourwebsite.com"

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!form.category || !form.name || !form.price || !form.description || !form.cta_value) {
      setError("Please fill in all required fields.")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/submit-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, cta_label: ctaLabel }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setSubmitted(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center px-5">
        <div className="text-center max-w-sm w-full">
          <div className="text-6xl mb-5">🎉</div>
          <h2 className="text-[28px] font-black tracking-tight text-white mb-3">You&apos;re in!</h2>
          <p className="text-[15px] text-white/50 mb-8 leading-relaxed">
            We&apos;ll review your listing and add it to Swipe within 24–48 hours. We&apos;ll email you when it&apos;s live.
          </p>
          <button
            onClick={() => router.push("/")}
            className="w-full py-4 bg-white rounded-2xl text-[#0d0d0d] font-bold text-[15px]"
          >
            Back to Swipe
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-[#0d0d0d] border-b border-[#2c2c2e] px-5 py-4 flex items-center gap-3">
        <button
          onClick={() => router.push("/")}
          className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-white text-xl flex-shrink-0"
        >
          ‹
        </button>
        <div>
          <h1 className="font-bold text-[18px] tracking-tight text-white">List Your Business</h1>
          <p className="text-[12px] text-white/40">Get discovered by thousands in Dubai</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={submit} className="px-5 pt-6 pb-24 flex flex-col gap-5 max-w-[430px] mx-auto">

        {/* Category */}
        <div>
          <label className="text-[13px] font-semibold text-white/70 mb-2 block">Category *</label>
          <select
            value={form.category}
            onChange={e => set("category", e.target.value)}
            className="w-full bg-[#1c1c1e] border border-[#2c2c2e] rounded-2xl px-4 py-3.5 text-white text-[15px] outline-none appearance-none"
            required
          >
            <option value="" className="bg-[#1a1a1a]">Select a category...</option>
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value} className="bg-[#1a1a1a]">{c.label}</option>
            ))}
          </select>
        </div>

        {/* Business Name */}
        <div>
          <label className="text-[13px] font-semibold text-white/70 mb-2 block">Business Name *</label>
          <input
            value={form.name}
            onChange={e => set("name", e.target.value)}
            placeholder="e.g. Nobu Downtown Dubai"
            className="w-full bg-[#1c1c1e] border border-[#2c2c2e] rounded-2xl px-4 py-3.5 text-white text-[15px] outline-none placeholder-white/30"
            required
          />
        </div>

        {/* Price */}
        <div>
          <label className="text-[13px] font-semibold text-white/70 mb-2 block">Price / Starting From *</label>
          <input
            value={form.price}
            onChange={e => set("price", e.target.value)}
            placeholder="e.g. AED 200–400 per person"
            className="w-full bg-[#1c1c1e] border border-[#2c2c2e] rounded-2xl px-4 py-3.5 text-white text-[15px] outline-none placeholder-white/30"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-[13px] font-semibold text-white/70 mb-2 block">Short Description *</label>
          <textarea
            value={form.description}
            onChange={e => set("description", e.target.value)}
            placeholder="2–3 sentences. What makes you special?"
            rows={3}
            className="w-full bg-[#1c1c1e] border border-[#2c2c2e] rounded-2xl px-4 py-3.5 text-white text-[15px] outline-none placeholder-white/30 resize-none"
            required
          />
        </div>

        {/* Tags */}
        <div>
          <label className="text-[13px] font-semibold text-white/70 mb-2 block">Tags</label>
          <input
            value={form.tags}
            onChange={e => set("tags", e.target.value)}
            placeholder="e.g. Luxury, DIFC, Family-Friendly"
            className="w-full bg-[#1c1c1e] border border-[#2c2c2e] rounded-2xl px-4 py-3.5 text-white text-[15px] outline-none placeholder-white/30"
          />
          <p className="text-[11px] text-white/30 mt-1.5 px-1">Separate with commas. Helps users find you.</p>
        </div>

        {/* Emoji */}
        <div>
          <label className="text-[13px] font-semibold text-white/70 mb-2 block">Emoji Icon</label>
          <input
            value={form.emoji}
            onChange={e => set("emoji", e.target.value)}
            placeholder="e.g. 🍣"
            className="w-full bg-[#1c1c1e] border border-[#2c2c2e] rounded-2xl px-4 py-3.5 text-white text-[20px] outline-none placeholder-white/30"
            maxLength={4}
          />
        </div>

        {/* CTA Type */}
        <div>
          <label className="text-[13px] font-semibold text-white/70 mb-2 block">How should people contact you? *</label>
          <div className="grid grid-cols-2 gap-2">
            {CTA_TYPES.map(c => (
              <button
                key={c.value}
                type="button"
                onClick={() => set("cta_type", c.value)}
                className={`py-3 px-3 rounded-2xl text-[13px] font-medium text-left transition-all ${
                  form.cta_type === c.value
                    ? "bg-white text-[#0d0d0d]"
                    : "bg-[#1c1c1e] border border-[#2c2c2e] text-white/70"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* CTA Value */}
        <div>
          <label className="text-[13px] font-semibold text-white/70 mb-2 block">
            {form.cta_type === "buy" ? "Website URL *" : "Phone Number / Link *"}
          </label>
          <input
            value={form.cta_value}
            onChange={e => set("cta_value", e.target.value)}
            placeholder={ctaPlaceholder}
            className="w-full bg-[#1c1c1e] border border-[#2c2c2e] rounded-2xl px-4 py-3.5 text-white text-[15px] outline-none placeholder-white/30"
            required
          />
          {(form.cta_type === "call" || form.cta_type === "book") && (
            <p className="text-[11px] text-white/30 mt-1.5 px-1">Include country code, e.g. +971501234567</p>
          )}
          {form.cta_type === "whatsapp" && (
            <p className="text-[11px] text-white/30 mt-1.5 px-1">Format: https://wa.me/971501234567</p>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-[#2c2c2e] pt-1">
          <p className="text-[12px] text-white/30">Your details — so we can reach you when it goes live</p>
        </div>

        {/* Submitter Name */}
        <div>
          <label className="text-[13px] font-semibold text-white/70 mb-2 block">Your Name</label>
          <input
            value={form.submitter_name}
            onChange={e => set("submitter_name", e.target.value)}
            placeholder="Your full name"
            className="w-full bg-[#1c1c1e] border border-[#2c2c2e] rounded-2xl px-4 py-3.5 text-white text-[15px] outline-none placeholder-white/30"
          />
        </div>

        {/* Submitter Email */}
        <div>
          <label className="text-[13px] font-semibold text-white/70 mb-2 block">Your Email</label>
          <input
            value={form.submitter_email}
            onChange={e => set("submitter_email", e.target.value)}
            placeholder="you@example.com"
            type="email"
            className="w-full bg-[#1c1c1e] border border-[#2c2c2e] rounded-2xl px-4 py-3.5 text-white text-[15px] outline-none placeholder-white/30"
          />
        </div>

        {error && (
          <div className="text-[13px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-white rounded-2xl text-[#0d0d0d] font-bold text-[15px] disabled:opacity-40 mt-1"
        >
          {loading ? "Submitting..." : "Submit for Review"}
        </button>

        <p className="text-[11px] text-white/30 text-center leading-relaxed pb-4">
          All listings are reviewed before going live. We&apos;ll add you within 24–48 hours.
        </p>
      </form>
    </div>
  )
}
