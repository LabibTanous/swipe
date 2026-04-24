import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type BuyerProfile = {
  id: string
  user_id: string
  budget_min: number
  budget_max: number
  purpose: 'buy' | 'rent' | 'off-plan'
  property_type: string
  sub_type: string
  financial_status: 'cash' | 'mortgage'
  qualification_score: number
  tier: 'Gold' | 'Silver' | 'Bronze'
  created_at: string
}

export type WalletRecord = {
  user_id: string
  balance: number
  updated_at: string
}

export type LeadAssignment = {
  id: string
  lead_id: string
  broker_id: string
  unlocked_at: string
  sla_breached: boolean
  contacted_at: string | null
}

export type PortfolioProperty = {
  id: string
  user_id: string
  purchase_price: number
  current_valuation: number
  annual_rent: number
  capital_invested: number
  acquisition_date: string
  area_name: string
  created_at: string
}
