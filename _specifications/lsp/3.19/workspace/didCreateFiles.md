#### <a href="#workspace_didCreateFiles" name="workspace_didCreateFiles" class="anchor">DidCreateFiles Notification (:arrow_right:)</a>

The did create files notification is sent from the client to the server when files were created from within the client.

_Client Capability_:
* property name (optional): `workspace.fileOperations.didCreate`
* property type: `boolean`

The capability indicates that the client supports sending `workspace/didCreateFiles` notifications.

_Server Capability_:
* property name (optional): `workspace.fileOperations.didCreate`
* property type: `FileOperationRegistrationOptions`

The capability indicates that the server is interested in receiving `workspace/didCreateFiles` notifications.

_Notification_:
* method: 'workspace/didCreateFiles'
* params: `CreateFilesParams`
