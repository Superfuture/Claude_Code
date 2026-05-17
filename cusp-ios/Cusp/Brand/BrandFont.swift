import SwiftUI

/// Cusp typography. iOS New York serif (italic for display, regular for body
/// secondary), system rounded for UI chrome.
enum BrandFont {
    static func display(_ size: CGFloat) -> Font {
        .system(size: size, weight: .regular, design: .serif).italic()
    }

    static func displayMedium(_ size: CGFloat) -> Font {
        .system(size: size, weight: .medium, design: .serif).italic()
    }

    static func serif(_ size: CGFloat) -> Font {
        .system(size: size, weight: .regular, design: .serif)
    }

    static func micro(_ size: CGFloat = 11) -> Font {
        .system(size: size, weight: .semibold, design: .monospaced)
    }

    static func body(_ size: CGFloat = 15) -> Font {
        .system(size: size, weight: .regular, design: .default)
    }

    static func bodyBold(_ size: CGFloat = 15) -> Font {
        .system(size: size, weight: .semibold, design: .default)
    }
}
