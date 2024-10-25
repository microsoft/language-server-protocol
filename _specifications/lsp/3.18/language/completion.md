#### <a href="#textDocument_completion" name="textDocument_completion" class="anchor">Completion Request (:leftwards_arrow_with_hook:)</a>

The Completion request is sent from the client to the server to compute completion items at a given cursor position. Completion items are presented in the [IntelliSense](https://code.visualstudio.com/docs/editor/intellisense) user interface. If computing full completion items is expensive, servers can additionally provide a handler for the completion item resolve request ('completionItem/resolve'). This request is sent when a completion item is selected in the user interface. A typical use case for this would be the `textDocument/completion` request, which doesn't fill in the `documentation` property for returned completion items since it is expensive to compute. When the item is selected in the user interface, a 'completionItem/resolve' request is sent with the selected completion item as a parameter. The returned completion item should have the documentation property filled in. By default, the request can only delay the computation of the `detail` and `documentation` properties. Since 3.16.0, the client
can signal that it can resolve more properties lazily. This is done using the `completionItem#resolveSupport` client capability which lists all properties that can be filled in during a 'completionItem/resolve' request. All other properties (usually `sortText`, `filterText`, `insertText` and `textEdit`) must be provided in the `textDocument/completion` response and must not be changed during resolve.

The language server protocol uses the following model around completions:

- to achieve consistency across languages and to honor different clients, usually the client is responsible for filtering and sorting. This also has the advantage that clients can experiment with different filter and sorting models. However, servers can enforce different behavior by setting a `filterText` / `sortText`.
- for speed, clients should be able to filter an already received completion list if the user continues typing. Servers can opt out of this using a `CompletionList` and mark it as `isIncomplete`.

A completion item provides additional means to influence filtering and sorting. They are expressed by either creating a `CompletionItem` with an `insertText` or with a `textEdit`. The two modes differ as follows:

- **Completion item provides an insertText / label without a text edit**: in the model the client should filter against what the user has already typed using the word boundary rules of the language (e.g. resolving the word under the cursor position). The reason for this mode is that it makes it extremely easy for a server to implement a basic completion list and get it filtered on the client.

- **Completion Item with text edits**: in this mode the server tells the client that it actually knows what it is doing. If you create a completion item with a text edit at the current cursor position no word guessing takes place and no automatic filtering (like with an `insertText`) should happen. This mode can be combined with a sort text and filter text to customize two things. If the text edit is a replace edit then the range denotes the word used for filtering. If the replace changes the text it most likely makes sense to specify a filter text to be used.

_Client Capability_:
* property name (optional): `textDocument.completion`
* property type: `CompletionClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#completionClientCapabilities" name="completionClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface CompletionClientCapabilities {
	/**
	 * Whether completion supports dynamic registration.
	 */
	dynamicRegistration?: boolean;

	/**
	 * The client supports the following `CompletionItem` specific
	 * capabilities.
	 */
	completionItem?: {
		/**
		 * Client supports snippets as insert text.
		 *
		 * A snippet can define tab stops and placeholders with `$1`, `$2`
		 * and `${3:foo}`. `$0` defines the final tab stop, it defaults to
		 * the end of the snippet. Placeholders with equal identifiers are
		 * linked, that is, typing in one will update others too.
		 */
		snippetSupport?: boolean;

		/**
		 * Client supports commit characters on a completion item.
		 */
		commitCharactersSupport?: boolean;

		/**
		 * Client supports these content formats for the documentation
		 * property. The order describes the preferred format of the client.
		 */
		documentationFormat?: MarkupKind[];

		/**
		 * Client supports the deprecated property on a completion item.
		 */
		deprecatedSupport?: boolean;

		/**
		 * Client supports the preselect property on a completion item.
		 */
		preselectSupport?: boolean;

		/**
		 * Client supports the tag property on a completion item. Clients
		 * supporting tags have to handle unknown tags gracefully. Clients
		 * especially need to preserve unknown tags when sending a completion
		 * item back to the server in a resolve call.
		 *
		 * @since 3.15.0
		 */
		tagSupport?: {
			/**
			 * The tags supported by the client.
			 */
			valueSet: CompletionItemTag[];
		};

		/**
		 * Client supports insert replace edit to control different behavior if
		 * a completion item is inserted in the text or should replace text.
		 *
		 * @since 3.16.0
		 */
		insertReplaceSupport?: boolean;

		/**
		 * Indicates which properties a client can resolve lazily on a
		 * completion item. Before version 3.16.0, only the predefined properties
		 * `documentation` and `detail` could be resolved lazily.
		 *
		 * @since 3.16.0
		 */
		resolveSupport?: {
			/**
			 * The properties that a client can resolve lazily.
			 */
			properties: string[];
		};

		/**
		 * The client supports the `insertTextMode` property on
		 * a completion item to override the whitespace handling mode
		 * as defined by the client (see `insertTextMode`).
		 *
		 * @since 3.16.0
		 */
		insertTextModeSupport?: {
			valueSet: InsertTextMode[];
		};

		/**
		 * The client has support for completion item label
		 * details (see also `CompletionItemLabelDetails`).
		 *
		 * @since 3.17.0
		 */
		labelDetailsSupport?: boolean;
	};

	completionItemKind?: {
		/**
		 * The completion item kind values the client supports. When this
		 * property exists, the client also guarantees that it will
		 * handle values outside its set gracefully and falls back
		 * to a default value when unknown.
		 *
		 * If this property is not present, the client only supports
		 * the completion item kinds from `Text` to `Reference` as defined in
		 * the initial version of the protocol.
		 */
		valueSet?: CompletionItemKind[];
	};

	/**
	 * The client supports sending additional context information for a
	 * `textDocument/completion` request.
	 */
	contextSupport?: boolean;

	/**
	 * The client's default when the completion item doesn't provide an
	 * `insertTextMode` property.
	 *
	 * @since 3.17.0
	 */
	insertTextMode?: InsertTextMode;

	/**
	 * The client supports the following `CompletionList` specific
	 * capabilities.
	 *
	 * @since 3.17.0
	 */
	completionList?: {
		/**
		 * The client supports the following itemDefaults on
		 * a completion list.
		 *
		 * The value lists the supported property names of the
		 * `CompletionList.itemDefaults` object. If omitted,
		 * no properties are supported.
		 *
		 * @since 3.17.0
		 */
		itemDefaults?: string[];

		/**
		 * Specifies whether the client supports `CompletionList.applyKind` to
		 * indicate how supported values from `completionList.itemDefaults`
		 * and `completion` will be combined.
		 * 
		 * If a client supports `applyKind` it must support it for all fields
		 * that it supports that are listed in `CompletionList.applyKind`. This
		 * means when clients add support for new/future fields in completion
		 * items the MUST also support merge for them if those fields are
		 * defined in `CompletionList.applyKind`.
		 *
		 * @since 3.18.0
		 */
		applyKindSupport?: boolean;
	}
}
```

_Server Capability_:
* property name (optional): `completionProvider`
* property type: `CompletionOptions` defined as follows:

<div class="anchorHolder"><a href="#completionOptions" name="completionOptions" class="linkableAnchor"></a></div>

```typescript
/**
 * Completion options.
 */
export interface CompletionOptions extends WorkDoneProgressOptions {
	/**
	 * Most tools trigger completion request automatically without explicitly
	 * requesting it using a keyboard shortcut (e.g., Ctrl+Space). Typically they
	 * do so when the user starts to type an identifier. For example, if the user
	 * types `c` in a JavaScript file, code complete will automatically pop up and
	 * present `console` besides others as a completion item. Characters that
	 * make up identifiers don't need to be listed here.
	 *
	 * If code complete should automatically be triggered on characters not being
	 * valid inside an identifier (for example, `.` in JavaScript), list them in
	 * `triggerCharacters`.
	 */
	triggerCharacters?: string[];

	/**
	 * The list of all possible characters that commit a completion. This field
	 * can be used if clients don't support individual commit characters per
	 * completion item. See client capability
	 * `completion.completionItem.commitCharactersSupport`.
	 *
	 * If a server provides both `allCommitCharacters` and commit characters on
	 * an individual completion item, the ones on the completion item win.
	 *
	 * @since 3.2.0
	 */
	allCommitCharacters?: string[];

	/**
	 * The server provides support to resolve additional
	 * information for a completion item.
	 */
	resolveProvider?: boolean;

	/**
	 * The server supports the following `CompletionItem` specific
	 * capabilities.
	 *
	 * @since 3.17.0
	 */
	completionItem?: {
		/**
		 * The server has support for completion item label
		 * details (see also `CompletionItemLabelDetails`) when receiving
		 * a completion item in a resolve call.
		 *
		 * @since 3.17.0
		 */
		labelDetailsSupport?: boolean;
	}
}
```

_Registration Options_: `CompletionRegistrationOptions` options defined as follows:

<div class="anchorHolder"><a href="#completionRegistrationOptions" name="completionRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface CompletionRegistrationOptions
	extends TextDocumentRegistrationOptions, CompletionOptions {
}
```

_Request_:
* method: `textDocument/completion`
* params: `CompletionParams` defined as follows:

<div class="anchorHolder"><a href="#completionParams" name="completionParams" class="linkableAnchor"></a></div>

```typescript
export interface CompletionParams extends TextDocumentPositionParams,
	WorkDoneProgressParams, PartialResultParams {
	/**
	 * The completion context. This is only available if the client specifies
	 * to send this using the client capability
	 * `completion.contextSupport === true`
	 */
	context?: CompletionContext;
}
```

<div class="anchorHolder"><a href="#completionTriggerKind" name="completionTriggerKind" class="linkableAnchor"></a></div>

```typescript
/**
 * How a completion was triggered.
 */
export namespace CompletionTriggerKind {
	/**
	 * Completion was triggered by typing an identifier (automatic code
	 * complete), manual invocation (e.g. Ctrl+Space) or via API.
	 */
	export const Invoked: 1 = 1;

	/**
	 * Completion was triggered by a trigger character specified by
	 * the `triggerCharacters` properties of the
	 * `CompletionRegistrationOptions`.
	 */
	export const TriggerCharacter: 2 = 2;

	/**
	 * Completion was re-triggered as the current completion list is incomplete.
	 */
	export const TriggerForIncompleteCompletions: 3 = 3;
}
export type CompletionTriggerKind = 1 | 2 | 3;
```

<div class="anchorHolder"><a href="#completionContext" name="completionContext" class="linkableAnchor"></a></div>

```typescript
/**
 * Contains additional information about the context in which a completion
 * request is triggered.
 */
export interface CompletionContext {
	/**
	 * How the completion was triggered.
	 */
	triggerKind: CompletionTriggerKind;

	/**
	 * The trigger character (a single character) that
	 * has triggered code complete. Is undefined if
	 * `triggerKind !== CompletionTriggerKind.TriggerCharacter`
	 */
	triggerCharacter?: string;
}
```

_Response_:
* result: `CompletionItem[]` \| `CompletionList` \| `null`. If a `CompletionItem[]` is provided, it is interpreted to be complete, so it is the same as `{ isIncomplete: false, items }`

<div class="anchorHolder"><a href="#completionList" name="completionList" class="linkableAnchor"></a></div>

```typescript
/**
 * Represents a collection of [completion items](#CompletionItem) to be
 * presented in the editor.
 */
export interface CompletionList {
	/**
	 * This list is not complete. Further typing should result in recomputing
	 * this list.
	 *
	 * Recomputed lists have all their items replaced (not appended) in the
	 * incomplete completion sessions.
	 */
	isIncomplete: boolean;

	/**
	 * In many cases, the items of an actual completion result share the same
	 * value for properties like `commitCharacters` or the range of a text
	 * edit. A completion list can therefore define item defaults which will
	 * be used if a completion item itself doesn't specify the value.
	 *
	 * If a completion list specifies a default value and a completion item
	 * also specifies a corresponding value, the rules for combining these are
	 * defined by `applyKinds` (if the client supports it), defaulting to
	 * ApplyKind.Replace.
	 *
	 * Servers are only allowed to return default values if the client
	 * signals support for this via the `completionList.itemDefaults`
	 * capability.
	 *
	 * @since 3.17.0
	 */
	itemDefaults?: {
		/**
		 * A default commit character set.
		 *
		 * @since 3.17.0
		 */
		commitCharacters?: string[];

		/**
		 * A default edit range.
		 *
		 * @since 3.17.0
		 */
		editRange?: Range | {
			insert: Range;
			replace: Range;
		};

		/**
		 * A default insert text format.
		 *
		 * @since 3.17.0
		 */
		insertTextFormat?: InsertTextFormat;

		/**
		 * A default insert text mode.
		 *
		 * @since 3.17.0
		 */
		insertTextMode?: InsertTextMode;

		/**
		 * A default data value.
		 *
		 * @since 3.17.0
		 */
		data?: LSPAny;
	}

	/**
	 * Specifies how fields from a completion item should be combined with those
	 * from `completionList.itemDefaults`.
	 * 
	 * If unspecified, all fields will be treated as ApplyKind.Replace.
	 * 
	 * If a field's value is ApplyKind.Replace, the value from a completion item
	 * (if provided and not `null`) will always be used instead of the value
	 * from `completionItem.itemDefaults`.
	 * 
	 * If a field's value is ApplyKind.Merge, the values will be merged using
	 * the rules defined against each field below.
	 *
	 * Servers are only allowed to return `applyKind` if the client
	 * signals support for this via the `completionList.applyKindSupport`
	 * capability.
	 *
	 * @since 3.18.0
	 */
	applyKind?: {
		/**
		 * Specifies whether commitCharacters on a completion will replace or be
		 * merged with those in `completionList.itemDefaults.commitCharacters`.
		 * 
		 * If ApplyKind.Replace, the commit characters from the completion item
		 * will always be used unless not provided, in which case those from
		 * `completionList.itemDefaults.commitCharacters` will be used. An
		 * empty list can be used if a completion item does not have any commit
		 * characters and also should not use those from
		 * `completionList.itemDefaults.commitCharacters`.
		 * 
		 * If ApplyKind.Merge the commitCharacters for the completion will be
		 * the union of all values in both
		 * `completionList.itemDefaults.commitCharacters` and the completion's
		 * own `commitCharacters`.
		 *
		 * @since 3.18.0
		 */
		commitCharacters?: ApplyKind;

		/**
		 * Specifies whether the `data` field on a completion will replace or
		 * be merged with data from `completionList.itemDefaults.data`.
		 * 
		 * If ApplyKind.Replace, the data from the completion item will be used
		 * if provided (and not `null`), otherwise
		 * `completionList.itemDefaults.data` will be used. An empty object can
		 * be used if a completion item does not have any data but also should
		 * not use the value from `completionList.itemDefaults.data`.
		 * 
		 * If ApplyKind.Merge, a shallow merge will be performed between
		 * `completionList.itemDefaults.data` and the completion's own data
		 * using the following rules:
		 * 
		 * - If a completion's `data` field is not provided (or `null`), the
		 *   entire `data` field from `completionList.itemDefaults.data` will be
		 *   used as-is.
		 * - If a completion's `data` field is provided, each field will
		 *   overwrite the field of the same name in
		 *   `completionList.itemDefaults.data` but no merging of nested fields
		 *   within that value will occur.
		 *
		 * @since 3.18.0
		 */
		data?: ApplyKind;
	}

	/**
	 * The completion items.
	 */
	items: CompletionItem[];
}
```

<div class="anchorHolder"><a href="#insertTextFormat" name="insertTextFormat" class="linkableAnchor"></a></div>

```typescript
/**
 * Defines whether the insert text in a completion item should be interpreted as
 * plain text or a snippet.
 */
export namespace InsertTextFormat {
	/**
	 * The primary text to be inserted is treated as a plain string.
	 */
	export const PlainText = 1;

	/**
	 * The primary text to be inserted is treated as a snippet.
	 *
	 * A snippet can define tab stops and placeholders with `$1`, `$2`
	 * and `${3:foo}`. `$0` defines the final tab stop, it defaults to
	 * the end of the snippet. Placeholders with equal identifiers are linked,
	 * that is, typing in one will update others too.
	 */
	export const Snippet = 2;
}

export type InsertTextFormat = 1 | 2;
```

<div class="anchorHolder"><a href="#completionItemTag" name="completionItemTag" class="linkableAnchor"></a></div>

```typescript
/**
 * Completion item tags are extra annotations that tweak the rendering of a
 * completion item.
 *
 * @since 3.15.0
 */
export namespace CompletionItemTag {
	/**
	 * Render a completion as obsolete, usually using a strike-out.
	 */
	export const Deprecated = 1;
}

export type CompletionItemTag = 1;
```

<div class="anchorHolder"><a href="#insertReplaceEdit" name="insertReplaceEdit" class="linkableAnchor"></a></div>

```typescript
/**
 * A special text edit to provide an insert and a replace operation.
 *
 * @since 3.16.0
 */
export interface InsertReplaceEdit {
	/**
	 * The string to be inserted.
	 */
	newText: string;

	/**
	 * The range if the insert is requested.
	 */
	insert: Range;

	/**
	 * The range if the replace is requested.
	 */
	replace: Range;
}
```

<div class="anchorHolder"><a href="#insertTextMode" name="insertTextMode" class="linkableAnchor"></a></div>

```typescript
/**
 * How whitespace and indentation is handled during completion
 * item insertion.
 *
 * @since 3.16.0
 */
export namespace InsertTextMode {
	/**
	 * The insertion or replace strings are taken as-is. If the
	 * value is multiline, the lines below the cursor will be
	 * inserted using the indentation defined in the string value.
	 * The client will not apply any kind of adjustments to the
	 * string.
	 */
	export const asIs: 1 = 1;

	/**
	 * The editor adjusts leading whitespace of new lines so that
	 * they match the indentation up to the cursor of the line for
	 * which the item is accepted.
	 *
	 * Consider a line like this: <2tabs><cursor><3tabs>foo. Accepting a
	 * multi line completion item is indented using 2 tabs and all
	 * following lines inserted will be indented using 2 tabs as well.
	 */
	export const adjustIndentation: 2 = 2;
}

export type InsertTextMode = 1 | 2;
```

<div class="anchorHolder"><a href="#completionItemLabelDetails" name="completionItemLabelDetails" class="linkableAnchor"></a></div>

```typescript
/**
 * Additional details for a completion item label.
 *
 * @since 3.17.0
 */
export interface CompletionItemLabelDetails {

	/**
	 * An optional string which is rendered less prominently directly after
	 * {@link CompletionItem.label label}, without any spacing. Should be
	 * used for function signatures or type annotations.
	 */
	detail?: string;

	/**
	 * An optional string which is rendered less prominently after
	 * {@link CompletionItemLabelDetails.detail}. Should be used for fully qualified
	 * names or file paths.
	 */
	description?: string;
}
```

<div class="anchorHolder"><a href="#applyKind" name="applyKind" class="linkableAnchor"></a></div>

```typescript
/**
 * Defines how values from a set of defaults and an individual item will be
 * merged.
 *
 * @since 3.18.0
 */
export namespace ApplyKind {
	/**
	 * The value from the individual item (if provided and not `null`) will be
	 * used instead of the default.
	 */
	export const Replace: 1 = 1;

	/**
	 * The value from the item will be merged with the default.
	 *
	 * The specific rules for mergeing values are defined against each field
	 * that supports merging.
	 */
	export const Merge: 2 = 2;
}

/**
 * Defines how values from a set of defaults and an individual item will be
 * merged.
 *
 * @since 3.18.0
 */
export type ApplyKind = 1 | 2;
```

<div class="anchorHolder"><a href="#completionItem" name="completionItem" class="linkableAnchor"></a></div>

```typescript
export interface CompletionItem {

	/**
	 * The label of this completion item.
	 *
	 * The label property is also by default the text that
	 * is inserted when selecting this completion.
	 *
	 * If label details are provided, the label itself should
	 * be an unqualified name of the completion item.
	 */
	label: string;

	/**
	 * Additional details for the label.
	 *
	 * @since 3.17.0
	 */
	labelDetails?: CompletionItemLabelDetails;

	/**
	 * The kind of this completion item. Based on the kind,
	 * an icon is chosen by the editor. The standardized set
	 * of available values is defined in `CompletionItemKind`.
	 */
	kind?: CompletionItemKind;

	/**
	 * Tags for this completion item.
	 *
	 * @since 3.15.0
	 */
	tags?: CompletionItemTag[];

	/**
	 * A human-readable string with additional information
	 * about this item, like type or symbol information.
	 */
	detail?: string;

	/**
	 * A human-readable string that represents a doc-comment.
	 */
	documentation?: string | MarkupContent;

	/**
	 * Indicates if this item is deprecated.
	 *
	 * @deprecated Use `tags` instead if supported.
	 */
	deprecated?: boolean;

	/**
	 * Select this item when showing.
	 *
	 * *Note* that only one completion item can be selected and that the
	 * tool / client decides which item that is. The rule is that the *first*
	 * item of those that match best is selected.
	 */
	preselect?: boolean;

	/**
	 * A string that should be used when comparing this item
	 * with other items. When omitted, the label is used
	 * as the sort text for this item.
	 */
	sortText?: string;

	/**
	 * A string that should be used when filtering a set of
	 * completion items. When omitted, the label is used as the
	 * filter text for this item.
	 */
	filterText?: string;

	/**
	 * A string that should be inserted into a document when selecting
	 * this completion. When omitted, the label is used as the insert text
	 * for this item.
	 *
	 * The `insertText` is subject to interpretation by the client side.
	 * Some tools might not take the string literally. For example,
	 * when code complete is requested for `con<cursor position>`
	 * and a completion item with an `insertText` of `console` is provided,
	 * VSCode will only insert `sole`. Therefore, it is
	 * recommended to use `textEdit` instead since it avoids additional client
	 * side interpretation.
	 */
	insertText?: string;

	/**
	 * The format of the insert text. The format applies to both the
	 * `insertText` property and the `newText` property of a provided
	 * `textEdit`. If omitted, defaults to `InsertTextFormat.PlainText`.
	 *
	 * Please note that the insertTextFormat doesn't apply to
	 * `additionalTextEdits`.
	 */
	insertTextFormat?: InsertTextFormat;

	/**
	 * How whitespace and indentation is handled during completion
	 * item insertion. If not provided, the client's default value depends on
	 * the `textDocument.completion.insertTextMode` client capability.
	 *
	 * @since 3.16.0
	 * @since 3.17.0 - support for `textDocument.completion.insertTextMode`
	 */
	insertTextMode?: InsertTextMode;

	/**
	 * An edit which is applied to a document when selecting this completion.
	 * When an edit is provided, the value of `insertText` is ignored.
	 *
	 * *Note:* The range of the edit must be a single line range and it must
	 * contain the position at which completion has been requested. Despite this
	 * limitation, your edit can write multiple lines.
	 *
	 * Most editors support two different operations when accepting a completion
	 * item. One is to insert a completion text and the other is to replace an
	 * existing text with a completion text. Since this can usually not be
	 * predetermined by a server it can report both ranges. Clients need to
	 * signal support for `InsertReplaceEdit`s via the
	 * `textDocument.completion.completionItem.insertReplaceSupport` client
	 * capability property.
	 *
	 * *Note 1:* The text edit's range as well as both ranges from an insert
	 * replace edit must be a single line and they must contain the position
	 * at which completion has been requested. In both cases, the new text can
	 * consist of multiple lines.
	 * *Note 2:* If an `InsertReplaceEdit` is returned, the edit's insert range
	 * must be a prefix of the edit's replace range, meaning it must be
	 * contained in and starting at the same position.
	 *
	 * @since 3.16.0 additional type `InsertReplaceEdit`
	 */
	textEdit?: TextEdit | InsertReplaceEdit;

	/**
	 * The edit text used if the completion item is part of a CompletionList and
	 * CompletionList defines an item default for the text edit range.
	 *
	 * Clients will only honor this property if they opt into completion list
	 * item defaults using the capability `completionList.itemDefaults`.
	 *
	 * If not provided and a list's default range is provided, the label
	 * property is used as a text.
	 *
	 * @since 3.17.0
	 */
	textEditText?: string;

	/**
	 * An optional array of additional text edits that are applied when
	 * selecting this completion. Edits must not overlap (including the same
	 * insert position) with the main edit nor with themselves.
	 *
	 * Additional text edits should be used to change text unrelated to the
	 * current cursor position (for example adding an import statement at the
	 * top of the file if the completion item will insert an unqualified type).
	 */
	additionalTextEdits?: TextEdit[];

	/**
	 * An optional set of characters that, when pressed while this completion is
	 * active, will accept it first and then type that character. *Note* that all
	 * commit characters should have `length=1` and that superfluous characters
	 * will be ignored.
	 */
	commitCharacters?: string[];

	/**
	 * An optional command that is executed *after* inserting this completion.
	 * *Note* that additional modifications to the current document should be
	 * described with the additionalTextEdits-property.
	 */
	command?: Command;

	/**
	 * A data entry field that is preserved on a completion item between
	 * a completion and a completion resolve request.
	 */
	data?: LSPAny;
}
```

<div class="anchorHolder"><a href="#completionItemKind" name="completionItemKind" class="linkableAnchor"></a></div>

```typescript
/**
 * The kind of a completion entry.
 */
export namespace CompletionItemKind {
	export const Text = 1;
	export const Method = 2;
	export const Function = 3;
	export const Constructor = 4;
	export const Field = 5;
	export const Variable = 6;
	export const Class = 7;
	export const Interface = 8;
	export const Module = 9;
	export const Property = 10;
	export const Unit = 11;
	export const Value = 12;
	export const Enum = 13;
	export const Keyword = 14;
	export const Snippet = 15;
	export const Color = 16;
	export const File = 17;
	export const Reference = 18;
	export const Folder = 19;
	export const EnumMember = 20;
	export const Constant = 21;
	export const Struct = 22;
	export const Event = 23;
	export const Operator = 24;
	export const TypeParameter = 25;
}

export type CompletionItemKind = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25;
```
* partial result: `CompletionItem[]` or `CompletionList` followed by `CompletionItem[]`. If the first provided result item is of type `CompletionList`, subsequent partial results of `CompletionItem[]` add to the `items` property of the `CompletionList`.
* error: code and message set in case an exception happens during the completion request.

Completion items support snippets (see `InsertTextFormat.Snippet`). The snippet format is as follows:

##### <a href="#snippet_syntax" name="snippet_syntax" class="anchor">Snippet Syntax</a>

The `body` of a snippet can use special constructs to control cursors and the text being inserted. The following are supported features and their syntaxes:

##### Tab stops

With tab stops, you can make the editor cursor move inside a snippet. Use `$1`, `$2`, and so on to specify cursor locations. The number is the order in which tab stops will be visited, whereas `$0` denotes the final cursor position. Multiple tab stops are linked and updated in sync.

##### Placeholders

Placeholders are tab stops with values, like `${1:foo}`. The placeholder text will be inserted and selected such that it can be easily changed. Placeholders can be nested, like `${1:another ${2:placeholder}}`.

##### Choice

Placeholders can have choices as values. The syntax is a comma separated enumeration of values, enclosed with the pipe-character, for example `${1|one,two,three|}`. When the snippet is inserted and the placeholder selected, choices will prompt the user to pick one of the values.

##### Variables

With `$name` or `${name:default}` you can insert the value of a variable. When a variable isn’t set, its *default* or the empty string is inserted. When a variable is unknown (that is, its name isn’t defined) the name of the variable is inserted and it is transformed into a placeholder.

The following variables can be used:

* `TM_SELECTED_TEXT` The currently selected text or the empty string
* `TM_CURRENT_LINE` The contents of the current line
* `TM_CURRENT_WORD` The contents of the word under the cursor or the empty string
* `TM_LINE_INDEX` The zero-index based line number
* `TM_LINE_NUMBER` The one-index based line number
* `TM_FILENAME` The filename of the current document
* `TM_FILENAME_BASE` The filename of the current document without its extensions
* `TM_DIRECTORY` The directory of the current document
* `TM_FILEPATH` The full file path of the current document

##### Variable Transforms

Transformations allow you to modify the value of a variable before it is inserted. The definition of a transformation consists of three parts:

1. A [regular expression](#regExp) that is matched against the value of a variable, or the empty string when the variable cannot be resolved.
2. A "format string" that allows referencing matching groups from the regular expression. The format string allows for conditional inserts and simple modifications.
3. Options that are passed to the regular expression.

The following example inserts the name of the current file without its ending, so it transforms `foo.txt` to `foo`.

```
${TM_FILENAME/(.*)\..+$/$1/}
  |           |         | |
  |           |         | |-> no options
  |           |         |
  |           |         |-> references the contents of the first
  |           |             capture group
  |           |
  |           |-> regex to capture everything before
  |               the final `.suffix`
  |
  |-> resolves to the filename
```

##### Grammar

Below is the grammar for snippets in EBNF ([extended Backus-Naur form, XML variant](https://www.w3.org/TR/xml/#sec-notation)). With `\` (backslash), you can escape `$`, `}` and `\`. Within choice elements, the backslash also escapes comma and pipe characters. Only the characters required to be escaped can be escaped, so `$` should not be escaped within these constructs and neither `$` nor `}` should be escaped inside choice constructs.

```
any         ::= tabstop | placeholder | choice | variable | text
tabstop     ::= '$' int | '${' int '}'
placeholder ::= '${' int ':' any '}'
choice      ::= '${' int '|' choicetext (',' choicetext)* '|}'
variable    ::= '$' var | '${' var }'
                | '${' var ':' any '}'
                | '${' var '/' regex '/' (format | formattext)* '/' options '}'
