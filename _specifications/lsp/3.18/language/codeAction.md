#### <a href="#textDocument_codeAction" name="textDocument_codeAction" class="anchor">Code Action Request (:leftwards_arrow_with_hook:)</a>

The code action request is sent from the client to the server to compute relevant commands for a given text document and range. These commands are typically code fixes to either fix problems or to beautify/refactor code. The result of a `textDocument/codeAction` request is an array of `Command` literals which are typically presented in the user interface. Servers should only return relevant commands and avoid returning large lists of code actions, which can overwhelm the user and make it more difficult for them to find the code action they are after.

To ensure that a server is useful in many clients, the commands specified in code actions should be handled by the server and not by the client (see `workspace/executeCommand` and `ServerCapabilities.executeCommandProvider`). If the client supports providing edits with a code action then that mode should be used.

*Since version 3.16.0:* a client can offer a server to delay the computation of code action properties during a 'textDocument/codeAction' request:

This is useful for cases where it is expensive to compute the value of a property (for example, the `edit` property). Clients signal this through the `codeAction.resolveSupport` capability which lists all properties a client can resolve lazily. The server capability `codeActionProvider.resolveProvider` signals that a server will offer a `codeAction/resolve` route. To help servers to uniquely identify a code action in the resolve request, a code action literal can optionally carry a data property. This is also guarded by an additional client capability `codeAction.dataSupport`. In general, a client should offer data support if it offers resolve support. It should also be noted that servers shouldn't alter existing attributes of a code action in a codeAction/resolve request.

> *Since version 3.8.0:* support for CodeAction literals to enable the following scenarios:

- the ability to directly return a workspace edit from the code action request. This avoids having another server roundtrip to execute an actual code action. However, server providers should be aware that if the code action is expensive to compute or the edits are huge, it might still be beneficial if the result is simply a command and the actual edit is only computed when needed.
- the ability to group code actions using a kind. Clients are allowed to ignore that information. However, it allows them to better group code actions, for example, into corresponding menus (e.g. all refactor code actions into a refactor menu).

In version 1.0 of the protocol, there weren't any source or refactoring code actions. Code actions were solely used to (quick) fix code, not to write / rewrite code. So if a client asks for code actions without any kind, the standard quick fix code actions should be returned.

Clients need to announce their support for code action literals (e.g. literals of type `CodeAction`) and code action kinds via the corresponding client capability `codeAction.codeActionLiteralSupport`.

_Client Capability_:
* property name (optional): `textDocument.codeAction`
* property type: `CodeActionClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#codeActionClientCapabilities" name="codeActionClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface CodeActionClientCapabilities {
	/**
	 * Whether code action supports dynamic registration.
	 */
	dynamicRegistration?: boolean;

	/**
	 * The client supports code action literals as a valid
	 * response of the `textDocument/codeAction` request.
	 *
	 * @since 3.8.0
	 */
	codeActionLiteralSupport?: {
		/**
		 * The code action kind is supported with the following value
		 * set.
		 */
		codeActionKind: {

			/**
			 * The code action kind values that the client supports. When this
			 * property exists, the client also guarantees that it will
			 * handle values outside its set gracefully and falls back
			 * to a default value when unknown.
			 */
			valueSet: CodeActionKind[];
		};
	};

	/**
	 * Whether code action supports the `isPreferred` property.
	 *
	 * @since 3.15.0
	 */
	isPreferredSupport?: boolean;

	/**
	 * Whether code action supports the `disabled` property.
	 *
	 * @since 3.16.0
	 */
	disabledSupport?: boolean;

	/**
	 * Whether code action supports the `data` property which is
	 * preserved between a `textDocument/codeAction` and a
	 * `codeAction/resolve` request.
	 *
	 * @since 3.16.0
	 */
	dataSupport?: boolean;

	/**
	 * Whether the client supports resolving additional code action
	 * properties via a separate `codeAction/resolve` request.
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
	 * Whether the client honors the change annotations in
	 * text edits and resource operations returned via the
	 * `CodeAction#edit` property by, for example, presenting
	 * the workspace edit in the user interface and asking
	 * for confirmation.
	 *
	 * @since 3.16.0
	 */
	honorsChangeAnnotations?: boolean;

	/**
	 * Whether the client supports documentation for a class of code actions.
	 *
	 * @since 3.18.0
	 * @proposed
	 */
	 documentationSupport?: boolean;

	/**
	 * Client supports the tag property on a code action. Clients
	 * supporting tags have to handle unknown tags gracefully.
	 *
	 * @since 3.18.0 - proposed
	 */
	tagSupport?: {
		/**
		 * The tags supported by the client.
		 */
		valueSet: CodeActionTag[];
	}; 
}
```

_Server Capability_:
* property name (optional): `codeActionProvider`
* property type: `boolean | CodeActionOptions` where `CodeActionOptions` is defined as follows:

<div class="anchorHolder"><a href="#codeActionOptions" name="codeActionOptions" class="linkableAnchor"></a></div>

```typescript
/**
 * Documentation for a class of code actions.
 *
 * @since 3.18.0
 * @proposed
 */
