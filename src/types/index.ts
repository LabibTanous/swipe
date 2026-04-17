export interface ParsedIntent {
  intent: string
  categories: string[]
  location: string
  budget: string
  details: string
  readyToSearch: boolean
  buyerStage?: string
  priceSignal?: "luxury" | "budget" | "mid"
  urgency?: string
}

export type Category =
  | "restaurants" | "homes" | "cars" | "products"
  | "gyms" | "schools" | "travel" | "beauty"
  | "health" | "activities" | "general"

export type CTAType = "call" | "buy" | "book" | "navigate" | "whatsapp"

export interface SwipeCard {
  id: string
  category: Category
  name: string
  price: string
  description: string
  tags: string[]
  emoji: string
  bgColor: string
  sponsored: boolean
  cta: {
    type: CTAType
    label: string
    value: string
  }
  image?: string
  rating?: number
  distance?: string
  ai_summary?: string
  demand_indicator?: string
}
