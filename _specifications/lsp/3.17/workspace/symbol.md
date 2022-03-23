#### <a href="#workspace_symbol" name="workspace_symbol" class="anchor">Workspace Symbols Request (:leftwards_arrow_with_hook:)</a>

The workspace symbol request is sent from the client to the server to list project-wide symbols matching the query string. Since 3.17.0 servers can also provider a handler for `workspaceSymbol/resolve` requests. This allows servers to return workspace symbols without a range for a `workspace/symbol` request. Clients then need to resolve the range when necessary using the `workspaceSymbol/resolve` request. Servers can only use this new model if clients advertise support for it via the `workspace.symbol.resolveSupport` capability.

_Client Capability_:
* property path (optional): `workspace.symbol`
* property type: `WorkspaceSymbolClientCapabilities` defined as follows:

```typescript
interface WorkspaceSymbolClientCapabilities {
	/**
	 * Symbol request supports dynamic registration.
	 */
	dynamicRegistration?: boolean;

	/**
	 * Specific capabilities for the `SymbolKind` in the `workspace/symbol`
	 * request.
	 */
	symbolKind?: {
		/**
		 * The symbol kind values the client supports. When this
		 * property exists the client also guarantees that it will
		 * handle values outside its set gracefully and falls back
		 * to a default value when unknown.
		 *
		 * If this property is not present the client only supports
		 * the symbol kinds from `File` to `Array` as defined in
		 * the initial version of the protocol.
		 */
		valueSet?: SymbolKind[];
	};

	/**
	 * The client supports tags on `SymbolInformation` and `WorkspaceSymbol`.
	 * Clients supporting tags have to handle unknown tags gracefully.
	 *
	 * @since 3.16.0
	 */
	tagSupport?: {
		/**
		 * The tags supported by the client.
		 */
		valueSet: SymbolTag[];
	};

	/**
	 * The client support partial workspace symbols. The client will send the
	 * request `workspaceSymbol/resolve` to the server to resolve additional
	 * properties.
	 *
	 * @since 3.17.0 - proposedState
	 */
	resolveSupport?: {
		/**
		 * The properties that a client can resolve lazily. Usually
		 * `location.range`
		 */
		properties: string[];
	};
}
```

_Server Capability_:
* property path (optional): `workspaceSymbolProvider`
* property type: `boolean | WorkspaceSymbolOptions` where `WorkspaceSymbolOptions` is defined as follows:

<div class="anchorHolder"><a href="#workspaceSymbolOptions" name="workspaceSymbolOptions" class="linkableAnchor"></a></div>

```typescript
export interface WorkspaceSymbolOptions extends WorkDoneProgressOptions {
	/**
	 * The server provides support to resolve additional
	 * information for a workspace symbol.
	 *
	 * @since 3.17.0 - proposed state
	 */
	resolveProvider?: boolean;
}
```

_Registration Options_: `WorkspaceSymbolRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#workspaceSymbolRegistrationOptions" name="workspaceSymbolRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface WorkspaceSymbolRegistrationOptions
	extends WorkspaceSymbolOptions {
}
```

_Request_:
* method: 'workspace/symbol'
* params: `WorkspaceSymbolParams` defined as follows:

<div class="anchorHolder"><a href="#workspaceSymbolParams" name="workspaceSymbolParams" class="linkableAnchor"></a></div>

```typescript
/**
 * The parameters of a Workspace Symbol Request.
 */
interface WorkspaceSymbolParams extends WorkDoneProgressParams,
	PartialResultParams {
	/**
	 * A query string to filter symbols by. Clients may send an empty
	 * string here to request all symbols.
	 */
	query: string;
}
```

_Response_:
* result: `SymbolInformation[]` \| `WorkspaceSymbol[]` \| `null`. See above for the definition of `SymbolInformation`. It is recommended that you use the new `WorkspaceSymbol`. However whether the workspace symbol can return a location without a range depends on the client capability `workspace.symbol.resolveSupport`. `WorkspaceSymbol`which is defined as follows:

<div class="anchorHolder"><a href="#workspaceSymbol" name="workspaceSymbol" class="linkableAnchor"></a></div>

```typescript
/**
 * A special workspace symbol that supports locations without a range
 *
 * @since 3.17.0 - proposed state
 */
export interface WorkspaceSymbol {
	/**
	 * The name of this symbol.
	 */
	name: string;

	/**
	 * The kind of this symbol.
	 */
	kind: SymbolKind;

	/**
	 * Tags for this completion item.
	 */
	tags?: SymbolTag[];

	/**
	 * The location of this symbol. Whether a server is allowed to
	 * return a location without a range depends on the client
	 * capability `workspace.symbol.resolveSupport`.
	 *
	 * See also `SymbolInformation.location`.
	 */
	location: Location | { uri: DocumentUri };

	/**
	 * The name of the symbol containing this symbol. This information is for
	 * user interface purposes (e.g. to render a qualifier in the user interface
	 * if necessary). It can't be used to re-infer a hierarchy for the document
	 * symbols.
	 */
	containerName?: string;
}
```
* partial result: `SymbolInformation[]` \| `WorkspaceSymbol[]` as defined above.
* error: code and message set in case an exception happens during the workspace symbol request.

#### <a href="#workspace_symbolResolve" name="workspace_symbolResolve" class="anchor">Workspace Symbol Resolve Request (:leftwards_arrow_with_hook:)</a>

The request is sent from the client to the server to resolve additional information for a given workspace symbol.

_Request_:
* method: 'workspaceSymbol/resolve'
* params: `WorkspaceSymbol`

_Response_:
* result: `WorkspaceSymbol`
* error: code and message set in case an exception happens during the workspace symbol resolve request.
