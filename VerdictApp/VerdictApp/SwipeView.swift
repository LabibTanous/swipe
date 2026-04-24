import SwiftUI

struct SwipeView: View {
    @Environment(AppState.self) private var state
    @State private var showAuth = false
    @State private var selectedTab = 0

    var body: some View {
        ZStack {
            Theme.bg.ignoresSafeArea()

            VStack(spacing: 0) {
                // Top bar
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Your Matches")
                            .font(Theme.Font.headline(20))
                            .foregroundColor(Theme.textPrimary)
                        Text("\(state.properties.count) properties found")
                            .font(Theme.Font.body(12))
                            .foregroundColor(Theme.textMuted)
                    }

                    Spacer()

                    HStack(spacing: 12) {
                        TierBadge(tier: state.tier)

                        Button {
                            if state.isAuthenticated {
                                state.screen = .portfolio
                            } else {
                                showAuth = true
                            }
                        } label: {
                            Image(systemName: "person.crop.circle")
                                .font(.system(size: 22))
                                .foregroundColor(Theme.textSecondary)
                        }
                    }
                }
                .padding(.horizontal, Theme.padMd)
                .padding(.top, 8)
                .padding(.bottom, 12)

                if state.properties.isEmpty {
                    EmptyStateView()
                } else {
                    // Card stack
                    ZStack {
                        ForEach(
                            Array(state.properties.enumerated().reversed().prefix(3)),
                            id: \.element.id
                        ) { index, property in
                            if index >= state.currentIndex {
                                PropertyCard(
                                    property: property,
                                    isTop: index == state.currentIndex,
                                    stackOffset: CGFloat(index - state.currentIndex)
                                )
                            }
                        }
                    }
                    .padding(.horizontal, Theme.padMd)

                    // Action buttons
                    HStack(spacing: 24) {
                        ActionButton(icon: "xmark", color: Theme.error) {
                            withAnimation(.spring()) { state.nextProperty() }
                        }

                        ActionButton(icon: "heart.fill", color: Theme.gold, size: 56) {
                            if let prop = state.currentProperty {
                                state.saveProperty(prop)
                                withAnimation(.spring()) { state.nextProperty() }
                            }
                        }

                        ActionButton(icon: "info.circle", color: Theme.textSecondary) {
                            if let prop = state.currentProperty {
                                state.screen = .propertyDetail(prop)
                            }
                        }
                    }
                    .padding(.top, 20)
                    .padding(.bottom, 12)
                }

                // Bottom tab bar
                BottomTabBar(selectedTab: $selectedTab, showAuth: $showAuth)
            }
        }
        .sheet(isPresented: $showAuth) {
            AuthView()
                .environment(state)
        }
    }
}

// MARK: - Property Card

struct PropertyCard: View {
    @Environment(AppState.self) private var state
    let property: Property
    let isTop: Bool
    let stackOffset: CGFloat

    @State private var dragOffset: CGSize = .zero
    @State private var rotation: Double = 0

