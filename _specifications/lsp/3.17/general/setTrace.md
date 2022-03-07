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
