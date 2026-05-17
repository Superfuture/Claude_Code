import SwiftUI

/// Cusp palette — softened from pure black to deep midnight + warm cream.
/// Brass gold stays as the primary metal. Dusty rose is added as a secondary
/// accent for moon-phase events (New / Full) so they stand out from regular
/// days without losing the dark editorial feel.
enum BrandColor {
    // Grounds
    static let void = Color(red: 0.039, green: 0.055, blue: 0.133)       // #0A0E22 deep midnight
    static let onyx = Color(red: 0.075, green: 0.090, blue: 0.180)       // #13172E smoke navy
    static let smoke = Color(red: 0.122, green: 0.133, blue: 0.251)      // #1F2240
    static let veil = Color(red: 0.165, green: 0.176, blue: 0.298)       // #2A2D4C

    // Type
    static let parchment = Color(red: 0.929, green: 0.875, blue: 0.769)  // #EDDFC4 warm cream
    static let lunar = Color(red: 0.969, green: 0.937, blue: 0.878)      // #F7EFE0 highlight cream
    static let inkMuted = Color(red: 0.612, green: 0.573, blue: 0.506)   // #9C9281 warm muted

    // Accents
    static let gold = Color(red: 0.788, green: 0.659, blue: 0.353)       // #C9A85B brass leaf
    static let goldDeep = Color(red: 0.553, green: 0.439, blue: 0.196)
    static let rose = Color(red: 0.831, green: 0.627, blue: 0.620)       // #D4A09E dusty rose — moon phases
    static let roseDeep = Color(red: 0.682, green: 0.467, blue: 0.459)

    // Lines
    static let line = Color(red: 0.929, green: 0.875, blue: 0.769).opacity(0.12)
    static let lineSoft = Color(red: 0.929, green: 0.875, blue: 0.769).opacity(0.05)
    static let lineStrong = Color(red: 0.929, green: 0.875, blue: 0.769).opacity(0.25)

    // Aliases kept so existing files don't break
    static let midnight = void
    static let dusk = onyx
    static let cream = parchment
    static let creamSoft = lunar
    static let creamDeep = onyx
    static let creamMuted = inkMuted
    static let lavender = rose
    static let lavenderDeep = roseDeep
    static let quartz = inkMuted
    static let paper = onyx
    static let paperLight = smoke
    static let ink = parchment
    static let inkSoft = inkMuted
    static let persimmon = gold
    static let persimmonSoft = lunar
}
