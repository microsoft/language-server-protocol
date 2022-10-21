#### <a href="#textDocument_documentLink" name="textDocument_documentLink" class="anchor">Document Link Request (:leftwards_arrow_with_hook:)</a>

The document links request is sent from the client to the server to request the location of links in a document.

_Client Capability_:
* property name (optional): `textDocument.documentLink`
* property type: `DocumentLinkClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#documentLinkClientCapabilities" name="documentLinkClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface DocumentLinkClientCapabilities {
	/**
	 * Whether document link supports dynamic registration.
	 */
	dynamicRegistration?: boolean;

	/**
	 * Whether the client supports the `tooltip` property on `DocumentLink`.
	 *
	 * @since 3.15.0
	 */
	tooltipSupport?: boolean;
}
```

_Server Capability_:
* property name (optional): `documentLinkProvider`
* property type: `DocumentLinkOptions` defined as follows:

<div class="anchorHolder"><a href="#documentLinkOptions" name="documentLinkOptions" class="linkableAnchor"></a></div>

```typescript
export interface DocumentLinkOptions extends WorkDoneProgressOptions {
	/**
	 * Document links have a resolve provider as well.
	 */
	resolveProvider?: boolean;
}
```

_Registration Options_: `DocumentLinkRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#documentLinkRegistrationOptions" name="documentLinkRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface DocumentLinkRegistrationOptions extends
	TextDocumentRegistrationOptions, DocumentLinkOptions {
}
```

_Request_:
* method: `textDocument/documentLink`
* params: `DocumentLinkParams` defined as follows:

<div class="anchorHolder"><a href="#documentLinkParams" name="documentLinkParams" class="linkableAnchor"></a></div>

```typescript
interface DocumentLinkParams extends WorkDoneProgressParams,
	PartialResultParams {
	/**
	 * The document to provide document links for.
	 */
	textDocument: TextDocumentIdentifier;
}
```

_Response_:
* result: `DocumentLink[]` \| `null`.

<div class="anchorHolder"><a href="#documentLink" name="documentLink" class="linkableAnchor"></a></div>

```typescript
/**
 * A document link is a range in a text document that links to an internal or
 * external resource, like another text document or a web site.
 */
interface DocumentLink {
	/**
	 * The range this link applies to.
	 */
	range: Range;

	/**
	 * The uri this link points to. If missing a resolve request is sent later.
	 */
	target?: DocumentUri;

	/**
	 * The tooltip text when you hover over this link.
	 *
	 * If a tooltip is provided, is will be displayed in a string that includes
	 * instructions on how to trigger the link, such as `{0} (ctrl + click)`.
	 * The specific instructions vary depending on OS, user settings, and
	 * localization.
	 *
	 * @since 3.15.0
	 */
	tooltip?: string;

	/**
	 * A data entry field that is preserved on a document link between a
	 * DocumentLinkRequest and a DocumentLinkResolveRequest.
	 */
	data?: LSPAny;
}
```
* partial result: `DocumentLink[]`
* error: code and message set in case an exception happens during the document link request.

#### <a href="#documentLink_resolve" name="documentLink_resolve" class="anchor">Document Link Resolve Request (:leftwards_arrow_with_hook:)</a>

The document link resolve request is sent from the client to the server to resolve the target of a given document link.

_Request_:
* method: `documentLink/resolve`
* params: `DocumentLink`

_Response_:
* result: `DocumentLink`
* error: code and message set in case an exception happens during the document link resolve request.
