import Foundation
import Observation

@Observable
final class AppState {
    var screen: AppScreen = .onboarding
    var profile = BuyerProfile()
    var qualificationResult: QualificationResult?
    var properties: [Property] = []
    var savedIds: Set<String> = []
    var currentIndex: Int = 0
    var isLoading: Bool = false
    var errorMessage: String?
    var userId: String?
    var userEmail: String?
    var authToken: String?
    var isAuthenticated: Bool = false

    var currentProperty: Property? {
        guard currentIndex < properties.count else { return nil }
        return properties[currentIndex]
    }

    var tier: String { qualificationResult?.tier ?? "Bronze" }
    var score: Int { qualificationResult?.score ?? 0 }

    func saveProperty(_ property: Property) {
        savedIds.insert(property.id)
    }

    func unsaveProperty(_ property: Property) {
        savedIds.remove(property.id)
    }

    func isSaved(_ property: Property) -> Bool {
        savedIds.contains(property.id)
    }

    func nextProperty() {
        if currentIndex < properties.count - 1 {
            currentIndex += 1
        }
    }

    func resetToQualify() {
        profile = BuyerProfile()
        qualificationResult = nil
        properties = []
        currentIndex = 0
        screen = .qualify
    }

    func signOut() {
        userId = nil
        userEmail = nil
        authToken = nil
        isAuthenticated = false
        screen = .onboarding
    }

    var savedProperties: [Property] {
        properties.filter { savedIds.contains($0.id) }
    }
}
