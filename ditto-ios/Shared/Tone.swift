import Foundation

enum Tone: String, CaseIterable, Identifiable, Codable {
    case funny, flirty, formal, supportive

    var id: String { rawValue }

    var label: String {
        switch self {
        case .funny: return "Funny"
        case .flirty: return "Flirty"
        case .formal: return "Formal"
        case .supportive: return "Supportive"
        }
    }

    var emoji: String {
        switch self {
        case .funny: return "😄"
        case .flirty: return "😏"
        case .formal: return "🎩"
        case .supportive: return "💛"
        }
    }
}

struct Suggestion: Identifiable, Codable, Hashable {
    let id: String
    let text: String
    let tone: Tone

    init(id: String = UUID().uuidString, text: String, tone: Tone) {
        self.id = id
        self.text = text
        self.tone = tone
    }
}

struct UsageState {
    let used: Int
    let limit: Int
    let isPro: Bool

    var canRequest: Bool {
        isPro || used < limit
    }
}
