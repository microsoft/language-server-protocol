---
title: Base Protocol Specification
shortTitle: 0.9
layout: specifications
sectionid: base-0-9
toc: base-0-9-toc
fullTitle: Base Protocol Specification - 0.9
index: 3
toolsVersion: 0.9
---

## <a href="#baseProtocol" name="baseProtocol" class="anchor"> Base Protocol </a>

The purpose of the base protocol is to create an abstraction of common editor extensibility patterns into its own specification, independently of the presence of a language server powering such extension. In particular, concepts such as server and client capabilities, the initialization and shutdown request, and the structure of requests and notifications, were originally part of the language server protocol, but there is nothing about them that should be exclusive to language service extensions.

A motivating example is the [Build Server Protocol](https://build-server-protocol.github.io/). As its specification describes, all notifications and requests are defined using [the base definitions](#basicJsonStructures) of LSP, and messages such `InitializeBuild`, `OnBuildInitialized`, and `OnBuildExit` all match almost exactly with their LSP counterparts. By implementing the base protocol, a server can support multiple protocol specifications without having to reimplement the "common boilerplate" that all of them share.

Do remark that the base protocol is currently under experimental construction and subject to breaking changes. Its future development will depend on feedback from the community and initial implementors of the protocol.

### <a href="#headerPart" name="headerPart" class="anchor"> Header Part </a>

The base protocol consists of a header and a content part (comparable to HTTP). The header and content part are
separated by a '\r\n'.

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

### Example:

```
Content-Length: ...\r\n
\r\n
{
	"jsonrpc": "2.0",
	"id": 1,
	"method": "initialize",
	"params": {
		...
	}
}
```

### <a href="#capabilities" name="capabilities" class="anchor"> Capabilities </a>

Not every server can support all features defined by a protocol. The base protocol therefore provides "capabilities". A capability groups a set of features. A development tool and the server announce their supported features using capabilities. As an example, a development tool could announce support for document creation notifications, so that servers can perform their corresponding document synchronizations tasks.

The set of capabilities is exchanged between the client and server during the [initialize](#initialize) request.

Note that the following list of capability identifiers are already used by the language server protocol and hence cannot be used in other protocols:
- `callHierarchyProvider`
- `codeActionProvider`
- `codeLensProvider`
- `colorProvider`
- `completionProvider`
- `declarationProvider`
- `definitionProvider`
- `diagnosticProvider`
- `documentFormattingProvider`
- `documentHighlightProvider`
- `documentLinkProvider`
- `documentOnTypeFormattingProvider`
- `documentRangeFormattingProvider`
- `documentSymbolProvider`
- `executeCommandProvider`
- `experimental`
- `foldingRangeProvider`
- `general`
- `hoverProvider`
- `implementationProvider`
- `inlayHintProvider`
- `inlineValueProvider`
- `linkedEditingRangeProvider`
- `monikerProvider`
- `notebookDocument`
- `notebookDocumentSync`
- `positionEncoding`
- `referencesProvider`
- `renameProvider`
- `selectionRangeProvider`
- `semanticTokensProvider`
- `signatureHelpProvider`
- `textDocument`
- `textDocumentSync`
- `typeDefinitionProvider`
- `typeHierarchyProvider`
- `window`
- `workspace`
- `workspaceSymbolProvider`

### <a href="#messageOrdering" name= "messageOrdering" class="anchor"> Request, Notification and Response Ordering </a>

Responses to requests should be sent in roughly the same order as the requests appear on the server or client side. So, for example, if a server providing unit testing features receives a `testing/configureFramework` request and then a `testing/configureProject` request, it will usually first return the response for the `testing/configureFramework` and then the response for `testing/configureProject`.

However, the server may decide to use a parallel execution strategy and may wish to return responses in a different order than the requests were received. The server may do so as long as this reordering doesn't affect the correctness of the responses. For example, reordering the result of `testing/configureFramework` and `testing/configureProject` is allowed, as each of these requests usually won't affect the output of the other. On the other hand, the server most likely should not reorder `testing/testCreated` and `testing/executeTest` requests, since test creation should happen before their execution.

### <a href="#messageDocumentation" name= "messageDocumentation" class="anchor"> Message Documentation </a>

As mentioned previously, the base protocol defines a set of requests, responses and notifications. Each of those are documented using the following format:

* a header describing the request
* an optional _Client capability_ section describing the client capability of the request. This includes the client capabilities property path and JSON structure.
* an optional _Server Capability_ section describing the server capability of the request. This includes the server capabilities property path and JSON structure. Clients should ignore server capabilities they don't understand (e.g. the initialize request shouldn't fail in this case).
* an optional _Registration Options_ section describing the registration option if the request or notification supports dynamic capability registration. See the [register](#client_registerCapability) and [unregister](#client_unregisterCapability) request for how this works in detail.
* a _Request_ section describing the format of the request sent. The method is a string identifying the request, the parameters are documented using a TypeScript interface. It is also documented whether the request supports work done progress and partial result progress.
* a _Response_ section describing the format of the response. The result item describes the returned data in case of a success. The optional partial result item describes the returned data of a partial result notification. The `error.data` describes the returned data in case of an error. Please remember that in case of a failure the response already contains an `error.code` and an `error.message` field. These fields are only specified if the protocol forces the use of certain error codes or messages. In cases where the server can decide on these values freely they aren't listed here.

## <a href="#basicJsonStructures" name="basicJsonStructures" class="anchor"> JSON structures </a>

The base protocol uses request, response, and notification objects as specified in the [JSON-RPC protocol](http://www.jsonrpc.org/specification). It currently does not support JSON-RPC batch messages; protocol clients and servers must not send JSON-RPC requests.

#### <a href="#baseTypes" name="baseTypes" class="anchor"> Base Types </a>

The base protocol uses the following definitions for integers, unsigned integers, decimal numbers, objects and arrays:

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
 * rare in the base protocol specification, we denote the
 * exact range with every decimal using the mathematics
 * interval notation (e.g. [0, 1] denotes all decimals d with
 * 0 <= d <= 1).
 */
export type decimal = number;
```

<div class="anchorHolder"><a href="#baseAny" name="baseAny" class="linkableAnchor"></a></div>

```typescript
/**
 * Base Protocol any type.
 */
export type BaseAny = BaseObject | BaseArray | string | integer | uinteger |
	decimal | boolean | null;
```

<div class="anchorHolder"><a href="#baseObject" name="baseObject" class="linkableAnchor"></a></div>

```typescript
/**
 * Base Protocol object definition.
 */
export type BaseObject = { [key: string]: BaseAny };
```

<div class="anchorHolder"><a href="#baseArray" name="baseArray" class="linkableAnchor"></a></div>

```typescript
/**
 * Base Protocol arrays.
 */
export type BaseArray = BaseAny[];
```

{% include types/uri.md %}

#### <a href="#regExp" name="regExp" class="anchor"> Regular Expressions </a>

Regular expressions are a powerful tool and there are actual use cases for them in protocols like LSP. However the downside with them is that almost every programming language has its own set of regular expression features so the base specification can not simply refer to them as a regular expression.

For example, LSP uses a two step approach to support regular expressions:

* the client will announce which regular expression engine it will use. This will allow servers that are written for a very specific client make full use of the regular expression capabilities of the client.
* the specification will define a set of regular expression features that should be supported by a client. Instead of writing a new specification LSP will refer to the [ECMAScript Regular Expression specification](https://tc39.es/ecma262/#sec-regexp-regular-expression-objects) and remove features from it that are not necessary in the context of LSP or hard to implement for other clients.

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

#### <a href="#enumerations" name="enumerations" class="anchor"> Enumerations </a>

The base protocol supports two kind of enumerations: (a) integer based enumerations and (b) strings based enumerations. Integer based enumerations usually start with `1`. If appropriate the value set of an enumeration is announced by the defining side (e.g. client or server) and transmitted to the other side during the initialize handshake.
As an example, consider a `printSymbol` request that uses a `PrintFormat` enumeration. The client could announce its supported printing formats via `printing.format` property:
```typescript
/**
 * Capabilities specific to the `printSymbol` request.
 */
print: {
    format: [ "json", "compact", "checkstyle" ]
    ...
}
```

To support the evolution of enumerations the using side of an enumeration shouldn't fail on an enumeration value it doesn't know. It should simply ignore it as a value it can use and try to do its best to preserve the value on round trips. Lets look at the `PrintFormat` enumeration as an example again: if in a future version of the protocol an additional `"html"` format is added and is now announced by a client, an (older) server not knowing about the value should not fail but simply ignore the value as a usable printing format.

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

A Response Message sent as a result of a request. If a request doesn't provide a result value the receiver of a request still needs to return a response message to conform to the JSON-RPC specification. The result property of the ResponseMessage should be set to `null` in this case to signal a successful request.

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
	result?: string | number | boolean | array | object | null;

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
	// Defined by JSON-RPC
	export const ParseError: integer = -32700;
	export const InvalidRequest: integer = -32600;
	export const MethodNotFound: integer = -32601;
	export const InvalidParams: integer = -32602;
	export const InternalError: integer = -32603;

	/**
	 * This is the start range of JSON-RPC reserved error codes.
	 * It doesn't denote a real error code. No error codes of the
     * base protocol should be defined between the start and end
     * range. For backwards compatibility the `ServerNotInitialized`
     * and the `UnknownErrorCode` are left in the range.
	 */
	export const jsonrpcReservedErrorRangeStart: integer = -32099;

	/**
	 * Error code indicating that a server received a notification or
	 * request before the server has received the `initialize` request.
	 */
	export const ServerNotInitialized: integer = -32002;
	export const UnknownErrorCode: integer = -32001;

	/**
	 * This is the end range of JSON-RPC reserved error codes.
	 * It doesn't denote a real error code.
	 */
	export const jsonrpcReservedErrorRangeEnd = -32000;

	/**
	 * This is the start range of LSP reserved error codes.
	 * It doesn't denote a real error code.
	 */
	export const lspReservedErrorRangeStart: integer = -32899;

	/**
	 * A request failed but it was syntactically correct, e.g the
	 * method name was known and the parameters were valid. The error
	 * message should contain human readable information about why
	 * the request failed.
	 */
	export const RequestFailed: integer = -32803;

	/**
	 * The server cancelled the request. This error code should
	 * only be used for requests that explicitly support being
	 * server cancellable.
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
	 * The client has canceled a request and a server has detected
	 * the cancel.
	 */
	export const RequestCancelled: integer = -32800;

	/**
	 * This is the end range of LSP reserved error codes.
	 * It doesn't denote a real error code.
	 */
	export const lspReservedErrorRangeEnd: integer = -32800;
}
```
To avoid conflicts with the error codes taken by the language service protocol, other implementers of the base protocol must use error codes outside the range defined by `lspReservedErrorRangeStart` and `lspReservedErrorRangeEnd`.

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

Notification and requests whose methods start with '\$/' are messages which are protocol implementation dependent and might not be implementable in all clients or servers. For example, if the server implementation uses a single threaded synchronous programming language then there is little a server can do to react to a `$/cancelRequest` notification. If a server or client receives notifications starting with '\$/' it is free to ignore the notification. If a server or client receives a request starting with '\$/' it must error the request with error code `MethodNotFound` (e.g. `-32601`).

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

A request that got canceled still needs to return from the server and send a response back. It can not be left open / hanging. This is in line with the JSON-RPC protocol that requires that every request sends a response back. In addition it allows for returning partial results on cancel. If the request returns an error response on cancellation it is advised to set the error code to `ErrorCodes.RequestCancelled`.

#### <a href="#progress" name="progress" class="anchor"> Progress Support (:arrow_right: :arrow_left:)</a>

The base protocol also offers support to report progress in a generic fashion. This mechanism can be used to report any kind of progress including [work done progress](#workDoneProgress) (usually used to report progress in the user interface using a progress bar) and partial result progress to support streaming of results.

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

#### <a href="#workDoneProgress" name="workDoneProgress" class="anchor"> Work Done Progress </a>

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
	 * to ignore the `percentage` value in subsequent report notifications.
	 *
	 * The value should be steadily rising. Clients are free to ignore values
	 * that are not following this rule. The value range is [0, 100].
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
	 * to ignore the `percentage` value in subsequent report notifications.
	 *
	 * The value should be steadily rising. Clients are free to ignore values
	 * that are not following this rule. The value range is [0, 100].
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
	 * Optional, a final message indicating to, for example, indicate the outcome
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

Consider a client sending a `build/deploy` request to a server that can compile and build applications and the client accepts work done progress reporting on that request. To signal this to the server, the client would add a `workDoneToken` property to the reference request parameters:

```json
{
	"project": {
		"guid": "A083-41A9-A0E8"
	},
	"context": {
		"destinationDirectory": "/prod"
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

A server uses the `workDoneToken` to report progress for the specific `build/deploy`. For the above request, the `$/progress` notification parameters look like this:

```json
{
	"token": "1d546990-40a3-4b77-b134-46622995f6ae",
	"value": {
		"kind": "begin",
		"title": "Deploying project#A083-41A9-A0E8",
		"cancellable": false,
		"message": "Processing projectConfig.json",
		"percentage": 0
	}
}
```

The token received via the `workDoneToken` property in a request's param literal is only valid as long as the request has not send a response back. Canceling work done progress is done by simply
canceling the corresponding request.

There is no specific client capability signaling whether a client will send a progress token per request. The reason for this is that this is in many clients not a static aspect and might even change for every request instance for the same request type. So the capability is signal on every request instance by the presence of a `workDoneToken` property.

To avoid that clients set up a progress monitor user interface before sending a request but the server doesn't actually report any progress a server needs to signal general work done progress reporting support in the corresponding server capability. For the above example a server would signal such a support by setting the `deployProvider` property in the server capabilities as follows:

```json
{
	"build.deployProvider": {
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

Servers can also initiate progress reporting using the `window/workDoneProgress/create` request. This is useful if the server needs to report progress outside of a request (for example, the server needs to re-index a database). The token can then be used to report progress using the same notifications used as for client initiated progress. The token provided in the create request should only be used once (e.g. only one begin, many report and one end notification should be sent to it).

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

{% include types/traceValue.md %}

## <a href="#lifecycle" name="lifecycle" class="anchor"> Lifecycle Messages </a>

The current protocol specification defines that the lifecycle of a server is managed by the client (e.g. a tool like VS Code or Emacs). It is up to the client to decide when to start (process-wise) and when to shutdown a server.

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
	 */
	locale?: string;

	/**
	 * User provided initialization options.
	 */
	initializationOptions?: BaseAny;

	/**
	 * The capabilities provided by the client (editor or tool)
	 */
	capabilities: {};

	/**
	 * The initial trace setting. If omitted trace is disabled ('off').
	 */
	trace?: TraceValue;
}
```

_Response_:
* result: `InitializeResult` defined as follows:

<div class="anchorHolder"><a href="#initializeResult" name="initializeResult" class="linkableAnchor"></a></div>

```typescript
interface InitializeResult {
	/**
	 * The capabilities the server provides.
	 */
	capabilities: {};

	/**
	 * Information about the server.
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

* error.data:

<div class="anchorHolder"><a href="#initializeError" name="initializeError" class="linkableAnchor"></a></div>

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

Note that `capabilities` is specified as an empty object in both `InitializeParams` and `InitializeResult`, and are left open for each implementation of the base protocol to define accordingly. However, in order to avoid conflicts with properties used by LSP, these cannot include any of the property names listed in the above [capabilities section](#capabilities).

{% include messages/3.17/initialized.md %}

#### <a href="#client_registerCapability" name="client_registerCapability" class="anchor">Register Capability (:arrow_right_hook:)</a>

The `client/registerCapability` request is sent from the server to the client to register for a new capability on the client side. Not all clients need to support dynamic capability registration. A client opts in via the `dynamicRegistration` property on the specific client capabilities. A client can even provide dynamic registration for capability A but not for capability B.

The server must not register the same capability both statically through the initialize result and dynamically for the same document selector. If a server wants to support both static and dynamic registration it needs to check the client capability in the initialize request and only register the capability statically if the client doesn't support dynamic registration for that capability.

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
	registerOptions?: BaseAny;
}
```

<div class="anchorHolder"><a href="#registrationParams" name="registrationParams" class="linkableAnchor"></a></div>

```typescript
export interface RegistrationParams {
	registrations: Registration[];
}
```

_Response_:
* result: void.
* error: code and message set in case an exception happens during the request.

`StaticRegistrationOptions` can be used to register a feature in the initialize result with a given server control ID to be able to un-register the feature later on.

<div class="anchorHolder"><a href="#staticRegistrationOptions" name="staticRegistrationOptions" class="linkableAnchor"></a></div>

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
	unregistrations: Unregistration[];
}
```

_Response_:
* result: void.
* error: code and message set in case an exception happens during the request.

{% include messages/3.17/setTrace.md %}
{% include messages/3.17/logTrace.md %}
{% include messages/3.17/shutdown.md %}
{% include messages/3.17/exit.md %}

### <a href="#windowFeatures" name="windowFeatures" class="anchor">Window Features</a>

{% include messages/3.17/showMessage.md %}
{% include messages/3.17/showMessageRequest.md %}
{% include messages/3.17/logMessage.md %}
{% include messages/3.17/telemetryEvent.md %}
