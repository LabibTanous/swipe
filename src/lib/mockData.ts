import { SwipeCard, Category } from "@/types";

// ─── Helper ──────────────────────────────────────────────────
let idCounter = 0;
const id = () => `card-${++idCounter}-${Math.random().toString(36).slice(2, 7)}`;

// ─── RESTAURANTS ─────────────────────────────────────────────
export const restaurants: SwipeCard[] = [
  {
    id: id(), category: "restaurants", name: "Nobu Downtown Dubai",
    price: "AED 400–600 per person", description: "World-famous Japanese-Peruvian fusion. The black cod miso is iconic. Book weeks ahead.",
    tags: ["Japanese", "Fine Dining", "DIFC", "Iconic"], emoji: "🍣",
    bgColor: "#1a0808", sponsored: true, rating: 4.9, distance: "0.4 km",
    cta: { type: "book", label: "Reserve a Table", value: "tel:+97144441111" },
  },
  {
    id: id(), category: "restaurants", name: "Zuma Dubai",
    price: "AED 350–500 per person", description: "The DIFC institution. Incredible robata grill and an atmosphere unlike anywhere else.",
    tags: ["Japanese", "Robata", "DIFC", "Buzzing"], emoji: "🔥",
    bgColor: "#1a1008", sponsored: false, rating: 4.8, distance: "0.6 km",
    cta: { type: "book", label: "Reserve a Table", value: "tel:+97144252900" },
  },
  {
    id: id(), category: "restaurants", name: "La Petite Maison",
    price: "AED 300–450 per person", description: "French Riviera classics done to perfection. The burrata is the best in Dubai.",
    tags: ["French", "Mediterranean", "Business Bay", "Romantic"], emoji: "🥐",
    bgColor: "#0d1a08", sponsored: false, rating: 4.7, distance: "1.2 km",
    cta: { type: "book", label: "Reserve a Table", value: "tel:+97143030600" },
  },
  {
    id: id(), category: "restaurants", name: "Nammos Dubai",
    price: "AED 500+ per person", description: "Mykonos transplanted to Dubai. Live music, stunning beach setting, Mediterranean excellence.",
    tags: ["Mediterranean", "Beach", "Luxury", "Live Music"], emoji: "🏖️",
    bgColor: "#081525", sponsored: true, rating: 4.8, distance: "3.2 km",
    cta: { type: "book", label: "Reserve a Table", value: "tel:+97144550677" },
  },
  {
    id: id(), category: "restaurants", name: "Dinner by Heston Blumenthal",
    price: "AED 450–650 per person", description: "Heston's iconic British fine dining with direct Burj Khalifa views. An unforgettable experience.",
    tags: ["British", "Fine Dining", "Burj Views", "Michelin"], emoji: "🍽️",
    bgColor: "#15100a", sponsored: false, rating: 4.9, distance: "0.8 km",
    cta: { type: "book", label: "Reserve a Table", value: "tel:+97142888888" },
  },
  {
    id: id(), category: "restaurants", name: "Torno Subito",
    price: "AED 200–350 per person", description: "Massimo Bottura's Italian concept at the W Hotel. Energetic, colourful, and delicious.",
    tags: ["Italian", "W Hotel", "Fun Vibes", "Celebrity Chef"], emoji: "🍝",
    bgColor: "#1a0810", sponsored: false, rating: 4.6, distance: "2.1 km",
    cta: { type: "book", label: "Reserve a Table", value: "tel:+97144288888" },
  },
];

