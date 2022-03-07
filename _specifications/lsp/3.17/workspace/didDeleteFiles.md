#### <a href="#workspace_didDeleteFiles" name="workspace_didDeleteFiles" class="anchor">DidDeleteFiles Notification (:arrow_right:)</a>

The did delete files notification is sent from the client to the server when files were deleted from within the client.

_Client Capability_:
* property name (optional): `workspace.fileOperations.didDelete`
* property type: `boolean`

The capability indicates that the client supports sending `workspace/didDeleteFiles` notifications.

_Server Capability_:
* property name (optional): `workspace.fileOperations.didDelete`
* property type: `FileOperationRegistrationOptions`

The capability indicates that the server is interested in receiving `workspace/didDeleteFiles` notifications.

_Notification_:
* method: 'workspace/didDeleteFiles'
* params: `DeleteFilesParams`
