# Swipe — AI Concierge

A luxury AI-powered concierge app where users ask for anything and get swipeable results.

## Stack
- Next.js 14 (App Router)
- React 18 + TypeScript
- Tailwind CSS
- OpenAI GPT-4o
- Framer Motion

## Setup (5 minutes)

### 1. Install dependencies
```bash
npm install
```

### 2. Add your OpenAI API key
```bash
cp .env.local.example .env.local
```
Then edit `.env.local` and replace `sk-your-key-here` with your actual OpenAI API key.

### 3. Run
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## How It Works

### User Flow
1. User opens app → sees a clean search bar
2. Types anything: *"I want to eat somewhere nice tonight"*
3. AI (GPT-4o) understands the intent → asks 1 smart follow-up if needed
4. App shows swipeable cards
5. Swipe right = Save, Swipe left = Skip
6. Saved items screen shows with direct action buttons (Call, Book, Buy)

### AI Flow
- `POST /api/concierge` receives user message + conversation history
- GPT-4o parses intent into structured JSON with categories
- Categories map to mock data functions
- Results returned as typed `SwipeCard[]` objects

### Adding Real Data
Replace the mock functions in `src/lib/mockData.ts` with real API calls:
- **Homes**: Bayut API, Property Finder API
- **Restaurants**: Google Places API, Zomato API
- **Products**: Amazon Product API, Noon API
- **Cars**: dealer APIs
- **Travel**: Amadeus API, Booking.com API

### Adding More Categories
1. Add the category to `Category` type in `src/types/index.ts`
2. Add mock data in `src/lib/mockData.ts`
3. Add keywords to the system prompt in `src/lib/openai.ts`
4. Done — the AI handles the rest automatically

---

## Monetisation (Built In)
Cards have a `sponsored: boolean` field. Sponsored cards float to the top of the deck.
Charge businesses `sponsored: true` for premium placement.

## Project Structure
```
src/
├── app/
│   ├── api/concierge/route.ts   ← OpenAI API route
│   ├── page.tsx                  ← Main app orchestrator
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── HomeScreen.tsx            ← Search bar entry
│   ├── ConciergeChat.tsx         ← AI conversation
│   ├── SwipeDeck.tsx             ← Tinder-style swipe deck
│   ├── SwipeCard.tsx             ← Individual card
│   └── SavedScreen.tsx           ← Saved matches + CTA
├── lib/
│   ├── openai.ts                 ← GPT-4o integration
│   └── mockData.ts               ← All mock listings
└── types/
    └── index.ts                  ← All TypeScript types
```
