import UIKit
import SwiftUI
import Messages

/// iMessage extension entry point.
/// Hosts a SwiftUI view via UIHostingController and bridges iMessage
/// lifecycle events (conversation context, insert-text) to the view model.
final class MessagesViewController: MSMessagesAppViewController {

    private var viewModel: DittoViewModel!
    private var hostingController: UIHostingController<DittoView>!

    override func viewDidLoad() {
        super.viewDidLoad()

        viewModel = DittoViewModel(
            insertText: { [weak self] text in
                self?.activeConversation?.insertText(text, completionHandler: nil)
            }
        )

        let rootView = DittoView(viewModel: viewModel)
        let host = UIHostingController(rootView: rootView)
        hostingController = host

        addChild(host)
        host.view.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(host.view)
        NSLayoutConstraint.activate([
            host.view.topAnchor.constraint(equalTo: view.topAnchor),
            host.view.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            host.view.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            host.view.trailingAnchor.constraint(equalTo: view.trailingAnchor)
        ])
        host.didMove(toParent: self)
    }

    // MARK: - Conversation lifecycle

    override func willBecomeActive(with conversation: MSConversation) {
        super.willBecomeActive(with: conversation)
        captureContext(from: conversation)
    }

    override func didStartSending(_ message: MSMessage, conversation: MSConversation) {
        super.didStartSending(message, conversation: conversation)
    }

    override func didTransition(to presentationStyle: MSMessagesAppPresentationStyle) {
        super.didTransition(to: presentationStyle)
        viewModel.isExpanded = (presentationStyle == .expanded)
    }

    // MARK: - Context capture

    /// Reads the last message available to the extension.
    /// iMessage extensions can only see the `selectedMessage` (the one the
    /// user tapped to open the extension with, if any) — true thread history
    /// is *not* exposed to extensions by Apple's API.
    ///
    /// For now we capture the selected message text or fall back to a
    /// neutral context. In production, consider also showing a "paste the
    /// message" affordance for cases where there's no selected message.
    private func captureContext(from conversation: MSConversation) {
        if let selected = conversation.selectedMessage,
           let summary = selected.summaryText, !summary.isEmpty {
            viewModel.contextText = summary
        }
        // Otherwise viewModel.contextText stays at its placeholder and the
        // user can paste a message manually.
    }
}
