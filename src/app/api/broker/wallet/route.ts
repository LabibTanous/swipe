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

  const { data: wallet, error } = await supabase
    .from('wallets')
    .select('balance, updated_at')
    .eq('user_id', user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No wallet found — provision one at zero balance
      const { data: newWallet, error: createErr } = await supabase
        .from('wallets')
        .insert({ user_id: user.id, balance: 0 })
        .select('balance, updated_at')
        .single()
      if (createErr) return NextResponse.json({ error: createErr.message }, { status: 500 })
      return NextResponse.json(newWallet)
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(wallet)
}
