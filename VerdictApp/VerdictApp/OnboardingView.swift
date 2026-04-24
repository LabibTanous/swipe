import SwiftUI

struct OnboardingView: View {
    @Environment(AppState.self) private var state

    var body: some View {
        ZStack {
            Theme.bg.ignoresSafeArea()

            VStack(spacing: 0) {
                Spacer()

                // Logo
                VStack(spacing: 12) {
                    Text("VERDICT")
                        .font(.system(size: 48, weight: .black, design: .default))
                        .foregroundStyle(Theme.goldGradient)
                        .tracking(8)

                    Text("PROPERTY INTELLIGENCE")
                        .font(Theme.Font.caption(11))
                        .foregroundColor(Theme.textMuted)
                        .tracking(4)
                }

                Spacer()

                // Hero visual
                VStack(spacing: 0) {
                    ZStack {
                        RoundedRectangle(cornerRadius: Theme.radiusXl)
                            .fill(Theme.card)
                            .overlay(RoundedRectangle(cornerRadius: Theme.radiusXl).stroke(Theme.gold.opacity(0.2), lineWidth: 1))
                            .frame(height: 280)

                        VStack(spacing: 20) {
                            HStack(spacing: 16) {
                                ForEach(["Platinum", "Gold", "Silver", "Bronze"], id: \.self) { tier in
                                    TierBadge(tier: tier)
                                }
                            }

                            VStack(spacing: 8) {
                                Text("AI-Powered Matching")
                                    .font(Theme.Font.headline(20))
                                    .foregroundColor(Theme.textPrimary)

                                Text("Connect with pre-qualified buyers and the right properties in seconds.")
                                    .font(Theme.Font.body(14))
                                    .foregroundColor(Theme.textSecondary)
                                    .multilineTextAlignment(.center)
                                    .padding(.horizontal, 24)
                            }

                            HStack(spacing: 32) {
                                StatItem(value: "2min", label: "Qualify")
                                StatItem(value: "AI", label: "Matching")
                                StatItem(value: "Live", label: "Listings")
                            }
                        }
                        .padding(Theme.padLg)
                    }
                }
                .padding(.horizontal, Theme.padMd)

                Spacer()

                // Actions
                VStack(spacing: 12) {
                    GoldButton(title: "Find My Property") {
                        state.screen = .qualify
                    }

                    GoldOutlineButton(title: "Sign In") {
                        state.screen = .auth
                    }
                }
                .padding(.horizontal, Theme.padMd)
                .padding(.bottom, 40)
            }
        }
    }
}

private struct StatItem: View {
    let value: String
    let label: String

    var body: some View {
        VStack(spacing: 4) {
            Text(value)
                .font(Theme.Font.headline(18))
                .foregroundStyle(Theme.goldGradient)
            Text(label)
                .font(Theme.Font.caption(11))
                .foregroundColor(Theme.textMuted)
        }
    }
}
