import { NextRequest, NextResponse } from "next/server"
import { getCardsFromDB } from "@/lib/db"
import { Category } from "@/types"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const categories = (searchParams.get("categories") ?? "").split(",").filter(Boolean) as Category[]
  const query = searchParams.get("query") ?? ""
  const budget = parseInt(searchParams.get("budget") ?? "0")

  if (categories.length === 0) {
    return NextResponse.json({ cards: [] })
  }

  const cards = await getCardsFromDB(categories, query, budget)
  return NextResponse.json({ cards })
}
