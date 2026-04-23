import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Vercel Cron calls this with a secret header to prevent public triggering.
// Set CRON_SECRET in Vercel environment variables.
export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. Mark SLA breaches (unlocked > 1hr, not yet contacted)
  const { data: breachCount, error: breachError } = await supabase
    .rpc('mark_sla_breaches')

  if (breachError) {
    console.error('[sla-check] mark_sla_breaches failed:', breachError.message)
    return NextResponse.json({ error: breachError.message }, { status: 500 })
  }

  // 2. Fetch newly breached assignments for notification logging
  const { data: breached } = await supabase
    .from('lead_assignments')
    .select('id, lead_id, broker_id, unlocked_at')
    .eq('sla_breached', true)
    .is('contacted_at', null)
    .order('unlocked_at', { ascending: true })
    .limit(50)

  // 3. Log notification entries (extend this to send email/WhatsApp later)
  if (breached && breached.length > 0) {
    const notifications = breached.map(a => ({
      lead_assignment_id: a.id,
      broker_id: a.broker_id,
      message: `Lead ${a.lead_id} SLA breached — unlock at ${a.unlocked_at}. Reassignment required.`,
      logged_at: new Date().toISOString(),
    }))
    console.log('[sla-check] SLA notifications:', JSON.stringify(notifications, null, 2))
    // TODO: insert into a notifications table or push to Resend/WhatsApp
  }

  return NextResponse.json({
    ok: true,
    newly_breached: breachCount ?? 0,
    total_uncontacted_breaches: breached?.length ?? 0,
    checked_at: new Date().toISOString(),
  })
}
