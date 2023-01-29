---
title: Specification
shortTitle: 3.14 (Previous)
layout: specifications
sectionid: specification-3-14
toc: specification-3-14-toc
fullTitle: Language Server Protocol Specification - 3.14
index: 1
---

This document describes version 3.14.x of the language server protocol. An implementation for node of the 3.14.x version of the protocol can be found [here](https://github.com/Microsoft/vscode-languageserver-node).

The 2.x version of this document can be found [here](https://github.com/Microsoft/language-server-protocol/blob/master/versions/protocol-2-x.md).
The 1.x version of this document can be found [here](https://github.com/Microsoft/language-server-protocol/blob/master/versions/protocol-1-x.md).

**Note:** edits to this specification can be made via a pull request against this markdown [document](https://github.com/Microsoft/language-server-protocol/blob/gh-pages/_specifications/specification-3-14.md).

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
{: .table .table-bordered .table-responsive}

The header part is encoded using the 'ascii' encoding. This includes the '\r\n' separating the header and content part.

### Content Part

Contains the actual content of the message. The content part of a message uses [JSON-RPC](http://www.jsonrpc.org/) to describe requests, responses and notifications. The content part is encoded using the charset provided in the Content-Type field. It defaults to `utf-8`, which is the only encoding supported right now. If a server or client receives a header with a different encoding than `utf-8`, then it should respond with an error.

(Prior versions of the protocol used the string constant `utf8` which is not a correct encoding constant according to [specification](http://www.iana.org/assignments/character-sets/character-sets.xhtml).) For backwards compatibility it is highly recommended that a client and a server treats the string `utf8` as `utf-8`.

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

A general message as defined by JSON-RPC. The language server protocol always uses "2.0" as the `jsonrpc` version.

```typescript
interface Message {
	jsonrpc: string;
}
```
#### Request Message

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
	params?: Array<any> | object;
}
```

#### Response Message

A Response Message sent as a result of a request. If a request doesn't provide a result value the receiver of a request still needs to return a response message to conform to the JSON RPC specification. The result property of the ResponseMessage should be set to `null` in this case to signal a successful request.

```typescript
interface ResponseMessage extends Message {
	/**
	 * The request id.
	 */
	id: number | string | null;

	/**
	 * The result of a request. This member is REQUIRED on success.
	 * This member MUST NOT exist if there was an error invoking the method.
	 */
	result?: string | number | boolean | object | null;

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
	export const ContentModified: number = -32801;
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
	params?: Array<any> | object;
}
```

#### $ Notifications and Requests

Notification and requests whose methods start with '$/' are messages which are protocol implementation dependent and might not be implementable in all clients or servers. For example if the server implementation uses a single threaded synchronous programming language then there is little a server can do to react to a '$/cancelRequest' notification. If a server or client receives notifications starting with '$/' it is free to ignore the notification. If a server or client receives a requests starting with '$/' it must error the request with error code `MethodNotFound` (e.g. `-32601`).

#### <a href="#cancelRequest" name="cancelRequest" class="anchor"> Cancellation Support (:arrow_right: :arrow_left:)</a>

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

A request that got canceled still needs to return from the server and send a response back. It can not be left open / hanging. This is in line with the JSON RPC protocol that requires that every request sends a response back. In addition it allows for returning partial results on cancel. If the request returns an error response on cancellation it is advised to set the error code to `ErrorCodes.RequestCancelled`.

## Language Server Protocol

The language server protocol defines a set of JSON-RPC request, response and notification messages which are exchanged using the above base protocol. This section starts describing the basic JSON structures used in the protocol. The document uses TypeScript interfaces to describe these. Based on the basic JSON structures, the actual requests with their responses and the notifications are described.

In general, the language server protocol supports JSON-RPC messages, however the base protocol defined here uses a convention such that the parameters passed to request/notification messages should be of `object` type (if passed at all). However, this does not disallow using `Array` parameter types in custom messages.

The protocol currently assumes that one server serves one tool. There is currently no support in the protocol to share one server between different tools. Such a sharing would require additional protocol e.g. to lock a document to support concurrent editing.

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

The current protocol is tailored for textual documents whose content can be represented as a string. There is currently no support for binary documents. A position inside a document (see Position definition below) is expressed as a zero-based line and character offset. The offsets are based on a UTF-16 string representation. So in a string of the form `a𐐀b` the character offset of the character `a` is 0, the character offset of `𐐀` is 1 and the character offset of b is 3 since `𐐀` is represented using two code units in UTF-16. To ensure that both client and server split the string into the same line representation the protocol specifies the following end-of-line sequences: '\n', '\r\n' and '\r'.

Positions are line end character agnostic. So you can not specify  a position that denotes `\r|\n` or `\n|` where `|` represents the character offset.

```typescript
export const EOL: string[] = ['\n', '\r\n', '\r'];
```

#### Position

Position in a text document expressed as zero-based line and zero-based character offset. A position is between two characters like an 'insert' cursor in an editor. Special values like for example `-1` to denote the end of a line are not supported.

```typescript
interface Position {
	/**
	 * Line position in a document (zero-based).
	 */
	line: number;

	/**
	 * Character offset on a line in a document (zero-based). Assuming that the line is
	 * represented as a string, the `character` value represents the gap between the
	 * `character` and `character + 1`.
	 *
	 * If the character value is greater than the line length it defaults back to the
	 * line length.
	 */
	character: number;
}
```
#### Range

A range in a text document expressed as (zero-based) start and end positions. A range is comparable to a selection in an editor. Therefore the end position is exclusive. If you want to specify a range that contains a line including the line ending character(s) then use an end position denoting the start of the next line. For example:
```typescript
{
    start: { line: 5, character: 23 },
    end : { line 6, character : 0 }
}
```

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

#### LocationLink

Represents a link between a source and a target location.

```typescript
interface LocationLink {

	/**
	 * Span of the origin of this link.
	 *
	 * Used as the underlined span for mouse interaction. Defaults to the word range at
	 * the mouse position.
	 */
	originSelectionRange?: Range;

	/**
	 * The target resource identifier of this link.
	 */
	targetUri: DocumentUri;

	/**
	 * The full target range of this link. If the target for example is a symbol then target range is the
	 * range enclosing this symbol not including leading/trailing whitespace but everything else
	 * like comments. This information is typically used to highlight the range in the editor.
	 */
	targetRange: Range;

	/**
	 * The range that should be selected and revealed when this link is being followed, e.g the name of a function.
	 * Must be contained by the `targetRange`. See also `DocumentSymbol#range`
	 */
	targetSelectionRange: Range;
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
	 * The diagnostic's code, which might appear in the user interface.
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

	/**
	 * An array of related diagnostic information, e.g. when symbol-names within
	 * a scope collide all definitions can be marked via this property.
	 */
	relatedInformation?: DiagnosticRelatedInformation[];
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

```typescript
/**
 * Represents a related message and source code location for a diagnostic. This should be
 * used to point to code locations that cause or related to a diagnostics, e.g when duplicating
 * a symbol in a scope.
 */
export interface DiagnosticRelatedInformation {
	/**
	 * The location of this related diagnostic information.
	 */
	location: Location;

	/**
	 * The message of this related diagnostic information.
	 */
	message: string;
}
```

#### Command

Represents a reference to a command. Provides a title which will be used to represent a command in the UI. Commands are identified by a string identifier. The recommended way to handle commands is to implement their execution on the server side if the client and server provides the corresponding capabilities. Alternatively the tool extension code could handle the command. The protocol currently doesn't specify a set of well-known commands.

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

#### TextEdit[]

Complex text manipulations are described with an array of `TextEdit`'s, representing a single change to the document.

All text edits ranges refer to positions in the original document. Text edits ranges must never overlap, that means no part of the original document must be manipulated by more than one edit. However, it is possible that multiple edits have the same start position: multiple inserts, or any number of inserts followed by a single remove or replace edit. If multiple inserts have the same position, the order in the array defines the order in which the inserted strings appear in the resulting text.

#### TextDocumentEdit

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

### File Resource changes

> New in version 3.13:

File resource changes allow servers to create, rename and delete files and folders via the client. Note that the names talk about files but the operations are supposed to work on files and folders. This is in line with other naming in the Language Server Protocol (see file watchers which can watch files and folders). The corresponding change literals look as follows:

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
}

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
}

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
}
```

#### WorkspaceEdit

A workspace edit represents changes to many resources managed in the workspace. The edit should either provide `changes` or `documentChanges`. If the client can handle versioned document edits and if `documentChanges` are present, the latter are preferred over `changes`.

```typescript
export interface WorkspaceEdit {
	/**
	 * Holds changes to existing resources.
	 */
	changes?: { [uri: DocumentUri]: TextEdit[]; };

	/**
	 * Depending on the client capability `workspace.workspaceEdit.resourceOperations` document changes
	 * are either an array of `TextDocumentEdit`s to express changes to n different text documents
	 * where each text document edit addresses a specific version of a text document. Or it can contain
	 * above `TextDocumentEdit`s mixed with create, rename and delete file / folder operations.
	 *
	 * Whether a client supports versioned document edits is expressed via
	 * `workspace.workspaceEdit.documentChanges` client capability.
	 *
	 * If a client neither supports `documentChanges` nor `workspace.workspaceEdit.resourceOperations` then
	 * only plain `TextEdit`s using the `changes` property are supported.
	 */
	documentChanges?: (TextDocumentEdit[] | (TextDocumentEdit | CreateFile | RenameFile | DeleteFile)[]);
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

Text documents have a language identifier to identify a document on the server side when it handles more than one language to avoid re-interpreting the file extension. If a document refers to one of the programming languages listed below it is recommended that clients use those ids.

Language | Identifier
-------- | ----------
ABAP | `abap`
Windows Bat | `bat`
BibTeX | `bibtex`
Clojure | `clojure`
Coffeescript | `coffeescript`
C | `c`
C++ | `cpp`
C# | `csharp`
CSS | `css`
Diff | `diff`
Dart | `dart`
Dockerfile | `dockerfile`
F# | `fsharp`
Git | `git-commit` and `git-rebase`
Go | `go`
Groovy | `groovy`
Handlebars | `handlebars`
HTML | `html`
Ini | `ini`
Java | `java`
JavaScript | `javascript`
JavaScript React | `javascriptreact`
JSON | `json`
LaTeX | `latex`
Less | `less`
Lua | `lua`
Makefile | `makefile`
Markdown | `markdown`
Objective-C | `objective-c`
Objective-C++ | `objective-cpp`
Perl | `perl`
Perl 6 | `perl6`
PHP | `php`
Powershell | `powershell`
Pug | `jade`
Python | `python`
R | `r`
Razor (cshtml) | `razor`
Ruby | `ruby`
Rust | `rust`
SCSS | `scss` (syntax using curly brackets), `sass` (indented syntax)
Scala | `scala`
ShaderLab | `shaderlab`
Shell Script (Bash) | `shellscript`
SQL | `sql`
Swift | `swift`
TypeScript | `typescript`
TypeScript React| `typescriptreact`
TeX | `tex`
Visual Basic | `vb`
XML | `xml`
XSL | `xsl`
YAML | `yaml`
{: .table .table-bordered .table-responsive}

#### VersionedTextDocumentIdentifier

An identifier to denote a specific version of a text document.

```typescript
interface VersionedTextDocumentIdentifier extends TextDocumentIdentifier {
	/**
	 * The version number of this document. If a versioned text document identifier
	 * is sent from the server to the client and the file is not open in the editor
	 * (the server has not received an open notification before) the server can send
	 * `null` to indicate that the version is known and the content on disk is the
	 * truth (as speced with document content ownership).
	 *
	 * The version number of a document will increase after each change, including
	 * undo/redo. The number doesn't need to be consecutive.
	 */
	version: number | null;
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

#### DocumentFilter

A document filter denotes a document through properties like `language`, `scheme` or `pattern`. An example is a filter that applies to TypeScript files on disk. Another example is a filter the applies to JSON files with name `package.json`:
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
	 *
	 * Glob patterns can have the following syntax:
	 * - `*` to match one or more characters in a path segment
	 * - `?` to match on one character in a path segment
	 * - `**` to match any number of path segments, including none
	 * - `{}` to group conditions (e.g. `**​/*.{ts,js}` matches all TypeScript and JavaScript files)
	 * - `[]` to declare a range of characters to match in a path segment (e.g., `example.[0-9]` to match on `example.0`, `example.1`, …)
	 * - `[!...]` to negate a range of characters to match in a path segment (e.g., `example.[!0-9]` to match on `example.a`, `example.b`, but not `example.0`)
	 */
	pattern?: string;
}
```

A document selector is the combination of one or more document filters.

```typescript
export type DocumentSelector = DocumentFilter[];
```

#### MarkupContent

 A `MarkupContent` literal represents a string value which content can be represented in different formats. Currently `plaintext` and `markdown` are supported formats. A `MarkupContent` is usually used in documentation properties of result literals like `CompletionItem` or `SignatureInformation`.

```typescript
/**
 * Describes the content type that a client supports in various
 * result literals like `Hover`, `ParameterInfo` or `CompletionItem`.
 *
 * Please note that `MarkupKinds` must not start with a `$`. This kinds
 * are reserved for internal usage.
 */
export namespace MarkupKind {
	/**
	 * Plain text is supported as a content format
	 */
	export const PlainText: 'plaintext' = 'plaintext';

	/**
	 * Markdown is supported as a content format
	 */
	export const Markdown: 'markdown' = 'markdown';
}
export type MarkupKind = 'plaintext' | 'markdown';

/**
 * A `MarkupContent` literal represents a string value which content is interpreted base on its
 * kind flag. Currently the protocol supports `plaintext` and `markdown` as markup kinds.
 *
 * If the kind is `markdown` then the value can contain fenced code blocks like in GitHub issues.
 * See https://help.github.com/articles/creating-and-highlighting-code-blocks/#syntax-highlighting
 *
 * Here is an example how such a string can be constructed using JavaScript / TypeScript:
 * ```typescript
 * let markdown: MarkdownContent = {
 *  kind: MarkupKind.Markdown,
 *	value: [
 *		'# Header',
 *		'Some text',
 *		'```typescript',
 *		'someCode();',
 *		'```'
 *	].join('\n')
 * };
 * ```
 *
 * *Please Note* that clients might sanitize the return markdown. A client could decide to
 * remove HTML from the markdown to avoid script execution.
 */
export interface MarkupContent {
	/**
	 * The type of the Markup
	 */
	kind: MarkupKind;

	/**
	 * The content itself
	 */
	value: string;
}
```

### Actual Protocol

This section documents the actual language server protocol. It uses the following format:

* a header describing the request
* a _Request_: section describing the format of the request sent. The method is a string identifying the request, the params are documented using a TypeScript interface
* a _Response_: section describing the format of the response. The result item describes the returned data in case of a success. The error.data describes the returned data in case of an error. Please remember that in case of a failure the response already contains an error.code and an error.message field. These fields are only spec'd if the protocol forces the use of certain error codes or messages. In cases where the server can decide on these values freely they aren't listed here.
* a _Registration Options_ section describing the registration option if the request or notification supports dynamic capability registration.

#### Request, Notification and Response ordering

Responses to requests should be sent in roughly the same order as the requests appear on the server or client side. So for example if a server receives a `textDocument/completion` request and then a `textDocument/signatureHelp` request it will usually first return the response for the `textDocument/completion` and then the response for `textDocument/signatureHelp`.

However, the server may decide to use a parallel execution strategy and may wish to return responses in a different order than the requests were received. The server may do so as long as this reordering doesn't affect the correctness of the responses. For example, reordering the result of `textDocument/completion` and `textDocument/signatureHelp` is allowed, as each of these requests usually won't affect the output of the other. On the other hand, the server most likely should not reorder `textDocument/definition` and `textDocument/rename` requests, since executing the latter may affect the result of the former.

#### Server lifetime

The current protocol specification defines that the lifetime of a server is managed by the client (e.g. a tool like VS Code or Emacs). It is up to the client to decide when to start (process-wise) and when to shutdown a server.

#### <a href="#initialize" name="initialize" class="anchor">Initialize Request (:leftwards_arrow_with_hook:)</a>

The initialize request is sent as the first request from the client to the server. If the server receives a request or notification before the `initialize` request it should act as follows:

* For a request the response should be an error with `code: -32002`. The message can be picked by the server.
* Notifications should be dropped, except for the exit notification. This will allow the exit of a server without an initialize request.

Until the server has responded to the `initialize` request with an `InitializeResult`, the client must not send any additional requests or notifications to the server. In addition the server is not allowed to send any requests or notifications to the client until it has responded with an `InitializeResult`, with the exception that during the `initialize` request the server is allowed to send the notifications `window/showMessage`, `window/logMessage` and `telemetry/event` as well as the `window/showMessageRequest` request to the client.

The `initialize` request may only be sent once.

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

	/**
	 * The workspace folders configured in the client when the server starts.
	 * This property is only available if the client supports workspace folders.
	 * It can be `null` if the client supports workspace folders but none are
	 * configured.
	 *
	 * Since 3.6.0
	 */
	workspaceFolders?: WorkspaceFolder[] | null;
}
```
Where `ClientCapabilities`, `TextDocumentClientCapabilities` and `WorkspaceClientCapabilities` are defined as follows:

##### `WorkspaceClientCapabilities` define capabilities the editor / tool provides on the workspace:

> New in version 3.13: `ResourceOperationKind` and `FailureHandlingKind` and the client capability `workspace.workspaceEdit.resourceOperations` as well as `workspace.workspaceEdit.failureHandling`.

```typescript

/**
 * The kind of resource operations supported by the client.
 */
export type ResourceOperationKind = 'create' | 'rename' | 'delete';

export namespace ResourceOperationKind {

	/**
	 * Supports creating new files and folders.
	 */
	export const Create: ResourceOperationKind = 'create';

	/**
	 * Supports renaming existing files and folders.
	 */
	export const Rename: ResourceOperationKind = 'rename';

	/**
	 * Supports deleting existing files and folders.
	 */
	export const Delete: ResourceOperationKind = 'delete';
}

export type FailureHandlingKind = 'abort' | 'transactional' | 'undo' | 'textOnlyTransactional';

export namespace FailureHandlingKind {

	/**
	 * Applying the workspace change is simply aborted if one of the changes provided
	 * fails. All operations executed before the failing operation stay executed.
	 */
	export const Abort: FailureHandlingKind = 'abort';

	/**
	 * All operations are executed transactionally. That means they either all
	 * succeed or no changes at all are applied to the workspace.
	 */
	export const Transactional: FailureHandlingKind = 'transactional';


	/**
	 * If the workspace edit contains only textual file changes they are executed transactionally.
	 * If resource changes (create, rename or delete file) are part of the change the failure
	 * handling strategy is abort.
	 */
	export const TextOnlyTransactional: FailureHandlingKind = 'textOnlyTransactional';

	/**
	 * The client tries to undo the operations already executed. But there is no
	 * guarantee that this succeeds.
	 */
	export const Undo: FailureHandlingKind = 'undo';
}

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

		/**
		 * The resource operations the client supports. Clients should at least
		 * support 'create', 'rename' and 'delete' files and folders.
		 */
		resourceOperations?: ResourceOperationKind[];

		/**
		 * The failure handling strategy of a client if applying the workspace edit
		 * fails.
		 */
		failureHandling?: FailureHandlingKind;
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
		 * Did change watched files notification supports dynamic registration. Please note
		 * that the current protocol doesn't support static configuration for file changes
		 * from the server side.
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

		/**
		 * Specific capabilities for the `SymbolKind` in the `workspace/symbol` request.
		 */
		symbolKind?: {
			/**
			 * The symbol kind values the client supports. When this
			 * property exists the client also guarantees that it will
			 * handle values outside its set gracefully and falls back
			 * to a default value when unknown.
			 *
			 * If this property is not present the client only supports
			 * the symbol kinds from `File` to `Array` as defined in
			 * the initial version of the protocol.
			 */
			valueSet?: SymbolKind[];
		}
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

	/**
	 * The client has support for workspace folders.
	 *
	 * Since 3.6.0
	 */
	workspaceFolders?: boolean;

	/**
	 * The client supports `workspace/configuration` requests.
	 *
	 * Since 3.6.0
	 */
	configuration?: boolean;
}
```

##### `TextDocumentClientCapabilities` define capabilities the editor / tool provides on text documents.

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
			 * The client supports snippets as insert text.
			 *
			 * A snippet can define tab stops and placeholders with `$1`, `$2`
			 * and `${3:foo}`. `$0` defines the final tab stop, it defaults to
			 * the end of the snippet. Placeholders with equal identifiers are linked,
			 * that is typing in one will update others too.
			 */
			snippetSupport?: boolean;

			/**
			 * The client supports commit characters on a completion item.
			 */
			commitCharactersSupport?: boolean

			/**
			 * The client supports the following content formats for the documentation
			 * property. The order describes the preferred format of the client.
			 */
			documentationFormat?: MarkupKind[];

			/**
			 * The client supports the deprecated property on a completion item.
			 */
			deprecatedSupport?: boolean;

			/**
			 * The client supports the preselect property on a completion item.
			 */
			preselectSupport?: boolean;
		}

		completionItemKind?: {
			/**
			 * The completion item kind values the client supports. When this
			 * property exists the client also guarantees that it will
			 * handle values outside its set gracefully and falls back
			 * to a default value when unknown.
			 *
			 * If this property is not present the client only supports
			 * the completion items kinds from `Text` to `Reference` as defined in
			 * the initial version of the protocol.
			 */
			valueSet?: CompletionItemKind[];
		},

		/**
		 * The client supports to send additional context information for a
		 * `textDocument/completion` request.
		 */
		contextSupport?: boolean;
	};

	/**
	 * Capabilities specific to the `textDocument/hover`
	 */
	hover?: {
		/**
		 * Whether hover supports dynamic registration.
		 */
		dynamicRegistration?: boolean;

		/**
		 * The client supports the follow content formats for the content
		 * property. The order describes the preferred format of the client.
		 */
		contentFormat?: MarkupKind[];
	};

	/**
	 * Capabilities specific to the `textDocument/signatureHelp`
	 */
	signatureHelp?: {
		/**
		 * Whether signature help supports dynamic registration.
		 */
		dynamicRegistration?: boolean;

		/**
		 * The client supports the following `SignatureInformation`
		 * specific properties.
		 */
		signatureInformation?: {
			/**
			 * The client supports the follow content formats for the documentation
			 * property. The order describes the preferred format of the client.
			 */
			documentationFormat?: MarkupKind[];

			/**
			 * Client capabilities specific to parameter information.
			 */
			parameterInformation?: {
				/**
				 * The client supports processing label offsets instead of a
				 * simple label string.
				 *
				 * Since 3.14.0
				 */
				labelOffsetSupport?: boolean;
			}
		};
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

		/**
		 * Specific capabilities for the `SymbolKind`.
		 */
		symbolKind?: {
			/**
			 * The symbol kind values the client supports. When this
			 * property exists the client also guarantees that it will
			 * handle values outside its set gracefully and falls back
			 * to a default value when unknown.
			 *
			 * If this property is not present the client only supports
			 * the symbol kinds from `File` to `Array` as defined in
			 * the initial version of the protocol.
			 */
			valueSet?: SymbolKind[];
		}

		/**
		 * The client supports hierarchical document symbols.
		 */
		hierarchicalDocumentSymbolSupport?: boolean;
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
		* Capabilities specific to the `textDocument/declaration`
		*/
	declaration?: {
		/**
		 * Whether declaration supports dynamic registration. If this is set to `true`
		 * the client supports the new `(TextDocumentRegistrationOptions & StaticRegistrationOptions)`
		 * return value for the corresponding server capability as well.
		 */
		dynamicRegistration?: boolean;

		/**
		 * The client supports additional metadata in the form of declaration links.
		 *
		 * Since 3.14.0
		 */
		linkSupport?: boolean;
	};

	/**
	 * Capabilities specific to the `textDocument/definition`.
	 *
	 * Since 3.14.0
	 */
	definition?: {
		/**
		 * Whether definition supports dynamic registration.
		 */
		dynamicRegistration?: boolean;

		/**
		 * The client supports additional metadata in the form of definition links.
		 */
		linkSupport?: boolean;
	};

	/**
	 * Capabilities specific to the `textDocument/typeDefinition`
	 *
	 * Since 3.6.0
	 */
	typeDefinition?: {
		/**
		 * Whether typeDefinition supports dynamic registration. If this is set to `true`
		 * the client supports the new `(TextDocumentRegistrationOptions & StaticRegistrationOptions)`
		 * return value for the corresponding server capability as well.
		 */
		dynamicRegistration?: boolean;

		/**
		 * The client supports additional metadata in the form of definition links.
		 *
		 * Since 3.14.0
		 */
		linkSupport?: boolean;
	};

	/**
	 * Capabilities specific to the `textDocument/implementation`.
	 *
	 * Since 3.6.0
	 */
	implementation?: {
		/**
		 * Whether implementation supports dynamic registration. If this is set to `true`
		 * the client supports the new `(TextDocumentRegistrationOptions & StaticRegistrationOptions)`
		 * return value for the corresponding server capability as well.
		 */
		dynamicRegistration?: boolean;

		/**
		 * The client supports additional metadata in the form of definition links.
		 *
		 * Since 3.14.0
		 */
		linkSupport?: boolean;
	};

	/**
	 * Capabilities specific to the `textDocument/codeAction`
	 */
	codeAction?: {
		/**
		 * Whether code action supports dynamic registration.
		 */
		dynamicRegistration?: boolean;
		/**
		 * The client support code action literals as a valid
		 * response of the `textDocument/codeAction` request.
		 *
		 * Since 3.8.0
		 */
		codeActionLiteralSupport?: {
			/**
			 * The code action kind is support with the following value
			 * set.
			 */
			codeActionKind: {

				/**
				 * The code action kind values the client supports. When this
				 * property exists the client also guarantees that it will
				 * handle values outside its set gracefully and falls back
				 * to a default value when unknown.
				 */
				valueSet: CodeActionKind[];
			};
		};
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
	 * Capabilities specific to the `textDocument/documentColor` and the
	 * `textDocument/colorPresentation` request.
	 *
	 * Since 3.6.0
	 */
	colorProvider?: {
		/**
		 * Whether colorProvider supports dynamic registration. If this is set to `true`
		 * the client supports the new `(ColorProviderOptions & TextDocumentRegistrationOptions & StaticRegistrationOptions)`
		 * return value for the corresponding server capability as well.
		 */
		dynamicRegistration?: boolean;
	}

	/**
	 * Capabilities specific to the `textDocument/rename`
	 */
	rename?: {
		/**
		 * Whether rename supports dynamic registration.
		 */
		dynamicRegistration?: boolean;
		/**
		 * The client supports testing for validity of rename operations
		 * before execution.
		 */
		prepareSupport?: boolean;
	};

	/**
	 * Capabilities specific to `textDocument/publishDiagnostics`.
	 */
	publishDiagnostics?: {
		/**
		 * Whether the clients accepts diagnostics with related information.
		 */
		relatedInformation?: boolean;
	};
	/**
	 * Capabilities specific to `textDocument/foldingRange` requests.
	 *
	 * Since 3.10.0
	 */
	foldingRange?: {
		/**
		 * Whether implementation supports dynamic registration for folding range providers. If this is set to `true`
		 * the client supports the new `(FoldingRangeProviderOptions & TextDocumentRegistrationOptions & StaticRegistrationOptions)`
		 * return value for the corresponding server capability as well.
		 */
		dynamicRegistration?: boolean;
		/**
		 * The maximum number of folding ranges that the client prefers to receive per document. The value serves as a
		 * hint, servers are free to follow the limit.
		 */
		rangeLimit?: number;
		/**
		 * If set, the client signals that it only supports folding complete lines. If set, client will
		 * ignore specified `startCharacter` and `endCharacter` properties in a FoldingRange.
		 */
		lineFoldingOnly?: boolean;
	};
}
```

`ClientCapabilities` now define capabilities for dynamic registration, workspace and text document features the client supports. The `experimental` can be used to pass experimental capabilities under development. For future compatibility a `ClientCapabilities` object literal can have more properties set than currently defined. Servers receiving a `ClientCapabilities` object literal with unknown properties should ignore these properties. A missing property should be interpreted as an absence of the capability. If a missing property normally defines sub properties, all missing sub properties should be interpreted as an absence of the corresponding capability.

Client capabilities got introduced with version 3.0 of the protocol. They therefore only describe capabilities that got introduced in 3.x or later. Capabilities that existed in the 2.x version of the protocol are still mandatory for clients. Clients cannot opt out of providing them. So even if a client omits the `ClientCapabilities.textDocument.synchronization` it is still required that the client provides text document synchronization (e.g. open, changed and close notifications).

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
 * Code Action options.
 */
export interface CodeActionOptions {
	/**
	 * CodeActionKinds that this server may return.
	 *
	 * The list of kinds may be generic, such as `CodeActionKind.Refactor`, or the server
	 * may list out every specific kind they provide.
	 */
	codeActionKinds?: CodeActionKind[];
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
 * Format document on type options.
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
 * Rename options
 */
export interface RenameOptions {
	/**
	 * Renames should be checked and tested before being executed.
	 */
	prepareProvider?: boolean;
}

/**
 * Document link options.
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

/**
 * Color provider options.
 */
export interface ColorProviderOptions {
}

/**
 * Folding range provider options.
 */
export interface FoldingRangeProviderOptions {
}

export interface TextDocumentSyncOptions {
	/**
	 * Open and close notifications are sent to the server. If omitted open close notification should not
	 * be sent.
	 */
	openClose?: boolean;
	/**
	 * Change notifications are sent to the server. See TextDocumentSyncKind.None, TextDocumentSyncKind.Full
	 * and TextDocumentSyncKind.Incremental. If omitted it defaults to TextDocumentSyncKind.None.
	 */
	change?: number;
	/**
	 * If present will save notifications are sent to the server. If omitted the notification should not be
	 * sent.
	 */
	willSave?: boolean;
	/**
	 * If present will save wait until requests are sent to the server. If omitted the request should not be
	 * sent.
	 */
	willSaveWaitUntil?: boolean;
	/**
	 * If present save notifications are sent to the server. If omitted the notification should not be
	 * sent.
	 */
	save?: SaveOptions;
}

/**
 * Static registration options to be returned in the initialize request.
 */
interface StaticRegistrationOptions {
	/**
	 * The id used to register the request. The id can be used to deregister
	 * the request again. See also Registration#id.
	 */
	id?: string;
}

interface ServerCapabilities {
	/**
	 * Defines how text documents are synced. Is either a detailed structure defining each notification or
	 * for backwards compatibility the TextDocumentSyncKind number. If omitted it defaults to `TextDocumentSyncKind.None`.
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
	 * The server provides Goto Type Definition support.
	 *
	 * Since 3.6.0
	 */
	typeDefinitionProvider?: boolean | (TextDocumentRegistrationOptions & StaticRegistrationOptions);
	/**
	 * The server provides Goto Implementation support.
	 *
	 * Since 3.6.0
	 */
	implementationProvider?: boolean | (TextDocumentRegistrationOptions & StaticRegistrationOptions);
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
	 * The server provides code actions. The `CodeActionOptions` return type is only
	 * valid if the client signals code action literal support via the property
	 * `textDocument.codeAction.codeActionLiteralSupport`.
	 */
	codeActionProvider?: boolean | CodeActionOptions;
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
	 * The server provides rename support. RenameOptions may only be
	 * specified if the client states that it supports
	 * `prepareSupport` in its initial `initialize` request.
	 */
	renameProvider?: boolean | RenameOptions;
	/**
	 * The server provides document link support.
	 */
	documentLinkProvider?: DocumentLinkOptions;
	/**
	 * The server provides color provider support.
	 *
	 * Since 3.6.0
	 */
	colorProvider?: boolean | ColorProviderOptions | (ColorProviderOptions & TextDocumentRegistrationOptions & StaticRegistrationOptions);
	/**
	 * The server provides folding provider support.
	 *
	 * Since 3.10.0
	 */
	foldingRangeProvider?: boolean | FoldingRangeProviderOptions | (FoldingRangeProviderOptions & TextDocumentRegistrationOptions & StaticRegistrationOptions);
	/**
	 * The server provides go to declaration support.
	 *
	 * Since 3.14.0
	 */
	declarationProvider?: boolean | (TextDocumentRegistrationOptions & StaticRegistrationOptions);
	/**
	 * The server provides execute command support.
	 */
	executeCommandProvider?: ExecuteCommandOptions;
	/**
	 * Workspace specific server capabilities
	 */
	workspace?: {
		/**
		 * The server supports workspace folder.
		 *
		 * Since 3.6.0
		 */
		workspaceFolders?: {
			/**
			* The server has support for workspace folders
			*/
			supported?: boolean;
			/**
			* Whether the server wants to receive workspace folder
			* change notifications.
			*
			* If a strings is provided the string is treated as an ID
			* under which the notification is registered on the client
			* side. The ID can be used to unregister for these events
			* using the `client/unregisterCapability` request.
			*/
			changeNotifications?: string | boolean;
		}
	}
	/**
	 * Experimental server capabilities.
	 */
	experimental?: any;
}
```

#### <a href="#initialized" name="initialized" class="anchor">Initialized Notification (:arrow_right:)</a>

The initialized notification is sent from the client to the server after the client received the result of the `initialize` request but before the client is sending any other request or notification to the server. The server can use the `initialized` notification for example to dynamically register capabilities. The `initialized` notification may only be sent once.

_Notification_:
* method: 'initialized'
* params: `InitializedParams` defined as follows:

```typescript
interface InitializedParams {
}
```

#### <a href="#shutdown" name="shutdown" class="anchor">Shutdown Request (:leftwards_arrow_with_hook:)</a>

The shutdown request is sent from the client to the server. It asks the server to shut down, but to not exit (otherwise the response might not be delivered correctly to the client). There is a separate exit notification that asks the server to exit. Clients must not send any notifications other than `exit` or requests to a server to which they have sent a shutdown requests. If a server receives requests after a shutdown request those requests should be errored with `InvalidRequest`.

_Request_:
* method: 'shutdown'
* params: void

_Response_:
* result: null
* error: code and message set in case an exception happens during shutdown request.

#### <a href="#exit" name="exit" class="anchor">Exit Notification (:arrow_right:)</a>

A notification to ask the server to exit its process.
The server should exit with `success` code 0 if the shutdown request has been received before; otherwise with `error` code 1.

_Notification_:
* method: 'exit'
* params: void

#### <a href="#window_showMessage" name="window_showMessage" class="anchor">ShowMessage Notification (:arrow_left:)</a>

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

#### <a href="#window_showMessageRequest" name="window_showMessageRequest" class="anchor">ShowMessage Request (:arrow_right_hook:)</a>

The show message request is sent from a server to a client to ask the client to display a particular message in the user interface. In addition to the show message notification the request allows to pass actions and to wait for an answer from the client.

_Request_:
* method: 'window/showMessageRequest'
* params: `ShowMessageRequestParams` defined as follows:

_Response_:
* result: the selected `MessageActionItem` \| `null` if none got selected.
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

#### <a href="#window_logMessage" name="window_logMessage" class="anchor">LogMessage Notification (:arrow_left:)</a>

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

#### <a href="#telemetry_event" name="telemetry_event" class="anchor">Telemetry Notification (:arrow_left:)</a>

The telemetry notification is sent from the server to the client to ask the client to log a telemetry event.

_Notification_:
* method: 'telemetry/event'
* params: 'any'

#### <a href="#client_registerCapability" name="client_registerCapability" class="anchor">Register Capability (:arrow_right_hook:)</a>

The `client/registerCapability` request is sent from the server to the client to register for a new capability on the client side. Not all clients need to support dynamic capability registration. A client opts in via the `dynamicRegistration` property on the specific client capabilities. A client can even provide dynamic registration for capability A but not for capability B (see `TextDocumentClientCapabilities` as an example).

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

#### <a href="#client_unregisterCapability" name="client_unregisterCapability" class="anchor">Unregister Capability (:arrow_right_hook:)</a>

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
_Response_:
* result: void.
* error: code and message set in case an exception happens during the request.

##### <a href="#workspace_workspaceFolders" name="workspace_workspaceFolders" class="anchor">Workspace folders request (:arrow_right_hook:)</a>

> *Since version 3.6.0*

Many tools support more than one root folder per workspace. Examples for this are VS Code's multi-root support, Atom's project folder support or Sublime's project support. If a client workspace consists of multiple roots then a server typically needs to know about this. The protocol up to now assumes one root folder which is announced to the server by the `rootUri` property of the `InitializeParams`. If the client supports workspace folders and announces them via the corresponding `workspaceFolders` client capability, the `InitializeParams` contain an additional property `workspaceFolders` with the configured workspace folders when the server starts.

The `workspace/workspaceFolders` request is sent from the server to the client to fetch the current open list of workspace folders. Returns `null` in the response if only a single file is open in the tool. Returns an empty array if a workspace is open but no folders are configured.

_Request_:

* method: 'workspace/workspaceFolders'
* params: none

_Response_:

* result: `WorkspaceFolder[] | null` defined as follows:

```typescript
export interface WorkspaceFolder {
	/**
	 * The associated URI for this workspace folder.
	 */
	uri: DocumentUri;

	/**
	 * The name of the workspace folder. Used to refer to this
	 * workspace folder in the user interface.
	 */
	name: string;
}
```
* error: code and message set in case an exception happens during the 'workspace/workspaceFolders' request

##### <a href="#workspace_didChangeWorkspaceFolders" name="workspace_didChangeWorkspaceFolders" class="anchor">DidChangeWorkspaceFolders Notification (:arrow_right:)</a>

> *Since version 3.6.0*

The `workspace/didChangeWorkspaceFolders` notification is sent from the client to the server to inform the server about workspace folder configuration changes. The notification is sent by default if both _ServerCapabilities/workspace/workspaceFolders_ and _ClientCapabilities/workspace/workspaceFolders_ are true; or if the server has registered itself to receive this notification. To register for the `workspace/didChangeWorkspaceFolders` send a `client/registerCapability` request from the server to the client. The registration parameter must have a `registrations` item of the following form, where `id` is a unique id used to unregister the capability (the example uses a UUID):
```ts
{
	id: "28c6150c-bd7b-11e7-abc4-cec278b6b50a",
	method: "workspace/didChangeWorkspaceFolders"
}
```

_Notification_:

* method: 'workspace/didChangeWorkspaceFolders'
* params: `DidChangeWorkspaceFoldersParams` defined as follows:

```typescript
export interface DidChangeWorkspaceFoldersParams {
	/**
	 * The actual workspace folder change event.
	 */
	event: WorkspaceFoldersChangeEvent;
}

/**
 * The workspace folder change event.
 */
export interface WorkspaceFoldersChangeEvent {
	/**
	 * The array of added workspace folders
	 */
	added: WorkspaceFolder[];

	/**
	 * The array of the removed workspace folders
	 */
	removed: WorkspaceFolder[];
}
```

#### <a href="#workspace_didChangeConfiguration" name="workspace_didChangeConfiguration" class="anchor">DidChangeConfiguration Notification (:arrow_right:)</a>

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

#### <a href="#workspace_configuration" name="workspace_configuration" class="anchor">Configuration Request (:arrow_right_hook:)</a>

> *Since version 3.6.0*

The `workspace/configuration` request is sent from the server to the client to fetch configuration settings from the client. The request can fetch several configuration settings in one roundtrip. The order of the returned configuration settings correspond to the order of the passed `ConfigurationItems` (e.g. the first item in the response is the result for the first configuration item in the params).

A `ConfigurationItem` consists of the configuration section to ask for and an additional scope URI. The configuration section asked for is defined by the server and doesn't necessarily need to correspond to the configuration store used by the client. So a server might ask for a configuration `cpp.formatterOptions` but the client stores the configuration in an XML store layout differently. It is up to the client to do the necessary conversion. If a scope URI is provided the client should return the setting scoped to the provided resource. If the client for example uses [EditorConfig](http://editorconfig.org/) to manage its settings the configuration should be returned for the passed resource URI. If the client can't provide a configuration setting for a given scope then `null` needs to be present in the returned array.

_Request_:

* method: 'workspace/configuration'
* params: `ConfigurationParams` defined as follows

```typescript
export interface ConfigurationParams {
	items: ConfigurationItem[];
}

export interface ConfigurationItem {
	/**
	 * The scope to get the configuration section for.
	 */
	scopeUri?: DocumentUri;

	/**
	 * The configuration section asked for.
	 */
	section?: string;
}
```

_Response_:
* result: any[]
* error: code and message set in case an exception happens during the 'workspace/configuration' request

#### <a href="#workspace_didChangeWatchedFiles" name="workspace_didChangeWatchedFiles" class="anchor">DidChangeWatchedFiles Notification (:arrow_right:)</a>

The watched files notification is sent from the client to the server when the client detects changes to files watched by the language client. It is recommended that servers register for these file events using the registration mechanism. In former implementations clients pushed file events without the server actively asking for it.

Servers are allowed to run their own file watching mechanism and not rely on clients to provide file events. However this is not recommended due to the following reasons:

- to our experience getting file watching on disk right is challenging, especially if it needs to be supported across multiple OSes.
- file watching is not for free especially if the implementation uses some sort of polling and keeps a file tree in memory to compare time stamps (as for example some node modules do)
- a client usually starts more than one server. If every server runs its own file watching it can become a CPU or memory problem.
- in general there are more server than client implementations. So this problem is better solved on the client side.


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

_Registration Options_: `DidChangeWatchedFilesRegistrationOptions` defined as follows

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

export interface FileSystemWatcher {
	/**
	 * The  glob pattern to watch.
	 *
	 * Glob patterns can have the following syntax:
	 * - `*` to match one or more characters in a path segment
	 * - `?` to match on one character in a path segment
	 * - `**` to match any number of path segments, including none
	 * - `{}` to group conditions (e.g. `**​/*.{ts,js}` matches all TypeScript and JavaScript files)
	 * - `[]` to declare a range of characters to match in a path segment (e.g., `example.[0-9]` to match on `example.0`, `example.1`, …)
	 * - `[!...]` to negate a range of characters to match in a path segment (e.g., `example.[!0-9]` to match on `example.a`, `example.b`, but not `example.0`)
	 */
	globPattern: string;

	/**
	 * The kind of events of interest. If omitted it defaults
	 * to WatchKind.Create | WatchKind.Change | WatchKind.Delete
	 * which is 7.
	 */
	kind?: number;
}

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

#### <a href="#workspace_symbol" name="workspace_symbol" class="anchor">Workspace Symbols Request (:leftwards_arrow_with_hook:)</a>

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
* result: `SymbolInformation[]` \| `null` as defined above.
* error: code and message set in case an exception happens during the workspace symbol request.

_Registration Options_: void


#### <a href="#workspace_executeCommand" name="workspace_executeCommand" class="anchor">Execute a command (:leftwards_arrow_with_hook:)</a>

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
* result: `any` \| `null`
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


#### <a href="#workspace_applyEdit" name="workspace_applyEdit" class="anchor">Applies a WorkspaceEdit (:arrow_right_hook:)</a>

The `workspace/applyEdit` request is sent from the server to the client to modify resource on the client side.

_Request_:
* method: 'workspace/applyEdit'
* params: `ApplyWorkspaceEditParams` defined as follows:

```typescript
export interface ApplyWorkspaceEditParams {
	/**
	 * An optional label of the workspace edit. This label is
	 * presented in the user interface for example on an undo
	 * stack to undo the workspace edit.
	 */
	label?: string;

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

	/**
	 * An optional textual description for why the edit was not applied.
	 * This may be used may be used by the server for diagnostic
	 * logging or to provide a suitable error for a request that
	 * triggered the edit.
	 */
	failureReason?: string;
}
```
* error: code and message set in case an exception happens during the request.


#### <a href="#textDocument_didOpen" name="textDocument_didOpen" class="anchor">DidOpenTextDocument Notification (:arrow_right:)</a>

The document open notification is sent from the client to the server to signal newly opened text documents. The document's truth is now managed by the client and the server must not try to read the document's truth using the document's Uri. Open in this sense means it is managed by the client. It doesn't necessarily mean that its content is presented in an editor. An open notification must not be sent more than once without a corresponding close notification send before. This means open and close notification must be balanced and the max open count for a particular textDocument is one. Note that a server's ability to fulfill requests is independent of whether a text document is open or closed.

The `DidOpenTextDocumentParams` contain the language id the document is associated with. If the language id of a document changes, the client needs to send a `textDocument/didClose` to the server followed by a `textDocument/didOpen` with the new language id if the server handles the new language id as well.

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


#### <a href="#textDocument_didChange" name="textDocument_didChange" class="anchor">DidChangeTextDocument Notification (:arrow_right:)</a>

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
	 * The actual content changes. The content changes describe single state changes
	 * to the document. So if there are two content changes c1 and c2 for a document
	 * in state S then c1 move the document to S' and c2 to S''.
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
 * Describe options to be used when registering for text document change events.
 */
export interface TextDocumentChangeRegistrationOptions extends TextDocumentRegistrationOptions {
	/**
	 * How documents are synced to the server. See TextDocumentSyncKind.Full
	 * and TextDocumentSyncKind.Incremental.
	 */
	syncKind: number;
}
```


#### <a href="#textDocument_willSave" name="textDocument_willSave" class="anchor">WillSaveTextDocument Notification (:arrow_right:)</a>

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


#### <a href="#textDocument_willSaveWaitUntil" name="textDocument_willSaveWaitUntil" class="anchor">WillSaveWaitUntilTextDocument Request (:leftwards_arrow_with_hook:)</a>

The document will save request is sent from the client to the server before the document is actually saved. The request can return an array of TextEdits which will be applied to the text document before it is saved. Please note that clients might drop results if computing the text edits took too long or if a server constantly fails on this request. This is done to keep the save fast and reliable.

_Request_:
* method: 'textDocument/willSaveWaitUntil'
* params: `WillSaveTextDocumentParams`

_Response_:
* result:`TextEdit[]` \| `null`
* error: code and message set in case an exception happens during the `willSaveWaitUntil` request.

_Registration Options_: `TextDocumentRegistrationOptions`

#### <a href="#textDocument_didSave" name="textDocument_didSave" class="anchor">DidSaveTextDocument Notification (:arrow_right:)</a>

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
	 * when the save notification was requested.
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

#### <a href="#textDocument_didClose" name="textDocument_didClose" class="anchor">DidCloseTextDocument Notification (:arrow_right:)</a>

The document close notification is sent from the client to the server when the document got closed in the client. The document's truth now exists where the document's Uri points to (e.g. if the document's Uri is a file Uri the truth now exists on disk). As with the open notification the close notification is about managing the document's content. Receiving a close notification doesn't mean that the document was open in an editor before. A close notification requires a previous open notification to be sent. Note that a server's ability to fulfill requests is independent of whether a text document is open or closed.

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


#### <a href="#textDocument_publishDiagnostics" name="textDocument_publishDiagnostics" class="anchor">PublishDiagnostics Notification (:arrow_left:)</a>

Diagnostics notification are sent from the server to the client to signal results of validation runs.

Diagnostics are "owned" by the server so it is the server's responsibility to clear them if necessary. The following rule is used for VS Code servers that generate diagnostics:

* if a language is single file only (for example HTML) then diagnostics are cleared by the server when the file is closed.
* if a language has a project system (for example C#) diagnostics are not cleared when a file closes. When a project is opened all diagnostics for all files are recomputed (or read from a cache).

When a file changes it is the server's responsibility to re-compute diagnostics and push them to the client. If the computed set is empty it has to push the empty array to clear former diagnostics. Newly pushed diagnostics always replace previously pushed diagnostics. There is no merging that happens on the client side.

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

#### <a href="#textDocument_completion" name="textDocument_completion" class="anchor">Completion Request (:leftwards_arrow_with_hook:)</a>

The Completion request is sent from the client to the server to compute completion items at a given cursor position. Completion items are presented in the [IntelliSense](https://code.visualstudio.com/docs/editor/intellisense) user interface. If computing full completion items is expensive, servers can additionally provide a handler for the completion item resolve request ('completionItem/resolve'). This request is sent when a completion item is selected in the user interface. A typical use case is for example: the 'textDocument/completion' request doesn't fill in the `documentation` property for returned completion items since it is expensive to compute. When the item is selected in the user interface then a 'completionItem/resolve' request is sent with the selected completion item as a parameter. The returned completion item should have the documentation property filled in. The request can delay the computation of the `detail` and `documentation` properties. However, properties that are needed for the initial sorting and filtering, like `sortText`, `filterText`, `insertText`, and `textEdit` must be provided in the `textDocument/completion` response and must not be changed during resolve.

_Request_:
* method: 'textDocument/completion'
* params: `CompletionParams` defined as follows:

```typescript
export interface CompletionParams extends TextDocumentPositionParams {

	/**
	 * The completion context. This is only available if the client specifies
	 * to send this using `ClientCapabilities.textDocument.completion.contextSupport === true`
	 */
	context?: CompletionContext;
}

/**
 * How a completion was triggered
 */
export namespace CompletionTriggerKind {
	/**
	 * Completion was triggered by typing an identifier (24x7 code
	 * complete), manual invocation (e.g Ctrl+Space) or via API.
	 */
	export const Invoked: 1 = 1;

	/**
	 * Completion was triggered by a trigger character specified by
	 * the `triggerCharacters` properties of the `CompletionRegistrationOptions`.
	 */
	export const TriggerCharacter: 2 = 2;

	/**
	 * Completion was re-triggered as the current completion list is incomplete.
	 */
	export const TriggerForIncompleteCompletions: 3 = 3;
}
export type CompletionTriggerKind = 1 | 2 | 3;


/**
 * Contains additional information about the context in which a completion request is triggered.
 */
export interface CompletionContext {
	/**
	 * How the completion was triggered.
	 */
	triggerKind: CompletionTriggerKind;

	/**
	 * The trigger character (a single character) that has trigger code complete.
	 * Is undefined if `triggerKind !== CompletionTriggerKind.TriggerCharacter`
	 */
	triggerCharacter?: string;
}
```

_Response_:
* result: `CompletionItem[]` \| `CompletionList` \| `null`. If a `CompletionItem[]` is provided it is interpreted to be complete. So it is the same as `{ isIncomplete: false, items }`

```typescript
/**
 * Represents a collection of [completion items](#CompletionItem) to be presented
 * in the editor.
 */
interface CompletionList {
	/**
	 * This list is not complete. Further typing should result in recomputing
	 * this list.
	 *
	 * Recomputed lists have all their items replaced (not appended) in the
	 * incomplete completion sessions.
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
	 * an icon is chosen by the editor. The standardized set
	 * of available values is defined in `CompletionItemKind`.
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
	documentation?: string | MarkupContent;

	/**
	 * Indicates if this item is deprecated.
	 */
	deprecated?: boolean;

	/**
	 * Select this item when showing.
	 *
	 * *Note* that only one completion item can be selected and that the
	 * tool / client decides which item that is. The rule is that the *first*
	 * item of those that match best is selected.
	 */
	preselect?: boolean;

	/**
	 * A string that should be used when comparing this item
	 * with other items. When `falsy` the label is used.
	 */
	sortText?: string;

	/**
	 * A string that should be used when filtering a set of
	 * completion items. When `falsy` the label is used.
	 */
	filterText?: string;

	/**
	 * A string that should be inserted into a document when selecting
	 * this completion. When `falsy` the label is used.
	 *
	 * The `insertText` is subject to interpretation by the client side.
	 * Some tools might not take the string literally. For example
	 * VS Code when code complete is requested in this example `con<cursor position>`
	 * and a completion item with an `insertText` of `console` is provided it
	 * will only insert `sole`. Therefore it is recommended to use `textEdit` instead
	 * since it avoids additional client side interpretation.
	 */
	insertText?: string;

	/**
	 * The format of the insert text. The format applies to both the `insertText` property
	 * and the `newText` property of a provided `textEdit`. If omitted defaults to
	 * `InsertTextFormat.PlainText`.
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
	 * selecting this completion. Edits must not overlap (including the same insert position)
	 * with the main edit nor with themselves.
	 *
	 * Additional text edits should be used to change text unrelated to the current cursor position
	 * (for example adding an import statement at the top of the file if the completion item will
	 * insert an unqualified type).
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
	 * A data entry field that is preserved on a completion item between
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
	export const Folder = 19;
	export const EnumMember = 20;
	export const Constant = 21;
	export const Struct = 22;
	export const Event = 23;
	export const Operator = 24;
	export const TypeParameter = 25;
}
```
* error: code and message set in case an exception happens during the completion request.

_Registration Options_: `CompletionRegistrationOptions` options defined as follows:

```typescript
export interface CompletionRegistrationOptions extends TextDocumentRegistrationOptions {
	/**
	 * Most tools trigger completion request automatically without explicitly requesting
	 * it using a keyboard shortcut (e.g. Ctrl+Space). Typically they do so when the user
	 * starts to type an identifier. For example if the user types `c` in a JavaScript file
	 * code complete will automatically pop up present `console` besides others as a
	 * completion item. Characters that make up identifiers don't need to be listed here.
	 *
	 * If code complete should automatically be trigger on characters not being valid inside
	 * an identifier (for example `.` in JavaScript) list them in `triggerCharacters`.
	 */
	triggerCharacters?: string[];

	/**
	 * The list of all possible characters that commit a completion. This field can be used
	 * if clients don't support individual commit characters per completion item. See
	 * `ClientCapabilities.textDocument.completion.completionItem.commitCharactersSupport`.
	 *
	 * If a server provides both `allCommitCharacters` and commit characters on an individual
	 * completion item the ones on the completion item win.
	 *
     * Since 3.2.0
	 */
	allCommitCharacters?: string[];

	/**
	 * The server provides support to resolve additional
	 * information for a completion item.
	 */
	resolveProvider?: boolean;
}
```

Completion items support snippets (see `InsertTextFormat.Snippet`). The snippet format is as follows:

##### Snippet Syntax

The `body` of a snippet can use special constructs to control cursors and the text being inserted. The following are supported features and their syntaxes:

##### Tab stops

With tab stops, you can make the editor cursor move inside a snippet. Use `$1`, `$2` to specify cursor locations. The number is the order in which tab stops will be visited, whereas `$0` denotes the final cursor position. Multiple tab stops are linked and updated in sync.

##### Placeholders

Placeholders are tab stops with values, like `${1:foo}`. The placeholder text will be inserted and selected such that it can be easily changed. Placeholders can be nested, like `${1:another ${2:placeholder}}`.

##### Choice

Placeholders can have choices as values. The syntax is a comma separated enumeration of values, enclosed with the pipe-character, for example `${1|one,two,three|}`. When the snippet is inserted and the placeholder selected, choices will prompt the user to pick one of the values.

##### Variables

With `$name` or `${name:default}` you can insert the value of a variable. When a variable isn’t set, its *default* or the empty string is inserted. When a variable is unknown (that is, its name isn’t defined) the name of the variable is inserted and it is transformed into a placeholder.

The following variables can be used:

* `TM_SELECTED_TEXT` The currently selected text or the empty string
* `TM_CURRENT_LINE` The contents of the current line
* `TM_CURRENT_WORD` The contents of the word under cursor or the empty string
* `TM_LINE_INDEX` The zero-index based line number
* `TM_LINE_NUMBER` The one-index based line number
* `TM_FILENAME` The filename of the current document
* `TM_FILENAME_BASE` The filename of the current document without its extensions
* `TM_DIRECTORY` The directory of the current document
* `TM_FILEPATH` The full file path of the current document

##### Variable Transforms

Transformations allow you to modify the value of a variable before it is inserted. The definition of a transformation consists of three parts:

1. A regular expression that is matched against the value of a variable, or the empty string when the variable cannot be resolved.
2. A "format string" that allows to reference matching groups from the regular expression. The format string allows for conditional inserts and simple modifications.
3. Options that are passed to the regular expression.

The following example inserts the name of the current file without its ending, so from `foo.txt` it makes `foo`.

```
${TM_FILENAME/(.*)\..+$/$1/}
  |           |         | |
  |           |         | |-> no options
  |           |         |
  |           |         |-> references the contents of the first
  |           |             capture group
  |           |
  |           |-> regex to capture everything before
  |               the final `.suffix`
  |
  |-> resolves to the filename
```

##### Grammar

Below is the EBNF ([extended Backus-Naur form](https://en.wikipedia.org/wiki/Extended_Backus-Naur_form)) for snippets. With `\` (backslash), you can escape `$`, `}` and `\`. Within choice elements, the backslash also escapes comma and pipe characters.

```
any         ::= tabstop | placeholder | choice | variable | text
tabstop     ::= '$' int | '${' int '}'
placeholder ::= '${' int ':' any '}'
choice      ::= '${' int '|' text (',' text)* '|}'
variable    ::= '$' var | '${' var }'
                | '${' var ':' any '}'
                | '${' var '/' regex '/' (format | text)+ '/' options '}'
format      ::= '$' int | '${' int '}'
                | '${' int ':' '/upcase' | '/downcase' | '/capitalize' '}'
                | '${' int ':+' if '}'
                | '${' int ':?' if ':' else '}'
                | '${' int ':-' else '}' | '${' int ':' else '}'
regex       ::= JavaScript Regular Expression value (ctor-string)
options     ::= JavaScript Regular Expression option (ctor-options)
var         ::= [_a-zA-Z] [_a-zA-Z0-9]*
int         ::= [0-9]+
text        ::= .*
```

#### <a href="#completionItem_resolve" name="completionItem_resolve" class="anchor">Completion Item Resolve Request (:leftwards_arrow_with_hook:)</a>

The request is sent from the client to the server to resolve additional information for a given completion item.

_Request_:
* method: 'completionItem/resolve'
* params: `CompletionItem`

_Response_:
* result: `CompletionItem`
* error: code and message set in case an exception happens during the completion resolve request.

#### <a href="#textDocument_hover" name="textDocument_hover" class="anchor">Hover Request (:leftwards_arrow_with_hook:)</a>

The hover request is sent from the client to the server to request hover information at a given text document position.

_Request_:
* method: 'textDocument/hover'
* params: [`TextDocumentPositionParams`](#textdocumentpositionparams)

_Response_:
* result: `Hover` \| `null` defined as follows:

```typescript
/**
 * The result of a hover request.
 */
interface Hover {
	/**
	 * The hover's content
	 */
	contents: MarkedString | MarkedString[] | MarkupContent;

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
 * is semantically equal to the optional language identifier in fenced code blocks in GitHub
 * issues. See https://help.github.com/articles/creating-and-highlighting-code-blocks/#syntax-highlighting
 *
 * The pair of a language and a value is an equivalent to markdown:
 * ```${language}
 * ${value}
 * ```
 *
 * Note that markdown strings will be sanitized - that means html will be escaped.
* @deprecated use MarkupContent instead.
*/
type MarkedString = string | { language: string; value: string };
```

* error: code and message set in case an exception happens during the hover request.

_Registration Options_: `TextDocumentRegistrationOptions`

#### <a href="#textDocument_signatureHelp" name="textDocument_signatureHelp" class="anchor">Signature Help Request (:leftwards_arrow_with_hook:)</a>

The signature help request is sent from the client to the server to request signature information at a given cursor position.

_Request_:
* method: 'textDocument/signatureHelp'
* params: [`TextDocumentPositionParams`](#textdocumentpositionparams)

_Response_:
* result: `SignatureHelp` \| `null` defined as follows:

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
	 * mandatory to better express this.
	 */
	activeSignature?: number;

	/**
	 * The active parameter of the active signature. If omitted or the value
	 * lies outside the range of `signatures[activeSignature].parameters`
	 * defaults to 0 if the active signature has parameters. If
	 * the active signature has no parameters it is ignored.
	 * In future version of the protocol this property might become
	 * mandatory to better express the active parameter if the
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
	documentation?: string | MarkupContent;

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
	 * The label of this parameter information.
	 *
	 * Either a string or an inclusive start and exclusive end offsets within its containing
	 * signature label. (see SignatureInformation.label). The offsets are based on a UTF-16
	 * string representation as `Position` and `Range` does.
	 *
	 * *Note*: a label of type string should be a substring of its containing signature label.
	 * Its intended use case is to highlight the parameter label part in the `SignatureInformation.label`.
	 */
	label: string | [number, number];

	/**
	 * The human-readable doc-comment of this parameter. Will be shown
	 * in the UI but can be omitted.
	 */
	documentation?: string | MarkupContent;
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
#### <a href="#textDocument_declaration" name="textDocument_declaration" class="anchor">Goto Declaration Request (:leftwards_arrow_with_hook:)</a>

> *Since version 3.14.0*

The go to declaration request is sent from the client to the server to resolve the declaration location of a symbol at a given text document position.

The result type [`LocationLink`](#locationlink)[] got introduce with version 3.14.0 and depends in the corresponding client capability `clientCapabilities.textDocument.declaration.linkSupport`.

_Request_:
* method: 'textDocument/declaration'
* params: [`TextDocumentPositionParams`](#textdocumentpositionparams)

_Response_:
* result: [`Location`](#location) \| [`Location`](#location)[] \| [`LocationLink`](#locationlink)[] \|`null`
* error: code and message set in case an exception happens during the declaration request.

_Registration Options_: `TextDocumentRegistrationOptions`

#### <a href="#textDocument_definition" name="textDocument_definition" class="anchor">Goto Definition Request (:leftwards_arrow_with_hook:)</a>

> *Since version 3.14.0*

The go to definition request is sent from the client to the server to resolve the definition location of a symbol at a given text document position.

The result type [`LocationLink`](#locationlink)[] got introduce with version 3.14.0 and depends in the corresponding client capability `clientCapabilities.textDocument.definition.linkSupport`.

_Request_:
* method: 'textDocument/definition'
* params: [`TextDocumentPositionParams`](#textdocumentpositionparams)

_Response_:
* result: [`Location`](#location) \| [`Location`](#location)[] \| [`LocationLink`](#locationlink)[] \| `null`
* error: code and message set in case an exception happens during the definition request.

_Registration Options_: `TextDocumentRegistrationOptions`

#### <a href="#textDocument_typeDefinition" name="textDocument_typeDefinition" class="anchor">Goto Type Definition Request (:leftwards_arrow_with_hook:)</a>

> *Since version 3.6.0*

The go to type definition request is sent from the client to the server to resolve the type definition location of a symbol at a given text document position.

The result type [`LocationLink`](#locationlink)[] got introduce with version 3.14.0 and depends in the corresponding client capability `clientCapabilities.textDocument.typeDefinition.linkSupport`.

_Request_:
* method: 'textDocument/typeDefinition'
* params: [`TextDocumentPositionParams`](#textdocumentpositionparams)

_Response_:
* result: [`Location`](#location) \| [`Location`](#location)[] \| [`LocationLink`](#locationlink)[] \| `null`
* error: code and message set in case an exception happens during the definition request.

_Registration Options_: `TextDocumentRegistrationOptions`

#### <a href="#textDocument_implementation" name="textDocument_implementation" class="anchor">Goto Implementation Request (:leftwards_arrow_with_hook:)</a>

> *Since version 3.6.0*

The go to implementation request is sent from the client to the server to resolve the implementation location of a symbol at a given text document position.

The result type [`LocationLink`](#locationlink)[] got introduce with version 3.14.0 and depends in the corresponding client capability `clientCapabilities.implementation.typeDefinition.linkSupport`.

_Request_:
* method: 'textDocument/implementation'
* params: [`TextDocumentPositionParams`](#textdocumentpositionparams)

_Response_:
* result: [`Location`](#location) \| [`Location`](#location)[] \| [`LocationLink`](#locationlink)[] \| `null`
* error: code and message set in case an exception happens during the definition request.

_Registration Options_: `TextDocumentRegistrationOptions`

#### <a href="#textDocument_references" name="textDocument_references" class="anchor">Find References Request (:leftwards_arrow_with_hook:)</a>

The references request is sent from the client to the server to resolve project-wide references for the symbol denoted by the given text document position.

_Request_:
* method: 'textDocument/references'
* params: `ReferenceParams` defined as follows:

```typescript
interface ReferenceParams extends TextDocumentPositionParams {
	context: ReferenceContext
}

interface ReferenceContext {
	/**
	 * Include the declaration of the current symbol.
	 */
	includeDeclaration: boolean;
}
```
_Response_:
* result: [`Location`](#location)[] \| `null`
* error: code and message set in case an exception happens during the reference request.

_Registration Options_: `TextDocumentRegistrationOptions`

#### <a href="#textDocument_documentHighlight" name="textDocument_documentHighlight" class="anchor">Document Highlights Request (:leftwards_arrow_with_hook:)</a>

The document highlight request is sent from the client to the server to resolve a document highlights for a given text document position.
For programming languages this usually highlights all references to the symbol scoped to this file. However we kept 'textDocument/documentHighlight'
and 'textDocument/references' separate requests since the first one is allowed to be more fuzzy. Symbol matches usually have a `DocumentHighlightKind`
of `Read` or `Write` whereas fuzzy or textual matches use `Text`as the kind.

_Request_:
* method: 'textDocument/documentHighlight'
* params: [`TextDocumentPositionParams`](#textdocumentpositionparams)

_Response_:
* result: `DocumentHighlight[]` \| `null` defined as follows:

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

#### <a href="#textDocument_documentSymbol" name="textDocument_documentSymbol" class="anchor">Document Symbols Request (:leftwards_arrow_with_hook:)</a>

The document symbol request is sent from the client to the server. The returned result is either

- `SymbolInformation[]` which is a flat list of all symbols found in a given text document. Then neither the symbol's location range nor the symbol's container name should be used to infer a hierarchy.
- `DocumentSymbol[]` which is a hierarchy of symbols found in a given text document.

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
* result: `DocumentSymbol[]` \| `SymbolInformation[]` \| `null` defined as follows:

```typescript
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
	export const Object = 19;
	export const Key = 20;
	export const Null = 21;
	export const EnumMember = 22;
	export const Struct = 23;
	export const Event = 24;
	export const Operator = 25;
	export const TypeParameter = 26;
}

/**
 * Represents programming constructs like variables, classes, interfaces etc. that appear in a document. Document symbols can be
 * hierarchical and they have two ranges: one that encloses its definition and one that points to its most interesting range,
 * e.g. the range of an identifier.
 */
export class DocumentSymbol {

	/**
	 * The name of this symbol. Will be displayed in the user interface and therefore must not be
	 * an empty string or a string only consisting of white spaces.
	 */
	name: string;

	/**
	 * More detail for this symbol, e.g the signature of a function.
	 */
	detail?: string;

	/**
	 * The kind of this symbol.
	 */
	kind: SymbolKind;

	/**
	 * Indicates if this symbol is deprecated.
	 */
	deprecated?: boolean;

	/**
	 * The range enclosing this symbol not including leading/trailing whitespace but everything else
	 * like comments. This information is typically used to determine if the clients cursor is
	 * inside the symbol to reveal in the symbol in the UI.
	 */
	range: Range;

	/**
	 * The range that should be selected and revealed when this symbol is being picked, e.g the name of a function.
	 * Must be contained by the `range`.
	 */
	selectionRange: Range;

	/**
	 * Children of this symbol, e.g. properties of a class.
	 */
	children?: DocumentSymbol[];
}

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
	 * Indicates if this symbol is deprecated.
	 */
	deprecated?: boolean;

	/**
	 * The location of this symbol. The location's range is used by a tool
	 * to reveal the location in the editor. If the symbol is selected in the
	 * tool the range's start information is used to position the cursor. So
	 * the range usually spans more then the actual symbol's name and does
	 * normally include things like visibility modifiers.
	 *
	 * The range doesn't have to denote a node range in the sense of an abstract
	 * syntax tree. It can therefore not be used to re-construct a hierarchy of
	 * the symbols.
	 */
	location: Location;

	/**
	 * The name of the symbol containing this symbol. This information is for
	 * user interface purposes (e.g. to render a qualifier in the user interface
	 * if necessary). It can't be used to re-infer a hierarchy for the document
	 * symbols.
	 */
	containerName?: string;
}