    var body: some View {
        ZStack(alignment: .bottomLeading) {
            // Image / placeholder
            ZStack {
                if let url = property.imageUrl, let imageURL = URL(string: url) {
                    AsyncImage(url: imageURL) { phase in
                        switch phase {
                        case .success(let image):
                            image.resizable().aspectRatio(contentMode: .fill)
                        default:
                            PropertyPlaceholder(property: property)
                        }
                    }
                } else {
                    PropertyPlaceholder(property: property)
                }
            }
            .clipped()

            // Gradient overlay
            LinearGradient(
                colors: [.clear, Color.black.opacity(0.85)],
                startPoint: .center,
                endPoint: .bottom
            )

            // Info
            VStack(alignment: .leading, spacing: 8) {
                if let score = property.matchScore {
                    HStack(spacing: 6) {
                        Image(systemName: "bolt.fill")
                            .font(.system(size: 10))
                        Text("\(score)% Match")
                            .font(Theme.Font.caption(12))
                    }
                    .foregroundColor(.black)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 4)
                    .background(Theme.gold)
                    .cornerRadius(Theme.radiusSm)
                }

                Text(property.title)
                    .font(Theme.Font.headline(22))
                    .foregroundColor(.white)
                    .lineLimit(2)

                HStack(spacing: 4) {
                    Image(systemName: "mappin.circle.fill")
                        .font(.system(size: 12))
                        .foregroundColor(Theme.gold)
                    Text(property.location)
                        .font(Theme.Font.body(13))
                        .foregroundColor(.white.opacity(0.8))
                }

                HStack {
                    Text(formatPrice(property.price))
                        .font(Theme.Font.display(24))
                        .foregroundStyle(Theme.goldGradient)

                    Spacer()

                    HStack(spacing: 12) {
                        PropertyStat(icon: "bed.double.fill", value: "\(property.bedrooms)")
                        PropertyStat(icon: "shower.fill", value: "\(property.bathrooms)")
                        PropertyStat(icon: "square.fill", value: "\(Int(property.area))")
                    }
                }
            }
            .padding(Theme.padMd)

            // Swipe indicators
            if isTop {
                HStack {
                    SwipeIndicator(text: "SKIP", color: Theme.error, opacity: dragOffset.width < -20 ? min(1, abs(dragOffset.width) / 100) : 0)
                    Spacer()
                    SwipeIndicator(text: "SAVE", color: Theme.gold, opacity: dragOffset.width > 20 ? min(1, dragOffset.width / 100) : 0)
                }
                .padding(Theme.padMd)
                .frame(maxHeight: .infinity, alignment: .top)
            }
        }
        .frame(maxWidth: .infinity)
        .frame(height: UIScreen.main.bounds.height * 0.55)
        .clipShape(RoundedRectangle(cornerRadius: Theme.radiusLg))
        .offset(x: isTop ? dragOffset.width : stackOffset * -8, y: stackOffset * -8)
        .scaleEffect(isTop ? 1 : max(0.92, 1 - stackOffset * 0.04))
        .rotationEffect(.degrees(isTop ? rotation : 0))
        .shadow(color: .black.opacity(0.4), radius: 12, y: 8)
        .gesture(
            isTop ? DragGesture()
                .onChanged { value in
                    dragOffset = value.translation
                    rotation = Double(value.translation.width / 20)
                }
                .onEnded { value in
                    let threshold: CGFloat = 80
                    if value.translation.width > threshold {
                        swipeRight()
                    } else if value.translation.width < -threshold {
                        swipeLeft()
                    } else {
                        withAnimation(.spring()) {
                            dragOffset = .zero
                            rotation = 0
                        }
                    }
                }
            : nil
        )
        .animation(.spring(response: 0.3), value: dragOffset)
    }

    private func swipeRight() {
        withAnimation(.spring()) {
            dragOffset = CGSize(width: 500, height: 50)
            rotation = 20
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
            state.saveProperty(property)
            state.nextProperty()
            dragOffset = .zero
            rotation = 0
        }
    }

    private func swipeLeft() {
        withAnimation(.spring()) {
            dragOffset = CGSize(width: -500, height: 50)
            rotation = -20
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
            state.nextProperty()
            dragOffset = .zero
            rotation = 0
        }
    }

    private func formatPrice(_ price: Double) -> String {
        if price >= 1_000_000 {
            return String(format: "AED %.1fM", price / 1_000_000)
        }
        return String(format: "AED %.0fK", price / 1_000)
    }
}

private struct PropertyPlaceholder: View {
    let property: Property

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color(hex: "#1A1A2E"), Color(hex: "#0D0D1A")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            VStack(spacing: 12) {
                Image(systemName: "building.2.fill")
                    .font(.system(size: 48))
                    .foregroundStyle(Theme.goldGradient)
                Text(property.category.capitalized)
                    .font(Theme.Font.caption(13))
                    .foregroundColor(Theme.textMuted)
            }
        }
    }
}

