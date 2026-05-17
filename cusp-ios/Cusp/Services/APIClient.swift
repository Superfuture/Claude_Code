import Foundation

actor APIClient {
    static let shared = APIClient()

    static let baseURL = URL(string: "https://cusp-api.jprimiani.workers.dev")!

    enum APIError: Error, LocalizedError {
        case badStatus(Int, String?)
        case rateLimited(String)
        case decoding

        var errorDescription: String? {
            switch self {
            case .badStatus(let code, let msg): return msg ?? "Server error (\(code))"
            case .rateLimited(let msg): return msg
            case .decoding: return "Couldn't read the ritual"
            }
        }
    }

    private struct RitualRequest: Encodable {
        let intention: String
        let birth: BirthPayload
        let device_id: String
        let is_pro: Bool
    }
    private struct BirthPayload: Encodable {
        let year: Int
        let month: Int
        let day: Int
    }
    private struct RitualResponse: Decodable {
        let ritual: Ritual
        let context: RitualContext?
    }
    private struct ErrorPayload: Decodable {
        let error: String?
        let message: String?
    }

    func ritual(intention: String, birth: BirthData, isPro: Bool, deviceID: String) async throws -> Ritual {
        let body = RitualRequest(
            intention: intention,
            birth: BirthPayload(year: birth.year, month: birth.month, day: birth.day),
            device_id: deviceID,
            is_pro: isPro
        )

        var request = URLRequest(url: Self.baseURL.appendingPathComponent("/v1/ritual"))
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Cusp/1.0 iOS", forHTTPHeaderField: "User-Agent")
        request.httpBody = try JSONEncoder().encode(body)
        request.timeoutInterval = 25

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse else { throw APIError.badStatus(0, nil) }

        switch http.statusCode {
        case 200:
            let decoded = try JSONDecoder().decode(RitualResponse.self, from: data)
            var ritual = decoded.ritual
            if ritual.id == UUID(uuidString: "00000000-0000-0000-0000-000000000000") {
                ritual.id = UUID()
            }
            return ritual
        case 429:
            let err = (try? JSONDecoder().decode(ErrorPayload.self, from: data))?.message
                ?? "You've used today's ritual. Pro unlocks unlimited."
            throw APIError.rateLimited(err)
        default:
            let err = (try? JSONDecoder().decode(ErrorPayload.self, from: data))?.error
            throw APIError.badStatus(http.statusCode, err)
        }
    }
}
