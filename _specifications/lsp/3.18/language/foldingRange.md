#### <a href="#textDocument_foldingRange" name="textDocument_foldingRange" class="anchor">Folding Range Request (:leftwards_arrow_with_hook:)</a>

> *Since version 3.10.0*

The folding range request is sent from the client to the server to return all folding ranges found in a given text document.

_Client Capability_:
* property name (optional): `textDocument.foldingRange`
* property type: `FoldingRangeClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#foldingRangeClientCapabilities" name="foldingRangeClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface FoldingRangeClientCapabilities {
	/**
	 * Whether implementation supports dynamic registration for folding range
	 * providers. If this is set to `true` the client supports the new
	 * `FoldingRangeRegistrationOptions` return value for the corresponding
	 * server capability as well.
	 */
	dynamicRegistration?: boolean;

	/**
	 * The maximum number of folding ranges that the client prefers to receive
	 * per document. The value serves as a hint, servers are free to follow the
	 * limit.
	 */
	rangeLimit?: uinteger;

	/**
	 * If set, the client signals that it only supports folding complete lines.
	 * If set, client will ignore specified `startCharacter` and `endCharacter`
	 * properties in a FoldingRange.
	 */
	lineFoldingOnly?: boolean;

	/**
	 * Specific options for the folding range kind.
	 *
	 * @since 3.17.0
	 */
	foldingRangeKind? : {
		/**
		 * The folding range kind values the client supports. When this
		 * property exists the client also guarantees that it will
		 * handle values outside its set gracefully and falls back
		 * to a default value when unknown.
		 */
		valueSet?: FoldingRangeKind[];
	};

	/**
	 * Specific options for the folding range.
	 * @since 3.17.0
	 */
	foldingRange?: {
		/**
		* If set, the client signals that it supports setting collapsedText on
		* folding ranges to display custom labels instead of the default text.
		*
		* @since 3.17.0
		*/
		collapsedText?: boolean;
	};
}
```

_Server Capability_:
* property name (optional): `foldingRangeProvider`
* property type: `boolean | FoldingRangeOptions | FoldingRangeRegistrationOptions` where `FoldingRangeOptions` is defined as follows:

<div class="anchorHolder"><a href="#foldingRangeOptions" name="foldingRangeOptions" class="linkableAnchor"></a></div>

```typescript
export interface FoldingRangeOptions extends WorkDoneProgressOptions {
}
```

_Registration Options_: `FoldingRangeRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#foldingRangeRegistrationOptions" name="foldingRangeRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface FoldingRangeRegistrationOptions extends
	TextDocumentRegistrationOptions, FoldingRangeOptions,
	StaticRegistrationOptions {
}
```

_Request_:

* method: `textDocument/foldingRange`
* params: `FoldingRangeParams` defined as follows

<div class="anchorHolder"><a href="#foldingRangeParams" name="foldingRangeParams" class="linkableAnchor"></a></div>

```typescript
export interface FoldingRangeParams extends WorkDoneProgressParams,
	PartialResultParams {
	/**
	 * The text document.
	 */
	textDocument: TextDocumentIdentifier;
}
```

_Response_:
* result: `FoldingRange[] | null` defined as follows:

<div class="anchorHolder"><a href="#foldingRangeKind" name="foldingRangeKind" class="linkableAnchor"></a></div>

```typescript
/**
 * A set of predefined range kinds.
 */
export namespace FoldingRangeKind {
	/**
	 * Folding range for a comment
	 */
	export const Comment = 'comment';

	/**
	 * Folding range for imports or includes
	 */
	export const Imports = 'imports';

	/**
	 * Folding range for a region (e.g. `#region`)
	 */
	export const Region = 'region';
}

/**
 * The type is a string since the value set is extensible
 */
export type FoldingRangeKind = string;
```

<div class="anchorHolder"><a href="#foldingRange" name="foldingRange" class="linkableAnchor"></a></div>

```typescript
/**
 * Represents a folding range. To be valid, start and end line must be bigger
 * than zero and smaller than the number of lines in the document. Clients
 * are free to ignore invalid ranges.
 */
export interface FoldingRange {

	/**
	 * The zero-based start line of the range to fold. The folded area starts
	 * after the line's last character. To be valid, the end must be zero or
	 * larger and smaller than the number of lines in the document.
	 */
	startLine: uinteger;

	/**
	 * The zero-based character offset from where the folded range starts. If
	 * not defined, defaults to the length of the start line.
	 */
	startCharacter?: uinteger;

	/**
	 * The zero-based end line of the range to fold. The folded area ends with
	 * the line's last character. To be valid, the end must be zero or larger
	 * and smaller than the number of lines in the document.
	 */
	endLine: uinteger;

	/**
	 * The zero-based character offset before the folded range ends. If not
	 * defined, defaults to the length of the end line.
	 */
	endCharacter?: uinteger;

	/**
	 * Describes the kind of the folding range such as `comment` or `region`.
	 * The kind is used to categorize folding ranges and used by commands like
	 * 'Fold all comments'. See [FoldingRangeKind](#FoldingRangeKind) for an
	 * enumeration of standardized kinds.
	 */
	kind?: FoldingRangeKind;

	/**
	 * The text that the client should show when the specified range is
	 * collapsed. If not defined or not supported by the client, a default
	 * will be chosen by the client.
	 *
	 * @since 3.17.0 - proposed
	 */
	collapsedText?: string;
}
```

* partial result: `FoldingRange[]`
* error: code and message set in case an exception happens during the 'textDocument/foldingRange' request

#### <a href="#workspace_foldingRange_refresh" name="workspace_foldingRange_refresh" class="anchor">Folding Range Refresh Request (:arrow_right_hook:)</a>

> *Since version 3.18.0*

The `workspace/foldingRange/refresh` request is sent from the server to the client. Servers can use it to ask clients to refresh the folding ranges currently shown in editors. As a result, the client should ask the server to recompute the folding ranges for these editors. This is useful if a server detects a configuration change which requires a re-calculation of all folding ranges. Note that the client still has the freedom to delay the re-calculation of the folding ranges if, for example, an editor is currently not visible.

_Client Capability_:

* property name (optional): `workspace.foldingRange`
* property type: `FoldingRangeWorkspaceClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#foldingRangeWorkspaceClientCapabilities" name="foldingRangeWorkspaceClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface FoldingRangeWorkspaceClientCapabilities {
	/**
	 * Whether the client implementation supports a refresh request sent from the
	 * server to the client.
	 *
	 * Note that this event is global and will force the client to refresh all
	 * folding ranges currently shown. It should be used with absolute care and is
	 * useful for situation where a server, for example, detects a project wide
	 * change that requires such a calculation.
	 * 
	 * @since 3.18.0
	 * @proposed
	 */
	refreshSupport?: boolean;
}
```

_Request_:

* method: `workspace/foldingRange/refresh`
* params: none

_Response_:

* result: void
* error: code and message set in case an exception happens during the 'workspace/foldingRange/refresh' request