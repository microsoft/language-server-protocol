#### <a href="#textDocument_linkedEditingRange" name="textDocument_linkedEditingRange" class="anchor">Linked Editing Range(:leftwards_arrow_with_hook:)</a>

> *Since version 3.16.0*

The linked editing request is sent from the client to the server to return for a given position in a document the range of the symbol at the position and all ranges that have the same content. Optionally a word pattern can be returned to describe valid contents. A rename to one of the ranges can be applied to all other ranges if the new content is valid. If no result-specific word pattern is provided, the word pattern from the client's language configuration is used.

_Client Capabilities_:

* property name (optional): `textDocument.linkedEditingRange`
* property type: `LinkedEditingRangeClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#linkedEditingRangeClientCapabilities" name="linkedEditingRangeClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface LinkedEditingRangeClientCapabilities {
	/**
	 * Whether implementation supports dynamic registration.
	 * If this is set to `true` the client supports the new
	 * `(TextDocumentRegistrationOptions & StaticRegistrationOptions)`
	 * return value for the corresponding server capability as well.
	 */
	dynamicRegistration?: boolean;
}
```

_Server Capability_:

* property name (optional): `linkedEditingRangeProvider`
* property type: `boolean` \| `LinkedEditingRangeOptions` \| `LinkedEditingRangeRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#linkedEditingRangeOptions" name="linkedEditingRangeOptions" class="linkableAnchor"></a></div>

```typescript
export interface LinkedEditingRangeOptions extends WorkDoneProgressOptions {
}
```

_Registration Options_: `LinkedEditingRangeRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#linkedEditingRangeRegistrationOptions" name="linkedEditingRangeRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface LinkedEditingRangeRegistrationOptions extends
	TextDocumentRegistrationOptions, LinkedEditingRangeOptions,
	StaticRegistrationOptions {
}
```

_Request_:

* method: `textDocument/linkedEditingRange`
* params: `LinkedEditingRangeParams` defined as follows:

<div class="anchorHolder"><a href="#linkedEditingRangeParams" name="linkedEditingRangeParams" class="linkableAnchor"></a></div>

```typescript
export interface LinkedEditingRangeParams extends TextDocumentPositionParams,
	WorkDoneProgressParams {
}
```

_Response_:

* result: `LinkedEditingRanges` \| `null` defined as follows:

<div class="anchorHolder"><a href="#linkedEditingRanges" name="linkedEditingRanges" class="linkableAnchor"></a></div>

```typescript
export interface LinkedEditingRanges {
	/**
	 * A list of ranges that can be renamed together. The ranges must have
	 * identical length and contain identical text content. The ranges cannot overlap.
	 */
	ranges: Range[];

	/**
	 * An optional word pattern (regular expression) that describes valid contents for
	 * the given ranges. If no pattern is provided, the client configuration's word
	 * pattern will be used.
	 */
	wordPattern?: string;
}
```
* error: code and message set in case an exception happens during the 'textDocument/linkedEditingRange' request
