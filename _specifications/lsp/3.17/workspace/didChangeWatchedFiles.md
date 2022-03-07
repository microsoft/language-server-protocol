#### <a href="#workspace_didChangeWatchedFiles" name="workspace_didChangeWatchedFiles" class="anchor">DidChangeWatchedFiles Notification (:arrow_right:)</a>

The watched files notification is sent from the client to the server when the client detects changes to files and folders watched by the language client (note although the name suggest that only file events are sent it is about file system events which include folders as well). It is recommended that servers register for these file system events using the registration mechanism. In former implementations clients pushed file events without the server actively asking for it.

Servers are allowed to run their own file system watching mechanism and not rely on clients to provide file system events. However this is not recommended due to the following reasons:

- to our experience getting file system watching on disk right is challenging, especially if it needs to be supported across multiple OSes.
- file system watching is not for free especially if the implementation uses some sort of polling and keeps a file system tree in memory to compare time stamps (as for example some node modules do)
- a client usually starts more than one server. If every server runs its own file system watching it can become a CPU or memory problem.
- in general there are more server than client implementations. So this problem is better solved on the client side.

_Client Capability_:
* property path (optional): `workspace.didChangeWatchedFiles`
* property type: `DidChangeWatchedFilesClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#didChangeWatchedFilesClientCapabilities" name="didChangeWatchedFilesClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface DidChangeWatchedFilesClientCapabilities {
	/**
	 * Did change watched files notification supports dynamic registration.
	 * Please note that the current protocol doesn't support static
	 * configuration for file changes from the server side.
	 */
	dynamicRegistration?: boolean;
}
```

_Registration Options_: `DidChangeWatchedFilesRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#didChangeWatchedFilesRegistrationOptions" name="didChangeWatchedFilesRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
/**
 * Describe options to be used when registering for file system change events.
 */
export interface DidChangeWatchedFilesRegistrationOptions {
	/**
	 * The watchers to register.
	 */
	watchers: FileSystemWatcher[];
}
```

<div class="anchorHolder"><a href="#fileSystemWatcher" name="fileSystemWatcher" class="linkableAnchor"></a></div>

```typescript
export interface FileSystemWatcher {
	/**
	 * The glob pattern to watch.
	 *
	 * Glob patterns can have the following syntax:
	 * - `*` to match one or more characters in a path segment
	 * - `?` to match on one character in a path segment
	 * - `**` to match any number of path segments, including none
	 * - `{}` to group sub patterns into an OR expression. (e.g. `**​/*.{ts,js}`
	 *   matches all TypeScript and JavaScript files)
	 * - `[]` to declare a range of characters to match in a path segment
	 *   (e.g., `example.[0-9]` to match on `example.0`, `example.1`, …)
	 * - `[!...]` to negate a range of characters to match in a path segment
	 *   (e.g., `example.[!0-9]` to match on `example.a`, `example.b`, but not
	 *   `example.0`)
	 */
	globPattern: string;

	/**
	 * The kind of events of interest. If omitted it defaults
	 * to WatchKind.Create | WatchKind.Change | WatchKind.Delete
	 * which is 7.
	 */
	kind?: uinteger;
}
```

<div class="anchorHolder"><a href="#watchKind" name="watchKind" class="linkableAnchor"></a></div>

```typescript
export namespace WatchKind {
	/**
	 * Interested in create events.
	 */
	export const Create = 1;

	/**
	 * Interested in change events
	 */
	export const Change = 2;

	/**
	 * Interested in delete events
	 */
	export const Delete = 4;
}
```

_Notification_:
* method: 'workspace/didChangeWatchedFiles'
* params: `DidChangeWatchedFilesParams` defined as follows:

<div class="anchorHolder"><a href="#didChangeWatchedFilesParams" name="didChangeWatchedFilesParams" class="linkableAnchor"></a></div>

```typescript
interface DidChangeWatchedFilesParams {
	/**
	 * The actual file events.
	 */
	changes: FileEvent[];
}
```

Where FileEvents are described as follows:

<div class="anchorHolder"><a href="#fileEvent" name="fileEvent" class="linkableAnchor"></a></div>

```typescript
/**
 * An event describing a file change.
 */
interface FileEvent {
	/**
	 * The file's URI.
	 */
	uri: DocumentUri;
	/**
	 * The change type.
	 */
	type: uinteger;
}
```

<div class="anchorHolder"><a href="#fileChangeType" name="fileChangeType" class="linkableAnchor"></a></div>

```typescript
/**
 * The file event type.
 */
export namespace FileChangeType {
	/**
	 * The file got created.
	 */
	export const Created = 1;
	/**
	 * The file got changed.
	 */
	export const Changed = 2;
	/**
	 * The file got deleted.
	 */
	export const Deleted = 3;
}
```
