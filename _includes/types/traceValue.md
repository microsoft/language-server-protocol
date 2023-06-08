#### <a href="#traceValue" name="traceValue" class="anchor"> TraceValue </a>

A `TraceValue` represents the level of verbosity with which the server systematically reports its execution trace using [$/logTrace](#logTrace) notifications.
The initial trace value is set by the client at initialization and can be modified later using the [$/setTrace](#setTrace) notification.

```typescript
export type TraceValue = 'off' | 'messages' | 'verbose';
```