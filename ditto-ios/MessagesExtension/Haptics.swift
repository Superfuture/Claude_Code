import UIKit

/// Small, prepared haptic generators for snappy, low-latency feedback.
enum Haptics {
    private static let light = UIImpactFeedbackGenerator(style: .light)
    private static let medium = UIImpactFeedbackGenerator(style: .medium)
    private static let soft = UIImpactFeedbackGenerator(style: .soft)
    private static let rigid = UIImpactFeedbackGenerator(style: .rigid)
    private static let notify = UINotificationFeedbackGenerator()

    static func prepare() { light.prepare(); medium.prepare(); soft.prepare(); rigid.prepare(); notify.prepare() }
    static func tap() { light.impactOccurred() }
    static func press() { medium.impactOccurred(intensity: 0.9) }
    static func shutter() { rigid.impactOccurred() }
    static func soften() { soft.impactOccurred(intensity: 0.7) }
    static func success() { notify.notificationOccurred(.success) }
}
