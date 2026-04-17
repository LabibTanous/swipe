import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type UserProfile = {
  id: string
  email: string
  name: string
  preferences: {
    areas: string[]
    cuisines: string[]
    budget_range: string
    lifestyle: string
    has_kids: boolean
    car_preference: string
    past_searches: string[]
    swipe_rights: string[]
  }
  created_at: string
}
