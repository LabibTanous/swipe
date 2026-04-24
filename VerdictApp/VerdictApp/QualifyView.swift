import SwiftUI

struct QualifyView: View {
    @Environment(AppState.self) private var state
    @State private var step = 0
    @State private var animating = false

    let totalSteps = 6

    var body: some View {
        ZStack {
            Theme.bg.ignoresSafeArea()

            VStack(spacing: 0) {
                // Header
                HStack {
                    Button {
                        if step > 0 { step -= 1 } else { state.screen = .onboarding }
                    } label: {
                        Image(systemName: "chevron.left")
                            .foregroundColor(Theme.textSecondary)
                            .padding(12)
                            .background(Theme.card)
                            .clipShape(Circle())
                    }

                    Spacer()

                    Text("Step \(step + 1) of \(totalSteps)")
                        .font(Theme.Font.caption(13))
                        .foregroundColor(Theme.textMuted)
                }
                .padding(.horizontal, Theme.padMd)
                .padding(.top, 8)

                // Progress bar
                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 2)
                            .fill(Theme.card)
                            .frame(height: 3)

                        RoundedRectangle(cornerRadius: 2)
                            .fill(Theme.gold)
                            .frame(width: geo.size.width * CGFloat(step + 1) / CGFloat(totalSteps), height: 3)
                            .animation(.spring(response: 0.4), value: step)
                    }
                }
                .frame(height: 3)
                .padding(.horizontal, Theme.padMd)
                .padding(.top, 12)

                // Step content
                Group {
                    switch step {
                    case 0: IntentStep()
                    case 1: BudgetStep()
                    case 2: FinanceStep()
                    case 3: CategoryStep()
                    case 4: LocationStep()
                    case 5: TimelineStep(onSubmit: submitQualification)
                    default: EmptyView()
                    }
                }
                .transition(.asymmetric(
                    insertion: .move(edge: .trailing).combined(with: .opacity),
                    removal: .move(edge: .leading).combined(with: .opacity)
                ))
                .id(step)
                .padding(.top, 24)
            }
        }
        .environment(state)
    }

    private func submitQualification() {
        let service = MatchingService.shared
        let (score, tier) = service.calculateQualificationScore(profile: state.profile)
        state.qualificationResult = QualificationResult(
            score: score, tier: tier, leadId: "", buyerProfileId: ""
        )
        withAnimation { state.screen = .thinking }
    }
}

// MARK: - Step Views

private struct IntentStep: View {
    @Environment(AppState.self) private var state

    let options = [
        ("Buy", "buy", "house.fill"),
        ("Rent", "rent", "key.fill"),
        ("Invest", "invest", "chart.line.uptrend.xyaxis"),
    ]

    var body: some View {
        @Bindable var s = state
        StepContainer(title: "What are you looking to do?", subtitle: "We'll tailor properties to your goal") {
            VStack(spacing: 12) {
                ForEach(options, id: \.0) { option in
                    OptionRow(
                        icon: option.2,
                        label: option.0,
                        isSelected: state.profile.intent == option.1
                    ) {
                        s.profile.intent = option.1
                    }
                }
            }

            Spacer()

            GoldButton(title: "Continue", isDisabled: false) {
                withAnimation(.spring()) { }
            }
        }
    }
}

private struct BudgetStep: View {
    @Environment(AppState.self) private var state
    @State private var budgetText = ""

    let presets: [Double] = [500_000, 1_000_000, 2_000_000, 5_000_000]

    var body: some View {
        @Bindable var s = state
        StepContainer(title: "What's your budget?", subtitle: "In AED — we'll find matches within 30%") {
            // Input
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("AED")
                        .font(Theme.Font.headline(16))
                        .foregroundColor(Theme.textMuted)
                    TextField("1,500,000", text: $budgetText)
                        .font(Theme.Font.display(32))
                        .foregroundColor(Theme.textPrimary)
                        .keyboardType(.numberPad)
                        .onChange(of: budgetText) { _, new in
                            let digits = new.filter { $0.isNumber }
                            s.profile.budget = Double(digits) ?? 0
                        }
                }
                .padding(Theme.padMd)
                .background(Theme.card)
                .cornerRadius(Theme.radiusMd)
                .overlay(RoundedRectangle(cornerRadius: Theme.radiusMd).stroke(Theme.gold.opacity(0.3), lineWidth: 1))
            }

