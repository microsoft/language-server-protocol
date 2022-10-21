#### <a href="#textDocument_documentHighlight" name="textDocument_documentHighlight" class="anchor">Document Highlights Request (:leftwards_arrow_with_hook:)</a>

The document highlight request is sent from the client to the server to resolve a document highlights for a given text document position.
For programming languages this usually highlights all references to the symbol scoped to this file. However we kept 'textDocument/documentHighlight'
and 'textDocument/references' separate requests since the first one is allowed to be more fuzzy. Symbol matches usually have a `DocumentHighlightKind`
of `Read` or `Write` whereas fuzzy or textual matches use `Text`as the kind.

_Client Capability_:
* property name (optional): `textDocument.documentHighlight`
* property type: `DocumentHighlightClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#documentHighlightClientCapabilities" name="documentHighlightClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface DocumentHighlightClientCapabilities {
	/**
	 * Whether document highlight supports dynamic registration.
	 */
	dynamicRegistration?: boolean;
}
```

_Server Capability_:
* property name (optional): `documentHighlightProvider`
* property type: `boolean | DocumentHighlightOptions` where `DocumentHighlightOptions` is defined as follows:

<div class="anchorHolder"><a href="#documentHighlightOptions" name="documentHighlightOptions" class="linkableAnchor"></a></div>

```typescript
export interface DocumentHighlightOptions extends WorkDoneProgressOptions {
}
```

_Registration Options_: `DocumentHighlightRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#documentHighlightRegistrationOptions" name="documentHighlightRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface DocumentHighlightRegistrationOptions extends
	TextDocumentRegistrationOptions, DocumentHighlightOptions {
}
```

_Request_:
* method: `textDocument/documentHighlight`
* params: `DocumentHighlightParams` defined as follows:

<div class="anchorHolder"><a href="#documentHighlightParams" name="documentHighlightParams" class="linkableAnchor"></a></div>

```typescript
export interface DocumentHighlightParams extends TextDocumentPositionParams,
	WorkDoneProgressParams, PartialResultParams {
}
```

_Response_:
* result: `DocumentHighlight[]` \| `null` defined as follows:

<div class="anchorHolder"><a href="#documentHighlight" name="documentHighlight" class="linkableAnchor"></a></div>

```typescript
/**
 * A document highlight is a range inside a text document which deserves
 * special attention. Usually a document highlight is visualized by changing
 * the background color of its range.
 *
 */
export interface DocumentHighlight {
	/**
	 * The range this highlight applies to.
	 */
	range: Range;

	/**
	 * The highlight kind, default is DocumentHighlightKind.Text.
	 */
	kind?: DocumentHighlightKind;
}
```

<div class="anchorHolder"><a href="#documentHighlightKind" name="documentHighlightKind" class="linkableAnchor"></a></div>

```typescript
/**
 * A document highlight kind.
 */
export namespace DocumentHighlightKind {
	/**
	 * A textual occurrence.
	 */
	export const Text = 1;

	/**
	 * Read-access of a symbol, like reading a variable.
	 */
	export const Read = 2;

	/**
	 * Write-access of a symbol, like writing to a variable.
	 */
	export const Write = 3;
}

export type DocumentHighlightKind = 1 | 2 | 3;
```

* partial result: `DocumentHighlight[]`
* error: code and message set in case an exception happens during the document highlight request.