format      ::= '$' int | '${' int '}'
                /* Transforms the text to be uppercase, lowercase, or capitalized, respectively. */
                | '${' int ':' ('/upcase' | '/downcase' | '/capitalize') '}'
                /* Inserts the 'ifOnly' text if the match is non-empty. */
                | '${' int ':+' ifOnly '}'
                /* Inserts the 'if' text if the match is non-empty,
                   otherwise the 'else' text will be inserted. */
                | '${' int ':?' if ':' else '}'
                /* Inserts the 'else' text if the match is empty. */
                | '${' int ':-' else '}' | '${' int ':' else '}'
regex       ::= Regular Expression value (ctor-string)
options     ::= Regular Expression option (ctor-options)
var         ::= [_a-zA-Z] [_a-zA-Z0-9]*
int         ::= [0-9]+
text        ::= ([^$}\] | '\$' | '\}' | '\\')*
choicetext  ::= ([^,|\] | '\,' | '\|' | '\\')*
formattext  ::= ([^$/\] | '\$' | '\/' | '\\')*
ifOnly      ::= text
if          ::= ([^:\] | '\:' | '\\')*
else        ::= text
```

#### <a href="#completionItem_resolve" name="completionItem_resolve" class="anchor">Completion Item Resolve Request (:leftwards_arrow_with_hook:)</a>

The request is sent from the client to the server to resolve additional information for a given completion item.

_Request_:
* method: `completionItem/resolve`
* params: `CompletionItem`

_Response_:
* result: `CompletionItem`
* error: code and message set in case an exception happens during the completion resolve request.