private struct PropertyStat: View {
    let icon: String
    let value: String

    var body: some View {
        HStack(spacing: 3) {
            Image(systemName: icon)
                .font(.system(size: 10))
                .foregroundColor(.white.opacity(0.6))
            Text(value)
                .font(Theme.Font.caption(12))
                .foregroundColor(.white.opacity(0.8))
        }
    }
}

private struct SwipeIndicator: View {
    let text: String
    let color: Color
    let opacity: Double

    var body: some View {
        Text(text)
            .font(.system(size: 20, weight: .black))
            .foregroundColor(color)
            .padding(.horizontal, 14)
            .padding(.vertical, 8)
            .background(color.opacity(0.15))
            .cornerRadius(Theme.radiusSm)
            .overlay(RoundedRectangle(cornerRadius: Theme.radiusSm).stroke(color, lineWidth: 2))
            .rotationEffect(.degrees(text == "SKIP" ? -15 : 15))
            .opacity(opacity)
    }
}

private struct ActionButton: View {
    let icon: String
    let color: Color
    var size: CGFloat = 48
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Image(systemName: icon)
                .font(.system(size: size * 0.4, weight: .bold))
                .foregroundColor(color)
                .frame(width: size, height: size)
                .background(color.opacity(0.1))
                .clipShape(Circle())
                .overlay(Circle().stroke(color.opacity(0.3), lineWidth: 1))
        }
    }
}

private struct EmptyStateView: View {
    @Environment(AppState.self) private var state

    var body: some View {
        VStack(spacing: 24) {
            Spacer()
            Image(systemName: "house.circle.fill")
                .font(.system(size: 64))
                .foregroundStyle(Theme.goldGradient)
            VStack(spacing: 8) {
                Text("No Properties Found")
                    .font(Theme.Font.headline(22))
                    .foregroundColor(Theme.textPrimary)
                Text("Try adjusting your budget or location to see more matches.")
                    .font(Theme.Font.body(14))
                    .foregroundColor(Theme.textSecondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 40)
            }
            GoldButton(title: "Refine Search") { state.resetToQualify() }
                .padding(.horizontal, 40)
            Spacer()
        }
    }
}

// MARK: - Bottom Tab Bar

struct BottomTabBar: View {
    @Binding var selectedTab: Int
    @Binding var showAuth: Bool
    @Environment(AppState.self) private var state

    var body: some View {
        HStack(spacing: 0) {
            TabItem(icon: "house.fill", label: "Discover", isSelected: selectedTab == 0) {
                selectedTab = 0
            }

            TabItem(icon: "heart.fill", label: "Saved", isSelected: selectedTab == 1) {
                selectedTab = 1
                state.screen = .saved
            }

            TabItem(icon: "chart.bar.fill", label: "Portfolio", isSelected: selectedTab == 2) {
                if state.isAuthenticated {
                    selectedTab = 2
                    state.screen = .portfolio
                } else {
                    showAuth = true
                }
            }

            TabItem(icon: "person.text.rectangle.fill", label: "Broker", isSelected: selectedTab == 3) {
                selectedTab = 3
                state.screen = .broker
            }
        }
        .padding(.vertical, 8)
        .background(Theme.card)
        .overlay(Rectangle().fill(Theme.cardBorder).frame(height: 1), alignment: .top)
    }
}

private struct TabItem: View {
    let icon: String
    let label: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 4) {
                Image(systemName: icon)
                    .font(.system(size: 20))
                    .foregroundColor(isSelected ? Theme.gold : Theme.textMuted)
                Text(label)
                    .font(Theme.Font.caption(10))
                    .foregroundColor(isSelected ? Theme.gold : Theme.textMuted)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 6)
        }
    }
}
