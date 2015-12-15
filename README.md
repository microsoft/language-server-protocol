# VSCode Client / Server Language Protocol

Defines the client server protocol used by VSCode to talk to out of process language servers. 
The repository contains a VSCode protocol definition and a verification test suite so that other 
can implement the protocol in language like C#, C++, Java or Python.

## Base Protocol

The base protocol consists of a header and a content part (comparable to http). The header and content part are
separated by a '\r\n'.

### Header Part

The header part consist of header fields. Header fields are separated from each other by '\r\n'. The last header
field needs to be terminated with '\r\n' as well. Currently the following header fields are supported:

| Header File Name | Value Type  | Description |
|:-----------------|:------------|:------------|
| Content-Length   | number      | The length of the content part |
| Content-Type     | string      | The mime typ of the content part. Defaults to application/vscode-jsonrpc; charset=utf8 |

The header part is encoded using the 'ascii' encoding. This includes the '\r\n' separating the header and content part.

### Content Part

Contains the actual content of the message. The content part of a message uses [JSON-RPC](http://www.jsonrpc.org/) to describe requests, responses and notifications. The content part is encoded using the charset provided in the Content-Type field. It defaults to 'utf8'. Due to the limitation of Node.js only the following encodings are supported right now: 'ascii', 'base64', 'binary', 'hex', 'utf8', 'utf16le'. 


### Example:

```
Content-Length: ...\r\n
\r\n
{
	"jsonrpc": "2.0",
	"id": 1,
	"method": "textDocument/didOpen", 
	"params": {
		...
	}
}
```
### Base Protocol JSON strcutures

The following TypeScript definitions describe the JSON-RPC protocol as implemented by VSCode:

#### Abstract Message

A general message as defined by JSON-RPC. The language server protocol always uses "2.0" as the jsonrpc version.

```typescript
interface Message {
	jsonrpc: string;
}
```
#### RequestMessage 

A request message to decribe a request between the client and the server. Every processed request must send a response back to the sender of the request.

```typescript
interface RequestMessage extends Message {

	/**
	 * The request id.
	 */
	id: number | string;

	/**
	 * The method to be invoked.
	 */
	method: string;

	/**
	 * The method's params.
	 */
	params?: any
}
```

#### Response Message

Response Message send as a result of a request. 

```typescript
interface ResponseMessage extends Message {
	/**
	 * The request id.
	 */
	id: number | string;

	/**
	 * The result of a request. This can be omitted in
	 * the case of an error.
	 */
	result?: any;

	/**
	 * The error object in case a request fails.
	 */
	error?: ResponseError<any>;
}

interface ResponseError<D> {
	/**
	 * A number indicating the error type that occured.
	 */
	code: number;

	/**
	 * A string providing a short decription of the error.
	 */
	message: string;

	/**
	 * A Primitive or Structured value that contains additional
	 * information about the error. Can be omitted.
	 */
	data?: D;
}

export namespace ErrorCodes {
	export const ParseError: number = -32700;
	export const InvalidRequest: number = -32600;
	export const MethodNotFound: number = -32601;
	export const InvalidParams: number = -32602;
	export const InternalError: number = -32603;
	export const serverErrorStart: number = -32099
	export const serverErrorEnd: number = -32000;
}
```
#### Notification Message

A notification message. A processed notification message must not send a response back. They work like events.

```typescript
interface NotificationMessage extends Message {
	/**
	 * The method to be invoked.
	 */
	method: string;

	/**
	 * The notification's params.
	 */
	params?: any
}
```

## Language Server Protocol

The language server protocol defines a set of JSON-RPC request, response and notification messages which are exchanged using the above base protocol. This sections starts descibing basic JSON structures used in the protocol. The document uses TypeScript interfaces to describe these. Bases on the basic JSON structures the actual requests with their responses and the notifications are described.

### Basic JSON Structures

#### Position

Position in a text document expressed as zero-based line and character offset.

```typescript
interface Position {
	/**
	 * Line position in a document (zero-based).
	 */
	line: number;

	/**
	 * Character offset on a line in a document (zero-based).
	 */
	character: number;
}
```
#### Range

A range in a text document expressed as (zero-based) start and end positions.
```typescript
interface Range {
	/**
	 * The range's start position
	 */
	start: Position;

	/**
	 * The range's end position
	 */
	end: Position;
}
```

#### Diagnostic

Represents a diagnostic, such as a compiler error or warning. Diagnostic objects are only valid in the scope of a resource.

```typescript
interface Diagnostic {
	/**
	 * The range at which the message applies
	 */
	range: Range;

	/**
	 * The diagnostic's severity. Can be omitted. If omitted it is up to the
	 * client to interpret diagnostics as error, warning, info or hint.
	 */
	severity?: number;

	/**
	 * The diagnostic's code. Can be omitted.
	 */
	code?: number | string;

	/**
	 * The diagnostic's message.
	 */
	message: string;
}
```

The protocol currently supports the following diagnostic severities

```typescript
enum DiagnosticSeverity {
	/**
	 * Reports an error.
	 */
	Error = 1,
	/**
	 * Reports a warning.
	 */
	Warning = 2,
	/**
	 * Reports an information.
	 */
	Information = 3,
	/**
	 * Reports a hint.
	 */
	Hint = 4
}
```

#### Command

Represents a reference to a command. Provides a title which will be used to represent a command in the UI and, optionally, an array of arguments which will be passed to the command handler function when invoked.

```typescript
interface Command {
	/**
	 * Title of the command, like `save`.
	 */
	title: string;
	/**
	 * The identifier of the actual command handler.
	 */
	command: string;
	/**
	 * Arguments that the command handler should be
	 * invoked with.
	 */
	arguments?: any[];
}
```

#### TextEdit

A textual edit applicable to a text document.

```typescript
interface TextEdit {
	/**
	 * The range of the text document to be manipulated. To insert
	 * text into a document create a range where start === end.
	 */
	range: Range;

	/**
	 * The string to be inserted. For delete operations use an
	 * empty string.
	 */
	newText: string;
}
```

#### WorkspaceEdit

A workspace edit represents changes to many resources managed in the workspace.

 ```typescript
export interface WorkspaceEdit {
	/**
	 * Holds changes to existing resources.
	 */
	changes: { [uri: string]: TextEdit[]; };
}
```

#### TextDocumentIdentifier

Text documents are identified using an URI. On the protocol level URI's are passed as strings. The corresponding JSON structure looks like this:
```typescript
interface TextDocumentIdentifier {
	/**
	 * The text document's uri.
	 */
	uri: string;
}
```

#### TextDocumentPosition

Identifies a position in a text document.

```typescript
interface TextDocumentPosition extends TextDocumentIdentifier {
	/**
	 * The position inside the text document.
	 */
	position: Position;
}
```

### Actual Protocol

This section documents the actual language server protocol. It uses the following format:

* a header describing the request
* a _Request_ section describing the format of the request send. The method is a string identifying the request the params are documented using a TypeScript interface
* a _Response_ section describing the format of the response. The result item descibes the returned data in case of a success. The error.data describes the returned data in case of an error. Please remember that in case of a failure the response already contains an error.code and an error.message field. These fields are only speced if the protocol forces the use of certain error codes or messages. In cases where the server can decide on these values freely they arn't listed here.

#### Initialize Request

The initialize request is sent as the first request from the client to the server. 

_Request_
* method: 'initialize'
* params: 
```typescript
interface InitializeParams {
	/**
	 * The process Id of the parent process that started
	 * the server.
	 */
	processId: number;

	/**
	 * The rootPath of the workspace. Is null
	 * if no folder is open.
	 */
	rootPath: string;

	/**
	 * The capabilities provided by the client (editor)
	 */
	capabilities: ClientCapabilities;
}
```

_Response_
* result:
```typescript
export InitializeResult {
	/**
	 * The capabilities the language server provides.
	 */
	capabilities: ServerCapabilities;
}
```
* error.data:
```typescript
interface InitializeError {
	/**
	 * Indicates whether the client should retry to send the
	 * initilize request after showing the message provided
	 * in the ResponseError.
	 */
	retry: boolean;
}
```

The server can signal the following capabilities:

```typescript
/**
 * Defines how the host (editor) should sync document changes to the language server.
 */
enum TextDocumentSyncKind {
	/**
	 * Documents should not be synced at all.
	 */
	None = 0,
	/**
	 * Documents are synced by always sending the full content of the document.
	 */
	Full = 1,
	/**
	 * Documents are synced by sending the full content on open. After that only incremental 
	 * updates to the document are send.
	 */
	Incremental = 2
}

/**
 * Completion options.
 */
interface CompletionOptions {
	/**
	 * The server provides support to resolve additional information for a completion item.
	 */
	resolveProvider?: boolean;

	/**
	 * The characters that trigger completion automatically.
	 */
	triggerCharacters?: string[];
}

/**
 * Signature help options.
 */
interface SignatureHelpOptions {
	/**
	 * The characters that trigger signature help automatically.
	 */
	triggerCharacters?: string[];
}

/**
 * Code Lens options.
 */
interface CodeLensOptions {
	/**
	 * Code lens has a resolve provider as well.
	 */
	resolveProvider?: boolean;
}

/**
 * Format document on type options
 */
interface DocumentOnTypeFormattingOptions {
	/**
	 * A character on which formatting should be triggered, like `}`.
	 */
	firstTriggerCharacter: string;
	/**
	 * More trigger characters.
	 */
	moreTriggerCharacter?: string[]
}

interface ServerCapabilities {
	/**
	 * Defines how text documents are synced.
	 */
	textDocumentSync?: number;
	/**
	 * The server provides hover support.
	 */
	hoverProvider?: boolean;
	/**
	 * The server provides completion support.
	 */
	completionProvider?: CompletionOptions;
	/**
	 * The server provides signature help support.
	 */
	signatureHelpProvider?: SignatureHelpOptions;
	/**
	 * The server provides goto definition support.
	 */
	definitionProvider?: boolean;
	/**
	 * The server provides find references support.
	 */
	referencesProvider?: boolean;
	/**
	 * The server provides document highlight support.
	 */
	documentHighlightProvider?: boolean;
	/**
	 * The server provides document symbol support.
	 */
	documentSymbolProvider?: boolean;
	/**
	 * The server provides workspace symbol support.
	 */
	workspaceSymbolProvider?: boolean;
	/**
	 * The server provides code actions.
	 */
	codeActionProvider?: boolean;
	/**
	 * The server provides code lens.
	 */
	codeLensProvider?: CodeLensOptions;
	/**
	 * The server provides document formatting.
	 */
	documentFormattingProvider?: boolean;
	/**
	 * The server provides document range formatting.
	 */
	documentRangeFormattingProvider?: boolean;
	/**
	 * The server provides document formatting on typing.
	 */
	documentOnTypeFormattingProvider?: DocumentOnTypeFormattingOptions;
	/**
	 * The server provides rename support.
	 */
	renameProvider?: boolean
}
```

