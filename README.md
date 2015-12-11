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


### Content Part

Contains the actual content of the message. The content part of a message uses [JSON-RPC](http://www.jsonrpc.org/) to describe requests, responses and notifications.


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