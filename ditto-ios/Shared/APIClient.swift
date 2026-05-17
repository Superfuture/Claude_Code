import Foundation

actor APIClient {
    static let shared = APIClient()

    /// Update this after `npx wrangler deploy` prints your Worker URL.
    static let baseURL = URL(string: "https://ditto-api.example.workers.dev")!

    enum APIError: Error, LocalizedError {
        case badStatus(Int)
        case decoding
        case rateLimited

        var errorDescription: String? {
            switch self {
            case .badStatus(let code): return "Server error (\(code))"
            case .decoding: return "Unexpected response format"
            case .rateLimited: return "Daily limit reached"
            }
        }
    }

    private struct SuggestRequest: Encodable {
        let context: String
        let tone: String
        let device_id: String
    }

    private struct SuggestResponse: Decodable {
        let suggestions: [String]
    }

    func suggest(context: String, tone: Tone) async throws -> [Suggestion] {
        let body = SuggestRequest(
            context: context,
            tone: tone.rawValue,
            device_id: AppGroupStore.shared.deviceID
        )

        var request = URLRequest(url: Self.baseURL.appendingPathComponent("/v1/suggest"))
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Ditto/1.0 iOS", forHTTPHeaderField: "User-Agent")
        request.httpBody = try JSONEncoder().encode(body)
        request.timeoutInterval = 15

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let http = response as? HTTPURLResponse else {
            throw APIError.badStatus(0)
        }

        switch http.statusCode {
        case 200:
            let decoded = try JSONDecoder().decode(SuggestResponse.self, from: data)
            return decoded.suggestions.map { Suggestion(text: $0, tone: tone) }
        case 429:
            throw APIError.rateLimited
        default:
            throw APIError.badStatus(http.statusCode)
        }
    }
}
