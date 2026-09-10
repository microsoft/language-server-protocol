#### <a href="#workspace_didRenameFiles" name="workspace_didRenameFiles" class="anchor">DidRenameFiles Notification (:arrow_right:)</a>

The did rename files notification is sent from the client to the server when files were renamed from within the client.

_Client Capability_:
* property name (optional): `workspace.fileOperations.didRename`
* property type: `boolean`

The capability indicates that the client supports sending `workspace/didRenameFiles` notifications.

_Server Capability_:
* property name (optional): `workspace.fileOperations.didRename`
* property type: `FileOperationRegistrationOptions`

The capability indicates that the server is interested in receiving `workspace/didRenameFiles` notifications.

_Notification_:
* method: 'workspace/didRenameFiles'
* params: `RenameFilesParams`
