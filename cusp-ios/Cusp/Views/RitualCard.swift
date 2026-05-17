import SwiftUI

struct RitualCard: View {
    let ritual: Ritual
    @EnvironmentObject var store: Store
    @State private var completed: Set<Int> = []
    @State private var showShareSheet = false
    @State private var sharedImage: UIImage?

    private var moonIsSpecial: Bool {
        guard let m = ritual.context?.moon.name else { return false }
        return m == "New Moon" || m == "Full Moon"
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            if let ctx = ritual.context { contextStrip(ctx) }

            Text(ritual.title)
                .font(BrandFont.display(30))
                .foregroundStyle(BrandColor.parchment)
                .fixedSize(horizontal: false, vertical: true)
                .multilineTextAlignment(.leading)

            Text(ritual.intro)
                .font(BrandFont.serif(15))
                .italic()
                .foregroundStyle(BrandColor.inkMuted)
                .fixedSize(horizontal: false, vertical: true)

            divider

            VStack(alignment: .leading, spacing: 18) {
                ForEach(Array(ritual.steps.enumerated()), id: \.offset) { idx, step in
                    stepRow(index: idx, step: step)
                }
            }

            divider

            Text(ritual.close)
                .font(BrandFont.serif(15))
                .italic()
                .foregroundStyle(accentColor.opacity(0.9))
                .fixedSize(horizontal: false, vertical: true)

            // Share affordance — generates an image users can post
            shareRow
                .padding(.top, 4)
        }
        .padding(22)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(BrandColor.onyx.opacity(0.7))
        .overlay(geometricFrame(accent: accentColor))
        .onAppear { completed = ritual.completedSteps }
        .sheet(isPresented: $showShareSheet, onDismiss: { sharedImage = nil }) {
            if let img = sharedImage {
                ShareSheet(items: [img])
            }
        }
    }

    private var accentColor: Color {
        moonIsSpecial ? BrandColor.rose : BrandColor.gold
    }

    // MARK: - Pieces

    private var divider: some View {
        HStack(spacing: 8) {
            Rectangle().fill(BrandColor.line).frame(height: 0.5)
            Rectangle()
                .fill(accentColor)
                .frame(width: 4, height: 4)
                .rotationEffect(.degrees(45))
            Rectangle().fill(BrandColor.line).frame(height: 0.5)
        }
    }

    private func contextStrip(_ ctx: RitualContext) -> some View {
        HStack(spacing: 14) {
            Text(zodiacGlyph(ctx.season.name))
                .font(.system(size: 22, weight: .regular))
                .foregroundStyle(accentColor)
            VStack(alignment: .leading, spacing: 2) {
                Text(ctx.weekday.uppercased())
                    .font(BrandFont.micro(9))
                    .tracking(1.6)
                    .foregroundStyle(accentColor)
                Text(contextLine(ctx))
                    .font(BrandFont.micro(10))
                    .tracking(1.2)
                    .foregroundStyle(BrandColor.inkMuted)
            }
            Spacer()
        }
    }

    private func contextLine(_ ctx: RitualContext) -> String {
        var parts = [ctx.moon.name, ctx.planetOfDay]
        if ctx.mercuryRetrograde { parts.append("☿℞") }
        return parts.joined(separator: " · ")
    }

    private func stepRow(index: Int, step: Ritual.Step) -> some View {
        let isDone = completed.contains(index)
        return Button {
            toggle(index)
        } label: {
            HStack(alignment: .top, spacing: 14) {
                ZStack {
                    Rectangle()
                        .stroke(isDone ? accentColor : BrandColor.line, lineWidth: 0.8)
                        .frame(width: 18, height: 18)
                        .rotationEffect(.degrees(45))
                    if isDone {
                        Rectangle()
                            .fill(accentColor)
                            .frame(width: 6, height: 6)
                            .rotationEffect(.degrees(45))
                    }
                }
                .padding(.top, 4)

                VStack(alignment: .leading, spacing: 4) {
                    Text(step.kind.label.uppercased())
                        .font(BrandFont.micro(9))
                        .tracking(1.8)
                        .foregroundStyle(accentColor.opacity(0.85))
                    Text(step.text)
                        .font(BrandFont.serif(16))
                        .foregroundStyle(BrandColor.parchment)
                        .fixedSize(horizontal: false, vertical: true)
                        .strikethrough(isDone, color: BrandColor.inkMuted)
                        .opacity(isDone ? 0.5 : 1)
                }
            }
        }
        .buttonStyle(.plain)
    }

    private var shareRow: some View {
        Button {
            sharedImage = renderImage()
            if sharedImage != nil { showShareSheet = true }
        } label: {
            HStack(spacing: 8) {
                Image(systemName: "square.and.arrow.up")
                    .font(.system(size: 11, weight: .semibold))
                Text("Save Ritual")
                    .font(BrandFont.micro(11))
                    .tracking(1.6)
            }
            .foregroundStyle(accentColor)
            .padding(.horizontal, 14)
            .padding(.vertical, 8)
            .overlay(
                Capsule().stroke(accentColor.opacity(0.65), lineWidth: 0.6)
            )
        }
        .buttonStyle(.plain)
    }

    private func toggle(_ index: Int) {
        if completed.contains(index) { completed.remove(index) }
        else { completed.insert(index) }
        if var r = store.todaysRitual {
            r.completedSteps = completed
            store.todaysRitual = r
            if r.isComplete { store.recordRitualCompletion() }
        }
    }

    @MainActor
    private func renderImage() -> UIImage? {
        let card = ShareableRitualCard(ritual: ritual, accent: accentColor)
            .frame(width: 540)
        let renderer = ImageRenderer(content: card)
        renderer.scale = 3
        return renderer.uiImage
    }

    private func zodiacGlyph(_ sign: String) -> String {
        switch sign {
        case "Aries": return "\u{2648}"
        case "Taurus": return "\u{2649}"
        case "Gemini": return "\u{264A}"
        case "Cancer": return "\u{264B}"
        case "Leo": return "\u{264C}"
        case "Virgo": return "\u{264D}"
        case "Libra": return "\u{264E}"
        case "Scorpio": return "\u{264F}"
        case "Sagittarius": return "\u{2650}"
        case "Capricorn": return "\u{2651}"
        case "Aquarius": return "\u{2652}"
        case "Pisces": return "\u{2653}"
        default: return "✦"
        }
    }
}

