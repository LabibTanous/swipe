import { DataAdapter } from "./types";
import { Category, ParsedIntent, SwipeCard } from "@/types";

// ─── Types ────────────────────────────────────────────────────
interface GooglePlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  vicinity?: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  types: string[];
  business_status?: string;
  opening_hours?: { open_now: boolean };
  geometry: { location: { lat: number; lng: number } };
}

interface GooglePlacesResponse {
  results: GooglePlaceResult[];
  status: string;
  error_message?: string;
}

// ─── Category config ─────────────────────────────────────────
const PLACES_CONFIG: Partial<Record<Category, {
  query: string;
  type?: string;
  emoji: string;
  bgColor: string;
}>> = {
  restaurants: { query: "restaurant",         type: "restaurant",    emoji: "🍽️", bgColor: "#1a0808" },
  gyms:        { query: "gym fitness center", type: "gym",           emoji: "💪", bgColor: "#1a0d1a" },
  beauty:      { query: "salon spa",          type: "beauty_salon",  emoji: "✂️", bgColor: "#1a0810" },
  health:      { query: "clinic",             type: "doctor",        emoji: "🏥", bgColor: "#081a10" },
  activities:  { query: "entertainment activities Dubai", emoji: "🎯", bgColor: "#0d1a1a" },
  schools:     { query: "school",             type: "school",        emoji: "🎓", bgColor: "#081508" },
};

// ─── In-memory cache (1hr TTL) ────────────────────────────────
const cache = new Map<string, { data: SwipeCard[]; expires: number }>();

function getCached(key: string): SwipeCard[] | null {
  const entry = cache.get(key);
  if (!entry || Date.now() > entry.expires) return null;
  return entry.data;
}

function setCached(key: string, data: SwipeCard[]): void {
  cache.set(key, { data, expires: Date.now() + 60 * 60 * 1000 });
}

// ─── Helpers ─────────────────────────────────────────────────
function priceLabel(level?: number): string {
  switch (level) {
    case 0: return "Free entry";
    case 1: return "Under AED 50/person";
    case 2: return "AED 50–150/person";
    case 3: return "AED 150–400/person";
    case 4: return "AED 400+/person";
    default: return "Price on enquiry";
  }
}

function buildDescription(place: GooglePlaceResult): string {
  const parts: string[] = [];
  if (place.rating && place.user_ratings_total) {
    parts.push(`${place.rating}★ from ${place.user_ratings_total.toLocaleString()} reviews.`);
  }
  if (place.opening_hours) {
    parts.push(place.opening_hours.open_now ? "Open now." : "Currently closed.");
  }
  const address = place.vicinity ?? place.formatted_address;
  if (address) parts.push(address);
  return parts.join(" ") || "Located in Dubai.";
}

function extractTags(place: GooglePlaceResult, category: Category): string[] {
  const tagMap: Record<string, string> = {
    restaurant: "Restaurant", bar: "Bar", cafe: "Café",
    gym: "Gym", fitness_center: "Fitness", yoga_studio: "Yoga",
    beauty_salon: "Salon", spa: "Spa", hair_care: "Hair",
    hospital: "Hospital", doctor: "Clinic", dentist: "Dental",
    school: "School", university: "University",
    night_club: "Nightlife", amusement_park: "Theme Park",
    bowling_alley: "Bowling", movie_theater: "Cinema",
    art_gallery: "Gallery", museum: "Museum",
  };

  const tags = place.types
    .map((t) => tagMap[t])
    .filter(Boolean) as string[];

  if (place.price_level === 4) tags.push("Luxury");
  if (place.price_level === 1) tags.push("Budget-friendly");
  if (place.opening_hours?.open_now) tags.push("Open Now");

  // Always include area from address
  const area = place.formatted_address?.split(",")[1]?.trim();
  if (area && area.length < 20) tags.push(area);

  return Array.from(new Set(tags)).slice(0, 5);
}

function placeToCard(place: GooglePlaceResult, category: Category): SwipeCard {
  const config = PLACES_CONFIG[category]!;
  return {
    id: `gp-${place.place_id}`,
    category,
    name: place.name,
    price: priceLabel(place.price_level),
    description: buildDescription(place),
    tags: extractTags(place, category),
    emoji: config.emoji,
    bgColor: config.bgColor,
    sponsored: false,
    rating: place.rating,
    distance: place.vicinity?.split(",")[0] ?? undefined,
    cta: {
      type: "navigate",
      label: "View on Maps",
      value: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
    },
  };
}

// ─── Adapter ──────────────────────────────────────────────────
export class GooglePlacesAdapter implements DataAdapter {
  readonly categories: Category[] = Object.keys(PLACES_CONFIG) as Category[];

  constructor(private readonly apiKey: string) {}

  async fetch(intent: ParsedIntent): Promise<SwipeCard[]> {
    const results: SwipeCard[] = [];

    for (const category of intent.categories) {
      const config = PLACES_CONFIG[category];
      if (!config) continue;

      const location = intent.location && intent.location.toLowerCase() !== "dubai"
        ? `${intent.details || config.query} ${intent.location} Dubai`
        : `${intent.details || config.query} Dubai`;

      const cacheKey = `${category}:${location}`;
      const cached = getCached(cacheKey);
      if (cached) {
        results.push(...cached);
        continue;
      }

      try {
        const params = new URLSearchParams({
          query: location,
          key: this.apiKey,
          ...(config.type ? { type: config.type } : {}),
        });

        const res = await fetch(
          `https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`
        );

        if (!res.ok) continue;

        const data: GooglePlacesResponse = await res.json();

        if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
          console.error("[GooglePlaces]", data.status, data.error_message);
          continue;
        }

        const cards = data.results
          .filter((p) => p.business_status !== "CLOSED_PERMANENTLY")
          .slice(0, 15)
          .map((p) => placeToCard(p, category));

        setCached(cacheKey, cards);
        results.push(...cards);
      } catch (err) {
        console.error("[GooglePlaces] fetch error", err);
      }
    }

    return results;
  }
}
