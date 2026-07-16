import SwiftUI

/// The brand mark — two overlapping speech bubbles matching the App Store icon:
/// a persimmon-filled bubble in front (top-left) over a cream echo bubble
/// behind (bottom-right), both with thick ink outlines and down-left tails.
struct DittoLogo: View {
    var body: some View {
        Canvas { context, size in
            let s = min(size.width, size.height) / 40.0
            let stroke = StrokeStyle(lineWidth: 2.4 * s, lineJoin: .round)

            // Back (cream) bubble
            let back = bubble(
                rect: CGRect(x: 14.5 * s, y: 17 * s, width: 21 * s, height: 11.3 * s),
                r: 4.5 * s,
                tailX1: 18 * s, tailX2: 24 * s,
                tip: CGPoint(x: 18.4 * s, y: 31.5 * s)
            )
            context.fill(back, with: .color(BrandColor.cream))
            context.stroke(back, with: .color(BrandColor.ink), style: stroke)

            // Front (persimmon) bubble, drawn on top
            let front = bubble(
                rect: CGRect(x: 4.5 * s, y: 8.5 * s, width: 21 * s, height: 11 * s),
                r: 4.5 * s,
                tailX1: 8.5 * s, tailX2: 15 * s,
                tip: CGPoint(x: 9 * s, y: 23.5 * s)
            )
            context.fill(front, with: .color(BrandColor.persimmon))
            context.stroke(front, with: .color(BrandColor.ink), style: stroke)
        }
    }

    /// One continuous outline: rounded rect with a pointed tail spliced into
    /// the bottom edge between tailX1 and tailX2 (so fill + stroke stay clean).
    private func bubble(rect: CGRect, r: CGFloat, tailX1: CGFloat, tailX2: CGFloat, tip: CGPoint) -> Path {
        var p = Path()
        p.move(to: CGPoint(x: rect.minX + r, y: rect.minY))
        p.addLine(to: CGPoint(x: rect.maxX - r, y: rect.minY))
        p.addArc(center: CGPoint(x: rect.maxX - r, y: rect.minY + r), radius: r,
                 startAngle: .degrees(-90), endAngle: .degrees(0), clockwise: false)
        p.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY - r))
        p.addArc(center: CGPoint(x: rect.maxX - r, y: rect.maxY - r), radius: r,
                 startAngle: .degrees(0), endAngle: .degrees(90), clockwise: false)
        p.addLine(to: CGPoint(x: tailX2, y: rect.maxY))
        p.addLine(to: tip)
        p.addLine(to: CGPoint(x: tailX1, y: rect.maxY))
        p.addLine(to: CGPoint(x: rect.minX + r, y: rect.maxY))
        p.addArc(center: CGPoint(x: rect.minX + r, y: rect.maxY - r), radius: r,
                 startAngle: .degrees(90), endAngle: .degrees(180), clockwise: false)
        p.addLine(to: CGPoint(x: rect.minX, y: rect.minY + r))
        p.addArc(center: CGPoint(x: rect.minX + r, y: rect.minY + r), radius: r,
                 startAngle: .degrees(180), endAngle: .degrees(270), clockwise: false)
        p.closeSubpath()
        return p
    }
}
