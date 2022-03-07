#### <a href="#workspace_executeCommand" name="workspace_executeCommand" class="anchor">Execute a command (:leftwards_arrow_with_hook:)</a>

The `workspace/executeCommand` request is sent from the client to the server to trigger command execution on the server. In most cases the server creates a `WorkspaceEdit` structure and applies the changes to the workspace using the request `workspace/applyEdit` which is sent from the server to the client.

_Client Capability_:
* property path (optional): `workspace.executeCommand`
* property type: `ExecuteCommandClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#executeCommandClientCapabilities" name="executeCommandClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface ExecuteCommandClientCapabilities {
	/**
	 * Execute command supports dynamic registration.
	 */
	dynamicRegistration?: boolean;
}
```

_Server Capability_:
* property path (optional): `executeCommandProvider`
* property type: `ExecuteCommandOptions` defined as follows:

<div class="anchorHolder"><a href="#executeCommandOptions" name="executeCommandOptions" class="linkableAnchor"></a></div>

```typescript
export interface ExecuteCommandOptions extends WorkDoneProgressOptions {
	/**
	 * The commands to be executed on the server
	 */
	commands: string[];
}
```

_Registration Options_: `ExecuteCommandRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#executeCommandRegistrationOptions" name="executeCommandRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
/**
 * Execute command registration options.
 */
export interface ExecuteCommandRegistrationOptions
	extends ExecuteCommandOptions {
}
```

_Request_:
* method: 'workspace/executeCommand'
* params: `ExecuteCommandParams` defined as follows:

<div class="anchorHolder"><a href="#executeCommandParams" name="executeCommandParams" class="linkableAnchor"></a></div>

```typescript
export interface ExecuteCommandParams extends WorkDoneProgressParams {

	/**
	 * The identifier of the actual command handler.
	 */
	command: string;
	/**
	 * Arguments that the command should be invoked with.
	 */
	arguments?: LSPAny[];
}
```

The arguments are typically specified when a command is returned from the server to the client. Example requests that return a command are `textDocument/codeAction` or `textDocument/codeLens`.

_Response_:
* result: `LSPAny` \| `null`
* error: code and message set in case an exception happens during the request.
