#### <a href="#workspace_didChangeConfiguration" name="workspace_didChangeConfiguration" class="anchor">DidChangeConfiguration Notification (:arrow_right:)</a>

A notification sent from the client to the server to signal the change of configuration settings.

_Client Capability_:
* property path (optional): `workspace.didChangeConfiguration`
* property type: `DidChangeConfigurationClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#didChangeConfigurationClientCapabilities" name="didChangeConfigurationClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface DidChangeConfigurationClientCapabilities {
	/**
	 * Did change configuration notification supports dynamic registration.
	 */
	dynamicRegistration?: boolean;
}
```

_Notification_:
* method: 'workspace/didChangeConfiguration',
* params: `DidChangeConfigurationParams` defined as follows:

<div class="anchorHolder"><a href="#didChangeConfigurationParams" name="didChangeConfigurationParams" class="linkableAnchor"></a></div>

```typescript
interface DidChangeConfigurationParams {
	/**
	 * The actual changed settings
	 */
	settings: LSPAny;
}
```
