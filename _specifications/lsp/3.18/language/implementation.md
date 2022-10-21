#### <a href="#textDocument_implementation" name="textDocument_implementation" class="anchor">Goto Implementation Request (:leftwards_arrow_with_hook:)</a>

> *Since version 3.6.0*

The go to implementation request is sent from the client to the server to resolve the implementation location of a symbol at a given text document position.

The result type [`LocationLink`](#locationLink)[] got introduced with version 3.14.0 and depends on the corresponding client capability `textDocument.implementation.linkSupport`.

_Client Capability_:
* property name (optional): `textDocument.implementation`
* property type: `ImplementationClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#implementationClientCapabilities" name="implementationClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface ImplementationClientCapabilities {
	/**
	 * Whether implementation supports dynamic registration. If this is set to
	 * `true` the client supports the new `ImplementationRegistrationOptions`
	 * return value for the corresponding server capability as well.
	 */
	dynamicRegistration?: boolean;

	/**
	 * The client supports additional metadata in the form of definition links.
	 *
	 * @since 3.14.0
	 */
	linkSupport?: boolean;
}
```

_Server Capability_:
* property name (optional): `implementationProvider`
* property type: `boolean | ImplementationOptions | ImplementationRegistrationOptions` where `ImplementationOptions` is defined as follows:

<div class="anchorHolder"><a href="#implementationOptions" name="implementationOptions" class="linkableAnchor"></a></div>

```typescript
export interface ImplementationOptions extends WorkDoneProgressOptions {
}
```

_Registration Options_: `ImplementationRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#implementationRegistrationOptions" name="implementationRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface ImplementationRegistrationOptions extends
	TextDocumentRegistrationOptions, ImplementationOptions,
	StaticRegistrationOptions {
}
```

_Request_:
* method: `textDocument/implementation`
* params: `ImplementationParams` defined as follows:

<div class="anchorHolder"><a href="#implementationParams" name="implementationParams" class="linkableAnchor"></a></div>

```typescript
export interface ImplementationParams extends TextDocumentPositionParams,
	WorkDoneProgressParams, PartialResultParams {
}
```

_Response_:
* result: [`Location`](#location) \| [`Location`](#location)[] \| [`LocationLink`](#locationLink)[] \| `null`
* partial result: [`Location`](#location)[] \| [`LocationLink`](#locationLink)[]
* error: code and message set in case an exception happens during the definition request.
