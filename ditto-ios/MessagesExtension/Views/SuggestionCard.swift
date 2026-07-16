import SwiftUI

struct SuggestionCard: View {
    let index: Int
    let suggestion: Suggestion
    let onTap: () -> Void
    let onThumbsUp: () -> Void
    let onThumbsDown: () -> Void

    @State private var thumbState: ThumbState = .none
    @State private var appeared: Bool = false

    enum ThumbState { case none, up, down }

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 0) {
                Text("\(index)")
                    .font(.brandSerif(12, weight: .bold))
                    .italic()
                    .foregroundStyle(BrandColor.persimmon)
                    .frame(width: 24)
                    .frame(maxHeight: .infinity)
                    .background(BrandColor.persimmon.opacity(0.08))
                    .overlay(
                        Rectangle()
                            .fill(BrandColor.line.opacity(0.5))
                            .frame(width: 1),
                        alignment: .trailing
                    )

                Text(suggestion.text)
                    .font(.system(size: 14))
                    .foregroundStyle(BrandColor.ink)
                    .lineLimit(nil)
                    .multilineTextAlignment(.leading)
                    .padding(.horizontal, 11)
                    .padding(.vertical, 10)
                    .frame(maxWidth: .infinity, alignment: .leading)

                VStack(spacing: 2) {
                    thumbButton(isUp: true, active: thumbState == .up) {
                        thumbState = thumbState == .up ? .none : .up
                        onThumbsUp()
                    }
                    thumbButton(isUp: false, active: thumbState == .down) {
                        thumbState = thumbState == .down ? .none : .down
                        onThumbsDown()
                    }
                }
                .padding(.trailing, 8)
            }
        }
        .buttonStyle(.plain)
        .background(.white)
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(BrandColor.line, lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .opacity(appeared ? 1 : 0)
        .offset(y: appeared ? 0 : 8)
        .onAppear {
            withAnimation(.spring(response: 0.5, dampingFraction: 0.85).delay(Double(index) * 0.06)) {
                appeared = true
            }
        }
    }

    private func thumbButton(isUp: Bool, active: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: isUp ? "hand.thumbsup.fill" : "hand.thumbsdown.fill")
                .font(.system(size: 11))
                .foregroundStyle(
                    active
                        ? (isUp ? Color.green : BrandColor.persimmon)
                        : BrandColor.inkMuted.opacity(0.55)
                )
                .frame(width: 22, height: 22)
        }
        .buttonStyle(.plain)
    }
}
