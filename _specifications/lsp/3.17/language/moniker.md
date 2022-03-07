#### <a href="#textDocument_moniker" name="textDocument_moniker" class="anchor">Monikers (:leftwards_arrow_with_hook:)</a>

> *Since version 3.16.0*

Language Server Index Format (LSIF) introduced the concept of symbol monikers to help associate symbols across different indexes. This request adds capability for LSP server implementations to provide the same symbol moniker information given a text document position. Clients can utilize this method to get the moniker at the current location in a file user is editing and do further code navigation queries in other services that rely on LSIF indexes and link symbols together.

The `textDocument/moniker` request is sent from the client to the server to get the symbol monikers for a given text document position. An array of Moniker types is returned as response to indicate possible monikers at the given location. If no monikers can be calculated, an empty array or `null` should be returned.

_Client Capabilities_:

* property name (optional): `textDocument.moniker`
* property type: `MonikerClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#monikerClientCapabilities" name="monikerClientCapabilities" class="linkableAnchor"></a></div>

```typescript
interface MonikerClientCapabilities {
	/**
	 * Whether implementation supports dynamic registration. If this is set to
	 * `true` the client supports the new `(TextDocumentRegistrationOptions &
	 * StaticRegistrationOptions)` return value for the corresponding server
	 * capability as well.
	 */
	dynamicRegistration?: boolean;
}
```

_Server Capability_:

* property name (optional): `monikerProvider`
* property type: `boolean | MonikerOptions | MonikerRegistrationOptions` is defined as follows:

<div class="anchorHolder"><a href="#monikerOptions" name="monikerOptions" class="linkableAnchor"></a></div>

```typescript
export interface MonikerOptions extends WorkDoneProgressOptions {
}
```

_Registration Options_: `MonikerRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#monikerRegistrationOptions" name="monikerRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface MonikerRegistrationOptions extends
	TextDocumentRegistrationOptions, MonikerOptions {
}
```

_Request_:

* method: `textDocument/moniker`
* params: `MonikerParams` defined as follows:

<div class="anchorHolder"><a href="#monikerParams" name="monikerParams" class="linkableAnchor"></a></div>

```typescript
export interface MonikerParams extends TextDocumentPositionParams,
	WorkDoneProgressParams, PartialResultParams {
}
```

_Response_:

* result: `Moniker[] | null`
* partial result: `Moniker[]`
* error: code and message set in case an exception happens during the 'textDocument/moniker' request

`Moniker` is defined as follows:

<div class="anchorHolder"><a href="#uniquenessLevel" name="uniquenessLevel" class="linkableAnchor"></a></div>

```typescript
/**
 * Moniker uniqueness level to define scope of the moniker.
 */
export enum UniquenessLevel {
	/**
	 * The moniker is only unique inside a document
	 */
	document = 'document',

	/**
	 * The moniker is unique inside a project for which a dump got created
	 */
	project = 'project',

	/**
	 * The moniker is unique inside the group to which a project belongs
	 */
	group = 'group',

	/**
	 * The moniker is unique inside the moniker scheme.
	 */
	scheme = 'scheme',

	/**
	 * The moniker is globally unique
	 */
	global = 'global'
}
```

<div class="anchorHolder"><a href="#monikerKind" name="monikerKind" class="linkableAnchor"></a></div>

```typescript
/**
 * The moniker kind.
 */
export enum MonikerKind {
	/**
	 * The moniker represent a symbol that is imported into a project
	 */
	import = 'import',

	/**
	 * The moniker represents a symbol that is exported from a project
	 */
	export = 'export',

	/**
	 * The moniker represents a symbol that is local to a project (e.g. a local
	 * variable of a function, a class not visible outside the project, ...)
	 */
	local = 'local'
}
```

<div class="anchorHolder"><a href="#moniker" name="moniker" class="linkableAnchor"></a></div>

```typescript
/**
 * Moniker definition to match LSIF 0.5 moniker definition.
 */
export interface Moniker {
	/**
	 * The scheme of the moniker. For example tsc or .Net
	 */
	scheme: string;

	/**
	 * The identifier of the moniker. The value is opaque in LSIF however
	 * schema owners are allowed to define the structure if they want.
	 */
	identifier: string;

	/**
	 * The scope in which the moniker is unique
	 */
	unique: UniquenessLevel;

	/**
	 * The moniker kind if known.
	 */
	kind?: MonikerKind;
}
```

##### Notes

Server implementations of this method should ensure that the moniker calculation matches to those used in the corresponding LSIF implementation to ensure symbols can be associated correctly across IDE sessions and LSIF indexes.