// ─── HOMES ───────────────────────────────────────────────────
export const homes: SwipeCard[] = [
  {
    id: id(), category: "homes", name: "3BR Luxury — DIFC",
    price: "AED 22,000/month", description: "Sweeping skyline views, smart home automation, 5-star building with concierge. Fully furnished.",
    tags: ["3 Bed", "Furnished", "Pool", "Gym", "Concierge"], emoji: "🏙️",
    bgColor: "#0d0d2e", sponsored: true, rating: 4.9,
    cta: { type: "whatsapp", label: "WhatsApp Agent", value: "https://wa.me/971501234567" },
  },
  {
    id: id(), category: "homes", name: "3BR Modern — Downtown Dubai",
    price: "AED 18,500/month", description: "Direct Burj Khalifa views, floor-to-ceiling windows, steps from Dubai Mall. Move-in ready.",
    tags: ["3 Bed", "Burj View", "Gym", "Parking"], emoji: "🌆",
    bgColor: "#0d1a2e", sponsored: false, rating: 4.8,
    cta: { type: "call", label: "Call Agent", value: "tel:+971502345678" },
  },
  {
    id: id(), category: "homes", name: "3BR Villa — Jumeirah",
    price: "AED 15,000/month", description: "Gated community, large private garden, short walk to Jumeirah Beach. Perfect for families.",
    tags: ["3 Bed", "Private Garden", "Beach Access", "Pet Friendly"], emoji: "🏡",
    bgColor: "#0d2e1a", sponsored: false, rating: 4.7,
    cta: { type: "whatsapp", label: "WhatsApp Agent", value: "https://wa.me/971503456789" },
  },
  {
    id: id(), category: "homes", name: "Penthouse — Business Bay",
    price: "AED 28,000/month", description: "Duplex penthouse with private rooftop, canal views and double-height ceilings. Extraordinary.",
    tags: ["Penthouse", "Canal View", "Rooftop", "Duplex"], emoji: "✨",
    bgColor: "#2e0d0d", sponsored: true, rating: 5.0,
    cta: { type: "call", label: "Call Agent", value: "tel:+971504567890" },
  },
  {
    id: id(), category: "homes", name: "3BR Apartment — JVC",
    price: "AED 9,500/month", description: "Spacious and bright in a quiet community. New kitchen, large balcony. Great value for money.",
    tags: ["3 Bed", "Balcony", "Quiet", "New Kitchen"], emoji: "🏘️",
    bgColor: "#1a2e0d", sponsored: false, rating: 4.4,
    cta: { type: "whatsapp", label: "WhatsApp Agent", value: "https://wa.me/971505678901" },
  },
];

// ─── CARS ────────────────────────────────────────────────────
export const cars: SwipeCard[] = [
  {
    id: id(), category: "cars", name: "2024 Range Rover Sport",
    price: "AED 4,200/month lease", description: "Latest model. Full service, insurance, and registration included for year one.",
    tags: ["SUV", "2024", "AWD", "Full Warranty", "Service Incl."], emoji: "🚙",
    bgColor: "#0d2e0d", sponsored: true, rating: 4.9,
    cta: { type: "call", label: "Call Dealer", value: "tel:+971506789012" },
  },
  {
    id: id(), category: "cars", name: "2023 Mercedes GLE 450",
    price: "AED 3,800/month lease", description: "The perfect family car. AMG Line, panoramic sunroof, 7 seats, top safety ratings.",
    tags: ["SUV", "7 Seats", "AMG Line", "Panoramic"], emoji: "🚘",
    bgColor: "#0d101a", sponsored: false, rating: 4.8,
    cta: { type: "call", label: "Call Dealer", value: "tel:+971507890123" },
  },
  {
    id: id(), category: "cars", name: "2024 BMW X5 M-Sport",
    price: "AED 3,500/month lease", description: "Sports performance meets family practicality. HUD, Harman Kardon, M-Sport package.",
    tags: ["SUV", "M-Sport", "HUD", "2024"], emoji: "🏎️",
    bgColor: "#1a0d08", sponsored: false, rating: 4.7,
    cta: { type: "call", label: "Call Dealer", value: "tel:+971508901234" },
  },
  {
    id: id(), category: "cars", name: "2022 Land Cruiser VXR",
    price: "AED 2,800/month lease", description: "Dubai's favourite. Bulletproof reliability, fully loaded spec, low mileage.",
    tags: ["4x4", "V8", "Low KM", "Full Option"], emoji: "🛻",
    bgColor: "#1a1a08", sponsored: true, rating: 4.9,
    cta: { type: "call", label: "Call Dealer", value: "tel:+971509012345" },
  },
  {
    id: id(), category: "cars", name: "2024 Tesla Model X",
    price: "AED 4,500/month lease", description: "Zero emissions, free supercharging, Autopilot, 600km range. The future, delivered.",
    tags: ["Electric", "Autopilot", "600km Range", "7 Seats"], emoji: "⚡",
    bgColor: "#081525", sponsored: false, rating: 4.8,
    cta: { type: "call", label: "Call Dealer", value: "tel:+971501112233" },
  },
];