export interface CodeActionKindDocumentation {
	/**
	 * The kind of the code action being documented.
	 *
	 * If the kind is generic, such as `CodeActionKind.Refactor`, the
	 * documentation will be shown whenever any refactorings are returned. If
	 * the kind is more specific, such as `CodeActionKind.RefactorExtract`, the
	 * documentation will only be shown when extract refactoring code actions
	 * are returned.
	 */
	kind: CodeActionKind;

	/**
	 * Command that is used to display the documentation to the user.
	 *
	 * The title of this documentation code action is taken
	 * from {@linkcode Command.title}
	 */
	command: Command;
}

export interface CodeActionOptions extends WorkDoneProgressOptions {
	/**
	 * CodeActionKinds that this server may return.
	 *
	 * The list of kinds may be generic, such as `CodeActionKind.Refactor`,
	 * or the server may list out every specific kind they provide.
	 */
	codeActionKinds?: CodeActionKind[];

	/**
	 * Static documentation for a class of code actions.
	 *
	 * Documentation from the provider should be shown in the code actions
	 * menu if either:
	 *
	 * - Code actions of `kind` are requested by the editor. In this case,
	 *   the editor will show the documentation that most closely matches the
	 *   requested code action kind. For example, if a provider has
	 *   documentation for both `Refactor` and `RefactorExtract`, when the
	 *   user requests code actions for `RefactorExtract`, the editor will use
	 *   the documentation for `RefactorExtract` instead of the documentation
	 *   for `Refactor`.
	 *
	 * - Any code actions of `kind` are returned by the provider.
	 *
	 * At most one documentation entry should be shown per provider.
	 *
	 * @since 3.18.0
	 * @proposed
	 */
	documentation?: CodeActionKindDocumentation[];

	/**
	 * The server provides support to resolve additional
	 * information for a code action.
	 *
	 * @since 3.16.0
	 */
	resolveProvider?: boolean;
}
```

_Registration Options_: `CodeActionRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#codeActionRegistrationOptions" name="codeActionRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface CodeActionRegistrationOptions extends
	TextDocumentRegistrationOptions, CodeActionOptions {
}
```

_Request_:
* method: `textDocument/codeAction`
* params: `CodeActionParams` defined as follows:

<div class="anchorHolder"><a href="#codeActionParams" name="codeActionParams" class="linkableAnchor"></a></div>

```typescript
/**
 * Params for the CodeActionRequest.
 */
export interface CodeActionParams extends WorkDoneProgressParams,
	PartialResultParams {
	/**
	 * The document in which the command was invoked.
	 */
	textDocument: TextDocumentIdentifier;

	/**
	 * The range for which the command was invoked.
	 */
	range: Range;

	/**
	 * Context carrying additional information.
	 */
	context: CodeActionContext;
}
```

<div class="anchorHolder"><a href="#codeActionKind" name="codeActionKind" class="linkableAnchor"></a></div>

```typescript
/**
 * The kind of a code action.
 *
 * Kinds are a hierarchical list of identifiers separated by `.`,
 * e.g. `"refactor.extract.function"`.
 *
 * The set of kinds is open and the client needs to announce
 * the kinds it supports to the server during initialization.
 */
export type CodeActionKind = string;

/**
 * A set of predefined code action kinds.
 */
export namespace CodeActionKind {

	/**
	 * Empty kind.
	 */
	export const Empty: CodeActionKind = '';

	/**
	 * Base kind for quickfix actions: 'quickfix'.
	 */
	export const QuickFix: CodeActionKind = 'quickfix';

