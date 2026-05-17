import Foundation
import SwiftUI

/// Local persistence for Cusp. Stores birth data, current intention, today's
/// ritual, and ritual history. No App Group required — Cusp is a single app
/// without an extension.
@MainActor
final class Store: ObservableObject {
    static let shared = Store()

    @Published var birthData: BirthData {
        didSet { save(birthData, key: Key.birth) }
    }
    @Published var currentIntention: String {
        didSet { defaults.set(currentIntention, forKey: Key.intention) }
    }
    @Published var todaysRitual: Ritual? {
        didSet { save(todaysRitual, key: Key.todaysRitual) }
    }
    @Published var ritualHistory: [Ritual] {
        didSet { save(ritualHistory, key: Key.history) }
    }
    @Published var streak: Int {
        didSet { defaults.set(streak, forKey: Key.streak) }
    }
    @Published var lastCompletionDay: String {
        didSet { defaults.set(lastCompletionDay, forKey: Key.lastCompleted) }
    }
    @Published var isPro: Bool {
        didSet { defaults.set(isPro, forKey: Key.isPro) }
    }

    private let defaults = UserDefaults.standard
    private enum Key {
        static let birth = "cusp.birth"
        static let intention = "cusp.intention"
        static let todaysRitual = "cusp.todaysRitual"
        static let history = "cusp.history"
        static let streak = "cusp.streak"
        static let lastCompleted = "cusp.lastCompleted"
        static let isPro = "cusp.isPro"
        static let deviceID = "cusp.deviceID"
    }

    init() {
        self.birthData = Self.load(BirthData.self, key: Key.birth) ?? .unset
        self.currentIntention = defaults.string(forKey: Key.intention) ?? ""
        self.todaysRitual = Self.load(Ritual.self, key: Key.todaysRitual)
        self.ritualHistory = Self.load([Ritual].self, key: Key.history) ?? []
        self.streak = defaults.integer(forKey: Key.streak)
        self.lastCompletionDay = defaults.string(forKey: Key.lastCompleted) ?? ""
        self.isPro = defaults.bool(forKey: Key.isPro)
    }

    var deviceID: String {
        if let existing = defaults.string(forKey: Key.deviceID) { return existing }
        let new = UUID().uuidString
        defaults.set(new, forKey: Key.deviceID)
        return new
    }

    // MARK: - Ritual lifecycle

    func recordRitualCompletion() {
        let today = Self.dayString(.now)
        if lastCompletionDay == today { return } // already counted
        let yesterday = Self.dayString(Date(timeIntervalSinceNow: -86_400))
        streak = (lastCompletionDay == yesterday) ? streak + 1 : 1
        lastCompletionDay = today
    }

    func archiveTodaysRitual() {
        if let r = todaysRitual {
            ritualHistory.insert(r, at: 0)
            if ritualHistory.count > 100 { ritualHistory = Array(ritualHistory.prefix(100)) }
        }
        todaysRitual = nil
    }

    // MARK: - Coding helpers

    private func save<T: Encodable>(_ value: T, key: String) {
        if let data = try? JSONEncoder().encode(value) {
            defaults.set(data, forKey: key)
        }
    }
    private static func load<T: Decodable>(_ type: T.Type, key: String) -> T? {
        guard let data = UserDefaults.standard.data(forKey: key) else { return nil }
        return try? JSONDecoder().decode(T.self, from: data)
    }
    static func dayString(_ date: Date) -> String {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        f.timeZone = .current
        return f.string(from: date)
    }
}
