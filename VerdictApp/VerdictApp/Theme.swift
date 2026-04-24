import SwiftUI

enum Theme {
    // Backgrounds
    static let bg = Color(hex: "#07070F")
    static let card = Color(hex: "#13131E")
    static let cardBorder = Color(hex: "#1E1E2E")
    static let surface = Color(hex: "#0D0D1A")

    // Accents
    static let gold = Color(hex: "#C9A84C")
    static let goldLight = Color(hex: "#E8C96A")
    static let goldDim = Color(hex: "#C9A84C").opacity(0.15)

    // Text
    static let textPrimary = Color.white
    static let textSecondary = Color(hex: "#8888AA")
    static let textMuted = Color(hex: "#55556A")

    // Status
    static let success = Color(hex: "#22C55E")
    static let error = Color(hex: "#EF4444")
    static let warning = Color(hex: "#F59E0B")

    // Gradients
    static let goldGradient = LinearGradient(
        colors: [Color(hex: "#C9A84C"), Color(hex: "#E8C96A")],
        startPoint: .leading,
        endPoint: .trailing
    )
    static let bgGradient = LinearGradient(
        colors: [Color(hex: "#07070F"), Color(hex: "#0D0D1A")],
        startPoint: .top,
        endPoint: .bottom
    )
    static let cardGradient = LinearGradient(
        colors: [Color(hex: "#13131E"), Color(hex: "#1A1A2A")],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    // Typography
    enum Font {
        static func display(_ size: CGFloat) -> SwiftUI.Font { .system(size: size, weight: .black, design: .default) }
        static func headline(_ size: CGFloat) -> SwiftUI.Font { .system(size: size, weight: .bold) }
        static func body(_ size: CGFloat) -> SwiftUI.Font { .system(size: size, weight: .regular) }
        static func caption(_ size: CGFloat) -> SwiftUI.Font { .system(size: size, weight: .medium) }
    }

    // Spacing
    static let padSm: CGFloat = 8
    static let padMd: CGFloat = 16
    static let padLg: CGFloat = 24
    static let padXl: CGFloat = 32

    // Radius
    static let radiusSm: CGFloat = 8
    static let radiusMd: CGFloat = 16
    static let radiusLg: CGFloat = 24
    static let radiusXl: CGFloat = 32
}

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3:
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6:
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(.sRGB, red: Double(r)/255, green: Double(g)/255, blue: Double(b)/255, opacity: Double(a)/255)
    }
}

struct GoldButton: View {
    let title: String
    let action: () -> Void
    var isLoading: Bool = false
    var isDisabled: Bool = false

    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                if isLoading {
                    ProgressView()
                        .tint(.black)
                        .scaleEffect(0.8)
                }
                Text(title)
                    .font(Theme.Font.headline(16))
                    .foregroundColor(.black)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(isDisabled ? Theme.gold.opacity(0.4) : Theme.gold)
            .cornerRadius(Theme.radiusMd)
        }
        .disabled(isDisabled || isLoading)
    }
}

struct GoldOutlineButton: View {
    let title: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(Theme.Font.headline(16))
                .foregroundColor(Theme.gold)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(Theme.goldDim)
                .cornerRadius(Theme.radiusMd)
                .overlay(RoundedRectangle(cornerRadius: Theme.radiusMd).stroke(Theme.gold.opacity(0.4), lineWidth: 1))
        }
    }
}

struct CardView<Content: View>: View {
    @ViewBuilder let content: () -> Content

    var body: some View {
        content()
            .background(Theme.card)
            .cornerRadius(Theme.radiusMd)
            .overlay(RoundedRectangle(cornerRadius: Theme.radiusMd).stroke(Theme.cardBorder, lineWidth: 1))
    }
}

struct TierBadge: View {
    let tier: String

    var color: Color {
        switch tier {
        case "Platinum": return Color(hex: "#E5E5E5")
        case "Gold": return Theme.gold
        case "Silver": return Color(hex: "#9CA3AF")
        default: return Color(hex: "#CD7F32")
        }
    }

    var body: some View {
        Text(tier)
            .font(Theme.Font.caption(12))
            .foregroundColor(color)
            .padding(.horizontal, 10)
            .padding(.vertical, 4)
            .background(color.opacity(0.15))
            .cornerRadius(Theme.radiusSm)
            .overlay(RoundedRectangle(cornerRadius: Theme.radiusSm).stroke(color.opacity(0.4), lineWidth: 1))
    }
}
