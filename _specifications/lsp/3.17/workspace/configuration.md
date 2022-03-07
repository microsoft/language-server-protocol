#### <a href="#workspace_configuration" name="workspace_configuration" class="anchor">Configuration Request (:arrow_right_hook:)</a>

> *Since version 3.6.0*

The `workspace/configuration` request is sent from the server to the client to fetch configuration settings from the client. The request can fetch several configuration settings in one roundtrip. The order of the returned configuration settings correspond to the order of the passed `ConfigurationItems` (e.g. the first item in the response is the result for the first configuration item in the params).

A `ConfigurationItem` consists of the configuration section to ask for and an additional scope URI. The configuration section asked for is defined by the server and doesn't necessarily need to correspond to the configuration store used by the client. So a server might ask for a configuration `cpp.formatterOptions` but the client stores the configuration in an XML store layout differently. It is up to the client to do the necessary conversion. If a scope URI is provided the client should return the setting scoped to the provided resource. If the client for example uses [EditorConfig](http://editorconfig.org/) to manage its settings the configuration should be returned for the passed resource URI. If the client can't provide a configuration setting for a given scope then `null` needs to be present in the returned array.

_Client Capability_:
* property path (optional): `workspace.configuration`
* property type: `boolean`

_Request_:
* method: 'workspace/configuration'
* params: `ConfigurationParams` defined as follows

<div class="anchorHolder"><a href="#configurationParams" name="configurationParams" class="linkableAnchor"></a></div>

```typescript
export interface ConfigurationParams {
	items: ConfigurationItem[];
}
```

<div class="anchorHolder"><a href="#configurationItem" name="configurationItem" class="linkableAnchor"></a></div>

```typescript
export interface ConfigurationItem {
	/**
	 * The scope to get the configuration section for.
	 */
	scopeUri?: DocumentUri;

	/**
	 * The configuration section asked for.
	 */
	section?: string;
}
```

_Response_:
* result: LSPAny[]
* error: code and message set in case an exception happens during the 'workspace/configuration' request
