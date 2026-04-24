import SwiftUI

struct BrokerView: View {
    @Environment(AppState.self) private var state
    @State private var leads: [Lead] = []
    @State private var isLoading = true
    @State private var showAuth = false

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

                    Text("Broker Leads")
                        .font(Theme.Font.headline(20))
                        .foregroundColor(Theme.textPrimary)

                    Spacer()

                    if state.isAuthenticated {
                        TierBadge(tier: state.tier)
                    }
                }
                .padding(.horizontal, Theme.padMd)
                .padding(.vertical, 12)

                if !state.isAuthenticated {
                    // Auth prompt
                    VStack(spacing: 24) {
                        Spacer()

                        Image(systemName: "lock.circle.fill")
                            .font(.system(size: 64))
                            .foregroundStyle(Theme.goldGradient)

                        VStack(spacing: 8) {
                            Text("Broker Portal")
                                .font(Theme.Font.headline(24))
                                .foregroundColor(Theme.textPrimary)
                            Text("Sign in to access buyer leads, manage your pipeline, and unlock contact details.")
                                .font(Theme.Font.body(14))
                                .foregroundColor(Theme.textSecondary)
                                .multilineTextAlignment(.center)
                                .padding(.horizontal, 32)
                        }

                        GoldButton(title: "Sign In to Continue") { showAuth = true }
                            .padding(.horizontal, Theme.padMd)

                        Spacer()
                    }
                } else if isLoading {
                    Spacer()
                    ProgressView()
                        .tint(Theme.gold)
                    Spacer()
                } else {
                    ScrollView {
                        VStack(spacing: 16) {
                            // Stats
                            HStack(spacing: 12) {
                                BrokerStat(value: "\(leads.count)", label: "Total Leads", icon: "person.2.fill")
                                BrokerStat(
                                    value: "\(leads.filter { $0.status == "available" }.count)",
                                    label: "Available",
                                    icon: "bolt.fill"
                                )
                                BrokerStat(
                                    value: "\(leads.filter { $0.status == "unlocked" }.count)",
                                    label: "Unlocked",
                                    icon: "checkmark.seal.fill"
                                )
                            }
                            .padding(.horizontal, Theme.padMd)

                            // Lead list
                            if leads.isEmpty {
                                VStack(spacing: 12) {
                                    Image(systemName: "tray.fill")
                                        .font(.system(size: 40))
                                        .foregroundColor(Theme.textMuted)
                                    Text("No leads yet")
                                        .font(Theme.Font.body(15))
                                        .foregroundColor(Theme.textMuted)
                                }
                                .padding(.top, 60)
                            } else {
                                ForEach(leads) { lead in
                                    LeadCard(lead: lead)
                                        .padding(.horizontal, Theme.padMd)
                                }
                            }
                        }
                        .padding(.vertical, Theme.padMd)
                    }
                }
            }
        }
        .sheet(isPresented: $showAuth) {
            AuthView().environment(state)
        }
        .task {
            if state.isAuthenticated, let userId = state.userId {
                leads = (try? await SupabaseService.shared.fetchLeads(userId: userId)) ?? []
            }
            isLoading = false
        }
    }
}

private struct BrokerStat: View {
    let value: String
    let label: String
    let icon: String

    var body: some View {
        CardView {
            VStack(spacing: 6) {
                Image(systemName: icon)
                    .font(.system(size: 18))
                    .foregroundStyle(Theme.goldGradient)
                Text(value)
                    .font(Theme.Font.display(24))
                    .foregroundStyle(Theme.goldGradient)
                Text(label)
                    .font(Theme.Font.caption(11))
                    .foregroundColor(Theme.textMuted)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, Theme.padMd)
        }
    }
}

private struct LeadCard: View {
    let lead: Lead

    var statusColor: Color {
        switch lead.status {
        case "unlocked": return Theme.success
        case "available": return Theme.gold
        default: return Theme.textMuted
        }
    }

    var body: some View {
        CardView {
            HStack(spacing: 14) {
                ZStack {
                    Circle()
                        .fill(statusColor.opacity(0.1))
                        .frame(width: 48, height: 48)
                    Image(systemName: lead.status == "unlocked" ? "person.fill.checkmark" : "person.fill")
                        .foregroundColor(statusColor)
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text("Lead #\(String(lead.id.prefix(8)).uppercased())")
                        .font(Theme.Font.headline(14))
                        .foregroundColor(Theme.textPrimary)

                    Text(formatDate(lead.createdAt))
                        .font(Theme.Font.caption(12))
                        .foregroundColor(Theme.textMuted)
                }

                Spacer()

                VStack(alignment: .trailing, spacing: 4) {
                    Text(lead.status.capitalized)
                        .font(Theme.Font.caption(11))
                        .foregroundColor(statusColor)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(statusColor.opacity(0.1))
                        .cornerRadius(4)

                    if lead.status == "available" {
                        Text("AED \(Int(lead.priceToUnlock / 1000))K")
                            .font(Theme.Font.caption(11))
                            .foregroundColor(Theme.textMuted)
                    }
                }
            }
            .padding(Theme.padMd)
        }
    }

    private func formatDate(_ isoString: String) -> String {
        let formatter = ISO8601DateFormatter()
        guard let date = formatter.date(from: isoString) else { return isoString }
        let display = DateFormatter()
        display.dateStyle = .medium
        return display.string(from: date)
    }
}
