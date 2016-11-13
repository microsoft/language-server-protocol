# Files extensions to LSP

The files extension to the Language Server Protocol (LSP) allows a language server to operate without sharing a physical file system with the client. Instead of consulting its local disk, the language server can query the client for a list of all files and for the contents of specific files.

Use cases:

* In some deployment settings, the workspace exists on the client in archived form only, such as a bare Git repository or a .zip file. Using virtual file system access allows the language server to request the minimum set of files necessary to satisfy the request, instead of writing the entire workspace to disk.
* In multitenant deployments, the local disk may not be secure enough to store private data on. (Perhaps an attacker could craft a workspace with malicious `import` statements in code and reveal portions of any file on the file system.) Using a virtual file system enforces that the language server can operate without writing private code files to disk.
* In some deployment settings, language servers must avoid shelling out to untrusted (or sometimes any) programs, for security and performance reasons. Using a virtual file system helps enforce this by making it less likely that another programmer could change the language server to invoke an external program (since it would not be able to read any of the files anyway).
* For testing and reproducibility, it is helpful to isolate the inputs to the language server. This is easier to do if you can guarantee that the language server will not access the file system.

## Protocol

Note that unlike other requests in LSP, these requests are sent by the language server to the client, not vice versa. The client, not the language server, is assumed to have full access to the workspace's contents.

The language server is allowed to request file paths outside of the workspace root. (This is common for, e.g., system dependencies.) The client may choose whether or not to satisfy these requests.

### Initialization

`ClientCapabilities` may contain two new fields to indicate client-side support for this extension:

```typescript
interface ClientCapabilities {
  /* ... all fields from the base ClientCapabilities ... */

  /**
   * The client provides support for workspace/files.
   */
  filesProvider?: boolean;
  /**
   * The client provides support for textDocument/content.
   */
  contentProvider?: boolean;
}
```

### Content Request

The content request is sent from the server to the client to request the current content of any text document. This allows language servers to operate without accessing the file system directly.

_Request_:
* method: 'textDocument/content'
* params: `ContentParams` defined as follows:

```typescript
interface ContentParams {
  /**
   * The text document to receive the content for.
   */
  textDocument: TextDocumentIdentifier;
}
```

_Response_:
* result: `TextDocumentItem`
* error: code and message set in case an exception occurs

### Files Request

The files request is sent from the server to the client to request a list of all files in the workspace or inside the directory of the `base` parameter, if given.

A language server can use the result to index files by filtering and doing a content request for each text document of interest.

_Request_:
* method: 'workspace/files'
* params: `FilesParams` defined as follows:

```typescript
interface FilesParams {
  /**
   * The URI of a directory to search.
   * Can be relative to the rootPath.
   * If not given, defaults to rootPath.
   */
  base?: string;
}
```

_Response_:
* result: `TextDocumentIdentifier[]`
* error: code and message set in case an exception occurs

Examples:

Relative (`rootPath` is `file:///some/project`):

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "workspace/files"
}
```

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": [
    {"uri": "file:///some/project/.gitignore"},
    {"uri": "file:///some/project/composer.json"}
    {"uri": "file:///some/project/folder/1.php"},
    {"uri": "file:///some/project/folder/folder/2.php"}
  ]
}
```

Absolute:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "workspace/files",
  "params": {
    "base": "file:///usr/local/go"
  }
}
```

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": [
    {"uri": "file:///usr/local/go/1.go"},
    {"uri": "file:///usr/local/go/folder/"},
    {"uri": "file:///usr/local/go/folder/2.go"},
    {"uri": "file:///usr/local/go/folder/folder/"},
    {"uri": "file:///usr/local/go/folder/folder/3.go"}
  ]
}
```

## Design notes

* The protocol uses URIs, not file paths, to be consistent with the rest of LSP.
* Matching the `base` parameter relative to the `rootPath` permits the server to request files outside the workspace even if the workspace is on a remote host and/or uses an arbitrary protocol.
* Usage of `TextDocumentIdentifier` in `workspace/files` allows to easily extend the result with more properties in the future without breaking backward compatibility.


## Known issues

* There is no way to get directories
* Results have to be filtered on the server side. In the future this request may allow filtering through glob patterns.