// ─── PRODUCTS / SHOPPING ─────────────────────────────────────
export const products: SwipeCard[] = [
  {
    id: id(), category: "products", name: "Samsung 65\" Neo QLED 4K",
    price: "AED 3,299", description: "Top-rated 4K smart TV. Quantum Matrix Technology, Dolby Atmos, built-in gaming mode.",
    tags: ["Electronics", "4K", "Smart TV", "65 inch"], emoji: "📺",
    bgColor: "#080d1a", sponsored: false, rating: 4.8,
    cta: { type: "buy", label: "Buy on Amazon", value: "https://amazon.ae/s?k=Samsung+65+Neo+QLED" },
  },
  {
    id: id(), category: "products", name: "Sony PlayStation 5",
    price: "AED 2,199", description: "PS5 disc edition. In stock now. Includes DualSense controller. Free next-day delivery.",
    tags: ["Gaming", "Console", "In Stock", "Next-Day Delivery"], emoji: "🎮",
    bgColor: "#080d25", sponsored: true, rating: 4.9,
    cta: { type: "buy", label: "Buy on Noon", value: "https://noon.com" },
  },
  {
    id: id(), category: "products", name: "DXRacer Gaming Chair",
    price: "AED 1,299", description: "Best-selling gaming chair. Ergonomic lumbar & neck support, 4D armrests, 135° recline.",
    tags: ["Gaming", "Chair", "Ergonomic", "Premium"], emoji: "🪑",
    bgColor: "#1a080d", sponsored: false, rating: 4.7,
    cta: { type: "buy", label: "Buy on Amazon", value: "https://amazon.ae/s?k=DXRacer+gaming+chair" },
  },
  {
    id: id(), category: "products", name: "Apple MacBook Pro 14\" M3",
    price: "AED 7,999", description: "M3 Pro chip, 18GB RAM, 512GB SSD. All-day battery. The best laptop money can buy.",
    tags: ["Laptop", "Apple", "M3 Pro", "All-Day Battery"], emoji: "💻",
    bgColor: "#0d0d0d", sponsored: false, rating: 4.9,
    cta: { type: "buy", label: "Buy at Apple Store", value: "https://www.apple.com/ae/shop/buy-mac/macbook-pro" },
  },
  {
    id: id(), category: "products", name: "iPhone 15 Pro Max",
    price: "AED 5,499", description: "Titanium design, A17 Pro chip, 48MP camera with 5x optical zoom. Available in all colours.",
    tags: ["iPhone", "5x Zoom", "Titanium", "A17 Pro"], emoji: "📱",
    bgColor: "#0d1508", sponsored: false, rating: 4.9,
    cta: { type: "buy", label: "Buy at Apple Store", value: "https://www.apple.com/ae/shop/buy-iphone" },
  },
  {
    id: id(), category: "products", name: "Dyson V15 Detect",
    price: "AED 1,799", description: "Laser detects invisible dust. 60-min runtime, auto-adjusts suction. Best cordless vacuum made.",
    tags: ["Home", "Cordless", "Laser Detect", "60 min"], emoji: "🌀",
    bgColor: "#1a0d08", sponsored: true, rating: 4.8,
    cta: { type: "buy", label: "Buy on Dyson.ae", value: "https://www.dyson.ae" },
  },
  {
    id: id(), category: "products", name: "ZARA Slim Black Shirt",
    price: "AED 169", description: "Classic slim-fit black shirt. Premium cotton, tailored cut. Available in S–XXL.",
    tags: ["Fashion", "Black", "Slim Fit", "Cotton"], emoji: "👔",
    bgColor: "#0d0d0d", sponsored: false, rating: 4.4,
    cta: { type: "buy", label: "Shop on ZARA", value: "https://www.zara.com/ae/en/man-shirts-l737.html" },
  },
];

