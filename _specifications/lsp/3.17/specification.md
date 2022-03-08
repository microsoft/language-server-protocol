---
title: Specification
shortTitle: 3.17 (Upcoming)
layout: specifications
sectionid: specification-3-17
toc: specification-3-17-toc
fullTitle: Language Server Protocol Specification - 3.17
index: 2
---

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

#### <a href="#baseTypes" name="baseTypes" class="anchor"> Base Types </a>

The protocol use the following definitions for integers, unsigned integers, decimal numbers, objects and arrays:

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

<div class="anchorHolder"><a href="#lspAny" name="lspAny" class="linkableAnchor"></a></div>

```typescript
/**
 * The LSP any type
 *
 * @since 3.17.0
 */
export type LSPAny = LSPObject | LSPArray | string | integer | uinteger | decimal | boolean | null;
```

<div class="anchorHolder"><a href="#lspObject" name="lspObject" class="linkableAnchor"></a></div>

```typescript
/**
 * LSP object definition.
 *
 * @since 3.17.0
 */
export type LSPObject = { [key: string]: LSPAny };
```

<div class="anchorHolder"><a href="#lspArray" name="lspArray" class="linkableAnchor"></a></div>

```typescript
/**
 * LSP arrays.
 *
 * @since 3.17.0
 */
export type LSPArray = LSPAny[];
```

#### <a href="#abstractMessage" name="abstractMessage" class="anchor"> Abstract Message </a>

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
	 * A request failed but it was syntactically correct, e.g the
	 * method name was known and the parameters were valid. The error
	 * message should contain human readable information about why
	 * the request failed.
	 *
	 * @since 3.17.0
	 */
	export const RequestFailed: integer = -32803;

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

## <a href="#languageServerProtocol" name="languageServerProtocol" class="anchor"> Language Server Protocol </a>

The language server protocol defines a set of JSON-RPC request, response and notification messages which are exchanged using the above base protocol. This section starts describing the basic JSON structures used in the protocol. The document uses TypeScript interfaces in strict mode to describe these. This means for example that a `null` value has to be explicitly listed and that a mandatory property must be listed even if a falsify value might exist. Based on the basic JSON structures, the actual requests with their responses and the notifications are described.

Please also note that a response return value of `null` indicates no result. It doesn't tell the client to resend the request.

In general, the language server protocol supports JSON-RPC messages, however the base protocol defined here uses a convention such that the parameters passed to request/notification messages should be of `object` type (if passed at all). However, this does not disallow using `Array` parameter types in custom messages.

The protocol currently assumes that one server serves one tool. There is currently no support in the protocol to share one server between different tools. Such a sharing would require additional protocol e.g. to lock a document to support concurrent editing.

### <a href="#basicJsonStructures" name="basicJsonStructures" class="anchor"> Basic JSON Structures </a>

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

#### <a href="#enumerations" name="enumerations" class="anchor"> Enumerations </a>

The protocol supports two kind of enumerations: (a) integer based enumerations and (b) strings based enumerations. Integer based enumerations usually start with `1`. The onces that don't are historical and they were kept to stay backwards compatible. If appropriate the value set of an enumeration is announced by the defining side (e.g. client or server) and transmitted to the other side during the initialize handshake. An example is the `CompletionItemKind` enumeration. It is announced by the client using the `textDocument.completion.completionItemKind` client property.

To support the evolution of enumerations the using side of an enumeration shouldn't fail on an enumeration value it doesn't know. It should simply ignore it as a value it can use and try to do its best to preserve the value on round trips. Lets look at the `CompletionItemKind` enumeration as an example again: if in a future version of the specification an additional completion item kind with the value `n` gets added and announced by a client a (older) server not knowing about the value should not fail but simply ignore the value as a usable item kind.

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
	arguments?: LSPAny[];
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

Usually clients provide options to group the changes along the annotations they are associated with. To support this in the protocol an edit or resource operation refers to a change annotation using an identifier and not the change annotation literal directly. This allows servers to use the identical annotation across multiple edits or resource operations which then allows clients to group the operations under that change annotation. The actual change annotations together with their identifiers are managed by the workspace edit via the new property `changeAnnotations`.

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

