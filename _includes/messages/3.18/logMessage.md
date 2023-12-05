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
