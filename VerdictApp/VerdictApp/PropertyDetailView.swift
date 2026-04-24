import SwiftUI

struct PropertyDetailView: View {
    @Environment(AppState.self) private var state
    let property: Property
    @State private var showContactSheet = false
    @State private var showAuthSheet = false

    var body: some View {
        ZStack(alignment: .topLeading) {
            Theme.bg.ignoresSafeArea()

            ScrollView {
                VStack(spacing: 0) {
                    // Hero image
                    ZStack(alignment: .bottom) {
                        ZStack {
                            if let url = property.imageUrl, let imageURL = URL(string: url) {
                                AsyncImage(url: imageURL) { phase in
                                    switch phase {
                                    case .success(let img): img.resizable().aspectRatio(contentMode: .fill)
                                    default: PropertyHeroPlaceholder()
                                    }
                                }
                            } else {
                                PropertyHeroPlaceholder()
                            }
                        }
                        .frame(height: 320)
                        .clipped()

                        LinearGradient(
                            colors: [.clear, Theme.bg],
                            startPoint: .center,
                            endPoint: .bottom
                        )
                        .frame(height: 160)
                    }

                    // Content
                    VStack(alignment: .leading, spacing: 24) {
                        // Title + save
                        HStack(alignment: .top) {
                            VStack(alignment: .leading, spacing: 6) {
                                Text(property.title)
                                    .font(Theme.Font.display(24))
                                    .foregroundColor(Theme.textPrimary)

                                HStack(spacing: 4) {
                                    Image(systemName: "mappin.circle.fill")
                                        .foregroundColor(Theme.gold)
                                        .font(.system(size: 12))
                                    Text(property.location)
                                        .font(Theme.Font.body(14))
                                        .foregroundColor(Theme.textSecondary)
                                }
                            }

                            Spacer()

                            Button {
                                if state.isSaved(property) {
                                    state.unsaveProperty(property)
                                } else {
                                    state.saveProperty(property)
                                }
                            } label: {
                                Image(systemName: state.isSaved(property) ? "heart.fill" : "heart")
                                    .font(.system(size: 20))
                                    .foregroundColor(Theme.gold)
                                    .padding(12)
                                    .background(Theme.goldDim)
                                    .clipShape(Circle())
                            }
                        }

                        // Price
                        Text(formatPrice(property.price))
                            .font(Theme.Font.display(32))
                            .foregroundStyle(Theme.goldGradient)

                        // Stats grid
                        CardView {
                            HStack {
                                DetailStat(icon: "bed.double.fill", value: "\(property.bedrooms)", label: "Bedrooms")
                                Divider().background(Theme.cardBorder)
                                DetailStat(icon: "shower.fill", value: "\(property.bathrooms)", label: "Bathrooms")
                                Divider().background(Theme.cardBorder)
                                DetailStat(icon: "square.fill", value: "\(Int(property.area))", label: "sqft")
                            }
                            .padding(Theme.padMd)
                        }

                        // Match score
                        if let score = property.matchScore {
                            CardView {
                                HStack(spacing: 12) {
                                    Image(systemName: "bolt.circle.fill")
                                        .font(.system(size: 32))
                                        .foregroundStyle(Theme.goldGradient)

                                    VStack(alignment: .leading, spacing: 2) {
                                        Text("Match Score")
                                            .font(Theme.Font.caption(12))
                                            .foregroundColor(Theme.textMuted)
                                        Text("\(score)% Compatible")
                                            .font(Theme.Font.headline(18))
                                            .foregroundColor(Theme.textPrimary)
                                    }

                                    Spacer()

                                    ZStack {
                                        Circle()
                                            .stroke(Theme.gold.opacity(0.2), lineWidth: 4)
                                        Circle()
                                            .trim(from: 0, to: CGFloat(score) / 100)
                                            .stroke(Theme.gold, style: StrokeStyle(lineWidth: 4, lineCap: .round))
                                            .rotationEffect(.degrees(-90))
                                        Text("\(score)")
                                            .font(Theme.Font.headline(14))
                                            .foregroundStyle(Theme.goldGradient)
                                    }
                                    .frame(width: 48, height: 48)
                                }
                                .padding(Theme.padMd)
                            }
                        }

                        // Description
                        if let desc = property.description {
                            VStack(alignment: .leading, spacing: 8) {
                                Text("About this property")
                                    .font(Theme.Font.headline(16))
                                    .foregroundColor(Theme.textPrimary)
                                Text(desc)
                                    .font(Theme.Font.body(14))
                                    .foregroundColor(Theme.textSecondary)
                                    .lineSpacing(4)
                            }
                        }

                        // Broker
                        if let brokerName = property.brokerName {
                            CardView {
                                HStack(spacing: 14) {
                                    ZStack {
                                        Circle()
                                            .fill(Theme.goldDim)
                                            .frame(width: 48, height: 48)
                                        Image(systemName: "person.fill")
                                            .foregroundColor(Theme.gold)
                                    }

                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(brokerName)
                                            .font(Theme.Font.headline(15))
                                            .foregroundColor(Theme.textPrimary)
                                        Text("Verified Broker")
                                            .font(Theme.Font.caption(12))
                                            .foregroundColor(Theme.gold)
                                    }

                                    Spacer()

                                    Button {
                                        if state.isAuthenticated {
                                            showContactSheet = true
                                        } else {
                                            showAuthSheet = true
                                        }
                                    } label: {
                                        Image(systemName: "phone.fill")
                                            .foregroundColor(.black)
                                            .padding(12)
                                            .background(Theme.gold)
                                            .clipShape(Circle())
                                    }
                                }
                                .padding(Theme.padMd)
                            }
                        }

                        // CTA
                        VStack(spacing: 10) {
                            GoldButton(title: "Request Viewing") {
                                if state.isAuthenticated {
                                    showContactSheet = true
                                } else {
                                    showAuthSheet = true
                                }
                            }
                            GoldOutlineButton(title: "Add to Portfolio") {
                                if state.isAuthenticated {
                                    addToPortfolio()
                                } else {
                                    showAuthSheet = true
                                }
                            }
                        }
                    }
                    .padding(Theme.padMd)
                }
            }

            // Back button
            Button {
                state.screen = .swipe
            } label: {
                Image(systemName: "chevron.left")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.white)
                    .padding(12)
                    .background(.ultraThinMaterial)
                    .clipShape(Circle())
            }
            .padding(.top, 56)
            .padding(.leading, 16)
        }
        .sheet(isPresented: $showContactSheet) {
            ContactSheet(property: property)
                .presentationDetents([.medium])
        }
        .sheet(isPresented: $showAuthSheet) {
            AuthView().environment(state)
        }
    }

    private func addToPortfolio() {
        guard let userId = state.userId else { return }
        Task {
            try? await SupabaseService.shared.addToPortfolio(
                userId: userId,
                propertyId: property.id,
                purchasePrice: property.price
            )
        }
    }

    private func formatPrice(_ price: Double) -> String {
        if price >= 1_000_000 {
            return String(format: "AED %.2fM", price / 1_000_000)
        }
        return String(format: "AED %.0fK", price / 1_000)
    }
}

