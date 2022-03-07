#### <a href="#workspace_applyEdit" name="workspace_applyEdit" class="anchor">Applies a WorkspaceEdit (:arrow_right_hook:)</a>

The `workspace/applyEdit` request is sent from the server to the client to modify resource on the client side.

_Client Capability_:
* property path (optional): `workspace.applyEdit`
* property type: `boolean`

See also the [WorkspaceEditClientCapabilities](#workspaceEditClientCapabilities) for the supported capabilities of a workspace edit.

_Request_:
* method: 'workspace/applyEdit'
* params: `ApplyWorkspaceEditParams` defined as follows:

<div class="anchorHolder"><a href="#applyWorkspaceEditParams" name="applyWorkspaceEditParams" class="linkableAnchor"></a></div>

```typescript
export interface ApplyWorkspaceEditParams {
	/**
	 * An optional label of the workspace edit. This label is
	 * presented in the user interface for example on an undo
	 * stack to undo the workspace edit.
	 */
	label?: string;

	/**
	 * The edits to apply.
	 */
	edit: WorkspaceEdit;
}
```

_Response_:
* result: `ApplyWorkspaceEditResult` defined as follows:

<div class="anchorHolder"><a href="#applyWorkspaceEditResult" name="applyWorkspaceEditResult" class="linkableAnchor"></a></div>

```typescript
export interface ApplyWorkspaceEditResult {
	/**
	 * Indicates whether the edit was applied or not.
	 */
	applied: boolean;

	/**
	 * An optional textual description for why the edit was not applied.
	 * This may be used by the server for diagnostic logging or to provide
	 * a suitable error for a request that triggered the edit.
	 */
	failureReason?: string;

	/**
	 * Depending on the client's failure handling strategy `failedChange`
	 * might contain the index of the change that failed. This property is
	 * only available if the client signals a `failureHandling` strategy
	 * in its client capabilities.
	 */
	failedChange?: uinteger;
}
```
* error: code and message set in case an exception happens during the request.
