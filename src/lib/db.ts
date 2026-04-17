import { SwipeCard, Category } from "@/types"
import { supabase } from "./supabase"
import { getCardsByCategory as getMockCards } from "./mockData"

type DbRow = {
  id: string
  category: string
  name: string
  price: string
  description: string
  tags: string[]
  emoji: string
  bg_color: string
  sponsored: boolean
  rating: number | null
  distance: string | null
  image: string | null
  cta_type: string
  cta_label: string
  cta_value: string
}

function rowToCard(row: DbRow): SwipeCard {
  return {
    id: row.id,
    category: row.category as Category,
    name: row.name,
    price: row.price,
    description: row.description,
    tags: row.tags,
    emoji: row.emoji,
    bgColor: row.bg_color,
    sponsored: row.sponsored,
    rating: row.rating ?? undefined,
    distance: row.distance ?? undefined,
    image: row.image ?? undefined,
    cta: {
      type: row.cta_type as SwipeCard["cta"]["type"],
      label: row.cta_label,
      value: row.cta_value,
    },
  }
}

function parseMinPrice(price: string): number {
  const match = price.replace(/,/g, "").match(/\d+/)
  return match ? parseInt(match[0]) : 0
}

export async function getCardsFromDB(
  categories: Category[],
  query?: string,
  maxBudget?: number
): Promise<SwipeCard[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Fall back to mock data if Supabase isn't configured
  if (!url || !key || url.includes("your_")) {
    return getMockCards(categories, query, maxBudget)
  }

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("is_active", true)
    .in("category", categories)

  if (error || !data || data.length === 0) {
    // Supabase is configured but returned nothing — fall back to mock
    return getMockCards(categories, query, maxBudget)
  }

  let results: SwipeCard[] = data.map(rowToCard)

  // Budget filter
  if (maxBudget && maxBudget > 0) {
    const filtered = results.filter(c =>
      ["restaurants", "activities", "travel"].includes(c.category) &&
      parseMinPrice(c.price) <= maxBudget
    )
    if (filtered.length >= 1) results = filtered
  }

  // Keyword filter
  if (query && query.trim().length > 0) {
    const keywords = query.toLowerCase().split(/[\s,.\-/]+/).filter(k => k.length > 2)
    if (keywords.length > 0) {
      const filtered = results.filter(card =>
        keywords.some(kw =>
          card.name.toLowerCase().includes(kw) ||
          card.description.toLowerCase().includes(kw) ||
          card.tags.some(tag => tag.toLowerCase().includes(kw))
        )
      )
      if (filtered.length >= 2) results = filtered
      else if (filtered.length === 1) {
        results = [filtered[0], ...results.filter(c => c.id !== filtered[0].id)].slice(0, 4)
      }
    }
  }

  // Sponsored first, then by rating
  return results.sort((a, b) => {
    if (b.sponsored !== a.sponsored) return (b.sponsored ? 1 : 0) - (a.sponsored ? 1 : 0)
    return (b.rating || 0) - (a.rating || 0)
  })
}