private struct DetailStat: View {
    let icon: String
    let value: String
    let label: String

    var body: some View {
        VStack(spacing: 4) {
            Image(systemName: icon)
                .font(.system(size: 16))
                .foregroundStyle(Theme.goldGradient)
            Text(value)
                .font(Theme.Font.headline(18))
                .foregroundColor(Theme.textPrimary)
            Text(label)
                .font(Theme.Font.caption(11))
                .foregroundColor(Theme.textMuted)
        }
        .frame(maxWidth: .infinity)
    }
}

private struct PropertyHeroPlaceholder: View {
    var body: some View {
        ZStack {
            LinearGradient(colors: [Color(hex: "#1A1A2E"), Color(hex: "#0D0D1A")], startPoint: .topLeading, endPoint: .bottomTrailing)
            Image(systemName: "building.2.fill")
                .font(.system(size: 64))
                .foregroundStyle(Theme.goldGradient)
        }
    }
}

private struct ContactSheet: View {
    let property: Property
    @Environment(\.dismiss) var dismiss

    var body: some View {
        ZStack {
            Theme.card.ignoresSafeArea()

            VStack(spacing: 24) {
                RoundedRectangle(cornerRadius: 2)
                    .fill(Theme.textMuted)
                    .frame(width: 40, height: 4)
                    .padding(.top, 12)

                Text("Contact Broker")
                    .font(Theme.Font.headline(20))
                    .foregroundColor(Theme.textPrimary)

                if let name = property.brokerName {
                    VStack(spacing: 4) {
                        Text(name)
                            .font(Theme.Font.headline(18))
                            .foregroundColor(Theme.gold)
                        Text("Verified Agent")
                            .font(Theme.Font.body(13))
                            .foregroundColor(Theme.textMuted)
                    }
                }

                VStack(spacing: 12) {
                    if let phone = property.brokerPhone {
                        Button {
                            if let url = URL(string: "tel:\(phone)") {
                                UIApplication.shared.open(url)
                            }
                        } label: {
                            HStack {
                                Image(systemName: "phone.fill")
                                Text("Call Now")
                            }
                            .font(Theme.Font.headline(16))
                            .foregroundColor(.black)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(Theme.gold)
                            .cornerRadius(Theme.radiusMd)
                        }
                    }

                    Button { dismiss() } label: {
                        Text("Close")
                            .font(Theme.Font.body(15))
                            .foregroundColor(Theme.textSecondary)
                    }
                }
                .padding(.horizontal, Theme.padMd)

                Spacer()
            }
        }
    }
}
