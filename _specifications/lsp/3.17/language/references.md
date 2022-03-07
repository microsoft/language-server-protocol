#### <a href="#textDocument_references" name="textDocument_references" class="anchor">Find References Request (:leftwards_arrow_with_hook:)</a>

The references request is sent from the client to the server to resolve project-wide references for the symbol denoted by the given text document position.

_Client Capability_:
* property name (optional): `textDocument.references`
* property type: `ReferenceClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#referenceClientCapabilities" name="referenceClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface ReferenceClientCapabilities {
	/**
	 * Whether references supports dynamic registration.
	 */
	dynamicRegistration?: boolean;
}
```

_Server Capability_:
* property name (optional): `referencesProvider`
* property type: `boolean | ReferenceOptions` where `ReferenceOptions` is defined as follows:

<div class="anchorHolder"><a href="#referenceOptions" name="referenceOptions" class="linkableAnchor"></a></div>

```typescript
export interface ReferenceOptions extends WorkDoneProgressOptions {
}
```

_Registration Options_: `ReferenceRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#referenceRegistrationOptions" name="referenceRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface ReferenceRegistrationOptions extends
	TextDocumentRegistrationOptions, ReferenceOptions {
}
```

_Request_:
* method: `textDocument/references`
* params: `ReferenceParams` defined as follows:

<div class="anchorHolder"><a href="#referenceParams" name="referenceParams" class="linkableAnchor"></a></div>

```typescript
export interface ReferenceParams extends TextDocumentPositionParams,
	WorkDoneProgressParams, PartialResultParams {
	context: ReferenceContext;
}
```

<div class="anchorHolder"><a href="#referenceContext" name="referenceContext" class="linkableAnchor"></a></div>

```typescript
export interface ReferenceContext {
	/**
	 * Include the declaration of the current symbol.
	 */
	includeDeclaration: boolean;
}
```
_Response_:
* result: [`Location`](#location)[] \| `null`
* partial result: [`Location`](#location)[]
* error: code and message set in case an exception happens during the reference request.
