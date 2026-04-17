import { NextRequest, NextResponse } from "next/server"
import { fetchCards } from "@/lib/adapters"
import { Category } from "@/types"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const categories = (searchParams.get("categories") || "")
    .split(",")
    .filter(Boolean) as Category[]
  const query   = searchParams.get("query")  || ""
  const budget  = searchParams.get("budget") || "0"

  if (categories.length === 0) {
    return NextResponse.json({ cards: [] })
  }

  try {
    const cards = await fetchCards({
      intent: "search",
      categories,
      location: "Dubai",
      budget,
      details: query,
      readyToSearch: true,
    })
    return NextResponse.json({ cards })
  } catch (err) {
    console.error("[cards]", err)
    return NextResponse.json({ cards: [] })
  }
}