```

* error: code and message set in case an exception happens during the document symbol request.

_Registration Options_: `TextDocumentRegistrationOptions`

#### <a href="#textDocument_codeAction" name="textDocument_codeAction" class="anchor">Code Action Request (:leftwards_arrow_with_hook:)</a>

The code action request is sent from the client to the server to compute commands for a given text document and range. These commands are typically code fixes to either fix problems or to beautify/refactor code. The result of a `textDocument/codeAction` request is an array of `Command` literals which are typically presented in the user interface. To ensure that a server is useful in many clients the commands specified in a code actions should be handled by the server and not by the client (see `workspace/executeCommand` and `ServerCapabilities.executeCommandProvider`). If the client supports providing edits with a code action then the mode should be used.

When the command is selected the server should be contacted again (via the `workspace/executeCommand`) request to execute the command.

> *Since version 3.8.0:* support for CodeAction literals to enable the following scenarios:

- the ability to directly return a workspace edit from the code action request. This avoids having another server roundtrip to execute an actual code action. However server providers should be aware that if the code action is expensive to compute or the edits are huge it might still be beneficial if the result is simply a command and the actual edit is only computed when needed.
- the ability to group code actions using a kind. Clients are allowed to ignore that information. However it allows them to better group code action for example into corresponding menus (e.g. all refactor code actions into a refactor menu).

Clients need to announce their support for code action literals and code action kinds via the corresponding client capability `textDocument.codeAction.codeActionLiteralSupport`.

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
 * The kind of a code action.
 *
 * Kinds are a hierarchical list of identifiers separated by `.`, e.g. `"refactor.extract.function"`.
 *
 * The set of kinds is open and client needs to announce the kinds it supports to the server during
 * initialization.
 */
export type CodeActionKind = string;

/**
 * A set of predefined code action kinds
 */
export namespace CodeActionKind {

	/**
	 * Empty kind.
	 */
	export const Empty: CodeActionKind = '';

	/**
	 * Base kind for quickfix actions: 'quickfix'
	 */
	export const QuickFix: CodeActionKind = 'quickfix';

	/**
	 * Base kind for refactoring actions: 'refactor'
	 */
	export const Refactor: CodeActionKind = 'refactor';

	/**
	 * Base kind for refactoring extraction actions: 'refactor.extract'
	 *
	 * Example extract actions:
	 *
	 * - Extract method
	 * - Extract function
	 * - Extract variable
	 * - Extract interface from class
	 * - ...
	 */
	export const RefactorExtract: CodeActionKind = 'refactor.extract';

	/**
	 * Base kind for refactoring inline actions: 'refactor.inline'
	 *
	 * Example inline actions:
	 *
	 * - Inline function
	 * - Inline variable
	 * - Inline constant
	 * - ...
	 */
	export const RefactorInline: CodeActionKind = 'refactor.inline';

	/**
	 * Base kind for refactoring rewrite actions: 'refactor.rewrite'
	 *
	 * Example rewrite actions:
	 *
	 * - Convert JavaScript function to class
	 * - Add or remove parameter
	 * - Encapsulate field
	 * - Make method static
	 * - Move method to base class
	 * - ...
	 */
	export const RefactorRewrite: CodeActionKind = 'refactor.rewrite';

	/**
	 * Base kind for source actions: `source`
	 *
	 * Source code actions apply to the entire file.
	 */
	export const Source: CodeActionKind = 'source';

	/**
	 * Base kind for an organize imports source action: `source.organizeImports`
	 */
	export const SourceOrganizeImports: CodeActionKind = 'source.organizeImports';
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

	/**
	 * Requested kind of actions to return.
	 *
	 * Actions not of this kind are filtered out by the client before being shown. So servers
	 * can omit computing them.
	 */
	only?: CodeActionKind[];
}
```

