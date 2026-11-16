#### <a href="#workspace_fileSystem" name="workspace_fileSystem" class="anchor">File System Requests</a>

> *Since version 3.19.0*

The file system requests are sent from the server to the client to access the file system of the client. This allows a server to inspect files and folders that are not opened in the editor, even when the server runs in an environment that has no direct access to the client's file system (e.g. a remote server or a server running in a web browser).

Clients that support the file system requests must provide the corresponding client capabilities. Servers must only send a file system request if the client has advertised support for that specific request.

_Client Capability_:
* property path (optional): `workspace.fileSystem`
* property type: `FileSystemClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#fileSystemClientCapabilities" name="fileSystemClientCapabilities" class="linkableAnchor"></a></div>

```typescript
/**
 * Client capabilities specific to file system requests.
 *
 * @since 3.19.0
 * @proposed
 */
export interface FileSystemClientCapabilities {
	/**
	 * Whether the client supports the `workspace/stat` request.
	 */
	stat?: boolean;

	/**
	 * Whether the client supports the `workspace/readDirectory` request.
	 */
	readDirectory?: boolean;

	/**
	 * Whether the client supports the `workspace/readFile` request.
	 */
	readFile?: boolean;
}
```

The following types are shared between the file system requests:

<div class="anchorHolder"><a href="#fileType" name="fileType" class="linkableAnchor"></a></div>

```typescript
/**
 * The file type of a file system entry.
 *
 * @since 3.19.0
 * @proposed
 */
export namespace FileType {
	/**
	 * The file type is unknown.
	 */
	export const unknown = 'unknown';

	/**
	 * A regular file.
	 */
	export const file = 'file';

	/**
	 * A directory.
	 */
	export const directory = 'directory';
}

export type FileType = 'unknown' | 'file' | 'directory';
```

<div class="anchorHolder"><a href="#fileFlags" name="fileFlags" class="linkableAnchor"></a></div>

```typescript
/**
 * Additional flags about a file system entry.
 * Implemented as a bitmask so that multiple flags can be combined.
 *
 * @since 3.19.0
 * @proposed
 */
export namespace FileFlags {
	/**
	 * The file is a symbolic link.
	 */
	export const symbolicLink = 1;
}

export type FileFlags = uinteger;
```

#### <a href="#workspace_stat" name="workspace_stat" class="anchor">Stat Request (:arrow_right_hook:)</a>

> *Since version 3.19.0*

The `workspace/stat` request is sent from the server to the client to get metadata about a file or folder.

_Client Capability_:
* property path (optional): `workspace.fileSystem.stat`
* property type: `boolean`

_Request_:
* method: 'workspace/stat'
* params: `StatParams` defined as follows:

<div class="anchorHolder"><a href="#statParams" name="statParams" class="linkableAnchor"></a></div>

```typescript
/**
 * The parameters sent in a request to get metadata about a file.
 *
 * @since 3.19.0
 * @proposed
 */
export interface StatParams {
	/**
	 * A URI for the location of the file/folder.
	 */
	uri: DocumentUri;
}
```

_Response_:
* result: `FileStat | null`. `null` is returned if the file does not exist. `FileStat` is defined as follows:

<div class="anchorHolder"><a href="#fileStat" name="fileStat" class="linkableAnchor"></a></div>

```typescript
/**
 * Represents metadata about a file.
 *
 * @since 3.19.0
 * @proposed
 */
export interface FileStat {
	/**
	 * The type of the file, e.g. is a regular file or a directory.
	 */
	type: FileType;

	/**
	 * Additional flags about the file.
	 */
	flags: FileFlags;

	/**
	 * The creation timestamp in milliseconds elapsed since
	 * January 1, 1970 00:00:00 UTC.
	 */
	ctime: decimal;

	/**
	 * The modification timestamp in milliseconds elapsed since
	 * January 1, 1970 00:00:00 UTC.
	 */
	mtime: decimal;