#### Shutdown Request

The shutdown request is sent from the client to the server. It asks the server to shutdown, but to not exit (otherwise the response might not be delivered correctly to the client). There is a separate exit notification that asks the server to exit.

_Request_
* method: 'shutdown'
* params: undefined

_Response_
* result: undefined
* error: code and message set in case an exception happens during shutdown request.

#### Exit Notification

A notification to ask the server to exit its process.

_Notification_
* method: 'exit'
* params: undefined

#### ShowMessage Notification

The show message notification is sent from a server to a client to ask the client to display a particular message in the user interface.

_Notification_:
* method: 'window/showMessage'
* params:
```typescript
interface ShowMessageParams {
	/**
	 * The message type. See {@link MessageType}
	 */
	type: number;

	/**
	 * The actual message
	 */
	message: string;
}
```
Where the type is defined as follows:
```typescript
enum MessageType {
	/**
	 * An error message.
	 */
	Error = 1,
	/**
	 * A warning message.
	 */
	Warning = 2,
	/**
	 * An information message.
	 */
	Info = 3,
	/**
	 * A log message.
	 */
	Log = 4
}
```

#### ShowMessage Notification

The log message notification is send from the server to the client to ask the client to log a particular message.

_Notification_:
* method: 'window/logMessage'
* params:
```typescript
interface LogMessageParams {
	/**
	 * The message type. See {@link MessageType}
	 */
	type: number;

	/**
	 * The actual message
	 */
	message: string;
}
```
Where type is defined as above.

