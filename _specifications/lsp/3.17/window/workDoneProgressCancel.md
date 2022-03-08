#### <a href="#window_workDoneProgress_cancel" name="window_workDoneProgress_cancel" class="anchor"> Cancel a Work Done Progress (:arrow_right:)</a>

The `window/workDoneProgress/cancel` notification is sent from the client to the server to cancel a progress initiated on the server side using the `window/workDoneProgress/create`. The progress need not be marked as `cancellable` to be cancelled and a client may cancel a progress for any number of reasons: in case of error, reloading a workspace etc.

_Notification_:

* method: 'window/workDoneProgress/cancel'
* params: `WorkDoneProgressCancelParams` defined as follows:

```typescript
export interface WorkDoneProgressCancelParams {
	/**
	 * The token to be used to report progress.
	 */
	token: ProgressToken;
}
```