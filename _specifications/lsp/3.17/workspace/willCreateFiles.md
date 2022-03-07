#### <a href="#workspace_willCreateFiles" name="workspace_willCreateFiles" class="anchor">WillCreateFiles Request (:leftwards_arrow_with_hook:)</a>

The will create files request is sent from the client to the server before files are actually created as long as the creation is triggered from within the client either by a user action or by applying a workspace edit. The request can return a WorkspaceEdit which will be applied to workspace before the files are created. Please note that clients might drop results if computing the edit took too long or if a server constantly fails on this request. This is done to keep creates fast and reliable.

_Client Capability_:
* property name (optional): `workspace.fileOperations.willCreate`
* property type: `boolean`

The capability indicates that the client supports sending `workspace/willCreateFiles` requests.

_Server Capability_:
* property name (optional): `workspace.fileOperations.willCreate`
* property type: `FileOperationRegistrationOptions` where `FileOperationRegistrationOptions` is defined as follows:

<div class="anchorHolder"><a href="#fileOperationRegistrationOptions" name="fileOperationRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
/**
 * The options to register for file operations.
 *
 * @since 3.16.0
 */
interface FileOperationRegistrationOptions {
	/**
	 * The actual filters.
	 */
	filters: FileOperationFilter[];
}
```

<div class="anchorHolder"><a href="#fileOperationPatternKind" name="fileOperationPatternKind" class="linkableAnchor"></a></div>

```typescript
/**
 * A pattern kind describing if a glob pattern matches a file a folder or
 * both.
 *
 * @since 3.16.0
 */
export namespace FileOperationPatternKind {
	/**
	 * The pattern matches a file only.
	 */
	export const file: 'file' = 'file';

	/**
	 * The pattern matches a folder only.
	 */
	export const folder: 'folder' = 'folder';
}

export type FileOperationPatternKind = 'file' | 'folder';
```

<div class="anchorHolder"><a href="#fileOperationPatternOptions" name="fileOperationPatternOptions" class="linkableAnchor"></a></div>

```typescript
/**
 * Matching options for the file operation pattern.
 *
 * @since 3.16.0
 */
export interface FileOperationPatternOptions {

	/**
	 * The pattern should be matched ignoring casing.
	 */
	ignoreCase?: boolean;
}
```

<div class="anchorHolder"><a href="#fileOperationPattern" name="fileOperationPattern" class="linkableAnchor"></a></div>

```typescript
/**
 * A pattern to describe in which file operation requests or notifications
 * the server is interested in.
 *
 * @since 3.16.0
 */
interface FileOperationPattern {
	/**
	 * The glob pattern to match. Glob patterns can have the following syntax:
	 * - `*` to match one or more characters in a path segment
	 * - `?` to match on one character in a path segment
	 * - `**` to match any number of path segments, including none
	 * - `{}` to group sub patterns into an OR expression. (e.g. `**​/*.{ts,js}`
	 *   matches all TypeScript and JavaScript files)
	 * - `[]` to declare a range of characters to match in a path segment
	 *   (e.g., `example.[0-9]` to match on `example.0`, `example.1`, …)
	 * - `[!...]` to negate a range of characters to match in a path segment
	 *   (e.g., `example.[!0-9]` to match on `example.a`, `example.b`, but
	 *   not `example.0`)
	 */
	glob: string;

	/**
	 * Whether to match files or folders with this pattern.
	 *
	 * Matches both if undefined.
	 */
	matches?: FileOperationPatternKind;

	/**
	 * Additional options used during matching.
	 */
	options?: FileOperationPatternOptions;
}
```

<div class="anchorHolder"><a href="#fileOperationFilter" name="fileOperationFilter" class="linkableAnchor"></a></div>

```typescript
/**
 * A filter to describe in which file operation requests or notifications
 * the server is interested in.
 *
 * @since 3.16.0
 */
export interface FileOperationFilter {

	/**
	 * A Uri like `file` or `untitled`.
	 */
	scheme?: string;

	/**
	 * The actual file operation pattern.
	 */
	pattern: FileOperationPattern;
}
```

The capability indicates that the server is interested in receiving `workspace/willCreateFiles` requests.

_Registration Options_: none

_Request_:
* method: 'workspace/willCreateFiles'
* params: `CreateFilesParams` defined as follows:

<div class="anchorHolder"><a href="#createFilesParams" name="createFilesParams" class="linkableAnchor"></a></div>

```typescript
/**
 * The parameters sent in notifications/requests for user-initiated creation
 * of files.
 *
 * @since 3.16.0
 */
export interface CreateFilesParams {

	/**
	 * An array of all files/folders created in this operation.
	 */
	files: FileCreate[];
}
```

<div class="anchorHolder"><a href="#fileCreate" name="fileCreate" class="linkableAnchor"></a></div>

```typescript
/**
 * Represents information on a file/folder create.
 *
 * @since 3.16.0
 */
export interface FileCreate {

	/**
	 * A file:// URI for the location of the file/folder being created.
	 */
	uri: string;
}
```

_Response_:
* result:`WorkspaceEdit` \| `null`
* error: code and message set in case an exception happens during the `willCreateFiles` request.
