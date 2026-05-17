import SwiftUI

/// Cusp palette. Dark cosmic — midnight blues with lavender and warm cream
/// accents. Soft gold for premium / sacred moments.
enum BrandColor {
    // Cosmic backgrounds
    static let midnight = Color(red: 0.102, green: 0.106, blue: 0.227)   // #1A1B3A
    static let dusk = Color(red: 0.165, green: 0.169, blue: 0.298)        // #2A2B4C
    static let veil = Color(red: 0.247, green: 0.220, blue: 0.345)        // #3F3858

    // Type
    static let cream = Color(red: 0.961, green: 0.929, blue: 0.863)       // #F5EDDC
    static let creamSoft = Color(red: 0.984, green: 0.965, blue: 0.918)   // #FBF6EA
    static let creamMuted = Color(red: 0.835, green: 0.800, blue: 0.722)  // #D5CCB8

    // Accents
    static let lavender = Color(red: 0.722, green: 0.643, blue: 0.831)    // #B8A4D4
    static let lavenderDeep = Color(red: 0.553, green: 0.451, blue: 0.690) // #8D73B0
    static let gold = Color(red: 0.831, green: 0.698, blue: 0.435)        // #D4B26F
    static let goldDeep = Color(red: 0.682, green: 0.541, blue: 0.275)    // #AE8A46

    // Subtle lines
    static let line = Color.white.opacity(0.08)
    static let lineSoft = Color.white.opacity(0.04)
}
