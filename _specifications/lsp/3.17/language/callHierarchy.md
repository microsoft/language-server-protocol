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