	/**
	 * Base kind for refactoring actions: 'refactor'.
	 */
	export const Refactor: CodeActionKind = 'refactor';

	/**
	 * Base kind for refactoring extraction actions: 'refactor.extract'.
	 *
	 * Example extract actions:
	 *
	 * - Extract method
	 * - Extract function
	 * - Extract variable
	 * - Extract interface from class
	 * - ...
	 */
	export const RefactorExtract: CodeActionKind = 'refactor.extract';

	/**
	 * Base kind for refactoring inline actions: 'refactor.inline'.
	 *
	 * Example inline actions:
	 *
	 * - Inline function
	 * - Inline variable
	 * - Inline constant
	 * - ...
	 */
	export const RefactorInline: CodeActionKind = 'refactor.inline';

	/**
	 * Base kind for refactoring move actions: 'refactor.move'
	 *
	 * Example move actions:
	 *
	 * - Move a function to a new file
	 * - Move a property between classes
	 * - Move method to base class
	 * - ...
	 *
	 * @since 3.18.0 - proposed
	 */
	export const RefactorMove: CodeActionKind = 'refactor.move';

	/**
	 * Base kind for refactoring rewrite actions: 'refactor.rewrite'.
	 *
	 * Example rewrite actions:
	 *
	 * - Convert JavaScript function to class
	 * - Add or remove parameter
	 * - Encapsulate field
	 * - Make method static
	 * - ...
	 */
	export const RefactorRewrite: CodeActionKind = 'refactor.rewrite';

	/**
	 * Base kind for source actions: `source`.
	 *
	 * Source code actions apply to the entire file.
	 */
	export const Source: CodeActionKind = 'source';

	/**
	 * Base kind for an organize imports source action:
	 * `source.organizeImports`.
	 */
	export const SourceOrganizeImports: CodeActionKind =
		'source.organizeImports';

	/**
	 * Base kind for a 'fix all' source action: `source.fixAll`.
	 *
	 * 'Fix all' actions automatically fix errors that have a clear fix that
	 * do not require user input. They should not suppress errors or perform
	 * unsafe fixes such as generating new types or classes.
	 *
	 * @since 3.17.0
	 */
	export const SourceFixAll: CodeActionKind = 'source.fixAll';

	/**
	 * Base kind for all code actions applying to the entire notebook's scope. CodeActionKinds using
	 * this should always begin with `notebook.`
	 *
	 * @since 3.18.0
	 */
	export const Notebook: CodeActionKind = 'notebook';
}
```

<div class="anchorHolder"><a href="#codeActionContext" name="codeActionContext" class="linkableAnchor"></a></div>

```typescript
/**
 * Contains additional diagnostic information about the context in which
 * a code action is run.
 */
export interface CodeActionContext {
	/**
	 * An array of diagnostics known on the client side overlapping the range
	 * provided to the `textDocument/codeAction` request. They are provided so
	 * that the server knows which errors are currently presented to the user
	 * for the given range. There is no guarantee that these accurately reflect
	 * the error state of the resource. The primary parameter
	 * to compute code actions is the provided range.
	 * 
	 * Note that the client should check the `textDocument.diagnostic.markupMessageSupport`
	 * server capability before sending diagnostics with markup messages to a server.
	 * Diagnostics with markup messages should be excluded for servers that don't support
	 * them.
	 */
	diagnostics: Diagnostic[];

	/**
	 * Requested kind of actions to return.
	 *
	 * Actions not of this kind are filtered out by the client before being
	 * shown, so servers can omit computing them.
	 */
	only?: CodeActionKind[];

	/**
	 * The reason why code actions were requested.
	 *
	 * @since 3.17.0
	 */
	triggerKind?: CodeActionTriggerKind;
}
```

<div class="anchorHolder"><a href="#codeActionTriggerKind" name="codeActionTriggerKind" class="linkableAnchor"></a></div>

```typescript
/**
 * The reason why code actions were requested.
 *
 * @since 3.17.0
 */
export namespace CodeActionTriggerKind {
	/**
	 * Code actions were explicitly requested by the user or by an extension.
	 */
	export const Invoked: 1 = 1;

	/**
	 * Code actions were requested automatically.
	 *
	 * This typically happens when the current selection in a file changes,
	 * but can also be triggered when file content changes.
	 */
	export const Automatic: 2 = 2;
}

