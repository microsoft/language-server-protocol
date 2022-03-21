#### <a href="#textDocument_inlayHint" name="textDocument_inlayHint" class="anchor">Inlay Hint Request (:leftwards_arrow_with_hook:)</a>

> *Since version 3.17.0*

The inlay hints request is sent from the client to the server to compute inlay hints for a given [text document, range] tuple that may be rendered in the editor in place with other text.

_Client Capability_:
* property name (optional): `textDocument.inlayHint`
* property type: `InlayHintClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#inlayHintClientCapabilities" name="inlayHintClientCapabilities" class="linkableAnchor"></a></div>

```typescript
/**
 * Inlay hint client capabilities.
 *
 * @since 3.17.0 - proposed state
 */
export type InlayHintClientCapabilities = {

	/**
	 * Whether inlay hints support dynamic registration.
	 */
	dynamicRegistration?: boolean;

	/**
	 * Indicates which properties a client can resolve lazily on a inlay
	 * hint.
	 */
	resolveSupport?: {

		/**
		 * The properties that a client can resolve lazily.
		 */
		properties: string[];
	};
};
```

_Server Capability_:
* property name (optional): `inlayHintProvider`
* property type: `InlayHintOptions` defined as follows:

<div class="anchorHolder"><a href="#inlayHintOptions" name="inlayHintOptions" class="linkableAnchor"></a></div>

```typescript
/**
 * Inlay hint options used during static registration.
 *
 * @since 3.17.0 - proposed state
 */
export type InlayHintOptions = WorkDoneProgressOptions & {
	/**
	 * The server provides support to resolve additional
	 * information for an inlay hint item.
	 */
	resolveProvider?: boolean;
};
```

_Registration Options_: `InlayHintRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#inlayHintRegistrationOptions" name="inlayHintRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
/**
 * Inlay hint options used during static or dynamic registration.
 *
 * @since 3.17.0 - proposed state
 */
export type InlayHintRegistrationOptions = InlayHintOptions
	& TextDocumentRegistrationOptions & StaticRegistrationOptions;
```

_Request_:
* method: `textDocument/inlayHint`
* params: `InlayHintParams` defined as follows:

<div class="anchorHolder"><a href="#inlayHintParams" name="inlayHintParams" class="linkableAnchor"></a></div>

```typescript
/**
 * A parameter literal used in inlay hint requests.
 *
 * @since 3.17.0 - proposed state
 */
export type InlayHintParams = WorkDoneProgressParams & {
	/**
	 * The text document.
	 */
	textDocument: TextDocumentIdentifier;

	/**
	 * The visible document range for which inlay hints should be computed.
	 */
	range: Range;
};
```

_Response_:
* result: `InlayHint[]` \| `null` defined as follows:

<div class="anchorHolder"><a href="#inlayHint" name="inlayHint" class="linkableAnchor"></a></div>

```typescript
/**
 * Inlay hint information.
 *
 * @since 3.17.0 - proposed state
 */
export type InlayHint = {

	/**
	 * The position of this hint.
	 */
	position: Position;

	/**
	 * The label of this hint. A human readable string or an array of
	 * InlayHintLabelPart label parts.
	 *
	 * *Note* that neither the string nor the label part can be empty.
	 */
	label: string | InlayHintLabelPart[];

	/**
	 * The kind of this hint. Can be omitted in which case the client
	 * should fall back to a reasonable default.
	 */
	kind?: InlayHintKind;

	/**
	 * Optional text edits that are performed when accepting this inlay hint.
	 *
	 * *Note* that edits are expected to change the document so that the inlay
	 * hint (or its nearest variant) is now part of the document and the inlay
	 * hint itself is now obsolete.
	 *
	 * Depending on the client capability `inlayHint.resolveSupport` clients
	 * might resolve this property late using the resolve request.
	 */
	textEdits?: TextEdit[];

	/**
	 * The tooltip text when you hover over this item.
	 *
	 * Depending on the client capability `inlayHint.resolveSupport` clients
	 * might resolve this property late using the resolve request.
	 */
	tooltip?: string | MarkupContent;

	/**
	 * Render padding before the hint.
	 *
	 * Note: Padding should use the editor's background color, not the
	 * background color of the hint itself. That means padding can be used
	 * to visually align/separate an inlay hint.
	 */
	paddingLeft?: boolean;

	/**
	 * Render padding after the hint.
	 *
	 * Note: Padding should use the editor's background color, not the
	 * background color of the hint itself. That means padding can be used
	 * to visually align/separate an inlay hint.
	 */
	paddingRight?: boolean;


	/**
	 * A data entry field that is preserved on a inlay hint between
	 * a `textDocument/inlayHint` and a `inlayHint/resolve` request.
	 */
	data?: LSPAny;
};
```

<div class="anchorHolder"><a href="#inlayHintLabelPart" name="inlayHintLabelPart" class="linkableAnchor"></a></div>

```typescript
/**
 * An inlay hint label part allows for interactive and composite labels
 * of inlay hints.
 *
 * @since 3.17.0 - proposed state
 */
