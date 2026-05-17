import SwiftUI

/// The brand wordmark icon — two overlapping speech bubbles, persimmon filled
/// front bubble + outlined echo bubble behind. Matches the website logo.
struct DittoLogo: View {
    var body: some View {
        Canvas { context, size in
            let w = size.width
            let h = size.height
            let scale = min(w, h) / 40.0

            // Back (echo) bubble — outline only
            let back = bubblePath(
                start: CGPoint(x: 11 * scale, y: 14 * scale),
                end: CGPoint(x: 38 * scale, y: 22 * scale),
                tail: CGPoint(x: 20 * scale, y: 31 * scale)
            )
            context.stroke(back, with: .color(BrandColor.ink), lineWidth: 2 * scale)

            // Front bubble — filled persimmon
            let front = bubblePath(
                start: CGPoint(x: 2 * scale, y: 9 * scale),
                end: CGPoint(x: 29 * scale, y: 17 * scale),
                tail: CGPoint(x: 11 * scale, y: 26 * scale)
            )
            context.fill(front, with: .color(BrandColor.persimmon))
            context.stroke(front, with: .color(BrandColor.ink), lineWidth: 2 * scale)
        }
    }

    private func bubblePath(start: CGPoint, end: CGPoint, tail: CGPoint) -> Path {
        let r: CGFloat = (end.y - start.y) * 0.2
        var p = Path()
        p.addRoundedRect(
            in: CGRect(x: start.x, y: start.y, width: end.x - start.x, height: end.y - start.y),
            cornerSize: CGSize(width: r * 2, height: r * 2)
        )
        // Tail
        p.move(to: CGPoint(x: tail.x - 4, y: end.y))
        p.addLine(to: CGPoint(x: tail.x, y: tail.y))
        p.addLine(to: CGPoint(x: tail.x + 4, y: end.y))
        p.closeSubpath()
        return p
    }
}
