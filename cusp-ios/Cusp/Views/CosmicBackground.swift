import SwiftUI

/// Dark cosmic backdrop. Layered radial gradients in lavender/gold/midnight,
/// slowly drifting. Used as the full-screen background everywhere.
struct CosmicBackground: View {
    @State private var drift: CGFloat = 0

    var body: some View {
        ZStack {
            BrandColor.midnight

            // Lavender wash, upper-left
            Circle()
                .fill(
                    RadialGradient(
                        colors: [BrandColor.lavender.opacity(0.35), .clear],
                        center: .center, startRadius: 0, endRadius: 320
                    )
                )
                .frame(width: 600, height: 600)
                .offset(x: -180 + drift * 30, y: -250 - drift * 20)
                .blur(radius: 30)

            // Gold wash, lower-right
            Circle()
                .fill(
                    RadialGradient(
                        colors: [BrandColor.gold.opacity(0.18), .clear],
                        center: .center, startRadius: 0, endRadius: 280
                    )
                )
                .frame(width: 540, height: 540)
                .offset(x: 200 - drift * 25, y: 320 + drift * 15)
                .blur(radius: 30)

            // Deep purple at top edge
            Circle()
                .fill(
                    RadialGradient(
                        colors: [BrandColor.lavenderDeep.opacity(0.22), .clear],
                        center: .center, startRadius: 0, endRadius: 240
                    )
                )
                .frame(width: 460, height: 460)
                .offset(x: 100 + drift * 18, y: -400)
                .blur(radius: 24)

            // Subtle starfield (static for now — could become drifting later)
            StarField()
                .opacity(0.55)
        }
        .onAppear {
            withAnimation(.easeInOut(duration: 14).repeatForever(autoreverses: true)) {
                drift = 1
            }
        }
    }
}

private struct StarField: View {
    // Deterministic seeded positions so stars don't jump on every re-render
    private let stars: [(x: CGFloat, y: CGFloat, opacity: Double, size: CGFloat)] = {
        var rng = SeededRNG(seed: 7)
        return (0..<60).map { _ in
            (CGFloat(rng.next()), CGFloat(rng.next()),
             Double(rng.next()) * 0.6 + 0.15,
             CGFloat(rng.next()) * 1.5 + 0.4)
        }
    }()

    var body: some View {
        GeometryReader { geo in
            ForEach(0..<stars.count, id: \.self) { i in
                let s = stars[i]
                Circle()
                    .fill(BrandColor.cream.opacity(s.opacity))
                    .frame(width: s.size, height: s.size)
                    .position(x: s.x * geo.size.width, y: s.y * geo.size.height)
            }
        }
    }
}

private struct SeededRNG {
    var state: UInt64
    init(seed: UInt64) { self.state = seed &+ 0x9E3779B97F4A7C15 }
    mutating func next() -> Double {
        state = state &* 6364136223846793005 &+ 1442695040888963407
        return Double(state >> 11) / Double(UInt64(1) << 53)
    }
}
