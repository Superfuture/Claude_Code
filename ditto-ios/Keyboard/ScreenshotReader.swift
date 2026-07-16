import Photos
import Vision
import UIKit

/// Reads the user's most recent screenshot and reconstructs the visible
/// conversation with on-device OCR (Vision). Message-bubble layout tells us
/// who said what: text on the left half is "Them", on the right is "You".
/// Nothing leaves the device except the reconstructed text.
enum ScreenshotReader {

    struct ThreadResult {
        let assetID: String
        let thread: String
    }

    static var authorization: PHAuthorizationStatus {
        PHPhotoLibrary.authorizationStatus(for: .readWrite)
    }

    static var isAuthorized: Bool {
        authorization == .authorized || authorization == .limited
    }

    static func requestAccess(_ completion: @escaping (Bool) -> Void) {
        PHPhotoLibrary.requestAuthorization(for: .readWrite) { status in
            DispatchQueue.main.async {
                completion(status == .authorized || status == .limited)
            }
        }
    }

    /// The newest screenshot taken within `maxAge` seconds, excluding one
    /// already consumed (dedupe across keyboard opens).
    static func latestFreshScreenshot(maxAge: TimeInterval, excluding consumedID: String?) -> PHAsset? {
        guard isAuthorized else { return nil }
        let options = PHFetchOptions()
        options.sortDescriptors = [NSSortDescriptor(key: "creationDate", ascending: false)]
        #if !targetEnvironment(simulator)
        // Real devices tag screenshots; images added via `simctl addmedia`
        // don't get the subtype, so in the simulator accept any fresh image.
        options.predicate = NSPredicate(
            format: "(mediaSubtypes & %d) != 0",
            PHAssetMediaSubtype.photoScreenshot.rawValue
        )
        #endif
        options.fetchLimit = 1
        guard let asset = PHAsset.fetchAssets(with: .image, options: options).firstObject else { return nil }
        guard let created = asset.creationDate,
              Date().timeIntervalSince(created) <= maxAge else { return nil }
        guard asset.localIdentifier != consumedID else { return nil }
        return asset
    }

    static func readThread(from asset: PHAsset, completion: @escaping (ThreadResult?) -> Void) {
        let options = PHImageRequestOptions()
        options.deliveryMode = .highQualityFormat
        options.isNetworkAccessAllowed = false
        options.resizeMode = .exact
        // Downscaled to keep OCR sharp but stay inside the keyboard's memory cap
        let target = CGSize(width: 1170, height: 2532)
        PHImageManager.default().requestImage(
            for: asset, targetSize: target, contentMode: .aspectFit, options: options
        ) { image, _ in
            guard let cgImage = image?.cgImage else { completion(nil); return }
            DispatchQueue.global(qos: .userInitiated).async {
                let request = VNRecognizeTextRequest()
                request.recognitionLevel = .accurate
                request.usesLanguageCorrection = true
                let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
                try? handler.perform([request])

                // Vision's coordinate origin is bottom-left: sort top-to-bottom
                let observations = (request.results ?? [])
                    .sorted { $0.boundingBox.midY > $1.boundingBox.midY }

                var lines: [String] = []
                for observation in observations {
                    guard let text = observation.topCandidates(1).first?.string else { continue }
                    let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
                    if trimmed.isEmpty || isChrome(trimmed) { continue }
                    let speaker = observation.boundingBox.midX < 0.5 ? "Them" : "You"
                    if let last = lines.last, last.hasPrefix("\(speaker): ") {
                        lines[lines.count - 1] = last + " " + trimmed
                    } else {
                        lines.append("\(speaker): \(trimmed)")
                    }
                }

                let thread = lines.joined(separator: "\n")
                DispatchQueue.main.async {
                    completion(thread.isEmpty ? nil : ThreadResult(assetID: asset.localIdentifier, thread: thread))
                }
            }
        }
    }

    /// Deletes a previously-read screenshot (iOS shows its own confirmation
    /// dialog; the photo moves to Recently Deleted for 30 days).
    static func deleteScreenshot(assetID: String, completion: @escaping (Bool) -> Void) {
        let fetch = PHAsset.fetchAssets(withLocalIdentifiers: [assetID], options: nil)
        guard let asset = fetch.firstObject else { completion(false); return }
        PHPhotoLibrary.shared().performChanges({
            PHAssetChangeRequest.deleteAssets([asset] as NSArray)
        }) { success, _ in
            DispatchQueue.main.async { completion(success) }
        }
    }

    /// System chrome and status-bar junk that isn't part of the conversation.
    private static func isChrome(_ line: String) -> Bool {
        let lower = line.lowercased()
        let exact: Set<String> = [
            "imessage", "delivered", "read", "sent", "text message",
            "report spam", "encrypted", "send", "message", "sms",
            "if you did not expect this message from an unknown sender, it may be spam."
        ]
        if exact.contains(lower) { return true }
        // Ditto's own keyboard UI, in case the screenshot was taken with the
        // keyboard open (chips row, empty-state copy, wordmark, quota badge)
        let dittoUI = ["ditto is thinking", "screenshot the chat", "replies to the conversation",
                       "enable screenshot replies", "one switch to flip", "copy a message"]
        if dittoUI.contains(where: { lower.contains($0) }) { return true }
        let toneLabels = ["smart", "funny", "flirty", "formal", "supportive"]
        if toneLabels.filter({ lower.contains($0) }).count >= 2 { return true }
        if lower == "ditto" || lower == "pro" || lower == "space" { return true }
        if lower.range(of: #"^\d{1,2}\s*/\s*\d{1,2}$"#, options: .regularExpression) != nil { return true }
        if lower.hasPrefix("today ") || lower.hasPrefix("yesterday ") { return true }
        if lower.contains("unknown sender") { return true }
        // Bare timestamps ("6:16 PM", "18:42")
        if line.range(of: #"^\d{1,2}:\d{2}( ?[AP]M)?$"#,
                      options: [.regularExpression, .caseInsensitive]) != nil { return true }
        // Phone-number headers ("+1 (555) 564-8583")
        if line.range(of: #"^[+\d() .-]{7,}$"#, options: .regularExpression) != nil { return true }
        // Status-bar fragments ("5G+", "100%", "9:41")
        if line.count <= 3 { return true }
        return false
    }
}