_Response_:
* result: `(Command | CodeAction)[]` \| `null` where `CodeAction` is defined as follows:

```typescript
/**
 * A code action represents a change that can be performed in code, e.g. to fix a problem or
 * to refactor code.
 *
 * A CodeAction must set either `edit` and/or a `command`. If both are supplied, the `edit` is applied first, then the `command` is executed.
 */
export interface CodeAction {

	/**
	 * A short, human-readable, title for this code action.
	 */
	title: string;

	/**
	 * The kind of the code action.
	 *
	 * Used to filter code actions.
	 */
	kind?: CodeActionKind;

	/**
	 * The diagnostics that this code action resolves.
	 */
	diagnostics?: Diagnostic[];

	/**
	 * The workspace edit this code action performs.
	 */
	edit?: WorkspaceEdit;

	/**
	 * A command this code action executes. If a code action
	 * provides an edit and a command, first the edit is
	 * executed and then the command.
	 */
	command?: Command;
}
```

* error: code and message set in case an exception happens during the code action request.

_Registration Options_: `CodeActionRegistrationOptions`  defined as follows:

```typescript
export interface CodeActionRegistrationOptions extends TextDocumentRegistrationOptions, CodeActionOptions {
}
```


#### <a href="#textDocument_codeLens" name="textDocument_codeLens" class="anchor">Code Lens Request (:leftwards_arrow_with_hook:)</a>

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
* result: `CodeLens[]` \| `null` defined as follows:

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

