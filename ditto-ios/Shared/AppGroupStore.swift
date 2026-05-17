import Foundation

/// Wraps UserDefaults via the App Group container so the main app and the
/// iMessage extension share state. Update `groupID` if you change your
/// App Group identifier in the Xcode entitlements.
final class AppGroupStore {
    static let shared = AppGroupStore()

    private let groupID = "group.com.yourdomain.ditto"
    private let defaults: UserDefaults

    private enum Key {
        static let deviceID = "ditto.deviceID"
        static let lastTone = "ditto.lastTone"
        static let usageDate = "ditto.usageDate"
        static let usageCount = "ditto.usageCount"
        static let isPro = "ditto.isPro"
        static let feedbackPrefix = "ditto.feedback."
    }

    init() {
        guard let shared = UserDefaults(suiteName: groupID) else {
            preconditionFailure("App Group '\(groupID)' is not configured. Check entitlements.")
        }
        self.defaults = shared
    }

    // MARK: - Device ID (anonymous, for rate limiting)

    var deviceID: String {
        if let existing = defaults.string(forKey: Key.deviceID) {
            return existing
        }
        let new = UUID().uuidString
        defaults.set(new, forKey: Key.deviceID)
        return new
    }

    // MARK: - Tone preference

    var lastTone: Tone {
        get {
            if let raw = defaults.string(forKey: Key.lastTone),
               let tone = Tone(rawValue: raw) {
                return tone
            }
            return .funny
        }
        set { defaults.set(newValue.rawValue, forKey: Key.lastTone) }
    }

    // MARK: - Entitlement (Pro)

    var isPro: Bool {
        get { defaults.bool(forKey: Key.isPro) }
        set { defaults.set(newValue, forKey: Key.isPro) }
    }

    // MARK: - Daily usage counter

    func currentUsage() -> UsageState {
        let today = Self.dayString(for: Date())
        let savedDay = defaults.string(forKey: Key.usageDate)
        let count = (savedDay == today) ? defaults.integer(forKey: Key.usageCount) : 0
        return UsageState(used: count, limit: 5, isPro: isPro)
    }

    func recordUsage() {
        let today = Self.dayString(for: Date())
        let savedDay = defaults.string(forKey: Key.usageDate)
        let next = (savedDay == today) ? defaults.integer(forKey: Key.usageCount) + 1 : 1
        defaults.set(today, forKey: Key.usageDate)
        defaults.set(next, forKey: Key.usageCount)
    }

    private static func dayString(for date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        formatter.timeZone = .current
        return formatter.string(from: date)
    }

    // MARK: - Feedback

    func recordFeedback(id: String, thumbsUp: Bool) {
        defaults.set(thumbsUp, forKey: Key.feedbackPrefix + id)
    }
}
