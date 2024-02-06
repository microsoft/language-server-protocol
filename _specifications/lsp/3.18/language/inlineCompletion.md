#### <a href="#textDocument_inlineCompletion" name="textDocument_inlineCompletion" class="anchor">Inline Completion Request (:leftwards_arrow_with_hook:)</a>

> *Since version 3.18.0*

The inline completion request is sent from the client to the server to compute inline completions for a given text document either explicitly by a user gesture or implicitly when typing.

Inline completion items usually complete bigger portions of text (e.g., whole methods) and in contrast to completions, items can complete code that might be syntactically or semantically incorrect.

Due to this, inline completion items are usually not suited to be presented in normal code completion widgets like a list of items. One possible approach can be to present the information inline in the editor with lower contrast.

When multiple inline completion items are returned, the client may decide whether the user can cycle through them or if they, along with their `filterText`, are merely for filtering if the user continues to type without yet accepting the inline completion item.

Clients may choose to send information about the user's current completion selection via context if completions are visible at the same time. In this case, returned inline completions should extend the text of the provided completion.


_Client Capability_:
* property name (optional): `textDocument.inlineCompletion`
* property type: `InlineCompletionClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#inlineCompletionClientCapabilities" name="inlineCompletionClientCapabilities" class="linkableAnchor"></a></div>

```typescript
/**
 * Client capabilities specific to inline completions.
 *
 * @since 3.18.0
 */
export interface InlineCompletionClientCapabilities {
	/**
	 * Whether implementation supports dynamic registration for inline
	 * completion providers.
	 */
	dynamicRegistration?: boolean;
}
```

_Server Capability_:
* property name (optional): `inlineCompletionProvider`
* property type: `InlineCompletionOptions` defined as follows:

<div class="anchorHolder"><a href="#inlineCompletionOptions" name="inlineCompletionOptions" class="linkableAnchor"></a></div>

```typescript
/**
 * Inline completion options used during static registration.
 *
 * @since 3.18.0
 */
export interface InlineCompletionOptions extends WorkDoneProgressOptions {
}
```

_Registration Options_: `InlineCompletionRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#inlineCompletionRegistrationOptions" name="inlineCompletionRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
/**
 * Inline completion options used during static or dynamic registration.
 *
 * @since 3.18.0
 */
export interface InlineCompletionRegistrationOptions extends
	InlineCompletionOptions, TextDocumentRegistrationOptions,
	StaticRegistrationOptions {
}
```

_Request_:
* method: `textDocument/inlineCompletion`
* params: `InlineCompletionParams` defined as follows:

<div class="anchorHolder"><a href="#inlineCompletionParams" name="inlineCompletionParams" class="linkableAnchor"></a></div>

```typescript
/**
 * A parameter literal used in inline completion requests.
 *
 * @since 3.18.0
 */
export interface InlineCompletionParams extends TextDocumentPositionParams,
	WorkDoneProgressParams {
	/**
	 * Additional information about the context in which inline completions
	 * were requested.
	 */
	context: InlineCompletionContext;
}
```

<div class="anchorHolder"><a href="#inlineCompletionContext" name="inlineCompletionContext" class="linkableAnchor"></a></div>

```typescript
/**
 * Provides information about the context in which an inline completion was
 * requested.
 *
 * @since 3.18.0
 */
export interface InlineCompletionContext {
	/**
	 * Describes how the inline completion was triggered.
	 */
	triggerKind: InlineCompletionTriggerKind;

	/**
	 * Provides information about the currently selected item in the
	 * autocomplete widget if it is visible.
	 *
	 * If set, provided inline completions must extend the text of the
	 * selected item and use the same range, otherwise they are not shown as
	 * preview.
	 * As an example, if the document text is `console.` and the selected item
	 * is `.log` replacing the `.` in the document, the inline completion must
	 * also replace `.` and start with `.log`, for example `.log()`.
	 *
	 * Inline completion providers are requested again whenever the selected
	 * item changes.
	 */
	selectedCompletionInfo?: SelectedCompletionInfo;
}
```

<div class="anchorHolder"><a href="#inlineCompletionTriggerKind" name="inlineCompletionTriggerKind" class="linkableAnchor"></a></div>

```typescript
/**
 * Describes how an {@link InlineCompletionItemProvider inline completion
 * provider} was triggered.
 *
 * @since 3.18.0
 */
export namespace InlineCompletionTriggerKind {
	/**
	 * Completion was triggered explicitly by a user gesture.
	 * Return multiple completion items to enable cycling through them.
	 */
	export const Invoked: 1 = 1;

	/**
	 * Completion was triggered automatically while editing.
	 * It is sufficient to return a single completion item in this case.
	 */
	export const Automatic: 2 = 2;
}

export type InlineCompletionTriggerKind = 1 | 2;
```

<div class="anchorHolder"><a href="#selectedCompletionInfo" name="selectedCompletionInfo" class="linkableAnchor"></a></div>

```typescript
/**
 * Describes the currently selected completion item.
 *
 * @since 3.18.0
 */
export interface SelectedCompletionInfo {
	/**
	 * The range that will be replaced if this completion item is accepted.
	 */
	range: Range;

	/**
	 * The text the range will be replaced with if this completion is
	 * accepted.
	 */
	text: string;
}
```

_Response_:
* result: `InlineCompletionItem[]` \| `InlineCompletionList` \| `null` defined as follows:

<div class="anchorHolder"><a href="#inlineCompletionList" name="inlineCompletionList" class="linkableAnchor"></a></div>

```typescript
/**
 * Represents a collection of {@link InlineCompletionItem inline completion
 * items} to be presented in the editor.
 *
 * @since 3.18.0
 */
export interface InlineCompletionList {
	/**
	 * The inline completion items.
	 */
	items: InlineCompletionItem[];
}
```

<div class="anchorHolder"><a href="#inlineCompletionItem" name="inlineCompletionItem" class="linkableAnchor"></a></div>

```typescript
/**
 * An inline completion item represents a text snippet that is proposed inline
 * to complete text that is being typed.
 *
 * @since 3.18.0
 */
export interface InlineCompletionItem {
	/**
	 * The text to replace the range with. Must be set.
	 * Is used both for the preview and the accept operation.
	 */
	insertText: string | StringValue;

	/**
	 * A text that is used to decide if this inline completion should be
	 * shown. When `falsy`, the {@link InlineCompletionItem.insertText} is
	 * used.
	 *
	 * An inline completion is shown if the text to replace is a prefix of the
	 * filter text.
	 */
	filterText?: string;

	/**
	 * The range to replace.
	 * Must begin and end on the same line.
	 *
	 * Prefer replacements over insertions to provide a better experience when
	 * the user deletes typed text.
	 */
	range?: Range;

	/**
	 * An optional {@link Command} that is executed *after* inserting this
	 * completion.
	 */
	command?: Command;
}
```


* error: code and message set in case an exception happens during the inline completions request.
