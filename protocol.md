# Language Server Protocol

This document describes version 3.0 of the language server protocol. Major goals of the 3.0 version are:

- add support for client feature flags to support that servers can adapt to different client capabilities. An example is the new `textDocument/willSaveWaitUntil` request which not all clients might be able to support. If the feature is disabled in the client capabilities sent on the initialize request, the server can't rely on receiving the request.
- add support to experiment with new features. The new `ClientCapabilities.experimental` section together with feature flags allow servers to provide experimental feature without the need of ALL clients to adopt them immediatelly.
- servers can more dynamically react to client features. Capabilities can now be registered and unregistered after the initialize request using the new `client/registerCapability` and `client/unregisterCapability`. This for example allows servers to react to settings or configuration changes without a restart.
- add support for `textDocument/willSave` notification and `textDocument/willSaveWaitUntil` request.
- add support for `textDocument/documentLink` request.
- add a `rootUri` property to the initializeParams in favour of the `rootPath` property.

An implementation for node of the 3.0 version of the protocol can be found [here](https://github.com/Microsoft/vscode-languageserver-node).

The 2.x version of this document can be found [here](https://github.com/Microsoft/language-server-protocol/blob/master/versions/protocol-2-x.md).
The 1.x version of this document can be found [here](https://github.com/Microsoft/language-server-protocol/blob/master/versions/protocol-1-x.md).

## Change Log

### 09/26/2017

* Added optional `commitCharacters` property to the `CompletionItem`

### 02/28/2017

* Make the `WorkspaceEdit` changes backwards compatible.
* Updated the specification to correctly describe the breaking changes from 2.x to 3.x around `WorkspaceEdit`and `TextDocumentEdit`.

## Messages overview

General

* :leftwards_arrow_with_hook: [initialize](#initialize)
* **New** :arrow_right: [initialized](#initialized)
* :leftwards_arrow_with_hook: [shutdown](#shutdown)
* :arrow_right: [exit](#exit)
* :arrow_right: :arrow_left: [$/cancelRequest](#cancelRequest)

Window

* :arrow_left: [window/showMessage](#window_showMessage)
* :arrow_right_hook: [window/showMessageRequest](#window_showMessageRequest)
* :arrow_left: [window/logMessage](#window_logMessage)
* :arrow_left: [telemetry/event](#telemetry_event)

>**New** Client
* :arrow_right_hook: [client/registerCapability](#client_registerCapability)
* :arrow_right_hook: [client/unregisterCapability](#client_unregisterCapability)

Workspace

* :arrow_right: [workspace/didChangeConfiguration](#workspace_didChangeConfiguration)
* :arrow_right: [workspace/didChangeWatchedFiles](#workspace_didChangeWatchedFiles)
* :leftwards_arrow_with_hook: [workspace/symbol](#workspace_symbol)
* **New** :leftwards_arrow_with_hook: [workspace/executeCommand](#workspace_executeCommand)
* **New** :arrow_right_hook: [workspace/applyEdit](#workspace_applyEdit)

Document

* :arrow_left: [textDocument/publishDiagnostics](#textDocument_publishDiagnostics)
* :arrow_right: [textDocument/didOpen](#textDocument_didOpen)
* :arrow_right: [textDocument/didChange](#textDocument_didChange)
* :arrow_right: [textDocument/willSave](#textDocument_willSave)
* **New** :leftwards_arrow_with_hook: [textDocument/willSaveWaitUntil](#textDocument_willSaveWaitUntil)
* **New** :arrow_right: [textDocument/didSave](#textDocument_didSave)
* :arrow_right: [textDocument/didClose](#textDocument_didClose)
* :leftwards_arrow_with_hook: [textDocument/completion](#textDocument_completion)
* :leftwards_arrow_with_hook: [completionItem/resolve](#completionItem_resolve)
* :leftwards_arrow_with_hook: [textDocument/hover](#textDocument_hover)
* :leftwards_arrow_with_hook: [textDocument/signatureHelp](#textDocument_signatureHelp)
* :leftwards_arrow_with_hook: [textDocument/references](#textDocument_references)
* :leftwards_arrow_with_hook: [textDocument/documentHighlight](#textDocument_documentHighlight)
* :leftwards_arrow_with_hook: [textDocument/documentSymbol](#textDocument_documentSymbol)
* :leftwards_arrow_with_hook: [textDocument/formatting](#textDocument_formatting)
* :leftwards_arrow_with_hook: [textDocument/rangeFormatting](#textDocument_rangeFormatting)
* :leftwards_arrow_with_hook: [textDocument/onTypeFormatting](#textDocument_onTypeFormatting)
* :leftwards_arrow_with_hook: [textDocument/definition](#textDocument_definition)
* :leftwards_arrow_with_hook: [textDocument/codeAction](#textDocument_codeAction)
* :leftwards_arrow_with_hook: [textDocument/codeLens](#textDocument_codeLens)
* :leftwards_arrow_with_hook: [codeLens/resolve](#codeLens_resolve)
* :leftwards_arrow_with_hook: [textDocument/documentLink](#textDocument_documentLink)
* :leftwards_arrow_with_hook: [documentLink/resolve](#documentLink_resolve)
* :leftwards_arrow_with_hook: [textDocument/rename](#textDocument_rename)

## Base Protocol

The base protocol consists of a header and a content part (comparable to HTTP). The header and content part are
separated by a '\r\n'.

### Header Part

The header part consists of header fields. Each header field is comprised of a name and a value,
separated by ': ' (a colon and a space).
Each header field is terminated by '\r\n'.
Considering the last header field and the overall header itself are each terminated with '\r\n',
and that at least one header is mandatory, this means that two '\r\n' sequences always
immediately precede the content part of a message.

Currently the following header fields are supported:

| Header Field Name | Value Type  | Description |
|:------------------|:------------|:------------|
| Content-Length    | number      | The length of the content part in bytes. This header is required. |
| Content-Type      | string      | The mime type of the content part. Defaults to application/vscode-jsonrpc; charset=utf-8 |

The header part is encoded using the 'ascii' encoding. This includes the '\r\n' separating the header and content part.

### Content Part

Contains the actual content of the message. The content part of a message uses [JSON-RPC](http://www.jsonrpc.org/) to describe requests, responses and notifications. The content part is encoded using the charset provided in the Content-Type field. It defaults to `utf-8`, which is the only encoding supported right now. 
> **Changed** Prior version of the protocol used the string constant `utf8` which is not a correct encoding constant according to [specification](http://www.iana.org/assignments/character-sets/character-sets.xhtml)). For backwards compatibility it is highly recommended that a client and a server treats the string `utf8` as `utf-8`.

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
### Base Protocol JSON structures

The following TypeScript definitions describe the base [JSON-RPC protocol](http://www.jsonrpc.org/specification):

#### Abstract Message

A general message as defined by JSON-RPC. The language server protocol always uses "2.0" as the jsonrpc version.

```typescript
interface Message {
	jsonrpc: string;
}
```
#### RequestMessage

A request message to describe a request between the client and the server. Every processed request must send a response back to the sender of the request.

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

Response Message sent as a result of a request. If a request doesn't provide a result value the receiver of a request still needs to return a response message to conform to the JSON RPC specification. The result property of the ResponseMessage should be set to `null` in this case to signal a successful request. 

```typescript
interface ResponseMessage extends Message {
	/**
	 * The request id.
	 */
	id: number | string | null;

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
	 * A number indicating the error type that occurred.
	 */
	code: number;

	/**
	 * A string providing a short description of the error.
	 */
	message: string;

	/**
	 * A Primitive or Structured value that contains additional
	 * information about the error. Can be omitted.
	 */
	data?: D;
}

export namespace ErrorCodes {
	// Defined by JSON RPC
	export const ParseError: number = -32700;
	export const InvalidRequest: number = -32600;
	export const MethodNotFound: number = -32601;
	export const InvalidParams: number = -32602;
	export const InternalError: number = -32603;
	export const serverErrorStart: number = -32099;
	export const serverErrorEnd: number = -32000;
	export const ServerNotInitialized: number = -32002;
	export const UnknownErrorCode: number = -32001;

	// Defined by the protocol.
	export const RequestCancelled: number = -32800;
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

#### $ Notifications and Requests

Notification and requests ids starting with '$/' are messages which are protocol implementation dependent and might not be implementable in all clients or servers. For example if the server implementation uses a single threaded synchronous programming language then there is little a server can do to react to a '$/cancelRequest'. If a server or client receives notifications or requests starting with '$/' it is free to ignore them if they are unknown. 

#### <a name="cancelRequest"></a> Cancellation Support

The base protocol offers support for request cancellation. To cancel a request, a notification message with the following properties is sent:

_Notification_:
* method: '$/cancelRequest'
* params: `CancelParams` defined as follows:
```typescript
interface CancelParams {
	/**
	 * The request id to cancel.
	 */
	id: number | string;
}
```

A request that got canceled still needs to return from the server and send a response back. It can not be left open / hanging. This is in line with the JSON RPC protocol that requires that every request sends a response back. In addition it allows for returning partial results on cancel. If the requests returns an error response on cancellation it is advised to set the error code to `ErrorCodes.RequestCancelled`.

## Language Server Protocol

The language server protocol defines a set of JSON-RPC request, response and notification messages which are exchanged using the above base protocol. This section starts describing the basic JSON structures used in the protocol. The document uses TypeScript interfaces to describe these. Based on the basic JSON structures, the actual requests with their responses and the notifications are described.

The protocol currently assumes that one server serves one tool. There is currently no support in the protocol to share one server between different tools. Such a sharing would require additional protocol to either lock a document to support concurrent editing.

### Basic JSON Structures

#### URI

URI's are transferred as strings. The URI's format is defined in [http://tools.ietf.org/html/rfc3986](http://tools.ietf.org/html/rfc3986)

```
  foo://example.com:8042/over/there?name=ferret#nose
  \_/   \______________/\_________/ \_________/ \__/
   |           |            |            |        |
scheme     authority       path        query   fragment
   |   _____________________|__
  / \ /                        \
  urn:example:animal:ferret:nose
```

We also maintain a node module to parse a string into `scheme`, `authority`, `path`, `query`, and `fragment` URI components. The GitHub repository is [https://github.com/Microsoft/vscode-uri](https://github.com/Microsoft/vscode-uri) the npm module is [https://www.npmjs.com/package/vscode-uri](https://www.npmjs.com/package/vscode-uri).

Many of the interfaces contain fields that correspond to the URI of a document. For clarity, the type of such a field is declared as a `DocumentUri`. Over the wire, it will still be transferred as a string, but this guarantees that the contents of that string can be parsed as a valid URI.

```typescript
type DocumentUri = string;
```

#### Text Documents

The current protocol is tailored for textual documents whose content can be represented as a string. There is currently no support for binary documents. A position inside a document (see Position definition below) is expressed as a zero-based line and character offset. The offsets are based on a UTF-16 string representation. So a string of the form `a𐐀b` the character offset of the character `a` is 0, the character offset of `𐐀` is 1 and the character offset of b is 3 since `𐐀` is represented using two code units in UTF-16. To ensure that both client and server split the string into the same line representation the protocol specifies the following end-of-line sequences: '\n', '\r\n' and '\r'.

```typescript
export const EOL: string[] = ['\n', '\r\n', '\r'];
```

#### Position

Position in a text document expressed as zero-based line and zero-based character offset. A position is between two characters like an 'insert' cursor in a editor.

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

A range in a text document expressed as (zero-based) start and end positions. A range is comparable to a selection in an editor. Therefore the end position is exclusive.

```typescript
interface Range {
	/**
	 * The range's start position.
	 */
	start: Position;

	/**
	 * The range's end position.
	 */
	end: Position;
}
```

#### Location

Represents a location inside a resource, such as a line inside a text file.
```typescript
interface Location {
	uri: DocumentUri;
	range: Range;
}
```

#### Diagnostic

Represents a diagnostic, such as a compiler error or warning. Diagnostic objects are only valid in the scope of a resource.

```typescript
interface Diagnostic {
	/**
	 * The range at which the message applies.
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
	 * A human-readable string describing the source of this
	 * diagnostic, e.g. 'typescript' or 'super lint'.
	 */
	source?: string;

	/**
	 * The diagnostic's message.
	 */
	message: string;
}
```

The protocol currently supports the following diagnostic severities:

```typescript
namespace DiagnosticSeverity {
	/**
	 * Reports an error.
	 */
	export const Error = 1;
	/**
	 * Reports a warning.
	 */
	export const Warning = 2;
	/**
	 * Reports an information.
	 */
	export const Information = 3;
	/**
	 * Reports a hint.
	 */
	export const Hint = 4;
}
```

#### Command

Represents a reference to a command. Provides a title which will be used to represent a command in the UI. Commands are identified by a string identifier. The protocol currently doesn't specify a set of well-known commands. So executing a command requires some tool extension code.

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

If multiple `TextEdit`s are applied to a text document, all text edits describe changes made to the initial document version. Execution-wise text edits should be applied from the bottom to the top of the text document. Overlapping text edits are not supported.  

>#### New: TextDocumentEdit

Describes textual changes on a single text document. The text document is referred to as a `VersionedTextDocumentIdentifier` to allow clients to check the text document version before an edit is applied. A `TextDocumentEdit` describes all changes on a version Si and after they are applied move the document to version Si+1. So the creator of a `TextDocumentEdit` doesn't need to sort the array or do any kind of ordering. However the edits must be non overlapping.

```typescript
export interface TextDocumentEdit {
	/**
	 * The text document to change.
	 */
	textDocument: VersionedTextDocumentIdentifier;

	/**
	 * The edits to be applied.
	 */
	edits: TextEdit[];
}
```

#### WorkspaceEdit

> **Changed** A workspace edit represents changes to many resources managed in the workspace. The edit should either provide `changes` or `documentChanges`. If the client can handle versioned document edits and if `documentChange`s are present, the latter are preferred over `changes`.

```typescript
export interface WorkspaceEdit {
	/**
	 * Holds changes to existing resources.
	 */
	changes?: { [uri: string]: TextEdit[]; };

	/**
	 * An array of `TextDocumentEdit`s to express changes to n different text documents
	 * where each text document edit addresses a specific version of a text document. 
	 * Whether a client supports versioned document edits is expressed via 
	 * `WorkspaceClientCapabilities.workspaceEdit.documentChanges`.
	 */
	documentChanges?: TextDocumentEdit[];
}
```

#### TextDocumentIdentifier

Text documents are identified using a URI. On the protocol level, URIs are passed as strings. The corresponding JSON structure looks like this:
```typescript
interface TextDocumentIdentifier {
	/**
	 * The text document's URI.
	 */
	uri: DocumentUri;
}
```

#### TextDocumentItem

An item to transfer a text document from the client to the server.

```typescript
interface TextDocumentItem {
	/**
	 * The text document's URI.
	 */
	uri: DocumentUri;

	/**
	 * The text document's language identifier.
	 */
	languageId: string;

	/**
	 * The version number of this document (it will increase after each
	 * change, including undo/redo).
	 */
	version: number;

	/**
	 * The content of the opened text document.
	 */
	text: string;
}
```

#### VersionedTextDocumentIdentifier

An identifier to denote a specific version of a text document.

```typescript
interface VersionedTextDocumentIdentifier extends TextDocumentIdentifier {
	/**
	 * The version number of this document.
	 */
	version: number;
}
```

#### TextDocumentPositionParams

Was `TextDocumentPosition` in 1.0 with inlined parameters.

A parameter literal used in requests to pass a text document and a position inside that document.

```typescript
interface TextDocumentPositionParams {
	/**
	 * The text document.
	 */
	textDocument: TextDocumentIdentifier;

	/**
	 * The position inside the text document.
	 */
	position: Position;
}
```

> #### New: DocumentFilter

A document filter denotes a document through properties like `language`, `schema` or `pattern`. An example is a filter that applies to TypeScript files on disk. Another example is a filter the applies to JSON files with name `package.json`:
```typescript
{ language: 'typescript', scheme: 'file' }
{ language: 'json', pattern: '**/package.json' }
```

```typescript
export interface DocumentFilter {
	/**
	 * A language id, like `typescript`.
	 */
	language?: string;

	/**
	 * A Uri [scheme](#Uri.scheme), like `file` or `untitled`.
	 */
	scheme?: string;

	/**
	 * A glob pattern, like `*.{ts,js}`.
	 */
	pattern?: string;
}
```

A document selector is the combination of one or more document filters.

```typescript
export type DocumentSelector = DocumentFilter[];
```

### Actual Protocol

This section documents the actual language server protocol. It uses the following format:

* a header describing the request
* a _Request_: section describing the format of the request sent. The method is a string identifying the request the params are documented using a TypeScript interface
* a _Response_: section describing the format of the response. The result item describes the returned data in case of a success. The error.data describes the returned data in case of an error. Please remember that in case of a failure the response already contains an error.code and an error.message field. These fields are only speced if the protocol forces the use of certain error codes or messages. In cases where the server can decide on these values freely they aren't listed here.
* a _Registration Options_ section decribing the registration option if the request or notification supports dynamic capability registration.

#### Request, Notification and response ordering

Responses for requests should be sent in the same order as the requests appear on the server or client side. So for example if a server receives a `textDocument/completion` request and then a `textDocument/signatureHelp` request it should first return the response for the `textDocument/completion` and then the response for `textDocument/signatureHelp`.

How the server internally processes the requests is up to the server implementation. If the server decides to execute them in parallel and this produces correct result the server is free to do so. The server is also allowed to reorder requests and notification if the reordering doesn't affect correctness.

#### Server lifetime

The current protocol specification defines that the lifetime of a server is managed by the client (e.g. a tool like VS Code or Emacs). It is up to the client to decide when to start (process vise) and when to shutdown a server.

#### <a name="initialize"></a>Initialize Request

The initialize request is sent as the first request from the client to the server. If the server receives request or notification before the `initialize` request it should act as follows:

* for a request the respond should be errored with `code: -32002`. The message can be picked by the server.
* notifications should be dropped, except for the exit notification. This will allow the exit a server without an initialize request.

Until the server has responded to the `initialize` request with an `InitializeResult` the client must not sent any additional requests or notifications to the server. 

>**Updated**: During the `initialize` request the server is allowed to sent the notifications `window/showMessage`, `window/logMessage` and `telemetry/event` as well as the `window/showMessageRequest` request to the client.

_Request_:
* method: 'initialize'
* params: `InitializeParams` defined as follows:

```typescript
interface InitializeParams {
	/**
	 * The process Id of the parent process that started
	 * the server. Is null if the process has not been started by another process.
	 * If the parent process is not alive then the server should exit (see exit notification) its process.
	 */
	processId: number | null;

	/**
	 * The rootPath of the workspace. Is null
	 * if no folder is open.
	 *
	 * @deprecated in favour of rootUri.
	 */
	rootPath?: string | null;

	/**
	 * The rootUri of the workspace. Is null if no
	 * folder is open. If both `rootPath` and `rootUri` are set
	 * `rootUri` wins.
	 */
	rootUri: DocumentUri | null;

	/**
	 * User provided initialization options.
	 */
	initializationOptions?: any;

	/**
	 * The capabilities provided by the client (editor or tool)
	 */
	capabilities: ClientCapabilities;

	/**
	 * The initial trace setting. If omitted trace is disabled ('off').
	 */
	trace?: 'off' | 'messages' | 'verbose';
}
```
Where `ClientCapabilities`, `TextDocumentClientCapabilities` and `WorkspaceClientCapabilities` are defined as follows:

>**New**: `WorkspaceClientCapabilities` define capabilities the editor / tool provides on the workspace:

```typescript
/**
 * Workspace specific client capabilities.
 */
export interface WorkspaceClientCapabilities {
	/**
	 * The client supports applying batch edits to the workspace by supporting
	 * the request 'workspace/applyEdit'
	 */
	applyEdit?: boolean;

	/**
	 * Capabilities specific to `WorkspaceEdit`s
	 */
	workspaceEdit?: {
		/**
		 * The client supports versioned document changes in `WorkspaceEdit`s
		 */
		documentChanges?: boolean;
	};

	/**
	 * Capabilities specific to the `workspace/didChangeConfiguration` notification.
	 */
	didChangeConfiguration?: {
		/**
		 * Did change configuration notification supports dynamic registration.
		 */
		dynamicRegistration?: boolean;
	};

	/**
	 * Capabilities specific to the `workspace/didChangeWatchedFiles` notification.
	 */
	didChangeWatchedFiles?: {
		/**
		 * Did change watched files notification supports dynamic registration.
		 */
		dynamicRegistration?: boolean;
	};

	/**
	 * Capabilities specific to the `workspace/symbol` request.
	 */
	symbol?: {
		/**
		 * Symbol request supports dynamic registration.
		 */
		dynamicRegistration?: boolean;
	};

	/**
	 * Capabilities specific to the `workspace/executeCommand` request.
	 */
	executeCommand?: {
		/**
		 * Execute command supports dynamic registration.
		 */
		dynamicRegistration?: boolean;
	};
}
```

>**New**: `TextDocumentClientCapabilities` define capabilities the editor / tool provides on text documents.

```typescript
/**
 * Text document specific client capabilities.
 */
export interface TextDocumentClientCapabilities {

	synchronization?: {
		/**
		 * Whether text document synchronization supports dynamic registration.
		 */
		dynamicRegistration?: boolean;

		/**
		 * The client supports sending will save notifications.
		 */
		willSave?: boolean;

		/**
		 * The client supports sending a will save request and
		 * waits for a response providing text edits which will
		 * be applied to the document before it is saved.
		 */
		willSaveWaitUntil?: boolean;

		/**
		 * The client supports did save notifications.
		 */
		didSave?: boolean;
	}

	/**
	 * Capabilities specific to the `textDocument/completion`
	 */
	completion?: {
		/**
		 * Whether completion supports dynamic registration.
		 */
		dynamicRegistration?: boolean;

		/**
		 * The client supports the following `CompletionItem` specific
		 * capabilities.
		 */
		completionItem?: {
			/**
			 * Client supports snippets as insert text.
			 *
			 * A snippet can define tab stops and placeholders with `$1`, `$2`
			 * and `${3:foo}`. `$0` defines the final tab stop, it defaults to
			 * the end of the snippet. Placeholders with equal identifiers are linked,
			 * that is typing in one will update others too.
			 */
			snippetSupport?: boolean;
		}
	};

	/**
	 * Capabilities specific to the `textDocument/hover`
	 */
	hover?: {
		/**
		 * Whether hover supports dynamic registration.
		 */
		dynamicRegistration?: boolean;
	};

	/**
	 * Capabilities specific to the `textDocument/signatureHelp`
	 */
	signatureHelp?: {
		/**
		 * Whether signature help supports dynamic registration.
		 */
		dynamicRegistration?: boolean;
	};

	/**
	 * Capabilities specific to the `textDocument/references`
	 */
	references?: {
		/**
		 * Whether references supports dynamic registration.
		 */
		dynamicRegistration?: boolean;
	};

	/**
	 * Capabilities specific to the `textDocument/documentHighlight`
	 */
	documentHighlight?: {
		/**
		 * Whether document highlight supports dynamic registration.
		 */
		dynamicRegistration?: boolean;
	};

	/**
	 * Capabilities specific to the `textDocument/documentSymbol`
	 */
	documentSymbol?: {
		/**
		 * Whether document symbol supports dynamic registration.
		 */
		dynamicRegistration?: boolean;
	};

	/**
	 * Capabilities specific to the `textDocument/formatting`
	 */
	formatting?: {
		/**
		 * Whether formatting supports dynamic registration.
		 */
		dynamicRegistration?: boolean;
	};

	/**
	 * Capabilities specific to the `textDocument/rangeFormatting`
	 */
	rangeFormatting?: {
		/**
		 * Whether range formatting supports dynamic registration.
		 */
		dynamicRegistration?: boolean;
	};

	/**
	 * Capabilities specific to the `textDocument/onTypeFormatting`
	 */
	onTypeFormatting?: {
		/**
		 * Whether on type formatting supports dynamic registration.
		 */
		dynamicRegistration?: boolean;
	};

	/**
	 * Capabilities specific to the `textDocument/definition`
	 */
	definition?: {
		/**
		 * Whether definition supports dynamic registration.
		 */
		dynamicRegistration?: boolean;
	};

	/**
	 * Capabilities specific to the `textDocument/codeAction`
	 */
	codeAction?: {
		/**
		 * Whether code action supports dynamic registration.
		 */
		dynamicRegistration?: boolean;
	};

	/**
	 * Capabilities specific to the `textDocument/codeLens`
	 */
	codeLens?: {
		/**
		 * Whether code lens supports dynamic registration.
		 */
		dynamicRegistration?: boolean;
	};

	/**
	 * Capabilities specific to the `textDocument/documentLink`
	 */
	documentLink?: {
		/**
		 * Whether document link supports dynamic registration.
		 */
		dynamicRegistration?: boolean;
	};

	/**
	 * Capabilities specific to the `textDocument/rename`
	 */
	rename?: {
		/**
		 * Whether rename supports dynamic registration.
		 */
		dynamicRegistration?: boolean;
	};
}
```

> **New**: `ClientCapabilities` now define capabilities for dynamic registration, workspace and text document features the client supports. The `experimental` can be used to pass experimential capabilities under development. For future compatibility a `ClientCapabilities` object literal can have more properties set than currently defined. Servers receiving a `ClientCapabilities` object literal with unknown properties should ignore these properties. A missing property should be interpreted as an absence of the capability. If a property is missing that defines sub properties all sub properties should be interpreted as an absence of the capability.

Client capabilities got introduced with the version 3.0 of the protocol. They therefore only describe capabilities that got introduced in 3.x or later. Capabilities that existed in the 2.x version of the protocol are still mandatory for clients. Clients cannot opt out of providing them. So even if a client omits the `ClientCapabilities.textDocument.synchronization` it is still required that the client provides text document synchronization (e.g. open, changed and close notifications).

```typescript
interface ClientCapabilities {
	/**
	 * Workspace specific client capabilities.
	 */
	workspace?: WorkspaceClientCapabilities;

	/**
	 * Text document specific client capabilities.
	 */
	textDocument?: TextDocumentClientCapabilities;

	/**
	 * Experimental client capabilities.
	 */
	experimental?: any;
}
```

_Response_:
* result: `InitializeResult` defined as follows:
```typescript
interface InitializeResult {
	/**
	 * The capabilities the language server provides.
	 */
	capabilities: ServerCapabilities;
}
```
* error.code:
```typescript
/**
 * Known error codes for an `InitializeError`;
 */
export namespace InitializeError {
	/**
	 * If the protocol version provided by the client can't be handled by the server.
	 * @deprecated This initialize error got replaced by client capabilities. There is
	 * no version handshake in version 3.0x
	 */
	export const unknownProtocolVersion: number = 1;
}
```

* error.data:
```typescript
interface InitializeError {
	/**
	 * Indicates whether the client execute the following retry logic:
	 * (1) show the message provided by the ResponseError to the user
	 * (2) user selects retry or cancel
	 * (3) if user selected retry the initialize method is sent again.
	 */
	retry: boolean;
}
```

The server can signal the following capabilities:

```typescript
/**
 * Defines how the host (editor) should sync document changes to the language server.
 */
export namespace TextDocumentSyncKind {
	/**
	 * Documents should not be synced at all.
	 */
	export const None = 0;

	/**
	 * Documents are synced by always sending the full content
	 * of the document.
	 */
	export const Full = 1;

	/**
	 * Documents are synced by sending the full content on open.
	 * After that only incremental updates to the document are
	 * send.
	 */
	export const Incremental = 2;
}

/**
 * Completion options.
 */
export interface CompletionOptions {
	/**
	 * The server provides support to resolve additional
	 * information for a completion item.
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
export interface SignatureHelpOptions {
	/**
	 * The characters that trigger signature help
	 * automatically.
	 */
	triggerCharacters?: string[];
}

/**
 * Code Lens options.
 */
export interface CodeLensOptions {
	/**
	 * Code lens has a resolve provider as well.
	 */
	resolveProvider?: boolean;
}

/**
 * Format document on type options
 */
export interface DocumentOnTypeFormattingOptions {
	/**
	 * A character on which formatting should be triggered, like `}`.
	 */
	firstTriggerCharacter: string;

	/**
	 * More trigger characters.
	 */
	moreTriggerCharacter?: string[];
}

/**
 * Document link options
 */
export interface DocumentLinkOptions {
	/**
	 * Document links have a resolve provider as well.
	 */
	resolveProvider?: boolean;
}

/**
 * Execute command options.
 */
export interface ExecuteCommandOptions {
	/**
	 * The commands to be executed on the server
	 */
	commands: string[]
}

/**
 * Save options.
 */
export interface SaveOptions {
	/**
	 * The client is supposed to include the content on save.
	 */
	includeText?: boolean;
}

export interface TextDocumentSyncOptions {
	/**
	 * Open and close notifications are sent to the server.
	 */
	openClose?: boolean;
	/**
	 * Change notificatins are sent to the server. See TextDocumentSyncKind.None, TextDocumentSyncKind.Full
	 * and TextDocumentSyncKindIncremental.
	 */
	change?: number;
	/**
	 * Will save notifications are sent to the server.
	 */
	willSave?: boolean;
	/**
	 * Will save wait until requests are sent to the server.
	 */
	willSaveWaitUntil?: boolean;
	/**
	 * Save notifications are sent to the server.
	 */
	save?: SaveOptions;
}

interface ServerCapabilities {
	/**
	 * Defines how text documents are synced. Is either a detailed structure defining each notification or
	 * for backwards compatibility the TextDocumentSyncKind number.
	 */
	textDocumentSync?: TextDocumentSyncOptions | number;
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
	renameProvider?: boolean;
	/**
	 * The server provides document link support.
	 */
	documentLinkProvider?: DocumentLinkOptions;
	/**
	 * The server provides execute command support.
	 */
	executeCommandProvider?: ExecuteCommandOptions;
	/**
	 * Experimental server capabilities.
	 */
	experimental?: any;
}
```

>#### New: <a name="initialized"></a>Initialized Notification

The initialized notification is sent from the client to the server after the client received the result of the `initialize` request but before the client is sending any other request or notification to the server. The server can use the `initialized` notification for example to dynamically register capabilities.

_Notification_:
* method: 'initialized'
* params: void

#### <a name="shutdown"></a>Shutdown Request

The shutdown request is sent from the client to the server. It asks the server to shut down, but to not exit (otherwise the response might not be delivered correctly to the client). There is a separate exit notification that asks the server to exit.

_Request_:
* method: 'shutdown'
* params: void

_Response_:
* result: null
* error: code and message set in case an exception happens during shutdown request.

#### <a name="exit"></a>Exit Notification

A notification to ask the server to exit its process.
The server should exit with `success` code 0 if the shutdown request has been received before; otherwise with `error` code 1.

_Notification_:
* method: 'exit'
* params: void

#### <a name="window_showMessage"></a>ShowMessage Notification

The show message notification is sent from a server to a client to ask the client to display a particular message in the user interface.

_Notification_:
* method: 'window/showMessage'
* params: `ShowMessageParams` defined as follows:

```typescript
interface ShowMessageParams {
	/**
	 * The message type. See {@link MessageType}.
	 */
	type: number;

	/**
	 * The actual message.
	 */
	message: string;
}
```

Where the type is defined as follows:

```typescript
export namespace MessageType {
	/**
	 * An error message.
	 */
	export const Error = 1;
	/**
	 * A warning message.
	 */
	export const Warning = 2;
	/**
	 * An information message.
	 */
	export const Info = 3;
	/**
	 * A log message.
	 */
	export const Log = 4;
}
```

#### <a name="window_showMessageRequest"></a>ShowMessage Request

The show message request is sent from a server to a client to ask the client to display a particular message in the user interface. In addition to the show message notification the request allows to pass actions and to wait for an answer from the client.

_Request_:
* method: 'window/showMessageRequest'
* params: `ShowMessageRequestParams` defined as follows:

_Response_:
* result: the selected `MessageActionItem`
* error: code and message set in case an exception happens during showing a message.

```typescript
interface ShowMessageRequestParams {
	/**
	 * The message type. See {@link MessageType}
	 */
	type: number;

	/**
	 * The actual message
	 */
	message: string;

	/**
	 * The message action items to present.
	 */
	actions?: MessageActionItem[];
}
```

Where the `MessageActionItem` is defined as follows:

```typescript
interface MessageActionItem {
	/**
	 * A short title like 'Retry', 'Open Log' etc.
	 */
	title: string;
}
```

#### <a name="window_logMessage"></a>LogMessage Notification

The log message notification is sent from the server to the client to ask the client to log a particular message.

_Notification_:
* method: 'window/logMessage'
* params: `LogMessageParams` defined as follows:

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

#### <a name="telemetry_event"></a>Telemetry Notification

The telemetry notification is sent from the server to the client to ask the client to log a telemetry event.

_Notification_:
* method: 'telemetry/event'
* params: 'any'

> #### New: <a name="client_registerCapability"></a>Register Capability

The `client/registerCapability` request is sent from the server to the client to register for a new capability on the client side. Not all clients need to support dynamic capability registration. A client opts in via the `ClientCapabilities.dynamicRegistration` property.

_Request_:
* method: 'client/registerCapability'
* params: `RegistrationParams`

Where `RegistrationParams` are defined as follows:

```typescript
/**
 * General parameters to register for a capability.
 */
export interface Registration {
	/**
	 * The id used to register the request. The id can be used to deregister
	 * the request again.
	 */
	id: string;

	/**
	 * The method / capability to register for.
	 */
	method: string;

	/**
	 * Options necessary for the registration.
	 */
	registerOptions?: any;
}

export interface RegistrationParams {
	registrations: Registration[];
}
```

Since most of the registration options require to specify a document selector there is a base interface that can be used.

```typescript
export interface TextDocumentRegistrationOptions {
	/**
	 * A document selector to identify the scope of the registration. If set to null
	 * the document selector provided on the client side will be used.
	 */
	documentSelector: DocumentSelector | null;
}
```

An example JSON RPC message to register dynamically for the `textDocument/willSaveWaitUntil` feature on the client side is as follows (only details shown):

```json
{
	"method": "client/registerCapability",
	"params": {
		"registrations": [
			{
				"id": "79eee87c-c409-4664-8102-e03263673f6f",
				"method": "textDocument/willSaveWaitUntil",
				"registerOptions": {
					"documentSelector": [
						{ "language": "javascript" }
					]
				}
			}
		]
	}
}
```

This message is sent from the server to the client and after the client has successfully executed the request further `textDocument/willSaveWaitUntil` requests for JavaScript text documents are sent from the client to the server.

_Response_:
* result: void.
* error: code and message set in case an exception happens during the request.

> #### New: <a name="client_unregisterCapability"></a>Unregister Capability

The `client/unregisterCapability` request is sent from the server to the client to unregister a previously registered capability.

_Request_:
* method: 'client/unregisterCapability'
* params: `UnregistrationParams`

Where `UnregistrationParams` are defined as follows:

```typescript
/**
 * General parameters to unregister a capability.
 */
export interface Unregistration {
	/**
	 * The id used to unregister the request or notification. Usually an id
	 * provided during the register request.
	 */
	id: string;

	/**
	 * The method / capability to unregister for.
	 */
	method: string;
}

export interface UnregistrationParams {
	unregisterations: Unregistration[];
}
```

An example JSON RPC message to unregister the above registered `textDocument/willSaveWaitUntil` feature looks like this:

```json
{
	"method": "client/unregisterCapability",
	"params": {
		"unregisterations": [
			{
				"id": "79eee87c-c409-4664-8102-e03263673f6f",
				"method": "textDocument/willSaveWaitUntil"
			}
		]
	}
}
```

#### <a name="workspace_didChangeConfiguration"></a>DidChangeConfiguration Notification

A notification sent from the client to the server to signal the change of configuration settings.

_Notification_:
* method: 'workspace/didChangeConfiguration',
* params: `DidChangeConfigurationParams` defined as follows:

```typescript
interface DidChangeConfigurationParams {
	/**
	 * The actual changed settings
	 */
	settings: any;
}
```

#### <a name="textDocument_didOpen"></a>DidOpenTextDocument Notification

The document open notification is sent from the client to the server to signal newly opened text documents. The document's truth is now managed by the client and the server must not try to read the document's truth using the document's uri. Open in this sense means it is managed by the client. It doesn't necessarily mean that its content is presented in an editor. An open notification must not be sent more than once without a corresponding close notification send before. This means open and close notification must be balanced and the max open count is one. 

_Notification_:
* method: 'textDocument/didOpen'
* params: `DidOpenTextDocumentParams` defined as follows:

```typescript
interface DidOpenTextDocumentParams {
	/**
	 * The document that was opened.
	 */
	textDocument: TextDocumentItem;
}
```

_Registration Options_: `TextDocumentRegistrationOptions`

#### <a name="textDocument_didChange"></a>DidChangeTextDocument Notification

The document change notification is sent from the client to the server to signal changes to a text document. In 2.0 the shape of the params has changed to include proper version numbers and language ids.

_Notification_:
* method: 'textDocument/didChange'
* params: `DidChangeTextDocumentParams` defined as follows:

```typescript
interface DidChangeTextDocumentParams {
	/**
	 * The document that did change. The version number points
	 * to the version after all provided content changes have
	 * been applied.
	 */
	textDocument: VersionedTextDocumentIdentifier;

	/**
	 * The actual content changes. The content changes descibe single state changes
	 * to the document. So if there are two content changes c1 and c2 for a document 
	 * in state S10 then c1 move the document to S11 and c2 to S12.
	 */
	contentChanges: TextDocumentContentChangeEvent[];
}

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
	 * The new text of the range/document.
	 */
	text: string;
}
```

_Registration Options_: `TextDocumentChangeRegistrationOptions` defined as follows:

```typescript
/**
 * Descibe options to be used when registered for text document change events.
 */
export interface TextDocumentChangeRegistrationOptions extends TextDocumentRegistrationOptions {
	/**
	 * How documents are synced to the server. See TextDocumentSyncKind.Full
	 * and TextDocumentSyncKindIncremental.
	 */
	syncKind: number;
}
```


> #### New: <a name="textDocument_willSave"></a>WillSaveTextDocument Notification

The document will save notification is sent from the client to the server before the document is actually saved.

_Notification_:
* method: 'textDocument/willSave'
* params: `WillSaveTextDocumentParams` defined as follows:

```typescript
/**
 * The parameters send in a will save text document notification.
 */
export interface WillSaveTextDocumentParams {
	/**
	 * The document that will be saved.
	 */
	textDocument: TextDocumentIdentifier;

	/**
	 * The 'TextDocumentSaveReason'.
	 */
	reason: number;
}

/**
 * Represents reasons why a text document is saved.
 */
export namespace TextDocumentSaveReason {

	/**
	 * Manually triggered, e.g. by the user pressing save, by starting debugging,
	 * or by an API call.
	 */
	export const Manual = 1;

	/**
	 * Automatic after a delay.
	 */
	export const AfterDelay = 2;

	/**
	 * When the editor lost focus.
	 */
	export const FocusOut = 3;
}
```

_Registration Options_: `TextDocumentRegistrationOptions`


> #### New: <a name="textDocument_willSaveWaitUntil"></a>WillSaveWaitUntilTextDocument Request

The document will save request is sent from the client to the server before the document is actually saved. The request can return an array of TextEdits which will be applied to the text document before it is saved. Please note that clients might drop results if computing the text edits took too long or if a server constantly fails on this request. This is done to keep the save fast and reliable.

_Request_:
* method: 'textDocument/willSaveWaitUntil'
* params: `WillSaveTextDocumentParams`

_Response_:
* result: `TextEdit[]`
* error: code and message set in case an exception happens during the `willSaveWaitUntil` request.

_Registration Options_: `TextDocumentRegistrationOptions`

#### <a name="textDocument_didSave"></a>DidSaveTextDocument Notification

The document save notification is sent from the client to the server when the document was saved in the client.

* method: 'textDocument/didSave'
* params: `DidSaveTextDocumentParams` defined as follows:

```typescript
interface DidSaveTextDocumentParams {
	/**
	 * The document that was saved.
	 */
	textDocument: TextDocumentIdentifier;

	/**
	 * Optional the content when saved. Depends on the includeText value
	 * when the save notifcation was requested.
	 */
	text?: string;
}
```

_Registration Options_: `TextDocumentSaveRegistrationOptions` defined as follows:

```typescript
export interface TextDocumentSaveRegistrationOptions extends TextDocumentRegistrationOptions {
	/**
	 * The client is supposed to include the content on save.
	 */
	includeText?: boolean;
}
```

#### <a name="textDocument_didClose"></a>DidCloseTextDocument Notification

The document close notification is sent from the client to the server when the document got closed in the client. The document's truth now exists where the document's uri points to (e.g. if the document's uri is a file uri the truth now exists on disk). As with the open notification the close notification is about managing the document's content. Receiving a close notification doesn't mean that the document was open in an editor before. A close notification requires a previous open notifaction to be sent.

_Notification_:
* method: 'textDocument/didClose'
* params: `DidCloseTextDocumentParams` defined as follows:

```typescript
interface DidCloseTextDocumentParams {
	/**
	 * The document that was closed.
	 */
	textDocument: TextDocumentIdentifier;
}
```

_Registration Options_: `TextDocumentRegistrationOptions`

#### <a name="workspace_didChangeWatchedFiles"></a>DidChangeWatchedFiles Notification

The watched files notification is sent from the client to the server when the client detects changes to files watched by the language client.

_Notification_:
* method: 'workspace/didChangeWatchedFiles'
* params: `DidChangeWatchedFilesParams` defined as follows:
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
	type: number;
}

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

#### <a name="textDocument_publishDiagnostics"></a>PublishDiagnostics Notification

Diagnostics notification are sent from the server to the client to signal results of validation runs.

Diagnostics are "owned" by the server so it is the server's responsibility to clear them if necessary. The following rule is used for VS Code servers that generate diagnostics:

* if a language is single file only (for example HTML) then diagnostics are cleared by the server when the file is closed.
* if a language has a project system (for example C#) diagnostics are not cleared when a file closes. When a project is opened all diagnostics for all files are recomputed (or read from a cache).

When a file changes it is the server's responsibility to re-compute diagnostics and push them to the client. If the computed set is empty it has to push the empty array to clear former diagnostics. Newly pushed diagnostics always replace previous pushed diagnostics. There is not merging happening on the client side. 

_Notification_:
* method: 'textDocument/publishDiagnostics'
* params: `PublishDiagnosticsParams` defined as follows:

```typescript
interface PublishDiagnosticsParams {
	/**
	 * The URI for which diagnostic information is reported.
	 */
	uri: DocumentUri;

	/**
	 * An array of diagnostic information items.
	 */
	diagnostics: Diagnostic[];
}
```

#### <a name="textDocument_completion"></a>Completion Request

The Completion request is sent from the client to the server to compute completion items at a given cursor position. Completion items are presented in the [IntelliSense](https://code.visualstudio.com/docs/editor/editingevolved#_intellisense) user interface. If computing full completion items is expensive, servers can additionally provide a handler for the completion item resolve request ('completionItem/resolve'). This request is sent when a completion item is selected in the user interface. A typical use case is for example: the 'textDocument/completion' request doesn't fill in the `documentation` property for returned completion items since it is expensive to compute. When the item is selected in the user interface then a 'completionItem/resolve' request is sent with the selected completion item as a param. The returned completion item should have the documentation property filled in.

_Request_:
* method: 'textDocument/completion'
* params: [`TextDocumentPositionParams`](#textdocumentpositionparams)

_Response_:
* result: `CompletionItem[] | CompletionList`
```typescript
/**
 * Represents a collection of [completion items](#CompletionItem) to be presented
 * in the editor.
 */
interface CompletionList {
	/**
	 * This list it not complete. Further typing should result in recomputing
	 * this list.
	 */
	isIncomplete: boolean;
	/**
	 * The completion items.
	 */
	items: CompletionItem[];
}

/**
 * Defines whether the insert text in a completion item should be interpreted as
 * plain text or a snippet.
 */
namespace InsertTextFormat {
	/**
	 * The primary text to be inserted is treated as a plain string.
	 */
	export const PlainText = 1;

	/**
	 * The primary text to be inserted is treated as a snippet.
	 *
	 * A snippet can define tab stops and placeholders with `$1`, `$2`
	 * and `${3:foo}`. `$0` defines the final tab stop, it defaults to
	 * the end of the snippet. Placeholders with equal identifiers are linked,
	 * that is typing in one will update others too.
	 *
	 * See also: https://github.com/Microsoft/vscode/blob/master/src/vs/editor/contrib/snippet/common/snippet.md
	 */
	export const Snippet = 2;
}

type InsertTextFormat = 1 | 2;

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
	 * with other items. When `falsy` the label is used.
	 */
	sortText?: string;
	/**
	 * A string that should be used when filtering a set of
	 * completion items. When `falsy` the label is used.
	 */
	filterText?: string;
	/**
	 * A string that should be inserted a document when selecting
	 * this completion. When `falsy` the label is used.
	 */
	insertText?: string;
	/**
	 * The format of the insert text. The format applies to both the `insertText` property
	 * and the `newText` property of a provided `textEdit`.
	 */
	insertTextFormat?: InsertTextFormat;
	/**
	 * An edit which is applied to a document when selecting this completion. When an edit is provided the value of
	 * `insertText` is ignored.
	 *
	 * *Note:* The range of the edit must be a single line range and it must contain the position at which completion
	 * has been requested.
	 */
	textEdit?: TextEdit;
	/**
	 * An optional array of additional text edits that are applied when
	 * selecting this completion. Edits must not overlap with the main edit
	 * nor with themselves.
	 */
	additionalTextEdits?: TextEdit[];
	/**
	 * An optional set of characters that when pressed while this completion is active will accept it first and
	 * then type that character. *Note* that all commit characters should have `length=1` and that superfluous
	 * characters will be ignored.
	 */
	commitCharacters?: string[];
	/**
	 * An optional command that is executed *after* inserting this completion. *Note* that
	 * additional modifications to the current document should be described with the
	 * additionalTextEdits-property.
	 */
	command?: Command;
	/**
	 * An data entry field that is preserved on a completion item between
	 * a completion and a completion resolve request.
	 */
	data?: any
}

/**
 * The kind of a completion entry.
 */
namespace CompletionItemKind {
	export const Text = 1;
	export const Method = 2;
	export const Function = 3;
	export const Constructor = 4;
	export const Field = 5;
	export const Variable = 6;
	export const Class = 7;
	export const Interface = 8;
	export const Module = 9;
	export const Property = 10;
	export const Unit = 11;
	export const Value = 12;
	export const Enum = 13;
	export const Keyword = 14;
	export const Snippet = 15;
	export const Color = 16;
	export const File = 17;
	export const Reference = 18;
}
```
* error: code and message set in case an exception happens during the completion request.

_Registration Options_: `CompletionRegistrationOptions` options defined as follows:

```typescript
export interface CompletionRegistrationOptions extends TextDocumentRegistrationOptions {
	/**
	 * The characters that trigger completion automatically.
	 */
	triggerCharacters?: string[];

	/**
	 * The server provides support to resolve additional
	 * information for a completion item.
	 */
	resolveProvider?: boolean;
}
```

#### <a name="completionItem_resolve"></a>Completion Item Resolve Request

The request is sent from the client to the server to resolve additional information for a given completion item.

_Request_:
* method: 'completionItem/resolve'
* params: `CompletionItem`

_Response_:
* result: `CompletionItem`
* error: code and message set in case an exception happens during the completion resolve request.

#### <a name="textDocument_hover"></a>Hover Request

The hover request is sent from the client to the server to request hover information at a given text document position.

_Request_:
* method: 'textDocument/hover'
* params: [`TextDocumentPositionParams`](#textdocumentpositionparams)

_Response_:
* result: `Hover` defined as follows:

```typescript
/**
 * The result of a hover request.
 */
interface Hover {
	/**
	 * The hover's content
	 */
	contents: MarkedString | MarkedString[];

	/**
	 * An optional range is a range inside a text document
	 * that is used to visualize a hover, e.g. by changing the background color.
	 */
	range?: Range;
}
```

Where `MarkedString` is defined as follows:

```typescript
/**
 * MarkedString can be used to render human readable text. It is either a markdown string
 * or a code-block that provides a language and a code snippet. The language identifier
 * is sematically equal to the optional language identifier in fenced code blocks in GitHub
 * issues. See https://help.github.com/articles/creating-and-highlighting-code-blocks/#syntax-highlighting
 *
 * The pair of a language and a value is an equivalent to markdown:
 * ```${language}
 * ${value}
 * ```
 *
 * Note that markdown strings will be sanitized - that means html will be escaped.
 */
type MarkedString = string | { language: string; value: string };
```

* error: code and message set in case an exception happens during the hover request.

_Registration Options_: `TextDocumentRegistrationOptions`

#### <a name="textDocument_signatureHelp"></a>Signature Help Request

The signature help request is sent from the client to the server to request signature information at a given cursor position.

_Request_:
* method: 'textDocument/signatureHelp'
* params: [`TextDocumentPositionParams`](#textdocumentpositionparams)

_Response_:
* result: `SignatureHelp` defined as follows:

```typescript
/**
 * Signature help represents the signature of something
 * callable. There can be multiple signature but only one
 * active and only one active parameter.
 */
interface SignatureHelp {
	/**
	 * One or more signatures.
	 */
	signatures: SignatureInformation[];

	/**
	 * The active signature. If omitted or the value lies outside the
	 * range of `signatures` the value defaults to zero or is ignored if
	 * `signatures.length === 0`. Whenever possible implementors should 
	 * make an active decision about the active signature and shouldn't 
	 * rely on a default value.
	 * In future version of the protocol this property might become
	 * mandantory to better express this.
	 */
	activeSignature?: number;

	/**
	 * The active parameter of the active signature. If omitted or the value
	 * lies outside the range of `signatures[activeSignature].parameters` 
	 * defaults to 0 if the active signature has parameters. If 
	 * the active signature has no parameters it is ignored. 
	 * In future version of the protocol this property might become
	 * mandantory to better express the active parameter if the
	 * active signature does have any.
	 */
	activeParameter?: number;
}

/**
 * Represents the signature of something callable. A signature
 * can have a label, like a function-name, a doc-comment, and
 * a set of parameters.
 */
interface SignatureInformation {
	/**
	 * The label of this signature. Will be shown in
	 * the UI.
	 */
	label: string;

	/**
	 * The human-readable doc-comment of this signature. Will be shown
	 * in the UI but can be omitted.
	 */
	documentation?: string;

	/**
	 * The parameters of this signature.
	 */
	parameters?: ParameterInformation[];
}

/**
 * Represents a parameter of a callable-signature. A parameter can
 * have a label and a doc-comment.
 */
interface ParameterInformation {
	/**
	 * The label of this parameter. Will be shown in
	 * the UI.
	 */
	label: string;

	/**
	 * The human-readable doc-comment of this parameter. Will be shown
	 * in the UI but can be omitted.
	 */
	documentation?: string;
}
```

* error: code and message set in case an exception happens during the signature help request.

_Registration Options_: `SignatureHelpRegistrationOptions` defined as follows:

```typescript
export interface SignatureHelpRegistrationOptions extends TextDocumentRegistrationOptions {
	/**
	 * The characters that trigger signature help
	 * automatically.
	 */
	triggerCharacters?: string[];
}
```

#### <a name="textDocument_definition"></a>Goto Definition Request

The goto definition request is sent from the client to the server to resolve the definition location of a symbol at a given text document position.

_Request_:
* method: 'textDocument/definition'
* params: [`TextDocumentPositionParams`](#textdocumentpositionparams)

_Response_:
* result: [`Location`](#location) | [`Location`](#location)[] | `null`
* error: code and message set in case an exception happens during the definition request.

_Registration Options_: `TextDocumentRegistrationOptions`

#### <a name="textDocument_references"></a>Find References Request

The references request is sent from the client to the server to resolve project-wide references for the symbol denoted by the given text document position.

_Request_:
* method: 'textDocument/references'
* params: `ReferenceParams` defined as follows:
```typescript
interface ReferenceParams extends TextDocumentPositionParams {
	context: ReferenceContext
}
```
```typescript
interface ReferenceContext {
	/**
	 * Include the declaration of the current symbol.
	 */
	includeDeclaration: boolean;
}
```
_Response_:
* result: [`Location`](#location)[]
* error: code and message set in case an exception happens during the reference request.

_Registration Options_: `TextDocumentRegistrationOptions`

#### <a name="textDocument_documentHighlight"></a>Document Highlights Request

The document highlight request is sent from the client to the server to resolve a document highlights for a given text document position.
For programming languages this usually highlights all references to the symbol scoped to this file. However we kept 'textDocument/documentHighlight'
and 'textDocument/references' separate requests since the first one is allowed to be more fuzzy. Symbol matches usually have a `DocumentHighlightKind`
of `Read` or `Write` whereas fuzzy or textual matches use `Text`as the kind.

_Request_:
* method: 'textDocument/documentHighlight'
* params: [`TextDocumentPositionParams`](#textdocumentpositionparams)

_Response_:
* result: `DocumentHighlight`[] defined as follows:

```typescript
/**
 * A document highlight is a range inside a text document which deserves
 * special attention. Usually a document highlight is visualized by changing
 * the background color of its range.
 *
 */
interface DocumentHighlight {
	/**
	 * The range this highlight applies to.
	 */
	range: Range;

	/**
	 * The highlight kind, default is DocumentHighlightKind.Text.
	 */
	kind?: number;
}

/**
 * A document highlight kind.
 */
export namespace DocumentHighlightKind {
	/**
	 * A textual occurrence.
	 */
	export const Text = 1;

	/**
	 * Read-access of a symbol, like reading a variable.
	 */
	export const Read = 2;

	/**
	 * Write-access of a symbol, like writing to a variable.
	 */
	export const Write = 3;
}
```

* error: code and message set in case an exception happens during the document highlight request.

_Registration Options_: `TextDocumentRegistrationOptions`

#### <a name="textDocument_documentSymbol"></a>Document Symbols Request

The document symbol request is sent from the client to the server to return a flat list of all symbols found in a given text document. Neither the document's location range nor the documents container name should be used to reinfer a hierarchy.

_Request_:
* method: 'textDocument/documentSymbol'
* params: `DocumentSymbolParams` defined as follows:
```typescript
interface DocumentSymbolParams {
	/**
	 * The text document.
	 */
	textDocument: TextDocumentIdentifier;
}
```

_Response_:
* result: `SymbolInformation`[] defined as follows:
```typescript
/**
 * Represents information about programming constructs like variables, classes,
 * interfaces etc.
 */
interface SymbolInformation {
	/**
	 * The name of this symbol.
	 */
	name: string;

	/**
	 * The kind of this symbol.
	 */
	kind: number;

	/**
	 * The location of this symbol. The location's range is used by a tool
	 * to reveal the location in the editor. If the symbol is selected in the
	 * tool the range's start information is used to position the cursor. So
	 * the range usually spwans more then the actual symbol's name and does
	 * normally include thinks like visibility modifiers.
	 *
	 * The range doesn't have to denote a node range in the sense of a abstract
	 * syntax tree. It can therefore not be used to re-construct a hierarchy of
	 * the symbols.
	 */
	location: Location;

	/**
	 * The name of the symbol containing this symbol. This information is for
	 * user interface purposes (e.g. to render a qaulifier in the user interface
	 * if necessary). It can't be used to re-infer a hierarchy for the document
	 * symbols.
	 */
	containerName?: string;
}

/**
 * A symbol kind.
 */
export namespace SymbolKind {
	export const File = 1;
	export const Module = 2;
	export const Namespace = 3;
	export const Package = 4;
	export const Class = 5;
	export const Method = 6;
	export const Property = 7;
	export const Field = 8;
	export const Constructor = 9;
	export const Enum = 10;
	export const Interface = 11;
	export const Function = 12;
	export const Variable = 13;
	export const Constant = 14;
	export const String = 15;
	export const Number = 16;
	export const Boolean = 17;
	export const Array = 18;
}
```

* error: code and message set in case an exception happens during the document symbol request.

_Registration Options_: `TextDocumentRegistrationOptions`

#### <a name="workspace_symbol"></a>Workspace Symbols Request

The workspace symbol request is sent from the client to the server to list project-wide symbols matching the query string.

_Request_:
* method: 'workspace/symbol'
* params: `WorkspaceSymbolParams` defined as follows:
```typescript
/**
 * The parameters of a Workspace Symbol Request.
 */
interface WorkspaceSymbolParams {
	/**
	 * A non-empty query string
	 */
	query: string;
}
```

_Response_:
* result: `SymbolInformation[]` as defined above.
* error: code and message set in case an exception happens during the workspace symbol request.

_Registration Options_: void

#### <a name="textDocument_codeAction"></a>Code Action Request

The code action request is sent from the client to the server to compute commands for a given text document and range. These commands are typically code fixes to either fix problems or to beautify/refactor code.

_Request_:
* method: 'textDocument/codeAction'
* params: `CodeActionParams` defined as follows:
```typescript
/**
 * Params for the CodeActionRequest
 */
interface CodeActionParams {
	/**
	 * The document in which the command was invoked.
	 */
	textDocument: TextDocumentIdentifier;

	/**
	 * The range for which the command was invoked.
	 */
	range: Range;

	/**
	 * Context carrying additional information.
	 */
	context: CodeActionContext;
}

/**
 * Contains additional diagnostic information about the context in which
 * a code action is run.
 */
interface CodeActionContext {
	/**
	 * An array of diagnostics.
	 */
	diagnostics: Diagnostic[];
}
```

_Response_:
* result: [`Command[]`](#command) defined as follows:
* error: code and message set in case an exception happens during the code action request.

_Registration Options_: `TextDocumentRegistrationOptions`

#### <a name="textDocument_codeLens"></a>Code Lens Request

The code lens request is sent from the client to the server to compute code lenses for a given text document.

_Request_:
* method: 'textDocument/codeLens'
* params: `CodeLensParams` defined as follows:

```typescript
interface CodeLensParams {
	/**
	 * The document to request code lens for.
	 */
	textDocument: TextDocumentIdentifier;
}
```

_Response_:
* result: `CodeLens[]` defined as follows:

```typescript
/**
 * A code lens represents a command that should be shown along with
 * source text, like the number of references, a way to run tests, etc.
 *
 * A code lens is _unresolved_ when no command is associated to it. For performance
 * reasons the creation of a code lens and resolving should be done in two stages.
 */
interface CodeLens {
	/**
	 * The range in which this code lens is valid. Should only span a single line.
	 */
	range: Range;

	/**
	 * The command this code lens represents.
	 */
	command?: Command;

	/**
	 * A data entry field that is preserved on a code lens item between
	 * a code lens and a code lens resolve request.
	 */
	data?: any
}
```
* error: code and message set in case an exception happens during the code lens request.

_Registration Options_: `CodeLensRegistrationOptions` defined as follows:

```typescript
export interface CodeLensRegistrationOptions extends TextDocumentRegistrationOptions {
	/**
	 * Code lens has a resolve provider as well.
	 */
	resolveProvider?: boolean;
}
```

#### <a name="codeLens_resolve"></a>Code Lens Resolve Request

The code lens resolve request is sent from the client to the server to resolve the command for a given code lens item.

_Request_:
* method: 'codeLens/resolve'
* params: `CodeLens`

_Response_:
* result: `CodeLens`
* error: code and message set in case an exception happens during the code lens resolve request.

#### <a name="textDocument_documentLink"></a>Document Link Request

The document links request is sent from the client to the server to request the location of links in a document.

_Request_:
* method: 'textDocument/documentLink'
* params: `DocumentLinkParams`, defined as follows
```typescript
interface DocumentLinkParams {
	/**
	 * The document to provide document links for.
	 */
	textDocument: TextDocumentIdentifier;
}
```

_Response_:
* result: An array of `DocumentLink`, or `null`.

```typescript
/**
 * A document link is a range in a text document that links to an internal or external resource, like another
 * text document or a web site.
 */
interface DocumentLink {
	/**
	 * The range this link applies to.
	 */
	range: Range;
	/**
	 * The uri this link points to. If missing a resolve request is sent later.
	 */
	target?: DocumentUri;
}
```
* error: code and message set in case an exception happens during the document link request.

_Registration Options_: `DocumentLinkRegistrationOptions` defined as follows:

```typescript
export interface DocumentLinkRegistrationOptions extends TextDocumentRegistrationOptions {
	/**
	 * Document links have a resolve provider as well.
	 */
	resolveProvider?: boolean;
}
```

#### <a name="documentLink_resolve"></a>Document Link Resolve Request

The document link resolve request is sent from the client to the server to resolve the target of a given document link.

_Request_:
* method: 'documentLink/resolve'
* params: `DocumentLink`

_Response_:
* result: `DocumentLink`
* error: code and message set in case an exception happens during the document link resolve request.

#### <a name="textDocument_formatting"></a>Document Formatting Request

The document formatting request is sent from the server to the client to format a whole document.

_Request_:
* method: 'textDocument/formatting'
* params: `DocumentFormattingParams` defined as follows
```typescript
interface DocumentFormattingParams {
	/**
	 * The document to format.
	 */
	textDocument: TextDocumentIdentifier;

	/**
	 * The format options.
	 */
	options: FormattingOptions;
}

/**
 * Value-object describing what options formatting should use.
 */
interface FormattingOptions {
	/**
	 * Size of a tab in spaces.
	 */
	tabSize: number;

	/**
	 * Prefer spaces over tabs.
	 */
	insertSpaces: boolean;

	/**
	 * Signature for further properties.
	 */
	[key: string]: boolean | number | string;
}
```

_Response_:
* result: [`TextEdit[]`](#textedit) describing the modification to the document to be formatted.
* error: code and message set in case an exception happens during the formatting request.

_Registration Options_: `TextDocumentRegistrationOptions`

#### <a name="textDocument_rangeFormatting"></a>Document Range Formatting Request

The document range formatting request is sent from the client to the server to format a given range in a document.

_Request_:
* method: 'textDocument/rangeFormatting',
* params: `DocumentRangeFormattingParams` defined as follows:

```typescript
interface DocumentRangeFormattingParams {
	/**
	 * The document to format.
	 */
	textDocument: TextDocumentIdentifier;

	/**
	 * The range to format
	 */
	range: Range;

	/**
	 * The format options
	 */
	options: FormattingOptions;
}
```

_Response_:
* result: [`TextEdit[]`](#textedit) describing the modification to the document to be formatted.
* error: code and message set in case an exception happens during the range formatting request.

_Registration Options_: `TextDocumentRegistrationOptions`

#### <a name="textDocument_onTypeFormatting"></a>Document on Type Formatting Request

The document on type formatting request is sent from the client to the server to format parts of the document during typing.

_Request_:
* method: 'textDocument/onTypeFormatting'
* params: `DocumentOnTypeFormattingParams` defined as follows:

```typescript
interface DocumentOnTypeFormattingParams {
	/**
	 * The document to format.
	 */
	textDocument: TextDocumentIdentifier;

	/**
	 * The position at which this request was sent.
	 */
	position: Position;

	/**
	 * The character that has been typed.
	 */
	ch: string;

	/**
	 * The format options.
	 */
	options: FormattingOptions;
}
```

_Response_:
* result: [`TextEdit[]`](#textedit) describing the modification to the document.
* error: code and message set in case an exception happens during the range formatting request.

_Registration Options_: `DocumentOnTypeFormattingRegistrationOptions` defined as follows:

```typescript
export interface DocumentOnTypeFormattingRegistrationOptions extends TextDocumentRegistrationOptions {
	/**
	 * A character on which formatting should be triggered, like `}`.
	 */
	firstTriggerCharacter: string;
	/**
	 * More trigger characters.
	 */
	moreTriggerCharacter?: string[]
}
```
#### <a name="textDocument_rename"></a>Rename Request

The rename request is sent from the client to the server to perform a workspace-wide rename of a symbol.

_Request_:
* method: 'textDocument/rename'
* params: `RenameParams` defined as follows
```typescript
interface RenameParams {
	/**
	 * The document to format.
	 */
	textDocument: TextDocumentIdentifier;

	/**
	 * The position at which this request was sent.
	 */
	position: Position;

	/**
	 * The new name of the symbol. If the given name is not valid the
	 * request must return a [ResponseError](#ResponseError) with an
	 * appropriate message set.
	 */
	newName: string;
}
```

_Response_:
* result: [`WorkspaceEdit`](#workspaceedit) describing the modification to the workspace.
* error: code and message set in case an exception happens during the rename request.

_Registration Options_: `TextDocumentRegistrationOptions`

#### <a name="workspace_executeCommand"></a>Execute a command

The `workspace/executeCommand` request is sent from the client to the server to trigger command execution on the server. In most cases
the server creates a `WorkspaceEdit` structure and applies the changes to the workspace using the request `workspace/applyEdit` which is
sent from the server to the client.

_Request:_
* method: 'workspace/executeCommand'
* params: `ExecuteCommandParams` defined as follows:

```typescript
export interface ExecuteCommandParams {

	/**
	 * The identifier of the actual command handler.
	 */
	command: string;
	/**
	 * Arguments that the command should be invoked with.
	 */
	arguments?: any[];
}
```

The arguments are typically specified when a command is returned from the server to the client. Example requests that return a command are `textDocument/codeAction` or `textDocument/codeLens`.

_Response_:
* result: any
* error: code and message set in case an exception happens during the request.

_Registration Options_: `ExecuteCommandRegistrationOptions` defined as follows:

```typescript
/**
 * Execute command registration options.
 */
export interface ExecuteCommandRegistrationOptions {
	/**
	 * The commands to be executed on the server
	 */
	commands: string[]
}
```

#### <a name="workspace_applyEdit"></a>Applies a WorkspaceEdit

The `workspace/applyEdit` request is sent from the server to the client to modify resource on the client side.

_Request_:
* method: 'workspace/applyEdit'
* params: `ApplyWorkspaceEditParams` defined as follows:

```typescript
export interface ApplyWorkspaceEditParams {
	/**
	 * The edits to apply.
	 */
	edit: WorkspaceEdit;
}
```

_Response_:
* result: `ApplyWorkspaceEditResponse` defined as follows:
```typescript
export interface ApplyWorkspaceEditResponse {
	/**
	 * Indicates whether the edit was applied or not.
	 */
	applied: boolean;
}
```
* error: code and message set in case an exception happens during the request.
