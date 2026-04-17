import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      category, name, price, description, tags,
      emoji, cta_type, cta_label, cta_value,
      submitter_name, submitter_email,
    } = body

    if (!category || !name || !price || !description || !cta_type || !cta_value) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const tagsArray = typeof tags === "string"
      ? tags.split(",").map((t: string) => t.trim()).filter(Boolean)
      : tags ?? []

    const { error } = await supabase.from("pending_listings").insert({
      category,
      name,
      price,
      description,
      tags: tagsArray,
      emoji: emoji || "✨",
      cta_type,
      cta_label: cta_label || "Contact",
      cta_value,
      submitter_name: submitter_name || null,
      submitter_email: submitter_email || null,
    })

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Something went wrong"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
