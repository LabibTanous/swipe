import SwiftUI

struct PortfolioView: View {
    @Environment(AppState.self) private var state
    @State private var portfolio: [PortfolioProperty] = []
    @State private var walletRecords: [WalletRecord] = []
    @State private var isLoading = true

    var totalValue: Double { portfolio.reduce(0) { $0 + $1.currentValue } }
    var totalCost: Double { portfolio.reduce(0) { $0 + $1.purchasePrice } }
    var gain: Double { totalValue - totalCost }
    var gainPercent: Double { totalCost > 0 ? (gain / totalCost) * 100 : 0 }

    var body: some View {
        ZStack {
            Theme.bg.ignoresSafeArea()

            VStack(spacing: 0) {
                // Header
                HStack {
                    Button { state.screen = .swipe } label: {
                        Image(systemName: "chevron.left")
                            .foregroundColor(Theme.textSecondary)
                            .padding(10)
                            .background(Theme.card)
                            .clipShape(Circle())
                    }

                    Text("Portfolio")
                        .font(Theme.Font.headline(20))
                        .foregroundColor(Theme.textPrimary)

                    Spacer()

                    Button { state.signOut() } label: {
                        Text("Sign Out")
                            .font(Theme.Font.caption(12))
                            .foregroundColor(Theme.textMuted)
                    }
                }
                .padding(.horizontal, Theme.padMd)
                .padding(.vertical, 12)

                if isLoading {
                    Spacer()
                    ProgressView().tint(Theme.gold)
                    Spacer()
                } else {
                    ScrollView {
                        VStack(spacing: 20) {
                            // Summary card
                            CardView {
                                VStack(spacing: 16) {
                                    HStack {
                                        Text("Total Portfolio Value")
                                            .font(Theme.Font.caption(13))
                                            .foregroundColor(Theme.textMuted)
                                        Spacer()
                                        TierBadge(tier: state.tier)
                                    }

                                    Text(formatPrice(totalValue))
                                        .font(Theme.Font.display(32))
                                        .foregroundStyle(Theme.goldGradient)
                                        .frame(maxWidth: .infinity, alignment: .leading)

                                    HStack {
                                        VStack(alignment: .leading, spacing: 2) {
                                            Text("Invested")
                                                .font(Theme.Font.caption(11))
                                                .foregroundColor(Theme.textMuted)
                                            Text(formatPrice(totalCost))
                                                .font(Theme.Font.headline(14))
                                                .foregroundColor(Theme.textPrimary)
                                        }

                                        Spacer()

                                        VStack(alignment: .trailing, spacing: 2) {
                                            Text("Return")
                                                .font(Theme.Font.caption(11))
                                                .foregroundColor(Theme.textMuted)
                                            HStack(spacing: 4) {
                                                Image(systemName: gain >= 0 ? "arrow.up.right" : "arrow.down.right")
                                                    .font(.system(size: 10))
                                                Text(String(format: "%.1f%%", gainPercent))
                                                    .font(Theme.Font.headline(14))
                                            }
                                            .foregroundColor(gain >= 0 ? Theme.success : Theme.error)
                                        }
                                    }
                                }
                                .padding(Theme.padMd)
                            }
                            .padding(.horizontal, Theme.padMd)

                            // Properties
                            if !portfolio.isEmpty {
                                VStack(alignment: .leading, spacing: 12) {
                                    Text("Properties (\(portfolio.count))")
                                        .font(Theme.Font.headline(16))
                                        .foregroundColor(Theme.textPrimary)
                                        .padding(.horizontal, Theme.padMd)

                                    ForEach(portfolio) { item in
                                        PortfolioRow(item: item)
                                            .padding(.horizontal, Theme.padMd)
                                    }
                                }
                            } else {
                                VStack(spacing: 16) {
                                    Image(systemName: "building.2.circle.fill")
                                        .font(.system(size: 48))
                                        .foregroundStyle(Theme.goldGradient)
                                    Text("No properties yet")
                                        .font(Theme.Font.body(15))
                                        .foregroundColor(Theme.textSecondary)
                                    Text("Browse listings and add properties to build your portfolio.")
                                        .font(Theme.Font.body(13))
                                        .foregroundColor(Theme.textMuted)
                                        .multilineTextAlignment(.center)
                                        .padding(.horizontal, 40)
                                    GoldButton(title: "Browse Properties") {
                                        state.screen = .swipe
                                    }
                                    .padding(.horizontal, 40)
                                }
                                .padding(.top, 40)
                            }

                            // Wallet section
                            if !walletRecords.isEmpty {
                                VStack(alignment: .leading, spacing: 12) {
                                    Text("Recent Activity")
                                        .font(Theme.Font.headline(16))
                                        .foregroundColor(Theme.textPrimary)
                                        .padding(.horizontal, Theme.padMd)

                                    ForEach(walletRecords.prefix(5)) { record in
                                        WalletRow(record: record)
                                            .padding(.horizontal, Theme.padMd)
                                    }
                                }
                            }
                        }
                        .padding(.vertical, Theme.padMd)
                    }
                }
            }
        }
        .task {
            guard let userId = state.userId else {
                isLoading = false
                return
            }
            async let p = SupabaseService.shared.fetchPortfolio(userId: userId)
            async let w = SupabaseService.shared.fetchWallet(userId: userId)
            portfolio = (try? await p) ?? []
            walletRecords = (try? await w) ?? []
            isLoading = false
        }
    }

