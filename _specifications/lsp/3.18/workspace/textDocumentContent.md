#### <a href="#workspace_textDocumentContent" name="workspace_textDocumentContent" class="anchor">Text Document Content Request (:leftwards_arrow_with_hook:)</a>

The `workspace/textDocumentContent` request is sent from the client to the server to dynamically fetch the content of a text document. Clients should treat the content returned from this requests as readonly.

_Client Capability_:
* property path (optional): `workspace.textDocumentContent`
* property type: `TextDocumentContentClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#textDocumentContentClientCapabilities" name="textDocumentContentClientCapabilities" class="linkableAnchor"></a></div>

```typescript
/**
 * Client capabilities for a text document content provider.
 *
 * @since 3.18.0
 */
export type TextDocumentContentClientCapabilities = {
	/**
	 * Text document content provider supports dynamic registration.
	 */
	dynamicRegistration?: boolean;
};
```

_Server Capability_:
* property path (optional): `workspace.textDocumentContent`
* property type: `TextDocumentContentOptions` where `TextDocumentContentOptions` is defined as follows:

<div class="anchorHolder"><a href="#textDocumentContentOptions" name="textDocumentContentOptions" class="linkableAnchor"></a></div>

```typescript
/**
 * Text document content provider options.
 *
 * @since 3.18.0
 */
export type TextDocumentContentOptions = {
	/**
	 * The schemes for which the server provides content.
	 */
	schemes: string[];
};
```

_Registration Options_: `TextDocumentContentRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#textDocumentContentRegistrationOptions" name="textDocumentContentRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
/**
 * Text document content provider registration options.
 *
 * @since 3.18.0
 */
export type TextDocumentContentRegistrationOptions = TextDocumentContentOptions &
	StaticRegistrationOptions;
```

_Request_:
* method: 'workspace/textDocumentContent'
* params: `TextDocumentContentParams` defined as follows:

<div class="anchorHolder"><a href="#textDocumentContentParams" name="textDocumentContentParams" class="linkableAnchor"></a></div>

```typescript
/**
 * Parameters for the `workspace/textDocumentContent` request.
 *
 * @since 3.18.0
 */
export interface TextDocumentContentParams {
	/**
	 * The uri of the text document.
	 */
	uri: DocumentUri;
}
```

_Response_:
* result: `TextDocumentContentResult` defined as follows:

<div class="anchorHolder"><a href="#textDocumentContentResult" name="textDocumentContentResult" class="linkableAnchor"></a></div>

```typescript
/**
 * Result of the `workspace/textDocumentContent` request.
 *
 * @since 3.18.0
 * @proposed
 */
export interface TextDocumentContentResult {
	/**
	 * The text content of the text document. Please note, that the content of
	 * any subsequent open notifications for the text document might differ
	 * from the returned content due to whitespace and line ending
	 * normalizations done on the client
	 */
	text: string;
}
```

 The content of the text document. .
* error: code and message set in case an exception happens during the text document content request.

#### <a href="#workspace_textDocumentContentRefresh" name="workspace_textDocumentContentRefresh" class="anchor">Text Document Content Refresh Request (:arrow_right_hook:)</a>

The `workspace/textDocumentContent/refresh`request is sent from the server to the client to refresh the content of a specific text document.

_Request_:
* method: 'workspace/textDocumentContent/refresh'
* params: `TextDocumentContentRefreshParams` defined as follows:

<div class="anchorHolder"><a href="#textDocumentContentRefreshParams" name="textDocumentContentRefreshParams" class="linkableAnchor"></a></div>

```typescript
/**
 * Parameters for the `workspace/textDocumentContent/refresh` request.
 *
 * @since 3.18.0
 */
export interface TextDocumentContentRefreshParams {
	/**
	 * The uri of the text document to refresh.
	 */
	uri: DocumentUri;
}
```

_Response_:
* result: `void`
* error: code and message set in case an exception happens during the workspace symbol resolve request.