import Foundation

actor MatchingService {
    static let shared = MatchingService()

    private let baseURL = "https://verdict-rose-kappa.vercel.app"

    func createLead(profile: BuyerProfile, qualificationScore: Int, tier: String, token: String, listingId: String? = nil) async throws -> QualificationResult {
        let url = URL(string: "\(baseURL)/api/leads/create")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body: [String: Any] = [
            "listingId": listingId as Any,
            "profile": [
                "budget": profile.budget,
                "intent": profile.intent,
                "financeType": profile.financeType,
                "category": profile.category,
                "propertyType": profile.propertyType,
            ],
            "qualificationScore": qualificationScore,
            "tier": tier,
        ]

        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
            let msg = String(data: data, encoding: .utf8) ?? "Unknown error"
            throw AppError.networkError("Lead creation failed: \(msg)")
        }

        let json = try JSONSerialization.jsonObject(with: data) as? [String: Any]
        return QualificationResult(
            score: json?["qualificationScore"] as? Int ?? qualificationScore,
            tier: json?["tier"] as? String ?? tier,
            leadId: json?["leadId"] as? String ?? "",
            buyerProfileId: json?["buyerProfileId"] as? String ?? ""
        )
    }

    func fetchMatchedProperties(profile: BuyerProfile, token: String) async throws -> [Property] {
        var components = URLComponents(string: "\(baseURL)/api/match")!
        components.queryItems = [
            URLQueryItem(name: "budget", value: String(profile.budget)),
            URLQueryItem(name: "location", value: profile.location),
            URLQueryItem(name: "intent", value: profile.intent),
            URLQueryItem(name: "category", value: profile.category),
        ]

        guard let url = components.url else { throw AppError.networkError("Invalid URL") }
        var request = URLRequest(url: url)
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

        let (data, response) = try await URLSession.shared.data(for: request)

        if let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode != 200 {
            // Fallback: return empty, let SupabaseService handle direct fetch
            return []
        }

        if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
           let props = json["properties"] as? [[String: Any]] {
            return props.compactMap { dict -> Property? in
                guard let id = dict["id"] as? String,
                      let title = dict["title"] as? String,
                      let location = dict["location"] as? String,
                      let price = dict["price"] as? Double else { return nil }
                return Property(
                    id: id,
                    title: title,
                    location: location,
                    price: price,
                    bedrooms: dict["bedrooms"] as? Int ?? 2,
                    bathrooms: dict["bathrooms"] as? Int ?? 2,
                    area: dict["area"] as? Double ?? 0,
                    imageUrl: dict["image_url"] as? String,
                    category: dict["category"] as? String ?? "residential",
                    propertyType: dict["property_type"] as? String,
                    description: dict["description"] as? String,
                    brokerName: dict["broker_name"] as? String,
                    brokerPhone: dict["broker_phone"] as? String,
                    matchScore: dict["match_score"] as? Int
                )
            }
        }

        return []
    }
}

extension MatchingService {
    func calculateQualificationScore(profile: BuyerProfile) -> (score: Int, tier: String) {
        var score = 40

        // Budget score
        switch profile.budget {
        case 5_000_000...: score += 40
        case 2_000_000..<5_000_000: score += 30
        case 1_000_000..<2_000_000: score += 20
        case 500_000..<1_000_000: score += 10
        default: score += 5
        }

        // Finance type
        if profile.financeType == "cash" || profile.financeType == "1chq" {
            score += 15
        } else if profile.financeType == "mortgage" {
            score += 8
        }

        // Timeline
        switch profile.moveInTimeline {
        case "immediate": score += 5
        case "3months": score += 3
        default: score += 1
        }

        score = min(100, score)

        let tier: String
        switch score {
        case 85...: tier = "Platinum"
        case 70..<85: tier = "Gold"
        case 55..<70: tier = "Silver"
        default: tier = "Bronze"
        }

        return (score, tier)
    }
}