// ─── GYMS ────────────────────────────────────────────────────
export const gyms: SwipeCard[] = [
  {
    id: id(), category: "gyms", name: "Fitness First DIFC",
    price: "AED 499/month", description: "Dubai's most popular gym. Olympic pool, 200+ weekly classes, premium free weights section.",
    tags: ["24/7", "Pool", "200+ Classes", "DIFC"], emoji: "💪",
    bgColor: "#1a0d1a", sponsored: true, rating: 4.7,
    cta: { type: "call", label: "Book Free Trial", value: "tel:+97144007777" },
  },
  {
    id: id(), category: "gyms", name: "Wellfit DIFC",
    price: "AED 699/month", description: "Boutique luxury. Cryotherapy, infrared saunas, recovery pools, world-class coaching staff.",
    tags: ["Luxury", "Cryotherapy", "Recovery", "Boutique"], emoji: "✨",
    bgColor: "#081525", sponsored: true, rating: 4.9,
    cta: { type: "call", label: "Book a Tour", value: "tel:+97144007780" },
  },
  {
    id: id(), category: "gyms", name: "Barry's Dubai",
    price: "AED 290/class pack", description: "The world's best workout. HIIT treadmill classes that burn 1000 calories. Addictive.",
    tags: ["HIIT", "Classes", "1000 cal/session", "Treadmill"], emoji: "🔥",
    bgColor: "#1a0808", sponsored: false, rating: 4.8,
    cta: { type: "book", label: "Book a Class", value: "tel:+97144007779" },
  },
  {
    id: id(), category: "gyms", name: "Gold's Gym Downtown",
    price: "AED 350/month", description: "Iconic brand, massive free-weights section, 3 convenient Dubai locations.",
    tags: ["24/7", "Free Weights", "3 Locations", "Iconic"], emoji: "🏋️",
    bgColor: "#1a1508", sponsored: false, rating: 4.5,
    cta: { type: "call", label: "Book Free Trial", value: "tel:+97144007778" },
  },
];

// ─── SCHOOLS ─────────────────────────────────────────────────
export const schools: SwipeCard[] = [
  {
    id: id(), category: "schools", name: "GEMS Wellington Academy",
    price: "AED 65,000/year", description: "Top-rated British curriculum school. IB pathway, outstanding KHDA rating, world-class sports facilities.",
    tags: ["British", "Ages 4–18", "IB", "Outstanding"], emoji: "🎓",
    bgColor: "#081508", sponsored: true, rating: 4.9,
    cta: { type: "book", label: "Book School Tour", value: "tel:+97143948366" },
  },
  {
    id: id(), category: "schools", name: "Nord Anglia Dubai",
    price: "AED 68,000/year", description: "Global network school with MIT STEM curriculum partnership. 160+ nationalities represented.",
    tags: ["IB", "MIT STEM", "160+ Nations", "Global"], emoji: "🌍",
    bgColor: "#08081a", sponsored: false, rating: 4.8,
    cta: { type: "book", label: "Book School Tour", value: "tel:+97144289900" },
  },
  {
    id: id(), category: "schools", name: "Kings School Dubai",
    price: "AED 55,000/year", description: "Outstanding British prep school. Ages 4–13. Exceptional pastoral care and extra-curricular programme.",
    tags: ["British", "Prep", "Ages 4–13", "Nurturing"], emoji: "👑",
    bgColor: "#150810", sponsored: true, rating: 4.8,
    cta: { type: "book", label: "Book School Tour", value: "tel:+97144484337" },
  },
  {
    id: id(), category: "schools", name: "Dubai College",
    price: "AED 72,000/year", description: "Dubai's top secondary school. British curriculum, A-Levels, exceptional university placement record.",
    tags: ["British", "Secondary", "A-Levels", "Ranked #1"], emoji: "🏛️",
    bgColor: "#0d0d1a", sponsored: false, rating: 4.9,
    cta: { type: "book", label: "Book School Tour", value: "tel:+97143993636" },
  },
];

