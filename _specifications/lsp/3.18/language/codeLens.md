#### <a href="#textDocument_codeLens" name="textDocument_codeLens" class="anchor">Code Lens Request (:leftwards_arrow_with_hook:)</a>

The code lens request is sent from the client to the server to compute code lenses for a given text document.

_Client Capability_:
* property name (optional): `textDocument.codeLens`
* property type: `CodeLensClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#codeLensClientCapabilities" name="codeLensClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface CodeLensClientCapabilities {
	/**
	 * Whether code lens supports dynamic registration.
	 */
	dynamicRegistration?: boolean;
}
```

_Server Capability_:
* property name (optional): `codeLensProvider`
* property type: `CodeLensOptions` defined as follows:

<div class="anchorHolder"><a href="#codeLensOptions" name="codeLensOptions" class="linkableAnchor"></a></div>

```typescript
export interface CodeLensOptions extends WorkDoneProgressOptions {
	/**
	 * Code lens has a resolve provider as well.
	 */
	resolveProvider?: boolean;
}
```

_Registration Options_: `CodeLensRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#codeLensRegistrationOptions" name="codeLensRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface CodeLensRegistrationOptions extends
	TextDocumentRegistrationOptions, CodeLensOptions {
}
```

_Request_:
* method: `textDocument/codeLens`
* params: `CodeLensParams` defined as follows:

<div class="anchorHolder"><a href="#codeLensParams" name="codeLensParams" class="linkableAnchor"></a></div>

```typescript
interface CodeLensParams extends WorkDoneProgressParams, PartialResultParams {
	/**
	 * The document to request code lens for.
	 */
	textDocument: TextDocumentIdentifier;
}
```

_Response_:
* result: `CodeLens[]` \| `null` defined as follows:

<div class="anchorHolder"><a href="#codeLens" name="codeLens" class="linkableAnchor"></a></div>

```typescript
/**
 * A code lens represents a command that should be shown along with
 * source text, like the number of references, a way to run tests, etc.
 *
 * A code lens is _unresolved_ when no command is associated to it. For
 * performance reasons the creation of a code lens and resolving should be done
 * in two stages.
 */
interface CodeLens {
	/**
	 * The range in which this code lens is valid. Should only span a single
	 * line.
	 */
	range: Range;

	/**
	 * The command this code lens represents.
	 */
	command?: Command;

	/**
	 * A data entry field that is preserved on a code lens item between
	 * a code lens and a code lens resolve request.
	 */
	data?: LSPAny;
}
```
* partial result: `CodeLens[]`
* error: code and message set in case an exception happens during the code lens request.

#### <a href="#codeLens_resolve" name="codeLens_resolve" class="anchor">Code Lens Resolve Request (:leftwards_arrow_with_hook:)</a>

The code lens resolve request is sent from the client to the server to resolve the command for a given code lens item.

_Request_:
* method: `codeLens/resolve`
* params: `CodeLens`

_Response_:
* result: `CodeLens`
* error: code and message set in case an exception happens during the code lens resolve request.

#### <a href="#codeLens_refresh" name="codeLens_refresh" class="anchor">Code Lens Refresh Request (:arrow_right_hook:)</a>

> *Since version 3.16.0*

The `workspace/codeLens/refresh` request is sent from the server to the client. Servers can use it to ask clients to refresh the code lenses currently shown in editors. As a result the client should ask the server to recompute the code lenses for these editors. This is useful if a server detects a configuration change which requires a re-calculation of all code lenses. Note that the client still has the freedom to delay the re-calculation of the code lenses if for example an editor is currently not visible.

_Client Capability_:

* property name (optional): `workspace.codeLens`
* property type: `CodeLensWorkspaceClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#codeLensWorkspaceClientCapabilities" name="codeLensWorkspaceClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface CodeLensWorkspaceClientCapabilities {
	/**
	 * Whether the client implementation supports a refresh request sent from the
	 * server to the client.
	 *
	 * Note that this event is global and will force the client to refresh all
	 * code lenses currently shown. It should be used with absolute care and is
	 * useful for situation where a server for example detect a project wide
	 * change that requires such a calculation.
	 */
	refreshSupport?: boolean;
}
```

_Request_:

* method: `workspace/codeLens/refresh`
* params: none

_Response_:

* result: void
* error: code and message set in case an exception happens during the 'workspace/codeLens/refresh' request