            // Presets
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                ForEach(presets, id: \.self) { preset in
                    Button {
                        s.profile.budget = preset
                        budgetText = String(Int(preset))
                    } label: {
                        Text(formatBudget(preset))
                            .font(Theme.Font.caption(13))
                            .foregroundColor(state.profile.budget == preset ? .black : Theme.gold)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                            .background(state.profile.budget == preset ? Theme.gold : Theme.goldDim)
                            .cornerRadius(Theme.radiusSm)
                    }
                }
            }

            Spacer()

            GoldButton(title: "Continue", isDisabled: state.profile.budget <= 0) { }
        }
    }

    private func formatBudget(_ value: Double) -> String {
        if value >= 1_000_000 {
            return "AED \(Int(value / 1_000_000))M"
        }
        return "AED \(Int(value / 1_000))K"
    }
}

private struct FinanceStep: View {
    @Environment(AppState.self) private var state

    let options = [
        ("Cash", "cash", "banknote.fill", "Full payment, strongest offer"),
        ("1 Cheque", "1chq", "doc.text.fill", "Single post-dated cheque"),
        ("Mortgage", "mortgage", "building.columns.fill", "Bank-financed purchase"),
        ("4 Cheques", "4chq", "doc.on.doc.fill", "Quarterly payments"),
    ]

    var body: some View {
        @Bindable var s = state
        StepContainer(title: "How will you finance?", subtitle: "Finance type affects your buyer tier") {
            VStack(spacing: 10) {
                ForEach(options, id: \.0) { opt in
                    OptionRow(
                        icon: opt.2,
                        label: opt.0,
                        subtitle: opt.3,
                        isSelected: state.profile.financeType == opt.1
                    ) {
                        s.profile.financeType = opt.1
                    }
                }
            }

            Spacer()

            GoldButton(title: "Continue", isDisabled: state.profile.financeType.isEmpty) { }
        }
    }
}

private struct CategoryStep: View {
    @Environment(AppState.self) private var state

    let categories = [
        ("Residential", "residential", "house.fill"),
        ("Commercial", "commercial", "building.2.fill"),
        ("Off-Plan", "off-plan", "building.columns.fill"),
        ("Land", "land", "map.fill"),
    ]

    let propertyTypes = ["Apartment", "Villa", "Townhouse", "Penthouse", "Studio"]

    var body: some View {
        @Bindable var s = state
        StepContainer(title: "Property type?", subtitle: "Select all that apply") {
            VStack(alignment: .leading, spacing: 20) {
                // Category
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                    ForEach(categories, id: \.0) { cat in
                        CategoryCard(
                            icon: cat.2,
                            label: cat.0,
                            isSelected: state.profile.category == cat.1
                        ) {
                            s.profile.category = cat.1
                        }
                    }
                }

                // Sub-type
                Text("Sub-type")
                    .font(Theme.Font.caption(13))
                    .foregroundColor(Theme.textMuted)

                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(propertyTypes, id: \.self) { type in
                            Button {
                                s.profile.propertyType = type.lowercased()
                            } label: {
                                Text(type)
                                    .font(Theme.Font.caption(13))
                                    .foregroundColor(state.profile.propertyType == type.lowercased() ? .black : Theme.textSecondary)
                                    .padding(.horizontal, 16)
                                    .padding(.vertical, 8)
                                    .background(state.profile.propertyType == type.lowercased() ? Theme.gold : Theme.card)
                                    .cornerRadius(Theme.radiusSm)
                            }
                        }
                    }
                }

                // Bedrooms
                Text("Bedrooms")
                    .font(Theme.Font.caption(13))
                    .foregroundColor(Theme.textMuted)

                HStack(spacing: 8) {
                    ForEach([1, 2, 3, 4, 5], id: \.self) { beds in
                        Button {
                            s.profile.bedrooms = beds
                        } label: {
                            Text(beds == 5 ? "5+" : "\(beds)")
                                .font(Theme.Font.headline(15))
                                .foregroundColor(state.profile.bedrooms == beds ? .black : Theme.textSecondary)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 10)
                                .background(state.profile.bedrooms == beds ? Theme.gold : Theme.card)
                                .cornerRadius(Theme.radiusSm)
                        }
                    }
                }
            }

            Spacer()

            GoldButton(title: "Continue") { }
        }
    }
}

private struct LocationStep: View {
    @Environment(AppState.self) private var state