#### DidChangeConfiguration Notification

A notification send from the client to the server to signal the change of configuration settings.

_Notification_:
* method: 'workspace/didChangeConfiguration',
* params:
```typescript
interface DidChangeConfigurationParams {
	/**
	 * The actual changed settings
	 */
	settings: any;
}
```

#### DidOpenTextDocument Notification

The document open notification is sent from the client to the server to signal newly opened text documents. The document's truth is now managed by the client and the server must not try to read the document's truth using the document's uri.

_Notification_:
* method: 'textDocument/didOpen'
* params:
```typescript
interface DidOpenTextDocumentParams extends TextDocumentIdentifier {
	/**
	 * The content of the opened text document.
	 */
	text: string;
}
```

#### DidChangeTextDocument Notification

The document change notification is sent from the client to the server to signal changes to a text document.

_Notification_:
* method: 'textDocument/didChange'
* params:
```typescript
interface DidChangeTextDocumentParams extends TextDocumentIdentifier {
	contentChanges: TextDocumentContentChangeEvent[];
}
```
```typescript
/**
 * An event describing a change to a text document. If range and rangeLength are omitted
 * the new text is considered to be the full content of the document.
 */
interface TextDocumentContentChangeEvent {
	/**
	 * The range of the document that changed.
	 */
	range?: Range;

	/**
	 * The length of the range that got replaced.
	 */
	rangeLength?: number;

	/**
	 * The new text of the document.
	 */
	text: string;
}
```

#### DidCloseTextDocument Notification

