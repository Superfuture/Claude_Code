import SwiftUI
import UIKit

/// Ditto's warm brand palette: persimmon accent on cream paper with ink text.
/// Shared by the companion app, the iMessage extension, and the keyboard.
/// Neutrals adapt to the system appearance (warm charcoal at night).
enum BrandColor {
    static let persimmon = Color(red: 1.0, green: 0.353, blue: 0.212)
    static let cream = Color(lightHex: 0xF2E9D6, darkHex: 0x191512)
    static let creamDeep = Color(lightHex: 0xE9DEC3, darkHex: 0x2B241B)
    /// Received-message bubble: must stay distinct from paperLight cards in
    /// dark mode (creamDeep is near-identical there and disappears).
    static let bubbleIn = Color(lightHex: 0xE9DEC3, darkHex: 0x453C2E)
    static let paper = Color(lightHex: 0xF8F1DF, darkHex: 0x1F1A14)
    static let paperLight = Color(lightHex: 0xFCF7EA, darkHex: 0x2A241C)
    static let ink = Color(lightHex: 0x1B1611, darkHex: 0xF3EDE3)
    static let inkSoft = Color(lightHex: 0x3F362C, darkHex: 0xD9D0BF)
    static let inkMuted = Color(lightHex: 0x847866, darkHex: 0x9E9481)
    /// Text/icons sitting ON an ink-filled surface (chips, pill buttons).
    static let inkInverse = Color(lightHex: 0xFFFFFF, darkHex: 0x1B1611)
    static let line = Color(lightHex: 0x1B1611, darkHex: 0xF3EDE3).opacity(0.12)
}

extension Color {
    /// Trait-adaptive color: follows the system light/dark appearance.
    init(lightHex: UInt, darkHex: UInt) {
        self.init(uiColor: UIColor { traits in
            let hex = traits.userInterfaceStyle == .dark ? darkHex : lightHex
            return UIColor(red: CGFloat((hex >> 16) & 0xff) / 255,
                           green: CGFloat((hex >> 8) & 0xff) / 255,
                           blue: CGFloat(hex & 0xff) / 255,
                           alpha: 1)
        })
    }
}

extension Font {
    /// Chunky editorial serif (New York) for headlines and brand moments.
    static func brandSerif(_ size: CGFloat, weight: Font.Weight = .black) -> Font {
        .system(size: size, weight: weight, design: .serif)
    }
}
