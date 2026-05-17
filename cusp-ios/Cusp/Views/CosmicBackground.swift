import SwiftUI

/// Sacred geometry backdrop. Pure black ground. A single large compass-rose
/// figure in faint gold sits behind the content — circle + inscribed
/// hexagram + axes. Inspired by John Dee's Enochian diagrams and the Monas
/// Hieroglyphica plates.
struct CosmicBackground: View {
    @State private var rotation: Double = 0

    var body: some View {
        ZStack {
            BrandColor.void

            // Outer ring + sacred geometry, rotating very slowly so it
            // breathes without ever feeling animated.
            EnochianFigure()
                .stroke(BrandColor.gold.opacity(0.16), lineWidth: 0.8)
                .frame(width: 600, height: 600)
                .rotationEffect(.degrees(rotation))
                .blendMode(.plusLighter)

            // Even fainter outer ring
            Circle()
                .stroke(BrandColor.gold.opacity(0.08), lineWidth: 0.5)
                .frame(width: 820, height: 820)
                .rotationEffect(.degrees(-rotation * 0.4))

            // Quiet starfield — geometric specks, no twinkle
            DotField()
                .foregroundStyle(BrandColor.parchment.opacity(0.25))
        }
        .onAppear {
            withAnimation(.linear(duration: 240).repeatForever(autoreverses: false)) {
                rotation = 360
            }
        }
    }
}

/// Compass-rose / hexagram / cross composed in one path. Renders as a
/// Renaissance occult diagram.
private struct EnochianFigure: Shape {
    func path(in rect: CGRect) -> Path {
        var p = Path()
        let c = CGPoint(x: rect.midX, y: rect.midY)
        let r = min(rect.width, rect.height) / 2

        // Outer circle
        p.addEllipse(in: CGRect(x: c.x - r, y: c.y - r, width: r * 2, height: r * 2))

        // Inner circle
        let r2 = r * 0.62
        p.addEllipse(in: CGRect(x: c.x - r2, y: c.y - r2, width: r2 * 2, height: r2 * 2))

        // Innermost circle
        let r3 = r * 0.30
        p.addEllipse(in: CGRect(x: c.x - r3, y: c.y - r3, width: r3 * 2, height: r3 * 2))

        // Cross axes
        p.move(to: CGPoint(x: c.x - r, y: c.y))
        p.addLine(to: CGPoint(x: c.x + r, y: c.y))
        p.move(to: CGPoint(x: c.x, y: c.y - r))
        p.addLine(to: CGPoint(x: c.x, y: c.y + r))

        // Hexagram (two overlapping equilateral triangles)
        let hex1 = polygon(center: c, radius: r2, sides: 3, rotation: -.pi / 2)
        let hex2 = polygon(center: c, radius: r2, sides: 3, rotation: .pi / 2)
        p.addPath(hex1)
        p.addPath(hex2)

        // Twelve tick marks around the outer circle (12 zodiac houses)
        for i in 0..<12 {
            let a = Double(i) / 12 * 2 * .pi - .pi / 2
            let from = CGPoint(x: c.x + cos(a) * r, y: c.y + sin(a) * r)
            let to = CGPoint(x: c.x + cos(a) * (r * 0.93),
                              y: c.y + sin(a) * (r * 0.93))
            p.move(to: from)
            p.addLine(to: to)
        }

        return p
    }

    private func polygon(center: CGPoint, radius: CGFloat, sides: Int, rotation: Double) -> Path {
        var p = Path()
        for i in 0...sides {
            let a = Double(i) / Double(sides) * 2 * .pi + rotation
            let pt = CGPoint(x: center.x + cos(a) * radius, y: center.y + sin(a) * radius)
            if i == 0 { p.move(to: pt) } else { p.addLine(to: pt) }
        }
        return p
    }
}

private struct DotField: View {
    private let dots: [(x: CGFloat, y: CGFloat, opacity: Double, size: CGFloat)] = {
        var rng = SeededRNG(seed: 19)
        return (0..<32).map { _ in
            (CGFloat(rng.next()), CGFloat(rng.next()),
             Double(rng.next()) * 0.5 + 0.15,
             CGFloat(rng.next()) * 1.4 + 0.6)
        }
    }()

    var body: some View {
        GeometryReader { geo in
            ForEach(0..<dots.count, id: \.self) { i in
                let d = dots[i]
                Circle()
                    .fill(BrandColor.parchment.opacity(d.opacity))
                    .frame(width: d.size, height: d.size)
                    .position(x: d.x * geo.size.width, y: d.y * geo.size.height)
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
