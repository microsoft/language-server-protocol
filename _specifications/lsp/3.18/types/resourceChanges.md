### <a href="#resourceChanges" name="resourceChanges" class="anchor"> File Resource changes </a>

> New in version 3.13. Since version 3.16 file resource changes can carry an additional property `changeAnnotation` to describe the actual change in more detail. Whether a client has support for change annotations is guarded by the client capability `workspace.workspaceEdit.changeAnnotationSupport`.

File resource changes allow servers to create, rename and delete files and folders via the client. Note that the names talk about files but the operations are supposed to work on files and folders. This is in line with other naming in the Language Server Protocol (see file watchers which can watch files and folders). The corresponding change literals look as follows:

<div class="anchorHolder"><a href="#createFileOptions" name="createFileOptions" class="linkableAnchor"></a></div>

```typescript
/**
 * Options to create a file.
 */
export interface CreateFileOptions {
	/**
	 * Overwrite existing file. Overwrite wins over `ignoreIfExists`
	 */
	overwrite?: boolean;

	/**
	 * Ignore if exists.
	 */
	ignoreIfExists?: boolean;
}
```

<div class="anchorHolder"><a href="#createFile" name="createFile" class="linkableAnchor"></a></div>

```typescript
/**
 * Create file operation
 */
export interface CreateFile {
	/**
	 * A create
	 */
	kind: 'create';

	/**
	 * The resource to create.
	 */
	uri: DocumentUri;

	/**
	 * Additional options
	 */
	options?: CreateFileOptions;

	/**
	 * An optional annotation identifier describing the operation.
	 *
	 * @since 3.16.0
	 */
	annotationId?: ChangeAnnotationIdentifier;
}
```

<div class="anchorHolder"><a href="#renameFileOptions" name="renameFileOptions" class="linkableAnchor"></a></div>

```typescript
/**
 * Rename file options
 */
export interface RenameFileOptions {
	/**
	 * Overwrite target if existing. Overwrite wins over `ignoreIfExists`
	 */
	overwrite?: boolean;

	/**
	 * Ignores if target exists.
	 */
	ignoreIfExists?: boolean;
}
```

<div class="anchorHolder"><a href="#renameFile" name="renameFile" class="linkableAnchor"></a></div>

```typescript
/**
 * Rename file operation
 */
export interface RenameFile {
	/**
	 * A rename
	 */
	kind: 'rename';

	/**
	 * The old (existing) location.
	 */
	oldUri: DocumentUri;

	/**
	 * The new location.
	 */
	newUri: DocumentUri;

	/**
	 * Rename options.
	 */
	options?: RenameFileOptions;

	/**
	 * An optional annotation identifier describing the operation.
	 *
	 * @since 3.16.0
	 */
	annotationId?: ChangeAnnotationIdentifier;
}
```

<div class="anchorHolder"><a href="#deleteFileOptions" name="deleteFileOptions" class="linkableAnchor"></a></div>

```typescript
/**
 * Delete file options
 */
export interface DeleteFileOptions {
	/**
	 * Delete the content recursively if a folder is denoted.
	 */
	recursive?: boolean;

	/**
	 * Ignore the operation if the file doesn't exist.
	 */
	ignoreIfNotExists?: boolean;
}
```

<div class="anchorHolder"><a href="#deleteFile" name="deleteFile" class="linkableAnchor"></a></div>

```typescript
/**
 * Delete file operation
 */
export interface DeleteFile {
	/**
	 * A delete
	 */
	kind: 'delete';

	/**
	 * The file to delete.
	 */
	uri: DocumentUri;

	/**
	 * Delete options.
	 */
	options?: DeleteFileOptions;

	/**
	 * An optional annotation identifier describing the operation.
	 *
	 * @since 3.16.0
	 */
	annotationId?: ChangeAnnotationIdentifier;
}
```