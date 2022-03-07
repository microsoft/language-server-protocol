#### <a href="#textDocument_declaration" name="textDocument_declaration" class="anchor">Goto Declaration Request (:leftwards_arrow_with_hook:)</a>

> *Since version 3.14.0*

The go to declaration request is sent from the client to the server to resolve the declaration location of a symbol at a given text document position.

The result type [`LocationLink`](#locationLink)[] got introduced with version 3.14.0 and depends on the corresponding client capability `textDocument.declaration.linkSupport`.

_Client Capability_:
* property name (optional): `textDocument.declaration`
* property type: `DeclarationClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#declarationClientCapabilities" name="declarationClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface DeclarationClientCapabilities {
	/**
	 * Whether declaration supports dynamic registration. If this is set to
	 * `true` the client supports the new `DeclarationRegistrationOptions`
	 * return value for the corresponding server capability as well.
	 */
	dynamicRegistration?: boolean;

	/**
	 * The client supports additional metadata in the form of declaration links.
	 */
	linkSupport?: boolean;
}
```

_Server Capability_:
* property name (optional): `declarationProvider`
* property type: `boolean | DeclarationOptions | DeclarationRegistrationOptions` where `DeclarationOptions` is defined as follows:

<div class="anchorHolder"><a href="#declarationOptions" name="declarationOptions" class="linkableAnchor"></a></div>

```typescript
export interface DeclarationOptions extends WorkDoneProgressOptions {
}
```

_Registration Options_: `DeclarationRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#declarationRegistrationOptions" name="declarationRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface DeclarationRegistrationOptions extends DeclarationOptions,
	TextDocumentRegistrationOptions, StaticRegistrationOptions {
}
```

_Request_:
* method: `textDocument/declaration`
* params: `DeclarationParams` defined as follows:

<div class="anchorHolder"><a href="#declarationParams" name="declarationParams" class="linkableAnchor"></a></div>

```typescript
export interface DeclarationParams extends TextDocumentPositionParams,
	WorkDoneProgressParams, PartialResultParams {
}
```

_Response_:
* result: [`Location`](#location) \| [`Location`](#location)[] \| [`LocationLink`](#locationLink)[] \|`null`
* partial result: [`Location`](#location)[] \| [`LocationLink`](#locationLink)[]
* error: code and message set in case an exception happens during the declaration request.