export type InlayHintLabelPart = {

	/**
	 * The value of this label part.
	 */
	value: string;

	/**
	 * The tooltip text when you hover over this label part. Depending on
	 * the client capability `inlayHint.resolveSupport` clients might resolve
	 * this property late using the resolve request.
	 */
	tooltip?: string | MarkupContent;

	/**
	 * An optional source code location that represents this
	 * label part.
	 *
	 * The editor will use this location for the hover and for code navigation
	 * features: This part will become a clickable link that resolves to the
	 * definition of the symbol at the given location (not necessarily the
	 * location itself), it shows the hover that shows at the given location,
	 * and it shows a context menu with further code navigation commands.
	 *
	 * Depending on the client capability `inlayHint.resolveSupport` clients
	 * might resolve this property late using the resolve request.
	 */
	location?: Location;

	/**
	 * An optional command for this label part.
	 *
	 * Depending on the client capability `inlayHint.resolveSupport` clients
	 * might resolve this property late using the resolve request.
	 */
	command?: Command;
};
```

<div class="anchorHolder"><a href="#inlayHintKind" name="inlayHintKind" class="linkableAnchor"></a></div>

```typescript
/**
 * Inlay hint kinds.
 *
 * @since 3.17.0 - proposed state
 */
export namespace InlayHintKind {

	/**
	 * An inlay hint that for a type annotation.
	 */
	export const Type = 1;

	/**
	 * An inlay hint that is for a parameter.
	 */
	export const Parameter = 2;
};
```

* error: code and message set in case an exception happens during the inlay hint request.

#### <a href="#inlayHint_resolve" name="inlayHint_resolve" class="anchor">Inlay Hint Resolve Request (:leftwards_arrow_with_hook:)</a>

> *Since version 3.17.0*

The request is sent from the client to the server to resolve additional information for a given inlay hint. This is usually used to compute
the `tooltip`, `location` or `command` properties of a inlay hint's label part to avoid its unnecessary computation during the `textDocument/inlayHint` request.

Consider the clients announces the `label.location` property as a property that can be resolved lazy using the client capability

```typescript
textDocument.inlayHint.resolveSupport = { properties: ['label.location'] };
```

then an inlay hint with a label part without a location needs to be resolved using the `inlayHint/resolve` request before it can be used.

_Client Capability_:
* property name (optional): `textDocument.inlayHint.resolveSupport`
* property type: `{ properties: string[]; }`

_Request_:
* method: `inlayHint/resolve`
* params: `InlayHint`

_Response_:
* result: `InlayHint`
* error: code and message set in case an exception happens during the completion resolve request.

#### <a href="#workspace_inlayHint_refresh" name="workspace_inlayHint_refresh" class="anchor">Inlay Hint Refresh Request  (:arrow_right_hook:)</a>

> *Since version 3.17.0*

The `workspace/inlayHint/refresh` request is sent from the server to the client. Servers can use it to ask clients to refresh the inlay hints currently shown in editors. As a result the client should ask the server to recompute the inlay hints for these editors. This is useful if a server detects a configuration change which requires a re-calculation of all inlay hints. Note that the client still has the freedom to delay the re-calculation of the inlay hints if for example an editor is currently not visible.

_Client Capability_:

* property name (optional): `workspace.inlayHint`
* property type: `InlayHintWorkspaceClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#inlayHintWorkspaceClientCapabilities" name="inlayHintWorkspaceClientCapabilities" class="linkableAnchor"></a></div>

```typescript
/**
 * Client workspace capabilities specific to inlay hints.
 *
 * @since 3.17.0 - proposed state
 */
export type InlayHintWorkspaceClientCapabilities = {
	/**
	 * Whether the client implementation supports a refresh request sent from
	 * the server to the client.
	 *
	 * Note that this event is global and will force the client to refresh all
	 * inlay hints currently shown. It should be used with absolute care and
	 * is useful for situation where a server for example detects a project wide
	 * change that requires such a calculation.
	 */
	refreshSupport?: boolean;
};
```

_Request_:
* method: `workspace/inlayHint/refresh`
* params: none

_Response_:

* result: void
* error: code and message set in case an exception happens during the 'workspace/inlayHint/refresh' request
