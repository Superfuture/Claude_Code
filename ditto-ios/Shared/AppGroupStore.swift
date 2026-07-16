import Foundation

/// Wraps UserDefaults via the App Group container so the main app and the
/// iMessage extension share state. Update `groupID` if you change your
/// App Group identifier in the Xcode entitlements.
final class AppGroupStore {
    static let shared = AppGroupStore()

    private let groupID = "group.com.superfuture.ditto"
    private let defaults: UserDefaults

    private enum Key {
        static let deviceID = "ditto.deviceID"
        static let lastTone = "ditto.lastTone"
        static let usageDate = "ditto.usageDate"
        static let usageCount = "ditto.usageCount"
        static let isPro = "ditto.isPro"
        static let feedbackPrefix = "ditto.feedback."
        static let lastAutoContext = "ditto.lastAutoContext"
        static let smartDefaultApplied = "ditto.smartDefaultApplied"
    }

    init() {
        guard let shared = UserDefaults(suiteName: groupID) else {
            preconditionFailure("App Group '\(groupID)' is not configured. Check entitlements.")
        }
        self.defaults = shared
        // One-time migration: Smart is the new default tone, including for
        // installs that stored the old "funny" default before Smart existed.
        if !defaults.bool(forKey: Key.smartDefaultApplied) {
            defaults.set(Tone.smart.rawValue, forKey: Key.lastTone)
            defaults.set(true, forKey: Key.smartDefaultApplied)
        }
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
            return .smart
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
        return UsageState(used: count, limit: 10, isPro: isPro)
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

    // MARK: - Auto-generate dedupe

    /// The last clipboard text we auto-generated replies for, so reopening
    /// the extension with the same clipboard doesn't burn another daily use.
    var lastAutoContext: String? {
        get { defaults.string(forKey: Key.lastAutoContext) }
        set { defaults.set(newValue, forKey: Key.lastAutoContext) }
    }

    /// The last screenshot asset we auto-generated replies for (same dedupe
    /// idea as lastAutoContext, keyed by PHAsset localIdentifier).
    var lastScreenshotID: String? {
        get { defaults.string(forKey: "ditto.lastScreenshotID") }
        set { defaults.set(newValue, forKey: "ditto.lastScreenshotID") }
    }

    // MARK: - Feedback

    func recordFeedback(id: String, thumbsUp: Bool) {
        defaults.set(thumbsUp, forKey: Key.feedbackPrefix + id)
    }
}
