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
