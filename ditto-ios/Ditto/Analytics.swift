import Foundation

/// First-party analytics. Fire-and-forget events to the Superfuture Command
/// Center, keyed by a per-install anonymous id. No PII, no third-party SDK.
/// Skipped in DEBUG so simulator / dev runs never pollute the numbers.
enum Analytics {
    static let endpoint = "https://superfuture-metrics.pages.dev/api/ingest"
    static let appName = "Ditto"

    static var anonID: String {
        let key = "ditto.anonID"
        if let id = UserDefaults.standard.string(forKey: key) { return id }
        let id = UUID().uuidString
        UserDefaults.standard.set(id, forKey: key)
        return id
    }

    static func track(_ event: String, _ props: [String: String] = [:]) {
        #if DEBUG
        return
        #else
        guard let url = URL(string: endpoint) else { return }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let payload: [String: Any] = ["app": appName, "event": event, "anonId": anonID, "props": props]
        req.httpBody = try? JSONSerialization.data(withJSONObject: payload)
        URLSession.shared.dataTask(with: req).resume()
        #endif
    }
}
