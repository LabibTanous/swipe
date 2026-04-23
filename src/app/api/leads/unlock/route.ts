import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const LEAD_PRICE_FILS = 15000 // 150 AED stored in minor units

export async function POST(req: NextRequest) {
  // Auth: read token from Authorization header, not from request body
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const token = authHeader.slice(7)

  // Use anon client to verify the token against Supabase Auth
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const leadId = body?.leadId
  if (!leadId) {
    return NextResponse.json({ error: 'leadId is required' }, { status: 400 })
  }

  // Execute atomic unlock via Supabase RPC (see SQL setup below)
  const { error: rpcError } = await supabase.rpc('unlock_lead_v2', {
    p_lead_id: leadId,
    p_broker_id: user.id,
    p_amount: LEAD_PRICE_FILS,
  })

  if (rpcError) {
    const msg = rpcError.message
    if (msg.includes('Insufficient')) return NextResponse.json({ error: 'Insufficient balance. Top up your wallet.' }, { status: 402 })
    if (msg.includes('not available')) return NextResponse.json({ error: 'This lead has already been taken.' }, { status: 409 })
    if (msg.includes('Wallet not found')) return NextResponse.json({ error: 'Wallet not set up. Contact support.' }, { status: 400 })
    return NextResponse.json({ error: 'Unlock failed. Please try again.' }, { status: 500 })
  }

  // Return the buyer profile now that the lead is unlocked
  const { data: buyer, error: buyerError } = await supabase
    .from('leads')
    .select('id, buyer_profiles(*)')
    .eq('id', leadId)
    .single()

  if (buyerError) return NextResponse.json({ error: 'Lead unlocked but failed to fetch buyer.' }, { status: 500 })

  return NextResponse.json(buyer)
}
