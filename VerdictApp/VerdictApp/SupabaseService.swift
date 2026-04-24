import Foundation
import Supabase

actor SupabaseService {
    static let shared = SupabaseService()

    private let client = SupabaseClient(
        supabaseURL: URL(string: "https://dwtfcsvmlxoyhljjddlt.supabase.co")!,
        supabaseKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3dGZjc3ZtbHhveWhsampkZGx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MDUxNDYsImV4cCI6MjA5MjI4MTE0Nn0.Np44ZeYoOUeigIc57pCRM6ufbjkvNN3MHl0jx9s050o"
    )

    // MARK: - Auth

    func signUp(email: String, password: String) async throws -> (userId: String, token: String) {
        let response = try await client.auth.signUp(email: email, password: password)
        guard let session = response.session else {
            throw AppError.noSession
        }
        return (session.user.id.uuidString, session.accessToken)
    }

    func signIn(email: String, password: String) async throws -> (userId: String, token: String) {
        let session = try await client.auth.signIn(email: email, password: password)
        return (session.user.id.uuidString, session.accessToken)
    }

    func signOut() async throws {
        try await client.auth.signOut()
    }

    func currentSession() async -> (userId: String, token: String)? {
        guard let session = try? await client.auth.session else { return nil }
        return (session.user.id.uuidString, session.accessToken)
    }

    // MARK: - Properties

    func fetchProperties(budget: Double, location: String) async throws -> [Property] {
        let budgetMin = budget * 0.7
        let budgetMax = budget * 1.3

        let response: [Property] = try await client
            .from("listings")
            .select("id, title, location, price, bedrooms, bathrooms, area, image_url, category, property_type, description, broker_name, broker_phone")
            .gte("price", value: budgetMin)
            .lte("price", value: budgetMax)
            .ilike("location", pattern: "%\(location)%")
            .limit(50)
            .execute()
            .value

        return response
    }

    func fetchAllProperties() async throws -> [Property] {
        let response: [Property] = try await client
            .from("listings")
            .select("id, title, location, price, bedrooms, bathrooms, area, image_url, category, property_type, description, broker_name, broker_phone")
            .limit(50)
            .execute()
            .value

        return response
    }

    // MARK: - Portfolio

    func fetchPortfolio(userId: String) async throws -> [PortfolioProperty] {
        let response: [PortfolioProperty] = try await client
            .from("portfolio")
            .select("id, property_id, purchase_price, current_value, purchase_date")
            .eq("user_id", value: userId)
            .order("purchase_date", ascending: false)
            .execute()
            .value

        return response
    }

    func addToPortfolio(userId: String, propertyId: String, purchasePrice: Double) async throws {
        try await client
            .from("portfolio")
            .insert([
                "user_id": userId,
                "property_id": propertyId,
                "purchase_price": String(purchasePrice),
                "current_value": String(purchasePrice),
                "purchase_date": ISO8601DateFormatter().string(from: Date()),
            ])
            .execute()
    }

    // MARK: - Wallet

    func fetchWallet(userId: String) async throws -> [WalletRecord] {
        let response: [WalletRecord] = try await client
            .from("wallet_transactions")
            .select()
            .eq("user_id", value: userId)
            .order("created_at", ascending: false)
            .limit(20)
            .execute()
            .value

        return response
    }

    // MARK: - Leads

    func fetchLeads(userId: String) async throws -> [Lead] {
        let response: [Lead] = try await client
            .from("leads")
            .select("id, status, price_to_unlock, created_at")
            .execute()
            .value

        return response
    }
}

enum AppError: LocalizedError {
    case noSession
    case networkError(String)
    case authRequired

    var errorDescription: String? {
        switch self {
        case .noSession: return "Sign-up succeeded but no session was returned. Please sign in."
        case .networkError(let msg): return msg
        case .authRequired: return "Please sign in to continue."
        }
    }
}