#### <a href="#codeLens_resolve" name="codeLens_resolve" class="anchor">Code Lens Resolve Request (:leftwards_arrow_with_hook:)</a>

The code lens resolve request is sent from the client to the server to resolve the command for a given code lens item.

_Request_:
* method: 'codeLens/resolve'
* params: `CodeLens`

_Response_:
* result: `CodeLens`
* error: code and message set in case an exception happens during the code lens resolve request.

#### <a href="#textDocument_documentLink" name="textDocument_documentLink" class="anchor">Document Link Request (:leftwards_arrow_with_hook:)</a>

The document links request is sent from the client to the server to request the location of links in a document.

_Request_:
* method: 'textDocument/documentLink'
* params: `DocumentLinkParams`, defined as follows:

```typescript
interface DocumentLinkParams {
	/**
	 * The document to provide document links for.
	 */
	textDocument: TextDocumentIdentifier;
}
```

_Response_:
* result: An array of `DocumentLink` \| `null`.

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
	/**
	 * A data entry field that is preserved on a document link between a
	 * DocumentLinkRequest and a DocumentLinkResolveRequest.
	 */
	data?: any;
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

#### <a href="#documentLink_resolve" name="documentLink_resolve" class="anchor">Document Link Resolve Request (:leftwards_arrow_with_hook:)</a>

