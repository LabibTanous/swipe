import SwiftUI

@main
struct VerdictApp: App {
    @State private var appState = AppState()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(appState)
                .preferredColorScheme(.dark)
        }
    }
}

struct RootView: View {
    @Environment(AppState.self) private var state

    var body: some View {
        Group {
            switch state.screen {
            case .onboarding:
                OnboardingView()
            case .qualify:
                QualifyView()
            case .thinking:
                ThinkingView()
            case .swipe:
                SwipeView()
            case .propertyDetail(let property):
                PropertyDetailView(property: property)
            case .auth:
                AuthView()
            case .broker:
                BrokerView()
            case .portfolio:
                PortfolioView()
            case .saved:
                SavedView()
            }
        }
        .animation(.easeInOut(duration: 0.3), value: state.screen.id)
        .task {
            // Restore session on launch
            if let session = await SupabaseService.shared.currentSession() {
                state.userId = session.userId
                state.authToken = session.token
                state.isAuthenticated = true
            }
        }
    }
}

extension AppScreen: Equatable {
    static func == (lhs: AppScreen, rhs: AppScreen) -> Bool {
        lhs.id == rhs.id
    }
}

extension AppScreen {
    var id: String {
        switch self {
        case .onboarding: return "onboarding"
        case .qualify: return "qualify"
        case .thinking: return "thinking"
        case .swipe: return "swipe"
        case .propertyDetail(let p): return "detail-\(p.id)"
        case .auth: return "auth"
        case .broker: return "broker"
        case .portfolio: return "portfolio"
        case .saved: return "saved"
        }
    }
}
