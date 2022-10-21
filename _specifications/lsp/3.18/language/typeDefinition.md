#### <a href="#textDocument_typeDefinition" name="textDocument_typeDefinition" class="anchor">Goto Type Definition Request (:leftwards_arrow_with_hook:)</a>

> *Since version 3.6.0*

The go to type definition request is sent from the client to the server to resolve the type definition location of a symbol at a given text document position.

The result type [`LocationLink`](#locationLink)[] got introduced with version 3.14.0 and depends on the corresponding client capability `textDocument.typeDefinition.linkSupport`.

_Client Capability_:
* property name (optional): `textDocument.typeDefinition`
* property type: `TypeDefinitionClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#typeDefinitionClientCapabilities" name="typeDefinitionClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface TypeDefinitionClientCapabilities {
	/**
	 * Whether implementation supports dynamic registration. If this is set to
	 * `true` the client supports the new `TypeDefinitionRegistrationOptions`
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
* property name (optional): `typeDefinitionProvider`
* property type: `boolean | TypeDefinitionOptions | TypeDefinitionRegistrationOptions` where `TypeDefinitionOptions` is defined as follows:

<div class="anchorHolder"><a href="#typeDefinitionOptions" name="typeDefinitionOptions" class="linkableAnchor"></a></div>

```typescript
export interface TypeDefinitionOptions extends WorkDoneProgressOptions {
}
```

_Registration Options_: `TypeDefinitionRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#typeDefinitionRegistrationOptions" name="typeDefinitionRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface TypeDefinitionRegistrationOptions extends
	TextDocumentRegistrationOptions, TypeDefinitionOptions,
	StaticRegistrationOptions {
}
```

_Request_:
* method: `textDocument/typeDefinition`
* params: `TypeDefinitionParams` defined as follows:

<div class="anchorHolder"><a href="#typeDefinitionParams" name="typeDefinitionParams" class="linkableAnchor"></a></div>

```typescript
export interface TypeDefinitionParams extends TextDocumentPositionParams,
	WorkDoneProgressParams, PartialResultParams {
}
```

_Response_:
* result: [`Location`](#location) \| [`Location`](#location)[] \| [`LocationLink`](#locationLink)[] \| `null`
* partial result: [`Location`](#location)[] \| [`LocationLink`](#locationLink)[]
* error: code and message set in case an exception happens during the definition request.
