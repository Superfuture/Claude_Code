import Foundation

struct BirthData: Codable, Equatable {
    var year: Int
    var month: Int
    var day: Int
    /// Optional birth time in 24h local (improves rising sign accuracy in later phases)
    var hour: Int?
    var minute: Int?
    /// Optional birth location (city, country) — used for ascendant later
    var city: String?

    static let unset = BirthData(year: 0, month: 0, day: 0)
    var isSet: Bool { year > 0 && month > 0 && day > 0 }
}

struct Intention: Codable, Equatable, Identifiable {
    let id: UUID
    var text: String
    var createdAt: Date

    init(id: UUID = UUID(), text: String, createdAt: Date = .now) {
        self.id = id
        self.text = text
        self.createdAt = createdAt
    }
}