	/**
	 * The size in bytes.
	 */
	size: decimal;
}
```

* error: code and message set in case an exception happens during the stat request.

#### <a href="#workspace_readDirectory" name="workspace_readDirectory" class="anchor">Read Directory Request (:arrow_right_hook:)</a>

> *Since version 3.19.0*

The `workspace/readDirectory` request is sent from the server to the client to get the entries of a directory.

_Client Capability_:
* property path (optional): `workspace.fileSystem.readDirectory`
* property type: `boolean`

_Request_:
* method: 'workspace/readDirectory'
* params: `ReadDirectoryParams` defined as follows:

<div class="anchorHolder"><a href="#readDirectoryParams" name="readDirectoryParams" class="linkableAnchor"></a></div>

```typescript
/**
 * The parameters sent in a request to read the contents of a directory.
 *
 * @since 3.19.0
 * @proposed
 */
export interface ReadDirectoryParams {
	/**
	 * A URI for the location of the folder.
	 */
	uri: DocumentUri;
}
```

_Response_:
* result: `DirectoryEntry[] | null`. `null` is returned if the directory does not exist or the client cannot read it. `DirectoryEntry` is defined as follows:

<div class="anchorHolder"><a href="#directoryEntry" name="directoryEntry" class="linkableAnchor"></a></div>

```typescript
/**
 * A directory entry represents a file or a folder in a directory.
 *
 * @since 3.19.0
 * @proposed
 */
export interface DirectoryEntry {
	/**
	 * The name of the entry.
	 */
	name: string;

	/**
	 * The type of the entry.
	 */
	type: FileType;

	/**
	 * Additional flags about the entry.
	 */
	flags: FileFlags;
}
```

* error: code and message set in case an exception happens during the read directory request.

#### <a href="#workspace_readFile" name="workspace_readFile" class="anchor">Read File Request (:arrow_right_hook:)</a>

> *Since version 3.19.0*

The `workspace/readFile` request is sent from the server to the client to get the content of a file. The content can either be requested as text, in which case the client decodes the file using the requested encoding, or as binary, in which case the raw bytes are returned as a base64 encoded string.

_Client Capability_:
* property path (optional): `workspace.fileSystem.readFile`
* property type: `boolean`

_Request_:
* method: 'workspace/readFile'
* params: `ReadFileParams` defined as follows:

<div class="anchorHolder"><a href="#readFileParams" name="readFileParams" class="linkableAnchor"></a></div>

```typescript
/**
 * The parameters sent in a request to read the contents of a file.
 *
 * @since 3.19.0
 * @proposed
 */
export type ReadFileParams = TextReadFileParams | BinaryReadFileParams;
```

<div class="anchorHolder"><a href="#textReadFileParams" name="textReadFileParams" class="linkableAnchor"></a></div>

```typescript
/**
 * The parameters sent in a request to read the text contents of a file.
 * File will be read using the encoding specified in the request.
 *
 * @since 3.19.0
 * @proposed
 */
export interface TextReadFileParams {
	/**
	 * Indicator that the file content should be read as a text file.
	 */
	kind: 'text';

	/**
	 * A URI for the location of the file.
	 */
	uri: DocumentUri;

	/**
	 * The encoding of the file content. If not specified, the content
	 * is assumed to be UTF-8.
	 */
	encoding?: string;
}
```

<div class="anchorHolder"><a href="#binaryReadFileParams" name="binaryReadFileParams" class="linkableAnchor"></a></div>

```typescript
/**
 * The parameters sent in a request to read the binary contents of a file.
 * File content will be returned as a base64 encoded string.
 *
 * @since 3.19.0
 * @proposed
 */
export interface BinaryReadFileParams {
	/**
	 * Indicator that the file content should be read as a binary file.
	 */
	kind: 'binary';

	/**
	 * A URI for the location of the file.
	 */
	uri: DocumentUri;
}
```

_Response_:
* result: `ReadFileResult | null`. `null` is returned if the file does not exist or the client cannot read it. `ReadFileResult` is defined as follows:

<div class="anchorHolder"><a href="#readFileResult" name="readFileResult" class="linkableAnchor"></a></div>

```typescript
/**
 * The result of a read file request.
 *
 * @since 3.19.0
 * @proposed
 */
export interface ReadFileResult {
	/**
	 * The content of the file as a unicode string.
	 *
	 * If the content is requested as text, it will be read using the
	 * encoding specified in the request. Any invalid byte sequences will
	 * be replaced with the unicode replacement character `U+FFFD`.
	 *
	 * If the content is requested as binary, it will be returned as a
	 * base64 encoded string.
	 */
	content: string;
}
```

* error: code and message set in case an exception happens during the read file request.