The document link resolve request is sent from the client to the server to resolve the target of a given document link.

_Request_:
* method: 'documentLink/resolve'
* params: `DocumentLink`

_Response_:
* result: `DocumentLink`
* error: code and message set in case an exception happens during the document link resolve request.

#### <a href="#textDocument_documentColor" name="textDocument_documentColor" class="anchor">Document Color Request (:leftwards_arrow_with_hook:)</a>

> *Since version 3.6.0*

The document color request is sent from the client to the server to list all color references found in a given text document. Along with the range, a color value in RGB is returned.

Clients can use the result to decorate color references in an editor. For example:
- Color boxes showing the actual color next to the reference
- Show a color picker when a color reference is edited

_Request_:

* method: 'textDocument/documentColor'
* params: `DocumentColorParams` defined as follows

```ts
interface DocumentColorParams {
	/**
	 * The text document.
	 */
	textDocument: TextDocumentIdentifier;
}
```

_Response_:
* result: `ColorInformation[]` defined as follows:

```typescript
interface ColorInformation {
	/**
	 * The range in the document where this color appears.
	 */
	range: Range;

	/**
	 * The actual color value for this color range.
	 */
	color: Color;
}

/**
 * Represents a color in RGBA space.
 */
interface Color {

	/**
	 * The red component of this color in the range [0-1].
	 */
	readonly red: number;

	/**
	 * The green component of this color in the range [0-1].
	 */
	readonly green: number;

	/**
	 * The blue component of this color in the range [0-1].
	 */
	readonly blue: number;

	/**
	 * The alpha component of this color in the range [0-1].
	 */
	readonly alpha: number;
}
```
* error: code and message set in case an exception happens during the 'textDocument/documentColor' request

