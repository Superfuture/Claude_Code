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

    override func didTransition(to presentationStyle: MSMessagesAppPresentationStyle) {
        super.didTransition(to: presentationStyle)
        viewModel.isExpanded = (presentationStyle == .expanded)
    }

    // MARK: - Context capture

    /// Reads the last message available to the extension.
    /// iMessage extensions can only see `conversation.selectedMessage`
    /// (a message the user explicitly opened the extension on, if any) —
    /// true thread history is NOT exposed to extensions by Apple's API.
    private func captureContext(from conversation: MSConversation) {
        if let selected = conversation.selectedMessage,
           let summary = selected.summaryText, !summary.isEmpty {
            viewModel.contextText = summary
        }
    }
}
