#### <a href="#window_workDoneProgress_create" name="window_workDoneProgress_create" class="anchor"> Create Work Done Progress (:arrow_right_hook:)</a>

The `window/workDoneProgress/create` request is sent from the server to the client to ask the client to create a work done progress.

_Client Capability_:
* property name (optional): `window.workDoneProgress`
* property type: `boolean`

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
