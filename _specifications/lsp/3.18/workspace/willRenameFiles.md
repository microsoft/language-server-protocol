#### <a href="#workspace_willRenameFiles" name="workspace_willRenameFiles" class="anchor">WillRenameFiles Request (:leftwards_arrow_with_hook:)</a>

The will rename files request is sent from the client to the server before files are actually renamed as long as the rename is triggered from within the client either by a user action or by applying a workspace edit. The request can return a WorkspaceEdit which will be applied to workspace before the files are renamed. Please note that clients might drop results if computing the edit took too long or if a server constantly fails on this request. This is done to keep renames fast and reliable.

_Client Capability_:
* property name (optional): `workspace.fileOperations.willRename`
* property type: `boolean`

The capability indicates that the client supports sending `workspace/willRenameFiles` requests.

_Server Capability_:
* property name (optional): `workspace.fileOperations.willRename`
* property type: `FileOperationRegistrationOptions`

The capability indicates that the server is interested in receiving `workspace/willRenameFiles` requests.

_Registration Options_: none

_Request_:
* method: 'workspace/willRenameFiles'
* params: `RenameFilesParams` defined as follows:

<div class="anchorHolder"><a href="#renameFilesParams" name="renameFilesParams" class="linkableAnchor"></a></div>

```typescript
/**
 * The parameters sent in notifications/requests for user-initiated renames
 * of files.
 *
 * @since 3.16.0
 */
export interface RenameFilesParams {

	/**
	 * An array of all files/folders renamed in this operation. When a folder
	 * is renamed, only the folder will be included, and not its children.
	 */
	files: FileRename[];
}
```

<div class="anchorHolder"><a href="#fileRename" name="fileRename" class="linkableAnchor"></a></div>

```typescript
/**
 * Represents information on a file/folder rename.
 *
 * @since 3.16.0
 */
export interface FileRename {

	/**
	 * A file:// URI for the original location of the file/folder being renamed.
	 */
	oldUri: string;

	/**
	 * A file:// URI for the new location of the file/folder being renamed.
	 */
	newUri: string;
}
```

_Response_:
* result:`WorkspaceEdit` \| `null`
* error: code and message set in case an exception happens during the `workspace/willRenameFiles` request.
