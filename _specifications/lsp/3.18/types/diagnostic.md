#### <a href="#diagnostic" name="diagnostic" class="anchor"> Diagnostic </a>

- New in version 3.18: support for markup content in diagnostic messages. The support is guarded by the
client capability `textDocument.diagnostic.markupMessageSupport`. If a client doesn't signal the capability,
servers shouldn't send `MarkupContent` diagnostic messages back to the client.

Represents a diagnostic, such as a compiler error or warning. Diagnostic objects are only valid in the scope of a resource.

```typescript
export interface Diagnostic {
	/**
	 * The range at which the message applies.
	 */
	range: Range;

	/**
	 * The diagnostic's severity. To avoid interpretation mismatches when a
	 * server is used with different clients it is highly recommended that
	 * servers always provide a severity value. If omitted, it’s recommended
	 * for the client to interpret it as an Error severity.
	 */
	severity?: DiagnosticSeverity;

	/**
	 * The diagnostic's code, which might appear in the user interface.
	 */
	code?: integer | string;

	/**
	 * An optional property to describe the error code.
	 *
	 * @since 3.16.0
	 */
	codeDescription?: CodeDescription;

	/**
	 * A human-readable string describing the source of this
	 * diagnostic, e.g. 'typescript' or 'super lint'.
	 */
	source?: string;

	/**
	 * The diagnostic's message.
	 *
	 * @since 3.18.0 - support for MarkupContent. This is guarded by the client
	 * capability `textDocument.diagnostic.markupMessageSupport`.
	 */
	message: string | MarkupContent;

	/**
	 * Additional metadata about the diagnostic.
	 *
	 * @since 3.15.0
	 */
	tags?: DiagnosticTag[];

	/**
	 * An array of related diagnostic information, e.g. when symbol-names within
	 * a scope collide all definitions can be marked via this property.
	 */
	relatedInformation?: DiagnosticRelatedInformation[];

	/**
	 * A data entry field that is preserved between a
	 * `textDocument/publishDiagnostics` notification and
	 * `textDocument/codeAction` request.
	 *
	 * @since 3.16.0
	 */
	data?: LSPAny;
}
```

The protocol currently supports the following diagnostic severities and tags:

<div class="anchorHolder"><a href="#diagnosticSeverity" name="diagnosticSeverity" class="linkableAnchor"></a></div>

```typescript
export namespace DiagnosticSeverity {
	/**
	 * Reports an error.
	 */
	export const Error: 1 = 1;
	/**
	 * Reports a warning.
	 */
	export const Warning: 2 = 2;
	/**
	 * Reports information.
	 */
	export const Information: 3 = 3;
	/**
	 * Reports a hint.
	 */
	export const Hint: 4 = 4;
}

export type DiagnosticSeverity = 1 | 2 | 3 | 4;
```

<div class="anchorHolder"><a href="#diagnosticTag" name="diagnosticTag" class="linkableAnchor"></a></div>

```typescript
/**
 * The diagnostic tags.
 *
 * @since 3.15.0
 */
export namespace DiagnosticTag {
	/**
	 * Unused or unnecessary code.
	 *
	 * Clients are allowed to render diagnostics with this tag faded out
	 * instead of having an error squiggle.
	 */
	export const Unnecessary: 1 = 1;
	/**
	 * Deprecated or obsolete code.
	 *
	 * Clients are allowed to render diagnostics with this tag strike through.
	 */
	export const Deprecated: 2 = 2;
}

export type DiagnosticTag = 1 | 2;
```

`DiagnosticRelatedInformation` is defined as follows:

<div class="anchorHolder"><a href="#diagnosticRelatedInformation" name="diagnosticRelatedInformation" class="linkableAnchor"></a></div>

```typescript
/**
 * Represents a related message and source code location for a diagnostic.
 * This should be used to point to code locations that cause or are related to
 * a diagnostic, e.g. when duplicating a symbol in a scope.
 */
export interface DiagnosticRelatedInformation {
	/**
	 * The location of this related diagnostic information.
	 */
	location: Location;

	/**
	 * The message of this related diagnostic information.
	 */
	message: string;
}
```

`CodeDescription` is defined as follows:

<div class="anchorHolder"><a href="#codeDescription" name="codeDescription" class="linkableAnchor"></a></div>

```typescript
/**
 * Structure to capture a description for an error code.
 *
 * @since 3.16.0
 */
export interface CodeDescription {
	/**
	 * A URI to open with more information about the diagnostic error.
	 */
	href: URI;
}
```
