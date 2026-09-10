#### <a href="#textDocument_didSave" name="textDocument_didSave" class="anchor">DidSaveTextDocument Notification (:arrow_right:)</a>

The document save notification is sent from the client to the server when the document was saved in the client.

_Client Capability_:
* property name (optional): `textDocument.synchronization.didSave`
* property type: `boolean`

The capability indicates that the client supports `textDocument/didSave` notifications.

_Server Capability_:
* property name (optional): `textDocumentSync.save`
* property type: `boolean | SaveOptions` where `SaveOptions` is defined as follows:

<div class="anchorHolder"><a href="#saveOptions" name="saveOptions" class="linkableAnchor"></a></div>

```typescript
export interface SaveOptions {
	/**
	 * The client is supposed to include the content on save.
	 */
	includeText?: boolean;
}
```

The capability indicates that the server is interested in `textDocument/didSave` notifications.

_Registration Options_: `TextDocumentSaveRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#textDocumentSaveRegistrationOptions" name="textDocumentSaveRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface TextDocumentSaveRegistrationOptions
	extends TextDocumentRegistrationOptions {
	/**
	 * The client is supposed to include the content on save.
	 */
	includeText?: boolean;
}
```

_Notification_:
* method: `textDocument/didSave`
* params: `DidSaveTextDocumentParams` defined as follows:

<div class="anchorHolder"><a href="#didSaveTextDocumentParams" name="didSaveTextDocumentParams" class="linkableAnchor"></a></div>

```typescript
interface DidSaveTextDocumentParams {
	/**
	 * The document that was saved.
	 */
	textDocument: TextDocumentIdentifier;

	/**
	 * Optional the content when saved. Depends on the includeText value
	 * when the save notification was requested.
	 */
	text?: string;
}
```