/// Image-export version of the ritual card — square-ish, branded, includes
/// the Cusp wordmark so anyone who sees the image knows the source.
struct ShareableRitualCard: View {
    let ritual: Ritual
    let accent: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            HStack {
                EnochianGlyph().frame(width: 24, height: 24)
                Text("Cusp")
                    .font(BrandFont.display(20))
                    .foregroundStyle(BrandColor.parchment)
                Spacer()
                if let ctx = ritual.context {
                    Text(zodiac(ctx.season.name) + "  " + ctx.moon.name)
                        .font(BrandFont.micro(10))
                        .tracking(1.4)
                        .foregroundStyle(accent)
                }
            }

            Text(ritual.title)
                .font(BrandFont.display(28))
                .foregroundStyle(BrandColor.parchment)
                .fixedSize(horizontal: false, vertical: true)

            Text(ritual.intro)
                .font(BrandFont.serif(14))
                .italic()
                .foregroundStyle(BrandColor.inkMuted)
                .fixedSize(horizontal: false, vertical: true)

            VStack(alignment: .leading, spacing: 14) {
                ForEach(Array(ritual.steps.enumerated()), id: \.offset) { idx, step in
                    HStack(alignment: .top, spacing: 12) {
                        Rectangle()
                            .stroke(accent, lineWidth: 0.8)
                            .frame(width: 14, height: 14)
                            .rotationEffect(.degrees(45))
                            .padding(.top, 4)
                        VStack(alignment: .leading, spacing: 3) {
                            Text(step.kind.label.uppercased())
                                .font(BrandFont.micro(8))
                                .tracking(1.8)
                                .foregroundStyle(accent.opacity(0.85))
                            Text(step.text)
                                .font(BrandFont.serif(14))
                                .foregroundStyle(BrandColor.parchment)
                                .fixedSize(horizontal: false, vertical: true)
                        }
                    }
                }
            }

            Text(ritual.close)
                .font(BrandFont.serif(13))
                .italic()
                .foregroundStyle(accent.opacity(0.9))
                .fixedSize(horizontal: false, vertical: true)
                .padding(.top, 4)

            HStack {
                Spacer()
                Text("cusp.app")
                    .font(BrandFont.micro(9))
                    .tracking(1.6)
                    .foregroundStyle(BrandColor.inkMuted)
            }
            .padding(.top, 6)
        }
        .padding(28)
        .frame(width: 540, alignment: .leading)
        .background(BrandColor.void)
        .overlay(
            Rectangle().stroke(accent.opacity(0.4), lineWidth: 0.8)
        )
    }

    private func zodiac(_ sign: String) -> String {
        switch sign {
        case "Aries": return "\u{2648}"; case "Taurus": return "\u{2649}"
        case "Gemini": return "\u{264A}"; case "Cancer": return "\u{264B}"
        case "Leo": return "\u{264C}"; case "Virgo": return "\u{264D}"
        case "Libra": return "\u{264E}"; case "Scorpio": return "\u{264F}"
        case "Sagittarius": return "\u{2650}"; case "Capricorn": return "\u{2651}"
        case "Aquarius": return "\u{2652}"; case "Pisces": return "\u{2653}"
        default: return "✦"
        }
    }
}

/// UIKit bridge for UIActivityViewController so the ritual image can be
/// shared / saved to Photos / sent in iMessage.
struct ShareSheet: UIViewControllerRepresentable {
    let items: [Any]

    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: items, applicationActivities: nil)
    }
    func updateUIViewController(_ vc: UIActivityViewController, context: Context) {}
}

// Updated geometricFrame that supports a tinted accent for special days.
func geometricFrame(accent: Color = BrandColor.gold, lineWidth: CGFloat = 0.6) -> some View {
    ZStack {
        Rectangle()
            .stroke(accent.opacity(0.4), lineWidth: lineWidth)
        ForEach(0..<4, id: \.self) { i in
            GeometryReader { geo in
                let x = (i % 2 == 0) ? 0 : geo.size.width
                let y = (i < 2) ? 0 : geo.size.height
                Rectangle()
                    .fill(accent)
                    .frame(width: 4, height: 4)
                    .rotationEffect(.degrees(45))
                    .position(x: x, y: y)
            }
        }
    }
    .allowsHitTesting(false)
}
