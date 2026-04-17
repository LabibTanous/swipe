import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  try {
    const { listing_id, cta_type, session_id } = await req.json()

    if (!cta_type || !session_id) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    await supabase.from("contact_events").insert({
      listing_id: listing_id ?? null,
      cta_type,
      session_id,
    })

    return NextResponse.json({ ok: true })
  } catch {
    // Tracking failures must never surface to the user
    return NextResponse.json({ ok: false })
  }
}
