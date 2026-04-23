import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { suggestOffPlanZones } from '@/utils/engines/offPlanEngine'

// Ready-market avg price per sqft by area — used for opportunity scoring
const AREA_READY_AVG_SQFT: Record<string, number> = {
  'JVC':             950,
  'Business Bay':   1800,
  'Dubai South':     700,
  'Arjan':           850,
  'Dubai Hills':    1600,
  'Dubai Marina':   2000,
  'Palm Jumeirah':  3500,
  'Downtown Dubai': 2200,
  'Creek Harbour':  1500,
  'Emaar South':     650,
  'JLT':            1400,
  'DIFC':           2800,
  'Al Barsha':       900,
  'Arabian Ranches':1400,
  'Mirdif':          800,
  'Al Quoz':         600,
}

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const { purpose, category, budget, subType, downpaymentPercent, monthlyCapacity } = body

  const budgetNum = Number(budget)
  if (!purpose || !budgetNum || isNaN(budgetNum) || budgetNum <= 0) {
    return NextResponse.json({ error: 'purpose and a valid budget are required' }, { status: 400 })
  }

  let query = supabase.from('property_listings').select('*')

  if (purpose === 'rent') {
    // STRICT: only rent listings — no buy/off-plan can leak in
    query = query.eq('listing_type', 'rent')
    query = query.eq('category', category ?? 'residential')
    // Filter by sub_category when provided (apartment / villa / office / warehouse)
    if (subType) {
      query = query.eq('sub_category', subType)
    }
  } else if (purpose === 'off-plan') {
    // Off-plan: do NOT filter by area — engine scores all zones on opportunity
    query = query.eq('listing_type', 'off-plan')
    if (category) query = query.eq('category', category)
  } else {
    // buy
    query = query.eq('listing_type', 'buy')
    if (category) query = query.eq('category', category)
    if (subType) query = query.eq('sub_category', subType)
  }

  const { data: listings, error } = await query.lte('price', budgetNum).limit(20)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const isOffPlan = purpose === 'off-plan'

  const results = (listings ?? [])
    .map(item => ({
      ...item,
      match_score: isOffPlan
        ? computeOpportunityScore(item)
        : computeMatchScore(item, budgetNum, purpose),
      reasoning: isOffPlan
        ? buildOffPlanReasoning(item)
        : buildReasoning(item),
    }))
    .sort((a, b) => b.match_score - a.match_score)

  if (isOffPlan) {
    const zoneSuggestions = suggestOffPlanZones({
      budget: budgetNum,
      downpaymentPercent: Number(downpaymentPercent ?? 10),
      monthlyCapacity: Number(monthlyCapacity ?? 0),
    })
    return NextResponse.json({ listings: results, zoneSuggestions })
  }

  return NextResponse.json({ listings: results })
}

// Off-plan: higher score = better opportunity vs ready market
function computeOpportunityScore(listing: Record<string, unknown>): number {
  const area = String(listing.area_name ?? '')
  const readyAvg = AREA_READY_AVG_SQFT[area] ?? 1200
  const offPlanSqft = Number(listing.price_per_sqft ?? 0)
  const roi = Number(listing.roi_projection ?? 0)
  // (price delta vs ready market) + (ROI %)
  // e.g. JVC: ready=950, offPlan=1050 → delta=-100; roi=0.15 → +15 → score=-85 (bad)
  // Dubai South: ready=700, offPlan=820 → delta=-120; roi=0.25 → +25 → score=-95...
  // Hmm, we want relative discount. Let's normalize:
  // discount% = (readyAvg - offPlanSqft) / readyAvg * 100 — negative means premium over ready
  const discountPct = offPlanSqft > 0 ? ((readyAvg - offPlanSqft) / readyAvg) * 100 : 0
  const roiPct = roi * 100
  return Math.round(discountPct + roiPct)
}

// Standard buy/rent: score based on budget fit and ROI
function computeMatchScore(listing: Record<string, unknown>, budget: number, purpose: string): number {
  let score = 70
  const price = Number(listing.price)
  if (price <= budget * 0.85) score += 15
  else if (price <= budget * 0.95) score += 8
  const roi = Number(listing.roi_projection ?? 0)
  if (roi > 0.1) score += 10
  if (listing.is_ready && purpose === 'buy') score += 5
  return Math.min(score, 100)
}

function buildReasoning(listing: Record<string, unknown>): string {
  const area = listing.area_name ?? 'Dubai'
  const price = Number(listing.price).toLocaleString()
  const roi = listing.roi_projection
    ? ` ROI: ${(Number(listing.roi_projection) * 100).toFixed(1)}%.`
    : ''
  return `${area} — AED ${price}.${roi}`
}

function buildOffPlanReasoning(listing: Record<string, unknown>): string {
  const area = String(listing.area_name ?? 'Dubai')
  const readyAvg = AREA_READY_AVG_SQFT[area] ?? 1200
  const offPlanSqft = Number(listing.price_per_sqft ?? 0)
  const roi = Number(listing.roi_projection ?? 0)
  const delta = readyAvg - offPlanSqft
  const direction = delta >= 0 ? `${delta} AED/sqft below` : `${Math.abs(delta)} AED/sqft above`
  return `${area}: entry at AED ${offPlanSqft}/sqft — ${direction} ready market. Projected ${(roi * 100).toFixed(0)}% ROI on exit.`
}
