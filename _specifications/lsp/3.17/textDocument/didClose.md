#### <a href="#textDocument_didClose" name="textDocument_didClose" class="anchor">DidCloseTextDocument Notification (:arrow_right:)</a>

The document close notification is sent from the client to the server when the document got closed in the client. The document's master now exists where the document's Uri points to (e.g. if the document's Uri is a file Uri the master now exists on disk). As with the open notification the close notification is about managing the document's content. Receiving a close notification doesn't mean that the document was open in an editor before. A close notification requires a previous open notification to be sent. Note that a server's ability to fulfill requests is independent of whether a text document is open or closed.

_Client Capability_:
See general synchronization [client capabilities](#textDocument_synchronization_cc).

_Server Capability_:
See general synchronization [server capabilities](#textDocument_synchronization_sc).

_Registration Options_: `TextDocumentRegistrationOptions`

_Notification_:
* method: `textDocument/didClose`
* params: `DidCloseTextDocumentParams` defined as follows:

<div class="anchorHolder"><a href="#didCloseTextDocumentParams" name="didCloseTextDocumentParams" class="linkableAnchor"></a></div>

```typescript
interface DidCloseTextDocumentParams {
	/**
	 * The document that was closed.
	 */
	textDocument: TextDocumentIdentifier;
}
```