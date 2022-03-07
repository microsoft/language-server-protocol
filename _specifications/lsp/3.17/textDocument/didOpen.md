#### <a href="#textDocument_didOpen" name="textDocument_didOpen" class="anchor">DidOpenTextDocument Notification (:arrow_right:)</a>

The document open notification is sent from the client to the server to signal newly opened text documents. The document's content is now managed by the client and the server must not try to read the document's content using the document's Uri. Open in this sense means it is managed by the client. It doesn't necessarily mean that its content is presented in an editor. An open notification must not be sent more than once without a corresponding close notification send before. This means open and close notification must be balanced and the max open count for a particular textDocument is one. Note that a server's ability to fulfill requests is independent of whether a text document is open or closed.

The `DidOpenTextDocumentParams` contain the language id the document is associated with. If the language id of a document changes, the client needs to send a `textDocument/didClose` to the server followed by a `textDocument/didOpen` with the new language id if the server handles the new language id as well.

_Client Capability_:
See general synchronization [client capabilities](#textDocument_synchronization_cc).

_Server Capability_:
See general synchronization [server capabilities](#textDocument_synchronization_sc).

_Registration Options_: [`TextDocumentRegistrationOptions`](#textDocumentRegistrationOptions)

_Notification_:
* method: 'textDocument/didOpen'
* params: `DidOpenTextDocumentParams` defined as follows:

<div class="anchorHolder"><a href="#didOpenTextDocumentParams" name="didOpenTextDocumentParams" class="linkableAnchor"></a></div>

```typescript
interface DidOpenTextDocumentParams {
	/**
	 * The document that was opened.
	 */
	textDocument: TextDocumentItem;
}
```