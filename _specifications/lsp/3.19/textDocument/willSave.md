#### <a href="#textDocument_willSave" name="textDocument_willSave" class="anchor">WillSaveTextDocument Notification (:arrow_right:)</a>

The document will save notification is sent from the client to the server before the document is actually saved. If a server has registered for open / close events clients should ensure that the document is open before a `willSave` notification is sent since clients can't change the content of a file without ownership transferal.

_Client Capability_:
* property name (optional): `textDocument.synchronization.willSave`
* property type: `boolean`

The capability indicates that the client supports `textDocument/willSave` notifications.

_Server Capability_:
* property name (optional): `textDocumentSync.willSave`
* property type: `boolean`

The capability indicates that the server is interested in `textDocument/willSave` notifications.

_Registration Options_: `TextDocumentRegistrationOptions`

_Notification_:
* method: 'textDocument/willSave'
* params: `WillSaveTextDocumentParams` defined as follows:

<div class="anchorHolder"><a href="#willSaveTextDocumentParams" name="willSaveTextDocumentParams" class="linkableAnchor"></a></div>

```typescript
/**
 * The parameters send in a will save text document notification.
 */
export interface WillSaveTextDocumentParams {
	/**
	 * The document that will be saved.
	 */
	textDocument: TextDocumentIdentifier;

	/**
	 * The 'TextDocumentSaveReason'.
	 */
	reason: TextDocumentSaveReason;
}
```

<div class="anchorHolder"><a href="#textDocumentSaveReason" name="textDocumentSaveReason" class="linkableAnchor"></a></div>

```typescript
/**
 * Represents reasons why a text document is saved.
 */
export namespace TextDocumentSaveReason {

	/**
	 * Manually triggered, e.g. by the user pressing save, by starting
	 * debugging, or by an API call.
	 */
	export const Manual = 1;

	/**
	 * Automatic after a delay.
	 */
	export const AfterDelay = 2;

	/**
	 * When the editor lost focus.
	 */
	export const FocusOut = 3;
}

export type TextDocumentSaveReason = 1 | 2 | 3;
```
