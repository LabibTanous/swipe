import SwiftUI

struct ThinkingView: View {
    @Environment(AppState.self) private var state
    @State private var progress: CGFloat = 0
    @State private var currentPhase = 0
    @State private var dots = ""
    @State private var dotTimer: Timer?

    let phases = [
        "Analyzing your profile",
        "Scoring qualification",
        "Scanning live listings",
        "Running AI matching",
        "Curating top picks",
    ]

    var body: some View {
        ZStack {
            Theme.bg.ignoresSafeArea()

            VStack(spacing: 40) {
                Spacer()

                // Animated logo
                ZStack {
                    Circle()
                        .stroke(Theme.gold.opacity(0.1), lineWidth: 2)
                        .frame(width: 160, height: 160)

                    Circle()
                        .trim(from: 0, to: progress)
                        .stroke(Theme.goldGradient, style: StrokeStyle(lineWidth: 3, lineCap: .round))
                        .frame(width: 160, height: 160)
                        .rotationEffect(.degrees(-90))
                        .animation(.easeInOut(duration: 0.5), value: progress)

                    Text("V")
                        .font(.system(size: 56, weight: .black))
                        .foregroundStyle(Theme.goldGradient)
                }

                VStack(spacing: 12) {
                    Text(phases[min(currentPhase, phases.count - 1)] + dots)
                        .font(Theme.Font.headline(18))
                        .foregroundColor(Theme.textPrimary)
                        .animation(.easeInOut, value: currentPhase)

                    Text("This takes about 10 seconds")
                        .font(Theme.Font.body(13))
                        .foregroundColor(Theme.textMuted)
                }

                // Phase indicators
                HStack(spacing: 8) {
                    ForEach(0..<phases.count, id: \.self) { i in
                        RoundedRectangle(cornerRadius: 2)
                            .fill(i <= currentPhase ? Theme.gold : Theme.card)
                            .frame(width: i == currentPhase ? 24 : 8, height: 4)
                            .animation(.spring(), value: currentPhase)
                    }
                }

                // Score preview
                if let result = state.qualificationResult {
                    CardView {
                        HStack(spacing: 24) {
                            VStack(spacing: 4) {
                                Text("\(result.score)")
                                    .font(Theme.Font.display(32))
                                    .foregroundStyle(Theme.goldGradient)
                                Text("Score")
                                    .font(Theme.Font.caption(11))
                                    .foregroundColor(Theme.textMuted)
                            }

                            Rectangle()
                                .fill(Theme.cardBorder)
                                .frame(width: 1, height: 40)

                            TierBadge(tier: result.tier)

                            Spacer()

                            Image(systemName: "checkmark.seal.fill")
                                .font(.system(size: 28))
                                .foregroundStyle(Theme.goldGradient)
                        }
                        .padding(Theme.padMd)
                    }
                    .padding(.horizontal, Theme.padMd)
                    .opacity(progress > 0.8 ? 1 : 0)
                    .animation(.easeIn(duration: 0.4), value: progress)
                }

                Spacer()
            }
        }
        .onAppear { startAnimation() }
        .onDisappear { dotTimer?.invalidate() }
    }

    private func startAnimation() {
        dotTimer = Timer.scheduledTimer(withTimeInterval: 0.4, repeats: true) { _ in
            dots = dots.count < 3 ? dots + "." : ""
        }

        Task {
            // If authenticated, create lead on backend
            if state.isAuthenticated, let token = state.authToken, let result = state.qualificationResult {
                _ = try? await MatchingService.shared.createLead(
                    profile: state.profile,
                    qualificationScore: result.score,
                    tier: result.tier,
                    token: token
                )
            }

            // Animate through phases
            for i in 0..<phases.count {
                try? await Task.sleep(for: .seconds(1.5))
                await MainActor.run {
                    currentPhase = i
                    progress = CGFloat(i + 1) / CGFloat(phases.count)
                }
            }

            // Fetch properties
            let props: [Property]
            if state.isAuthenticated, let token = state.authToken {
                props = (try? await MatchingService.shared.fetchMatchedProperties(profile: state.profile, token: token)) ?? []
            } else {
                props = []
            }

            // Fallback to Supabase direct if API returned nothing
            let finalProps: [Property]
            if props.isEmpty {
                finalProps = (try? await SupabaseService.shared.fetchProperties(
                    budget: state.profile.budget,
                    location: state.profile.location
                )) ?? []
            } else {
                finalProps = props
            }

            try? await Task.sleep(for: .seconds(0.5))

            await MainActor.run {
                state.properties = finalProps
                state.currentIndex = 0
                withAnimation { state.screen = .swipe }
            }
        }
    }
}
