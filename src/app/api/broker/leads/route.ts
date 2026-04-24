import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const token = authHeader.slice(7)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const type = new URL(req.url).searchParams.get('type') ?? 'available'

  if (type === 'mine') {
    const { data, error } = await supabase
      .from('lead_assignments')
      .select('id, lead_id, unlocked_at, sla_breached, contacted_at, leads(id, buyer_profiles(budget_min, budget_max, purpose, tier, qualification_score))')
      .eq('broker_id', user.id)
      .order('unlocked_at', { ascending: false })
      .limit(50)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data ?? [])
  }

  const { data, error } = await supabase
    .from('leads')
    .select('id, price_to_unlock, buyer_profiles(id, budget_min, budget_max, purpose, tier, qualification_score)')
    .eq('status', 'available')
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}
