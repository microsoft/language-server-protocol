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
