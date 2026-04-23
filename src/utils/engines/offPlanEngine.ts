interface OffPlanInput {
  budget: number            // Total purchase budget in AED
  downpaymentPercent: number // e.g. 10 means 10%
  monthlyCapacity: number   // Monthly payment capacity in AED
}

interface ZoneResult {
  area: string
  readyPriceSqft: number
  offPlanEntry: number
  growth: number
  maxAffordableSqft: number
  reasoning: string
}

// Minimum viable unit size per area (sqft) — studio threshold for UAE market
const MIN_UNIT_SQFT = 350

const MARKET_DATA = [
  { area: "JVC",           readyPriceSqft: 950,  offPlanEntry: 1100, growth: 0.15 },
  { area: "Business Bay",  readyPriceSqft: 1800, offPlanEntry: 2200, growth: 0.12 },
  { area: "Dubai South",   readyPriceSqft: 700,  offPlanEntry: 850,  growth: 0.25 },
  { area: "Arjan",         readyPriceSqft: 850,  offPlanEntry: 980,  growth: 0.18 },
  { area: "Dubai Hills",   readyPriceSqft: 1600, offPlanEntry: 1900, growth: 0.14 },
]

export const suggestOffPlanZones = (input: OffPlanInput): ZoneResult[] => {
  const downpaymentAmount = input.budget * (input.downpaymentPercent / 100)

  return MARKET_DATA
    .filter(m => {
      // Can their downpayment cover ≥10% of a minimum-sized unit at this area's price?
      const minUnitCost = m.offPlanEntry * MIN_UNIT_SQFT
      const downpaymentCoversBooking = downpaymentAmount >= minUnitCost * 0.1
      // Can total budget afford at least a minimum-sized unit?
      const budgetCoversUnit = input.budget >= minUnitCost
      return downpaymentCoversBooking && budgetCoversUnit
    })
    .map(m => {
      const maxAffordableSqft = Math.floor(input.budget / m.offPlanEntry)
      return {
        ...m,
        maxAffordableSqft,
        reasoning: `Entry at AED ${m.offPlanEntry}/sqft vs ready market AED ${m.readyPriceSqft}/sqft. ` +
          `Your budget fits up to ${maxAffordableSqft} sqft. ` +
          `Projected ${(m.growth * 100).toFixed(0)}% ROI on exit.`,
      }
    })
    .sort((a, b) => b.growth - a.growth)
}
