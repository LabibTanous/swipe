import SwiftUI

struct AuthView: View {
    @Environment(AppState.self) private var state
    @Environment(\.dismiss) var dismiss

    @State private var email = ""
    @State private var password = ""
    @State private var isSignUp = false
    @State private var isLoading = false
    @State private var errorMessage: String?

    var body: some View {
        ZStack {
            Theme.bg.ignoresSafeArea()

            VStack(spacing: 0) {
                // Handle
                RoundedRectangle(cornerRadius: 2)
                    .fill(Theme.textMuted.opacity(0.4))
                    .frame(width: 40, height: 4)
                    .padding(.top, 12)
                    .padding(.bottom, 24)

                ScrollView {
                    VStack(spacing: 32) {
                        // Header
                        VStack(spacing: 8) {
                            Text(isSignUp ? "Create Account" : "Welcome Back")
                                .font(Theme.Font.display(28))
                                .foregroundColor(Theme.textPrimary)
                            Text(isSignUp
                                ? "Join Verdict to save properties and track your portfolio"
                                : "Sign in to access your saved properties and leads")
                                .font(Theme.Font.body(14))
                                .foregroundColor(Theme.textSecondary)
                                .multilineTextAlignment(.center)
                                .padding(.horizontal, 24)
                        }

                        // Fields
                        VStack(spacing: 14) {
                            AuthField(
                                icon: "envelope.fill",
                                placeholder: "Email address",
                                text: $email,
                                keyboardType: .emailAddress
                            )

                            AuthField(
                                icon: "lock.fill",
                                placeholder: "Password",
                                text: $password,
                                isSecure: true
                            )
                        }
                        .padding(.horizontal, Theme.padMd)

                        // Error
                        if let error = errorMessage {
                            HStack(spacing: 8) {
                                Image(systemName: "exclamationmark.circle.fill")
                                    .foregroundColor(Theme.error)
                                Text(error)
                                    .font(Theme.Font.body(13))
                                    .foregroundColor(Theme.error)
                            }
                            .padding(Theme.padMd)
                            .background(Theme.error.opacity(0.1))
                            .cornerRadius(Theme.radiusSm)
                            .padding(.horizontal, Theme.padMd)
                        }

                        // CTA
                        VStack(spacing: 12) {
                            GoldButton(
                                title: isSignUp ? "Create Account" : "Sign In",
                                isLoading: isLoading,
                                isDisabled: email.isEmpty || password.count < 6
                            ) {
                                authenticate()
                            }
                            .padding(.horizontal, Theme.padMd)

                            Button {
                                withAnimation { isSignUp.toggle() }
                                errorMessage = nil
                            } label: {
                                Text(isSignUp ? "Already have an account? Sign in" : "New to Verdict? Create account")
                                    .font(Theme.Font.body(14))
                                    .foregroundColor(Theme.textSecondary)
                            }
                        }

                        // Continue without auth
                        Button {
                            dismiss()
                        } label: {
                            Text("Continue without signing in")
                                .font(Theme.Font.body(13))
                                .foregroundColor(Theme.textMuted)
                                .underline()
                        }
                    }
                    .padding(.bottom, 40)
                }
            }
        }
    }

    private func authenticate() {
        isLoading = true
        errorMessage = nil

        Task {
            do {
                let result: (userId: String, token: String)
                if isSignUp {
                    result = try await SupabaseService.shared.signUp(email: email, password: password)
                } else {
                    result = try await SupabaseService.shared.signIn(email: email, password: password)
                }

                await MainActor.run {
                    state.userId = result.userId
                    state.userEmail = email
                    state.authToken = result.token
                    state.isAuthenticated = true
                    isLoading = false
                    dismiss()
                }
            } catch {
                await MainActor.run {
                    errorMessage = error.localizedDescription
                    isLoading = false
                }
            }
        }
    }
}

private struct AuthField: View {
    let icon: String
    let placeholder: String
    @Binding var text: String
    var keyboardType: UIKeyboardType = .default
    var isSecure = false

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 16))
                .foregroundColor(Theme.textMuted)
                .frame(width: 20)

            if isSecure {
                SecureField(placeholder, text: $text)
                    .font(Theme.Font.body(15))
                    .foregroundColor(Theme.textPrimary)
                    .tint(Theme.gold)
            } else {
                TextField(placeholder, text: $text)
                    .font(Theme.Font.body(15))
                    .foregroundColor(Theme.textPrimary)
                    .keyboardType(keyboardType)
                    .autocapitalization(.none)
                    .tint(Theme.gold)
            }
        }
        .padding(Theme.padMd)
        .background(Theme.card)
        .cornerRadius(Theme.radiusMd)
        .overlay(RoundedRectangle(cornerRadius: Theme.radiusMd).stroke(Theme.cardBorder, lineWidth: 1))
    }
}