// ─── TRAVEL ──────────────────────────────────────────────────
export const travel: SwipeCard[] = [
  {
    id: id(), category: "travel", name: "Maldives — Conrad Resort",
    price: "AED 8,500 per person", description: "Overwater villa, all-inclusive. Best Maldives deal this season. 7 nights, Emirates flights.",
    tags: ["5 Star", "All-Inclusive", "Overwater Villa", "7 Nights"], emoji: "🏝️",
    bgColor: "#081520", sponsored: true, rating: 5.0,
    cta: { type: "book", label: "Book Package", value: "tel:+97144262626" },
  },
  {
    id: id(), category: "travel", name: "Bali Wellness Retreat",
    price: "AED 4,200 per person", description: "7 nights in a private Ubud villa. Yoga sessions, airport transfers, and breakfasts all included.",
    tags: ["Wellness", "Private Villa", "Yoga", "7 Nights"], emoji: "🌴",
    bgColor: "#081a0d", sponsored: false, rating: 4.8,
    cta: { type: "book", label: "Book Package", value: "tel:+97144262627" },
  },
  {
    id: id(), category: "travel", name: "Paris Long Weekend",
    price: "AED 3,800 per person", description: "Emirates business class flights + 3 nights at Mandarin Oriental Paris. Effortlessly planned.",
    tags: ["City Break", "Business Class", "5 Star Hotel", "3 Nights"], emoji: "🗼",
    bgColor: "#0d0820", sponsored: false, rating: 4.7,
    cta: { type: "book", label: "Book Package", value: "tel:+97144262628" },
  },
  {
    id: id(), category: "travel", name: "Safari — Kenya Maasai Mara",
    price: "AED 12,000 per person", description: "7-night luxury safari. Big 5 game drives, hot air balloon at sunrise, all meals included.",
    tags: ["Safari", "Luxury", "Big 5", "7 Nights"], emoji: "🦁",
    bgColor: "#1a1008", sponsored: true, rating: 4.9,
    cta: { type: "book", label: "Book Package", value: "tel:+97144262629" },
  },
];