#### <a href="#textDocument_colorPresentation" name="textDocument_colorPresentation" class="anchor">Color Presentation Request (:leftwards_arrow_with_hook:)</a>

> *Since version 3.6.0*

The color presentation request is sent from the client to the server to obtain a list of presentations for a color value at a given location. Clients can use the result to
- modify a color reference.
- show in a color picker and let users pick one of the presentations


_Request_:

* method: 'textDocument/colorPresentation'
* params: `ColorPresentationParams` defined as follows

```typescript
interface ColorPresentationParams {
	/**
	 * The text document.
	 */
	textDocument: TextDocumentIdentifier;

	/**
	 * The color information to request presentations for.
	 */
	color: Color;

	/**
	 * The range where the color would be inserted. Serves as a context.
	 */
	range: Range;
}
```

_Response_:
* result: `ColorPresentation[]` defined as follows:

```typescript
interface ColorPresentation {
	/**
	 * The label of this color presentation. It will be shown on the color
	 * picker header. By default this is also the text that is inserted when selecting
	 * this color presentation.
	 */
	label: string;
	/**
	 * An [edit](#TextEdit) which is applied to a document when selecting
	 * this presentation for the color.  When `falsy` the [label](#ColorPresentation.label)
	 * is used.
	 */
	textEdit?: TextEdit;
	/**
	 * An optional array of additional [text edits](#TextEdit) that are applied when
	 * selecting this color presentation. Edits must not overlap with the main [edit](#ColorPresentation.textEdit) nor with themselves.
	 */
	additionalTextEdits?: TextEdit[];
}
```