    let locations = [
        "Dubai Marina", "Downtown Dubai", "Palm Jumeirah",
        "Business Bay", "JVC", "Jumeirah", "DIFC", "Dubai Hills",
    ]

    var body: some View {
        @Bindable var s = state
        StepContainer(title: "Preferred location?", subtitle: "Choose your target area in Dubai") {
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                ForEach(locations, id: \.self) { loc in
                    Button {
                        s.profile.location = loc
                    } label: {
                        Text(loc)
                            .font(Theme.Font.caption(13))
                            .foregroundColor(state.profile.location == loc ? .black : Theme.textSecondary)
                            .multilineTextAlignment(.center)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(state.profile.location == loc ? Theme.gold : Theme.card)
                            .cornerRadius(Theme.radiusMd)
                            .overlay(RoundedRectangle(cornerRadius: Theme.radiusMd).stroke(Theme.cardBorder, lineWidth: 1))
                    }
                }
            }

            Spacer()

            GoldButton(title: "Continue", isDisabled: state.profile.location.isEmpty) { }
        }
    }
}

private struct TimelineStep: View {
    @Environment(AppState.self) private var state
    let onSubmit: () -> Void

    let options = [
        ("Immediately", "immediate", "bolt.fill"),
        ("Within 3 months", "3months", "calendar"),
        ("6-12 months", "6months", "clock.fill"),
        ("Just exploring", "exploring", "binoculars.fill"),
    ]

    var body: some View {
        @Bindable var s = state
        StepContainer(title: "When do you need to move?", subtitle: "Urgency affects matching priority") {
            VStack(spacing: 10) {
                ForEach(options, id: \.0) { opt in
                    OptionRow(
                        icon: opt.2,
                        label: opt.0,
                        isSelected: state.profile.moveInTimeline == opt.1
                    ) {
                        s.profile.moveInTimeline = opt.1
                    }
                }
            }

            Spacer()

            GoldButton(title: "See My Matches") {
                onSubmit()
            }
        }
    }
}

// MARK: - Shared components

private struct StepContainer<Content: View>: View {
    let title: String
    let subtitle: String
    @ViewBuilder let content: () -> Content

    var body: some View {
        VStack(alignment: .leading, spacing: 24) {
            VStack(alignment: .leading, spacing: 6) {
                Text(title)
                    .font(Theme.Font.display(26))
                    .foregroundColor(Theme.textPrimary)
                Text(subtitle)
                    .font(Theme.Font.body(14))
                    .foregroundColor(Theme.textSecondary)
            }
            .padding(.horizontal, Theme.padMd)

            content()
                .padding(.horizontal, Theme.padMd)
        }
    }
}

private struct OptionRow: View {
    let icon: String
    let label: String
    var subtitle: String? = nil
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 14) {
                Image(systemName: icon)
                    .font(.system(size: 18, weight: .medium))
                    .foregroundColor(isSelected ? .black : Theme.gold)
                    .frame(width: 44, height: 44)
                    .background(isSelected ? Theme.gold : Theme.goldDim)
                    .clipShape(Circle())

                VStack(alignment: .leading, spacing: 2) {
                    Text(label)
                        .font(Theme.Font.headline(15))
                        .foregroundColor(isSelected ? Theme.gold : Theme.textPrimary)
                    if let subtitle {
                        Text(subtitle)
                            .font(Theme.Font.body(12))
                            .foregroundColor(Theme.textMuted)
                    }
                }

                Spacer()

                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(Theme.gold)
                }
            }
            .padding(Theme.padMd)
            .background(isSelected ? Theme.goldDim : Theme.card)
            .cornerRadius(Theme.radiusMd)
            .overlay(RoundedRectangle(cornerRadius: Theme.radiusMd).stroke(isSelected ? Theme.gold.opacity(0.4) : Theme.cardBorder, lineWidth: 1))
        }
    }
}

private struct CategoryCard: View {
    let icon: String
    let label: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 10) {
                Image(systemName: icon)
                    .font(.system(size: 24))
                    .foregroundColor(isSelected ? .black : Theme.gold)

                Text(label)
                    .font(Theme.Font.caption(13))
                    .foregroundColor(isSelected ? .black : Theme.textSecondary)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 20)
            .background(isSelected ? Theme.gold : Theme.card)
            .cornerRadius(Theme.radiusMd)
            .overlay(RoundedRectangle(cornerRadius: Theme.radiusMd).stroke(isSelected ? .clear : Theme.cardBorder, lineWidth: 1))
        }
    }
}
