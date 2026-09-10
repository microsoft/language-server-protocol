#### <a href="#textDocument_documentColor" name="textDocument_documentColor" class="anchor">Document Color Request (:leftwards_arrow_with_hook:)</a>

> *Since version 3.6.0*

The document color request is sent from the client to the server to list all color references found in a given text document. Along with the range, a color value in RGB is returned.

Clients can use the result to decorate color references in an editor. For example:
- Color boxes showing the actual color next to the reference
- Show a color picker when a color reference is edited

_Client Capability_:
* property name (optional): `textDocument.colorProvider`
* property type: `DocumentColorClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#documentColorClientCapabilities" name="documentColorClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface DocumentColorClientCapabilities {
	/**
	 * Whether document color supports dynamic registration.
	 */
	dynamicRegistration?: boolean;
}
```

_Server Capability_:
* property name (optional): `colorProvider`
* property type: `boolean | DocumentColorOptions | DocumentColorRegistrationOptions` where `DocumentColorOptions` is defined as follows:

<div class="anchorHolder"><a href="#documentColorOptions" name="documentColorOptions" class="linkableAnchor"></a></div>

```typescript
export interface DocumentColorOptions extends WorkDoneProgressOptions {
}
```

_Registration Options_: `DocumentColorRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#documentColorRegistrationOptions" name="documentColorRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface DocumentColorRegistrationOptions extends
	TextDocumentRegistrationOptions, StaticRegistrationOptions,
	DocumentColorOptions {
}
```

_Request_:

* method: `textDocument/documentColor`
* params: `DocumentColorParams` defined as follows

<div class="anchorHolder"><a href="#documentColorParams" name="documentColorParams" class="linkableAnchor"></a></div>

```typescript
interface DocumentColorParams extends WorkDoneProgressParams,
	PartialResultParams {
	/**
	 * The text document.
	 */
	textDocument: TextDocumentIdentifier;
}
```

_Response_:
* result: `ColorInformation[]` defined as follows:

<div class="anchorHolder"><a href="#colorInformation" name="colorInformation" class="linkableAnchor"></a></div>

```typescript
interface ColorInformation {
	/**
	 * The range in the document where this color appears.
	 */
	range: Range;

	/**
	 * The actual color value for this color range.
	 */
	color: Color;
}
```

<div class="anchorHolder"><a href="#color" name="color" class="linkableAnchor"></a></div>

```typescript
/**
 * Represents a color in RGBA space.
 */
interface Color {

	/**
	 * The red component of this color in the range [0-1].
	 */
	readonly red: decimal;

	/**
	 * The green component of this color in the range [0-1].
	 */
	readonly green: decimal;

	/**
	 * The blue component of this color in the range [0-1].
	 */
	readonly blue: decimal;

	/**
	 * The alpha component of this color in the range [0-1].
	 */
	readonly alpha: decimal;
}
```
* partial result: `ColorInformation[]`
* error: code and message set in case an exception happens during the 'textDocument/documentColor' request
