#### <a href="#window_showDocument" name="window_showDocument" class="anchor">Show Document Request (:arrow_right_hook:)</a>

> New in version 3.16.0

The show document request is sent from a server to a client to ask the client to display a particular document in the user interface.

_Client Capability_:
* property path (optional): `window.showDocument`
* property type: `ShowDocumentClientCapabilities` defined as follows:

```typescript
/**
 * Client capabilities for the show document request.
 *
 * @since 3.16.0
 */
export interface ShowDocumentClientCapabilities {
	/**
	 * The client has support for the show document
	 * request.
	 */
	support: boolean;
}
```

_Request_:
* method: 'window/showDocument'
* params: `ShowDocumentParams` defined as follows:

<div class="anchorHolder"><a href="#showDocumentParams" name="showDocumentParams" class="linkableAnchor"></a></div>

```typescript
/**
 * Params to show a document.
 *
 * @since 3.16.0
 */
export interface ShowDocumentParams {
	/**
	 * The document uri to show.
	 */
	uri: URI;

	/**
	 * Indicates to show the resource in an external program.
	 * To show for example `https://code.visualstudio.com/`
	 * in the default WEB browser set `external` to `true`.
	 */
	external?: boolean;

	/**
	 * An optional property to indicate whether the editor
	 * showing the document should take focus or not.
	 * Clients might ignore this property if an external
	 * program is started.
	 */
	takeFocus?: boolean;

	/**
	 * An optional selection range if the document is a text
	 * document. Clients might ignore the property if an
	 * external program is started or the file is not a text
	 * file.
	 */
	selection?: Range;
}
```

_Response_:

* result: `ShowDocumentResult` defined as follows:

<div class="anchorHolder"><a href="#showDocumentResult" name="showDocumentResult" class="linkableAnchor"></a></div>

```typescript
/**
 * The result of an show document request.
 *
 * @since 3.16.0
 */
export interface ShowDocumentResult {
	/**
	 * A boolean indicating if the show was successful.
	 */
	success: boolean;
}
```
* error: code and message set in case an exception happens during showing a document.
