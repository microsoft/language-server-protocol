#### <a href="#workspace_willDeleteFiles" name="workspace_willDeleteFiles" class="anchor">WillDeleteFiles Request (:leftwards_arrow_with_hook:)</a>

The will delete files request is sent from the client to the server before files are actually deleted as long as the deletion is triggered from within the client either by a user action or by applying a workspace edit. The request can return a WorkspaceEdit which will be applied to workspace before the files are deleted. Please note that clients might drop results if computing the edit took too long or if a server constantly fails on this request. This is done to keep deletes fast and reliable.

_Client Capability_:
* property name (optional): `workspace.fileOperations.willDelete`
* property type: `boolean`

The capability indicates that the client supports sending `workspace/willDeleteFiles` requests.

_Server Capability_:
* property name (optional): `workspace.fileOperations.willDelete`
* property type: `FileOperationRegistrationOptions`

The capability indicates that the server is interested in receiving `workspace/willDeleteFiles` requests.

_Registration Options_: none

_Request_:
* method: `workspace/willDeleteFiles`
* params: `DeleteFilesParams` defined as follows:

<div class="anchorHolder"><a href="#deleteFilesParams" name="deleteFilesParams" class="linkableAnchor"></a></div>

```typescript
/**
 * The parameters sent in notifications/requests for user-initiated deletes
 * of files.
 *
 * @since 3.16.0
 */
export interface DeleteFilesParams {

	/**
	 * An array of all files/folders deleted in this operation.
	 */
	files: FileDelete[];
}
```

<div class="anchorHolder"><a href="#fileDelete" name="fileDelete" class="linkableAnchor"></a></div>

```typescript
/**
 * Represents information on a file/folder delete.
 *
 * @since 3.16.0
 */
export interface FileDelete {

	/**
	 * A file:// URI for the location of the file/folder being deleted.
	 */
	uri: string;
}
```

_Response_:
* result:`WorkspaceEdit` \| `null`
* error: code and message set in case an exception happens during the `workspace/willDeleteFiles` request.
