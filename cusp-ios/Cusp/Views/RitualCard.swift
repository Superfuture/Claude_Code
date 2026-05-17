import SwiftUI

struct RitualCard: View {
    let ritual: Ritual
    @EnvironmentObject var store: Store
    @State private var completed: Set<Int> = []

    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            // Header
            VStack(alignment: .leading, spacing: 8) {
                if let ctx = ritual.context {
                    Text(contextLabel(ctx))
                        .font(BrandFont.micro(10))
                        .tracking(1.4)
                        .foregroundStyle(BrandColor.gold)
                }
                Text(ritual.title)
                    .font(BrandFont.display(30))
                    .foregroundStyle(BrandColor.cream)
                    .fixedSize(horizontal: false, vertical: true)
                Text(ritual.intro)
                    .font(BrandFont.serif(15))
                    .italic()
                    .foregroundStyle(BrandColor.creamMuted)
                    .fixedSize(horizontal: false, vertical: true)
            }

            Divider().background(BrandColor.line)

            // Steps
            VStack(alignment: .leading, spacing: 18) {
                ForEach(Array(ritual.steps.enumerated()), id: \.offset) { idx, step in
                    stepRow(index: idx, step: step)
                }
            }

            Divider().background(BrandColor.line)

            Text(ritual.close)
                .font(BrandFont.serif(15))
                .italic()
                .foregroundStyle(BrandColor.lavender)
                .fixedSize(horizontal: false, vertical: true)
                .padding(.top, 4)
        }
        .padding(24)
        .background(Color.white.opacity(0.05))
        .overlay(
            RoundedRectangle(cornerRadius: 22)
                .stroke(BrandColor.line, lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: 22))
        .onAppear { completed = ritual.completedSteps }
    }

    private func stepRow(index: Int, step: Ritual.Step) -> some View {
        let isDone = completed.contains(index)
        return Button {
            toggle(index)
        } label: {
            HStack(alignment: .top, spacing: 14) {
                ZStack {
                    Circle()
                        .stroke(isDone ? BrandColor.gold : BrandColor.creamMuted.opacity(0.4),
                                lineWidth: 1.5)
                        .frame(width: 22, height: 22)
                    if isDone {
                        Image(systemName: "checkmark")
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundStyle(BrandColor.gold)
                    }
                }
                .padding(.top, 2)

                VStack(alignment: .leading, spacing: 4) {
                    Text(step.kind.label)
                        .font(BrandFont.micro(9))
                        .tracking(1.4)
                        .foregroundStyle(BrandColor.gold.opacity(0.85))
                    Text(step.text)
                        .font(BrandFont.serif(16))
                        .foregroundStyle(BrandColor.cream)
                        .fixedSize(horizontal: false, vertical: true)
                        .strikethrough(isDone, color: BrandColor.creamMuted)
                        .opacity(isDone ? 0.55 : 1)
                }
            }
        }
        .buttonStyle(.plain)
    }

    private func toggle(_ index: Int) {
        if completed.contains(index) { completed.remove(index) }
        else { completed.insert(index) }
        // Persist back to store
        if var r = store.todaysRitual {
            r.completedSteps = completed
            store.todaysRitual = r
            if r.isComplete { store.recordRitualCompletion() }
        }
    }

    private func contextLabel(_ ctx: RitualContext) -> String {
        let merc = ctx.mercuryRetrograde ? " · ☿ ℞" : ""
        return "\(ctx.moon.name.uppercased()) · \(ctx.planetOfDay.uppercased())\(merc)"
    }
}
