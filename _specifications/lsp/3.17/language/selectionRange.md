#### <a href="#textDocument_selectionRange" name="textDocument_selectionRange" class="anchor">Selection Range Request (:leftwards_arrow_with_hook:)</a>

> *Since version 3.15.0*

The selection range request is sent from the client to the server to return suggested selection ranges at an array of given positions. A selection range is a range around the cursor position which the user might be interested in selecting.

A selection range in the return array is for the position in the provided parameters at the same index. Therefore positions[i] must be contained in result[i].range. To allow for results where some positions have selection ranges and others do not, result[i].range is allowed to be the empty range at positions[i].

Typically, but not necessary, selection ranges correspond to the nodes of the syntax tree.

_Client Capability_:
* property name (optional): `textDocument.selectionRange`
* property type: `SelectionRangeClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#selectionRangeClientCapabilities" name="selectionRangeClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface SelectionRangeClientCapabilities {
	/**
	 * Whether implementation supports dynamic registration for selection range
	 * providers. If this is set to `true` the client supports the new
	 * `SelectionRangeRegistrationOptions` return value for the corresponding
	 * server capability as well.
	 */
	dynamicRegistration?: boolean;
}
```

_Server Capability_:
* property name (optional): `selectionRangeProvider`
* property type: `boolean | SelectionRangeOptions | SelectionRangeRegistrationOptions` where `SelectionRangeOptions` is defined as follows:

<div class="anchorHolder"><a href="#selectionRangeOptions" name="selectionRangeOptions" class="linkableAnchor"></a></div>

```typescript
export interface SelectionRangeOptions extends WorkDoneProgressOptions {
}
```

_Registration Options_: `SelectionRangeRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#selectionRangeRegistrationOptions" name="selectionRangeRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface SelectionRangeRegistrationOptions extends
	SelectionRangeOptions, TextDocumentRegistrationOptions,
	StaticRegistrationOptions {
}
```

_Request_:

* method: `textDocument/selectionRange`
* params: `SelectionRangeParams` defined as follows:

<div class="anchorHolder"><a href="#selectionRangeParams" name="selectionRangeParams" class="linkableAnchor"></a></div>

```typescript
export interface SelectionRangeParams extends WorkDoneProgressParams,
	PartialResultParams {
	/**
	 * The text document.
	 */
	textDocument: TextDocumentIdentifier;

	/**
	 * The positions inside the text document.
	 */
	positions: Position[];
}
```

_Response_:

* result: `SelectionRange[] | null` defined as follows:

<div class="anchorHolder"><a href="#selectionRange" name="selectionRange" class="linkableAnchor"></a></div>

```typescript
export interface SelectionRange {
	/**
	 * The [range](#Range) of this selection range.
	 */
	range: Range;
	/**
	 * The parent selection range containing this range. Therefore
	 * `parent.range` must contain `this.range`.
	 */
	parent?: SelectionRange;
}
```

* partial result: `SelectionRange[]`
* error: code and message set in case an exception happens during the 'textDocument/selectionRange' request
