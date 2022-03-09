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