import SwiftUI

struct RitualCard: View {
    let ritual: Ritual
    @EnvironmentObject var store: Store
    @State private var completed: Set<Int> = []

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            // Astrological context — zodiac glyph + moon phase + planet
            if let ctx = ritual.context { contextStrip(ctx) }

            // Title
            Text(ritual.title)
                .font(BrandFont.display(30))
                .foregroundStyle(BrandColor.parchment)
                .fixedSize(horizontal: false, vertical: true)
                .multilineTextAlignment(.leading)

            // Intro
            Text(ritual.intro)
                .font(BrandFont.serif(15))
                .italic()
                .foregroundStyle(BrandColor.inkMuted)
                .fixedSize(horizontal: false, vertical: true)

            divider

            // Three steps
            VStack(alignment: .leading, spacing: 18) {
                ForEach(Array(ritual.steps.enumerated()), id: \.offset) { idx, step in
                    stepRow(index: idx, step: step)
                }
            }

            divider

            // Closing
            Text(ritual.close)
                .font(BrandFont.serif(15))
                .italic()
                .foregroundStyle(BrandColor.gold.opacity(0.85))
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(22)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(BrandColor.onyx.opacity(0.7))
        .overlay(geometricFrame())
        .onAppear { completed = ritual.completedSteps }
    }

    // MARK: - Pieces

    private var divider: some View {
        HStack(spacing: 8) {
            Rectangle()
                .fill(BrandColor.line)
                .frame(height: 0.5)
            Rectangle()
                .fill(BrandColor.gold)
                .frame(width: 4, height: 4)
                .rotationEffect(.degrees(45))
            Rectangle()
                .fill(BrandColor.line)
                .frame(height: 0.5)
        }
    }

    private func contextStrip(_ ctx: RitualContext) -> some View {
        HStack(spacing: 14) {
            Text(zodiacGlyph(ctx.season.name))
                .font(.system(size: 22, weight: .regular))
                .foregroundStyle(BrandColor.gold)
            VStack(alignment: .leading, spacing: 2) {
                Text(ctx.weekday.uppercased())
                    .font(BrandFont.micro(9))
                    .tracking(1.6)
                    .foregroundStyle(BrandColor.gold)
                Text("\(ctx.moon.name) · \(ctx.planetOfDay)\(ctx.mercuryRetrograde ? " · ☿℞" : "")")
                    .font(BrandFont.micro(10))
                    .tracking(1.2)
                    .foregroundStyle(BrandColor.inkMuted)
            }
            Spacer()
        }
    }

    private func stepRow(index: Int, step: Ritual.Step) -> some View {
        let isDone = completed.contains(index)
        return Button {
            toggle(index)
        } label: {
            HStack(alignment: .top, spacing: 14) {
                ZStack {
                    Rectangle()
                        .stroke(isDone ? BrandColor.gold : BrandColor.line, lineWidth: 0.8)
                        .frame(width: 18, height: 18)
                        .rotationEffect(.degrees(45))
                    if isDone {
                        Rectangle()
                            .fill(BrandColor.gold)
                            .frame(width: 6, height: 6)
                            .rotationEffect(.degrees(45))
                    }
                }
                .padding(.top, 4)

                VStack(alignment: .leading, spacing: 4) {
                    Text(step.kind.label.uppercased())
                        .font(BrandFont.micro(9))
                        .tracking(1.8)
                        .foregroundStyle(BrandColor.gold.opacity(0.85))
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

    private func toggle(_ index: Int) {
        if completed.contains(index) { completed.remove(index) }
        else { completed.insert(index) }
        if var r = store.todaysRitual {
            r.completedSteps = completed
            store.todaysRitual = r
            if r.isComplete { store.recordRitualCompletion() }
        }
    }

    // Unicode zodiac glyphs
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
