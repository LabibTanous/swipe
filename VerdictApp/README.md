# Verdict iOS App (SwiftUI)

Native iOS app built with SwiftUI targeting iOS 17+. Connects to the same Supabase backend and Vercel API routes as the web app.

## Structure

```
VerdictApp/
├── Package.swift                  # SPM — supabase-swift dependency
├── VerdictApp.xcodeproj/          # Xcode project
└── VerdictApp/
    ├── App.swift                  # @main entry, screen router
    ├── Models.swift               # Codable data models
    ├── Theme.swift                # Design tokens + shared components
    ├── AppState.swift             # @Observable global state
    ├── SupabaseService.swift      # Auth, listings, portfolio, wallet
    ├── MatchingService.swift      # Vercel API + qualification scoring
    ├── OnboardingView.swift       # Landing screen
    ├── QualifyView.swift          # 6-step buyer qualification flow
    ├── ThinkingView.swift         # AI matching loading screen
    ├── SwipeView.swift            # Tinder-style property cards
    ├── PropertyDetailView.swift   # Full property info + contact broker
    ├── AuthView.swift             # Sign in / sign up sheet
    ├── BrokerView.swift           # Broker lead dashboard
    ├── PortfolioView.swift        # Investment portfolio tracker
    ├── SavedView.swift            # Saved / hearted properties
    └── Assets.xcassets/
```

## Opening in Xcode

1. Open `VerdictApp.xcodeproj` in Xcode 15+
2. Xcode will automatically resolve the `supabase-swift` SPM package
3. Select an iPhone simulator (iOS 17+) and press Run

## Backend

| Service | Value |
|---------|-------|
| Supabase URL | `https://dwtfcsvmlxoyhljjddlt.supabase.co` |
| Anon key | stored in `SupabaseService.swift` |
| API base | `https://verdict-rose-kappa.vercel.app` |

## Design tokens

| Token | Value |
|-------|-------|
| Background | `#07070F` |
| Card | `#13131E` |
| Gold | `#C9A84C` |
| Text | `#FFFFFF` / `#8888AA` |

## Flow

```
Onboarding → Qualify (6 steps) → Thinking (AI match) → Swipe
                                                          ↓
                                                   PropertyDetail
                                                          ↓
                                           Auth | Portfolio | Broker | Saved
```
