import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const token = authHeader.slice(7)

  const anonSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: { user }, error: authError } = await anonSupabase.auth.getUser(token)
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const { listingId, profile, qualificationScore, tier } = body

  // Service role bypasses RLS for atomic writes
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Ensure public.users row exists (trigger should handle it, this is a safety net)
  await supabase.from('users').upsert(
    { id: user.id, email: user.email, role: 'user' },
    { onConflict: 'id' }
  )

  const budget = profile?.budget ?? 0
  const intent = profile?.intent ?? 'buy'
  const financeType = profile?.financeType ?? ''

  const { data: bp, error: bpErr } = await supabase
    .from('buyer_profiles')
    .insert({
      user_id: user.id,
      budget_min: Math.round(budget * 0.85),
      budget_max: Math.round(budget * 1.15),
      purpose: intent === 'invest' ? 'off-plan' : intent,
      property_type: profile?.category ?? 'residential',
      sub_type: profile?.propertyType ?? null,
      financial_status: (financeType === 'cash' || financeType === '1chq') ? 'cash' : 'mortgage',
      qualification_score: qualificationScore ?? 60,
      tier: tier ?? 'Bronze',
    })
    .select('id')
    .single()

  if (bpErr) {
    return NextResponse.json({ error: 'Failed to save buyer profile: ' + bpErr.message }, { status: 500 })
  }

  const { data: lead, error: leadErr } = await supabase
    .from('leads')
    .insert({
      buyer_id: bp.id,
      listing_id: listingId ?? null,
      price_to_unlock: 15000,
      status: 'available',
    })
    .select('id')
    .single()

  if (leadErr) {
    return NextResponse.json({ error: 'Failed to create lead: ' + leadErr.message }, { status: 500 })
  }

  return NextResponse.json({
    leadId: lead.id,
    buyerProfileId: bp.id,
    tier: tier ?? 'Bronze',
    qualificationScore: qualificationScore ?? 60,
  })
}
