---
title: Specification
shortTitle: 3.17 - Upcoming
layout: specifications
sectionid: specification-3-17
toc: specification-3-17-toc
index: 2
---
# Language Server Protocol Specification - 3.17

This document describes the upcoming 3.17.x version of the language server protocol. An implementation for node of the 3.17.x version of the protocol can be found [here](https://github.com/Microsoft/vscode-languageserver-node).

**Note:** edits to this specification can be made via a pull request against this markdown [document](https://github.com/Microsoft/language-server-protocol/blob/gh-pages/_specifications/specification-3-17.md).

## <a href="#whatIsNew" name="whatIsNew" class="anchor"> What's new in 3.17 </a>

All new 3.17 features are tagged with a corresponding since version 3.17 text or in JSDoc using `@since 3.17.0` annotation. Major new feature are:

- None so far.

A detailed list of the changes can be found in the [change log](#version_3_17_0)

The version of the specification is used to group features into a new specification release and to refer to their first appearance. Features in the spec are kept compatible using so called capability flags which are exchanged between the client and the server during initialization.

## <a href="#baseProtocol" name="baseProtocol" class="anchor"> Base Protocol </a>

The base protocol consists of a header and a content part (comparable to HTTP). The header and content part are
separated by a '\r\n'.

### <a href="#headerPart" name="headerPart" class="anchor"> Header Part </a>

The header part consists of header fields. Each header field is comprised of a name and a value, separated by ': ' (a colon and a space). The structure of header fields conform to the [HTTP semantic](https://tools.ietf.org/html/rfc7230#section-3.2). Each header field is terminated by '\r\n'. Considering the last header field and the overall header itself are each terminated with '\r\n', and that at least one header is mandatory, this means that two '\r\n' sequences always immediately precede the content part of a message.

Currently the following header fields are supported:

| Header Field Name | Value Type  | Description |
|:------------------|:------------|:------------|
| Content-Length    | number      | The length of the content part in bytes. This header is required. |
| Content-Type      | string      | The mime type of the content part. Defaults to application/vscode-jsonrpc; charset=utf-8 |
{: .table .table-bordered .table-responsive}

The header part is encoded using the 'ascii' encoding. This includes the '\r\n' separating the header and content part.

### <a href="#contentPart" name="contentPart" class="anchor"> Content Part </a>

Contains the actual content of the message. The content part of a message uses [JSON-RPC](http://www.jsonrpc.org/) to describe requests, responses and notifications. The content part is encoded using the charset provided in the Content-Type field. It defaults to `utf-8`, which is the only encoding supported right now. If a server or client receives a header with a different encoding than `utf-8` it should respond with an error.

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

#### <a href="#number" name="number" class="anchor"> Numbers </a>

The protocol use the following definitions for integers, unsigned integers and decimal numbers:

<div class="anchorHolder"><a href="#integer" name="integer" class="linkableAnchor"></a></div>

```typescript
/**
 * Defines an integer number in the range of -2^31 to 2^31 - 1.
 */
export type integer = number;
```

<div class="anchorHolder"><a href="#uinteger" name="uinteger" class="linkableAnchor"></a></div>

```typescript
/**
 * Defines an unsigned integer number in the range of 0 to 2^31 - 1.
 */
export type uinteger = number;
```

<div class="anchorHolder"><a href="#decimal" name="decimal" class="linkableAnchor"></a></div>

```typescript
/**
 * Defines a decimal number. Since decimal numbers are very
 * rare in the language server specification we denote the
 * exact range with every decimal using the mathematics
 * interval notation (e.g. [0, 1] denotes all decimals d with
 * 0 <= d <= 1.
 */
export type decimal = number;
```

#### Abstract Message

A general message as defined by JSON-RPC. The language server protocol always uses "2.0" as the `jsonrpc` version.

<div class="anchorHolder"><a href="#message" name="message" class="linkableAnchor"></a></div>

```typescript
interface Message {
	jsonrpc: string;
}
```
#### <a href="#requestMessage" name="requestMessage" class="anchor"> Request Message </a>

A request message to describe a request between the client and the server. Every processed request must send a response back to the sender of the request.

```typescript
interface RequestMessage extends Message {

	/**
	 * The request id.
	 */
	id: integer | string;

	/**
	 * The method to be invoked.
	 */
	method: string;

	/**
	 * The method's params.
	 */
	params?: array | object;
}
```

#### <a href="#responseMessage" name="responseMessage" class="anchor"> Response Message </a>

A Response Message sent as a result of a request. If a request doesn't provide a result value the receiver of a request still needs to return a response message to conform to the JSON RPC specification. The result property of the ResponseMessage should be set to `null` in this case to signal a successful request.

```typescript
interface ResponseMessage extends Message {
	/**
	 * The request id.
	 */
	id: integer | string | null;

	/**
	 * The result of a request. This member is REQUIRED on success.
	 * This member MUST NOT exist if there was an error invoking the method.
	 */
	result?: string | number | boolean | object | null;

	/**
	 * The error object in case a request fails.
	 */
	error?: ResponseError;
}
```

<div class="anchorHolder"><a href="#responseError" name="responseError" class="linkableAnchor"></a></div>

```typescript
interface ResponseError {
	/**
	 * A number indicating the error type that occurred.
	 */
	code: integer;

	/**
	 * A string providing a short description of the error.
	 */
	message: string;

	/**
	 * A primitive or structured value that contains additional
	 * information about the error. Can be omitted.
	 */
	data?: string | number | boolean | array | object | null;
}
```

<div class="anchorHolder"><a href="#errorCodes" name="errorCodes" class="linkableAnchor"></a></div>

```typescript
export namespace ErrorCodes {
	// Defined by JSON RPC
	export const ParseError: integer = -32700;
	export const InvalidRequest: integer = -32600;
	export const MethodNotFound: integer = -32601;
	export const InvalidParams: integer = -32602;
	export const InternalError: integer = -32603;

	/**
	 * This is the start range of JSON RPC reserved error codes.
	 * It doesn't denote a real error code. No LSP error codes should
	 * be defined between the start and end range. For backwards
	 * compatibility the `ServerNotInitialized` and the `UnknownErrorCode`
	 * are left in the range.
	 *
	 * @since 3.16.0
	 */
	export const jsonrpcReservedErrorRangeStart: integer = -32099;
	/** @deprecated use jsonrpcReservedErrorRangeStart */
	export const serverErrorStart: integer = jsonrpcReservedErrorRangeStart;

	/**
	 * Error code indicating that a server received a notification or
	 * request before the server has received the `initialize` request.
	 */
	export const ServerNotInitialized: integer = -32002;
	export const UnknownErrorCode: integer = -32001;

	/**
	 * This is the end range of JSON RPC reserved error codes.
	 * It doesn't denote a real error code.
	 *
	 * @since 3.16.0
	 */
	export const jsonrpcReservedErrorRangeEnd = -32000;
	/** @deprecated use jsonrpcReservedErrorRangeEnd */
	export const serverErrorEnd: integer = jsonrpcReservedErrorRangeEnd;

	/**
	 * This is the start range of LSP reserved error codes.
	 * It doesn't denote a real error code.
	 *
	 * @since 3.16.0
	 */
	export const lspReservedErrorRangeStart: integer = -32899;

	/**
	 * The server cancelled the request. This error code should
	 * only be used for requests that explicitly support being
	 * server cancellable.
	 *
	 * @since 3.17.0
	 */
	export const ServerCancelled: integer = -32802;


	/**
	 * The server detected that the content of a document got
	 * modified outside normal conditions. A server should
	 * NOT send this error code if it detects a content change
	 * in it unprocessed messages. The result even computed
	 * on an older state might still be useful for the client.
	 *
	 * If a client decides that a result is not of any use anymore
	 * the client should cancel the request.
	 */
	export const ContentModified: integer = -32801;

	/**
	 * The client has canceled a request and a server as detected
	 * the cancel.
	 */
	export const RequestCancelled: integer = -32800;

	/**
	 * This is the end range of LSP reserved error codes.
	 * It doesn't denote a real error code.
	 *
	 * @since 3.16.0
	 */
	export const lspReservedErrorRangeEnd: integer = -32800;
}
```
#### <a href="#notificationMessage" name="notificationMessage" class="anchor"> Notification Message </a>

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
	params?: array | object;
}
```

#### <a href="#dollarRequests" name="dollarRequests" class="anchor"> $ Notifications and Requests </a>

Notification and requests whose methods start with '\$/' are messages which are protocol implementation dependent and might not be implementable in all clients or servers. For example if the server implementation uses a single threaded synchronous programming language then there is little a server can do to react to a `$/cancelRequest` notification. If a server or client receives notifications starting with '\$/' it is free to ignore the notification. If a server or client receives a request starting with '\$/' it must error the request with error code `MethodNotFound` (e.g. `-32601`).

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
	id: integer | string;
}
```

A request that got canceled still needs to return from the server and send a response back. It can not be left open / hanging. This is in line with the JSON RPC protocol that requires that every request sends a response back. In addition it allows for returning partial results on cancel. If the request returns an error response on cancellation it is advised to set the error code to `ErrorCodes.RequestCancelled`.

#### <a href="#progress" name="progress" class="anchor"> Progress Support (:arrow_right: :arrow_left:)</a>

> *Since version 3.15.0*

The base protocol offers also support to report progress in a generic fashion. This mechanism can be used to report any kind of progress including work done progress (usually used to report progress in the user interface using a progress bar) and partial result progress to support streaming of results.

A progress notification has the following properties:

_Notification_:
* method: '$/progress'
* params: `ProgressParams` defined as follows:

```typescript
type ProgressToken = integer | string;
```

```typescript
interface ProgressParams<T> {
	/**
	 * The progress token provided by the client or server.
	 */
	token: ProgressToken;

	/**
	 * The progress data.
	 */
	value: T;
}
```

Progress is reported against a token. The token is different than the request ID which allows to report progress out of band and also for notification.

## Language Server Protocol

The language server protocol defines a set of JSON-RPC request, response and notification messages which are exchanged using the above base protocol. This section starts describing the basic JSON structures used in the protocol. The document uses TypeScript interfaces to describe these. Based on the basic JSON structures, the actual requests with their responses and the notifications are described.

In general, the language server protocol supports JSON-RPC messages, however the base protocol defined here uses a convention such that the parameters passed to request/notification messages should be of `object` type (if passed at all). However, this does not disallow using `Array` parameter types in custom messages.

The protocol currently assumes that one server serves one tool. There is currently no support in the protocol to share one server between different tools. Such a sharing would require additional protocol e.g. to lock a document to support concurrent editing.

### Basic JSON Structures

#### <a href="#uri" name="uri" class="anchor"> URI </a>

URI's are transferred as strings. The URI's format is defined in [https://tools.ietf.org/html/rfc3986](https://tools.ietf.org/html/rfc3986)

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

<div class="anchorHolder"><a href="#documentUri" name="documentUri" class="linkableAnchor"></a></div>

```typescript
type DocumentUri = string;
```

There is also a tagging interface for normal non document URIs. It maps to a `string` as well.

```typescript
type URI = string;
```

#### <a href="#regExp" name="regExp" class="anchor"> Regular Expressions </a>

Regular expression are a powerful tool and there are actual use cases for them in the language server protocol. However the downside with them is that almost every programming language has its own set of regular expression features so the specification can not simply refer to them as a regular expression. So the LSP uses a two step approach to support regular expressions:

* the client will announce which regular expression engine it will use. This will allow server that are written for a very specific client make full use of the regular expression capabilities of the client
* the specification will define a set of regular expression features that should be supported by a client. Instead of writing a new specification LSP will refer to the [ECMAScript Regular Expression specification](https://tc39.es/ecma262/#sec-regexp-regular-expression-objects) and remove features from it that are not necessary in the context of LSP or hard to implement for other clients.

_Client Capability_:

The following client capability is used to announce a client's regular expression engine

* property path (optional): `general.regularExpressions`
* property type: `RegularExpressionsClientCapabilities` defined as follows:

```typescript
/**
 * Client capabilities specific to regular expressions.
 */
export interface RegularExpressionsClientCapabilities {
	/**
	 * The engine's name.
	 */
	engine: string;

	/**
	 * The engine's version.
	 */
	version?: string;
}
```

The following table lists the well known engine values. Please note that the table should be driven by the community which integrates LSP into existing clients. It is not the goal of the spec to list all available regular expression engines.

Engine | Version | Documentation
------- | ------- | -------------
ECMAScript | `ES2020` | [ECMAScript 2020](https://tc39.es/ecma262/#sec-regexp-regular-expression-objects) & [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)

_Regular Expression Subset_:

The following features from the [ECMAScript 2020](https://tc39.es/ecma262/#sec-regexp-regular-expression-objects) regular expression specification are NOT mandatory for a client:

- *Assertions*: Lookahead assertion, Negative lookahead assertion, lookbehind assertion, negative lookbehind assertion.
- *Character classes*: matching control characters using caret notation (e.g. `\cX`) and matching UTF-16 code units (e.g. `\uhhhh`).
- *Group and ranges*: named capturing groups.
- *Unicode property escapes*: none of the features needs to be supported.

The only regular expression flag that a client needs to support is 'i' to specify a case insensitive search.

### <a href="#enumerations" name="enumerations" class="anchor"> Enumerations </a>

The protocol supports two kind of enumerations: (a) integer based enumerations and (b) strings based enumerations. Integer based enumerations usually start with `1`. The onces that don't are historical and they were kept to stay backwards compatible. If appropriate the value set of an enumeration is announced by the defining side (e.g. client or server) and transmitted to the other side during the initialize handshake. An example is the `CompletionItemKind` enumeration. It is announced by the client using the `textDocument.completion.completionItemKind` client property.

To support the evolution of enumerations the using side of an enumeration shouldn't fail on a enumeration value it doesn't know. It should simply ignore it as a value it can use and try to do its best to preserve the value on round trips. Lets look at the `CompletionItemKind` enumeration as an example again: if in a future version of the specification an additional completion item kind with the value `n` gets added and announced by a client a (older) server not knowing about the value should not fail but simply ignore the value as a usable item kind.

#### <a href="#textDocuments" name="textDocuments" class="anchor"> Text Documents </a>

The current protocol is tailored for textual documents whose content can be represented as a string. There is currently no support for binary documents. A position inside a document (see Position definition below) is expressed as a zero-based line and character offset. The offsets are based on a UTF-16 string representation. So a string of the form `a𐐀b` the character offset of the character `a` is 0, the character offset of `𐐀` is 1 and the character offset of b is 3 since `𐐀` is represented using two code units in UTF-16. To ensure that both client and server split the string into the same line representation the protocol specifies the following end-of-line sequences: '\n', '\r\n' and '\r'.

Positions are line end character agnostic. So you can not specify a position that denotes `\r|\n` or `\n|` where `|` represents the character offset.

```typescript
export const EOL: string[] = ['\n', '\r\n', '\r'];
```

#### <a href="#position" name="position" class="anchor"> Position </a>

Position in a text document expressed as zero-based line and zero-based character offset. A position is between two characters like an 'insert' cursor in an editor. Special values like for example `-1` to denote the end of a line are not supported.

```typescript
interface Position {
	/**
	 * Line position in a document (zero-based).
	 */
	line: uinteger;

	/**
	 * Character offset on a line in a document (zero-based). Assuming that
	 * the line is represented as a string, the `character` value represents
	 * the gap between the `character` and `character + 1`.
	 *
	 * If the character value is greater than the line length it defaults back
	 * to the line length.
	 */
	character: uinteger;
}
```
#### <a href="#range" name="range" class="anchor"> Range </a>

A range in a text document expressed as (zero-based) start and end positions. A range is comparable to a selection in an editor. Therefore the end position is exclusive. If you want to specify a range that contains a line including the line ending character(s) then use an end position denoting the start of the next line. For example:
```typescript
{
    start: { line: 5, character: 23 },
    end : { line: 6, character: 0 }
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

#### <a href="#location" name="location" class="anchor"> Location </a>

Represents a location inside a resource, such as a line inside a text file.
```typescript
interface Location {
	uri: DocumentUri;
	range: Range;
}
```

#### <a href="#locationLink" name="locationLink" class="anchor"> LocationLink </a>

Represents a link between a source and a target location.

```typescript
interface LocationLink {

	/**
	 * Span of the origin of this link.
	 *
	 * Used as the underlined span for mouse interaction. Defaults to the word
	 * range at the mouse position.
	 */
	originSelectionRange?: Range;

	/**
	 * The target resource identifier of this link.
	 */
	targetUri: DocumentUri;

	/**
	 * The full target range of this link. If the target for example is a symbol
	 * then target range is the range enclosing this symbol not including
	 * leading/trailing whitespace but everything else like comments. This
	 * information is typically used to highlight the range in the editor.
	 */
	targetRange: Range;

	/**
	 * The range that should be selected and revealed when this link is being
	 * followed, e.g the name of a function. Must be contained by the the
	 * `targetRange`. See also `DocumentSymbol#range`
	 */
	targetSelectionRange: Range;
}
```

#### <a href="#diagnostic" name="diagnostic" class="anchor"> Diagnostic </a>

Represents a diagnostic, such as a compiler error or warning. Diagnostic objects are only valid in the scope of a resource.

```typescript
export interface Diagnostic {
	/**
	 * The range at which the message applies.
	 */
	range: Range;

	/**
	 * The diagnostic's severity. Can be omitted. If omitted it is up to the
	 * client to interpret diagnostics as error, warning, info or hint.
	 */
	severity?: DiagnosticSeverity;

	/**
	 * The diagnostic's code, which might appear in the user interface.
	 */
	code?: integer | string;

	/**
	 * An optional property to describe the error code.
	 *
	 * @since 3.16.0
	 */
	codeDescription?: CodeDescription;

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
	 * Additional metadata about the diagnostic.
	 *
	 * @since 3.15.0
	 */
	tags?: DiagnosticTag[];

	/**
	 * An array of related diagnostic information, e.g. when symbol-names within
	 * a scope collide all definitions can be marked via this property.
	 */
	relatedInformation?: DiagnosticRelatedInformation[];

	/**
	 * A data entry field that is preserved between a
	 * `textDocument/publishDiagnostics` notification and
	 * `textDocument/codeAction` request.
	 *
	 * @since 3.16.0
	 */
	data?: unknown;
}
```

The protocol currently supports the following diagnostic severities and tags:

<div class="anchorHolder"><a href="#diagnosticSeverity" name="diagnosticSeverity" class="linkableAnchor"></a></div>

```typescript
export namespace DiagnosticSeverity {
	/**
	 * Reports an error.
	 */
	export const Error: 1 = 1;
	/**
	 * Reports a warning.
	 */
	export const Warning: 2 = 2;
	/**
	 * Reports an information.
	 */
	export const Information: 3 = 3;
	/**
	 * Reports a hint.
	 */
	export const Hint: 4 = 4;
}

export type DiagnosticSeverity = 1 | 2 | 3 | 4;
```

<div class="anchorHolder"><a href="#diagnosticTag" name="diagnosticTag" class="linkableAnchor"></a></div>

```typescript
/**
 * The diagnostic tags.
 *
 * @since 3.15.0
 */
export namespace DiagnosticTag {
	/**
	 * Unused or unnecessary code.
	 *
	 * Clients are allowed to render diagnostics with this tag faded out
	 * instead of having an error squiggle.
	 */
	export const Unnecessary: 1 = 1;
	/**
	 * Deprecated or obsolete code.
	 *
	 * Clients are allowed to rendered diagnostics with this tag strike through.
	 */
	export const Deprecated: 2 = 2;
}

export type DiagnosticTag = 1 | 2;
```

`DiagnosticRelatedInformation` is defined as follows:

<div class="anchorHolder"><a href="#diagnosticRelatedInformation" name="diagnosticRelatedInformation" class="linkableAnchor"></a></div>

```typescript
/**
 * Represents a related message and source code location for a diagnostic.
 * This should be used to point to code locations that cause or are related to
 * a diagnostics, e.g when duplicating a symbol in a scope.
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

`CodeDescription` is defined as follows:

<div class="anchorHolder"><a href="#codeDescription" name="codeDescription" class="linkableAnchor"></a></div>

```typescript
/**
 * Structure to capture a description for an error code.
 *
 * @since 3.16.0
 */
export interface CodeDescription {
	/**
	 * An URI to open with more information about the diagnostic error.
	 */
	href: URI;
}
```

#### <a href="#command" name="command" class="anchor"> Command </a>

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

#### <a href="#textEdit" name="textEdit" class="anchor"> TextEdit & AnnotatedTextEdit </a>

> New in version 3.16: Support for `AnnotatedTextEdit`.

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

Since 3.16.0 there is also the concept of an annotated text edit which supports to add an annotation to a text edit. The annotation can add information describing the change to the text edit.

<div class="anchorHolder"><a href="#changeAnnotation" name="changeAnnotation" class="linkableAnchor"></a></div>

```typescript
/**
 * Additional information that describes document changes.
 *
 * @since 3.16.0
 */
export interface ChangeAnnotation {
	/**
	 * A human-readable string describing the actual change. The string
	 * is rendered prominent in the user interface.
	 */
	label: string;

	/**
	 * A flag which indicates that user confirmation is needed
	 * before applying the change.
	 */
	needsConfirmation?: boolean;

	/**
	 * A human-readable string which is rendered less prominent in
	 * the user interface.
	 */
	description?: string;
}
```

Usually clients provide options to group the changes along the annotations they are associated with. To support this in the protocol an edit or resource operation refers to a change annotation using an identifier and not the change annotation literal directly. This allows servers to use the identical annotation across multiple edits or resource operations which then allows clients to group the operations under that change annotation. The actual change annotations together with their identifers are managed by the workspace edit via the new property `changeAnnotations`.

<div class="anchorHolder"><a href="#changeAnnotationIdentifier" name="changeAnnotationIdentifier" class="linkableAnchor"></a></div>

```typescript
/**
 * An identifier referring to a change annotation managed by a workspace
 * edit.
 *
 * @since 3.16.0.
 */
export type ChangeAnnotationIdentifier = string;
```

<div class="anchorHolder"><a href="#annotatedTextEdit" name="annotatedTextEdit" class="linkableAnchor"></a></div>

```typescript
/**
 * A special text edit with an additional change annotation.
 *
 * @since 3.16.0.
 */
export interface AnnotatedTextEdit extends TextEdit {
	/**
	 * The actual annotation identifier.
	 */
	annotationId: ChangeAnnotationIdentifier;
}
```

#### <a href="#textEditArray" name="textEditArray" class="anchor"> TextEdit[] </a>

Complex text manipulations are described with an array of `TextEdit`'s or `AnnotatedTextEdit`'s, representing a single change to the document.

All text edits ranges refer to positions in the document the are computed on. They therefore move a document from state S1 to S2 without describing any intermediate state. Text edits ranges must never overlap, that means no part of the original document must be manipulated by more than one edit. However, it is possible that multiple edits have the same start position: multiple inserts, or any number of inserts followed by a single remove or replace edit. If multiple inserts have the same position, the order in the array defines the order in which the inserted strings appear in the resulting text.

#### <a href="#textDocumentEdit" name="textDocumentEdit" class="anchor"> TextDocumentEdit </a>

> New in version 3.16: support for `AnnotatedTextEdit`. The support is guarded by the client capability `workspace.workspaceEdit.changeAnnotationSupport`. If a client doesn't signal the capability, servers shouldn't send `AnnotatedTextEdit` literals back to the client.

Describes textual changes on a single text document. The text document is referred to as a `OptionalVersionedTextDocumentIdentifier` to allow clients to check the text document version before an edit is applied. A `TextDocumentEdit` describes all changes on a version Si and after they are applied move the document to version Si+1. So the creator of a `TextDocumentEdit` doesn't need to sort the array of edits or do any kind of ordering. However the edits must be non overlapping.

```typescript
export interface TextDocumentEdit {
	/**
	 * The text document to change.
	 */
	textDocument: OptionalVersionedTextDocumentIdentifier;

	/**
	 * The edits to be applied.
	 *
	 * @since 3.16.0 - support for AnnotatedTextEdit. This is guarded by the
	 * client capability `workspace.workspaceEdit.changeAnnotationSupport`
	 */
	edits: (TextEdit | AnnotatedTextEdit)[];
}
```

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
	 * An optional annotation identifer describing the operation.
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
	 * An optional annotation identifer describing the operation.
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
	 * An optional annotation identifer describing the operation.
	 *
	 * @since 3.16.0
	 */
	annotationId?: ChangeAnnotationIdentifier;
}
```

#### <a href="#workspaceEdit" name="workspaceEdit" class="anchor"> WorkspaceEdit </a>

A workspace edit represents changes to many resources managed in the workspace. The edit should either provide `changes` or `documentChanges`. If the client can handle versioned document edits and if `documentChanges` are present, the latter are preferred over `changes`.

 Since version 3.13.0 a workspace edit can contain resource operations (create, delete or rename files and folders) as well. If resource operations are present clients need to execute the operations in the order in which they are provided. So a workspace edit for example can consist of the following two changes: (1) create file a.txt and (2) a text document edit which insert text into file a.txt. An invalid sequence (e.g. (1) delete file a.txt and (2) insert text into file a.txt) will cause failure of the operation. How the client recovers from the failure is described by the client capability: `workspace.workspaceEdit.failureHandling`

```typescript
export interface WorkspaceEdit {
	/**
	 * Holds changes to existing resources.
	 */
	changes?: { [uri: DocumentUri]: TextEdit[]; };

	/**
	 * Depending on the client capability
	 * `workspace.workspaceEdit.resourceOperations` document changes are either
	 * an array of `TextDocumentEdit`s to express changes to n different text
	 * documents where each text document edit addresses a specific version of
	 * a text document. Or it can contain above `TextDocumentEdit`s mixed with
	 * create, rename and delete file / folder operations.
	 *
	 * Whether a client supports versioned document edits is expressed via
	 * `workspace.workspaceEdit.documentChanges` client capability.
	 *
	 * If a client neither supports `documentChanges` nor
	 * `workspace.workspaceEdit.resourceOperations` then only plain `TextEdit`s
	 * using the `changes` property are supported.
	 */
	documentChanges?: (
		TextDocumentEdit[] |
		(TextDocumentEdit | CreateFile | RenameFile | DeleteFile)[]
	);

	/**
	 * A map of change annotations that can be referenced in
	 * `AnnotatedTextEdit`s or create, rename and delete file / folder
	 * operations.
	 *
	 * Whether clients honor this property depends on the client capability
	 * `workspace.changeAnnotationSupport`.
	 *
	 * @since 3.16.0
	 */
	changeAnnotations?: {
		[id: string /* ChangeAnnotationIdentifier */]: ChangeAnnotation;
	};
}
```

##### <a href="#workspaceEditClientCapabilities" name="workspaceEditClientCapabilities" class="anchor"> WorkspaceEditClientCapabilities </a>

> New in version 3.13: `ResourceOperationKind` and `FailureHandlingKind` and the client capability `workspace.workspaceEdit.resourceOperations` as well as `workspace.workspaceEdit.failureHandling`.


The capabilities of a workspace edit has evolved over the time. Clients can describe their support using the following client capability:

* property path (optional): `workspace.workspaceEdit`
* property type: `WorkspaceEditClientCapabilities` defined as follows:

```typescript
export interface WorkspaceEditClientCapabilities {
	/**
	 * The client supports versioned document changes in `WorkspaceEdit`s
	 */
	documentChanges?: boolean;

	/**
	 * The resource operations the client supports. Clients should at least
	 * support 'create', 'rename' and 'delete' files and folders.
	 *
	 * @since 3.13.0
	 */
	resourceOperations?: ResourceOperationKind[];

	/**
	 * The failure handling strategy of a client if applying the workspace edit
	 * fails.
	 *
	 * @since 3.13.0
	 */
	failureHandling?: FailureHandlingKind;

	/**
	 * Whether the client normalizes line endings to the client specific
	 * setting.
	 * If set to `true` the client will normalize line ending characters
	 * in a workspace edit to the client specific new line character(s).
	 *
	 * @since 3.16.0
	 */
	normalizesLineEndings?: boolean;

	/**
	 * Whether the client in general supports change annotations on text edits,
	 * create file, rename file and delete file changes.
	 *
	 * @since 3.16.0
	 */
	changeAnnotationSupport?: {
		/**
		 * Whether the client groups edits with equal labels into tree nodes,
		 * for instance all edits labelled with "Changes in Strings" would
		 * be a tree node.
		 */
		groupsOnLabel?: boolean;
	};
}
```

<div class="anchorHolder"><a href="#resourceOperationKind" name="resourceOperationKind" class="linkableAnchor"></a></div>

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
```

<div class="anchorHolder"><a href="#failureHandlingKind" name="failureHandlingKind" class="linkableAnchor"></a></div>

```typescript
export type FailureHandlingKind = 'abort' | 'transactional' | 'undo'
	| 'textOnlyTransactional';

export namespace FailureHandlingKind {

	/**
	 * Applying the workspace change is simply aborted if one of the changes
	 * provided fails. All operations executed before the failing operation
	 * stay executed.
	 */
	export const Abort: FailureHandlingKind = 'abort';

	/**
	 * All operations are executed transactional. That means they either all
	 * succeed or no changes at all are applied to the workspace.
	 */
	export const Transactional: FailureHandlingKind = 'transactional';


	/**
	 * If the workspace edit contains only textual file changes they are
	 * executed transactional. If resource changes (create, rename or delete
	 * file) are part of the change the failure handling strategy is abort.
	 */
	export const TextOnlyTransactional: FailureHandlingKind
		= 'textOnlyTransactional';

	/**
	 * The client tries to undo the operations already executed. But there is no
	 * guarantee that this is succeeding.
	 */
	export const Undo: FailureHandlingKind = 'undo';
}
```

#### <a href="#textDocumentIdentifier" name="textDocumentIdentifier" class="anchor"> TextDocumentIdentifier </a>

Text documents are identified using a URI. On the protocol level, URIs are passed as strings. The corresponding JSON structure looks like this:
```typescript
interface TextDocumentIdentifier {
	/**
	 * The text document's URI.
	 */
	uri: DocumentUri;
}
```

#### <a href="#textDocumentItem" name="textDocumentItem" class="anchor"> TextDocumentItem </a>

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
	version: integer;

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
Elixir | `elixir`
Erlang | `erlang`
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

#### <a href="#versionedTextDocumentIdentifier" name="versionedTextDocumentIdentifier" class="anchor"> VersionedTextDocumentIdentifier </a>

An identifier to denote a specific version of a text document. This information usually flows from the client to the server.

```typescript
interface VersionedTextDocumentIdentifier extends TextDocumentIdentifier {
	/**
	 * The version number of this document.
	 *
	 * The version number of a document will increase after each change,
	 * including undo/redo. The number doesn't need to be consecutive.
	 */
	version: integer;
}
```

An identifier which optionally denotes a specific version of a text document. This information usually flows from the server to the client.

<div class="anchorHolder"><a href="#optionalVersionedTextDocumentIdentifier" name="optionalVersionedTextDocumentIdentifier" class="linkableAnchor"></a></div>

```typescript
interface OptionalVersionedTextDocumentIdentifier extends TextDocumentIdentifier {
	/**
	 * The version number of this document. If an optional versioned text document
	 * identifier is sent from the server to the client and the file is not
	 * open in the editor (the server has not received an open notification
	 * before) the server can send `null` to indicate that the version is
	 * known and the content on disk is the master (as specified with document
	 * content ownership).
	 *
	 * The version number of a document will increase after each change,
	 * including undo/redo. The number doesn't need to be consecutive.
	 */
	version: integer | null;
}
```

#### <a href="#textDocumentPositionParams" name="textDocumentPositionParams" class="anchor"> TextDocumentPositionParams </a>

Was `TextDocumentPosition` in 1.0 with inlined parameters.

A parameter literal used in requests to pass a text document and a position inside that document. It is up to the client to decide how a selection is converted into a position when issuing a request for a text document. The client can for example honor or ignore the selection direction to make LSP request consistent with features implemented internally.

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

#### <a href="#documentFilter" name="documentFilter" class="anchor"> DocumentFilter </a>

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
	 * - `{}` to group sub patterns into an OR expression. (e.g. `**​/*.{ts,js}`
	 *   matches all TypeScript and JavaScript files)
	 * - `[]` to declare a range of characters to match in a path segment
	 *   (e.g., `example.[0-9]` to match on `example.0`, `example.1`, …)
	 * - `[!...]` to negate a range of characters to match in a path segment
	 *   (e.g., `example.[!0-9]` to match on `example.a`, `example.b`, but
	 *   not `example.0`)
	 */
	pattern?: string;
}
```

A document selector is the combination of one or more document filters.

<div class="anchorHolder"><a href="#documentSelector" name="documentSelector" class="linkableAnchor"></a></div>

```typescript
export type DocumentSelector = DocumentFilter[];
```

#### <a href="#staticRegistrationOptions" name="staticRegistrationOptions" class="anchor"> StaticRegistrationOptions </a>

Static registration options can be used to register a feature in the initialize result with a given server control ID to be able to un-register the feature later on.

```typescript
/**
 * Static registration options to be returned in the initialize request.
 */
export interface StaticRegistrationOptions {
	/**
	 * The id used to register the request. The id can be used to deregister
	 * the request again. See also Registration#id.
	 */
	id?: string;
}
```

#### <a href="#textDocumentRegistrationOptions" name="textDocumentRegistrationOptions" class="anchor"> TextDocumentRegistrationOptions </a>

Options to dynamically register for requests for a set of text documents.

```typescript
/**
 * General text document registration options.
 */
export interface TextDocumentRegistrationOptions {
	/**
	 * A document selector to identify the scope of the registration. If set to
	 * null the document selector provided on the client side will be used.
	 */
	documentSelector: DocumentSelector | null;
}
```

#### <a href="#markupContent" name="markupContent" class="anchor"> MarkupContent </a>

 A `MarkupContent` literal represents a string value which content can be represented in different formats. Currently `plaintext` and `markdown` are supported formats. A `MarkupContent` is usually used in documentation properties of result literals like `CompletionItem` or `SignatureInformation`. If the format is `markdown` the content should follow the [GitHub Flavored Markdown Specification](https://github.github.com/gfm/).

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
```

<div class="anchorHolder"><a href="#markupContentDefinition" name="markupContentInnerDefinition" class="linkableAnchor"></a></div>

```typescript
/**
 * A `MarkupContent` literal represents a string value which content is
 * interpreted base on its kind flag. Currently the protocol supports
 * `plaintext` and `markdown` as markup kinds.
 *
 * If the kind is `markdown` then the value can contain fenced code blocks like
 * in GitHub issues.
 *
 * Here is an example how such a string can be constructed using
 * JavaScript / TypeScript:
 * ```typescript
 * let markdown: MarkdownContent = {
 * 	kind: MarkupKind.Markdown,
 * 	value: [
 * 		'# Header',
 * 		'Some text',
 * 		'```typescript',
 * 		'someCode();',
 * 		'```'
 * 	].join('\n')
 * };
 * ```
 *
 * *Please Note* that clients might sanitize the return markdown. A client could
 * decide to remove HTML from the markdown to avoid script execution.
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

In addition clients should signal the markdown parser they are using via the client capability `general.markdown` introduced in version 3.16.0 defined as follows:

<div class="anchorHolder"><a href="#markdownClientCapabilities" name="markdownClientCapabilities" class="linkableAnchor"></a></div>

 ```typescript
/**
 * Client capabilities specific to the used markdown parser.
 *
 * @since 3.16.0
 */
export interface MarkdownClientCapabilities {
	/**
	 * The name of the parser.
	 */
	parser: string;

	/**
	 * The version of the parser.
	 */
	version?: string;
}
 ```

Known markdown parsers used by clients right now are:

Parser          | Version | Documentation
--------------- | ------- | -------------
marked          | 1.1.0   | [Marked Documentation](https://marked.js.org/)
Python-Markdown | 3.2.2   | [Python-Markdown Documentation](https://python-markdown.github.io)


#### <a href="#workDoneProgress" name="workDoneProgress" class="anchor"> Work Done Progress </a>

> *Since version 3.15.0*

Work done progress is reported using the generic [`$/progress`](#progress) notification. The value payload of a work done progress notification can be of three different forms.

##### <a href="#workDoneProgressBegin" name="workDoneProgressBegin" class="anchor"> Work Done Progress Begin </a>

To start progress reporting a `$/progress` notification with the following payload must be sent:

```typescript
export interface WorkDoneProgressBegin {

	kind: 'begin';

	/**
	 * Mandatory title of the progress operation. Used to briefly inform about
	 * the kind of operation being performed.
	 *
	 * Examples: "Indexing" or "Linking dependencies".
	 */
	title: string;

	/**
	 * Controls if a cancel button should show to allow the user to cancel the
	 * long running operation. Clients that don't support cancellation are
	 * allowed to ignore the setting.
	 */
	cancellable?: boolean;

	/**
	 * Optional, more detailed associated progress message. Contains
	 * complementary information to the `title`.
	 *
	 * Examples: "3/25 files", "project/src/module2", "node_modules/some_dep".
	 * If unset, the previous progress message (if any) is still valid.
	 */
	message?: string;

	/**
	 * Optional progress percentage to display (value 100 is considered 100%).
	 * If not provided infinite progress is assumed and clients are allowed
	 * to ignore the `percentage` value in subsequent in report notifications.
	 *
	 * The value should be steadily rising. Clients are free to ignore values
	 * that are not following this rule. The value range is [0, 100]
	 */
	percentage?: uinteger;
}
```

##### <a href="#workDoneProgressReport" name="workDoneProgressReport" class="anchor"> Work Done Progress Report </a>

Reporting progress is done using the following payload:

```typescript
export interface WorkDoneProgressReport {

	kind: 'report';

	/**
	 * Controls enablement state of a cancel button. This property is only valid
	 * if a cancel button got requested in the `WorkDoneProgressBegin` payload.
	 *
	 * Clients that don't support cancellation or don't support control the
	 * button's enablement state are allowed to ignore the setting.
	 */
	cancellable?: boolean;

	/**
	 * Optional, more detailed associated progress message. Contains
	 * complementary information to the `title`.
	 *
	 * Examples: "3/25 files", "project/src/module2", "node_modules/some_dep".
	 * If unset, the previous progress message (if any) is still valid.
	 */
	message?: string;

	/**
	 * Optional progress percentage to display (value 100 is considered 100%).
	 * If not provided infinite progress is assumed and clients are allowed
	 * to ignore the `percentage` value in subsequent in report notifications.
	 *
	 * The value should be steadily rising. Clients are free to ignore values
	 * that are not following this rule. The value range is [0, 100]
	 */
	percentage?: uinteger;
}
```

##### <a href="#workDoneProgressEnd" name="workDoneProgressEnd" class="anchor"> Work Done Progress End </a>

Signaling the end of a progress reporting is done using the following payload:

```typescript
export interface WorkDoneProgressEnd {

	kind: 'end';

	/**
	 * Optional, a final message indicating to for example indicate the outcome
	 * of the operation.
	 */
	message?: string;
}
```

##### <a href="#initiatingWorkDoneProgress" name="initiatingWorkDoneProgress" class="anchor"> Initiating Work Done Progress </a>

Work Done progress can be initiated in two different ways:

1. by the sender of a request (mostly clients) using the predefined `workDoneToken` property in the requests parameter literal. The document will refer to this kind of progress as client initiated progress.
1. by a server using the request `window/workDoneProgress/create`. The document will refer to this kind of progress as server initiated progress.

###### <a href="#clientInitiatedProgress" name="clientInitiatedProgress" class="anchor">Client Initiated Progress </a>

Consider a client sending a `textDocument/reference` request to a server and the client accepts work done progress reporting on that request. To signal this to the server the client would add a `workDoneToken` property to the reference request parameters. Something like this:

```json
{
	"textDocument": {
		"uri": "file:///folder/file.ts"
	},
	"position": {
		"line": 9,
		"character": 5
	},
	"context": {
		"includeDeclaration": true
	},
	// The token used to report work done progress.
	"workDoneToken": "1d546990-40a3-4b77-b134-46622995f6ae"
}
```

The corresponding type definition for the parameter property looks like this:


<div class="anchorHolder"><a href="#workDoneProgressParams" name="workDoneProgressParams" class="linkableAnchor"></a></div>

```typescript
export interface WorkDoneProgressParams {
	/**
	 * An optional token that a server can use to report work done progress.
	 */
	workDoneToken?: ProgressToken;
}
```

A server uses the `workDoneToken` to report progress for the specific `textDocument/reference`. For the above request the `$/progress` notification params look like this:

```json
{
	"token": "1d546990-40a3-4b77-b134-46622995f6ae",
	"value": {
		"kind": "begin",
		"title": "Finding references for A#foo",
		"cancellable": false,
		"message": "Processing file X.ts",
		"percentage": 0
	}
}
```

The token received via the `workDoneToken` property in a request's param literal is only valid as long as the request has not send a response back.

There is no specific client capability signaling whether a client will send a progress token per request. The reason for this is that this is in many clients not a static aspect and might even change for every request instance for the same request type. So the capability is signal on every request instance by the presence of a `workDoneToken` property.

To avoid that clients set up a progress monitor user interface before sending a request but the server doesn't actually report any progress a server needs to signal general work done progress reporting support in the corresponding server capability. For the above find references example a server would signal such a support by setting the `referencesProvider` property in the server capabilities as follows:

```json
{
	"referencesProvider": {
		"workDoneProgress": true
	}
}
```

The corresponding type definition for the server capability looks like this:

<div class="anchorHolder"><a href="#workDoneProgressOptions" name="workDoneProgressOptions" class="linkableAnchor"></a></div>

```typescript
export interface WorkDoneProgressOptions {
	workDoneProgress?: boolean;
}
```
###### <a href="#serverInitiatedProgress" name="serverInitiatedProgress" class="anchor">Server Initiated Progress </a>

Servers can also initiate progress reporting using the `window/workDoneProgress/create` request. This is useful if the server needs to report progress outside of a request (for example the server needs to re-index a database). The returned token can then be used to report progress using the same notifications used as for client initiated progress. A token obtained using the create request should only be used once (e.g. only one begin, many report and one end notification should be sent to it).

To keep the protocol backwards compatible servers are only allowed to use `window/workDoneProgress/create` request if the client signals corresponding support using the client capability `window.workDoneProgress` which is defined as follows:

```typescript
	/**
	 * Window specific client capabilities.
	 */
	window?: {
		/**
		 * Whether client supports server initiated progress using the
		 * `window/workDoneProgress/create` request.
		 */
		workDoneProgress?: boolean;
	};
```

#### <a href="#partialResults" name="partialResults" class="anchor"> Partial Result Progress </a>

> *Since version 3.15.0*

Partial results are also reported using the generic [`$/progress`](#progress) notification. The value payload of a partial result progress notification is in most cases the same as the final result. For example the `workspace/symbol` request has `SymbolInformation[]` as the result type. Partial result is therefore also of type `SymbolInformation[]`. Whether a client accepts partial result notifications for a request is signaled by adding a `partialResultToken` to the request parameter. For example, a `textDocument/reference` request that supports both work done and partial result progress might look like this:

```json
{
	"textDocument": {
		"uri": "file:///folder/file.ts"
	},
	"position": {
		"line": 9,
		"character": 5
	},
	"context": {
		"includeDeclaration": true
	},
	// The token used to report work done progress.
	"workDoneToken": "1d546990-40a3-4b77-b134-46622995f6ae",
	// The token used to report partial result progress.
	"partialResultToken": "5f6f349e-4f81-4a3b-afff-ee04bff96804"
}
```

The `partialResultToken` is then used to report partial results for the find references request.

If a server reports partial result via a corresponding `$/progress`, the whole result must be reported using n `$/progress` notifications. The final response has to be empty in terms of result values. This avoids confusion about how the final result should be interpreted, e.g. as another partial result or as a replacing result.

If the response errors the provided partial results should be treated as follows:

- the `code` equals to `RequestCancelled`: the client is free to use the provided results but should make clear that the request got canceled and may be incomplete.
- in all other cases the provided partial results shouldn't be used.

#### <a href="#partialResultParams" name="partialResultParams" class="anchor"> PartialResultParams </a>

A parameter literal used to pass a partial result token.

```typescript
export interface PartialResultParams {
	/**
	 * An optional token that a server can use to report partial results (e.g.
	 * streaming) to the client.
	 */
	partialResultToken?: ProgressToken;
}
```

#### <a href="#traceValue" name="traceValue" class="anchor"> TraceValue </a>

A `TraceValue` represents the level of verbosity with which the server systematically reports its execution trace using [$/logTrace](#logTrace) notifications.
The initial trace value is set by the client at initialization and can be modified later using the [$/setTrace](#setTrace) notification.

```typescript
export type TraceValue = 'off' | 'messages' | 'verbose';
```

### Actual Protocol

This section documents the actual language server protocol. It uses the following format:

* a header describing the request
* an optional _Client capability_ section describing the client capability of the request. This includes the client capabilities property path and JSON structure.
* an optional _Server Capability_ section describing the server capability of the request. This includes the server capabilities property path and JSON structure. Clients should ignore server capabilities they don't understand (e.g. the initialize request shouldn't fail in this case).
* an optional _Registration Options_ section describing the registration option if the request or notification supports dynamic capability registration. See the [register](#client_registerCapability) and [unregister](#client_unregisterCapability) request for how this works in detail.
* a _Request_ section describing the format of the request sent. The method is a string identifying the request the params are documented using a TypeScript interface. It is also documented whether the request supports work done progress and partial result progress.
* a _Response_ section describing the format of the response. The result item describes the returned data in case of a success. The optional partial result item describes the returned data of a partial result notification. The error.data describes the returned data in case of an error. Please remember that in case of a failure the response already contains an error.code and an error.message field. These fields are only specified if the protocol forces the use of certain error codes or messages. In cases where the server can decide on these values freely they aren't listed here.

#### Request, Notification and Response ordering

Responses to requests should be sent in roughly the same order as the requests appear on the server or client side. So for example if a server receives a `textDocument/completion` request and then a `textDocument/signatureHelp` request it will usually first return the response for the `textDocument/completion` and then the response for `textDocument/signatureHelp`.

However, the server may decide to use a parallel execution strategy and may wish to return responses in a different order than the requests were received. The server may do so as long as this reordering doesn't affect the correctness of the responses. For example, reordering the result of `textDocument/completion` and `textDocument/signatureHelp` is allowed, as these each of these requests usually won't affect the output of the other. On the other hand, the server most likely should not reorder `textDocument/definition` and `textDocument/rename` requests, since the executing the latter may affect the result of the former.

#### Server lifetime

The current protocol specification defines that the lifetime of a server is managed by the client (e.g. a tool like VS Code or Emacs). It is up to the client to decide when to start (process-wise) and when to shutdown a server.

#### <a href="#initialize" name="initialize" class="anchor">Initialize Request (:leftwards_arrow_with_hook:)</a>

The initialize request is sent as the first request from the client to the server. If the server receives a request or notification before the `initialize` request it should act as follows:

* For a request the response should be an error with `code: -32002`. The message can be picked by the server.
* Notifications should be dropped, except for the exit notification. This will allow the exit of a server without an initialize request.

Until the server has responded to the `initialize` request with an `InitializeResult`, the client must not send any additional requests or notifications to the server. In addition the server is not allowed to send any requests or notifications to the client until it has responded with an `InitializeResult`, with the exception that during the `initialize` request the server is allowed to send the notifications `window/showMessage`, `window/logMessage` and `telemetry/event` as well as the `window/showMessageRequest` request to the client. In case the client sets up a progress token in the initialize params (e.g. property `workDoneToken`) the server is also allowed to use that token (and only that token) using the `$/progress` notification sent from the server to the client.

The `initialize` request may only be sent once.

_Request_:
* method: 'initialize'
* params: `InitializeParams` defined as follows:

<div class="anchorHolder"><a href="#initializeParams" name="initializeParams" class="linkableAnchor"></a></div>

```typescript
interface InitializeParams extends WorkDoneProgressParams {
	/**
	 * The process Id of the parent process that started the server. Is null if
	 * the process has not been started by another process. If the parent
	 * process is not alive then the server should exit (see exit notification)
	 * its process.
	 */
	processId: integer | null;

	/**
	 * Information about the client
	 *
	 * @since 3.15.0
	 */
	clientInfo?: {
		/**
		 * The name of the client as defined by the client.
		 */
		name: string;

		/**
		 * The client's version as defined by the client.
		 */
		version?: string;
	};

	/**
	 * The locale the client is currently showing the user interface
	 * in. This must not necessarily be the locale of the operating
	 * system.
	 *
	 * Uses IETF language tags as the value's syntax
	 * (See https://en.wikipedia.org/wiki/IETF_language_tag)
	 *
	 * @since 3.16.0
	 */
	locale?: string;

	/**
	 * The rootPath of the workspace. Is null
	 * if no folder is open.
	 *
	 * @deprecated in favour of `rootUri`.
	 */
	rootPath?: string | null;

	/**
	 * The rootUri of the workspace. Is null if no
	 * folder is open. If both `rootPath` and `rootUri` are set
	 * `rootUri` wins.
	 *
	 * @deprecated in favour of `workspaceFolders`
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
	trace?: TraceValue;

	/**
	 * The workspace folders configured in the client when the server starts.
	 * This property is only available if the client supports workspace folders.
	 * It can be `null` if the client supports workspace folders but none are
	 * configured.
	 *
	 * @since 3.6.0
	 */
	workspaceFolders?: WorkspaceFolder[] | null;
}
```
Where `ClientCapabilities` and `TextDocumentClientCapabilities` are defined as follows:


##### TextDocumentClientCapabilities

`TextDocumentClientCapabilities` define capabilities the editor / tool provides on text documents.

<div class="anchorHolder"><a href="#textDocumentClientCapabilities" name="textDocumentClientCapabilities" class="linkableAnchor"></a></div>

```typescript
/**
 * Text document specific client capabilities.
 */
export interface TextDocumentClientCapabilities {

	synchronization?: TextDocumentSyncClientCapabilities;

	/**
	 * Capabilities specific to the `textDocument/completion` request.
	 */
	completion?: CompletionClientCapabilities;

	/**
	 * Capabilities specific to the `textDocument/hover` request.
	 */
	hover?: HoverClientCapabilities;

	/**
	 * Capabilities specific to the `textDocument/signatureHelp` request.
	 */
	signatureHelp?: SignatureHelpClientCapabilities;

	/**
	 * Capabilities specific to the `textDocument/declaration` request.
	 *
	 * @since 3.14.0
	 */
	declaration?: DeclarationClientCapabilities;

	/**
	 * Capabilities specific to the `textDocument/definition` request.
	 */
	definition?: DefinitionClientCapabilities;

	/**
	 * Capabilities specific to the `textDocument/typeDefinition` request.
	 *
	 * @since 3.6.0
	 */
	typeDefinition?: TypeDefinitionClientCapabilities;

	/**
	 * Capabilities specific to the `textDocument/implementation` request.
	 *
	 * @since 3.6.0
	 */
	implementation?: ImplementationClientCapabilities;

	/**
	 * Capabilities specific to the `textDocument/references` request.
	 */
	references?: ReferenceClientCapabilities;

	/**
	 * Capabilities specific to the `textDocument/documentHighlight` request.
	 */
	documentHighlight?: DocumentHighlightClientCapabilities;

	/**
	 * Capabilities specific to the `textDocument/documentSymbol` request.
	 */
	documentSymbol?: DocumentSymbolClientCapabilities;

	/**
	 * Capabilities specific to the `textDocument/codeAction` request.
	 */
	codeAction?: CodeActionClientCapabilities;

	/**
	 * Capabilities specific to the `textDocument/codeLens` request.
	 */
	codeLens?: CodeLensClientCapabilities;

	/**
	 * Capabilities specific to the `textDocument/documentLink` request.
	 */
	documentLink?: DocumentLinkClientCapabilities;

	/**
	 * Capabilities specific to the `textDocument/documentColor` and the
	 * `textDocument/colorPresentation` request.
	 *
	 * @since 3.6.0
	 */
	colorProvider?: DocumentColorClientCapabilities;

	/**
	 * Capabilities specific to the `textDocument/formatting` request.
	 */
	formatting?: DocumentFormattingClientCapabilities;

	/**
	 * Capabilities specific to the `textDocument/rangeFormatting` request.
	 */
	rangeFormatting?: DocumentRangeFormattingClientCapabilities;

	/** request.
	 * Capabilities specific to the `textDocument/onTypeFormatting` request.
	 */
	onTypeFormatting?: DocumentOnTypeFormattingClientCapabilities;

	/**
	 * Capabilities specific to the `textDocument/rename` request.
	 */
	rename?: RenameClientCapabilities;

	/**
	 * Capabilities specific to the `textDocument/publishDiagnostics`
	 * notification.
	 */
	publishDiagnostics?: PublishDiagnosticsClientCapabilities;

	/**
	 * Capabilities specific to the `textDocument/foldingRange` request.
	 *
	 * @since 3.10.0
	 */
	foldingRange?: FoldingRangeClientCapabilities;

	/**
	 * Capabilities specific to the `textDocument/selectionRange` request.
	 *
	 * @since 3.15.0
	 */
	selectionRange?: SelectionRangeClientCapabilities;

	/**
	 * Capabilities specific to the `textDocument/linkedEditingRange` request.
	 *
	 * @since 3.16.0
	 */
	linkedEditingRange?: LinkedEditingRangeClientCapabilities;

	/**
	 * Capabilities specific to the various call hierarchy requests.
	 *
	 * @since 3.16.0
	 */
	callHierarchy?: CallHierarchyClientCapabilities;

	/**
	 * Capabilities specific to the various semantic token requests.
	 *
	 * @since 3.16.0
	 */
	semanticTokens?: SemanticTokensClientCapabilities;

	/**
	 * Capabilities specific to the `textDocument/moniker` request.
	 *
	 * @since 3.16.0
	 */
	moniker?: MonikerClientCapabilities;
}
```

`ClientCapabilities` define capabilities for dynamic registration, workspace and text document features the client supports. The `experimental` can be used to pass experimental capabilities under development. For future compatibility a `ClientCapabilities` object literal can have more properties set than currently defined. Servers receiving a `ClientCapabilities` object literal with unknown properties should ignore these properties. A missing property should be interpreted as an absence of the capability. If a missing property normally defines sub properties, all missing sub properties should be interpreted as an absence of the corresponding capability.

Client capabilities got introduced with version 3.0 of the protocol. They therefore only describe capabilities that got introduced in 3.x or later. Capabilities that existed in the 2.x version of the protocol are still mandatory for clients. Clients cannot opt out of providing them. So even if a client omits the `ClientCapabilities.textDocument.synchronization` it is still required that the client provides text document synchronization (e.g. open, changed and close notifications).

<div class="anchorHolder"><a href="#clientCapabilities" name="clientCapabilities" class="linkableAnchor"></a></div>

```typescript
interface ClientCapabilities {
	/**
	 * Workspace specific client capabilities.
	 */
	workspace?: {
		/**
		 * The client supports applying batch edits
		 * to the workspace by supporting the request
		 * 'workspace/applyEdit'
		 */
		applyEdit?: boolean;

		/**
		 * Capabilities specific to `WorkspaceEdit`s
		 */
		workspaceEdit?: WorkspaceEditClientCapabilities;

		/**
		 * Capabilities specific to the `workspace/didChangeConfiguration`
		 * notification.
		 */
		didChangeConfiguration?: DidChangeConfigurationClientCapabilities;

		/**
		 * Capabilities specific to the `workspace/didChangeWatchedFiles`
		 * notification.
		 */
		didChangeWatchedFiles?: DidChangeWatchedFilesClientCapabilities;

		/**
		 * Capabilities specific to the `workspace/symbol` request.
		 */
		symbol?: WorkspaceSymbolClientCapabilities;

		/**
		 * Capabilities specific to the `workspace/executeCommand` request.
		 */
		executeCommand?: ExecuteCommandClientCapabilities;

		/**
		 * The client has support for workspace folders.
		 *
		 * @since 3.6.0
		 */
		workspaceFolders?: boolean;

		/**
		 * The client supports `workspace/configuration` requests.
		 *
		 * @since 3.6.0
		 */
		configuration?: boolean;

		/**
		 * Capabilities specific to the semantic token requests scoped to the
		 * workspace.
		 *
		 * @since 3.16.0
		 */
		 semanticTokens?: SemanticTokensWorkspaceClientCapabilities;

		/**
		 * Capabilities specific to the code lens requests scoped to the
		 * workspace.
		 *
		 * @since 3.16.0
		 */
		codeLens?: CodeLensWorkspaceClientCapabilities;

		/**
		 * The client has support for file requests/notifications.
		 *
		 * @since 3.16.0
		 */
		fileOperations?: {
			/**
			 * Whether the client supports dynamic registration for file
			 * requests/notifications.
			 */
			dynamicRegistration?: boolean;

			/**
			 * The client has support for sending didCreateFiles notifications.
			 */
			didCreate?: boolean;

			/**
			 * The client has support for sending willCreateFiles requests.
			 */
			willCreate?: boolean;

			/**
			 * The client has support for sending didRenameFiles notifications.
			 */
			didRename?: boolean;

			/**
			 * The client has support for sending willRenameFiles requests.
			 */
			willRename?: boolean;

			/**
			 * The client has support for sending didDeleteFiles notifications.
			 */
			didDelete?: boolean;

			/**
			 * The client has support for sending willDeleteFiles requests.
			 */
			willDelete?: boolean;
		};
	};

	/**
	 * Text document specific client capabilities.
	 */
	textDocument?: TextDocumentClientCapabilities;

	/**
	 * Window specific client capabilities.
	 */
	window?: {
		/**
		 * Whether client supports handling progress notifications. If set
		 * servers are allowed to report in `workDoneProgress` property in the
		 * request specific server capabilities.
		 *
		 * @since 3.15.0
		 */
		workDoneProgress?: boolean;

		/**
		 * Capabilities specific to the showMessage request
		 *
		 * @since 3.16.0
		 */
		showMessage?: ShowMessageRequestClientCapabilities;

		/**
		 * Client capabilities for the show document request.
		 *
		 * @since 3.16.0
		 */
		showDocument?: ShowDocumentClientCapabilities;
	};

	/**
	 * General client capabilities.
	 *
	 * @since 3.16.0
	 */
	general?: {
		/**
		 * Client capability that signals how the client
		 * handles stale requests (e.g. a request
		 * for which the client will not process the response
		 * anymore since the information is outdated).
		 *
		 * @since 3.17.0
		 */
		staleRequestSupport?: {
			/**
			 * The client will actively cancel the request.
			 */
			cancel: boolean;

			/**
			 * The list of requests for which the client
			 * will retry the request if it receives a
			 * response with error code `ContentModified``
			 */
			 retryOnContentModified: string[];
		}

		/**
		 * Client capabilities specific to regular expressions.
		 *
		 * @since 3.16.0
		 */
		regularExpressions?: RegularExpressionsClientCapabilities;

		/**
		 * Client capabilities specific to the client's markdown parser.
		 *
		 * @since 3.16.0
		 */
		markdown?: MarkdownClientCapabilities;
	};

	/**
	 * Experimental client capabilities.
	 */
	experimental?: any;
}
```

_Response_:
* result: `InitializeResult` defined as follows:

<div class="anchorHolder"><a href="#initializeResult" name="initializeResult" class="linkableAnchor"></a></div>

```typescript
interface InitializeResult {
	/**
	 * The capabilities the language server provides.
	 */
	capabilities: ServerCapabilities;

	/**
	 * Information about the server.
	 *
	 * @since 3.15.0
	 */
	serverInfo?: {
		/**
		 * The name of the server as defined by the server.
		 */
		name: string;

		/**
		 * The server's version as defined by the server.
		 */
		version?: string;
	};
}
```
* error.code:

<div class="anchorHolder"><a href="#initializeError" name="initializeError" class="linkableAnchor"></a></div>

```typescript
/**
 * Known error codes for an `InitializeError`;
 */
export namespace InitializeError {
	/**
	 * If the protocol version provided by the client can't be handled by the
	 * server.
	 *
	 * @deprecated This initialize error got replaced by client capabilities.
	 * There is no version handshake in version 3.0x
	 */
	export const unknownProtocolVersion: 1 = 1;
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

<div class="anchorHolder"><a href="#serverCapabilities" name="serverCapabilities" class="linkableAnchor"></a></div>

```typescript
interface ServerCapabilities {
	/**
	 * Defines how text documents are synced. Is either a detailed structure
	 * defining each notification or for backwards compatibility the
	 * TextDocumentSyncKind number. If omitted it defaults to
	 * `TextDocumentSyncKind.None`.
	 */
	textDocumentSync?: TextDocumentSyncOptions | TextDocumentSyncKind;

	/**
	 * The server provides completion support.
	 */
	completionProvider?: CompletionOptions;

	/**
	 * The server provides hover support.
	 */
	hoverProvider?: boolean | HoverOptions;

	/**
	 * The server provides signature help support.
	 */
	signatureHelpProvider?: SignatureHelpOptions;

	/**
	 * The server provides go to declaration support.
	 *
	 * @since 3.14.0
	 */
	declarationProvider?: boolean | DeclarationOptions
		| DeclarationRegistrationOptions;

	/**
	 * The server provides goto definition support.
	 */
	definitionProvider?: boolean | DefinitionOptions;

	/**
	 * The server provides goto type definition support.
	 *
	 * @since 3.6.0
	 */
	typeDefinitionProvider?: boolean | TypeDefinitionOptions
		| TypeDefinitionRegistrationOptions;

	/**
	 * The server provides goto implementation support.
	 *
	 * @since 3.6.0
	 */
	implementationProvider?: boolean | ImplementationOptions
		| ImplementationRegistrationOptions;

	/**
	 * The server provides find references support.
	 */
	referencesProvider?: boolean | ReferenceOptions;

	/**
	 * The server provides document highlight support.
	 */
	documentHighlightProvider?: boolean | DocumentHighlightOptions;

	/**
	 * The server provides document symbol support.
	 */
	documentSymbolProvider?: boolean | DocumentSymbolOptions;

	/**
	 * The server provides code actions. The `CodeActionOptions` return type is
	 * only valid if the client signals code action literal support via the
	 * property `textDocument.codeAction.codeActionLiteralSupport`.
	 */
	codeActionProvider?: boolean | CodeActionOptions;

	/**
	 * The server provides code lens.
	 */
	codeLensProvider?: CodeLensOptions;

	/**
	 * The server provides document link support.
	 */
	documentLinkProvider?: DocumentLinkOptions;

	/**
	 * The server provides color provider support.
	 *
	 * @since 3.6.0
	 */
	colorProvider?: boolean | DocumentColorOptions
		| DocumentColorRegistrationOptions;

	/**
	 * The server provides document formatting.
	 */
	documentFormattingProvider?: boolean | DocumentFormattingOptions;

	/**
	 * The server provides document range formatting.
	 */
	documentRangeFormattingProvider?: boolean | DocumentRangeFormattingOptions;

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
	 * The server provides folding provider support.
	 *
	 * @since 3.10.0
	 */
	foldingRangeProvider?: boolean | FoldingRangeOptions
		| FoldingRangeRegistrationOptions;

	/**
	 * The server provides execute command support.
	 */
	executeCommandProvider?: ExecuteCommandOptions;

	/**
	 * The server provides selection range support.
	 *
	 * @since 3.15.0
	 */
	selectionRangeProvider?: boolean | SelectionRangeOptions
		| SelectionRangeRegistrationOptions;

	/**
	 * The server provides linked editing range support.
	 *
	 * @since 3.16.0
	 */
	linkedEditingRangeProvider?: boolean | LinkedEditingRangeOptions
		| LinkedEditingRangeRegistrationOptions;

	/**
	 * The server provides call hierarchy support.
	 *
	 * @since 3.16.0
	 */
	callHierarchyProvider?: boolean | CallHierarchyOptions
		| CallHierarchyRegistrationOptions;

	/**
	 * The server provides semantic tokens support.
	 *
	 * @since 3.16.0
	 */
	semanticTokensProvider?: SemanticTokensOptions
		| SemanticTokensRegistrationOptions;

	/**
	 * Whether server provides moniker support.
	 *
	 * @since 3.16.0
	 */
	monikerProvider?: boolean | MonikerOptions | MonikerRegistrationOptions;

	/**
	 * The server provides workspace symbol support.
	 */
	workspaceSymbolProvider?: boolean | WorkspaceSymbolOptions;

	/**
	 * Workspace specific server capabilities
	 */
	workspace?: {
		/**
		 * The server supports workspace folder.
		 *
		 * @since 3.6.0
		 */
		workspaceFolders?: WorkspaceFoldersServerCapabilities;

		/**
		 * The server is interested in file notifications/requests.
		 *
		 * @since 3.16.0
		 */
		fileOperations?: {
			/**
			 * The server is interested in receiving didCreateFiles
			 * notifications.
			 */
			didCreate?: FileOperationRegistrationOptions;

			/**
			 * The server is interested in receiving willCreateFiles requests.
			 */
			willCreate?: FileOperationRegistrationOptions;

			/**
			 * The server is interested in receiving didRenameFiles
			 * notifications.
			 */
			didRename?: FileOperationRegistrationOptions;

			/**
			 * The server is interested in receiving willRenameFiles requests.
			 */
			willRename?: FileOperationRegistrationOptions;

			/**
			 * The server is interested in receiving didDeleteFiles file
			 * notifications.
			 */
			didDelete?: FileOperationRegistrationOptions;

			/**
			 * The server is interested in receiving willDeleteFiles file
			 * requests.
			 */
			willDelete?: FileOperationRegistrationOptions;
		};
	};

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

The shutdown request is sent from the client to the server. It asks the server to shut down, but to not exit (otherwise the response might not be delivered correctly to the client). There is a separate exit notification that asks the server to exit. Clients must not send any notifications other than `exit` or requests to a server to which they have sent a shutdown request. Clients should also wait with sending the `exit` notification until they have received a response from the `shutdown` request.

If a server receives requests after a shutdown request those requests should error with `InvalidRequest`.

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

#### <a href="#logTrace" name="logTrace" class="anchor">LogTrace Notification (:arrow_left:)</a>

A notification to log the trace of the server's execution.
The amount and content of these notifications depends on the current `trace` configuration.
If `trace` is `'off'`, the server should not send any `logTrace` notification.
If `trace` is `'messages'`, the server should not add the `'verbose'` field in the `LogTraceParams`.

`$/logTrace` should be used for systematic trace reporting. For single debugging messages, the server should send [`window/logMessage`](#window_logMessage) notifications.


_Notification_:
* method: '$/logTrace'
* params: `LogTraceParams` defined as follows:

```typescript
interface LogTraceParams {
	/**
	 * The message to be logged.
	 */
	message: string;
	/**
	 * Additional information that can be computed if the `trace` configuration
	 * is set to `'verbose'`
	 */
	verbose?: string;
}
```

#### <a href="#setTrace" name="setTrace" class="anchor">SetTrace Notification (:arrow_right:)</a>

A notification that should be used by the client to modify the trace setting of the server.

_Notification_:
* method: '$/setTrace'
* params: `SetTraceParams` defined as follows:

```typescript
interface SetTraceParams {
	/**
	 * The new value that should be assigned to the trace setting.
	 */
	value: TraceValue;
}
```

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
	type: MessageType;

	/**
	 * The actual message.
	 */
	message: string;
}
```

Where the type is defined as follows:

<div class="anchorHolder"><a href="#messageType" name="messageType" class="linkableAnchor"></a></div>

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

export type MessageType = 1 | 2 | 3 | 4;
```

#### <a href="#window_showMessageRequest" name="window_showMessageRequest" class="anchor">ShowMessage Request (:arrow_right_hook:)</a>

The show message request is sent from a server to a client to ask the client to display a particular message in the user interface. In addition to the show message notification the request allows to pass actions and to wait for an answer from the client.

_Client Capability_:
* property path (optional): `window.showMessage`
* property type: `ShowMessageRequestClientCapabilities` defined as follows:

```typescript
/**
 * Show message request client capabilities
 */
export interface ShowMessageRequestClientCapabilities {
	/**
	 * Capabilities specific to the `MessageActionItem` type.
	 */
	messageActionItem?: {
		/**
		 * Whether the client supports additional attributes which
		 * are preserved and sent back to the server in the
		 * request's response.
		 */
		additionalPropertiesSupport?: boolean;
	};
}
```

_Request_:
* method: 'window/showMessageRequest'
* params: `ShowMessageRequestParams` defined as follows:

_Response_:
* result: the selected `MessageActionItem` \| `null` if none got selected.
* error: code and message set in case an exception happens during showing a message.

<div class="anchorHolder"><a href="#showMessageRequestParams" name="showMessageRequestParams" class="linkableAnchor"></a></div>

```typescript
interface ShowMessageRequestParams {
	/**
	 * The message type. See {@link MessageType}
	 */
	type: MessageType;

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

<div class="anchorHolder"><a href="#messageActionItem" name="messageActionItem" class="linkableAnchor"></a></div>

```typescript
interface MessageActionItem {
	/**
	 * A short title like 'Retry', 'Open Log' etc.
	 */
	title: string;
}
```

#### <a href="#window_showDocument" name="window_showDocument" class="anchor">Show Document Request (:arrow_right_hook:)</a>

> New in version 3.16.0

The show document request is sent from a server to a client to ask the client to display a particular document in the user interface.

_Client Capability_:
* property path (optional): `window.showDocument`
* property type: `ShowDocumentClientCapabilities` defined as follows:

```typescript
/**
 * Client capabilities for the show document request.
 *
 * @since 3.16.0
 */
export interface ShowDocumentClientCapabilities {
	/**
	 * The client has support for the show document
	 * request.
	 */
	support: boolean;
}
```

_Request_:
* method: 'window/showDocument'
* params: `ShowDocumentParams` defined as follows:

<div class="anchorHolder"><a href="#showDocumentParams" name="showDocumentParams" class="linkableAnchor"></a></div>

```typescript
/**
 * Params to show a document.
 *
 * @since 3.16.0
 */
export interface ShowDocumentParams {
	/**
	 * The document uri to show.
	 */
	uri: URI;

	/**
	 * Indicates to show the resource in an external program.
	 * To show for example `https://code.visualstudio.com/`
	 * in the default WEB browser set `external` to `true`.
	 */
	external?: boolean;

	/**
	 * An optional property to indicate whether the editor
	 * showing the document should take focus or not.
	 * Clients might ignore this property if an external
	 * program is started.
	 */
	takeFocus?: boolean;

	/**
	 * An optional selection range if the document is a text
	 * document. Clients might ignore the property if an
	 * external program is started or the file is not a text
	 * file.
	 */
	selection?: Range;
}
```

_Response_:

* result: `ShowDocumentResult` defined as follows:

<div class="anchorHolder"><a href="#showDocumentResult" name="showDocumentResult" class="linkableAnchor"></a></div>

```typescript
/**
 * The result of an show document request.
 *
 * @since 3.16.0
 */
export interface ShowDocumentResult {
	/**
	 * A boolean indicating if the show was successful.
	 */
	success: boolean;
}
```
* error: code and message set in case an exception happens during showing a document.

#### <a href="#window_logMessage" name="window_logMessage" class="anchor">LogMessage Notification (:arrow_left:)</a>

The log message notification is sent from the server to the client to ask the client to log a particular message.

_Notification_:
* method: 'window/logMessage'
* params: `LogMessageParams` defined as follows:

<div class="anchorHolder"><a href="#logMessageParams" name="logMessageParams" class="linkableAnchor"></a></div>

```typescript
interface LogMessageParams {
	/**
	 * The message type. See {@link MessageType}
	 */
	type: MessageType;

	/**
	 * The actual message
	 */
	message: string;
}
```

#### <a href="#window_workDoneProgress_create" name="window_workDoneProgress_create" class="anchor"> Creating Work Done Progress (:arrow_right_hook:)</a>

The `window/workDoneProgress/create` request is sent from the server to the client to ask the client to create a work done progress.

_Request_:

* method: 'window/workDoneProgress/create'
* params: `WorkDoneProgressCreateParams` defined as follows:

```typescript
export interface WorkDoneProgressCreateParams {
	/**
	 * The token to be used to report progress.
	 */
	token: ProgressToken;
}
```

_Response_:

* result: void
* error: code and message set in case an exception happens during the 'window/workDoneProgress/create' request. In case an error occurs a server must not send any progress notification using the token provided in the `WorkDoneProgressCreateParams`.

#### <a href="#window_workDoneProgress_cancel" name="window_workDoneProgress_cancel" class="anchor"> Canceling a Work Done Progress (:arrow_right:)</a>

The `window/workDoneProgress/cancel` notification is sent from the client to the server to cancel a progress initiated on the server side using the `window/workDoneProgress/create`. The progress need not be marked as `cancellable` to be cancelled and a client may cancel a progress for any number of reasons: in case of error, reloading a workspace etc.

_Notification_:

* method: 'window/workDoneProgress/cancel'
* params: `WorkDoneProgressCancelParams` defined as follows:

```typescript
export interface WorkDoneProgressCancelParams {
	/**
	 * The token to be used to report progress.
	 */
	token: ProgressToken;
}
```

#### <a href="#telemetry_event" name="telemetry_event" class="anchor">Telemetry Notification (:arrow_left:)</a>

The telemetry notification is sent from the server to the client to ask the client to log a telemetry event. The protocol doesn't specify the payload since no interpretation of the data happens in the protocol. Most clients even don't handle the event directly but forward them to the extensions owing the corresponding server issuing the event.

_Notification_:
* method: 'telemetry/event'
* params: 'object' \| 'number' \| 'boolean' \| 'string';

#### <a href="#client_registerCapability" name="client_registerCapability" class="anchor">Register Capability (:arrow_right_hook:)</a>

The `client/registerCapability` request is sent from the server to the client to register for a new capability on the client side. Not all clients need to support dynamic capability registration. A client opts in via the `dynamicRegistration` property on the specific client capabilities. A client can even provide dynamic registration for capability A but not for capability B (see `TextDocumentClientCapabilities` as an example).

Server must not register the same capability both statically through the initialize result and dynamically for the same document selector. If a server wants to support both static and dynamic registration it needs to check the client capability in the initialize request and only register the capability statically if the client doesn't support dynamic registration for that capability.

_Request_:
* method: 'client/registerCapability'
* params: `RegistrationParams`

Where `RegistrationParams` are defined as follows:

<div class="anchorHolder"><a href="#registration" name="registration" class="linkableAnchor"></a></div>

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
```

<div class="anchorHolder"><a href="#registrationParams" name="registrationParams" class="linkableAnchor"></a></div>

```typescript
export interface RegistrationParams {
	registrations: Registration[];
}
```

Since most of the registration options require to specify a document selector there is a base interface that can be used. See `TextDocumentRegistrationOptions`.

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

<div class="anchorHolder"><a href="#unregistration" name="unregistration" class="linkableAnchor"></a></div>

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
```

<div class="anchorHolder"><a href="#unregistrationParams" name="unregistrationParams" class="linkableAnchor"></a></div>

```typescript
export interface UnregistrationParams {
	// This should correctly be named `unregistrations`. However changing this
	// is a breaking change and needs to wait until we deliver a 4.x version
	// of the specification.
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

_Client Capability_:
* property path (optional): `workspace.workspaceFolders`
* property type: `boolean`

_Server Capability_:
* property path (optional): `workspace.workspaceFolders`
* property type: `WorkspaceFoldersServerCapabilities` defined as follows:

<div class="anchorHolder"><a href="#workspaceFoldersServerCapabilities" name="workspaceFoldersServerCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface WorkspaceFoldersServerCapabilities {
	/**
	 * The server has support for workspace folders
	 */
	supported?: boolean;

	/**
	 * Whether the server wants to receive workspace folder
	 * change notifications.
	 *
	 * If a string is provided, the string is treated as an ID
	 * under which the notification is registered on the client
	 * side. The ID can be used to unregister for these events
	 * using the `client/unregisterCapability` request.
	 */
	changeNotifications?: string | boolean;
}
```

_Request_:
* method: `workspace/workspaceFolders`
* params: none

_Response_:
* result: `WorkspaceFolder[] | null` defined as follows:

<div class="anchorHolder"><a href="#workspaceFolder" name="workspaceFolder" class="linkableAnchor"></a></div>

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

The `workspace/didChangeWorkspaceFolders` notification is sent from the client to the server to inform the server about workspace folder configuration changes. The notification is sent by default if both _client capability_ `workspace.workspaceFolders` and the _server capability_ `workspace.workspaceFolders.supported` are true; or if the server has registered itself to receive this notification. To register for the `workspace/didChangeWorkspaceFolders` send a `client/registerCapability` request from the server to the client. The registration parameter must have a `registrations` item of the following form, where `id` is a unique id used to unregister the capability (the example uses a UUID):
```ts
{
	id: "28c6150c-bd7b-11e7-abc4-cec278b6b50a",
	method: "workspace/didChangeWorkspaceFolders"
}
```

_Notification_:
* method: 'workspace/didChangeWorkspaceFolders'
* params: `DidChangeWorkspaceFoldersParams` defined as follows:

<div class="anchorHolder"><a href="#didChangeWorkspaceFoldersParams" name="didChangeWorkspaceFoldersParams" class="linkableAnchor"></a></div>

```typescript
export interface DidChangeWorkspaceFoldersParams {
	/**
	 * The actual workspace folder change event.
	 */
	event: WorkspaceFoldersChangeEvent;
}
```

<div class="anchorHolder"><a href="#workspaceFoldersChangeEvent" name="workspaceFoldersChangeEvent" class="linkableAnchor"></a></div>

```typescript
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

_Client Capability_:
* property path (optional): `workspace.didChangeConfiguration`
* property type: `DidChangeConfigurationClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#didChangeConfigurationClientCapabilities" name="didChangeConfigurationClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface DidChangeConfigurationClientCapabilities {
	/**
	 * Did change configuration notification supports dynamic registration.
	 */
	dynamicRegistration?: boolean;
}
```

_Notification_:
* method: 'workspace/didChangeConfiguration',
* params: `DidChangeConfigurationParams` defined as follows:

<div class="anchorHolder"><a href="#didChangeConfigurationParams" name="didChangeConfigurationParams" class="linkableAnchor"></a></div>

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

_Client Capability_:
* property path (optional): `workspace.configuration`
* property type: `boolean`

_Request_:
* method: 'workspace/configuration'
* params: `ConfigurationParams` defined as follows

<div class="anchorHolder"><a href="#configurationParams" name="configurationParams" class="linkableAnchor"></a></div>

```typescript
export interface ConfigurationParams {
	items: ConfigurationItem[];
}
```

<div class="anchorHolder"><a href="#configurationItem" name="configurationItem" class="linkableAnchor"></a></div>

```typescript
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

#### <a href="#workspace_symbol" name="workspace_symbol" class="anchor">Workspace Symbols Request (:leftwards_arrow_with_hook:)</a>

The workspace symbol request is sent from the client to the server to list project-wide symbols matching the query string.

_Client Capability_:
* property path (optional): `workspace.symbol`
* property type: `WorkspaceSymbolClientCapabilities` defined as follows:

```typescript
interface WorkspaceSymbolClientCapabilities {
	/**
	 * Symbol request supports dynamic registration.
	 */
	dynamicRegistration?: boolean;

	/**
	 * Specific capabilities for the `SymbolKind` in the `workspace/symbol`
	 * request.
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
	};

	/**
	 * The client supports tags on `SymbolInformation`.
	 * Clients supporting tags have to handle unknown tags gracefully.
	 *
	 * @since 3.16.0
	 */
	tagSupport?: {
		/**
		 * The tags supported by the client.
		 */
		valueSet: SymbolTag[];
	};
}
```

_Server Capability_:
* property path (optional): `workspaceSymbolProvider`
* property type: `boolean | WorkspaceSymbolOptions` where `WorkspaceSymbolOptions` is defined as follows:

<div class="anchorHolder"><a href="#workspaceSymbolOptions" name="workspaceSymbolOptions" class="linkableAnchor"></a></div>

```typescript
export interface WorkspaceSymbolOptions extends WorkDoneProgressOptions {
}
```

_Registration Options_: `WorkspaceSymbolRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#workspaceSymbolRegistrationOptions" name="workspaceSymbolRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface WorkspaceSymbolRegistrationOptions
	extends WorkspaceSymbolOptions {
}
```

_Request_:
* method: 'workspace/symbol'
* params: `WorkspaceSymbolParams` defined as follows:

<div class="anchorHolder"><a href="#workspaceSymbolParams" name="workspaceSymbolParams" class="linkableAnchor"></a></div>

```typescript
/**
 * The parameters of a Workspace Symbol Request.
 */
interface WorkspaceSymbolParams extends WorkDoneProgressParams,
	PartialResultParams {
	/**
	 * A query string to filter symbols by. Clients may send an empty
	 * string here to request all symbols.
	 */
	query: string;
}
```

_Response_:
* result: `SymbolInformation[]` \| `null` as defined above.
* partial result: `SymbolInformation[]` as defined above.
* error: code and message set in case an exception happens during the workspace symbol request.

#### <a href="#workspace_executeCommand" name="workspace_executeCommand" class="anchor">Execute a command (:leftwards_arrow_with_hook:)</a>

The `workspace/executeCommand` request is sent from the client to the server to trigger command execution on the server. In most cases the server creates a `WorkspaceEdit` structure and applies the changes to the workspace using the request `workspace/applyEdit` which is sent from the server to the client.

_Client Capability_:
* property path (optional): `workspace.executeCommand`
* property type: `ExecuteCommandClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#executeCommandClientCapabilities" name="executeCommandClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface ExecuteCommandClientCapabilities {
	/**
	 * Execute command supports dynamic registration.
	 */
	dynamicRegistration?: boolean;
}
```

_Server Capability_:
* property path (optional): `executeCommandProvider`
* property type: `ExecuteCommandOptions` defined as follows:

<div class="anchorHolder"><a href="#executeCommandOptions" name="executeCommandOptions" class="linkableAnchor"></a></div>

```typescript
export interface ExecuteCommandOptions extends WorkDoneProgressOptions {
	/**
	 * The commands to be executed on the server
	 */
	commands: string[];
}
```

_Registration Options_: `ExecuteCommandRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#executeCommandRegistrationOptions" name="executeCommandRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
/**
 * Execute command registration options.
 */
export interface ExecuteCommandRegistrationOptions
	extends ExecuteCommandOptions {
}
```

_Request:_
* method: 'workspace/executeCommand'
* params: `ExecuteCommandParams` defined as follows:

<div class="anchorHolder"><a href="#executeCommandParams" name="executeCommandParams" class="linkableAnchor"></a></div>

```typescript
export interface ExecuteCommandParams extends WorkDoneProgressParams {

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

#### <a href="#workspace_applyEdit" name="workspace_applyEdit" class="anchor">Applies a WorkspaceEdit (:arrow_right_hook:)</a>

The `workspace/applyEdit` request is sent from the server to the client to modify resource on the client side.

_Client Capability_:
* property path (optional): `workspace.applyEdit`
* property type: `boolean`

See also the [WorkspaceEditClientCapabilities](#workspaceEditClientCapabilities) for the supported capabilities of a workspace edit.

_Request_:
* method: 'workspace/applyEdit'
* params: `ApplyWorkspaceEditParams` defined as follows:

<div class="anchorHolder"><a href="#applyWorkspaceEditParams" name="applyWorkspaceEditParams" class="linkableAnchor"></a></div>

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
* result: `ApplyWorkspaceEditResult` defined as follows:

<div class="anchorHolder"><a href="#applyWorkspaceEditResult" name="applyWorkspaceEditResult" class="linkableAnchor"></a></div>

```typescript
export interface ApplyWorkspaceEditResult {
	/**
	 * Indicates whether the edit was applied or not.
	 */
	applied: boolean;

	/**
	 * An optional textual description for why the edit was not applied.
	 * This may be used by the server for diagnostic logging or to provide
	 * a suitable error for a request that triggered the edit.
	 */
	failureReason?: string;

	/**
	 * Depending on the client's failure handling strategy `failedChange`
	 * might contain the index of the change that failed. This property is
	 * only available if the client signals a `failureHandling` strategy
	 * in its client capabilities.
	 */
	failedChange?: uinteger;
}
```
* error: code and message set in case an exception happens during the request.

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

#### <a href="#workspace_didCreateFiles" name="workspace_didCreateFiles" class="anchor">DidCreateFiles Notification (:arrow_right:)</a>

The did create files notification is sent from the client to the server when files were created from within the client.

_Client Capability_:
* property name (optional): `workspace.fileOperations.didCreate`
* property type: `boolean`

The capability indicates that the client supports sending `workspace/didCreateFiles` notifications.

_Server Capability_:
* property name (optional): `workspace.fileOperations.didCreate`
* property type: `FileOperationRegistrationOptions`

The capability indicates that the server is interested in receiving `workspace/didCreateFiles` notifications.

_Notification_:
* method: 'workspace/didCreateFiles'
* params: `CreateFilesParams`

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

#### <a href="#workspace_didRenameFiles" name="workspace_didRenameFiles" class="anchor">DidRenameFiles Notification (:arrow_right:)</a>

The did rename files notification is sent from the client to the server when files were renamed from within the client.

_Client Capability_:
* property name (optional): `workspace.fileOperations.didRename`
* property type: `boolean`

The capability indicates that the client supports sending `workspace/didRenameFiles` notifications.

_Server Capability_:
* property name (optional): `workspace.fileOperations.didRename`
* property type: `FileOperationRegistrationOptions`

The capability indicates that the server is interested in receiving `workspace/didRenameFiles` notifications.

_Notification_:
* method: 'workspace/didRenameFiles'
* params: `RenameFilesParams`

#### <a href="#workspace_willDeleteFiles" name="workspace_willDeleteFiles" class="anchor">WillDeleteFiles Request (:leftwards_arrow_with_hook:)</a>

The will delete files request is sent from the client to the server before files are actually deleted as long as the deletion is triggered from within the client either by a user action or by applying a workspace edit. The request can return a WorkspaceEdit which will be applied to workspace before the files are deleted. Please note that clients might drop results if computing the edit took too long or if a server constantly fails on this request. This is done to keep deletes fast and reliable.

_Client Capability_:
* property name (optional): `workspace.fileOperations.willDelete`
* property type: `boolean`

The capability indicates that the client supports sending `workspace/willDeleteFiles` requests.

_Server Capability_:
* property name (optional): `workspace.fileOperations.willDelete`
* property type: `FileOperationRegistrationOptions`

The capability indicates that the server is interested in receiving `workspace/willDeleteFiles` requests.

_Registration Options_: none

_Request_:
* method: `workspace/willDeleteFiles`
* params: `DeleteFilesParams` defined as follows:

<div class="anchorHolder"><a href="#deleteFilesParams" name="deleteFilesParams" class="linkableAnchor"></a></div>

```typescript
/**
 * The parameters sent in notifications/requests for user-initiated deletes
 * of files.
 *
 * @since 3.16.0
 */
export interface DeleteFilesParams {

	/**
	 * An array of all files/folders deleted in this operation.
	 */
	files: FileDelete[];
}
```

<div class="anchorHolder"><a href="#fileDelete" name="fileDelete" class="linkableAnchor"></a></div>

```typescript
/**
 * Represents information on a file/folder delete.
 *
 * @since 3.16.0
 */
export interface FileDelete {

	/**
	 * A file:// URI for the location of the file/folder being deleted.
	 */
	uri: string;
}
```

_Response_:
* result:`WorkspaceEdit` \| `null`
* error: code and message set in case an exception happens during the `workspace/willDeleteFiles` request.

#### <a href="#workspace_didDeleteFiles" name="workspace_didDeleteFiles" class="anchor">DidDeleteFiles Notification (:arrow_right:)</a>

The did delete files notification is sent from the client to the server when files were deleted from within the client.

_Client Capability_:
* property name (optional): `workspace.fileOperations.didDelete`
* property type: `boolean`

The capability indicates that the client supports sending `workspace/didDeleteFiles` notifications.

_Server Capability_:
* property name (optional): `workspace.fileOperations.didDelete`
* property type: `FileOperationRegistrationOptions`

The capability indicates that the server is interested in receiving `workspace/didDeleteFiles` notifications.

_Notification_:
* method: 'workspace/didDeleteFiles'
* params: `DeleteFilesParams`

#### <a href="#textDocument_synchronization" name="textDocument_synchronization" class="anchor">Text Document Synchronization</a>

Client support for `textDocument/didOpen`, `textDocument/didChange` and `textDocument/didClose` notifications is mandatory in the protocol and clients can not opt out supporting them. This includes both full and incremental synchronization in the `textDocument/didChange` notification. In addition a server must either implement all three of them or none. Their capabilities are therefore controlled via a combined client and server capability.

<a href="#textDocument_synchronization_cc" name="textDocument_synchronization_cc" class="anchor">_Client Capability_:</a>
* property path (optional): `textDocument.synchronization.dynamicRegistration`
* property type: `boolean`

Controls whether text document synchronization supports dynamic registration.

<a href="#textDocument_synchronization_sc" name="textDocument_synchronization_sc" class="anchor">_Server Capability_:</a>
* property path (optional): `textDocumentSync`
* property type: `TextDocumentSyncKind | TextDocumentSyncOptions`. The below definition of the `TextDocumentSyncOptions` only covers the properties specific to the open, change and close notifications. A complete definition covering all properties can be found [here](#textDocument_didClose):

<div class="anchorHolder"><a href="#textDocumentSyncKind" name="textDocumentSyncKind" class="linkableAnchor"></a></div>

```typescript
/**
 * Defines how the host (editor) should sync document changes to the language
 * server.
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
```

<div class="anchorHolder"><a href="#textDocumentSyncOptions" name="textDocumentSyncOptions" class="linkableAnchor"></a></div>

```typescript
export interface TextDocumentSyncOptions {
	/**
	 * Open and close notifications are sent to the server. If omitted open
	 * close notification should not be sent.
	 */
	openClose?: boolean;

	/**
	 * Change notifications are sent to the server. See
	 * TextDocumentSyncKind.None, TextDocumentSyncKind.Full and
	 * TextDocumentSyncKind.Incremental. If omitted it defaults to
	 * TextDocumentSyncKind.None.
	 */
	change?: TextDocumentSyncKind;
}
```

#### <a href="#textDocument_didOpen" name="textDocument_didOpen" class="anchor">DidOpenTextDocument Notification (:arrow_right:)</a>

The document open notification is sent from the client to the server to signal newly opened text documents. The document's content is now managed by the client and the server must not try to read the document's content using the document's Uri. Open in this sense means it is managed by the client. It doesn't necessarily mean that its content is presented in an editor. An open notification must not be sent more than once without a corresponding close notification send before. This means open and close notification must be balanced and the max open count for a particular textDocument is one. Note that a server's ability to fulfill requests is independent of whether a text document is open or closed.

The `DidOpenTextDocumentParams` contain the language id the document is associated with. If the language Id of a document changes, the client needs to send a `textDocument/didClose` to the server followed by a `textDocument/didOpen` with the new language id if the server handles the new language id as well.

_Client Capability_:
See general synchronization [client capabilities](#textDocument_synchronization_cc).

_Server Capability_:
See general synchronization [server capabilities](#textDocument_synchronization_sc).

_Registration Options_: [`TextDocumentRegistrationOptions`](#textDocumentRegistrationOptions)

_Notification_:
* method: 'textDocument/didOpen'
* params: `DidOpenTextDocumentParams` defined as follows:

<div class="anchorHolder"><a href="#didOpenTextDocumentParams" name="didOpenTextDocumentParams" class="linkableAnchor"></a></div>

```typescript
interface DidOpenTextDocumentParams {
	/**
	 * The document that was opened.
	 */
	textDocument: TextDocumentItem;
}
```

#### <a href="#textDocument_didChange" name="textDocument_didChange" class="anchor">DidChangeTextDocument Notification (:arrow_right:)</a>

The document change notification is sent from the client to the server to signal changes to a text document. Before a client can change a text document it must claim ownership of its content using the `textDocument/didOpen` notification. In 2.0 the shape of the params has changed to include proper version numbers.

_Client Capability_:
See general synchronization [client capabilities](#textDocument_synchronization_cc).

_Server Capability_:
See general synchronization [server capabilities](#textDocument_synchronization_sc).

_Registration Options_: `TextDocumentChangeRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#textDocumentChangeRegistrationOptions" name="textDocumentChangeRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
/**
 * Describe options to be used when registering for text document change events.
 */
export interface TextDocumentChangeRegistrationOptions
	extends TextDocumentRegistrationOptions {
	/**
	 * How documents are synced to the server. See TextDocumentSyncKind.Full
	 * and TextDocumentSyncKind.Incremental.
	 */
	syncKind: TextDocumentSyncKind;
}
```

_Notification_:
* method: `textDocument/didChange`
* params: `DidChangeTextDocumentParams` defined as follows:

<div class="anchorHolder"><a href="#didChangeTextDocumentParams" name="didChangeTextDocumentParams" class="linkableAnchor"></a></div>

```typescript
interface DidChangeTextDocumentParams {
	/**
	 * The document that did change. The version number points
	 * to the version after all provided content changes have
	 * been applied.
	 */
	textDocument: VersionedTextDocumentIdentifier;

	/**
	 * The actual content changes. The content changes describe single state
	 * changes to the document. So if there are two content changes c1 (at
	 * array index 0) and c2 (at array index 1) for a document in state S then
	 * c1 moves the document from S to S' and c2 from S' to S''. So c1 is
	 * computed on the state S and c2 is computed on the state S'.
	 *
	 * To mirror the content of a document using change events use the following
	 * approach:
	 * - start with the same initial content
	 * - apply the 'textDocument/didChange' notifications in the order you
	 *   receive them.
	 * - apply the `TextDocumentContentChangeEvent`s in a single notification
	 *   in the order you receive them.
	 */
	contentChanges: TextDocumentContentChangeEvent[];
}
```

<div class="anchorHolder"><a href="#textDocumentContentChangeEvent" name="textDocumentContentChangeEvent" class="linkableAnchor"></a></div>

```typescript
/**
 * An event describing a change to a text document. If range and rangeLength are
 * omitted the new text is considered to be the full content of the document.
 */
export type TextDocumentContentChangeEvent = {
	/**
	 * The range of the document that changed.
	 */
	range: Range;

	/**
	 * The optional length of the range that got replaced.
	 *
	 * @deprecated use range instead.
	 */
	rangeLength?: uinteger;

	/**
	 * The new text for the provided range.
	 */
	text: string;
} | {
	/**
	 * The new text of the whole document.
	 */
	text: string;
};
```

#### <a href="#textDocument_willSave" name="textDocument_willSave" class="anchor">WillSaveTextDocument Notification (:arrow_right:)</a>

The document will save notification is sent from the client to the server before the document is actually saved.

_Client Capability_:
* property name (optional): `textDocument.synchronization.willSave`
* property type: `boolean`

The capability indicates that the client supports `textDocument/willSave` notifications.

_Server Capability_:
* property name (optional): `textDocumentSync.willSave`
* property type: `boolean`

The capability indicates that the server is interested in `textDocument/willSave` notifications.

_Registration Options_: `TextDocumentRegistrationOptions`

_Notification_:
* method: 'textDocument/willSave'
* params: `WillSaveTextDocumentParams` defined as follows:

<div class="anchorHolder"><a href="#willSaveTextDocumentParams" name="willSaveTextDocumentParams" class="linkableAnchor"></a></div>

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
	reason: TextDocumentSaveReason;
}
```

<div class="anchorHolder"><a href="#textDocumentSaveReason" name="textDocumentSaveReason" class="linkableAnchor"></a></div>

```typescript
/**
 * Represents reasons why a text document is saved.
 */
export namespace TextDocumentSaveReason {

	/**
	 * Manually triggered, e.g. by the user pressing save, by starting
	 * debugging, or by an API call.
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

export type TextDocumentSaveReason = 1 | 2 | 3;
```

#### <a href="#textDocument_willSaveWaitUntil" name="textDocument_willSaveWaitUntil" class="anchor">WillSaveWaitUntilTextDocument Request (:leftwards_arrow_with_hook:)</a>

The document will save request is sent from the client to the server before the document is actually saved. The request can return an array of TextEdits which will be applied to the text document before it is saved. Please note that clients might drop results if computing the text edits took too long or if a server constantly fails on this request. This is done to keep the save fast and reliable.

_Client Capability_:
* property name (optional): `textDocument.synchronization.willSaveWaitUntil`
* property type: `boolean`

The capability indicates that the client supports `textDocument/willSaveWaitUntil` requests.

_Server Capability_:
* property name (optional): `textDocumentSync.willSaveWaitUntil`
* property type: `boolean`

The capability indicates that the server is interested in `textDocument/willSaveWaitUntil` requests.

_Registration Options_: `TextDocumentRegistrationOptions`

_Request_:
* method: `textDocument/willSaveWaitUntil`
* params: `WillSaveTextDocumentParams`

_Response_:
* result:[`TextEdit[]`](#textEdit) \| `null`
* error: code and message set in case an exception happens during the `textDocument/willSaveWaitUntil` request.

#### <a href="#textDocument_didSave" name="textDocument_didSave" class="anchor">DidSaveTextDocument Notification (:arrow_right:)</a>

The document save notification is sent from the client to the server when the document was saved in the client.

_Client Capability_:
* property name (optional): `textDocument.synchronization.didSave`
* property type: `boolean`

The capability indicates that the client supports `textDocument/didSave` notifications.

_Server Capability_:
* property name (optional): `textDocumentSync.save`
* property type: `boolean | SaveOptions` where `SaveOptions` is defined as follows:

<div class="anchorHolder"><a href="#saveOptions" name="saveOptions" class="linkableAnchor"></a></div>

```typescript
export interface SaveOptions {
	/**
	 * The client is supposed to include the content on save.
	 */
	includeText?: boolean;
}
```

The capability indicates that the server is interested in `textDocument/didSave` notifications.

_Registration Options_: `TextDocumentSaveRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#textDocumentSaveRegistrationOptions" name="textDocumentSaveRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface TextDocumentSaveRegistrationOptions
	extends TextDocumentRegistrationOptions {
	/**
	 * The client is supposed to include the content on save.
	 */
	includeText?: boolean;
}
```

_Notification_:
* method: `textDocument/didSave`
* params: `DidSaveTextDocumentParams` defined as follows:

<div class="anchorHolder"><a href="#didSaveTextDocumentParams" name="didSaveTextDocumentParams" class="linkableAnchor"></a></div>

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

#### <a href="#textDocument_didClose" name="textDocument_didClose" class="anchor">DidCloseTextDocument Notification (:arrow_right:)</a>

The document close notification is sent from the client to the server when the document got closed in the client. The document's master now exists where the document's Uri points to (e.g. if the document's Uri is a file Uri the master now exists on disk). As with the open notification the close notification is about managing the document's content. Receiving a close notification doesn't mean that the document was open in an editor before. A close notification requires a previous open notification to be sent. Note that a server's ability to fulfill requests is independent of whether a text document is open or closed.

_Client Capability_:
See general synchronization [client capabilities](#textDocument_synchronization_cc).

_Server Capability_:
See general synchronization [server capabilities](#textDocument_synchronization_sc).

_Registration Options_: `TextDocumentRegistrationOptions`

_Notification_:
* method: `textDocument/didClose`
* params: `DidCloseTextDocumentParams` defined as follows:

<div class="anchorHolder"><a href="#didCloseTextDocumentParams" name="didCloseTextDocumentParams" class="linkableAnchor"></a></div>

```typescript
interface DidCloseTextDocumentParams {
	/**
	 * The document that was closed.
	 */
	textDocument: TextDocumentIdentifier;
}
```

The final structure of the `TextDocumentSyncClientCapabilities` and the `TextDocumentSyncOptions` server options look like this

<div class="anchorHolder"><a href="#textDocumentSyncClientCapabilities" name="textDocumentSyncClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface TextDocumentSyncClientCapabilities {
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
```

<div class="anchorHolder"><a href="#textDocumentSyncKind" name="textDocumentSyncKind" class="linkableAnchor"></a></div>

```typescript
/**
 * Defines how the host (editor) should sync document changes to the language
 * server.
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

export type TextDocumentSyncKind = 0 | 1 | 2;
```

<div class="anchorHolder"><a href="#textDocumentSyncOptions" name="textDocumentSyncOptions" class="linkableAnchor"></a></div>

```typescript
export interface TextDocumentSyncOptions {
	/**
	 * Open and close notifications are sent to the server. If omitted open
	 * close notification should not be sent.
	 */
	openClose?: boolean;
	/**
	 * Change notifications are sent to the server. See
	 * TextDocumentSyncKind.None, TextDocumentSyncKind.Full and
	 * TextDocumentSyncKind.Incremental. If omitted it defaults to
	 * TextDocumentSyncKind.None.
	 */
	change?: TextDocumentSyncKind;
	/**
	 * If present will save notifications are sent to the server. If omitted
	 * the notification should not be sent.
	 */
	willSave?: boolean;
	/**
	 * If present will save wait until requests are sent to the server. If
	 * omitted the request should not be sent.
	 */
	willSaveWaitUntil?: boolean;
	/**
	 * If present save notifications are sent to the server. If omitted the
	 * notification should not be sent.
	 */
	save?: boolean | SaveOptions;
}
```

#### <a href="#textDocument_publishDiagnostics" name="textDocument_publishDiagnostics" class="anchor">PublishDiagnostics Notification (:arrow_left:)</a>

Diagnostics notification are sent from the server to the client to signal results of validation runs.

Diagnostics are "owned" by the server so it is the server's responsibility to clear them if necessary. The following rule is used for VS Code servers that generate diagnostics:

* if a language is single file only (for example HTML) then diagnostics are cleared by the server when the file is closed. Please note that open / close events don't necessarily reflect what the user sees in the user interface. These events are ownership events. So with the current version of the specification it is possible that problems are not cleared although the file is not visible in the user interface since the client has not closed the file yet.
* if a language has a project system (for example C#) diagnostics are not cleared when a file closes. When a project is opened all diagnostics for all files are recomputed (or read from a cache).

When a file changes it is the server's responsibility to re-compute diagnostics and push them to the client. If the computed set is empty it has to push the empty array to clear former diagnostics. Newly pushed diagnostics always replace previously pushed diagnostics. There is no merging that happens on the client side.

See also the [Diagnostic](#diagnostic) section.

_Client Capability_:
* property name (optional): `textDocument.publishDiagnostics`
* property type `PublishDiagnosticsClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#publishDiagnosticsClientCapabilities" name="publishDiagnosticsClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface PublishDiagnosticsClientCapabilities {
	/**
	 * Whether the clients accepts diagnostics with related information.
	 */
	relatedInformation?: boolean;

	/**
	 * Client supports the tag property to provide meta data about a diagnostic.
	 * Clients supporting tags have to handle unknown tags gracefully.
	 *
	 * @since 3.15.0
	 */
	tagSupport?: {
		/**
		 * The tags supported by the client.
		 */
		valueSet: DiagnosticTag[];
	};

	/**
	 * Whether the client interprets the version property of the
	 * `textDocument/publishDiagnostics` notification's parameter.
	 *
	 * @since 3.15.0
	 */
	versionSupport?: boolean;

	/**
	 * Client supports a codeDescription property
	 *
	 * @since 3.16.0
	 */
	codeDescriptionSupport?: boolean;

	/**
	 * Whether code action supports the `data` property which is
	 * preserved between a `textDocument/publishDiagnostics` and
	 * `textDocument/codeAction` request.
	 *
	 * @since 3.16.0
	 */
	dataSupport?: boolean;
}
```

_Notification_:
* method: `textDocument/publishDiagnostics`
* params: `PublishDiagnosticsParams` defined as follows:

<div class="anchorHolder"><a href="#publishDiagnosticsParams" name="publishDiagnosticsParams" class="linkableAnchor"></a></div>

```typescript
interface PublishDiagnosticsParams {
	/**
	 * The URI for which diagnostic information is reported.
	 */
	uri: DocumentUri;

	/**
	 * Optional the version number of the document the diagnostics are published
	 * for.
	 *
	 * @since 3.15.0
	 */
	version?: uinteger;

	/**
	 * An array of diagnostic information items.
	 */
	diagnostics: Diagnostic[];
}
```

#### <a href="#textDocument_completion" name="textDocument_completion" class="anchor">Completion Request (:leftwards_arrow_with_hook:)</a>

The Completion request is sent from the client to the server to compute completion items at a given cursor position. Completion items are presented in the [IntelliSense](https://code.visualstudio.com/docs/editor/intellisense) user interface. If computing full completion items is expensive, servers can additionally provide a handler for the completion item resolve request ('completionItem/resolve'). This request is sent when a completion item is selected in the user interface. A typical use case is for example: the `textDocument/completion` request doesn't fill in the `documentation` property for returned completion items since it is expensive to compute. When the item is selected in the user interface then a 'completionItem/resolve' request is sent with the selected completion item as a parameter. The returned completion item should have the documentation property filled in. By default the request can only delay the computation of the `detail` and `documentation` properties. Since 3.16.0 the client
can signal that it can resolve more properties lazily. This is done using the `completionItem#resolveSupport` client capability which lists all properties that can be filled in during a 'completionItem/resolve' request. All other properties (usually `sortText`, `filterText`, `insertText` and `textEdit`) must be provided in the `textDocument/completion` response and must not be changed during resolve.

_Client Capability_:
* property name (optional): `textDocument.completion`
* property type: `CompletionClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#completionClientCapabilities" name="completionClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface CompletionClientCapabilities {
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
		 * the end of the snippet. Placeholders with equal identifiers are
		 * linked, that is typing in one will update others too.
		 */
		snippetSupport?: boolean;

		/**
		 * Client supports commit characters on a completion item.
		 */
		commitCharactersSupport?: boolean;

		/**
		 * Client supports the follow content formats for the documentation
		 * property. The order describes the preferred format of the client.
		 */
		documentationFormat?: MarkupKind[];

		/**
		 * Client supports the deprecated property on a completion item.
		 */
		deprecatedSupport?: boolean;

		/**
		 * Client supports the preselect property on a completion item.
		 */
		preselectSupport?: boolean;

		/**
		 * Client supports the tag property on a completion item. Clients
		 * supporting tags have to handle unknown tags gracefully. Clients
		 * especially need to preserve unknown tags when sending a completion
		 * item back to the server in a resolve call.
		 *
		 * @since 3.15.0
		 */
		tagSupport?: {
			/**
			 * The tags supported by the client.
			 */
			valueSet: CompletionItemTag[];
		};

		/**
		 * Client supports insert replace edit to control different behavior if
		 * a completion item is inserted in the text or should replace text.
		 *
		 * @since 3.16.0
		 */
		insertReplaceSupport?: boolean;

		/**
		 * Indicates which properties a client can resolve lazily on a
		 * completion item. Before version 3.16.0 only the predefined properties
		 * `documentation` and `detail` could be resolved lazily.
		 *
		 * @since 3.16.0
		 */
		resolveSupport?: {
			/**
			 * The properties that a client can resolve lazily.
			 */
			properties: string[];
		};

		/**
		 * The client supports the `insertTextMode` property on
		 * a completion item to override the whitespace handling mode
		 * as defined by the client (see `insertTextMode`).
		 *
		 * @since 3.16.0
		 */
		insertTextModeSupport?: {
			valueSet: InsertTextMode[];
		};

		/**
		 * The client has support for completion item label
		 * details (see also `CompletionItemLabelDetails`).
		 *
		 * @since 3.17.0 - proposed state
		 */
		labelDetailsSupport?: boolean;
	};

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
	};

	/**
	 * The client supports to send additional context information for a
	 * `textDocument/completion` request.
	 */
	contextSupport?: boolean;

	/**
	 * The client's default when the completion item doesn't provide a
	 * `insertTextMode` property.
	 *
	 * @since 3.17.0
	 */
	insertTextMode?: InsertTextMode;
}
```

_Server Capability_:
* property name (optional): `completionProvider`
* property type: `CompletionOptions` defined as follows:

<div class="anchorHolder"><a href="#completionOptions" name="completionOptions" class="linkableAnchor"></a></div>

```typescript
/**
 * Completion options.
 */
export interface CompletionOptions extends WorkDoneProgressOptions {
	/**
	 * Most tools trigger completion request automatically without explicitly
	 * requesting it using a keyboard shortcut (e.g. Ctrl+Space). Typically they
	 * do so when the user starts to type an identifier. For example if the user
	 * types `c` in a JavaScript file code complete will automatically pop up
	 * present `console` besides others as a completion item. Characters that
	 * make up identifiers don't need to be listed here.
	 *
	 * If code complete should automatically be trigger on characters not being
	 * valid inside an identifier (for example `.` in JavaScript) list them in
	 * `triggerCharacters`.
	 */
	triggerCharacters?: string[];

	/**
	 * The list of all possible characters that commit a completion. This field
	 * can be used if clients don't support individual commit characters per
	 * completion item. See client capability
	 * `completion.completionItem.commitCharactersSupport`.
	 *
	 * If a server provides both `allCommitCharacters` and commit characters on
	 * an individual completion item the ones on the completion item win.
	 *
	 * @since 3.2.0
	 */
	allCommitCharacters?: string[];

	/**
	 * The server provides support to resolve additional
	 * information for a completion item.
	 */
	resolveProvider?: boolean;

	/**
	 * The server supports the following `CompletionItem` specific
	 * capabilities.
	 *
	 * @since 3.17.0 - proposed state
	 */
	completionItem?: {
		/**
		 * The server has support for completion item label
		 * details (see also `CompletionItemLabelDetails`) when receiving
		 * a completion item in a resolve call.
		 *
		 * @since 3.17.0 - proposed state
		 */
		labelDetailsSupport?: boolean;
	}
}
```

_Registration Options_: `CompletionRegistrationOptions` options defined as follows:

<div class="anchorHolder"><a href="#completionRegistrationOptions" name="completionRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface CompletionRegistrationOptions
	extends TextDocumentRegistrationOptions, CompletionOptions {
}
```

_Request_:
* method: `textDocument/completion`
* params: `CompletionParams` defined as follows:

<div class="anchorHolder"><a href="#completionParams" name="completionParams" class="linkableAnchor"></a></div>

```typescript
export interface CompletionParams extends TextDocumentPositionParams,
	WorkDoneProgressParams, PartialResultParams {
	/**
	 * The completion context. This is only available if the client specifies
	 * to send this using the client capability
	 * `completion.contextSupport === true`
	 */
	context?: CompletionContext;
}
```

<div class="anchorHolder"><a href="#completionTriggerKind" name="completionTriggerKind" class="linkableAnchor"></a></div>

```typescript
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
	 * the `triggerCharacters` properties of the
	 * `CompletionRegistrationOptions`.
	 */
	export const TriggerCharacter: 2 = 2;

	/**
	 * Completion was re-triggered as the current completion list is incomplete.
	 */
	export const TriggerForIncompleteCompletions: 3 = 3;
}
export type CompletionTriggerKind = 1 | 2 | 3;
```

<div class="anchorHolder"><a href="#completionContext" name="completionContext" class="linkableAnchor"></a></div>

```typescript
/**
 * Contains additional information about the context in which a completion
 * request is triggered.
 */
export interface CompletionContext {
	/**
	 * How the completion was triggered.
	 */
	triggerKind: CompletionTriggerKind;

	/**
	 * The trigger character (a single character) that has trigger code
	 * complete. Is undefined if
	 * `triggerKind !== CompletionTriggerKind.TriggerCharacter`
	 */
	triggerCharacter?: string;
}
```

_Response_:
* result: `CompletionItem[]` \| `CompletionList` \| `null`. If a `CompletionItem[]` is provided it is interpreted to be complete. So it is the same as `{ isIncomplete: false, items }`

<div class="anchorHolder"><a href="#completionList" name="completionList" class="linkableAnchor"></a></div>

```typescript
/**
 * Represents a collection of [completion items](#CompletionItem) to be
 * presented in the editor.
 */
export interface CompletionList {
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
```

<div class="anchorHolder"><a href="#insertTextFormat" name="insertTextFormat" class="linkableAnchor"></a></div>

```typescript
/**
 * Defines whether the insert text in a completion item should be interpreted as
 * plain text or a snippet.
 */
export namespace InsertTextFormat {
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

export type InsertTextFormat = 1 | 2;
```

<div class="anchorHolder"><a href="#completionItemTag" name="completionItemTag" class="linkableAnchor"></a></div>

```typescript
/**
 * Completion item tags are extra annotations that tweak the rendering of a
 * completion item.
 *
 * @since 3.15.0
 */
export namespace CompletionItemTag {
	/**
	 * Render a completion as obsolete, usually using a strike-out.
	 */
	export const Deprecated = 1;
}

export type CompletionItemTag = 1;
```

<div class="anchorHolder"><a href="#insertReplaceEdit" name="insertReplaceEdit" class="linkableAnchor"></a></div>

```typescript
/**
 * A special text edit to provide an insert and a replace operation.
 *
 * @since 3.16.0
 */
export interface InsertReplaceEdit {
	/**
	 * The string to be inserted.
	 */
	newText: string;

	/**
	 * The range if the insert is requested
	 */
	insert: Range;

	/**
	 * The range if the replace is requested.
	 */
	replace: Range;
}
```

<div class="anchorHolder"><a href="#insertTextMode" name="insertTextMode" class="linkableAnchor"></a></div>

```typescript
/**
 * How whitespace and indentation is handled during completion
 * item insertion.
 *
 * @since 3.16.0
 */
export namespace InsertTextMode {
	/**
	 * The insertion or replace strings is taken as it is. If the
	 * value is multi line the lines below the cursor will be
	 * inserted using the indentation defined in the string value.
	 * The client will not apply any kind of adjustments to the
	 * string.
	 */
	export const asIs: 1 = 1;

	/**
	 * The editor adjusts leading whitespace of new lines so that
	 * they match the indentation up to the cursor of the line for
	 * which the item is accepted.
	 *
	 * Consider a line like this: <2tabs><cursor><3tabs>foo. Accepting a
	 * multi line completion item is indented using 2 tabs and all
	 * following lines inserted will be indented using 2 tabs as well.
	 */
	export const adjustIndentation: 2 = 2;
}

export type InsertTextMode = 1 | 2;
```

<div class="anchorHolder"><a href="#completionItemLabelDetails" name="completionItemLabelDetails" class="linkableAnchor"></a></div>

```typescript
/**
 * Additional details for a completion item label.
 *
 * @since 3.17.0 - proposed state
 */
export interface CompletionItemLabelDetails {

	/**
	 * An optional string which is rendered less prominently directly after
	 * {@link CompletionItemLabel.label label}, without any spacing. Should be
	 * used for function signatures or type annotations.
	 */
	detail?: string;

	/**
	 * An optional string which is rendered less prominently after
	 * {@link CompletionItemLabel.detail}. Should be used for fully qualified
	 * names or file path.
	 */
	description?: string;
}
```

<div class="anchorHolder"><a href="#completionItem" name="completionItem" class="linkableAnchor"></a></div>

```typescript
export interface CompletionItem {

	/**
	 * The label of this completion item.
	 *
	 * The label property is also by default the text that
	 * is inserted when selecting this completion.
	 *
	 * If label details are provided the label itself should
	 * be an unqualified name of the completion item.
	 */
	label: string;

	/**
	 * Additional details for the label
	 *
	 * @since 3.17.0 - proposed state
	 */
	labelDetails?: CompletionItemLabelDetails;


	/**
	 * The kind of this completion item. Based of the kind
	 * an icon is chosen by the editor. The standardized set
	 * of available values is defined in `CompletionItemKind`.
	 */
	kind?: CompletionItemKind;

	/**
	 * Tags for this completion item.
	 *
	 * @since 3.15.0
	 */
	tags?: CompletionItemTag[];

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
	 *
	 * @deprecated Use `tags` instead if supported.
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
	 * with other items. When `falsy` the label is used
	 * as the sort text for this item.
	 */
	sortText?: string;

	/**
	 * A string that should be used when filtering a set of
	 * completion items. When `falsy` the label is used as the
	 * filter text for this item.
	 */
	filterText?: string;

	/**
	 * A string that should be inserted into a document when selecting
	 * this completion. When `falsy` the label is used as the insert text
	 * for this item.
	 *
	 * The `insertText` is subject to interpretation by the client side.
	 * Some tools might not take the string literally. For example
	 * VS Code when code complete is requested in this example
	 * `con<cursor position>` and a completion item with an `insertText` of
	 * `console` is provided it will only insert `sole`. Therefore it is
	 * recommended to use `textEdit` instead since it avoids additional client
	 * side interpretation.
	 */
	insertText?: string;

	/**
	 * The format of the insert text. The format applies to both the
	 * `insertText` property and the `newText` property of a provided
	 * `textEdit`. If omitted defaults to `InsertTextFormat.PlainText`.
	 */
	insertTextFormat?: InsertTextFormat;

	/**
	 * How whitespace and indentation is handled during completion
	 * item insertion. If not provided the client's default value depends on
	 * the `textDocument.completion.insertTextMode` client capability.
	 *
	 * @since 3.16.0
	 * @since 3.17.0 - support for `textDocument.completion.insertTextMode`
	 */
	insertTextMode?: InsertTextMode;

	/**
	 * An edit which is applied to a document when selecting this completion.
	 * When an edit is provided the value of `insertText` is ignored.
	 *
	 * *Note:* The range of the edit must be a single line range and it must
	 * contain the position at which completion has been requested.
	 *
	 * Most editors support two different operations when accepting a completion
	 * item. One is to insert a completion text and the other is to replace an
	 * existing text with a completion text. Since this can usually not be
	 * predetermined by a server it can report both ranges. Clients need to
	 * signal support for `InsertReplaceEdit`s via the
	 * `textDocument.completion.completionItem.insertReplaceSupport` client
	 * capability property.
	 *
	 * *Note 1:* The text edit's range as well as both ranges from an insert
	 * replace edit must be a [single line] and they must contain the position
	 * at which completion has been requested.
	 * *Note 2:* If an `InsertReplaceEdit` is returned the edit's insert range
	 * must be a prefix of the edit's replace range, that means it must be
	 * contained and starting at the same position.
	 *
	 * @since 3.16.0 additional type `InsertReplaceEdit`
	 */
	textEdit?: TextEdit | InsertReplaceEdit;

	/**
	 * An optional array of additional text edits that are applied when
	 * selecting this completion. Edits must not overlap (including the same
	 * insert position) with the main edit nor with themselves.
	 *
	 * Additional text edits should be used to change text unrelated to the
	 * current cursor position (for example adding an import statement at the
	 * top of the file if the completion item will insert an unqualified type).
	 */
	additionalTextEdits?: TextEdit[];

	/**
	 * An optional set of characters that when pressed while this completion is
	 * active will accept it first and then type that character. *Note* that all
	 * commit characters should have `length=1` and that superfluous characters
	 * will be ignored.
	 */
	commitCharacters?: string[];

	/**
	 * An optional command that is executed *after* inserting this completion.
	 * *Note* that additional modifications to the current document should be
	 * described with the additionalTextEdits-property.
	 */
	command?: Command;

	/**
	 * A data entry field that is preserved on a completion item between
	 * a completion and a completion resolve request.
	 */
	data?: any;
}
```

<div class="anchorHolder"><a href="#completionItemKind" name="completionItemKind" class="linkableAnchor"></a></div>

```typescript
/**
 * The kind of a completion entry.
 */
export namespace CompletionItemKind {
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
* partial result: `CompletionItem[]` or `CompletionList` followed by `CompletionItem[]`. If the first provided result item is of type `CompletionList` subsequent partial results of `CompletionItem[]` add to the `items` property of the `CompletionList`.
* error: code and message set in case an exception happens during the completion request.

Completion items support snippets (see `InsertTextFormat.Snippet`). The snippet format is as follows:

##### <a href="#snippet_syntax" name="snippet_syntax" class="anchor">Snippet Syntax</a>

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

1. A [regular expression](#regExp) that is matched against the value of a variable, or the empty string when the variable cannot be resolved.
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
regex       ::= Regular Expression value (ctor-string)
options     ::= Regular Expression option (ctor-options)
var         ::= [_a-zA-Z] [_a-zA-Z0-9]*
int         ::= [0-9]+
text        ::= .*
```

#### <a href="#completionItem_resolve" name="completionItem_resolve" class="anchor">Completion Item Resolve Request (:leftwards_arrow_with_hook:)</a>

The request is sent from the client to the server to resolve additional information for a given completion item.

_Request_:
* method: `completionItem/resolve`
* params: `CompletionItem`

_Response_:
* result: `CompletionItem`
* error: code and message set in case an exception happens during the completion resolve request.

#### <a href="#textDocument_hover" name="textDocument_hover" class="anchor">Hover Request (:leftwards_arrow_with_hook:)</a>

The hover request is sent from the client to the server to request hover information at a given text document position.

_Client Capability_:
* property name (optional): `textDocument.hover`
* property type: `HoverClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#hoverClientCapabilities" name="hoverClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface HoverClientCapabilities {
	/**
	 * Whether hover supports dynamic registration.
	 */
	dynamicRegistration?: boolean;

	/**
	 * Client supports the follow content formats if the content
	 * property refers to a `literal of type MarkupContent`.
	 * The order describes the preferred format of the client.
	 */
	contentFormat?: MarkupKind[];
}
```

_Server Capability_:
* property name (optional): `hoverProvider`
* property type: `boolean | HoverOptions` where `HoverOptions` is defined as follows:

<div class="anchorHolder"><a href="#hoverOptions" name="hoverOptions" class="linkableAnchor"></a></div>

```typescript
export interface HoverOptions extends WorkDoneProgressOptions {
}
```

_Registration Options_: `HoverRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#hoverRegistrationOptions" name="hoverRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface HoverRegistrationOptions
	extends TextDocumentRegistrationOptions, HoverOptions {
}
```

_Request_:
* method: `textDocument/hover`
* params: `HoverParams` defined as follows:

<div class="anchorHolder"><a href="#hoverParams" name="hoverParams" class="linkableAnchor"></a></div>

```typescript
export interface HoverParams extends TextDocumentPositionParams,
	WorkDoneProgressParams {
}
```

_Response_:
* result: `Hover` \| `null` defined as follows:

<div class="anchorHolder"><a href="#hover" name="hover" class="linkableAnchor"></a></div>

```typescript
/**
 * The result of a hover request.
 */
export interface Hover {
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

<div class="anchorHolder"><a href="#markedString" name="markedString" class="linkableAnchor"></a></div>

```typescript
/**
 * MarkedString can be used to render human readable text. It is either a
 * markdown string or a code-block that provides a language and a code snippet.
 * The language identifier is semantically equal to the optional language
 * identifier in fenced code blocks in GitHub issues.
 *
 * The pair of a language and a value is an equivalent to markdown:
 * ```${language}
 * ${value}
 * ```
 *
 * Note that markdown strings will be sanitized - that means html will be
 * escaped.
 *
 * @deprecated use MarkupContent instead.
 */
type MarkedString = string | { language: string; value: string };
```

* error: code and message set in case an exception happens during the hover request.

#### <a href="#textDocument_signatureHelp" name="textDocument_signatureHelp" class="anchor">Signature Help Request (:leftwards_arrow_with_hook:)</a>

The signature help request is sent from the client to the server to request signature information at a given cursor position.

_Client Capability_:
* property name (optional): `textDocument.signatureHelp`
* property type: `SignatureHelpClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#signatureHelpClientCapabilities" name="signatureHelpClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface SignatureHelpClientCapabilities {
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
		 * Client supports the follow content formats for the documentation
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
			 * @since 3.14.0
			 */
			labelOffsetSupport?: boolean;
		};

		/**
		 * The client supports the `activeParameter` property on
		 * `SignatureInformation` literal.
		 *
		 * @since 3.16.0
		 */
		activeParameterSupport?: boolean;
	};

	/**
	 * The client supports to send additional context information for a
	 * `textDocument/signatureHelp` request. A client that opts into
	 * contextSupport will also support the `retriggerCharacters` on
	 * `SignatureHelpOptions`.
	 *
	 * @since 3.15.0
	 */
	contextSupport?: boolean;
}
```

_Server Capability_:
* property name (optional): `signatureHelpProvider`
* property type: `SignatureHelpOptions` defined as follows:

<div class="anchorHolder"><a href="#signatureHelpOptions" name="signatureHelpOptions" class="linkableAnchor"></a></div>

```typescript
export interface SignatureHelpOptions extends WorkDoneProgressOptions {
	/**
	 * The characters that trigger signature help
	 * automatically.
	 */
	triggerCharacters?: string[];

	/**
	 * List of characters that re-trigger signature help.
	 *
	 * These trigger characters are only active when signature help is already
	 * showing. All trigger characters are also counted as re-trigger
	 * characters.
	 *
	 * @since 3.15.0
	 */
	retriggerCharacters?: string[];
}
```

_Registration Options_: `SignatureHelpRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#signatureHelpRegistrationOptions" name="signatureHelpRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface SignatureHelpRegistrationOptions
	extends TextDocumentRegistrationOptions, SignatureHelpOptions {
}
```

_Request_:
* method: `textDocument/signatureHelp`
* params: `SignatureHelpParams` defined as follows:

<div class="anchorHolder"><a href="#signatureHelpParams" name="signatureHelpParams" class="linkableAnchor"></a></div>

```typescript
export interface SignatureHelpParams extends TextDocumentPositionParams,
	WorkDoneProgressParams {
	/**
	 * The signature help context. This is only available if the client
	 * specifies to send this using the client capability
	 * `textDocument.signatureHelp.contextSupport === true`
	 *
	 * @since 3.15.0
	 */
	context?: SignatureHelpContext;
}
```

<div class="anchorHolder"><a href="#signatureHelpTriggerKind" name="signatureHelpTriggerKind" class="linkableAnchor"></a></div>

```typescript
/**
 * How a signature help was triggered.
 *
 * @since 3.15.0
 */
export namespace SignatureHelpTriggerKind {
	/**
	 * Signature help was invoked manually by the user or by a command.
	 */
	export const Invoked: 1 = 1;
	/**
	 * Signature help was triggered by a trigger character.
	 */
	export const TriggerCharacter: 2 = 2;
	/**
	 * Signature help was triggered by the cursor moving or by the document
	 * content changing.
	 */
	export const ContentChange: 3 = 3;
}
export type SignatureHelpTriggerKind = 1 | 2 | 3;
```

<div class="anchorHolder"><a href="#signatureHelpContext" name="signatureHelpContext" class="linkableAnchor"></a></div>

```typescript
/**
 * Additional information about the context in which a signature help request
 * was triggered.
 *
 * @since 3.15.0
 */
export interface SignatureHelpContext {
	/**
	 * Action that caused signature help to be triggered.
	 */
	triggerKind: SignatureHelpTriggerKind;

	/**
	 * Character that caused signature help to be triggered.
	 *
	 * This is undefined when triggerKind !==
	 * SignatureHelpTriggerKind.TriggerCharacter
	 */
	triggerCharacter?: string;

	/**
	 * `true` if signature help was already showing when it was triggered.
	 *
	 * Retriggers occur when the signature help is already active and can be
	 * caused by actions such as typing a trigger character, a cursor move, or
	 * document content changes.
	 */
	isRetrigger: boolean;

	/**
	 * The currently active `SignatureHelp`.
	 *
	 * The `activeSignatureHelp` has its `SignatureHelp.activeSignature` field
	 * updated based on the user navigating through available signatures.
	 */
	activeSignatureHelp?: SignatureHelp;
}
```

_Response_:
* result: `SignatureHelp` \| `null` defined as follows:

<div class="anchorHolder"><a href="#signatureHelp" name="signatureHelp" class="linkableAnchor"></a></div>

```typescript
/**
 * Signature help represents the signature of something
 * callable. There can be multiple signature but only one
 * active and only one active parameter.
 */
export interface SignatureHelp {
	/**
	 * One or more signatures. If no signatures are available the signature help
	 * request should return `null`.
	 */
	signatures: SignatureInformation[];

	/**
	 * The active signature. If omitted or the value lies outside the
	 * range of `signatures` the value defaults to zero or is ignore if
	 * the `SignatureHelp` as no signatures.
	 *
	 * Whenever possible implementors should make an active decision about
	 * the active signature and shouldn't rely on a default value.
	 *
	 * In future version of the protocol this property might become
	 * mandatory to better express this.
	 */
	activeSignature?: uinteger;

	/**
	 * The active parameter of the active signature. If omitted or the value
	 * lies outside the range of `signatures[activeSignature].parameters`
	 * defaults to 0 if the active signature has parameters. If
	 * the active signature has no parameters it is ignored.
	 * In future version of the protocol this property might become
	 * mandatory to better express the active parameter if the
	 * active signature does have any.
	 */
	activeParameter?: uinteger;
}
```

<div class="anchorHolder"><a href="#signatureInformation" name="signatureInformation" class="linkableAnchor"></a></div>

```typescript
/**
 * Represents the signature of something callable. A signature
 * can have a label, like a function-name, a doc-comment, and
 * a set of parameters.
 */
export interface SignatureInformation {
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

	/**
	 * The index of the active parameter.
	 *
	 * If provided, this is used in place of `SignatureHelp.activeParameter`.
	 *
	 * @since 3.16.0
	 */
	activeParameter?: uinteger;
}
```

<div class="anchorHolder"><a href="#parameterInformation" name="parameterInformation" class="linkableAnchor"></a></div>

```typescript
/**
 * Represents a parameter of a callable-signature. A parameter can
 * have a label and a doc-comment.
 */
export interface ParameterInformation {

	/**
	 * The label of this parameter information.
	 *
	 * Either a string or an inclusive start and exclusive end offsets within
	 * its containing signature label. (see SignatureInformation.label). The
	 * offsets are based on a UTF-16 string representation as `Position` and
	 * `Range` does.
	 *
	 * *Note*: a label of type string should be a substring of its containing
	 * signature label. Its intended use case is to highlight the parameter
	 * label part in the `SignatureInformation.label`.
	 */
	label: string | [uinteger, uinteger];

	/**
	 * The human-readable doc-comment of this parameter. Will be shown
	 * in the UI but can be omitted.
	 */
	documentation?: string | MarkupContent;
}
```

* error: code and message set in case an exception happens during the signature help request.

#### <a href="#textDocument_declaration" name="textDocument_declaration" class="anchor">Goto Declaration Request (:leftwards_arrow_with_hook:)</a>

> *Since version 3.14.0*

The go to declaration request is sent from the client to the server to resolve the declaration location of a symbol at a given text document position.

The result type [`LocationLink`](#locationLink)[] got introduced with version 3.14.0 and depends on the corresponding client capability `textDocument.declaration.linkSupport`.

_Client Capability_:
* property name (optional): `textDocument.declaration`
* property type: `DeclarationClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#declarationClientCapabilities" name="declarationClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface DeclarationClientCapabilities {
	/**
	 * Whether declaration supports dynamic registration. If this is set to
	 * `true` the client supports the new `DeclarationRegistrationOptions`
	 * return value for the corresponding server capability as well.
	 */
	dynamicRegistration?: boolean;

	/**
	 * The client supports additional metadata in the form of declaration links.
	 */
	linkSupport?: boolean;
}
```

_Server Capability_:
* property name (optional): `declarationProvider`
* property type: `boolean | DeclarationOptions | DeclarationRegistrationOptions` where `DeclarationOptions` is defined as follows:

<div class="anchorHolder"><a href="#declarationOptions" name="declarationOptions" class="linkableAnchor"></a></div>

```typescript
export interface DeclarationOptions extends WorkDoneProgressOptions {
}
```

_Registration Options_: `DeclarationRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#declarationRegistrationOptions" name="declarationRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface DeclarationRegistrationOptions extends DeclarationOptions,
	TextDocumentRegistrationOptions, StaticRegistrationOptions {
}
```

_Request_:
* method: `textDocument/declaration`
* params: `DeclarationParams` defined as follows:

<div class="anchorHolder"><a href="#declarationParams" name="declarationParams" class="linkableAnchor"></a></div>

```typescript
export interface DeclarationParams extends TextDocumentPositionParams,
	WorkDoneProgressParams, PartialResultParams {
}
```

_Response_:
* result: [`Location`](#location) \| [`Location`](#location)[] \| [`LocationLink`](#locationLink)[] \|`null`
* partial result: [`Location`](#location)[] \| [`LocationLink`](#locationLink)[]
* error: code and message set in case an exception happens during the declaration request.

#### <a href="#textDocument_definition" name="textDocument_definition" class="anchor">Goto Definition Request (:leftwards_arrow_with_hook:)</a>

The go to definition request is sent from the client to the server to resolve the definition location of a symbol at a given text document position.

The result type [`LocationLink`](#locationLink)[] got introduced with version 3.14.0 and depends on the corresponding client capability `textDocument.definition.linkSupport`.

_Client Capability_:
* property name (optional): `textDocument.definition`
* property type: `DefinitionClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#definitionClientCapabilities" name="definitionClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface DefinitionClientCapabilities {
	/**
	 * Whether definition supports dynamic registration.
	 */
	dynamicRegistration?: boolean;

	/**
	 * The client supports additional metadata in the form of definition links.
	 *
	 * @since 3.14.0
	 */
	linkSupport?: boolean;
}
```

_Server Capability_:
* property name (optional): `definitionProvider`
* property type: `boolean | DefinitionOptions` where `DefinitionOptions` is defined as follows:

<div class="anchorHolder"><a href="#definitionOptions" name="definitionOptions" class="linkableAnchor"></a></div>

```typescript
export interface DefinitionOptions extends WorkDoneProgressOptions {
}
```

_Registration Options_: `DefinitionRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#definitionRegistrationOptions" name="definitionRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface DefinitionRegistrationOptions extends
	TextDocumentRegistrationOptions, DefinitionOptions {
}
```

_Request_:
* method: `textDocument/definition`
* params: `DefinitionParams` defined as follows:

<div class="anchorHolder"><a href="#definitionParams" name="definitionParams" class="linkableAnchor"></a></div>

```typescript
export interface DefinitionParams extends TextDocumentPositionParams,
	WorkDoneProgressParams, PartialResultParams {
}
```

_Response_:
* result: [`Location`](#location) \| [`Location`](#location)[] \| [`LocationLink`](#locationLink)[] \| `null`
* partial result: [`Location`](#location)[] \| [`LocationLink`](#locationLink)[]
* error: code and message set in case an exception happens during the definition request.

#### <a href="#textDocument_typeDefinition" name="textDocument_typeDefinition" class="anchor">Goto Type Definition Request (:leftwards_arrow_with_hook:)</a>

> *Since version 3.6.0*

The go to type definition request is sent from the client to the server to resolve the type definition location of a symbol at a given text document position.

The result type [`LocationLink`](#locationLink)[] got introduced with version 3.14.0 and depends on the corresponding client capability `textDocument.typeDefinition.linkSupport`.

_Client Capability_:
* property name (optional): `textDocument.typeDefinition`
* property type: `TypeDefinitionClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#typeDefinitionClientCapabilities" name="typeDefinitionClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface TypeDefinitionClientCapabilities {
	/**
	 * Whether implementation supports dynamic registration. If this is set to
	 * `true` the client supports the new `TypeDefinitionRegistrationOptions`
	 * return value for the corresponding server capability as well.
	 */
	dynamicRegistration?: boolean;

	/**
	 * The client supports additional metadata in the form of definition links.
	 *
	 * @since 3.14.0
	 */
	linkSupport?: boolean;
}
```

_Server Capability_:
* property name (optional): `typeDefinitionProvider`
* property type: `boolean | TypeDefinitionOptions | TypeDefinitionRegistrationOptions` where `TypeDefinitionOptions` is defined as follows:

<div class="anchorHolder"><a href="#typeDefinitionOptions" name="typeDefinitionOptions" class="linkableAnchor"></a></div>

```typescript
export interface TypeDefinitionOptions extends WorkDoneProgressOptions {
}
```

_Registration Options_: `TypeDefinitionRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#typeDefinitionRegistrationOptions" name="typeDefinitionRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface TypeDefinitionRegistrationOptions extends
	TextDocumentRegistrationOptions, TypeDefinitionOptions,
	StaticRegistrationOptions {
}
```

_Request_:
* method: `textDocument/typeDefinition`
* params: `TypeDefinitionParams` defined as follows:

<div class="anchorHolder"><a href="#typeDefinitionParams" name="typeDefinitionParams" class="linkableAnchor"></a></div>

```typescript
export interface TypeDefinitionParams extends TextDocumentPositionParams,
	WorkDoneProgressParams, PartialResultParams {
}
```

_Response_:
* result: [`Location`](#location) \| [`Location`](#location)[] \| [`LocationLink`](#locationLink)[] \| `null`
* partial result: [`Location`](#location)[] \| [`LocationLink`](#locationLink)[]
* error: code and message set in case an exception happens during the definition request.

#### <a href="#textDocument_implementation" name="textDocument_implementation" class="anchor">Goto Implementation Request (:leftwards_arrow_with_hook:)</a>

> *Since version 3.6.0*

The go to implementation request is sent from the client to the server to resolve the implementation location of a symbol at a given text document position.

The result type [`LocationLink`](#locationLink)[] got introduced with version 3.14.0 and depends on the corresponding client capability `textDocument.implementation.linkSupport`.

_Client Capability_:
* property name (optional): `textDocument.implementation`
* property type: `ImplementationClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#implementationClientCapabilities" name="implementationClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface ImplementationClientCapabilities {
	/**
	 * Whether implementation supports dynamic registration. If this is set to
	 * `true` the client supports the new `ImplementationRegistrationOptions`
	 * return value for the corresponding server capability as well.
	 */
	dynamicRegistration?: boolean;

	/**
	 * The client supports additional metadata in the form of definition links.
	 *
	 * @since 3.14.0
	 */
	linkSupport?: boolean;
}
```

_Server Capability_:
* property name (optional): `implementationProvider`
* property type: `boolean | ImplementationOptions | ImplementationRegistrationOptions` where `ImplementationOptions` is defined as follows:

<div class="anchorHolder"><a href="#implementationOptions" name="implementationOptions" class="linkableAnchor"></a></div>

```typescript
export interface ImplementationOptions extends WorkDoneProgressOptions {
}
```

_Registration Options_: `ImplementationRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#implementationRegistrationOptions" name="implementationRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface ImplementationRegistrationOptions extends
	TextDocumentRegistrationOptions, ImplementationOptions,
	StaticRegistrationOptions {
}
```

_Request_:
* method: `textDocument/implementation`
* params: `ImplementationParams` defined as follows:

<div class="anchorHolder"><a href="#implementationParams" name="implementationParams" class="linkableAnchor"></a></div>

```typescript
export interface ImplementationParams extends TextDocumentPositionParams,
	WorkDoneProgressParams, PartialResultParams {
}
```

_Response_:
* result: [`Location`](#location) \| [`Location`](#location)[] \| [`LocationLink`](#locationLink)[] \| `null`
* partial result: [`Location`](#location)[] \| [`LocationLink`](#locationLink)[]
* error: code and message set in case an exception happens during the definition request.

#### <a href="#textDocument_references" name="textDocument_references" class="anchor">Find References Request (:leftwards_arrow_with_hook:)</a>

The references request is sent from the client to the server to resolve project-wide references for the symbol denoted by the given text document position.

_Client Capability_:
* property name (optional): `textDocument.references`
* property type: `ReferenceClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#referenceClientCapabilities" name="referenceClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface ReferenceClientCapabilities {
	/**
	 * Whether references supports dynamic registration.
	 */
	dynamicRegistration?: boolean;
}
```

_Server Capability_:
* property name (optional): `referencesProvider`
* property type: `boolean | ReferenceOptions` where `ReferenceOptions` is defined as follows:

<div class="anchorHolder"><a href="#referenceOptions" name="referenceOptions" class="linkableAnchor"></a></div>

```typescript
export interface ReferenceOptions extends WorkDoneProgressOptions {
}
```

_Registration Options_: `ReferenceRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#referenceRegistrationOptions" name="referenceRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface ReferenceRegistrationOptions extends
	TextDocumentRegistrationOptions, ReferenceOptions {
}
```

_Request_:
* method: `textDocument/references`
* params: `ReferenceParams` defined as follows:

<div class="anchorHolder"><a href="#referenceParams" name="referenceParams" class="linkableAnchor"></a></div>

```typescript
export interface ReferenceParams extends TextDocumentPositionParams,
	WorkDoneProgressParams, PartialResultParams {
	context: ReferenceContext;
}
```

<div class="anchorHolder"><a href="#referenceContext" name="referenceContext" class="linkableAnchor"></a></div>

```typescript
export interface ReferenceContext {
	/**
	 * Include the declaration of the current symbol.
	 */
	includeDeclaration: boolean;
}
```
_Response_:
* result: [`Location`](#location)[] \| `null`
* partial result: [`Location`](#location)[]
* error: code and message set in case an exception happens during the reference request.

#### <a href="#textDocument_documentHighlight" name="textDocument_documentHighlight" class="anchor">Document Highlights Request (:leftwards_arrow_with_hook:)</a>

The document highlight request is sent from the client to the server to resolve a document highlights for a given text document position.
For programming languages this usually highlights all references to the symbol scoped to this file. However we kept 'textDocument/documentHighlight'
and 'textDocument/references' separate requests since the first one is allowed to be more fuzzy. Symbol matches usually have a `DocumentHighlightKind`
of `Read` or `Write` whereas fuzzy or textual matches use `Text`as the kind.

_Client Capability_:
* property name (optional): `textDocument.documentHighlight`
* property type: `DocumentHighlightClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#documentHighlightClientCapabilities" name="documentHighlightClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface DocumentHighlightClientCapabilities {
	/**
	 * Whether document highlight supports dynamic registration.
	 */
	dynamicRegistration?: boolean;
}
```

_Server Capability_:
* property name (optional): `documentHighlightProvider`
* property type: `boolean | DocumentHighlightOptions` where `DocumentHighlightOptions` is defined as follows:

<div class="anchorHolder"><a href="#documentHighlightOptions" name="documentHighlightOptions" class="linkableAnchor"></a></div>

```typescript
export interface DocumentHighlightOptions extends WorkDoneProgressOptions {
}
```

_Registration Options_: `DocumentHighlightRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#documentHighlightRegistrationOptions" name="documentHighlightRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface DocumentHighlightRegistrationOptions extends
	TextDocumentRegistrationOptions, DocumentHighlightOptions {
}
```

_Request_:
* method: `textDocument/documentHighlight`
* params: `DocumentHighlightParams` defined as follows:

<div class="anchorHolder"><a href="#documentHighlightParams" name="documentHighlightParams" class="linkableAnchor"></a></div>

```typescript
export interface DocumentHighlightParams extends TextDocumentPositionParams,
	WorkDoneProgressParams, PartialResultParams {
}
```

_Response_:
* result: `DocumentHighlight[]` \| `null` defined as follows:

<div class="anchorHolder"><a href="#documentHighlight" name="documentHighlight" class="linkableAnchor"></a></div>

```typescript
/**
 * A document highlight is a range inside a text document which deserves
 * special attention. Usually a document highlight is visualized by changing
 * the background color of its range.
 *
 */
export interface DocumentHighlight {
	/**
	 * The range this highlight applies to.
	 */
	range: Range;

	/**
	 * The highlight kind, default is DocumentHighlightKind.Text.
	 */
	kind?: DocumentHighlightKind;
}
```

<div class="anchorHolder"><a href="#documentHighlightKind" name="documentHighlightKind" class="linkableAnchor"></a></div>

```typescript
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

export type DocumentHighlightKind = 1 | 2 | 3;
```

* partial result: `DocumentHighlight[]`
* error: code and message set in case an exception happens during the document highlight request.

#### <a href="#textDocument_documentSymbol" name="textDocument_documentSymbol" class="anchor">Document Symbols Request (:leftwards_arrow_with_hook:)</a>

The document symbol request is sent from the client to the server. The returned result is either

- `SymbolInformation[]` which is a flat list of all symbols found in a given text document. Then neither the symbol's location range nor the symbol's container name should be used to infer a hierarchy.
- `DocumentSymbol[]` which is a hierarchy of symbols found in a given text document.

Servers should whenever possible return `DocumentSymbol` since it is the richer data structure.

_Client Capability_:
* property name (optional): `textDocument.documentSymbol`
* property type: `DocumentSymbolClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#documentSymbolClientCapabilities" name="documentSymbolClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface DocumentSymbolClientCapabilities {
	/**
	 * Whether document symbol supports dynamic registration.
	 */
	dynamicRegistration?: boolean;

	/**
	 * Specific capabilities for the `SymbolKind` in the
	 * `textDocument/documentSymbol` request.
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
	};

	/**
	 * The client supports hierarchical document symbols.
	 */
	hierarchicalDocumentSymbolSupport?: boolean;

	/**
	 * The client supports tags on `SymbolInformation`. Tags are supported on
	 * `DocumentSymbol` if `hierarchicalDocumentSymbolSupport` is set to true.
	 * Clients supporting tags have to handle unknown tags gracefully.
	 *
	 * @since 3.16.0
	 */
	tagSupport?: {
		/**
		 * The tags supported by the client.
		 */
		valueSet: SymbolTag[];
	};

	/**
	 * The client supports an additional label presented in the UI when
	 * registering a document symbol provider.
	 *
	 * @since 3.16.0
	 */
	labelSupport?: boolean;
}
```

_Server Capability_:
* property name (optional): `documentSymbolProvider`
* property type: `boolean | DocumentSymbolOptions` where `DocumentSymbolOptions` is defined as follows:

<div class="anchorHolder"><a href="#documentSymbolOptions" name="documentSymbolOptions" class="linkableAnchor"></a></div>

```typescript
export interface DocumentSymbolOptions extends WorkDoneProgressOptions {
	/**
	 * A human-readable string that is shown when multiple outlines trees
	 * are shown for the same document.
	 *
	 * @since 3.16.0
	 */
	label?: string;
}
```

_Registration Options_: `DocumentSymbolRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#documentSymbolRegistrationOptions" name="documentSymbolRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface DocumentSymbolRegistrationOptions extends
	TextDocumentRegistrationOptions, DocumentSymbolOptions {
}
```

_Request_:
* method: `textDocument/documentSymbol`
* params: `DocumentSymbolParams` defined as follows:

<div class="anchorHolder"><a href="#documentSymbolParams" name="documentSymbolParams" class="linkableAnchor"></a></div>

```typescript
export interface DocumentSymbolParams extends WorkDoneProgressParams,
	PartialResultParams {
	/**
	 * The text document.
	 */
	textDocument: TextDocumentIdentifier;
}
```

_Response_:
* result: `DocumentSymbol[]` \| `SymbolInformation[]` \| `null` defined as follows:

<div class="anchorHolder"><a href="#symbolKind" name="symbolKind" class="linkableAnchor"></a></div>

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
```

<div class="anchorHolder"><a href="#symbolTag" name="symbolTag" class="linkableAnchor"></a></div>

```typescript
/**
 * Symbol tags are extra annotations that tweak the rendering of a symbol.
 *
 * @since 3.16
 */
export namespace SymbolTag {

	/**
	 * Render a symbol as obsolete, usually using a strike-out.
	 */
	export const Deprecated: 1 = 1;
}

export type SymbolTag = 1;
```

<div class="anchorHolder"><a href="#documentSymbol" name="documentSymbol" class="linkableAnchor"></a></div>

```typescript
/**
 * Represents programming constructs like variables, classes, interfaces etc.
 * that appear in a document. Document symbols can be hierarchical and they
 * have two ranges: one that encloses its definition and one that points to its
 * most interesting range, e.g. the range of an identifier.
 */
export interface DocumentSymbol {

	/**
	 * The name of this symbol. Will be displayed in the user interface and
	 * therefore must not be an empty string or a string only consisting of
	 * white spaces.
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
	 * Tags for this document symbol.
	 *
	 * @since 3.16.0
	 */
	tags?: SymbolTag[];

	/**
	 * Indicates if this symbol is deprecated.
	 *
	 * @deprecated Use tags instead
	 */
	deprecated?: boolean;

	/**
	 * The range enclosing this symbol not including leading/trailing whitespace
	 * but everything else like comments. This information is typically used to
	 * determine if the clients cursor is inside the symbol to reveal in the
	 * symbol in the UI.
	 */
	range: Range;

	/**
	 * The range that should be selected and revealed when this symbol is being
	 * picked, e.g. the name of a function. Must be contained by the `range`.
	 */
	selectionRange: Range;

	/**
	 * Children of this symbol, e.g. properties of a class.
	 */
	children?: DocumentSymbol[];
}
```

<div class="anchorHolder"><a href="#symbolInformation" name="symbolInformation" class="linkableAnchor"></a></div>

```typescript
/**
 * Represents information about programming constructs like variables, classes,
 * interfaces etc.
 */
export interface SymbolInformation {
	/**
	 * The name of this symbol.
	 */
	name: string;

	/**
	 * The kind of this symbol.
	 */
	kind: SymbolKind;

	/**
	 * Tags for this symbol.
	 *
	 * @since 3.16.0
	 */
	tags?: SymbolTag[];

	/**
	 * Indicates if this symbol is deprecated.
	 *
	 * @deprecated Use tags instead
	 */
	deprecated?: boolean;

	/**
	 * The location of this symbol. The location's range is used by a tool
	 * to reveal the location in the editor. If the symbol is selected in the
	 * tool the range's start information is used to position the cursor. So
	 * the range usually spans more then the actual symbol's name and does
	 * normally include things like visibility modifiers.
	 *
	 * The range doesn't have to denote a node range in the sense of a abstract
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

* partial result: `DocumentSymbol[]` \| `SymbolInformation[]`. `DocumentSymbol[]` and `SymbolInformation[]` can not be mixed. That means the first chunk defines the type of all the other chunks.
* error: code and message set in case an exception happens during the document symbol request.

#### <a href="#textDocument_codeAction" name="textDocument_codeAction" class="anchor">Code Action Request (:leftwards_arrow_with_hook:)</a>

The code action request is sent from the client to the server to compute commands for a given text document and range. These commands are typically code fixes to either fix problems or to beautify/refactor code. The result of a `textDocument/codeAction` request is an array of `Command` literals which are typically presented in the user interface. To ensure that a server is useful in many clients the commands specified in a code actions should be handled by the server and not by the client (see `workspace/executeCommand` and `ServerCapabilities.executeCommandProvider`). If the client supports providing edits with a code action then that mode should be used.

*Since version 3.16.0:* a client can offer a server to delay the computation of code action properties during a 'textDocument/codeAction' request:

This is useful for cases where it is expensive to compute the value of a property (for example the `edit` property). Clients signal this through the `codeAction.resolveSupport` capability which lists all properties a client can resolve lazily. The server capability `codeActionProvider.resolveProvider` signals that a server will offer a `codeAction/resolve` route. To help servers to uniquely identify a code action in the resolve request, a code action literal can optional carry a data property. This is also guarded by an additional client capability `codeAction.dataSupport`. In general, a client should offer data support if it offers resolve support. It should also be noted that servers shouldn't alter existing attributes of a code action in a codeAction/resolve request.

> *Since version 3.8.0:* support for CodeAction literals to enable the following scenarios:

- the ability to directly return a workspace edit from the code action request. This avoids having another server roundtrip to execute an actual code action. However server providers should be aware that if the code action is expensive to compute or the edits are huge it might still be beneficial if the result is simply a command and the actual edit is only computed when needed.
- the ability to group code actions using a kind. Clients are allowed to ignore that information. However it allows them to better group code action for example into corresponding menus (e.g. all refactor code actions into a refactor menu).

Clients need to announce their support for code action literals (e.g. literals of type `CodeAction`) and code action kinds via the corresponding client capability `codeAction.codeActionLiteralSupport`.

_Client Capability_:
* property name (optional): `textDocument.codeAction`
* property type: `CodeActionClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#codeActionClientCapabilities" name="codeActionClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface CodeActionClientCapabilities {
	/**
	 * Whether code action supports dynamic registration.
	 */
	dynamicRegistration?: boolean;

	/**
	 * The client supports code action literals as a valid
	 * response of the `textDocument/codeAction` request.
	 *
	 * @since 3.8.0
	 */
	codeActionLiteralSupport?: {
		/**
		 * The code action kind is supported with the following value
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

	/**
	 * Whether code action supports the `isPreferred` property.
	 *
	 * @since 3.15.0
	 */
	isPreferredSupport?: boolean;

	/**
	 * Whether code action supports the `disabled` property.
	 *
	 * @since 3.16.0
	 */
	disabledSupport?: boolean;

	/**
	 * Whether code action supports the `data` property which is
	 * preserved between a `textDocument/codeAction` and a
	 * `codeAction/resolve` request.
	 *
	 * @since 3.16.0
	 */
	dataSupport?: boolean;


	/**
	 * Whether the client supports resolving additional code action
	 * properties via a separate `codeAction/resolve` request.
	 *
	 * @since 3.16.0
	 */
	resolveSupport?: {
		/**
		 * The properties that a client can resolve lazily.
		 */
		properties: string[];
	};

	/**
	 * Whether the client honors the change annotations in
	 * text edits and resource operations returned via the
	 * `CodeAction#edit` property by for example presenting
	 * the workspace edit in the user interface and asking
	 * for confirmation.
	 *
	 * @since 3.16.0
	 */
	honorsChangeAnnotations?: boolean;
}
```

_Server Capability_:
* property name (optional): `codeActionProvider`
* property type: `boolean | CodeActionOptions` where `CodeActionOptions` is defined as follows:

<div class="anchorHolder"><a href="#codeActionOptions" name="codeActionOptions" class="linkableAnchor"></a></div>

```typescript
export interface CodeActionOptions extends WorkDoneProgressOptions {
	/**
	 * CodeActionKinds that this server may return.
	 *
	 * The list of kinds may be generic, such as `CodeActionKind.Refactor`,
	 * or the server may list out every specific kind they provide.
	 */
	codeActionKinds?: CodeActionKind[];

	/**
	 * The server provides support to resolve additional
	 * information for a code action.
	 *
	 * @since 3.16.0
	 */
	resolveProvider?: boolean;
}
```

_Registration Options_: `CodeActionRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#codeActionRegistrationOptions" name="codeActionRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface CodeActionRegistrationOptions extends
	TextDocumentRegistrationOptions, CodeActionOptions {
}
```

_Request_:
* method: `textDocument/codeAction`
* params: `CodeActionParams` defined as follows:

<div class="anchorHolder"><a href="#codeActionParams" name="codeActionParams" class="linkableAnchor"></a></div>

```typescript
/**
 * Params for the CodeActionRequest
 */
export interface CodeActionParams extends WorkDoneProgressParams,
	PartialResultParams {
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
```

<div class="anchorHolder"><a href="#codeActionKind" name="codeActionKind" class="linkableAnchor"></a></div>

```typescript
/**
 * The kind of a code action.
 *
 * Kinds are a hierarchical list of identifiers separated by `.`,
 * e.g. `"refactor.extract.function"`.
 *
 * The set of kinds is open and client needs to announce the kinds it supports
 * to the server during initialization.
 */
export type CodeActionKind = string;

/**
 * A set of predefined code action kinds.
 */
export namespace CodeActionKind {

	/**
	 * Empty kind.
	 */
	export const Empty: CodeActionKind = '';

	/**
	 * Base kind for quickfix actions: 'quickfix'.
	 */
	export const QuickFix: CodeActionKind = 'quickfix';

	/**
	 * Base kind for refactoring actions: 'refactor'.
	 */
	export const Refactor: CodeActionKind = 'refactor';

	/**
	 * Base kind for refactoring extraction actions: 'refactor.extract'.
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
	 * Base kind for refactoring inline actions: 'refactor.inline'.
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
	 * Base kind for refactoring rewrite actions: 'refactor.rewrite'.
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
	 * Base kind for source actions: `source`.
	 *
	 * Source code actions apply to the entire file.
	 */
	export const Source: CodeActionKind = 'source';

	/**
	 * Base kind for an organize imports source action:
	 * `source.organizeImports`.
	 */
	export const SourceOrganizeImports: CodeActionKind =
		'source.organizeImports';

	/**
	 * Base kind for a 'fix all' source action: `source.fixAll`.
	 *
	 * 'Fix all' actions automatically fix errors that have a clear fix that
	 * do not require user input. They should not suppress errors or perform
	 * unsafe fixes such as generating new types or classes.
	 *
	 * @since 3.17.0
	 */
	export const SourceFixAll: CodeActionKind = 'source.fixAll';
}
```

<div class="anchorHolder"><a href="#codeActionContext" name="codeActionContext" class="linkableAnchor"></a></div>

```typescript
/**
 * Contains additional diagnostic information about the context in which
 * a code action is run.
 */
export interface CodeActionContext {
	/**
	 * An array of diagnostics known on the client side overlapping the range
	 * provided to the `textDocument/codeAction` request. They are provided so
	 * that the server knows which errors are currently presented to the user
	 * for the given range. There is no guarantee that these accurately reflect
	 * the error state of the resource. The primary parameter
	 * to compute code actions is the provided range.
	 */
	diagnostics: Diagnostic[];

	/**
	 * Requested kind of actions to return.
	 *
	 * Actions not of this kind are filtered out by the client before being
	 * shown. So servers can omit computing them.
	 */
	only?: CodeActionKind[];
}
```

_Response_:
* result: `(Command | CodeAction)[]` \| `null` where `CodeAction` is defined as follows:

<div class="anchorHolder"><a href="#codeAction" name="codeAction" class="linkableAnchor"></a></div>

```typescript
/**
 * A code action represents a change that can be performed in code, e.g. to fix
 * a problem or to refactor code.
 *
 * A CodeAction must set either `edit` and/or a `command`. If both are supplied,
 * the `edit` is applied first, then the `command` is executed.
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
	 * Marks this as a preferred action. Preferred actions are used by the
	 * `auto fix` command and can be targeted by keybindings.
	 *
	 * A quick fix should be marked preferred if it properly addresses the
	 * underlying error. A refactoring should be marked preferred if it is the
	 * most reasonable choice of actions to take.
	 *
	 * @since 3.15.0
	 */
	isPreferred?: boolean;

	/**
	 * Marks that the code action cannot currently be applied.
	 *
	 * Clients should follow the following guidelines regarding disabled code
	 * actions:
	 *
	 * - Disabled code actions are not shown in automatic lightbulbs code
	 *   action menus.
	 *
	 * - Disabled actions are shown as faded out in the code action menu when
	 *   the user request a more specific type of code action, such as
	 *   refactorings.
	 *
	 * - If the user has a keybinding that auto applies a code action and only
	 *   a disabled code actions are returned, the client should show the user
	 *   an error message with `reason` in the editor.
	 *
	 * @since 3.16.0
	 */
	disabled?: {

		/**
		 * Human readable description of why the code action is currently
		 * disabled.
		 *
		 * This is displayed in the code actions UI.
		 */
		reason: string;
	};

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

	/**
	 * A data entry field that is preserved on a code action between
	 * a `textDocument/codeAction` and a `codeAction/resolve` request.
	 *
	 * @since 3.16.0
	 */
	data?: any;
}
```
* partial result: `(Command | CodeAction)[]`
* error: code and message set in case an exception happens during the code action request.

#### <a href="#codeAction_resolve" name="codeAction_resolve" class="anchor">Code Action Resolve Request (:leftwards_arrow_with_hook:)</a>

> *Since version 3.16.0*

The request is sent from the client to the server to resolve additional information for a given code action. This is usually used to compute
the `edit` property of a code action to avoid its unnecessary computation during the `textDocument/codeAction` request.

Consider the clients announces the `edit` property as a property that can be resolved lazy using the client capability

```typescript
textDocument.codeAction.resolveSupport = { properties: ['edit'] };
```

then a code action

```typescript
{
    "title": "Do Foo"
}
```

needs to be resolved using the `codeAction/resolve` request before it can be applied.

_Client Capability_:
* property name (optional): `textDocument.codeAction.resolveSupport`
* property type: `{ properties: string[]; }`

_Request_:
* method: `codeAction/resolve`
* params: `CodeAction`

_Response_:
* result: `CodeAction`
* error: code and message set in case an exception happens during the completion resolve request.

#### <a href="#textDocument_codeLens" name="textDocument_codeLens" class="anchor">Code Lens Request (:leftwards_arrow_with_hook:)</a>

The code lens request is sent from the client to the server to compute code lenses for a given text document.

_Client Capability_:
* property name (optional): `textDocument.codeLens`
* property type: `CodeLensClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#codeLensClientCapabilities" name="codeLensClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface CodeLensClientCapabilities {
	/**
	 * Whether code lens supports dynamic registration.
	 */
	dynamicRegistration?: boolean;
}
```

_Server Capability_:
* property name (optional): `codeLensProvider`
* property type: `CodeLensOptions` defined as follows:

<div class="anchorHolder"><a href="#codeLensOptions" name="codeLensOptions" class="linkableAnchor"></a></div>

```typescript
export interface CodeLensOptions extends WorkDoneProgressOptions {
	/**
	 * Code lens has a resolve provider as well.
	 */
	resolveProvider?: boolean;
}
```

_Registration Options_: `CodeLensRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#codeLensRegistrationOptions" name="codeLensRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface CodeLensRegistrationOptions extends
	TextDocumentRegistrationOptions, CodeLensOptions {
}
```

_Request_:
* method: `textDocument/codeLens`
* params: `CodeLensParams` defined as follows:

<div class="anchorHolder"><a href="#codeLensParams" name="codeLensParams" class="linkableAnchor"></a></div>

```typescript
interface CodeLensParams extends WorkDoneProgressParams, PartialResultParams {
	/**
	 * The document to request code lens for.
	 */
	textDocument: TextDocumentIdentifier;
}
```

_Response_:
* result: `CodeLens[]` \| `null` defined as follows:

<div class="anchorHolder"><a href="#codeLens" name="codeLens" class="linkableAnchor"></a></div>

```typescript
/**
 * A code lens represents a command that should be shown along with
 * source text, like the number of references, a way to run tests, etc.
 *
 * A code lens is _unresolved_ when no command is associated to it. For
 * performance reasons the creation of a code lens and resolving should be done
 * in two stages.
 */
interface CodeLens {
	/**
	 * The range in which this code lens is valid. Should only span a single
	 * line.
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
	data?: any;
}
```
* partial result: `CodeLens[]`
* error: code and message set in case an exception happens during the code lens request.

#### <a href="#codeLens_resolve" name="codeLens_resolve" class="anchor">Code Lens Resolve Request (:leftwards_arrow_with_hook:)</a>

The code lens resolve request is sent from the client to the server to resolve the command for a given code lens item.

_Request_:
* method: `codeLens/resolve`
* params: `CodeLens`

_Response_:
* result: `CodeLens`
* error: code and message set in case an exception happens during the code lens resolve request.

#### <a href="#codeLens_refresh" name="codeLens_refresh" class="anchor">Code Lens Refresh Request (:arrow_right_hook:)</a>

> *Since version 3.16.0*

The `workspace/codeLens/refresh` request is sent from the server to the client. Servers can use it to ask clients to refresh the code lenses currently shown in editors. As a result the client should ask the server to recompute the code lenses for these editors. This is useful if a server detects a configuration change which requires a re-calculation of all code lenses. Note that the client still has the freedom to delay the re-calculation of the code lenses if for example an editor is currently not visible.

_Client Capability_:

* property name (optional): `workspace.codeLens`
* property type: `CodeLensWorkspaceClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#codeLensWorkspaceClientCapabilities" name="codeLensWorkspaceClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface CodeLensWorkspaceClientCapabilities {
	/**
	 * Whether the client implementation supports a refresh request sent from the
	 * server to the client.
	 *
	 * Note that this event is global and will force the client to refresh all
	 * code lenses currently shown. It should be used with absolute care and is
	 * useful for situation where a server for example detect a project wide
	 * change that requires such a calculation.
	 */
	refreshSupport?: boolean;
}
```

_Request_:

* method: `workspace/codeLens/refresh`
* params: none

_Response_:

* result: void
* error: code and message set in case an exception happens during the 'workspace/codeLens/refresh' request

#### <a href="#textDocument_documentLink" name="textDocument_documentLink" class="anchor">Document Link Request (:leftwards_arrow_with_hook:)</a>

The document links request is sent from the client to the server to request the location of links in a document.

_Client Capability_:
* property name (optional): `textDocument.documentLink`
* property type: `DocumentLinkClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#documentLinkClientCapabilities" name="documentLinkClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface DocumentLinkClientCapabilities {
	/**
	 * Whether document link supports dynamic registration.
	 */
	dynamicRegistration?: boolean;

	/**
	 * Whether the client supports the `tooltip` property on `DocumentLink`.
	 *
	 * @since 3.15.0
	 */
	tooltipSupport?: boolean;
}
```

_Server Capability_:
* property name (optional): `documentLinkProvider`
* property type: `DocumentLinkOptions` defined as follows:

<div class="anchorHolder"><a href="#documentLinkOptions" name="documentLinkOptions" class="linkableAnchor"></a></div>

```typescript
export interface DocumentLinkOptions extends WorkDoneProgressOptions {
	/**
	 * Document links have a resolve provider as well.
	 */
	resolveProvider?: boolean;
}
```

_Registration Options_: `DocumentLinkRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#documentLinkRegistrationOptions" name="documentLinkRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface DocumentLinkRegistrationOptions extends
	TextDocumentRegistrationOptions, DocumentLinkOptions {
}
```

_Request_:
* method: `textDocument/documentLink`
* params: `DocumentLinkParams` defined as follows:

<div class="anchorHolder"><a href="#documentLinkParams" name="documentLinkParams" class="linkableAnchor"></a></div>

```typescript
interface DocumentLinkParams extends WorkDoneProgressParams,
	PartialResultParams {
	/**
	 * The document to provide document links for.
	 */
	textDocument: TextDocumentIdentifier;
}
```

_Response_:
* result: `DocumentLink[]` \| `null`.

<div class="anchorHolder"><a href="#documentLink" name="documentLink" class="linkableAnchor"></a></div>

```typescript
/**
 * A document link is a range in a text document that links to an internal or
 * external resource, like another text document or a web site.
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
	 * The tooltip text when you hover over this link.
	 *
	 * If a tooltip is provided, is will be displayed in a string that includes
	 * instructions on how to trigger the link, such as `{0} (ctrl + click)`.
	 * The specific instructions vary depending on OS, user settings, and
	 * localization.
	 *
	 * @since 3.15.0
	 */
	tooltip?: string;

	/**
	 * A data entry field that is preserved on a document link between a
	 * DocumentLinkRequest and a DocumentLinkResolveRequest.
	 */
	data?: any;
}
```
* partial result: `DocumentLink[]`
* error: code and message set in case an exception happens during the document link request.

#### <a href="#documentLink_resolve" name="documentLink_resolve" class="anchor">Document Link Resolve Request (:leftwards_arrow_with_hook:)</a>

The document link resolve request is sent from the client to the server to resolve the target of a given document link.

_Request_:
* method: `documentLink/resolve`
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

_Client Capability_:
* property name (optional): `textDocument.colorProvider`
* property type: `DocumentColorClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#documentColorClientCapabilities" name="documentColorClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface DocumentColorClientCapabilities {
	/**
	 * Whether document color supports dynamic registration.
	 */
	dynamicRegistration?: boolean;
}
```

_Server Capability_:
* property name (optional): `colorProvider`
* property type: `boolean | DocumentColorOptions | DocumentColorRegistrationOptions` where `DocumentColorOptions` is defined as follows:

<div class="anchorHolder"><a href="#documentColorOptions" name="documentColorOptions" class="linkableAnchor"></a></div>

```typescript
export interface DocumentColorOptions extends WorkDoneProgressOptions {
}
```

_Registration Options_: `DocumentColorRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#documentColorRegistrationOptions" name="documentColorRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface DocumentColorRegistrationOptions extends
	TextDocumentRegistrationOptions, StaticRegistrationOptions,
	DocumentColorOptions {
}
```

_Request_:

* method: `textDocument/documentColor`
* params: `DocumentColorParams` defined as follows

<div class="anchorHolder"><a href="#documentColorParams" name="documentColorParams" class="linkableAnchor"></a></div>

```typescript
interface DocumentColorParams extends WorkDoneProgressParams,
	PartialResultParams {
	/**
	 * The text document.
	 */
	textDocument: TextDocumentIdentifier;
}
```

_Response_:
* result: `ColorInformation[]` defined as follows:

<div class="anchorHolder"><a href="#colorInformation" name="colorInformation" class="linkableAnchor"></a></div>

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
```

<div class="anchorHolder"><a href="#color" name="color" class="linkableAnchor"></a></div>

```typescript
/**
 * Represents a color in RGBA space.
 */
interface Color {

	/**
	 * The red component of this color in the range [0-1].
	 */
	readonly red: decimal;

	/**
	 * The green component of this color in the range [0-1].
	 */
	readonly green: decimal;

	/**
	 * The blue component of this color in the range [0-1].
	 */
	readonly blue: decimal;

	/**
	 * The alpha component of this color in the range [0-1].
	 */
	readonly alpha: decimal;
}
```
* partial result: `ColorInformation[]`
* error: code and message set in case an exception happens during the 'textDocument/documentColor' request

#### <a href="#textDocument_colorPresentation" name="textDocument_colorPresentation" class="anchor">Color Presentation Request (:leftwards_arrow_with_hook:)</a>

> *Since version 3.6.0*

The color presentation request is sent from the client to the server to obtain a list of presentations for a color value at a given location. Clients can use the result to
- modify a color reference.
- show in a color picker and let users pick one of the presentations

This request has no special capabilities and registration options since it is send as a resolve request for the `textDocument/documentColor` request.

_Request_:

* method: `textDocument/colorPresentation`
* params: `ColorPresentationParams` defined as follows

<div class="anchorHolder"><a href="#colorPresentationParams" name="colorPresentationParams" class="linkableAnchor"></a></div>

```typescript
interface ColorPresentationParams extends WorkDoneProgressParams,
	PartialResultParams {
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

<div class="anchorHolder"><a href="#colorPresentation" name="colorPresentation" class="linkableAnchor"></a></div>

```typescript
interface ColorPresentation {
	/**
	 * The label of this color presentation. It will be shown on the color
	 * picker header. By default this is also the text that is inserted when
	 * selecting this color presentation.
	 */
	label: string;
	/**
	 * An [edit](#TextEdit) which is applied to a document when selecting
	 * this presentation for the color. When `falsy` the
	 * [label](#ColorPresentation.label) is used.
	 */
	textEdit?: TextEdit;
	/**
	 * An optional array of additional [text edits](#TextEdit) that are applied
	 * when selecting this color presentation. Edits must not overlap with the
	 * main [edit](#ColorPresentation.textEdit) nor with themselves.
	 */
	additionalTextEdits?: TextEdit[];
}
```

* partial result: `ColorPresentation[]`
* error: code and message set in case an exception happens during the 'textDocument/colorPresentation' request

#### <a href="#textDocument_formatting" name="textDocument_formatting" class="anchor">Document Formatting Request  (:leftwards_arrow_with_hook:)</a>

The document formatting request is sent from the client to the server to format a whole document.

_Client Capability_:
* property name (optional): `textDocument.formatting`
* property type: `DocumentFormattingClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#documentFormattingClientCapabilities" name="documentFormattingClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface DocumentFormattingClientCapabilities {
	/**
	 * Whether formatting supports dynamic registration.
	 */
	dynamicRegistration?: boolean;
}
```

_Server Capability_:
* property name (optional): `documentFormattingProvider`
* property type: `boolean | DocumentFormattingOptions` where `DocumentFormattingOptions` is defined as follows:

<div class="anchorHolder"><a href="#documentFormattingOptions" name="documentFormattingOptions" class="linkableAnchor"></a></div>

```typescript
export interface DocumentFormattingOptions extends WorkDoneProgressOptions {
}
```

_Registration Options_: `DocumentFormattingRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#documentFormattingRegistrationOptions" name="documentFormattingRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface DocumentFormattingRegistrationOptions extends
	TextDocumentRegistrationOptions, DocumentFormattingOptions {
}
```

_Request_:
* method: `textDocument/formatting`
* params: `DocumentFormattingParams` defined as follows

<div class="anchorHolder"><a href="#documentFormattingParams" name="documentFormattingParams" class="linkableAnchor"></a></div>

```typescript
interface DocumentFormattingParams extends WorkDoneProgressParams {
	/**
	 * The document to format.
	 */
	textDocument: TextDocumentIdentifier;

	/**
	 * The format options.
	 */
	options: FormattingOptions;
}
```

<div class="anchorHolder"><a href="#formattingOptions" name="formattingOptions" class="linkableAnchor"></a></div>

```typescript
/**
 * Value-object describing what options formatting should use.
 */
interface FormattingOptions {
	/**
	 * Size of a tab in spaces.
	 */
	tabSize: uinteger;

	/**
	 * Prefer spaces over tabs.
	 */
	insertSpaces: boolean;

	/**
	 * Trim trailing whitespace on a line.
	 *
	 * @since 3.15.0
	 */
	trimTrailingWhitespace?: boolean;

	/**
	 * Insert a newline character at the end of the file if one does not exist.
	 *
	 * @since 3.15.0
	 */
	insertFinalNewline?: boolean;

	/**
	 * Trim all newlines after the final newline at the end of the file.
	 *
	 * @since 3.15.0
	 */
	trimFinalNewlines?: boolean;

	/**
	 * Signature for further properties.
	 */
	[key: string]: boolean | integer | string;
}
```

_Response_:
* result: [`TextEdit[]`](#textEdit) \| `null` describing the modification to the document to be formatted.
* error: code and message set in case an exception happens during the formatting request.

#### <a href="#textDocument_rangeFormatting" name="textDocument_rangeFormatting" class="anchor">Document Range Formatting Request (:leftwards_arrow_with_hook:)</a>

The document range formatting request is sent from the client to the server to format a given range in a document.

_Client Capability_:
* property name (optional): `textDocument.rangeFormatting`
* property type: `DocumentRangeFormattingClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#documentRangeFormattingClientCapabilities" name="documentRangeFormattingClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface DocumentRangeFormattingClientCapabilities {
	/**
	 * Whether formatting supports dynamic registration.
	 */
	dynamicRegistration?: boolean;
}
```

_Server Capability_:
* property name (optional): `documentRangeFormattingProvider`
* property type: `boolean | DocumentRangeFormattingOptions` where `DocumentRangeFormattingOptions` is defined as follows:

<div class="anchorHolder"><a href="#documentRangeFormattingOptions" name="documentRangeFormattingOptions" class="linkableAnchor"></a></div>

```typescript
export interface DocumentRangeFormattingOptions extends
	WorkDoneProgressOptions {
}
```

_Registration Options_: `DocumentFormattingRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#documentRangeFormattingRegistrationOptions" name="documentRangeFormattingRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface DocumentRangeFormattingRegistrationOptions extends
	TextDocumentRegistrationOptions, DocumentRangeFormattingOptions {
}
```

_Request_:
* method: `textDocument/rangeFormatting`,
* params: `DocumentRangeFormattingParams` defined as follows:

<div class="anchorHolder"><a href="#documentRangeFormattingParams" name="documentRangeFormattingParams" class="linkableAnchor"></a></div>

```typescript
interface DocumentRangeFormattingParams extends WorkDoneProgressParams {
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
* result: [`TextEdit[]`](#textEdit) \| `null` describing the modification to the document to be formatted.
* error: code and message set in case an exception happens during the range formatting request.

#### <a href="#textDocument_onTypeFormatting" name="textDocument_onTypeFormatting" class="anchor">Document on Type Formatting Request (:leftwards_arrow_with_hook:)</a>

The document on type formatting request is sent from the client to the server to format parts of the document during typing.

_Client Capability_:
* property name (optional): `textDocument.onTypeFormatting`
* property type: `DocumentOnTypeFormattingClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#documentOnTypeFormattingClientCapabilities" name="documentOnTypeFormattingClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface DocumentOnTypeFormattingClientCapabilities {
	/**
	 * Whether on type formatting supports dynamic registration.
	 */
	dynamicRegistration?: boolean;
}
```

_Server Capability_:
* property name (optional): `documentOnTypeFormattingProvider`
* property type: `DocumentOnTypeFormattingOptions` defined as follows:

<div class="anchorHolder"><a href="#documentOnTypeFormattingOptions" name="documentOnTypeFormattingOptions" class="linkableAnchor"></a></div>

```typescript
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
```

_Registration Options_: `DocumentOnTypeFormattingRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#documentOnTypeFormattingRegistrationOptions" name="documentOnTypeFormattingRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface DocumentOnTypeFormattingRegistrationOptions extends
	TextDocumentRegistrationOptions, DocumentOnTypeFormattingOptions {
}
```

_Request_:
* method: `textDocument/onTypeFormatting`
* params: `DocumentOnTypeFormattingParams` defined as follows:

<div class="anchorHolder"><a href="#documentOnTypeFormattingParams" name="documentOnTypeFormattingParams" class="linkableAnchor"></a></div>

```typescript
interface DocumentOnTypeFormattingParams extends TextDocumentPositionParams {
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
* result: [`TextEdit[]`](#textEdit) \| `null` describing the modification to the document.
* error: code and message set in case an exception happens during the range formatting request.

#### <a href="#textDocument_rename" name="textDocument_rename" class="anchor">Rename Request (:leftwards_arrow_with_hook:)</a>

The rename request is sent from the client to the server to ask the server to compute a workspace change so that the client can perform a workspace-wide rename of a symbol.

_Client Capability_:
* property name (optional): `textDocument.rename`
* property type: `RenameClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#prepareSupportDefaultBehavior" name="prepareSupportDefaultBehavior" class="linkableAnchor"></a></div>

```typescript
export namespace PrepareSupportDefaultBehavior {
	/**
	 * The client's default behavior is to select the identifier
	 * according the to language's syntax rule.
	 */
	 export const Identifier: 1 = 1;
}
```

<div class="anchorHolder"><a href="#renameClientCapabilities" name="renameClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface RenameClientCapabilities {
	/**
	 * Whether rename supports dynamic registration.
	 */
	dynamicRegistration?: boolean;

	/**
	 * Client supports testing for validity of rename operations
	 * before execution.
	 *
	 * @since version 3.12.0
	 */
	prepareSupport?: boolean;

	/**
	 * Client supports the default behavior result
	 * (`{ defaultBehavior: boolean }`).
	 *
	 * The value indicates the default behavior used by the
	 * client.
	 *
	 * @since version 3.16.0
	 */
	prepareSupportDefaultBehavior?: PrepareSupportDefaultBehavior;

	/**
	 * Whether th client honors the change annotations in
	 * text edits and resource operations returned via the
	 * rename request's workspace edit by for example presenting
	 * the workspace edit in the user interface and asking
	 * for confirmation.
	 *
	 * @since 3.16.0
	 */
	honorsChangeAnnotations?: boolean;
}
```

_Server Capability_:
* property name (optional): `renameProvider`
* property type: `boolean | RenameOptions` where `RenameOptions` is defined as follows:

`RenameOptions` may only be specified if the client states that it supports `prepareSupport` in its initial `initialize` request.

<div class="anchorHolder"><a href="#renameOptions" name="renameOptions" class="linkableAnchor"></a></div>

```typescript
export interface RenameOptions extends WorkDoneProgressOptions {
	/**
	 * Renames should be checked and tested before being executed.
	 */
	prepareProvider?: boolean;
}
```

_Registration Options_: `RenameRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#renameRegistrationOptions" name="renameRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface RenameRegistrationOptions extends
	TextDocumentRegistrationOptions, RenameOptions {
}
```

_Request_:
* method: `textDocument/rename`
* params: `RenameParams` defined as follows

<div class="anchorHolder"><a href="#renameParams" name="renameParams" class="linkableAnchor"></a></div>

```typescript
interface RenameParams extends TextDocumentPositionParams,
	WorkDoneProgressParams {
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

#### <a href="#textDocument_prepareRename" name="textDocument_prepareRename" class="anchor">Prepare Rename Request (:leftwards_arrow_with_hook:)</a>

> *Since version 3.12.0*

The prepare rename request is sent from the client to the server to setup and test the validity of a rename operation at a given location.

_Request_:
* method: `textDocument/prepareRename`
* params: `PrepareRenameParams` defined as follows:

<div class="anchorHolder"><a href="#prepareRenameParams" name="prepareRenameParams" class="linkableAnchor"></a></div>

```typescript
export interface PrepareRenameParams extends TextDocumentPositionParams {
}
```

_Response_:
* result: `Range | { range: Range, placeholder: string } | { defaultBehavior: boolean } | null` describing a [`Range`](#range) of the string to rename and optionally a placeholder text of the string content to be renamed. If `{ defaultBehavior: boolean }` is returned (since 3.16) the rename position is valid and the client should use its default behavior to compute the rename range. If `null` is returned then it is deemed that a 'textDocument/rename' request is not valid at the given position.
* error: code and message set in case the element can't be renamed. Clients should show the information in their user interface.

#### <a href="#textDocument_foldingRange" name="textDocument_foldingRange" class="anchor">Folding Range Request (:leftwards_arrow_with_hook:)</a>

> *Since version 3.10.0*

The folding range request is sent from the client to the server to return all folding ranges found in a given text document.

_Client Capability_:
* property name (optional): `textDocument.foldingRange`
* property type: `FoldingRangeClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#foldingRangeClientCapabilities" name="foldingRangeClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface FoldingRangeClientCapabilities {
	/**
	 * Whether implementation supports dynamic registration for folding range
	 * providers. If this is set to `true` the client supports the new
	 * `FoldingRangeRegistrationOptions` return value for the corresponding
	 * server capability as well.
	 */
	dynamicRegistration?: boolean;
	/**
	 * The maximum number of folding ranges that the client prefers to receive
	 * per document. The value serves as a hint, servers are free to follow the
	 * limit.
	 */
	rangeLimit?: uinteger;
	/**
	 * If set, the client signals that it only supports folding complete lines.
	 * If set, client will ignore specified `startCharacter` and `endCharacter`
	 * properties in a FoldingRange.
	 */
	lineFoldingOnly?: boolean;
}
```

_Server Capability_:
* property name (optional): `foldingRangeProvider`
* property type: `boolean | FoldingRangeOptions | FoldingRangeRegistrationOptions` where `FoldingRangeOptions` is defined as follows:

<div class="anchorHolder"><a href="#foldingRangeOptions" name="foldingRangeOptions" class="linkableAnchor"></a></div>

```typescript
export interface FoldingRangeOptions extends WorkDoneProgressOptions {
}
```

_Registration Options_: `FoldingRangeRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#foldingRangeRegistrationOptions" name="foldingRangeRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface FoldingRangeRegistrationOptions extends
	TextDocumentRegistrationOptions, FoldingRangeOptions,
	StaticRegistrationOptions {
}
```

_Request_:

* method: `textDocument/foldingRange`
* params: `FoldingRangeParams` defined as follows

<div class="anchorHolder"><a href="#foldingRangeParams" name="foldingRangeParams" class="linkableAnchor"></a></div>

```typescript
export interface FoldingRangeParams extends WorkDoneProgressParams,
	PartialResultParams {
	/**
	 * The text document.
	 */
	textDocument: TextDocumentIdentifier;
}
```

_Response_:
* result: `FoldingRange[] | null` defined as follows:

<div class="anchorHolder"><a href="#foldingRangeKind" name="foldingRangeKind" class="linkableAnchor"></a></div>

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
	 * Folding range for a imports or includes
	 */
	Imports = 'imports',
	/**
	 * Folding range for a region (e.g. `#region`)
	 */
	Region = 'region'
}
```

<div class="anchorHolder"><a href="#foldingRange" name="foldingRange" class="linkableAnchor"></a></div>

```typescript
/**
 * Represents a folding range. To be valid, start and end line must be bigger
 * than zero and smaller than the number of lines in the document. Clients
 * are free to ignore invalid ranges.
 */
export interface FoldingRange {

	/**
	 * The zero-based start line of the range to fold. The folded area starts
	 * after the line's last character. To be valid, the end must be zero or
	 * larger and smaller than the number of lines in the document.
	 */
	startLine: uinteger;

	/**
	 * The zero-based character offset from where the folded range starts. If
	 * not defined, defaults to the length of the start line.
	 */
	startCharacter?: uinteger;

	/**
	 * The zero-based end line of the range to fold. The folded area ends with
	 * the line's last character. To be valid, the end must be zero or larger
	 * and smaller than the number of lines in the document.
	 */
	endLine: uinteger;

	/**
	 * The zero-based character offset before the folded range ends. If not
	 * defined, defaults to the length of the end line.
	 */
	endCharacter?: uinteger;

	/**
	 * Describes the kind of the folding range such as `comment` or `region`.
	 * The kind is used to categorize folding ranges and used by commands like
	 * 'Fold all comments'. See [FoldingRangeKind](#FoldingRangeKind) for an
	 * enumeration of standardized kinds.
	 */
	kind?: string;
}
```

* partial result: `FoldingRange[]`
* error: code and message set in case an exception happens during the 'textDocument/foldingRange' request

#### <a href="#textDocument_selectionRange" name="textDocument_selectionRange" class="anchor">Selection Range Request (:leftwards_arrow_with_hook:)</a>

> *Since version 3.15.0*

The selection range request is sent from the client to the server to return suggested selection ranges at an array of given positions. A selection range is a range around the cursor position which the user might be interested in selecting.

A selection range in the return array is for the position in the provided parameters at the same index. Therefore positions[i] must be contained in result[i].range. To allow for results where some positions have selection ranges and others do not, result[i].range is allowed to be the empty range at positions[i].

Typically, but not necessary, selection ranges correspond to the nodes of the syntax tree.

_Client Capability_:
* property name (optional): `textDocument.selectionRange`
* property type: `SelectionRangeClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#selectionRangeClientCapabilities" name="selectionRangeClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface SelectionRangeClientCapabilities {
	/**
	 * Whether implementation supports dynamic registration for selection range
	 * providers. If this is set to `true` the client supports the new
	 * `SelectionRangeRegistrationOptions` return value for the corresponding
	 * server capability as well.
	 */
	dynamicRegistration?: boolean;
}
```

_Server Capability_:
* property name (optional): `selectionRangeProvider`
* property type: `boolean | SelectionRangeOptions | SelectionRangeRegistrationOptions` where `SelectionRangeOptions` is defined as follows:

<div class="anchorHolder"><a href="#selectionRangeOptions" name="selectionRangeOptions" class="linkableAnchor"></a></div>

```typescript
export interface SelectionRangeOptions extends WorkDoneProgressOptions {
}
```

_Registration Options_: `SelectionRangeRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#selectionRangeRegistrationOptions" name="selectionRangeRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface SelectionRangeRegistrationOptions extends
	SelectionRangeOptions, TextDocumentRegistrationOptions,
	StaticRegistrationOptions {
}
```

_Request_:

* method: `textDocument/selectionRange`
* params: `SelectionRangeParams` defined as follows:

<div class="anchorHolder"><a href="#selectionRangeParams" name="selectionRangeParams" class="linkableAnchor"></a></div>

```typescript
export interface SelectionRangeParams extends WorkDoneProgressParams,
	PartialResultParams {
	/**
	 * The text document.
	 */
	textDocument: TextDocumentIdentifier;

	/**
	 * The positions inside the text document.
	 */
	positions: Position[];
}
```

_Response_:

* result: `SelectionRange[] | null` defined as follows:

<div class="anchorHolder"><a href="#selectionRange" name="selectionRange" class="linkableAnchor"></a></div>

```typescript
export interface SelectionRange {
	/**
	 * The [range](#Range) of this selection range.
	 */
	range: Range;
	/**
	 * The parent selection range containing this range. Therefore
	 * `parent.range` must contain `this.range`.
	 */
	parent?: SelectionRange;
}
```

* partial result: `SelectionRange[]`
* error: code and message set in case an exception happens during the 'textDocument/selectionRange' request

#### <a href="#textDocument_prepareCallHierarchy" name="textDocument_prepareCallHierarchy" class="anchor">Prepare Call Hierarchy Request (:leftwards_arrow_with_hook:)</a>

> *Since version 3.16.0*

The call hierarchy request is sent from the client to the server to return a call hierarchy for the language element of given text document positions. The call hierarchy requests are executed in two steps:

  1. first a call hierarchy item is resolved for the given text document position
  1. for a call hierarchy item the incoming or outgoing call hierarchy items are resolved.

_Client Capability_:

* property name (optional): `textDocument.callHierarchy`
* property type: `CallHierarchyClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#callHierarchyClientCapabilities" name="callHierarchyClientCapabilities" class="linkableAnchor"></a></div>

```typescript
interface CallHierarchyClientCapabilities {
	/**
	 * Whether implementation supports dynamic registration. If this is set to
	 * `true` the client supports the new `(TextDocumentRegistrationOptions &
	 * StaticRegistrationOptions)` return value for the corresponding server
	 * capability as well.
	 */
	dynamicRegistration?: boolean;
}
```

_Server Capability_:

* property name (optional): `callHierarchyProvider`
* property type: `boolean | CallHierarchyOptions | CallHierarchyRegistrationOptions` where `CallHierarchyOptions` is defined as follows:

<div class="anchorHolder"><a href="#callHierarchyOptions" name="callHierarchyOptions" class="linkableAnchor"></a></div>

```typescript
export interface CallHierarchyOptions extends WorkDoneProgressOptions {
}
```

_Registration Options_: `CallHierarchyRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#callHierarchyRegistrationOptions" name="callHierarchyRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface CallHierarchyRegistrationOptions extends
	TextDocumentRegistrationOptions, CallHierarchyOptions,
	StaticRegistrationOptions {
}
```

_Request_:

* method: `textDocument/prepareCallHierarchy`
* params: `CallHierarchyPrepareParams` defined as follows:

<div class="anchorHolder"><a href="#callHierarchyPrepareParams" name="callHierarchyPrepareParams" class="linkableAnchor"></a></div>

```typescript
export interface CallHierarchyPrepareParams extends TextDocumentPositionParams,
	WorkDoneProgressParams {
}
```

_Response_:

* result: `CallHierarchyItem[] | null` defined as follows:

<div class="anchorHolder"><a href="#callHierarchyItem" name="callHierarchyItem" class="linkableAnchor"></a></div>

```typescript
export interface CallHierarchyItem {
	/**
	 * The name of this item.
	 */
	name: string;

	/**
	 * The kind of this item.
	 */
	kind: SymbolKind;

	/**
	 * Tags for this item.
	 */
	tags?: SymbolTag[];

	/**
	 * More detail for this item, e.g. the signature of a function.
	 */
	detail?: string;

	/**
	 * The resource identifier of this item.
	 */
	uri: DocumentUri;

	/**
	 * The range enclosing this symbol not including leading/trailing whitespace
	 * but everything else, e.g. comments and code.
	 */
	range: Range;

	/**
	 * The range that should be selected and revealed when this symbol is being
	 * picked, e.g. the name of a function. Must be contained by the
	 * [`range`](#CallHierarchyItem.range).
	 */
	selectionRange: Range;

	/**
	 * A data entry field that is preserved between a call hierarchy prepare and
	 * incoming calls or outgoing calls requests.
	 */
	data?: unknown;
}
```

* error: code and message set in case an exception happens during the 'textDocument/prepareCallHierarchy' request

#### <a href="#callHierarchy_incomingCalls" name="callHierarchy_incomingCalls" class="anchor">Call Hierarchy Incoming Calls (:leftwards_arrow_with_hook:)</a>

> *Since version 3.16.0*

The request is sent from the client to the server to resolve incoming calls for a given call hierarchy item. The request doesn't define its own client and server capabilities. It is only issued if a server registers for the [`textDocument/prepareCallHierarchy` request](#textDocument_prepareCallHierarchy).

_Request_:

* method: `callHierarchy/incomingCalls`
* params: `CallHierarchyIncomingCallsParams` defined as follows:

<div class="anchorHolder"><a href="#callHierarchyIncomingCallsParams" name="callHierarchyIncomingCallsParams" class="linkableAnchor"></a></div>

```typescript
export interface CallHierarchyIncomingCallsParams extends
	WorkDoneProgressParams, PartialResultParams {
	item: CallHierarchyItem;
}
```

_Response_:

* result: `CallHierarchyIncomingCall[] | null` defined as follows:

<div class="anchorHolder"><a href="#callHierarchyIncomingCall" name="callHierarchyIncomingCall" class="linkableAnchor"></a></div>

```typescript
export interface CallHierarchyIncomingCall {

	/**
	 * The item that makes the call.
	 */
	from: CallHierarchyItem;

	/**
	 * The ranges at which the calls appear. This is relative to the caller
	 * denoted by [`this.from`](#CallHierarchyIncomingCall.from).
	 */
	fromRanges: Range[];
}
```

* partial result: `CallHierarchyIncomingCall[]`
* error: code and message set in case an exception happens during the 'callHierarchy/incomingCalls' request

#### <a href="#callHierarchy_outgoingCalls" name="callHierarchy_outgoingCalls" class="anchor">Call Hierarchy Outgoing Calls (:leftwards_arrow_with_hook:)</a>

> *Since version 3.16.0*

The request is sent from the client to the server to resolve outgoing calls for a given call hierarchy item. The request doesn't define its own client and server capabilities. It is only issued if a server registers for the [`textDocument/prepareCallHierarchy` request](#textDocument_prepareCallHierarchy).

_Request_:

* method: `callHierarchy/outgoingCalls`
* params: `CallHierarchyOutgoingCallsParams` defined as follows:

<div class="anchorHolder"><a href="#callHierarchyOutgoingCallsParams" name="callHierarchyOutgoingCallsParams" class="linkableAnchor"></a></div>

```typescript
export interface CallHierarchyOutgoingCallsParams extends
	WorkDoneProgressParams, PartialResultParams {
	item: CallHierarchyItem;
}
```

_Response_:

* result: `CallHierarchyOutgoingCall[] | null` defined as follows:

<div class="anchorHolder"><a href="#callHierarchyOutgoingCall" name="callHierarchyOutgoingCall" class="linkableAnchor"></a></div>

```typescript
export interface CallHierarchyOutgoingCall {

	/**
	 * The item that is called.
	 */
	to: CallHierarchyItem;

	/**
	 * The range at which this item is called. This is the range relative to
	 * the caller, e.g the item passed to `callHierarchy/outgoingCalls` request.
	 */
	fromRanges: Range[];
}
```

* partial result: `CallHierarchyOutgoingCall[]`
* error: code and message set in case an exception happens during the 'callHierarchy/outgoingCalls' request

#### <a href="#textDocument_semanticTokens" name="textDocument_semanticTokens" class="anchor">Semantic Tokens (:leftwards_arrow_with_hook:)</a>

> *Since version 3.16.0*

The request is sent from the client to the server to resolve semantic tokens for a given file. Semantic tokens are used to add additional color information to a file that depends on language specific symbol information. A semantic token request usually produces a large result. The protocol therefore supports encoding tokens with numbers. In addition optional support for deltas is available.

_General Concepts_

Tokens are represented using one token type combined with n token modifiers. A token type is something like `class` or `function` and token modifiers are like `static` or `async`. The protocol defines a set of token types and modifiers but clients are allowed to extend these and announce the values they support in the corresponding client capability. The predefined values are:

<div class="anchorHolder"><a href="#semanticTokenTypes" name="semanticTokenTypes" class="linkableAnchor"></a></div>

```typescript
export enum SemanticTokenTypes {
	namespace = 'namespace',
	/**
	 * Represents a generic type. Acts as a fallback for types which
	 * can't be mapped to a specific type like class or enum.
	 */
	type = 'type',
	class = 'class',
	enum = 'enum',
	interface = 'interface',
	struct = 'struct',
	typeParameter = 'typeParameter',
	parameter = 'parameter',
	variable = 'variable',
	property = 'property',
	enumMember = 'enumMember',
	event = 'event',
	function = 'function',
	method = 'method',
	macro = 'macro',
	keyword = 'keyword',
	modifier = 'modifier',
	comment = 'comment',
	string = 'string',
	number = 'number',
	regexp = 'regexp',
	operator = 'operator'
}
```

<div class="anchorHolder"><a href="#semanticTokenModifiers" name="semanticTokenModifiers" class="linkableAnchor"></a></div>

```typescript
export enum SemanticTokenModifiers {
	declaration = 'declaration',
	definition = 'definition',
	readonly = 'readonly',
	static = 'static',
	deprecated = 'deprecated',
	abstract = 'abstract',
	async = 'async',
	modification = 'modification',
	documentation = 'documentation',
	defaultLibrary = 'defaultLibrary'
}
```

The protocol defines an additional token format capability to allow future extensions of the format. The only format that is currently specified is `relative` expressing that the tokens are described using relative positions (see Integer Encoding for Tokens below).

<div class="anchorHolder"><a href="#tokenFormat" name="tokenFormat" class="linkableAnchor"></a></div>

```typescript
export namespace TokenFormat {
	export const Relative: 'relative' = 'relative';
}

export type TokenFormat = 'relative';
```

_Integer Encoding for Tokens_

On the capability level types and modifiers are defined using strings. However the real encoding happens using numbers. The server therefore needs to let the client know which numbers it is using for which types and modifiers. They do so using a legend, which is defined as follows:

<div class="anchorHolder"><a href="#semanticTokensLegend" name="semanticTokensLegend" class="linkableAnchor"></a></div>

```typescript
export interface SemanticTokensLegend {
	/**
	 * The token types a server uses.
	 */
	tokenTypes: string[];

	/**
	 * The token modifiers a server uses.
	 */
	tokenModifiers: string[];
}
```

Token types are looked up by index, so a `tokenType` value of `1` means `tokenTypes[1]`. Since a token type can have n modifiers, multiple token modifiers can be set by using bit flags,
so a `tokenModifier` value of `3` is first viewed as binary `0b00000011`, which means `[tokenModifiers[0], tokenModifiers[1]]` because bits 0 and 1 are set.

There are different ways how the position of a token can be expressed in a file. Absolute positions or relative positions. The protocol for the token format `relative` uses relative positions, because most tokens remain stable relative to each other when edits are made in a file. This simplifies the computation of a delta if a server supports it. So each token is represented using 5 integers. A specific token `i` in the file consists of the following array indices:

- at index `5*i`   - `deltaLine`: token line number, relative to the previous token
- at index `5*i+1` - `deltaStart`: token start character, relative to the previous token (relative to 0 or the previous token's start if they are on the same line)
- at index `5*i+2` - `length`: the length of the token.
- at index `5*i+3` - `tokenType`: will be looked up in `SemanticTokensLegend.tokenTypes`. We currently ask that `tokenType` < 65536.
- at index `5*i+4` - `tokenModifiers`: each set bit will be looked up in `SemanticTokensLegend.tokenModifiers`

Whether a token can span multiple lines is defined by the client capability `multilineTokenSupport`. The client capability `overlappingTokenSupport` defines whether tokens can overlap each other.

Lets look at a concrete example which uses single line tokens without overlaps for encoding a file with 3 tokens in a number array. We start with absolute positions to demonstrate how they can easily be transformed into relative positions:

```typescript
{ line: 2, startChar:  5, length: 3, tokenType: "property",
	tokenModifiers: ["private", "static"]
},
{ line: 2, startChar: 10, length: 4, tokenType: "type", tokenModifiers: [] },
{ line: 5, startChar:  2, length: 7, tokenType: "class", tokenModifiers: [] }
```

First of all, a legend must be devised. This legend must be provided up-front on registration and capture all possible token types and modifiers. For the example we use this legend:

```typescript
{
   tokenTypes: ['property', 'type', 'class'],
   tokenModifiers: ['private', 'static']
}
```

The first transformation step is to encode `tokenType` and `tokenModifiers` as integers using the legend. As said, token types are looked up by index, so a `tokenType` value of `1` means `tokenTypes[1]`. Multiple token modifiers can be set by using bit flags, so a `tokenModifier` value of `3` is first viewed as binary `0b00000011`, which means `[tokenModifiers[0], tokenModifiers[1]]` because bits 0 and 1 are set. Using this legend, the tokens now are:

```typescript
{ line: 2, startChar:  5, length: 3, tokenType: 0, tokenModifiers: 3 },
{ line: 2, startChar: 10, length: 4, tokenType: 1, tokenModifiers: 0 },
{ line: 5, startChar:  2, length: 7, tokenType: 2, tokenModifiers: 0 }
```

The next step is to represent each token relative to the previous token in the file. In this case, the second token is on the same line as the first token, so the `startChar` of the second token is made relative to the `startChar` of the first token, so it will be `10 - 5`. The third token is on a different line than the second token, so the `startChar` of the third token will not be altered:

```typescript
{ deltaLine: 2, deltaStartChar: 5, length: 3, tokenType: 0, tokenModifiers: 3 },
{ deltaLine: 0, deltaStartChar: 5, length: 4, tokenType: 1, tokenModifiers: 0 },
{ deltaLine: 3, deltaStartChar: 2, length: 7, tokenType: 2, tokenModifiers: 0 }
```

Finally, the last step is to inline each of the 5 fields for a token in a single array, which is a memory friendly representation:

```typescript
// 1st token,  2nd token,  3rd token
[  2,5,3,0,3,  0,5,4,1,0,  3,2,7,2,0 ]
```

Now assume that the user types a new empty line at the beginning of the file which results in the following tokens in the file:

```typescript
{ line: 3, startChar:  5, length: 3, tokenType: "property",
	tokenModifiers: ["private", "static"]
},
{ line: 3, startChar: 10, length: 4, tokenType: "type", tokenModifiers: [] },
{ line: 6, startChar:  2, length: 7, tokenType: "class", tokenModifiers: [] }
```

Running the same transformations as above will result in the following number array:

```typescript
// 1st token,  2nd token,  3rd token
[  3,5,3,0,3,  0,5,4,1,0,  3,2,7,2,0]
```

The delta is now expressed on these number arrays without any form of interpretation what these numbers mean. This is comparable to the text document edits send from the server to the client to modify the content of a file. Those are character based and don't make any assumption about the meaning of the characters. So `[  2,5,3,0,3,  0,5,4,1,0,  3,2,7,2,0 ]` can be transformed into `[  3,5,3,0,3,  0,5,4,1,0,  3,2,7,2,0]` using the following edit description: `{ start:  0, deleteCount: 1, data: [3] }` which tells the client to simply replace the first number (e.g. `2`) in the array with `3`.

Semantic token edits behave conceptually like [text edits](#textEditArray) on documents: if an edit description consists of n edits all n edits are based on the same state Sm of the number array. They will move the number array from state Sm to Sm+1. A client applying the edits must not assume that they are sorted. An easy algorithm to apply them to the number array is to sort the edits and apply them from the back to the front of the number array.

_Client Capability_:

The following client capabilities are defined for semantic token requests sent from the client to the server:

* property name (optional): `textDocument.semanticTokens`
* property type: `SemanticTokensClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#semanticTokensClientCapabilities" name="semanticTokensClientCapabilities" class="linkableAnchor"></a></div>

```typescript
interface SemanticTokensClientCapabilities {
	/**
	 * Whether implementation supports dynamic registration. If this is set to
	 * `true` the client supports the new `(TextDocumentRegistrationOptions &
	 * StaticRegistrationOptions)` return value for the corresponding server
	 * capability as well.
	 */
	dynamicRegistration?: boolean;

	/**
	 * Which requests the client supports and might send to the server
	 * depending on the server's capability. Please note that clients might not
	 * show semantic tokens or degrade some of the user experience if a range
	 * or full request is advertised by the client but not provided by the
	 * server. If for example the client capability `requests.full` and
	 * `request.range` are both set to true but the server only provides a
	 * range provider the client might not render a minimap correctly or might
	 * even decide to not show any semantic tokens at all.
	 */
	requests: {
		/**
		 * The client will send the `textDocument/semanticTokens/range` request
		 * if the server provides a corresponding handler.
		 */
		range?: boolean | {
		};

		/**
		 * The client will send the `textDocument/semanticTokens/full` request
		 * if the server provides a corresponding handler.
		 */
		full?: boolean | {
			/**
			 * The client will send the `textDocument/semanticTokens/full/delta`
			 * request if the server provides a corresponding handler.
			 */
			delta?: boolean;
		};
	};

	/**
	 * The token types that the client supports.
	 */
	tokenTypes: string[];

	/**
	 * The token modifiers that the client supports.
	 */
	tokenModifiers: string[];

	/**
	 * The formats the clients supports.
	 */
	formats: TokenFormat[];

	/**
	 * Whether the client supports tokens that can overlap each other.
	 */
	overlappingTokenSupport?: boolean;

	/**
	 * Whether the client supports tokens that can span multiple lines.
	 */
	multilineTokenSupport?: boolean;
}
```

_Server Capability_:

The following server capabilities are defined for semantic tokens:

* property name (optional): `semanticTokensProvider`
* property type: `SemanticTokensOptions | SemanticTokensRegistrationOptions` where `SemanticTokensOptions` is defined as follows:

<div class="anchorHolder"><a href="#semanticTokensOptions" name="semanticTokensOptions" class="linkableAnchor"></a></div>

```typescript
export interface SemanticTokensOptions extends WorkDoneProgressOptions {
	/**
	 * The legend used by the server
	 */
	legend: SemanticTokensLegend;

	/**
	 * Server supports providing semantic tokens for a specific range
	 * of a document.
	 */
	range?: boolean | {
	};

	/**
	 * Server supports providing semantic tokens for a full document.
	 */
	full?: boolean | {
		/**
		 * The server supports deltas for full documents.
		 */
		delta?: boolean;
	};
}
```

_Registration Options_: `SemanticTokensRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#semanticTokensRegistrationOptions" name="semanticTokensRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface SemanticTokensRegistrationOptions extends
	TextDocumentRegistrationOptions, SemanticTokensOptions,
	StaticRegistrationOptions {
}
```

Since the registration option handles range, full and delta requests the method used to register for semantic tokens requests is `textDocument/semanticTokens` and not one of the specific methods described below.

**Requesting semantic tokens for a whole file**

_Request_:

<div class="anchorHolder"><a href="#semanticTokens_fullRequest" name="semanticTokens_fullRequest" class="linkableAnchor"></a></div>

* method: `textDocument/semanticTokens/full`
* params: `SemanticTokensParams` defined as follows:

<div class="anchorHolder"><a href="#semanticTokensParams" name="semanticTokensParams" class="linkableAnchor"></a></div>

```typescript
export interface SemanticTokensParams extends WorkDoneProgressParams,
	PartialResultParams {
	/**
	 * The text document.
	 */
	textDocument: TextDocumentIdentifier;
}
```

_Response_:

* result: `SemanticTokens | null` where `SemanticTokens` is defined as follows:

<div class="anchorHolder"><a href="#semanticTokens" name="semanticTokens" class="linkableAnchor"></a></div>

```typescript
export interface SemanticTokens {
	/**
	 * An optional result id. If provided and clients support delta updating
	 * the client will include the result id in the next semantic token request.
	 * A server can then instead of computing all semantic tokens again simply
	 * send a delta.
	 */
	resultId?: string;

	/**
	 * The actual tokens.
	 */
	data: uinteger[];
}
```

* partial result: `SemanticTokensPartialResult` defines as follows:

<div class="anchorHolder"><a href="#semanticTokensPartialResult" name="semanticTokensPartialResult" class="linkableAnchor"></a></div>

```typescript
export interface SemanticTokensPartialResult {
	data: uinteger[];
}
```

* error: code and message set in case an exception happens during the 'textDocument/semanticTokens/full' request

**Requesting semantic token delta for a whole file**

_Request_:

<div class="anchorHolder"><a href="#semanticTokens_deltaRequest" name="semanticTokens_deltaRequest" class="linkableAnchor"></a></div>

* method: `textDocument/semanticTokens/full/delta`
* params: `SemanticTokensDeltaParams` defined as follows:

<div class="anchorHolder"><a href="#semanticTokensDeltaParams" name="semanticTokensDeltaParams" class="linkableAnchor"></a></div>

```typescript
export interface SemanticTokensDeltaParams extends WorkDoneProgressParams,
	PartialResultParams {
	/**
	 * The text document.
	 */
	textDocument: TextDocumentIdentifier;

	/**
	 * The result id of a previous response. The result Id can either point to
	 * a full response or a delta response depending on what was received last.
	 */
	previousResultId: string;
}
```

_Response_:

* result: `SemanticTokens | SemanticTokensDelta | null` where `SemanticTokensDelta` is defined as follows:

<div class="anchorHolder"><a href="#semanticTokensDelta" name="semanticTokensDelta" class="linkableAnchor"></a></div>

```typescript
export interface SemanticTokensDelta {
	readonly resultId?: string;
	/**
	 * The semantic token edits to transform a previous result into a new
	 * result.
	 */
	edits: SemanticTokensEdit[];
}
```

<div class="anchorHolder"><a href="#semanticTokensEdit" name="semanticTokensEdit" class="linkableAnchor"></a></div>

```typescript
export interface SemanticTokensEdit {
	/**
	 * The start offset of the edit.
	 */
	start: uinteger;

	/**
	 * The count of elements to remove.
	 */
	deleteCount: uinteger;

	/**
	 * The elements to insert.
	 */
	data?: uinteger[];
}
```

* partial result: `SemanticTokensDeltaPartialResult` defines as follows:

<div class="anchorHolder"><a href="#semanticTokensDeltaPartialResult" name="semanticTokensDeltaPartialResult" class="linkableAnchor"></a></div>

```typescript
export interface SemanticTokensDeltaPartialResult {
	edits: SemanticTokensEdit[];
}
```

* error: code and message set in case an exception happens during the 'textDocument/semanticTokens/full/delta' request

**Requesting semantic tokens for a range**

When a user opens a file it can be beneficial to only compute the semantic tokens for the visible range (faster rendering of the tokens in the user interface). If a server can compute these tokens faster than for the whole file it can provide a handler for the `textDocument/semanticTokens/range` request to handle this case special. Please note that if a client also announces that it will send the `textDocument/semanticTokens/range` server should implement this request as well to allow for flicker free scrolling and semantic coloring of a minimap.

_Request_:

<div class="anchorHolder"><a href="#semanticTokens_rangeRequest" name="semanticTokens_rangeRequest" class="linkableAnchor"></a></div>

* method: `textDocument/semanticTokens/range`
* params: `SemanticTokensRangeParams` defined as follows:

<div class="anchorHolder"><a href="#semanticTokensRangeParams" name="semanticTokensRangeParams" class="linkableAnchor"></a></div>

```typescript
export interface SemanticTokensRangeParams extends WorkDoneProgressParams,
	PartialResultParams {
	/**
	 * The text document.
	 */
	textDocument: TextDocumentIdentifier;

	/**
	 * The range the semantic tokens are requested for.
	 */
	range: Range;
}
```

_Response_:

* result: `SemanticTokens | null` where `SemanticTokensDelta`
* partial result: `SemanticTokensPartialResult`
* error: code and message set in case an exception happens during the 'textDocument/semanticTokens/range' request

**Requesting a refresh of all semantic tokens**

The `workspace/semanticTokens/refresh` request is sent from the server to the client. Servers can use it to ask clients to refresh the editors for which this server provides semantic tokens. As a result the client should ask the server to recompute the semantic tokens for these editors. This is useful if a server detects a project wide configuration change which requires a re-calculation of all semantic tokens. Note that the client still has the freedom to delay the re-calculation of the semantic tokens if for example an editor is currently not visible.

_Client Capability_:

* property name (optional): `workspace.semanticTokens`
* property type: `SemanticTokensWorkspaceClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#semanticTokensWorkspaceClientCapabilities" name="semanticTokensWorkspaceClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface SemanticTokensWorkspaceClientCapabilities {
	/**
	 * Whether the client implementation supports a refresh request sent from
	 * the server to the client.
	 *
	 * Note that this event is global and will force the client to refresh all
	 * semantic tokens currently shown. It should be used with absolute care
	 * and is useful for situation where a server for example detect a project
	 * wide change that requires such a calculation.
	 */
	refreshSupport?: boolean;
}
```

_Request_:

<div class="anchorHolder"><a href="#semanticTokens_refreshRequest" name="semanticTokens_refreshRequest" class="linkableAnchor"></a></div>

* method: `workspace/semanticTokens/refresh`
* params: none

_Response_:

* result: void
* error: code and message set in case an exception happens during the 'workspace/semanticTokens/refresh' request

#### <a href="#textDocument_linkedEditingRange" name="textDocument_linkedEditingRange" class="anchor">Linked Editing Range(:leftwards_arrow_with_hook:)</a>

> *Since version 3.16.0*

The linked editing request is sent from the client to the server to return for a given position in a document the range of the symbol at the position and all ranges that have the same content. Optionally a word pattern can be returned to describe valid contents. A rename to one of the ranges can be applied to all other ranges if the new content is valid. If no result-specific word pattern is provided, the word pattern from the client's language configuration is used.

_Client Capabilities_:

* property name (optional): `textDocument.linkedEditingRange`
* property type: `LinkedEditingRangeClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#linkedEditingRangeClientCapabilities" name="linkedEditingRangeClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface LinkedEditingRangeClientCapabilities {
	/**
	 * Whether implementation supports dynamic registration.
	 * If this is set to `true` the client supports the new
	 * `(TextDocumentRegistrationOptions & StaticRegistrationOptions)`
	 * return value for the corresponding server capability as well.
	 */
	dynamicRegistration?: boolean;
}
```

_Server Capability_:

* property name (optional): `linkedEditingRangeProvider`
* property type: `boolean` \| `LinkedEditingRangeOptions` \| `LinkedEditingRangeRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#linkedEditingRangeOptions" name="linkedEditingRangeOptions" class="linkableAnchor"></a></div>

```typescript
export interface LinkedEditingRangeOptions extends WorkDoneProgressOptions {
}
```

_Registration Options_: `LinkedEditingRangeRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#linkedEditingRangeRegistrationOptions" name="linkedEditingRangeRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface LinkedEditingRangeRegistrationOptions extends
	TextDocumentRegistrationOptions, LinkedEditingRangeOptions,
	StaticRegistrationOptions {
}
```

_Request_:

* method: `textDocument/linkedEditingRange`
* params: `LinkedEditingRangeParams` defined as follows:

<div class="anchorHolder"><a href="#linkedEditingRangeParams" name="linkedEditingRangeParams" class="linkableAnchor"></a></div>

```typescript
export interface LinkedEditingRangeParams extends TextDocumentPositionParams,
	WorkDoneProgressParams {
}
```

_Response_:

* result: `LinkedEditingRanges` \| `null` defined as follows:

<div class="anchorHolder"><a href="#linkedEditingRanges" name="linkedEditingRanges" class="linkableAnchor"></a></div>

```typescript
export interface LinkedEditingRanges {
	/**
	 * A list of ranges that can be renamed together. The ranges must have
	 * identical length and contain identical text content. The ranges cannot overlap.
	 */
	ranges: Range[];

	/**
	 * An optional word pattern (regular expression) that describes valid contents for
	 * the given ranges. If no pattern is provided, the client configuration's word
	 * pattern will be used.
	 */
	wordPattern?: string;
}
```
* error: code and message set in case an exception happens during the 'textDocument/linkedEditingRange' request

#### <a href="#textDocument_moniker" name="textDocument_moniker" class="anchor">Monikers (:leftwards_arrow_with_hook:)</a>

> *Since version 3.16.0*

Language Server Index Format (LSIF) introduced the concept of symbol monikers to help associate symbols across different indexes. This request adds capability for LSP server implementations to provide the same symbol moniker information given a text document position. Clients can utilize this method to get the moniker at the current location in a file user is editing and do further code navigation queries in other services that rely on LSIF indexes and link symbols together.

The `textDocument/moniker` request is sent from the client to the server to get the symbol monikers for a given text document position. An array of Moniker types is returned as response to indicate possible monikers at the given location. If no monikers can be calculated, an empty array or `null` should be returned.

_Client Capabilities_:

* property name (optional): `textDocument.moniker`
* property type: `MonikerClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#monikerClientCapabilities" name="monikerClientCapabilities" class="linkableAnchor"></a></div>

```typescript
interface MonikerClientCapabilities {
	/**
	 * Whether implementation supports dynamic registration. If this is set to
	 * `true` the client supports the new `(TextDocumentRegistrationOptions &
	 * StaticRegistrationOptions)` return value for the corresponding server
	 * capability as well.
	 */
	dynamicRegistration?: boolean;
}
```

_Server Capability_:

* property name (optional): `monikerProvider`
* property type: `boolean | MonikerOptions | MonikerRegistrationOptions` is defined as follows:

<div class="anchorHolder"><a href="#monikerOptions" name="monikerOptions" class="linkableAnchor"></a></div>

```typescript
export interface MonikerOptions extends WorkDoneProgressOptions {
}
```

_Registration Options_: `MonikerRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#monikerRegistrationOptions" name="monikerRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface MonikerRegistrationOptions extends
	TextDocumentRegistrationOptions, MonikerOptions {
}
```

_Request_:

* method: `textDocument/moniker`
* params: `MonikerParams` defined as follows:

<div class="anchorHolder"><a href="#monikerParams" name="monikerParams" class="linkableAnchor"></a></div>

```typescript
export interface MonikerParams extends TextDocumentPositionParams,
	WorkDoneProgressParams, PartialResultParams {
}
```

_Response_:

* result: `Moniker[] | null`
* partial result: `Moniker[]`
* error: code and message set in case an exception happens during the 'textDocument/moniker' request

`Moniker` is defined as follows:

<div class="anchorHolder"><a href="#uniquenessLevel" name="uniquenessLevel" class="linkableAnchor"></a></div>

```typescript
/**
 * Moniker uniqueness level to define scope of the moniker.
 */
export enum UniquenessLevel {
	/**
	 * The moniker is only unique inside a document
	 */
	document = 'document',

	/**
	 * The moniker is unique inside a project for which a dump got created
	 */
	project = 'project',

	/**
	 * The moniker is unique inside the group to which a project belongs
	 */
	group = 'group',

	/**
	 * The moniker is unique inside the moniker scheme.
	 */
	scheme = 'scheme',

	/**
	 * The moniker is globally unique
	 */
	global = 'global'
}
```

<div class="anchorHolder"><a href="#monikerKind" name="monikerKind" class="linkableAnchor"></a></div>

```typescript
/**
 * The moniker kind.
 */
export enum MonikerKind {
	/**
	 * The moniker represent a symbol that is imported into a project
	 */
	import = 'import',

	/**
	 * The moniker represents a symbol that is exported from a project
	 */
	export = 'export',

	/**
	 * The moniker represents a symbol that is local to a project (e.g. a local
	 * variable of a function, a class not visible outside the project, ...)
	 */
	local = 'local'
}
```

<div class="anchorHolder"><a href="#moniker" name="moniker" class="linkableAnchor"></a></div>

```typescript
/**
 * Moniker definition to match LSIF 0.5 moniker definition.
 */
export interface Moniker {
	/**
	 * The scheme of the moniker. For example tsc or .Net
	 */
	scheme: string;

	/**
	 * The identifier of the moniker. The value is opaque in LSIF however
	 * schema owners are allowed to define the structure if they want.
	 */
	identifier: string;

	/**
	 * The scope in which the moniker is unique
	 */
	unique: UniquenessLevel;

	/**
	 * The moniker kind if known.
	 */
	kind?: MonikerKind;
}
```

##### Notes

Server implementations of this method should ensure that the moniker calculation matches to those used in the corresponding LSIF implementation to ensure symbols can be associated correctly across IDE sessions and LSIF indexes.

### <a href="#implementationConsiderations" name="implementationConsiderations" class="anchor">Implementation Considerations</a>

Language servers usually run in a separate process and client communicate with them in an asynchronous fashion. Additionally clients usually allow users to interact with the source code even if request results are pending. We recommend the following implementation pattern to avoid that clients apply outdated response results:

- if a client sends a request to the server and the client state changes in a way that it invalidates the response it should do the following:
  - cancel the server request and ignore the result if the result is not useful for the client anymore. If necessary the client should resend the request.
  - keep the request running if the client can still make use of the result by for example transforming it to a new result by applying the state change to the result.
- servers should therefore not decide by themselves to cancel requests simply due to that fact that a state change notification is detected in the queue. As said the result could still be useful for the client.
- if a server detects an internal state change (for example a project context changed) that invalidates the result of a request in execution the server can error these requests with `ContentModified`. If clients receive a `ContentModified` error, it generally should not show it in the UI for the end-user. Clients can resend the request if they know how to do so. It should be noted that for all position based requests it might be especially hard for clients to re-craft a request.
- if a client notices that a server exits unexpectedly, it should try to restart the server. However clients should be careful not to restart a crashing server endlessly. VS Code, for example, doesn't restart a server which has crashed 5 times in the last 180 seconds.

Servers usually support different communication channels (e.g. stdio, pipes, ...). To ease the usage of servers in different clients it is highly recommended that a server implementation supports the following command line arguments to pick the communication channel:

- **stdio**: uses stdio as the communication channel.
- **pipe**: use pipes (Windows) or socket files (Linux, Mac) as the communication channel. The pipe / socket file name is passed as the next arg or with `--pipe=`.
- **socket**: uses a socket as the communication channel. The port is passed as next arg or with `--port=`.
- **node-ipc**: use node IPC communication between the client and the server. This is only support if both client and server run under node.

To support the case that the editor starting a server crashes an editor should also pass its process id to the server. This allows the server to monitor the editor process and to shutdown itself if the editor process dies. The process id pass on the command line should be the same as the one passed in the initialize parameters. The command line argument to use is `--clientProcessId`.

### <a href="#changeLog" name="changeLog" class="anchor">Change Log</a>

#### <a href="#version_3_17_0" name="version_3_17_0" class="anchor">3.17.0 (xx/xx/xxxx)</a>

* Add support for a completion item label details.

#### <a href="#version_3_16_0" name="version_3_16_0" class="anchor">3.16.0 (12/14/2020)</a>

* Add support for tracing.
* Add semantic token support.
* Add call hierarchy support.
* Add client capability for resolving text edits on completion items.
* Add support for client default behavior on renames.
* Add support for insert and replace ranges on `CompletionItem`.
* Add support for diagnostic code descriptions.
* Add support for document symbol provider label.
* Add support for tags on `SymbolInformation` and `DocumentSymbol`.
* Add support for moniker request method.
* Add support for code action `data` property.
* Add support for code action `disabled` property.
* Add support for code action resolve request.
* Add support for diagnostic `data` property.
* Add support for signature information `activeParameter` property.
* Add support for `workspace/didCreateFiles` notifications and `workspace/willCreateFiles` requests.
* Add support for `workspace/didRenameFiles` notifications and `workspace/willRenameFiles` requests.
* Add support for `workspace/didDeleteFiles` notifications and `workspace/willDeleteFiles` requests.
* Add client capability to signal whether the client normalizes line endings.
* Add support to preserve additional attributes on `MessageActionItem`.
* Add support to provide the clients locale in the initialize call.
* Add support for opening and showing a document in the client user interface.
* Add support for linked editing.
* Add support for change annotations in text edits as well as in create file, rename file and delete file operations.

#### <a href="#version_3_15_0" name="version_3_15_0" class="anchor">3.15.0 (01/14/2020)</a>

* Add generic progress reporting support.
* Add specific work done progress reporting support to requests where applicable.
* Add specific partial result progress support to requests where applicable.
* Add support for `textDocument/selectionRange`.
* Add support for server and client information.
* Add signature help context.
* Add Erlang and Elixir to the list of supported programming languages
* Add `version` on `PublishDiagnosticsParams`
* Add `CodeAction#isPreferred` support.
* Add `CompletionItem#tag` support.
* Add `Diagnostic#tag` support.
* Add `DocumentLink#tooltip` support.
* Add `trimTrailingWhitespace`, `insertFinalNewline` and `trimFinalNewlines` to `FormattingOptions`.
* Clarified `WorkspaceSymbolParams#query` parameter.


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
