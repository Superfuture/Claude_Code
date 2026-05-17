import Foundation

struct Ritual: Codable, Equatable, Identifiable {
    var id: UUID = UUID()
    let title: String
    let intro: String
    let steps: [Step]
    let close: String
    let context: RitualContext?
    var generatedAt: Date = .now
    var completedSteps: Set<Int> = []

    struct Step: Codable, Equatable {
        let kind: Kind
        let text: String

        enum Kind: String, Codable {
            case affirmation, visualization, action

            var label: String {
                switch self {
                case .affirmation: return "Affirmation"
                case .visualization: return "Visualization"
                case .action: return "Today's Action"
                }
            }
        }
    }

    var isComplete: Bool {
        completedSteps.count == steps.count
    }
}

struct RitualContext: Codable, Equatable {
    let date: String
    let weekday: String
    let season: Season
    let moon: Moon
    let mercuryRetrograde: Bool
    let planetOfDay: String

    struct Season: Codable, Equatable {
        let name: String
        let element: String
        let quality: String
    }

    struct Moon: Codable, Equatable {
        let name: String
        let illumination: Double
    }
}