    private func formatPrice(_ price: Double) -> String {
        if price >= 1_000_000 {
            return String(format: "AED %.2fM", price / 1_000_000)
        }
        return String(format: "AED %.0fK", price / 1_000)
    }
}

private struct PortfolioRow: View {
    let item: PortfolioProperty

    var gain: Double { item.currentValue - item.purchasePrice }
    var gainPercent: Double { item.purchasePrice > 0 ? (gain / item.purchasePrice) * 100 : 0 }

    var body: some View {
        CardView {
            HStack(spacing: 14) {
                ZStack {
                    RoundedRectangle(cornerRadius: Theme.radiusSm)
                        .fill(Theme.goldDim)
                        .frame(width: 48, height: 48)
                    Image(systemName: "building.fill")
                        .foregroundStyle(Theme.goldGradient)
                }

                VStack(alignment: .leading, spacing: 3) {
                    Text(item.property?.title ?? "Property")
                        .font(Theme.Font.headline(14))
                        .foregroundColor(Theme.textPrimary)
                        .lineLimit(1)
                    Text(item.property?.location ?? "–")
                        .font(Theme.Font.caption(12))
                        .foregroundColor(Theme.textMuted)
                }

                Spacer()

                VStack(alignment: .trailing, spacing: 3) {
                    Text(formatPrice(item.currentValue))
                        .font(Theme.Font.headline(14))
                        .foregroundColor(Theme.textPrimary)
                    HStack(spacing: 3) {
                        Image(systemName: gain >= 0 ? "arrow.up.right" : "arrow.down.right")
                            .font(.system(size: 9))
                        Text(String(format: "%.1f%%", gainPercent))
                            .font(Theme.Font.caption(11))
                    }
                    .foregroundColor(gain >= 0 ? Theme.success : Theme.error)
                }
            }
            .padding(Theme.padMd)
        }
    }

    private func formatPrice(_ price: Double) -> String {
        if price >= 1_000_000 { return String(format: "AED %.1fM", price / 1_000_000) }
        return String(format: "AED %.0fK", price / 1_000)
    }
}

private struct WalletRow: View {
    let record: WalletRecord

    var body: some View {
        HStack {
            Image(systemName: record.type == "credit" ? "plus.circle.fill" : "minus.circle.fill")
                .foregroundColor(record.type == "credit" ? Theme.success : Theme.error)
                .font(.system(size: 20))

            VStack(alignment: .leading, spacing: 2) {
                Text(record.description)
                    .font(Theme.Font.body(13))
                    .foregroundColor(Theme.textPrimary)
                    .lineLimit(1)
                Text(formatDate(record.createdAt))
                    .font(Theme.Font.caption(11))
                    .foregroundColor(Theme.textMuted)
            }

            Spacer()

            Text("\(record.type == "credit" ? "+" : "-")AED \(Int(record.amount))")
                .font(Theme.Font.headline(13))
                .foregroundColor(record.type == "credit" ? Theme.success : Theme.error)
        }
        .padding(.vertical, 8)
        .padding(.horizontal, Theme.padMd)
        .background(Theme.card)
        .cornerRadius(Theme.radiusSm)
    }

    private func formatDate(_ isoString: String) -> String {
        let formatter = ISO8601DateFormatter()
        guard let date = formatter.date(from: isoString) else { return isoString }
        let display = DateFormatter()
        display.dateStyle = .short
        return display.string(from: date)
    }
}
