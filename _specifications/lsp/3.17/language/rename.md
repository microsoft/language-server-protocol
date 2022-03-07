#### <a href="#textDocument_rename" name="textDocument_rename" class="anchor">Rename Request (:leftwards_arrow_with_hook:)</a>

The rename request is sent from the client to the server to ask the server to compute a workspace change so that the client can perform a workspace-wide rename of a symbol.

_Client Capability_:
* property name (optional): `textDocument.rename`
* property type: `RenameClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#prepareSupportDefaultBehavior" name="prepareSupportDefaultBehavior" class="linkableAnchor"></a></div>

```typescript
export namespace PrepareSupportDefaultBehavior {
	/**
	 * The client's default behavior is to select the identifier
	 * according the to language's syntax rule.
	 */
	 export const Identifier: 1 = 1;
}
```

<div class="anchorHolder"><a href="#renameClientCapabilities" name="renameClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface RenameClientCapabilities {
	/**
	 * Whether rename supports dynamic registration.
	 */
	dynamicRegistration?: boolean;

	/**
	 * Client supports testing for validity of rename operations
	 * before execution.
	 *
	 * @since version 3.12.0
	 */
	prepareSupport?: boolean;

	/**
	 * Client supports the default behavior result
	 * (`{ defaultBehavior: boolean }`).
	 *
	 * The value indicates the default behavior used by the
	 * client.
	 *
	 * @since version 3.16.0
	 */
	prepareSupportDefaultBehavior?: PrepareSupportDefaultBehavior;

	/**
	 * Whether th client honors the change annotations in
	 * text edits and resource operations returned via the
	 * rename request's workspace edit by for example presenting
	 * the workspace edit in the user interface and asking
	 * for confirmation.
	 *
	 * @since 3.16.0
	 */
	honorsChangeAnnotations?: boolean;
}
```

_Server Capability_:
* property name (optional): `renameProvider`
* property type: `boolean | RenameOptions` where `RenameOptions` is defined as follows:

`RenameOptions` may only be specified if the client states that it supports `prepareSupport` in its initial `initialize` request.

<div class="anchorHolder"><a href="#renameOptions" name="renameOptions" class="linkableAnchor"></a></div>

```typescript
export interface RenameOptions extends WorkDoneProgressOptions {
	/**
	 * Renames should be checked and tested before being executed.
	 */
	prepareProvider?: boolean;
}
```

_Registration Options_: `RenameRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#renameRegistrationOptions" name="renameRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface RenameRegistrationOptions extends
	TextDocumentRegistrationOptions, RenameOptions {
}
```

_Request_:
* method: `textDocument/rename`
* params: `RenameParams` defined as follows

<div class="anchorHolder"><a href="#renameParams" name="renameParams" class="linkableAnchor"></a></div>

```typescript
interface RenameParams extends TextDocumentPositionParams,
	WorkDoneProgressParams {
	/**
	 * The new name of the symbol. If the given name is not valid the
	 * request must return a [ResponseError](#ResponseError) with an
	 * appropriate message set.
	 */
	newName: string;
}
```

_Response_:
* result: [`WorkspaceEdit`](#workspaceedit) \| `null` describing the modification to the workspace. `null` should be treated the same was as [`WorkspaceEdit`](#workspaceedit) with no changes (no change was required).
* error: code and message set in case when rename could not be performed for any reason. Examples include: there is nothing at given `position` to rename (like a space), given symbol does not support renaming by the server or the code is invalid (e.g. does not compile).

#### <a href="#textDocument_prepareRename" name="textDocument_prepareRename" class="anchor">Prepare Rename Request (:leftwards_arrow_with_hook:)</a>

> *Since version 3.12.0*

The prepare rename request is sent from the client to the server to setup and test the validity of a rename operation at a given location.

_Request_:
* method: `textDocument/prepareRename`
* params: `PrepareRenameParams` defined as follows:

<div class="anchorHolder"><a href="#prepareRenameParams" name="prepareRenameParams" class="linkableAnchor"></a></div>

```typescript
export interface PrepareRenameParams extends TextDocumentPositionParams {
}
```

_Response_:
* result: `Range | { range: Range, placeholder: string } | { defaultBehavior: boolean } | null` describing a [`Range`](#range) of the string to rename and optionally a placeholder text of the string content to be renamed. If `{ defaultBehavior: boolean }` is returned (since 3.16) the rename position is valid and the client should use its default behavior to compute the rename range. If `null` is returned then it is deemed that a 'textDocument/rename' request is not valid at the given position.
* error: code and message set in case the element can't be renamed. Clients should show the information in their user interface.
