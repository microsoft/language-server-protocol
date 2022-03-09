#### <a href="#workspace_didChangeWorkspaceFolders" name="workspace_didChangeWorkspaceFolders" class="anchor">DidChangeWorkspaceFolders Notification (:arrow_right:)</a>

> *Since version 3.6.0*

The `workspace/didChangeWorkspaceFolders` notification is sent from the client to the server to inform the server about workspace folder configuration changes. The notification is sent by default if both _client capability_ `workspace.workspaceFolders` and the _server capability_ `workspace.workspaceFolders.supported` are true; or if the server has registered itself to receive this notification. To register for the `workspace/didChangeWorkspaceFolders` send a `client/registerCapability` request from the server to the client. The registration parameter must have a `registrations` item of the following form, where `id` is a unique id used to unregister the capability (the example uses a UUID):
```ts
{
	id: "28c6150c-bd7b-11e7-abc4-cec278b6b50a",
	method: "workspace/didChangeWorkspaceFolders"
}
```

_Notification_:
* method: 'workspace/didChangeWorkspaceFolders'
* params: `DidChangeWorkspaceFoldersParams` defined as follows:

<div class="anchorHolder"><a href="#didChangeWorkspaceFoldersParams" name="didChangeWorkspaceFoldersParams" class="linkableAnchor"></a></div>

```typescript
export interface DidChangeWorkspaceFoldersParams {
	/**
	 * The actual workspace folder change event.
	 */
	event: WorkspaceFoldersChangeEvent;
}
```

<div class="anchorHolder"><a href="#workspaceFoldersChangeEvent" name="workspaceFoldersChangeEvent" class="linkableAnchor"></a></div>

```typescript
/**
 * The workspace folder change event.
 */
export interface WorkspaceFoldersChangeEvent {
	/**
	 * The array of added workspace folders
	 */
	added: WorkspaceFolder[];

	/**
	 * The array of the removed workspace folders
	 */
	removed: WorkspaceFolder[];
}
```