export type CodeActionTriggerKind = 1 | 2;
```

<div class="anchorHolder"><a href="#codeActionTag" name="codeActionTag" class="linkableAnchor"></a></div>

```typescript
/**
 * Code action tags are extra annotations that tweak the behavior of a code action.
 *
 * @since 3.18.0 - proposed
 */
export namespace CodeActionTag {
	/**
	 * Marks the code action as LLM-generated.
	 */
	export const LLMGenerated = 1;
}
export type CodeActionTag = 1;
```

_Response_:
* result: `(Command | CodeAction)[]` \| `null` where `CodeAction` is defined as follows:

<div class="anchorHolder"><a href="#codeAction" name="codeAction" class="linkableAnchor"></a></div>

```typescript
/**
 * A code action represents a change that can be performed in code, e.g. to fix
 * a problem or to refactor code.
 *
 * A CodeAction must set either `edit` and/or a `command`. If both are supplied,
 * the `edit` is applied first, then the `command` is executed.
 */
export interface CodeAction {

	/**
	 * A short, human-readable title for this code action.
	 */
	title: string;

	/**
	 * The kind of the code action.
	 *
	 * Used to filter code actions.
	 */
	kind?: CodeActionKind;

	/**
	 * The diagnostics that this code action resolves.
	 */
	diagnostics?: Diagnostic[];

	/**
	 * Marks this as a preferred action. Preferred actions are used by the
	 * `auto fix` command and can be targeted by keybindings.
	 *
	 * A quick fix should be marked preferred if it properly addresses the
	 * underlying error. A refactoring should be marked preferred if it is the
	 * most reasonable choice of actions to take.
	 *
	 * @since 3.15.0
	 */
	isPreferred?: boolean;

	/**
	 * Marks that the code action cannot currently be applied.
	 *
	 * Clients should follow the following guidelines regarding disabled code
	 * actions:
	 *
	 * - Disabled code actions are not shown in automatic lightbulbs code
	 *   action menus.
	 *
	 * - Disabled actions are shown as faded out in the code action menu when
	 *   the user request a more specific type of code action, such as
	 *   refactorings.
	 *
	 * - If the user has a keybinding that auto applies a code action and only
	 *   a disabled code actions are returned, the client should show the user
	 *   an error message with `reason` in the editor.
	 *
	 * @since 3.16.0
	 */
	disabled?: {

		/**
		 * Human readable description of why the code action is currently
		 * disabled.
		 *
		 * This is displayed in the code actions UI.
		 */
		reason: string;
	};

	/**
	 * The workspace edit this code action performs.
	 */
	edit?: WorkspaceEdit;

	/**
	 * A command this code action executes. If a code action
	 * provides an edit and a command, first the edit is
	 * executed and then the command.
	 */
	command?: Command;

	/**
	 * A data entry field that is preserved on a code action between
	 * a `textDocument/codeAction` and a `codeAction/resolve` request.
	 *
	 * @since 3.16.0
	 */
	data?: LSPAny;

	/**
 	 * Tags for this code action.
	 *
	 * @since 3.18.0 - proposed
	 */
	tags?: CodeActionTag[];
}
```
* partial result: `(Command | CodeAction)[]`
* error: code and message set in case an exception happens during the code action request.

#### <a href="#codeAction_resolve" name="codeAction_resolve" class="anchor">Code Action Resolve Request (:leftwards_arrow_with_hook:)</a>

> *Since version 3.16.0*

The request is sent from the client to the server to resolve additional information for a given code action. This is usually used to compute
the `edit` property of a code action to avoid its unnecessary computation during the `textDocument/codeAction` request.

Consider the clients announcing the `edit` property as a property that can be resolved lazily using the client capability.

```typescript
textDocument.codeAction.resolveSupport = { properties: ['edit'] };
```

then a code action

```typescript
{
    "title": "Do Foo"
}
```

needs to be resolved using the `codeAction/resolve` request before it can be applied.

_Client Capability_:
* property name (optional): `textDocument.codeAction.resolveSupport`
* property type: `{ properties: string[]; }`

_Request_:
* method: `codeAction/resolve`
* params: `CodeAction`

_Response_:
* result: `CodeAction`
* error: code and message set in case an exception happens during the code action resolve request.
