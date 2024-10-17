#### <a href="#textDocument_inlineValue" name="textDocument_inlineValue" class="anchor">Inline Value Request (:leftwards_arrow_with_hook:)</a>

> *Since version 3.17.0*

The request is sent from the client to the server to return entries in a given document range for which inline values may be computed and rendered in the editor at the end of lines.
For programming languages, the editor usually uses a debugger to get the value of an entry.

_Client Capability_:
* property name (optional): `textDocument.inlineValue`
* property type: `InlineValueClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#inlineValueClientCapabilities" name="inlineValueClientCapabilities" class="linkableAnchor"></a></div>

```typescript
/**
 * Client capabilities specific to inline values.
 *
 * @since 3.17.0
 */
export interface InlineValueClientCapabilities {
	/**
	 * Whether the implementation supports dynamic registration for inline
	 * value providers.
	 */
	dynamicRegistration?: boolean;
}
```

_Server Capability_:
* property name (optional): `inlineValueProvider`
* property type: `InlineValueOptions` defined as follows:

<div class="anchorHolder"><a href="#inlineValueOptions" name="inlineValueOptions" class="linkableAnchor"></a></div>

```typescript
/**
 * Inline value options used during static registration.
 *
 * @since 3.17.0
 */
export interface InlineValueOptions extends WorkDoneProgressOptions {
}
```

_Registration Options_: `InlineValueRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#inlineValueRegistrationOptions" name="inlineValueRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
/**
 * Inline value options used during static or dynamic registration.
 *
 * @since 3.17.0
 */
export interface InlineValueRegistrationOptions extends InlineValueOptions,
	TextDocumentRegistrationOptions, StaticRegistrationOptions {
}
```

_Request_:
* method: `textDocument/inlineValue`
* params: `InlineValueParams` defined as follows:

<div class="anchorHolder"><a href="#inlineValueParams" name="inlineValueParams" class="linkableAnchor"></a></div>

```typescript
/**
 * A parameter literal used in inline value requests.
 *
 * @since 3.17.0
 */
export interface InlineValueParams extends WorkDoneProgressParams {
	/**
	 * The text document.
	 */
	textDocument: TextDocumentIdentifier;

	/**
	 * The document range for which inline values information will be returned.
	 */
	range: Range;

	/**
	 * Additional information about the context in which inline values information was
	 * requested.
	 */
	context: InlineValueContext;
}
```

<div class="anchorHolder"><a href="#inlineValueContext" name="inlineValueContext" class="linkableAnchor"></a></div>

```typescript
/**
 * @since 3.17.0
 */
export interface InlineValueContext {
	/**
	 * The stack frame (as a DAP ID) where the execution has stopped.
	 */
	frameId: integer;

	/**
	 * The document range where execution has stopped.
	 * Typically, the end position of the range denotes the line where the
	 * inline values are shown.
	 */
	stoppedLocation: Range;
}
```

_Response_:
* result: `InlineValue[]` \| `null` defined as follows:

<div class="anchorHolder"><a href="#inlineValueText" name="inlineValueText" class="linkableAnchor"></a></div>

```typescript
/**
 * Returns inline value information as the complete text to be shown.
 *
 * @since 3.17.0
 */
export interface InlineValueText {
	/**
	 * The document range for which the inline value applies.
	 */
	range: Range;

	/**
	 * The text of the inline value.
	 */
	text: string;
}
```

<div class="anchorHolder"><a href="#inlineValueVariableLookup" name="inlineValueVariableLookup" class="linkableAnchor"></a></div>

```typescript
/**
 * To compute inline value through a variable lookup.
 *
 * If only a range is specified, the variable name should be extracted from
 * the underlying document.
 *
 * An optional variable name could be used to lookup instead of the extracted name.
 *
 * @since 3.17.0
 */
export interface InlineValueVariableLookup {
	/**
	 * The document range for which the inline value applies.
	 * The range could be used to extract the variable name from the underlying
	 * document.
	 */
	range: Range;

	/**
	 * If specified, the name of the variable to look up.
	 */
	variableName?: string;

	/**
	 * How to perform the lookup.
	 */
	caseSensitiveLookup: boolean;
}
```

<div class="anchorHolder"><a href="#inlineValueEvaluatableExpression" name="inlineValueEvaluatableExpression" class="linkableAnchor"></a></div>

```typescript
/**
 * To compute an inline value through an expression evaluation.
 *
 * If only a range is specified, the expression should be extracted from the
 * underlying document.
 *
 * An optional expression could be evaluated instead of the extracted expression.
 *
 * @since 3.17.0
 */
export interface InlineValueEvaluatableExpression {
	/**
	 * The document range for which the inline value applies.
	 * The range could be used to extract the evaluatable expression from the
	 * underlying document.
	 */
	range: Range;

	/**
	 * If specified the expression could be evaluated instead.
	 */
	expression?: string;
}
```

<div class="anchorHolder"><a href="#inlineValue" name="inlineValue" class="linkableAnchor"></a></div>

```typescript
/**
 * Inline value information can be provided by different means:
 * - directly as a text value (class InlineValueText).
 * - as a name to use for a variable lookup (class InlineValueVariableLookup)
 * - as an evaluatable expression (class InlineValueEvaluatableExpression)
 * The InlineValue types combines all inline value types into one type.
 *
 * @since 3.17.0
 */
export type InlineValue = InlineValueText | InlineValueVariableLookup
	| InlineValueEvaluatableExpression;
```
* error: code and message set in case an exception happens during the inline values request.

#### <a href="#workspace_inlineValue_refresh" name="workspace_inlineValue_refresh" class="anchor">Inline Value Refresh Request  (:arrow_right_hook:)</a>

> *Since version 3.17.0*

The `workspace/inlineValue/refresh` request is sent from the server to the client. Servers can use it to ask clients to refresh the inline values currently shown in editors. As a result, the client should ask the server to recompute the inline values for these editors. This is useful if a server detects a configuration change which requires a re-calculation of all inline values. Note that the client still has the freedom to delay the re-calculation of the inline values if, for example, an editor is currently not visible.

_Client Capability_:

* property name (optional): `workspace.inlineValue`
* property type: `InlineValueWorkspaceClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#inlineValueWorkspaceClientCapabilities" name="inlineValueWorkspaceClientCapabilities" class="linkableAnchor"></a></div>

```typescript
/**
 * Client workspace capabilities specific to inline values.
 *
 * @since 3.17.0
 */
export interface InlineValueWorkspaceClientCapabilities {
	/**
	 * Whether the client implementation supports a refresh request sent from
	 * the server to the client.
	 *
	 * Note that this event is global and will force the client to refresh all
	 * inline values currently shown. It should be used with absolute care and
	 * is useful for situations where a server, for example, detects a project
	 * wide change that requires such a calculation.
	 */
	refreshSupport?: boolean;
}
```
_Request_:
* method: `workspace/inlineValue/refresh`
* params: none

_Response_:

* result: void
* error: code and message set in case an exception happens during the 'workspace/inlineValue/refresh' request
