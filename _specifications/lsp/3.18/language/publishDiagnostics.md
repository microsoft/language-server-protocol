#### <a href="#textDocument_publishDiagnostics" name="textDocument_publishDiagnostics" class="anchor">PublishDiagnostics Notification (:arrow_left:)</a>

Diagnostics notification are sent from the server to the client to signal results of validation runs.

Diagnostics are "owned" by the server so it is the server's responsibility to clear them if necessary. The following rule is used for VS Code servers that generate diagnostics:

* if a language is single file only (for example HTML) then diagnostics are cleared by the server when the file is closed. Please note that open / close events don't necessarily reflect what the user sees in the user interface. These events are ownership events. So with the current version of the specification it is possible that problems are not cleared although the file is not visible in the user interface since the client has not closed the file yet.
* if a language has a project system (for example C#) diagnostics are not cleared when a file closes. When a project is opened all diagnostics for all files are recomputed (or read from a cache).

When a file changes it is the server's responsibility to re-compute diagnostics and push them to the client. If the computed set is empty it has to push the empty array to clear former diagnostics. Newly pushed diagnostics always replace previously pushed diagnostics. There is no merging that happens on the client side.

See also the [Diagnostic](#diagnostic) section.

_Client Capability_:
* property name (optional): `textDocument.publishDiagnostics`
* property type: `PublishDiagnosticsClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#publishDiagnosticsClientCapabilities" name="publishDiagnosticsClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface PublishDiagnosticsClientCapabilities {
	/**
	 * Whether the clients accepts diagnostics with related information.
	 */
	relatedInformation?: boolean;

	/**
	 * Client supports the tag property to provide meta data about a diagnostic.
	 * Clients supporting tags have to handle unknown tags gracefully.
	 *
	 * @since 3.15.0
	 */
	tagSupport?: {
		/**
		 * The tags supported by the client.
		 */
		valueSet: DiagnosticTag[];
	};

	/**
	 * Whether the client interprets the version property of the
	 * `textDocument/publishDiagnostics` notification's parameter.
	 *
	 * @since 3.15.0
	 */
	versionSupport?: boolean;

	/**
	 * Client supports a codeDescription property
	 *
	 * @since 3.16.0
	 */
	codeDescriptionSupport?: boolean;

	/**
	 * Whether code action supports the `data` property which is
	 * preserved between a `textDocument/publishDiagnostics` and
	 * `textDocument/codeAction` request.
	 *
	 * @since 3.16.0
	 */
	dataSupport?: boolean;
}
```

_Notification_:
* method: `textDocument/publishDiagnostics`
* params: `PublishDiagnosticsParams` defined as follows:

<div class="anchorHolder"><a href="#publishDiagnosticsParams" name="publishDiagnosticsParams" class="linkableAnchor"></a></div>

```typescript
interface PublishDiagnosticsParams {
	/**
	 * The URI for which diagnostic information is reported.
	 */
	uri: DocumentUri;

	/**
	 * Optional the version number of the document the diagnostics are published
	 * for.
	 *
	 * @since 3.15.0
	 */
	version?: integer;

	/**
	 * An array of diagnostic information items.
	 */
	diagnostics: Diagnostic[];
}
```
