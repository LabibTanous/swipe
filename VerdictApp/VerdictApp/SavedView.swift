import SwiftUI

struct SavedView: View {
    @Environment(AppState.self) private var state

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

                    Text("Saved Properties")
                        .font(Theme.Font.headline(20))
                        .foregroundColor(Theme.textPrimary)

                    Spacer()

                    Text("\(state.savedProperties.count)")
                        .font(Theme.Font.caption(13))
                        .foregroundColor(Theme.gold)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 4)
                        .background(Theme.goldDim)
                        .cornerRadius(Theme.radiusSm)
                }
                .padding(.horizontal, Theme.padMd)
                .padding(.vertical, 12)

                if state.savedProperties.isEmpty {
                    Spacer()
                    VStack(spacing: 16) {
                        Image(systemName: "heart.circle.fill")
                            .font(.system(size: 64))
                            .foregroundStyle(Theme.goldGradient)

                        Text("No saved properties")
                            .font(Theme.Font.headline(22))
                            .foregroundColor(Theme.textPrimary)

                        Text("Swipe right on properties you like to save them here.")
                            .font(Theme.Font.body(14))
                            .foregroundColor(Theme.textSecondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 40)

                        GoldButton(title: "Browse Properties") {
                            state.screen = .swipe
                        }
                        .padding(.horizontal, 40)
                    }
                    Spacer()
                } else {
                    ScrollView {
                        LazyVStack(spacing: 12) {
                            ForEach(state.savedProperties) { property in
                                SavedPropertyRow(property: property)
                                    .onTapGesture {
                                        state.screen = .propertyDetail(property)
                                    }
                            }
                        }
                        .padding(.horizontal, Theme.padMd)
                        .padding(.vertical, Theme.padSm)
                    }
                }
            }
        }
    }
}

private struct SavedPropertyRow: View {
    @Environment(AppState.self) private var state
    let property: Property

    var body: some View {
        CardView {
            HStack(spacing: 14) {
                // Thumbnail
                ZStack {
                    if let url = property.imageUrl, let imageURL = URL(string: url) {
                        AsyncImage(url: imageURL) { phase in
                            switch phase {
                            case .success(let img):
                                img.resizable().aspectRatio(contentMode: .fill)
                            default:
                                SavedPlaceholder()
                            }
                        }
                    } else {
                        SavedPlaceholder()
                    }
                }
                .frame(width: 80, height: 80)
                .clipShape(RoundedRectangle(cornerRadius: Theme.radiusSm))

                // Info
                VStack(alignment: .leading, spacing: 6) {
                    Text(property.title)
                        .font(Theme.Font.headline(15))
                        .foregroundColor(Theme.textPrimary)
                        .lineLimit(2)

                    HStack(spacing: 4) {
                        Image(systemName: "mappin.fill")
                            .font(.system(size: 10))
                            .foregroundColor(Theme.gold)
                        Text(property.location)
                            .font(Theme.Font.caption(12))
                            .foregroundColor(Theme.textSecondary)
                    }

                    Text(formatPrice(property.price))
                        .font(Theme.Font.headline(16))
                        .foregroundStyle(Theme.goldGradient)

                    HStack(spacing: 10) {
                        SavedStat(icon: "bed.double.fill", value: "\(property.bedrooms)")
                        SavedStat(icon: "shower.fill", value: "\(property.bathrooms)")
                        SavedStat(icon: "square.fill", value: "\(Int(property.area)) sqft")
                    }
                }

                Spacer()

                // Remove button
                Button {
                    withAnimation { state.unsaveProperty(property) }
                } label: {
                    Image(systemName: "heart.fill")
                        .font(.system(size: 18))
                        .foregroundColor(Theme.gold)
                        .padding(8)
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

private struct SavedStat: View {
    let icon: String
    let value: String

    var body: some View {
        HStack(spacing: 3) {
            Image(systemName: icon)
                .font(.system(size: 9))
                .foregroundColor(Theme.textMuted)
            Text(value)
                .font(Theme.Font.caption(10))
                .foregroundColor(Theme.textMuted)
        }
    }
}

private struct SavedPlaceholder: View {
    var body: some View {
        ZStack {
            Theme.goldDim
            Image(systemName: "building.fill")
                .font(.system(size: 24))
                .foregroundStyle(Theme.goldGradient)
        }
    }
}
