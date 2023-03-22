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

### Example:

```
Content-Length: ...\r\n
\r\n
{
	"jsonrpc": "2.0",
	"id": 1,
	"method": "textDocument/completion",
	"params": {
		...
	}
}
```

## <a href="#basicJsonStructures" name="basicJsonStructures" class="anchor"> JSON structures </a>

The protocol uses request, response, and notification objects as specified in the [JSON-RPC protocol](http://www.jsonrpc.org/specification). The protocol currently does not support JSON-RPC batch messages; protocol clients and servers must not send JSON-RPC requests.

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
 * rare in the base protocol specification, we denote the
 * exact range with every decimal using the mathematics
 * interval notation (e.g. [0, 1] denotes all decimals d with
 * 0 <= d <= 1.
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
	 * It doesn't denote a real error code. No LSP error codes should
	 * be defined between the start and end range. For backwards
	 * compatibility the `ServerNotInitialized` and the `UnknownErrorCode`
	 * are left in the range.
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
	 * This is the end range of JSON-RPC reserved error codes.
	 * It doesn't denote a real error code.
	 */
	export const jsonrpcReservedErrorRangeEnd = -32000;
	/** @deprecated use jsonrpcReservedErrorRangeEnd */
	export const serverErrorEnd: integer = jsonrpcReservedErrorRangeEnd;

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
	 * The client has canceled a request and a server as detected
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

The base protocol offers also support to report progress in a generic fashion. This mechanism can be used to report any kind of progress including [work done progress](#workDoneProgress) (usually used to report progress in the user interface using a progress bar) and partial result progress to support streaming of results.

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

## <a href="#capabilities" name="capabilityModel" class="anchor"> Capability Model </a>

### <a href="#capabilities" name="capabilities" class="anchor"> Capabilities </a>

Not every server can support all features defined by the protocol. The base protocol therefore provides ‘capabilities’. A capability groups a set of features. A development tool and the server announce their supported features using capabilities. As an example, an LSP server announces that it can handle the `textDocument/hover` request, but it might not handle the `workspace/symbol` request. Similarly, a development tool announces its ability to provide `about to save` LSP notifications before a document is saved, so that a server can compute textual edits to format the edited document before it is saved.

The set of capabilities is exchanged between the client and server during the [initialize](#initialize) request.

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
	initializationOptions?: BaseAny;

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

#### <a href="#initialized" name="initialized" class="anchor">Initialized Notification (:arrow_right:)</a>

The initialized notification is sent from the client to the server after the client received the result of the `initialize` request but before the client is sending any other request or notification to the server. The server can use the `initialized` notification, for example, to dynamically register capabilities. The `initialized` notification may only be sent once.

_Notification_:
* method: 'initialized'
* params: `InitializedParams` defined as follows:

```typescript
interface InitializedParams {
}
```

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
	registerOptions?: LSPAny;
}
```

<div class="anchorHolder"><a href="#registrationParams" name="registrationParams" class="linkableAnchor"></a></div>

```typescript
export interface RegistrationParams {
	registrations: Registration[];
}
```

Since most of the registration options require to specify a document selector there is a base interface that can be used. See `TextDocumentRegistrationOptions`.

An example JSON-RPC message to register dynamically for the `textDocument/willSaveWaitUntil` feature on the client side is as follows (only details shown):

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

`TextDocumentRegistrationOptions` can be used to dynamically register for requests for a set of text documents.

<div class="anchorHolder"><a href="#textDocumentRegistrationOptions" name="textDocumentRegistrationOptions" class="linkableAnchor"></a></div>

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

An example JSON-RPC message to unregister the above registered `textDocument/willSaveWaitUntil` feature looks like this:

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

### <a href="#windowFeatures" name="windowFeatures" class="anchor">Window Features</a>

#### <a href="#window_showMessage" name="window_showMessage" class="anchor">Show Message Notification (:arrow_left:)</a>

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

_Response_:
* result: the selected `MessageActionItem` \| `null` if none got selected.
* error: code and message set in case an exception happens during showing a message.

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
