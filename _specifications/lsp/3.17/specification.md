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

**Note:** edits to this specification can be made via a pull request against this markdown [document](https://github.com/Microsoft/language-server-protocol/blob/gh-pages/_specifications/lsp/3.17/specification.md).

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

An example would be a request send from the client to the server to request a hover value for a symbol at a certain position in a text document. The request's method would be `textDocument/hover` with a parameter like this:

```typescript
interface HoverParams {
	textDocument: string; /** The text document's URI in string form */
	position: { line: uinteger; character: uinteger; };
}
```

The result of the request would be the hover to be presented. In its simple form it can be a string. So the result looks like this:

```typescript
interface HoverResult {
	value: string;
}
```

Please also note that a response return value of `null` indicates no result. It doesn't tell the client to resend the request.

In general, the language server protocol supports JSON-RPC messages, however the base protocol defined here uses a convention such that the parameters passed to request/notification messages should be of `object` type (if passed at all). However, this does not disallow using `Array` parameter types in custom messages.

The protocol currently assumes that one server serves one tool. There is currently no support in the protocol to share one server between different tools. Such a sharing would require additional protocol e.g. to lock a document to support concurrent editing.

### <a href="#capabilities" name= "capabilities" class="anchor"> Capabilities </a>

Not every language server can support all features defined by the protocol. LSP therefore provides ‘capabilities’. A capability groups a set of language features. A development tool and the language server announce their supported features using capabilities. As an example, a server announces that it can handle the `textDocument/hover` request, but it might not handle the `workspace/symbol` request. Similarly, a development tool announces its ability to provide `about to save` notifications before a document is saved, so that a server can compute textual edits to format the edited document before it is saved.

The set of capabilities is exchanged between the client and server during the [initialize](#initialize) request.

### <a href="#messageOrdering" name= "messageOrdering" class="anchor"> Request, Notification and Response Ordering </a>

Responses to requests should be sent in roughly the same order as the requests appear on the server or client side. So for example if a server receives a `textDocument/completion` request and then a `textDocument/signatureHelp` request it will usually first return the response for the `textDocument/completion` and then the response for `textDocument/signatureHelp`.

However, the server may decide to use a parallel execution strategy and may wish to return responses in a different order than the requests were received. The server may do so as long as this reordering doesn't affect the correctness of the responses. For example, reordering the result of `textDocument/completion` and `textDocument/signatureHelp` is allowed, as these each of these requests usually won't affect the output of the other. On the other hand, the server most likely should not reorder `textDocument/definition` and `textDocument/rename` requests, since the executing the latter may affect the result of the former.

### <a href="#messageDocumentation" name= "messageDocumentation" class="anchor"> Message Documentation </a>

As said LSP defines a set of requests, responses and notifications. Each of those are document using the following format:

* a header describing the request
* an optional _Client capability_ section describing the client capability of the request. This includes the client capabilities property path and JSON structure.
* an optional _Server Capability_ section describing the server capability of the request. This includes the server capabilities property path and JSON structure. Clients should ignore server capabilities they don't understand (e.g. the initialize request shouldn't fail in this case).
* an optional _Registration Options_ section describing the registration option if the request or notification supports dynamic capability registration. See the [register](#client_registerCapability) and [unregister](#client_unregisterCapability) request for how this works in detail.
* a _Request_ section describing the format of the request sent. The method is a string identifying the request the params are documented using a TypeScript interface. It is also documented whether the request supports work done progress and partial result progress.
* a _Response_ section describing the format of the response. The result item describes the returned data in case of a success. The optional partial result item describes the returned data of a partial result notification. The error.data describes the returned data in case of an error. Please remember that in case of a failure the response already contains an error.code and an error.message field. These fields are only specified if the protocol forces the use of certain error codes or messages. In cases where the server can decide on these values freely they aren't listed here.


### <a href="#basicJsonStructures" name="basicJsonStructures" class="anchor"> Basic JSON Structures </a>

There are quite some JSON structures that are shared between different requests and notifications. Their structure and capabilities are document in this section.

{% include_relative types/uri.md %}
{% include_relative types/regexp.md %}
{% include_relative types/enumerations.md %}

{% include_relative types/textDocuments.md %}
{% include_relative types/position.md %}
{% include_relative types/range.md %}
{% include_relative types/textDocumentItem.md %}
{% include_relative types/textDocumentIdentifier.md %}
{% include_relative types/versionedTextDocumentIdentifier.md %}
{% include_relative types/textDocumentPositionParams.md %}
{% include_relative types/documentFilter.md %}

{% include_relative types/textEdit.md %}
{% include_relative types/textEditArray.md %}
{% include_relative types/textDocumentEdit.md %}
{% include_relative types/location.md %}
{% include_relative types/locationLink.md %}
{% include_relative types/diagnostic.md %}
{% include_relative types/command.md %}
{% include_relative types/markupContent.md %}
{% include_relative types/resourceChanges.md %}
{% include_relative types/workspaceEdit.md %}

{% include_relative types/workDoneProgress.md %}
{% include_relative types/partialResults.md %}
{% include_relative types/partialResultParams.md %}
{% include_relative types/traceValue.md %}

### <a href="#lifeCycleMessages" name="lifeCycleMessages" class="anchor"> Server lifecycle </a>

The current protocol specification defines that the lifecycle of a server is managed by the client (e.g. a tool like VS Code or Emacs). It is up to the client to decide when to start (process-wise) and when to shutdown a server.

{% include_relative general/initialize.md %}
{% include_relative general/initialized.md %}
{% include_relative client/registerCapability.md %}
{% include_relative client/unregisterCapability.md %}
{% include_relative general/setTrace.md %}
{% include_relative general/logTrace.md %}
{% include_relative general/shutdown.md %}
{% include_relative general/exit.md %}

### <a href="#textDocument_synchronization" name="textDocument_synchronization" class="anchor">Text Document Synchronization</a>

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
{% include_relative textDocument/didRename.md %}

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

### <a href="#languageFeatures" name="languageFeatures" class="anchor">Language Features</a>

Language Feature provide the actual smarts in the language server protocol. The are usually executed on a [text document, position] tuple. The main language feature categories are:

- code comprehension features like Hover or Goto Definition.
- coding features like diagnostics, code complete or code actions.

{% include_relative language/declaration.md %}
{% include_relative language/definition.md %}
{% include_relative language/typeDefinition.md %}
{% include_relative language/implementation.md %}
{% include_relative language/references.md %}
{% include_relative language/callHierarchy.md %}
{% include_relative language/typeHierarchy.md %}
{% include_relative language/documentHighlight.md %}
{% include_relative language/documentLink.md %}
{% include_relative language/hover.md %}
{% include_relative language/codeLens.md %}
{% include_relative language/foldingRange.md %}
{% include_relative language/selectionRange.md %}
{% include_relative language/documentSymbol.md %}
{% include_relative language/semanticTokens.md %}
{% include_relative language/inlayHint.md %}
{% include_relative language/inlineValue.md %}
{% include_relative language/moniker.md %}
{% include_relative language/completion.md %}
{% include_relative language/publishDiagnostics.md %}
{% include_relative language/signatureHelp.md %}
{% include_relative language/codeAction.md %}
{% include_relative language/documentColor.md %}
{% include_relative language/colorPresentation.md %}
{% include_relative language/formatting.md %}
{% include_relative language/rangeFormatting.md %}
{% include_relative language/onTypeFormatting.md %}
{% include_relative language/rename.md %}
{% include_relative language/linkedEditingRange.md %}

### <a href="#workspaceFeatures" name="workspaceFeatures" class="anchor">Workspace Features</a>

{% include_relative workspace/symbol.md %}
{% include_relative workspace/configuration.md %}
{% include_relative workspace/didChangeConfiguration.md %}
{% include_relative workspace/workspaceFolders.md %}
{% include_relative workspace/didChangeWorkspaceFolders.md %}
{% include_relative workspace/willCreateFiles.md %}
{% include_relative workspace/didCreateFiles.md %}
{% include_relative workspace/willRenameFiles.md %}
{% include_relative workspace/didRenameFiles.md %}
{% include_relative workspace/willDeleteFiles.md %}
{% include_relative workspace/didDeleteFiles.md %}
{% include_relative workspace/didChangeWatchedFiles.md %}
{% include_relative workspace/executeCommand.md %}
{% include_relative workspace/applyEdit.md %}

### <a href="#windowFeatures" name="windowFeatures" class="anchor">Window Features</a>

{% include_relative window/showMessage.md %}
{% include_relative window/showMessageRequest.md %}
{% include_relative window/showDocument.md %}
{% include_relative window/logMessage.md %}
{% include_relative window/workDoneProgressCreate.md %}
{% include_relative window/workDoneProgressCancel.md %}
{% include_relative telemetry/event.md %}

miscellaneous

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
