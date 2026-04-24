import Foundation

struct Property: Identifiable, Codable {
    let id: String
    let title: String
    let location: String
    let price: Double
    let bedrooms: Int
    let bathrooms: Int
    let area: Double
    let imageUrl: String?
    let category: String
    let propertyType: String?
    let description: String?
    let brokerName: String?
    let brokerPhone: String?
    let matchScore: Int?

    enum CodingKeys: String, CodingKey {
        case id, title, location, price, bedrooms, bathrooms, area, category, description
        case imageUrl = "image_url"
        case propertyType = "property_type"
        case brokerName = "broker_name"
        case brokerPhone = "broker_phone"
        case matchScore = "match_score"
    }
}

struct BuyerProfile: Codable {
    var budget: Double = 0
    var intent: String = "buy"
    var financeType: String = "mortgage"
    var category: String = "residential"
    var propertyType: String = "apartment"
    var bedrooms: Int = 2
    var location: String = "Dubai Marina"
    var moveInTimeline: String = "3months"
}

struct QualificationResult: Codable {
    let score: Int
    let tier: String
    let leadId: String
    let buyerProfileId: String
}

struct PortfolioProperty: Identifiable, Codable {
    let id: String
    let propertyId: String
    let purchasePrice: Double
    let currentValue: Double
    let purchaseDate: String
    let property: Property?

    enum CodingKeys: String, CodingKey {
        case id
        case propertyId = "property_id"
        case purchasePrice = "purchase_price"
        case currentValue = "current_value"
        case purchaseDate = "purchase_date"
        case property
    }
}

struct WalletRecord: Identifiable, Codable {
    let id: String
    let amount: Double
    let type: String
    let description: String
    let createdAt: String

    enum CodingKeys: String, CodingKey {
        case id, amount, type, description
        case createdAt = "created_at"
    }
}

struct Lead: Identifiable, Codable {
    let id: String
    let status: String
    let priceToUnlock: Double
    let createdAt: String

    enum CodingKeys: String, CodingKey {
        case id, status
        case priceToUnlock = "price_to_unlock"
        case createdAt = "created_at"
    }
}

enum AppScreen {
    case onboarding
    case qualify
    case thinking
    case swipe
    case propertyDetail(Property)
    case auth
    case broker
    case portfolio
    case saved
}
