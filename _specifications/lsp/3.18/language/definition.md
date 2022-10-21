#### <a href="#textDocument_definition" name="textDocument_definition" class="anchor">Goto Definition Request (:leftwards_arrow_with_hook:)</a>

The go to definition request is sent from the client to the server to resolve the definition location of a symbol at a given text document position.

The result type [`LocationLink`](#locationLink)[] got introduced with version 3.14.0 and depends on the corresponding client capability `textDocument.definition.linkSupport`.

_Client Capability_:
* property name (optional): `textDocument.definition`
* property type: `DefinitionClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#definitionClientCapabilities" name="definitionClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface DefinitionClientCapabilities {
	/**
	 * Whether definition supports dynamic registration.
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
* property name (optional): `definitionProvider`
* property type: `boolean | DefinitionOptions` where `DefinitionOptions` is defined as follows:

<div class="anchorHolder"><a href="#definitionOptions" name="definitionOptions" class="linkableAnchor"></a></div>

```typescript
export interface DefinitionOptions extends WorkDoneProgressOptions {
}
```

_Registration Options_: `DefinitionRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#definitionRegistrationOptions" name="definitionRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface DefinitionRegistrationOptions extends
	TextDocumentRegistrationOptions, DefinitionOptions {
}
```

_Request_:
* method: `textDocument/definition`
* params: `DefinitionParams` defined as follows:

<div class="anchorHolder"><a href="#definitionParams" name="definitionParams" class="linkableAnchor"></a></div>

```typescript
export interface DefinitionParams extends TextDocumentPositionParams,
	WorkDoneProgressParams, PartialResultParams {
}
```

_Response_:
* result: [`Location`](#location) \| [`Location`](#location)[] \| [`LocationLink`](#locationLink)[] \| `null`
* partial result: [`Location`](#location)[] \| [`LocationLink`](#locationLink)[]
* error: code and message set in case an exception happens during the definition request.
