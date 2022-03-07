#### <a href="#textDocument_didChange" name="textDocument_didChange" class="anchor">DidChangeTextDocument Notification (:arrow_right:)</a>

The document change notification is sent from the client to the server to signal changes to a text document. Before a client can change a text document it must claim ownership of its content using the `textDocument/didOpen` notification. In 2.0 the shape of the params has changed to include proper version numbers.

_Client Capability_:
See general synchronization [client capabilities](#textDocument_synchronization_cc).

_Server Capability_:
See general synchronization [server capabilities](#textDocument_synchronization_sc).

_Registration Options_: `TextDocumentChangeRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#textDocumentChangeRegistrationOptions" name="textDocumentChangeRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
/**
 * Describe options to be used when registering for text document change events.
 */
export interface TextDocumentChangeRegistrationOptions
	extends TextDocumentRegistrationOptions {
	/**
	 * How documents are synced to the server. See TextDocumentSyncKind.Full
	 * and TextDocumentSyncKind.Incremental.
	 */
	syncKind: TextDocumentSyncKind;
}
```

_Notification_:
* method: `textDocument/didChange`
* params: `DidChangeTextDocumentParams` defined as follows:

<div class="anchorHolder"><a href="#didChangeTextDocumentParams" name="didChangeTextDocumentParams" class="linkableAnchor"></a></div>

```typescript
interface DidChangeTextDocumentParams {
	/**
	 * The document that did change. The version number points
	 * to the version after all provided content changes have
	 * been applied.
	 */
	textDocument: VersionedTextDocumentIdentifier;

	/**
	 * The actual content changes. The content changes describe single state
	 * changes to the document. So if there are two content changes c1 (at
	 * array index 0) and c2 (at array index 1) for a document in state S then
	 * c1 moves the document from S to S' and c2 from S' to S''. So c1 is
	 * computed on the state S and c2 is computed on the state S'.
	 *
	 * To mirror the content of a document using change events use the following
	 * approach:
	 * - start with the same initial content
	 * - apply the 'textDocument/didChange' notifications in the order you
	 *   receive them.
	 * - apply the `TextDocumentContentChangeEvent`s in a single notification
	 *   in the order you receive them.
	 */
	contentChanges: TextDocumentContentChangeEvent[];
}
```

<div class="anchorHolder"><a href="#textDocumentContentChangeEvent" name="textDocumentContentChangeEvent" class="linkableAnchor"></a></div>

```typescript
/**
 * An event describing a change to a text document. If range and rangeLength are
 * omitted the new text is considered to be the full content of the document.
 */
export type TextDocumentContentChangeEvent = {
	/**
	 * The range of the document that changed.
	 */
	range: Range;

	/**
	 * The optional length of the range that got replaced.
	 *
	 * @deprecated use range instead.
	 */
	rangeLength?: uinteger;

	/**
	 * The new text for the provided range.
	 */
	text: string;
} | {
	/**
	 * The new text of the whole document.
	 */
	text: string;
};
```
