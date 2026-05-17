import SwiftUI

/// Cusp palette — Enochian / John Dee aesthetic.
/// Pure black ground, parchment gold for ink, cool cream for type.
/// All decoration is geometric and subtle. No gradients, no glow.
enum BrandColor {
    // Grounds
    static let void = Color(red: 0.0, green: 0.0, blue: 0.0)            // pure black
    static let onyx = Color(red: 0.039, green: 0.039, blue: 0.055)      // #0A0A0E
    static let smoke = Color(red: 0.071, green: 0.071, blue: 0.094)     // #121218

    // Ink
    static let parchment = Color(red: 0.910, green: 0.851, blue: 0.722) // #E8D9B8 aged paper
    static let lunar = Color(red: 0.925, green: 0.918, blue: 0.875)     // #ECEAA9 (cool cream)
    static let inkMuted = Color(red: 0.671, green: 0.616, blue: 0.510)  // #ABA084 (faded gold)

    // Accents
    static let gold = Color(red: 0.788, green: 0.659, blue: 0.353)      // #C9A85B brass / leaf
    static let goldDeep = Color(red: 0.553, green: 0.439, blue: 0.196)  // #8D7032

    // Subtle stone tones (used sparingly)
    static let quartz = Color(red: 0.400, green: 0.400, blue: 0.475)    // #666679

    // Lines — gold at very low opacity
    static let line = Color(red: 0.910, green: 0.851, blue: 0.722).opacity(0.12)
    static let lineSoft = Color(red: 0.910, green: 0.851, blue: 0.722).opacity(0.05)
    static let lineStrong = Color(red: 0.910, green: 0.851, blue: 0.722).opacity(0.25)

    // Legacy aliases (kept so existing files don't break)
    static let midnight = void
    static let dusk = onyx
    static let veil = smoke
    static let cream = parchment
    static let creamSoft = lunar
    static let creamMuted = inkMuted
    static let lavender = quartz
    static let lavenderDeep = quartz
}
