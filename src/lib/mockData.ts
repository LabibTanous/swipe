import { SwipeCard, Category } from "@/types";

const U = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&h=500&q=80`

// ─── Helper ──────────────────────────────────────────────────
let idCounter = 0;
const id = () => `card-${++idCounter}-${Math.random().toString(36).slice(2, 7)}`;

// ─── RESTAURANTS ─────────────────────────────────────────────
export const restaurants: SwipeCard[] = [
  {
    id: id(), category: "restaurants", name: "Nobu Downtown Dubai",
    price: "AED 400–600 per person",
    description: "World-famous Japanese-Peruvian fusion. The black cod miso is iconic. Book weeks ahead for the best seats.",
    tags: ["Japanese", "Fine Dining", "DIFC"], emoji: "🍣",
    image: U("1579871494447-9811cf80d66c"),
    bgColor: "#1a0808", sponsored: true, rating: 4.9, distance: "0.4 km",
    ai_summary: "Best splurge dinner in Dubai. The black cod miso is life-changing.",
    demand_indicator: "🔥 Booked out most nights",
    cta: { type: "book", label: "Reserve a Table", value: "tel:+97144441111" },
  },
  {
    id: id(), category: "restaurants", name: "Zuma Dubai",
    price: "AED 350–500 per person",
    description: "The DIFC institution. Incredible robata grill, buzzing atmosphere, and the best sake list in town.",
    tags: ["Japanese", "Robata", "DIFC"], emoji: "🔥",
    image: U("1517248135467-4c7edcad34c4"),
    bgColor: "#1a1008", sponsored: false, rating: 4.8, distance: "0.6 km",
    ai_summary: "DIFC's most vibrant Japanese. Go for the robata, stay for the energy.",
    demand_indicator: "⚡ Always buzzing",
    cta: { type: "book", label: "Reserve a Table", value: "tel:+97144252900" },
  },
  {
    id: id(), category: "restaurants", name: "Dinner by Heston Blumenthal",
    price: "AED 450–650 per person",
    description: "Heston's iconic British fine dining with direct Burj Khalifa views. A once-in-a-lifetime dinner experience.",
    tags: ["Fine Dining", "Burj Views", "Michelin"], emoji: "🍽️",
    image: U("1552566626-52f8b828add9"),
    bgColor: "#15100a", sponsored: true, rating: 4.9, distance: "0.8 km",
    ai_summary: "Once-in-Dubai dining with Burj Khalifa views. Worth every dirham.",
    demand_indicator: "💎 Premium experience",
    cta: { type: "book", label: "Reserve a Table", value: "tel:+97142888888" },
  },
  {
    id: id(), category: "restaurants", name: "La Petite Maison",
    price: "AED 300–450 per person",
    description: "French Riviera classics executed to perfection in DIFC. The burrata and truffle pasta are unmissable.",
    tags: ["French", "Mediterranean", "Romantic"], emoji: "🥐",
    image: U("1414235077428-338989a2e8c0"),
    bgColor: "#0d1a08", sponsored: false, rating: 4.7, distance: "1.2 km",
    ai_summary: "Perfect for a romantic dinner or impressing clients in DIFC.",
    demand_indicator: "🔥 Popular on weekends",
    cta: { type: "book", label: "Reserve a Table", value: "tel:+97143030600" },
  },
  {
    id: id(), category: "restaurants", name: "Torno Subito",
    price: "AED 200–350 per person",
    description: "Massimo Bottura's Italian concept at the W Hotel. Colourful, energetic, and utterly delicious.",
    tags: ["Italian", "Fun Vibes", "Celebrity Chef"], emoji: "🍝",
    image: U("1555396273-367ea4eb4db5"),
    bgColor: "#1a0810", sponsored: false, rating: 4.6, distance: "2.1 km",
    ai_summary: "The most fun Italian in Dubai. Loud, colourful, and absolutely delicious.",
    demand_indicator: "⚡ Trending now",
    cta: { type: "book", label: "Reserve a Table", value: "tel:+97144288888" },
  },
  {
    id: id(), category: "restaurants", name: "Nammos Dubai",
    price: "AED 500+ per person",
    description: "Mykonos transplanted to Palm Jumeirah. Mediterranean excellence, live DJ, and a stunning beach setting.",
    tags: ["Mediterranean", "Beach", "Live Music"], emoji: "🏖️",
    image: U("1507525428034-b723cf961d3e"),
    bgColor: "#081525", sponsored: false, rating: 4.8, distance: "3.2 km",
    ai_summary: "The ultimate beach club dinner. Go for the vibe as much as the food.",
    demand_indicator: "💎 Premium crowd",
    cta: { type: "book", label: "Reserve a Table", value: "tel:+97144550677" },
  },
  {
    id: id(), category: "restaurants", name: "Arabian Tea House",
    price: "AED 80–150 per person",
    description: "Hidden gem in Al Fahidi. Authentic Emirati cuisine, courtyard setting, the best shawarma in the Old City.",
    tags: ["Emirati", "Budget-Friendly", "Al Fahidi"], emoji: "🫖",
    image: U("1414235077428-338989a2e8c0"),
    bgColor: "#1a1208", sponsored: false, rating: 4.7, distance: "4.5 km",
    ai_summary: "Best budget meal in Dubai. Authentic Emirati in a beautiful courtyard.",
    demand_indicator: "🔥 Local favourite",
    cta: { type: "book", label: "Reserve a Table", value: "tel:+97143532222" },
  },
  {
    id: id(), category: "restaurants", name: "Reform Social & Grill",
    price: "AED 120–200 per person",
    description: "The Brit expat favourite. Fish & chips, Sunday roast, garden terrace. Relaxed and always reliable.",
    tags: ["British", "Casual", "Garden"], emoji: "🍔",
    image: U("1517248135467-4c7edcad34c4"),
    bgColor: "#0d2e0d", sponsored: false, rating: 4.5, distance: "1.8 km",
    ai_summary: "Reliable, relaxed, and great value. Perfect for a casual weeknight out.",
    cta: { type: "book", label: "Reserve a Table", value: "tel:+97143888316" },
  },
  {
    id: id(), category: "restaurants", name: "Akira Back Dubai",
    price: "AED 250–400 per person",
    description: "Celebrity chef Akira Back's Korean-Japanese fusion. The wagyu taco alone is worth the trip.",
    tags: ["Korean-Japanese", "Fusion", "Celebration"], emoji: "🥩",
    image: U("1579871494447-9811cf80d66c"),
    bgColor: "#1a0a0a", sponsored: false, rating: 4.7, distance: "1.5 km",
    ai_summary: "The wagyu taco is a must. Great for celebrations and date nights.",
    demand_indicator: "⚡ Highly rated",
    cta: { type: "book", label: "Reserve a Table", value: "tel:+97148888338" },
  },
];

// ─── HOMES ───────────────────────────────────────────────────
export const homes: SwipeCard[] = [
  {
    id: id(), category: "homes", name: "3BR Luxury — DIFC",
    price: "AED 22,000/month",
    description: "Sweeping skyline views, smart home automation, 5-star building with round-the-clock concierge. Fully furnished.",
    tags: ["3 Bed", "Furnished", "Pool", "Gym", "Concierge"], emoji: "🏙️",
    image: U("1512453979798-5ea266f8880c"),
    bgColor: "#0d0d2e", sponsored: true, rating: 4.9,
    ai_summary: "The gold standard for expat living in Dubai. Smart home, concierge, skyline views.",
    demand_indicator: "🔥 High demand area",
    cta: { type: "whatsapp", label: "WhatsApp Agent", value: "https://wa.me/971501234567" },
  },
  {
    id: id(), category: "homes", name: "3BR Modern — Downtown Dubai",
    price: "AED 18,500/month",
    description: "Direct Burj Khalifa views, floor-to-ceiling windows, steps from Dubai Mall. Move-in ready.",
    tags: ["3 Bed", "Burj View", "Gym", "Parking"], emoji: "🌆",
    image: U("1560448204-e02f11c3d0e2"),
    bgColor: "#0d1a2e", sponsored: false, rating: 4.8,
    ai_summary: "Burj Khalifa at your window, Dubai Mall at your door. Hard to beat.",
    demand_indicator: "⚡ Few units available",
    cta: { type: "call", label: "Call Agent", value: "tel:+971502345678" },
  },
  {
    id: id(), category: "homes", name: "Penthouse — Business Bay",
    price: "AED 28,000/month",
    description: "Duplex penthouse with private rooftop terrace, canal views, and double-height ceilings. Truly extraordinary.",
    tags: ["Penthouse", "Canal View", "Rooftop", "Duplex"], emoji: "✨",
    image: U("1502672260266-1c1ef2d93688"),
    bgColor: "#2e0d0d", sponsored: true, rating: 5.0,
    ai_summary: "The most spectacular home in this guide. That rooftop terrace is unreal.",
    demand_indicator: "💎 Ultra-premium listing",
    cta: { type: "call", label: "Call Agent", value: "tel:+971504567890" },
  },
  {
    id: id(), category: "homes", name: "3BR Villa — Jumeirah",
    price: "AED 15,000/month",
    description: "Gated community, large private garden, 5 min walk to Jumeirah Beach. Perfect for families and pet owners.",
    tags: ["3 Bed", "Private Garden", "Beach Access", "Pet Friendly"], emoji: "🏡",
    image: U("1564013799919-ab600027ffc6"),
    bgColor: "#0d2e1a", sponsored: false, rating: 4.7,
    ai_summary: "Ideal for families who want space, privacy, and beach access.",
    demand_indicator: "🔥 Popular with families",
    cta: { type: "whatsapp", label: "WhatsApp Agent", value: "https://wa.me/971503456789" },
  },
  {
    id: id(), category: "homes", name: "2BR — Dubai Marina",
    price: "AED 11,000/month",
    description: "Marina Walk views, fully furnished and upgraded kitchen. Live in the heart of Dubai's most vibrant area.",
    tags: ["2 Bed", "Marina View", "Furnished", "Walk Score 10"], emoji: "⛵",
    image: U("1512453979798-5ea266f8880c"),
    bgColor: "#081525", sponsored: false, rating: 4.6,
    ai_summary: "Best all-round neighbourhood in Dubai. Walk everywhere, never need a car.",
    demand_indicator: "⚡ Always in demand",
    cta: { type: "whatsapp", label: "WhatsApp Agent", value: "https://wa.me/971506123456" },
  },
  {
    id: id(), category: "homes", name: "1BR — JBR Beachfront",
    price: "AED 8,500/month",
    description: "Steps from the beach, furnished with sea views. Perfect for a single professional or couple.",
    tags: ["1 Bed", "Sea View", "Furnished", "Beachfront"], emoji: "🌊",
    image: U("1507525428034-b723cf961d3e"),
    bgColor: "#08151a", sponsored: false, rating: 4.5,
    ai_summary: "Rare sea-view unit at this price. Perfect for a single professional or couple.",
    demand_indicator: "🔥 Won't last long",
    cta: { type: "call", label: "Call Agent", value: "tel:+971507654321" },
  },
  {
    id: id(), category: "homes", name: "3BR Apartment — JVC",
    price: "AED 9,500/month",
    description: "Spacious and bright in a quiet, family-friendly community. New kitchen, large balcony. Outstanding value.",
    tags: ["3 Bed", "Balcony", "Quiet", "Family-Friendly"], emoji: "🏘️",
    image: U("1493809842364-78b498f1fea4"),
    bgColor: "#1a2e0d", sponsored: false, rating: 4.4,
    ai_summary: "Unbeatable value for space. Best family option under AED 10k.",
    demand_indicator: "⚡ Best value pick",
    cta: { type: "whatsapp", label: "WhatsApp Agent", value: "https://wa.me/971505678901" },
  },
  {
    id: id(), category: "homes", name: "Studio — Business Bay",
    price: "AED 5,500/month",
    description: "Modern studio in the heart of Business Bay. High floor, canal views, short walk to DIFC. Ideal first Dubai home.",
    tags: ["Studio", "Canal View", "High Floor", "Central"], emoji: "🏢",
    image: U("1502672260266-1c1ef2d93688"),
    bgColor: "#0d0d1a", sponsored: false, rating: 4.3,
    ai_summary: "Smart first Dubai home. Prime location at a fraction of the usual cost.",
    demand_indicator: "🔥 Fast moving",
    cta: { type: "whatsapp", label: "WhatsApp Agent", value: "https://wa.me/971508765432" },
  },
];

// ─── CARS ────────────────────────────────────────────────────
export const cars: SwipeCard[] = [
  {
    id: id(), category: "cars", name: "2024 Range Rover Sport",
    price: "AED 4,200/month lease",
    description: "Latest model with full service pack, insurance, and first-year registration. The Dubai SUV of choice.",
    tags: ["Family SUV", "AWD", "2024", "Full Warranty", "Service Incl."], emoji: "🚙",
    image: U("1494976388531-d1058494cdd8"),
    bgColor: "#0d2e0d", sponsored: true, rating: 4.9,
    ai_summary: "Dubai's most desired SUV. The lease deal here is genuinely competitive.",
    demand_indicator: "🔥 Most leased SUV",
    cta: { type: "call", label: "Call Dealer", value: "tel:+971506789012" },
  },
  {
    id: id(), category: "cars", name: "2023 Mercedes GLE 450",
    price: "AED 3,800/month lease",
    description: "The perfect family SUV. AMG Line, panoramic sunroof, 7 seats, and top safety ratings for peace of mind.",
    tags: ["Family SUV", "7 Seats", "AMG Line", "Panoramic"], emoji: "🚘",
    image: U("1549317661-be0e0f4f0e92"),
    bgColor: "#0d101a", sponsored: false, rating: 4.8,
    ai_summary: "The sensible choice that still turns heads. AMG line makes it special.",
    demand_indicator: "⚡ Popular pick",
    cta: { type: "call", label: "Call Dealer", value: "tel:+971507890123" },
  },
  {
    id: id(), category: "cars", name: "2024 BMW X5 M-Sport",
    price: "AED 3,500/month lease",
    description: "Sports SUV meets family practicality. HUD, Harman Kardon, M-Sport package with all the tech.",
    tags: ["Family SUV", "M-Sport", "HUD", "Sports SUV"], emoji: "🏎️",
    image: U("1503736334956-4c8f8e92946d"),
    bgColor: "#1a0d08", sponsored: false, rating: 4.7,
    ai_summary: "Best driver's SUV in the family segment. That HUD alone is worth it.",
    demand_indicator: "⚡ Top-rated by drivers",
    cta: { type: "call", label: "Call Dealer", value: "tel:+971508901234" },
  },
  {
    id: id(), category: "cars", name: "2022 Land Cruiser VXR",
    price: "AED 2,800/month lease",
    description: "Dubai's most trusted 4x4. Bulletproof V8 reliability, fully loaded, low mileage, ready for any terrain.",
    tags: ["4x4", "Off-Road", "V8", "Low KM", "Full Option"], emoji: "🛻",
    image: U("1533473359331-0135ef1b58bf"),
    bgColor: "#1a1a08", sponsored: true, rating: 4.9,
    ai_summary: "Never breaks down. The most trusted car in the UAE for very good reason.",
    demand_indicator: "🔥 UAE bestseller",
    cta: { type: "call", label: "Call Dealer", value: "tel:+971509012345" },
  },
  {
    id: id(), category: "cars", name: "2024 Tesla Model X",
    price: "AED 4,500/month lease",
    description: "Zero emissions, Autopilot, 600km range, free supercharging network. The smartest car on the road.",
    tags: ["Electric", "Autopilot", "600km Range", "7 Seats"], emoji: "⚡",
    image: U("1560958992-30aa4e91c5b5"),
    bgColor: "#081525", sponsored: false, rating: 4.8,
    ai_summary: "Free charging, 0-100 in 3 seconds, and it practically parks itself.",
    demand_indicator: "⚡ Electric is the future",
    cta: { type: "call", label: "Call Dealer", value: "tel:+971501112233" },
  },
  {
    id: id(), category: "cars", name: "2023 Porsche 911 Carrera",
    price: "AED 6,800/month lease",
    description: "The benchmark sports car. 3.0L turbo flat-six, rear-wheel drive, 450bhp. Pure driving perfection.",
    tags: ["Sports Car", "Porsche", "450bhp", "2 Seats"], emoji: "🏁",
    image: U("1544636488-fa07867ad435"),
    bgColor: "#1a0808", sponsored: false, rating: 4.9,
    ai_summary: "The greatest driver's car ever made. Some things just don't need a reason.",
    demand_indicator: "💎 Reserved fast",
    cta: { type: "call", label: "Call Dealer", value: "tel:+971502223344" },
  },
  {
    id: id(), category: "cars", name: "2024 Mercedes-Benz S 500",
    price: "AED 5,200/month lease",
    description: "The pinnacle of luxury sedans. Massage seats, Burmester sound, executive rear lounge. Pure first-class.",
    tags: ["Luxury Sedan", "Mercedes", "Massage Seats", "Executive"], emoji: "🎩",
    image: U("1503376780353-7e6692767b70"),
    bgColor: "#0d0d0d", sponsored: true, rating: 4.8,
    ai_summary: "If you need a reason to get this car, this isn't the car for you.",
    demand_indicator: "💎 Ultra-luxury pick",
    cta: { type: "call", label: "Call Dealer", value: "tel:+971503334455" },
  },
];

// ─── PRODUCTS / SHOPPING ─────────────────────────────────────
export const products: SwipeCard[] = [
  {
    id: id(), category: "products", name: "Samsung 65\" Neo QLED 4K",
    price: "AED 3,299",
    description: "Top-rated 4K smart TV. Quantum Matrix Technology, Dolby Atmos, 144Hz gaming mode. Best TV of 2024.",
    tags: ["Electronics", "4K", "Smart TV", "Gaming"], emoji: "📺",
    image: U("1593784991095-a8a3c4f1d5b7"),
    bgColor: "#080d1a", sponsored: false, rating: 4.8,
    ai_summary: "Best TV under AED 4k. The 144Hz gaming mode alone justifies the price.",
    demand_indicator: "⚡ Top seller",
    cta: { type: "buy", label: "Buy on Amazon UAE", value: "https://amazon.ae/s?k=Samsung+65+Neo+QLED" },
  },
  {
    id: id(), category: "products", name: "Apple MacBook Pro 14\" M3",
    price: "AED 7,999",
    description: "M3 Pro chip, 18GB unified RAM, 512GB SSD. Longest battery life ever. The best laptop money can buy.",
    tags: ["Laptop", "Apple", "M3 Pro", "All-Day Battery"], emoji: "💻",
    image: U("1517336714731-489689fd1ca8"),
    bgColor: "#0d0d0d", sponsored: false, rating: 4.9,
    ai_summary: "The best laptop on the market right now. Battery life is genuinely ridiculous.",
    demand_indicator: "🔥 Best-in-class",
    cta: { type: "buy", label: "Buy at Apple UAE", value: "https://www.apple.com/ae/shop/buy-mac/macbook-pro" },
  },
  {
    id: id(), category: "products", name: "iPhone 15 Pro Max",
    price: "AED 5,499",
    description: "Titanium build, A17 Pro chip, 5x optical zoom ProCamera. The best iPhone ever made.",
    tags: ["iPhone", "5x Zoom", "Titanium", "A17 Pro"], emoji: "📱",
    image: U("1592899677977-9b6b9b9b9b9b"),
    bgColor: "#0d1508", sponsored: false, rating: 4.9,
    ai_summary: "The titanium upgrade is real. Best phone camera you can buy right now.",
    demand_indicator: "🔥 Always in demand",
    cta: { type: "buy", label: "Buy at Apple UAE", value: "https://www.apple.com/ae/shop/buy-iphone" },
  },
  {
    id: id(), category: "products", name: "Sony PlayStation 5",
    price: "AED 2,199",
    description: "PS5 disc edition. In stock now. Includes DualSense haptic controller. Free next-day delivery in Dubai.",
    tags: ["Gaming", "Console", "In Stock", "Next-Day"], emoji: "🎮",
    image: U("1607853202273-797f1c22a38e"),
    bgColor: "#080d25", sponsored: true, rating: 4.9,
    ai_summary: "In stock right now with next-day delivery. Don't overthink it.",
    demand_indicator: "⚡ Ships same day",
    cta: { type: "buy", label: "Buy on Noon", value: "https://noon.com" },
  },
  {
    id: id(), category: "products", name: "Dyson V15 Detect",
    price: "AED 1,799",
    description: "Laser detects invisible dust. 60-min runtime, auto-adjusting suction. The benchmark cordless vacuum.",
    tags: ["Home", "Cordless", "Laser Detect", "60 min"], emoji: "🌀",
    image: U("1558618666-fcd25c85cd64"),
    bgColor: "#1a0d08", sponsored: true, rating: 4.8,
    ai_summary: "The laser dust detection actually makes cleaning weirdly satisfying.",
    demand_indicator: "🔥 Top home pick",
    cta: { type: "buy", label: "Buy on Dyson.ae", value: "https://www.dyson.ae" },
  },
  {
    id: id(), category: "products", name: "DXRacer Gaming Chair",
    price: "AED 1,299",
    description: "Best-selling gaming chair. 4D armrests, lumbar support, 135° recline. Upgrades your setup instantly.",
    tags: ["Gaming", "Chair", "Ergonomic", "Premium"], emoji: "🪑",
    image: U("1598550473359-e0b8d1b44a0e"),
    bgColor: "#1a080d", sponsored: false, rating: 4.7,
    ai_summary: "Your back will thank you in 3 months. Best chair upgrade you can make.",
    demand_indicator: "⚡ Popular with gamers",
    cta: { type: "buy", label: "Buy on Amazon UAE", value: "https://amazon.ae/s?k=DXRacer+gaming+chair" },
  },
];

// ─── GYMS ────────────────────────────────────────────────────
export const gyms: SwipeCard[] = [
  {
    id: id(), category: "gyms", name: "Fitness First DIFC",
    price: "AED 499/month",
    description: "Dubai's most popular gym chain. Olympic pool, 200+ weekly classes, elite free weights section.",
    tags: ["24/7", "Pool", "200+ Classes", "DIFC", "Weight Loss"], emoji: "💪",
    image: U("1534438327276-14e5300c3a48"),
    bgColor: "#1a0d1a", sponsored: true, rating: 4.7,
    ai_summary: "The Olympic pool and 200+ weekly classes are hard to beat in Dubai.",
    demand_indicator: "🔥 Most popular chain",
    cta: { type: "call", label: "Book Free Trial", value: "tel:+97144007777" },
  },
  {
    id: id(), category: "gyms", name: "Wellfit DIFC",
    price: "AED 699/month",
    description: "Boutique luxury with cryotherapy, infrared saunas, recovery pools, and world-class coaching staff.",
    tags: ["Luxury", "Cryotherapy", "Recovery", "Wellness", "DIFC"], emoji: "✨",
    image: U("1571019613454-1cb2f99b2d8b"),
    bgColor: "#081525", sponsored: true, rating: 4.9,
    ai_summary: "Best for serious wellness and recovery. The cryotherapy is next level.",
    demand_indicator: "💎 Premium members",
    cta: { type: "call", label: "Book a Tour", value: "tel:+97144007780" },
  },
  {
    id: id(), category: "gyms", name: "Barry's Dubai",
    price: "AED 290/class pack",
    description: "The world's best workout. HIIT treadmill classes that burn 1000 calories per session. Certified addictive.",
    tags: ["HIIT", "Group Classes", "1000 cal/session", "Weight Loss"], emoji: "🔥",
    image: U("1549060279-7e168fcee0c2"),
    bgColor: "#1a0808", sponsored: false, rating: 4.8,
    ai_summary: "Genuinely the best cardio workout in Dubai. Bring a towel.",
    demand_indicator: "🔥 Full classes daily",
    cta: { type: "book", label: "Book a Class", value: "tel:+97144007779" },
  },
  {
    id: id(), category: "gyms", name: "Gold's Gym Downtown",
    price: "AED 350/month",
    description: "Iconic brand, massive free-weights floor, three Dubai locations. 24/7 access, great for muscle building.",
    tags: ["24/7", "Muscle Building", "Free Weights", "Budget"], emoji: "🏋️",
    image: U("1583454110551-21f2fa2afe61"),
    bgColor: "#1a1508", sponsored: false, rating: 4.5,
    ai_summary: "Serious iron, no frills. Exactly what it needs to be for muscle building.",
    demand_indicator: "⚡ Bodybuilder favourite",
    cta: { type: "call", label: "Book Free Trial", value: "tel:+97144007778" },
  },
  {
    id: id(), category: "gyms", name: "GymNation Dubai",
    price: "AED 199/month",
    description: "The best value gym in Dubai. Over 3,000 sq ft, all modern equipment, 24/7 access, no contracts.",
    tags: ["Budget", "24/7", "No Contract", "General Fitness"], emoji: "🏃",
    image: U("1534438327276-14e5300c3a48"),
    bgColor: "#0d1a0d", sponsored: false, rating: 4.4,
    ai_summary: "Best price per square foot in Dubai. The no-contract policy is the real win.",
    demand_indicator: "⚡ Best value gym",
    cta: { type: "call", label: "Join Now", value: "tel:+97144007776" },
  },
];

// ─── SCHOOLS ─────────────────────────────────────────────────
export const schools: SwipeCard[] = [
  {
    id: id(), category: "schools", name: "GEMS Wellington Academy",
    price: "AED 65,000/year",
    description: "Top-rated British curriculum with IB pathway. KHDA Outstanding rating, world-class sports facilities.",
    tags: ["British", "Ages 4–18", "IB", "Outstanding", "KHDA"], emoji: "🎓",
    image: U("1580582932707-520aed937b7b"),
    bgColor: "#081508", sponsored: true, rating: 4.9,
    ai_summary: "KHDA Outstanding with an IB pathway. Best all-round school in Dubai.",
    demand_indicator: "🔥 Waiting list likely",
    cta: { type: "book", label: "Book School Tour", value: "tel:+97143948366" },
  },
  {
    id: id(), category: "schools", name: "Nord Anglia Dubai",
    price: "AED 68,000/year",
    description: "Global network school with MIT STEM partnership. 160+ nationalities. Exceptional university placements.",
    tags: ["IB", "MIT STEM", "Global Network", "Secondary"], emoji: "🌍",
    image: U("1523050854058-8df90110c9f1"),
    bgColor: "#08081a", sponsored: false, rating: 4.8,
    ai_summary: "The MIT STEM partnership alone puts this top for future science and tech careers.",
    demand_indicator: "💎 Premier network",
    cta: { type: "book", label: "Book School Tour", value: "tel:+97144289900" },
  },
  {
    id: id(), category: "schools", name: "Jumeirah English Speaking School",
    price: "AED 45,000/year",
    description: "Outstanding British primary school known for pastoral care and reading programmes. Ages 3–11.",
    tags: ["British", "Primary", "Ages 3–11", "Nursery"], emoji: "📚",
    image: U("1580582932707-520aed937b7b"),
    bgColor: "#081a08", sponsored: false, rating: 4.7,
    ai_summary: "Best British primary in Dubai. The pastoral care is genuinely exceptional.",
    demand_indicator: "🔥 Popular with families",
    cta: { type: "book", label: "Book School Tour", value: "tel:+97143952288" },
  },
  {
    id: id(), category: "schools", name: "Dubai College",
    price: "AED 72,000/year",
    description: "Dubai's top secondary school. British A-Levels, exceptional record of Oxbridge and Ivy League placement.",
    tags: ["British", "Secondary", "A-Levels", "Ages 11–18"], emoji: "🏛️",
    image: U("1523050854058-8df90110c9f1"),
    bgColor: "#0d0d1a", sponsored: false, rating: 4.9,
    ai_summary: "The Oxbridge and Ivy League placement record speaks for itself.",
    demand_indicator: "💎 Top secondary",
    cta: { type: "book", label: "Book School Tour", value: "tel:+97143993636" },
  },
  {
    id: id(), category: "schools", name: "Repton School Dubai",
    price: "AED 78,000/year",
    description: "British boarding-style day school. World-class cricket, IB diploma, stunning campus in Nad Al Sheba.",
    tags: ["IB", "British", "Ages 3–18", "Campus"], emoji: "👑",
    image: U("1580582932707-520aed937b7b"),
    bgColor: "#150810", sponsored: true, rating: 4.8,
    ai_summary: "Beautiful campus, full IB programme, and unbeatable sports facilities.",
    demand_indicator: "🔥 High demand",
    cta: { type: "book", label: "Book School Tour", value: "tel:+97144266733" },
  },
];

// ─── TRAVEL ──────────────────────────────────────────────────
export const travel: SwipeCard[] = [
  {
    id: id(), category: "travel", name: "Maldives — Conrad Resort",
    price: "AED 8,500 per person",
    description: "Overwater villa, all-inclusive. Best Maldives value this season. 7 nights, Emirates direct flights included.",
    tags: ["5 Star", "All-Inclusive", "Overwater Villa", "Romantic"], emoji: "🏝️",
    image: U("1506905925346-21bda4d32df4"),
    bgColor: "#081520", sponsored: true, rating: 5.0,
    ai_summary: "Best Maldives value this season. Overwater villa + Emirates flights is a real deal.",
    demand_indicator: "🔥 Selling fast",
    cta: { type: "book", label: "Book Package", value: "tel:+97144262626" },
  },
  {
    id: id(), category: "travel", name: "Bali Wellness Retreat",
    price: "AED 4,200 per person",
    description: "7 nights in a private Ubud villa. Yoga, spa, airport transfers, and daily breakfasts all included.",
    tags: ["Wellness", "Private Villa", "Yoga", "Beach & Relax"], emoji: "🌴",
    image: U("1537996194471-e657df975ab4"),
    bgColor: "#081a0d", sponsored: false, rating: 4.8,
    ai_summary: "Private Ubud villa with daily yoga and spa. Total switch-off guaranteed.",
    demand_indicator: "⚡ Popular retreat",
    cta: { type: "book", label: "Book Package", value: "tel:+97144262627" },
  },
  {
    id: id(), category: "travel", name: "Paris Long Weekend",
    price: "AED 3,800 per person",
    description: "Emirates business class + 3 nights at Mandarin Oriental Paris. Romantic, effortless, and unforgettable.",
    tags: ["City Break", "Business Class", "5 Star", "Romantic"], emoji: "🗼",
    image: U("1502602898657-3e91760cbb34"),
    bgColor: "#0d0820", sponsored: false, rating: 4.7,
    ai_summary: "Business class + Mandarin Oriental in one booking. Worth every dirham.",
    demand_indicator: "💎 Limited availability",
    cta: { type: "book", label: "Book Package", value: "tel:+97144262628" },
  },
  {
    id: id(), category: "travel", name: "Safari — Kenya Maasai Mara",
    price: "AED 12,000 per person",
    description: "7-night luxury safari. Big 5 game drives, hot air balloon at sunrise. All meals and transfers included.",
    tags: ["Safari", "Luxury", "Adventure", "Big 5"], emoji: "🦁",
    image: U("1547471080-6e6e3b3c5cc7"),
    bgColor: "#1a1008", sponsored: true, rating: 4.9,
    ai_summary: "Hot air balloon over the Maasai Mara at sunrise. Genuinely life-changing.",
    demand_indicator: "🔥 Seasonal spots",
    cta: { type: "book", label: "Book Package", value: "tel:+97144262629" },
  },
  {
    id: id(), category: "travel", name: "Phuket Beach Escape",
    price: "AED 2,800 per person",
    description: "5 nights at a 5-star Patong resort with flights. Infinity pool, beachfront, spa credits included.",
    tags: ["Beach & Relax", "Family", "5 Star", "Under AED 3k"], emoji: "🌅",
    image: U("1507525428034-b723cf961d3e"),
    bgColor: "#08151a", sponsored: false, rating: 4.6,
    ai_summary: "Hard to find a 5-star beach package with flights under AED 3k. Take it.",
    demand_indicator: "⚡ Great value",
    cta: { type: "book", label: "Book Package", value: "tel:+97144262630" },
  },
  {
    id: id(), category: "travel", name: "Tokyo City Break",
    price: "AED 5,500 per person",
    description: "6 nights in Shinjuku, flights included. Guided sushi tour, bullet train day trip, and hotel breakfast daily.",
    tags: ["City Break", "Culture", "Japan", "Guided Tours"], emoji: "🗾",
    image: U("1540959733332-eab4deabeeaf"),
    bgColor: "#0d0d1a", sponsored: false, rating: 4.8,
    ai_summary: "The guided sushi tour alone is worth the flight. Incredible city.",
    demand_indicator: "⚡ Rising demand",
    cta: { type: "book", label: "Book Package", value: "tel:+97144262631" },
  },
];

// ─── ACTIVITIES ──────────────────────────────────────────────
export const activities: SwipeCard[] = [
  {
    id: id(), category: "activities", name: "Desert Safari & BBQ Dinner",
    price: "AED 250 per person",
    description: "Dune bashing, camel riding, sandboarding, and a BBQ under the stars. The essential Dubai evening.",
    tags: ["Adventure", "Outdoor", "Evening", "Group-Friendly"], emoji: "🏜️",
    image: U("1509316785289-025f5b846b35"),
    bgColor: "#1a1008", sponsored: true, rating: 4.8,
    ai_summary: "The most quintessentially Dubai evening you can have. Do this once.",
    demand_indicator: "🔥 Popular nightly",
    cta: { type: "book", label: "Book Now", value: "tel:+971501234500" },
  },
  {
    id: id(), category: "activities", name: "Skydive Dubai",
    price: "AED 2,299 per person",
    description: "Tandem skydive over the iconic Palm Jumeirah from 13,000ft. The highest-rated experience in Dubai.",
    tags: ["Extreme", "Adventure", "Palm Views", "Unique"], emoji: "🪂",
    image: U("1544197150-b99a580bb7a8"),
    bgColor: "#081525", sponsored: false, rating: 4.9,
    ai_summary: "Best view of the Palm. Also terrifying. Worth every second.",
    demand_indicator: "💎 Bucket list experience",
    cta: { type: "book", label: "Book Now", value: "https://skydivedubai.ae" },
  },
  {
    id: id(), category: "activities", name: "Topgolf Dubai",
    price: "AED 200/hour per bay",
    description: "3-level driving range with food, drinks, and private bays. Dubai's best group outing, hands down.",
    tags: ["Groups", "Chill & Social", "Food & Drinks", "Competitive"], emoji: "⛳",
    image: U("1587174486073-ae5e5cff23aa"),
    bgColor: "#081a0d", sponsored: true, rating: 4.7,
    ai_summary: "Best group outing in Dubai. Doesn't matter if you can't golf.",
    demand_indicator: "🔥 Always busy",
    cta: { type: "book", label: "Book a Bay", value: "tel:+97144564444" },
  },
  {
    id: id(), category: "activities", name: "Dubai Frame + Skywalk",
    price: "AED 50 per person",
    description: "Glass-floored sky bridge 150m above Dubai. Best panoramic views of old and new Dubai. Under an hour.",
    tags: ["Landmark", "Quick", "Chill", "Budget"], emoji: "🖼️",
    image: U("1512453979798-5ea266f8880c"),
    bgColor: "#0d1a1a", sponsored: false, rating: 4.6,
    ai_summary: "Best AED 50 you'll spend in Dubai. The glass floor will test your nerves.",
    demand_indicator: "⚡ Quick visit",
    cta: { type: "buy", label: "Buy Tickets", value: "https://thedubaiframe.com" },
  },
  {
    id: id(), category: "activities", name: "Jet Skiing — Palm Jumeirah",
    price: "AED 350/30 min",
    description: "Ride the waves with stunning Atlantis views. Solo or group. Instructor available for beginners.",
    tags: ["Active", "Outdoor", "Solo or Group", "Water Sports"], emoji: "🌊",
    image: U("1507525428034-b723cf961d3e"),
    bgColor: "#08151a", sponsored: false, rating: 4.7,
    ai_summary: "30 minutes of pure fun with Atlantis in the background.",
    demand_indicator: "⚡ Book in advance",
    cta: { type: "book", label: "Book Now", value: "tel:+971501234501" },
  },
  {
    id: id(), category: "activities", name: "Dubai Comedy Night",
    price: "AED 150 per person",
    description: "International stand-up comedians, two-drink minimum, premium venue. Perfect chill night with friends.",
    tags: ["Chill & Social", "Groups", "Nightlife", "Weekly"], emoji: "😂",
    image: U("1517248135467-4c7edcad34c4"),
    bgColor: "#1a0d1a", sponsored: false, rating: 4.5,
    ai_summary: "Surprisingly good international lineup. Great date night or group outing.",
    demand_indicator: "⚡ Weekly show",
    cta: { type: "book", label: "Get Tickets", value: "tel:+971501234502" },
  },
];

// ─── BEAUTY ──────────────────────────────────────────────────
export const beauty: SwipeCard[] = [
  {
    id: id(), category: "beauty", name: "Talise Spa — Jumeirah",
    price: "AED 380/session",
    description: "Award-winning 5-star hotel spa. Signature Emirati treatments, Turkish hammam, and sea-facing treatment rooms.",
    tags: ["Luxury Spa", "Massage", "Hammam", "Full Package"], emoji: "🌸",
    image: U("1571019613454-1cb2f99b2d8b"),
    bgColor: "#1a0810", sponsored: true, rating: 4.9,
    ai_summary: "The Emirati hammam is a non-negotiable Dubai experience. Do this once.",
    demand_indicator: "💎 Award-winning",
    cta: { type: "book", label: "Book Treatment", value: "tel:+97143668888" },
  },
  {
    id: id(), category: "beauty", name: "1847 Men's Grooming Lounge",
    price: "AED 180/visit",
    description: "Dubai's finest men's grooming. Classic cut-throat shaves, luxury haircuts, and bespoke grooming packages.",
    tags: ["Men's Grooming", "Barber", "Classic Shave", "Luxury"], emoji: "✂️",
    image: U("1503951914875-452162b0f3f1"),
    bgColor: "#0d150d", sponsored: false, rating: 4.8,
    ai_summary: "Cut-throat shave in a luxury setting. Every man deserves this at least once.",
    demand_indicator: "🔥 Top-rated men's",
    cta: { type: "book", label: "Book Now", value: "tel:+97144533388" },
  },
  {
    id: id(), category: "beauty", name: "Nails & Tales DIFC",
    price: "AED 120–250/session",
    description: "Luxury nail bar in DIFC. Gel, acrylics, nail art, and same-day appointments available.",
    tags: ["Nails", "Gel Nails", "Nail Art", "DIFC"], emoji: "💅",
    image: U("1604654894610-df63bc536371"),
    bgColor: "#1a081a", sponsored: false, rating: 4.7,
    ai_summary: "Best nail art in the city. Worth every dirham.",
    demand_indicator: "⚡ Same-day bookings",
    cta: { type: "book", label: "Book Now", value: "tel:+97144445566" },
  },
  {
    id: id(), category: "beauty", name: "Blow Dry Bar — JBR",
    price: "AED 150–300/visit",
    description: "The go-to blowout salon in The Walk. Expert colourists, Olaplex treatments, and express styling slots.",
    tags: ["Haircut", "Blow Dry", "Colour", "JBR"], emoji: "💇",
    image: U("1562322140-8baeececf3df"),
    bgColor: "#1a0d08", sponsored: false, rating: 4.6,
    ai_summary: "The Olaplex treatment is genuinely transformative. Great JBR location.",
    demand_indicator: "🔥 JBR favourite",
    cta: { type: "book", label: "Book Now", value: "tel:+97144556677" },
  },
];

// ─── HEALTH ──────────────────────────────────────────────────
export const health: SwipeCard[] = [
  {
    id: id(), category: "health", name: "Mediclinic City Hospital",
    price: "AED 350/consultation",
    description: "Dubai's most trusted private hospital. All specialties, same-day appointments, international insurance accepted.",
    tags: ["GP", "Specialists", "Walk-in", "Insurance"], emoji: "🏥",
    image: U("1519494026892-476f9d6d9aff"),
    bgColor: "#081a10", sponsored: true, rating: 4.7,
    ai_summary: "The most trusted private hospital in Dubai. Same-day for most specialties.",
    demand_indicator: "🔥 Most referred",
    cta: { type: "book", label: "Book Appointment", value: "tel:+97144351000" },
  },
  {
    id: id(), category: "health", name: "Emirates Dental Centre",
    price: "AED 500/check-up",
    description: "Premium cosmetic and general dental care in the heart of Dubai. Whitening, veneers, and Invisalign.",
    tags: ["Dentist", "Cosmetic", "Whitening", "Central"], emoji: "🦷",
    image: U("1588776814546-1ffb6ce21e9a"),
    bgColor: "#0d1220", sponsored: false, rating: 4.7,
    ai_summary: "Best cosmetic dentistry in the city. Invisalign results speak for themselves.",
    demand_indicator: "⚡ Book ahead",
    cta: { type: "book", label: "Book Appointment", value: "tel:+97143525552" },
  },
  {
    id: id(), category: "health", name: "Aster Clinic — DIFC",
    price: "AED 250/consultation",
    description: "Affordable and reliable GP care in the heart of DIFC. Walk-ins welcome, short wait times.",
    tags: ["GP", "Walk-in", "DIFC", "Affordable"], emoji: "💊",
    image: U("1519494026892-476f9d6d9aff"),
    bgColor: "#0d1a0d", sponsored: false, rating: 4.5,
    ai_summary: "Walk-in friendly and genuinely quick. Best GP option for busy professionals.",
    demand_indicator: "⚡ Short wait times",
    cta: { type: "book", label: "Book Appointment", value: "tel:+97144404000" },
  },
];

// ─── MASTER MAP ───────────────────────────────────────────────
export const MOCK_DATA: Record<string, SwipeCard[]> = {
  restaurants, homes, cars, products, gyms, schools, travel, activities, beauty, health,
};

function parseMinPrice(price: string): number {
  const match = price.replace(/,/g, "").match(/\d+/)
  return match ? parseInt(match[0]) : 0
}

export function getCardsByCategory(categories: Category[], query?: string, maxBudget?: number): SwipeCard[] {
  const results: SwipeCard[] = [];
  categories.forEach((cat) => {
    let data = MOCK_DATA[cat] || [];

    // Budget filter — for price-per-person or monthly categories
    if (maxBudget && maxBudget > 0 && (cat === "restaurants" || cat === "activities" || cat === "travel")) {
      const budgetFiltered = data.filter(c => parseMinPrice(c.price) <= maxBudget)
      if (budgetFiltered.length >= 1) {
        data = budgetFiltered
      } else {
        data = [...data].sort((a, b) => parseMinPrice(a.price) - parseMinPrice(b.price)).slice(0, 3)
      }
    }

    // Keyword filter — shapes results based on user answers (cuisine, type, occasion, car type, etc.)
    if (query && query.trim().length > 0) {
      const keywords = query.toLowerCase().split(/[\s,.\-/]+/).filter(k => k.length > 2)
      if (keywords.length > 0) {
        const filtered = data.filter(card =>
          keywords.some(kw =>
            card.name.toLowerCase().includes(kw) ||
            card.description.toLowerCase().includes(kw) ||
            card.tags.some(tag => tag.toLowerCase().includes(kw))
          )
        )
        if (filtered.length >= 2) data = filtered
        else if (filtered.length === 1) data = [filtered[0], ...data.filter(c => c.id !== filtered[0].id)].slice(0, 4)
      }
    }

    results.push(...data);
  });

  // Sponsored cards first, then by rating
  return results.sort((a, b) => {
    if (b.sponsored !== a.sponsored) return (b.sponsored ? 1 : 0) - (a.sponsored ? 1 : 0)
    return (b.rating || 0) - (a.rating || 0)
  });
}