* error: code and message set in case an exception happens during the 'textDocument/colorPresentation' request

#### <a href="#textDocument_formatting" name="textDocument_formatting" class="anchor">Document Formatting Request  (:leftwards_arrow_with_hook:)</a>

The document formatting request is sent from the client to the server to format a whole document.

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
* result: [`TextEdit[]`](#textedit) \| `null` describing the modification to the document to be formatted.
* error: code and message set in case an exception happens during the formatting request.

_Registration Options_: `TextDocumentRegistrationOptions`

#### <a href="#textDocument_rangeFormatting" name="textDocument_rangeFormatting" class="anchor">Document Range Formatting Request (:leftwards_arrow_with_hook:)</a>

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
* result: [`TextEdit[]`](#textedit) \| `null` describing the modification to the document to be formatted.
* error: code and message set in case an exception happens during the range formatting request.

_Registration Options_: `TextDocumentRegistrationOptions`

#### <a href="#textDocument_onTypeFormatting" name="textDocument_onTypeFormatting" class="anchor">Document on Type Formatting Request (:leftwards_arrow_with_hook:)</a>

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
* result: [`TextEdit[]`](#textedit) \| `null` describing the modification to the document.
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
#### <a href="#textDocument_rename" name="textDocument_rename" class="anchor">Rename Request (:leftwards_arrow_with_hook:)</a>

The rename request is sent from the client to the server to ask the server to compute a workspace change so that the client can perform a workspace-wide rename of a symbol.

_Request_:
* method: 'textDocument/rename'
* params: `RenameParams` defined as follows

```typescript
interface RenameParams {
	/**
	 * The document to rename.
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
* result: [`WorkspaceEdit`](#workspaceedit) \| `null` describing the modification to the workspace.
* error: code and message set in case an exception happens during the rename request.

_Registration Options_: `RenameRegistrationOptions` defined as follows:

```typescript
export interface RenameRegistrationOptions extends TextDocumentRegistrationOptions {
	/**
	 * Renames should be checked and tested for validity before being executed.
	 */
	prepareProvider?: boolean;
}
```

#### <a href="#textDocument_prepareRename" name="textDocument_prepareRename" class="anchor">Prepare Rename Request (:leftwards_arrow_with_hook:)</a>

> *Since version 3.12.0*

The prepare rename request is sent from the client to the server to setup and test the validity of a rename operation at a given location.

_Request_:
* method: 'textDocument/prepareRename'
* params: [`TextDocumentPositionParams`](#textdocumentpositionparams)

_Response_:
* result: [`Range`](#range) \| `{ range: Range, placeholder: string }` \| `null` describing the range of the string to rename and optionally a placeholder text of the string content to be renamed. If `null` is returned then it is deemed that a 'textDocument/rename' request is not valid at the given position.
* error: code and message set in case an exception happens during the prepare rename request.

#### <a href="#textDocument_foldingRange" name="textDocument_foldingRange" class="anchor">Folding Range Request (:leftwards_arrow_with_hook:)</a>

> *Since version 3.10.0*

The folding range request is sent from the client to the server to return all folding ranges found in a given text document.

_Request_:

* method: 'textDocument/foldingRange'
* params: `FoldingRangeParams` defined as follows

```typescript
export interface FoldingRangeParams {
	/**
	 * The text document.
	 */
	textDocument: TextDocumentIdentifier;
}

```

_Response_:
* result: `FoldingRange[] | null` defined as follows:

```typescript
/**
 * Enum of known range kinds
 */
export enum FoldingRangeKind {
	/**
	 * Folding range for a comment
	 */
	Comment = 'comment',
	/**
	 * Folding range for imports or includes
	 */
	Imports = 'imports',
	/**
	 * Folding range for a region (e.g. `#region`)
	 */
	Region = 'region'
}

/**
 * Represents a folding range.
 */
export interface FoldingRange {

	/**
	 * The zero-based line number from where the folded range starts.
	 */
	startLine: number;

	/**
	 * The zero-based character offset from where the folded range starts. If not defined, defaults to the length of the start line.
	 */
	startCharacter?: number;

	/**
	 * The zero-based line number where the folded range ends.
	 */
	endLine: number;

	/**
	 * The zero-based character offset before the folded range ends. If not defined, defaults to the length of the end line.
	 */
	endCharacter?: number;

	/**
	 * Describes the kind of the folding range such as `comment` or `region`. The kind
	 * is used to categorize folding ranges and used by commands like 'Fold all comments'. See
	 * [FoldingRangeKind](#FoldingRangeKind) for an enumeration of standardized kinds.
	 */
	kind?: string;
}
```

* error: code and message set in case an exception happens during the 'textDocument/foldingRange' request

_Registration Options_: `TextDocumentRegistrationOptions`


### Implementation considerations

Language servers usually run in a separate process and client communicate with them in an asynchronous fashion. Additionally clients usually allow users to interact with the source code even if request results are pending. We recommend the following implementation pattern to avoid that clients apply outdated response results:

- if a client sends a request to the server and the client state changes in a way that the result will be invalid it should cancel the server request and ignore the result. If necessary it can resend the request to receive an up to date result.
- if a server detects a state change that invalidates the result of a request in execution the server can error these requests with `ContentModified`. If clients receive a `ContentModified` error, it generally should not show it in the UI for the end-user. Clients can resend the request if appropriate.
- if servers end up in an inconsistent state they should log this to the client using the `window/logMessage` request. If they can't recover from this the best they can do right now is to exit themselves. We are considering an [extension to the protocol](https://github.com/Microsoft/language-server-protocol/issues/646) that allows servers to request a restart on the client side.
- if a client notices that a server exists unexpectedly it should try to restart the server. However clients should be careful to not restart a crashing server endlessly. VS Code for example doesn't restart a server if it crashes 5 times in the last 180 seconds.

### <a href="#changeLog" name="changeLog" class="anchor">Change Log</a>

#### <a href="#version_3_14_0" name="version_3_14_0" class="anchor">3.14.0 (12/13/2018)</a>

* Add support for signature label offsets.
* Add support for location links.
* Add support for `textDocument/declaration` request.

#### <a href="#version_3_13_0" name="version_3_13_0" class="anchor">3.13.0 (9/11/2018)</a>

* Add support for file and folder operations (create, rename, move) to workspace edits.

#### <a href="#version_3_12_0" name="version_3_12_0" class="anchor">3.12.0 (8/23/2018)</a>

* Add support for `textDocument/prepareRename` request.

#### <a href="#version_3_11_0" name="version_3_11_0" class="anchor">3.11.0 (8/21/2018)</a>

* Add support for CodeActionOptions to allow a server to provide a list of code action it supports.

#### <a href="#version_3_10_0" name="version_3_10_0" class="anchor">3.10.0 (7/23/2018)</a>

* Add support for hierarchical document symbols as a valid response to a `textDocument/documentSymbol` request.
* Add support for folding ranges as a valid response to a `textDocument/foldingRange` request.

#### <a href="#version_3_9_0" name="version_3_9_0" class="anchor">3.9.0 (7/10/2018)</a>

* Add support for `preselect` property in `CompletionItem`

#### <a href="#version_3_8_0" name="version_3_8_0" class="anchor">3.8.0 (6/11/2018)</a>

* Added support for CodeAction literals to the `textDocument/codeAction` request.
* ColorServerCapabilities.colorProvider can also be a boolean
* Corrected ColorPresentationParams.colorInfo to color (as in the `d.ts` and in implementations)

#### <a href="#version_3_7_0" name="version_3_7_0" class="anchor">3.7.0 (4/5/2018)</a>

* Added support for related information to Diagnostics.

#### <a href="#version_3_6_0" name="version_3_6_0" class="anchor">3.6.0 (2/22/2018)</a>

Merge the proposed protocol for workspace folders, configuration, go to type definition, go to implementation and document color provider into the main branch of the specification. For details see:

* [Get Workspace Folders](https://microsoft.github.io/language-server-protocol/specification#workspace_workspaceFolders)
* [DidChangeWorkspaceFolders Notification](https://microsoft.github.io/language-server-protocol/specification#workspace_didChangeWorkspaceFolders)
* [Get Configuration](https://microsoft.github.io/language-server-protocol/specification#workspace_configuration)
* [Go to Type Definition](https://microsoft.github.io/language-server-protocol/specification#textDocument_typeDefinition)
* [Go to Implementation](https://microsoft.github.io/language-server-protocol/specification#textDocument_implementation)
* [Document Color](https://microsoft.github.io/language-server-protocol/specification#textDocument_documentColor)
* [Color Presentation](https://microsoft.github.io/language-server-protocol/specification#textDocument_colorPresentation)

In addition we enhanced the `CompletionTriggerKind` with a new value `TriggerForIncompleteCompletions: 3 = 3` to signal the a completion request got trigger since the last result was incomplete.

#### <a href="#version_3_5_0" name="version_3_5_0" class="anchor">3.5.0</a>

Decided to skip this version to bring the protocol version number in sync the with npm module vscode-languageserver-protocol.

#### <a href="#version_3_4_0" name="version_3_4_0" class="anchor">3.4.0 (11/27/2017)</a>

* [extensible completion item and symbol kinds](https://github.com/Microsoft/language-server-protocol/issues/129)

#### <a href="version_3_3_0" name="version_3_3_0" class="anchor">3.3.0 (11/24/2017)</a>

* Added support for `CompletionContext`
* Added support for `MarkupContent`
* Removed old New and Updated markers.

#### <a href="version_3_2_0" name="version_3_2_0" class="anchor">3.2.0 (09/26/2017)</a>

* Added optional `commitCharacters` property to the `CompletionItem`

#### <a href="version_3_1_0" name="version_3_1_0" class="anchor">3.1.0 (02/28/2017)</a>

* Make the `WorkspaceEdit` changes backwards compatible.
* Updated the specification to correctly describe the breaking changes from 2.x to 3.x around `WorkspaceEdit`and `TextDocumentEdit`.

#### <a href="#version_3_0_0" name="version_3_0_0" class="anchor">3.0 Version</a>

- add support for client feature flags to support that servers can adapt to different client capabilities. An example is the new `textDocument/willSaveWaitUntil` request which not all clients might be able to support. If the feature is disabled in the client capabilities sent on the initialize request, the server can't rely on receiving the request.
- add support to experiment with new features. The new `ClientCapabilities.experimental` section together with feature flags allow servers to provide experimental feature without the need of ALL clients to adopt them immediately.
- servers can more dynamically react to client features. Capabilities can now be registered and unregistered after the initialize request using the new `client/registerCapability` and `client/unregisterCapability`. This for example allows servers to react to settings or configuration changes without a restart.
- add support for `textDocument/willSave` notification and `textDocument/willSaveWaitUntil` request.
- add support for `textDocument/documentLink` request.
- add a `rootUri` property to the initializeParams in favor of the `rootPath` property.