_Client Capability_:
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

	/**
	 * A list of HTML tags that the client allows / supports in
	 * Markdown.
	 *
	 * @since 3.17.0
	 */
	allowedTags?: string[];
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

#### Server lifecycle

The current protocol specification defines that the lifecycle of a server is managed by the client (e.g. a tool like VS Code or Emacs). It is up to the client to decide when to start (process-wise) and when to shutdown a server.

{% include_relative general/initialize.md %}
{% include_relative general/initialized.md %}
{% include_relative general/shutdown.md %}
{% include_relative general/exit.md %}
{% include_relative general/logTrace.md %}
{% include_relative general/setTrace.md %}

{% include_relative window/showMessage.md %}
{% include_relative window/showMessageRequest.md %}
{% include_relative window/showDocument.md %}
{% include_relative window/logMessage.md %}
{% include_relative window/workDoneProgressCreate.md %}
{% include_relative window/workDoneProgressCancel.md %}

{% include_relative telemetry/event.md %}

{% include_relative client/registerCapability.md %}
{% include_relative client/unregisterCapability.md %}

{% include_relative workspace/workspaceFolders.md %}
{% include_relative workspace/didChangeWorkspaceFolders.md %}
{% include_relative workspace/didChangeConfiguration.md %}
{% include_relative workspace/configuration.md %}
{% include_relative workspace/didChangeWatchedFiles.md %}
{% include_relative workspace/symbol.md %}
{% include_relative workspace/executeCommand.md %}
{% include_relative workspace/applyEdit.md %}
{% include_relative workspace/willCreateFiles.md %}
{% include_relative workspace/didCreateFiles.md %}
{% include_relative workspace/willRenameFiles.md %}
{% include_relative workspace/didRenameFiles.md %}
{% include_relative workspace/willDeleteFiles.md %}
{% include_relative workspace/didDeleteFiles.md %}

#### <a href="#textDocument_synchronization" name="textDocument_synchronization" class="anchor">Text Document Synchronization</a>

Client support for `textDocument/didOpen`, `textDocument/didChange` and `textDocument/didClose` notifications is mandatory in the protocol and clients can not opt out supporting them. This includes both full and incremental synchronization in the `textDocument/didChange` notification. In addition a server must either implement all three of them or none. Their capabilities are therefore controlled via a combined client and server capability. Opting out of text document synchronization makes only sense if the documents shown by the client are read only. Otherwise the server might receive request for documents, for which the content is managed in the client (e.g. they might have changed).

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

{% include_relative textDocument/didOpen.md %}
{% include_relative textDocument/didChange.md %}
{% include_relative textDocument/willSave.md %}
{% include_relative textDocument/willSaveWaitUntil.md %}
{% include_relative textDocument/didSave.md %}
{% include_relative textDocument/didClose.md %}

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

{% include_relative language/publishDiagnostics.md %}

{% include_relative language/completion.md %}
{% include_relative language/hover.md %}
{% include_relative language/signatureHelp.md %}
{% include_relative language/declaration.md %}
{% include_relative language/definition.md %}
{% include_relative language/typeDefinition.md %}
{% include_relative language/implementation.md %}
{% include_relative language/references.md %}
{% include_relative language/documentHighlight.md %}
{% include_relative language/documentSymbol.md %}
{% include_relative language/codeAction.md %}
{% include_relative language/codeLens.md %}
{% include_relative language/documentLink.md %}
{% include_relative language/documentColor.md %}
{% include_relative language/colorPresentation.md %}
{% include_relative language/formatting.md %}
{% include_relative language/rangeFormatting.md %}
{% include_relative language/onTypeFormatting.md %}
{% include_relative language/rename.md %}
{% include_relative language/foldingRange.md %}
{% include_relative language/selectionRange.md %}
{% include_relative language/callHierarchy.md %}
{% include_relative language/semanticTokens.md %}
{% include_relative language/linkedEditingRange.md %}
{% include_relative language/moniker.md %}

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
* Add support for workspace symbol resolve request.
* Add support for shared values on CompletionItemList.
* Add support for HTML tags in Markdown.
* Specify how clients will handle stale requests.

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