The document close notification is sent from the client to the server when the document got closed in the client. The document's truth now exists where the document's uri points to (e.g. if the document's uri is a file uri the truth now exists on disk).

_Notification_:
* method: 'textDocument/didClose'
* param: `TextDocumentIdentifier`

#### DidChangeWatchedFiles Notification

The watched files notification is sent from the client to the server when the client detects changes to file watched by the lanaguage client.

_Notification_:
* method: 'workspace/didChangeWatchedFiles'
* params:
```typescript
interface DidChangeWatchedFilesParams {
	/**
	 * The actual file events.
	 */
	changes: FileEvent[];
}
```
Where FileEvents are described as follows:
```typescript
/**
 * The file event type
 */
enum FileChangeType {
	/**
	 * The file got created.
	 */
	Created = 1,
	/**
	 * The file got changed.
	 */
	Changed = 2,
	/**
	 * The file got deleted.
	 */
	Deleted = 3
}

/**
 * An event describing a file change.
 */
interface FileEvent {
	/**
	 * The file's uri.
	 */
	uri: string;
	/**
	 * The change type.
	 */
	type: number;
}
```

#### PublishDiagnostics Notification

Diagnostics notification are sent from the server to the client to signal results of validation runs.

_Notification_
* method: 'textDocument/publishDiagnostics'
* params:
```typescript
interface PublishDiagnosticsParams {
	/**
	 * The URI for which diagnostic information is reported.
	 */
	uri: string;

	/**
	 * An array of diagnostic information items.
	 */
	diagnostics: Diagnostic[];
}
```

#### Completion Request

The Completion request is sent from the client to the server to compute completion items at a given cursor position. Completion items are presented in the [IntelliSense](https://code.visualstudio.com/docs/editor/editingevolved#_intellisense) user interface. If computing complete completion items is expensive servers can additional provide a handler for the resolve completion item request. This request is send when a completion item is selected in the user interface.

_Request_
* method: 'textDocument/completion'
* params: `TextDocumentPosition`

_Response_
* result: `CompletionItem[]`
```typescript
interface CompletionItem {
	/**
	 * The label of this completion item. By default
	 * also the text that is inserted when selecting
	 * this completion.
	 */
	label: string;
	/**
	 * The kind of this completion item. Based of the kind
	 * an icon is chosen by the editor.
	 */
	kind?: number;
	/**
	 * A human-readable string with additional information
	 * about this item, like type or symbol information.
	 */
	detail?: string;
	/**
	 * A human-readable string that represents a doc-comment.
	 */
	documentation?: string;
	/**
	 * A string that shoud be used when comparing this item
	 * with other items. When `falsy` the [label](#CompletionItem.label)
	 * is used.
	 */
	sortText?: string;
	/**
	 * A string that should be used when filtering a set of
	 * completion items. When `falsy` the [label](#CompletionItem.label)
	 * is used.
	 */
	filterText?: string;
	/**
	 * A string that should be inserted a document when selecting
	 * this completion. When `falsy` the [label](#CompletionItem.label)
	 * is used.
	 */
	insertText?: string;
	/**
	 * An [edit](#TextEdit) which is applied to a document when selecting
	 * this completion. When an edit is provided the value of
	 * [insertText](#CompletionItem.insertText) is ignored.
	 */
	textEdit?: TextEdit;
	/**
	 * An data entry field that is preserved on a completion item between
	 * a [CompletionRequest](#CompletionRequest) and a [CompletionResolveRequest]
	 * (#CompletionResolveRequest)
	 */
	data?: any
}
```
Where `CompletionItemKind` is defined as follows:
```typescript
/**
 * The kind of a completion entry.
 */
enum CompletionItemKind {
	Text = 1,
	Method = 2,
	Function = 3,
	Constructor = 4,
	Field = 5,
	Variable = 6,
	Class = 7,
	Interface = 8,
	Module = 9,
	Property = 10,
	Unit = 11,
	Value = 12,
	Enum = 13,
	Keyword = 14,
	Snippet = 15,
	Color = 16,
	File = 17,
	Reference = 18
}
```
* error: code and message set in case an exception happens during the completion request.

#### Completion Item Resolve Request

The request is sent from the client to the server to resolve additional information for a given completion item.

_Request_
* method: 'completionItem/resolve'
* param: `CompletionItem`

_Response_
* result: `CompletionItem`
* error: code and message set in case an exception happens during the completion resolve request.

#### Hover

The hover request is sent from the client to the server to request hover information at a given text document position.

_Request_
* method: 'textDocument/hover'
* param: `TextDocumentPosition`

_Response_
* result:
```typescript
interface Hover {
	/**
	 * The hover's content
	 */
	contents: MarkedString | MarkedString[];
	/**
	 * An optional range
	 */
	range?: Range;
}
```
Where `MarkedString` is defined as follows:
```typescript
type MarkedString = string | { language: string; value: string };
```
* error: code and message set in case an exception happens during the hover request.