// ─── ACTIVITIES ──────────────────────────────────────────────
export const activities: SwipeCard[] = [
  {
    id: id(), category: "activities", name: "Desert Safari & BBQ Dinner",
    price: "AED 250 per person", description: "Dune bashing, camel riding, sandboarding, and a BBQ dinner under the stars. Epic evening.",
    tags: ["Adventure", "Evening", "Dinner Incl.", "Camel Ride"], emoji: "🏜️",
    bgColor: "#1a1008", sponsored: true, rating: 4.8,
    cta: { type: "book", label: "Book Now", value: "tel:+971501234500" },
  },
  {
    id: id(), category: "activities", name: "Skydive Dubai",
    price: "AED 2,299 per person", description: "Tandem skydive over the iconic Palm Jumeirah. Highest rated experience in Dubai.",
    tags: ["Extreme", "Palm Views", "Tandem", "Unforgettable"], emoji: "🪂",
    bgColor: "#081525", sponsored: false, rating: 4.9,
    cta: { type: "book", label: "Book Now", value: "https://skydivedubai.ae" },
  },
  {
    id: id(), category: "activities", name: "Topgolf Dubai",
    price: "AED 200/hour per bay", description: "3-level driving range with food, drinks, and private bays. The best group activity in Dubai.",
    tags: ["Groups", "Fun", "Food & Drinks", "Competitive"], emoji: "⛳",
    bgColor: "#081a0d", sponsored: true, rating: 4.7,
    cta: { type: "book", label: "Book a Bay", value: "tel:+97144564444" },
  },
  {
    id: id(), category: "activities", name: "Dubai Frame + Skywalk",
    price: "AED 50 per person", description: "Walk the glass-floored skywalk 150m above Dubai. Best views of old and new Dubai side by side.",
    tags: ["Landmark", "Views", "Glass Floor", "Quick"], emoji: "🖼️",
    bgColor: "#0d1a1a", sponsored: false, rating: 4.6,
    cta: { type: "buy", label: "Buy Tickets", value: "https://thedubaiframe.com" },
  },
];

// ─── BEAUTY ──────────────────────────────────────────────────
export const beauty: SwipeCard[] = [
  {
    id: id(), category: "beauty", name: "Milk + Honey Spa DIFC",
    price: "AED 350/session", description: "Award-winning spa. Signature treatments, hot stone massage, and facials. Always fully booked.",
    tags: ["Luxury Spa", "DIFC", "Award-Winning", "Hot Stone"], emoji: "🌸",
    bgColor: "#1a0810", sponsored: true, rating: 4.9,
    cta: { type: "book", label: "Book Treatment", value: "tel:+97144385855" },
  },
  {
    id: id(), category: "beauty", name: "1847 Men's Grooming Lounge",
    price: "AED 180/visit", description: "Dubai's finest men's grooming experience. Classic shaves, haircuts, and grooming packages.",
    tags: ["Men's", "Barber", "Luxury", "Classic Shave"], emoji: "✂️",
    bgColor: "#0d150d", sponsored: false, rating: 4.8,
    cta: { type: "book", label: "Book Now", value: "tel:+97144533388" },
  },
];

// ─── HEALTH ──────────────────────────────────────────────────
export const health: SwipeCard[] = [
  {
    id: id(), category: "health", name: "Mediclinic City Hospital",
    price: "AED 350/consultation", description: "Trusted private healthcare. Most specialists available same-day. International insurance accepted.",
    tags: ["GP", "Specialists", "Walk-in", "International Insurance"], emoji: "🏥",
    bgColor: "#081a10", sponsored: true, rating: 4.7,
    cta: { type: "book", label: "Book Appointment", value: "tel:+97144351000" },
  },
  {
    id: id(), category: "health", name: "Emirates Dental Centre",
    price: "AED 500/check-up", description: "Premium dental care in the heart of Dubai. Cosmetic dentistry and whitening specialists.",
    tags: ["Dentist", "Cosmetic", "Whitening", "Central"], emoji: "🦷",
    bgColor: "#0d1220", sponsored: false, rating: 4.7,
    cta: { type: "book", label: "Book Appointment", value: "tel:+97143525552" },
  },
];

// ─── MASTER MAP ───────────────────────────────────────────────
export const MOCK_DATA: Record<string, SwipeCard[]> = {
  restaurants,
  homes,
  cars,
  products,
  gyms,
  schools,
  travel,
  activities,
  beauty,
  health,
};

export function getCardsByCategory(categories: Category[]): SwipeCard[] {
  const results: SwipeCard[] = [];
  categories.forEach((cat) => {
    const data = MOCK_DATA[cat] || [];
    results.push(...data);
  });
  // Sponsored cards float to top
  return results.sort((a, b) => (b.sponsored ? 1 : 0) - (a.sponsored ? 1 : 0));
}
