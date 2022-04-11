#### <a href="#initialize" name="initialize" class="anchor">Initialize Request (:leftwards_arrow_with_hook:)</a>

The initialize request is sent as the first request from the client to the server. If the server receives a request or notification before the `initialize` request it should act as follows:

* For a request the response should be an error with `code: -32002`. The message can be picked by the server.
* Notifications should be dropped, except for the exit notification. This will allow the exit of a server without an initialize request.

Until the server has responded to the `initialize` request with an `InitializeResult`, the client must not send any additional requests or notifications to the server. In addition the server is not allowed to send any requests or notifications to the client until it has responded with an `InitializeResult`, with the exception that during the `initialize` request the server is allowed to send the notifications `window/showMessage`, `window/logMessage` and `telemetry/event` as well as the `window/showMessageRequest` request to the client. In case the client sets up a progress token in the initialize params (e.g. property `workDoneToken`) the server is also allowed to use that token (and only that token) using the `$/progress` notification sent from the server to the client.

The `initialize` request may only be sent once.

_Request_:
* method: 'initialize'
* params: `InitializeParams` defined as follows:

<div class="anchorHolder"><a href="#initializeParams" name="initializeParams" class="linkableAnchor"></a></div>

```typescript
interface InitializeParams extends WorkDoneProgressParams {
	/**
	 * The process Id of the parent process that started the server. Is null if
	 * the process has not been started by another process. If the parent
	 * process is not alive then the server should exit (see exit notification)
	 * its process.
	 */
	processId: integer | null;

	/**
	 * Information about the client
	 *
	 * @since 3.15.0
	 */
	clientInfo?: {
		/**
		 * The name of the client as defined by the client.
		 */
		name: string;

		/**
		 * The client's version as defined by the client.
		 */
		version?: string;
	};

	/**
	 * The locale the client is currently showing the user interface
	 * in. This must not necessarily be the locale of the operating
	 * system.
	 *
	 * Uses IETF language tags as the value's syntax
	 * (See https://en.wikipedia.org/wiki/IETF_language_tag)
	 *
	 * @since 3.16.0
	 */
	locale?: string;

	/**
	 * The rootPath of the workspace. Is null
	 * if no folder is open.
	 *
	 * @deprecated in favour of `rootUri`.
	 */
	rootPath?: string | null;

	/**
	 * The rootUri of the workspace. Is null if no
	 * folder is open. If both `rootPath` and `rootUri` are set
	 * `rootUri` wins.
	 *
	 * @deprecated in favour of `workspaceFolders`
	 */
	rootUri: DocumentUri | null;

	/**
	 * User provided initialization options.
	 */
	initializationOptions?: LSPAny;

	/**
	 * The capabilities provided by the client (editor or tool)
	 */
	capabilities: ClientCapabilities;

	/**
	 * The initial trace setting. If omitted trace is disabled ('off').
	 */
	trace?: TraceValue;

	/**
	 * The workspace folders configured in the client when the server starts.
	 * This property is only available if the client supports workspace folders.
	 * It can be `null` if the client supports workspace folders but none are
	 * configured.
	 *
	 * @since 3.6.0
	 */
	workspaceFolders?: WorkspaceFolder[] | null;
}
```
Where `ClientCapabilities` and `TextDocumentClientCapabilities` are defined as follows:


##### TextDocumentClientCapabilities

`TextDocumentClientCapabilities` define capabilities the editor / tool provides on text documents.

<div class="anchorHolder"><a href="#textDocumentClientCapabilities" name="textDocumentClientCapabilities" class="linkableAnchor"></a></div>

```typescript
/**
 * Text document specific client capabilities.
 */
export interface TextDocumentClientCapabilities {

	synchronization?: TextDocumentSyncClientCapabilities;

	/**
	 * Capabilities specific to the `textDocument/completion` request.
	 */
	completion?: CompletionClientCapabilities;

	/**
	 * Capabilities specific to the `textDocument/hover` request.
	 */
	hover?: HoverClientCapabilities;

	/**
	 * Capabilities specific to the `textDocument/signatureHelp` request.
	 */
	signatureHelp?: SignatureHelpClientCapabilities;

	/**
	 * Capabilities specific to the `textDocument/declaration` request.
	 *
	 * @since 3.14.0
	 */
	declaration?: DeclarationClientCapabilities;

	/**
	 * Capabilities specific to the `textDocument/definition` request.
	 */
	definition?: DefinitionClientCapabilities;

	/**
	 * Capabilities specific to the `textDocument/typeDefinition` request.
	 *
	 * @since 3.6.0
	 */
	typeDefinition?: TypeDefinitionClientCapabilities;

	/**
	 * Capabilities specific to the `textDocument/implementation` request.
	 *
	 * @since 3.6.0
	 */
	implementation?: ImplementationClientCapabilities;

	/**
	 * Capabilities specific to the `textDocument/references` request.
	 */
	references?: ReferenceClientCapabilities;

	/**
	 * Capabilities specific to the `textDocument/documentHighlight` request.
	 */
	documentHighlight?: DocumentHighlightClientCapabilities;

	/**
	 * Capabilities specific to the `textDocument/documentSymbol` request.
	 */
	documentSymbol?: DocumentSymbolClientCapabilities;

	/**
	 * Capabilities specific to the `textDocument/codeAction` request.
	 */
	codeAction?: CodeActionClientCapabilities;

	/**
	 * Capabilities specific to the `textDocument/codeLens` request.
	 */
	codeLens?: CodeLensClientCapabilities;

	/**
	 * Capabilities specific to the `textDocument/documentLink` request.
	 */
	documentLink?: DocumentLinkClientCapabilities;

	/**
	 * Capabilities specific to the `textDocument/documentColor` and the
	 * `textDocument/colorPresentation` request.
	 *
	 * @since 3.6.0
	 */
	colorProvider?: DocumentColorClientCapabilities;

	/**
	 * Capabilities specific to the `textDocument/formatting` request.
	 */
	formatting?: DocumentFormattingClientCapabilities;

	/**
	 * Capabilities specific to the `textDocument/rangeFormatting` request.
	 */
	rangeFormatting?: DocumentRangeFormattingClientCapabilities;

	/** request.
	 * Capabilities specific to the `textDocument/onTypeFormatting` request.
	 */
	onTypeFormatting?: DocumentOnTypeFormattingClientCapabilities;

	/**
	 * Capabilities specific to the `textDocument/rename` request.
	 */
	rename?: RenameClientCapabilities;

	/**
	 * Capabilities specific to the `textDocument/publishDiagnostics`
	 * notification.
	 */
	publishDiagnostics?: PublishDiagnosticsClientCapabilities;

	/**
	 * Capabilities specific to the `textDocument/foldingRange` request.
	 *
	 * @since 3.10.0
	 */
	foldingRange?: FoldingRangeClientCapabilities;

	/**
	 * Capabilities specific to the `textDocument/selectionRange` request.
	 *
	 * @since 3.15.0
	 */
	selectionRange?: SelectionRangeClientCapabilities;

	/**
	 * Capabilities specific to the `textDocument/linkedEditingRange` request.
	 *
	 * @since 3.16.0
	 */
	linkedEditingRange?: LinkedEditingRangeClientCapabilities;

	/**
	 * Capabilities specific to the various call hierarchy requests.
	 *
	 * @since 3.16.0
	 */
	callHierarchy?: CallHierarchyClientCapabilities;

	/**
	 * Capabilities specific to the various semantic token requests.
	 *
	 * @since 3.16.0
	 */
	semanticTokens?: SemanticTokensClientCapabilities;

	/**
	 * Capabilities specific to the `textDocument/moniker` request.
	 *
	 * @since 3.16.0
	 */
	moniker?: MonikerClientCapabilities;

	/**
	 * Capabilities specific to the various type hierarchy requests.
	 *
	 * @since 3.17.0 - proposed state
	 */
	typeHierarchy?: TypeHierarchyClientCapabilities;

	/**
	 * Capabilities specific to the `textDocument/inlineValue` request.
	 *
	 * @since 3.17.0 - proposed state
	 */
	inlineValue?: InlineValueClientCapabilities;

	/**
	 * Capabilities specific to the `textDocument/inlayHint` request.
	 *
	 * @since 3.17.0 - proposed state
	 */
	inlayHint?: InlayHintClientCapabilities;
}
```

`ClientCapabilities` define capabilities for dynamic registration, workspace and text document features the client supports. The `experimental` can be used to pass experimental capabilities under development. For future compatibility a `ClientCapabilities` object literal can have more properties set than currently defined. Servers receiving a `ClientCapabilities` object literal with unknown properties should ignore these properties. A missing property should be interpreted as an absence of the capability. If a missing property normally defines sub properties, all missing sub properties should be interpreted as an absence of the corresponding capability.

Client capabilities got introduced with version 3.0 of the protocol. They therefore only describe capabilities that got introduced in 3.x or later. Capabilities that existed in the 2.x version of the protocol are still mandatory for clients. Clients cannot opt out of providing them. So even if a client omits the `ClientCapabilities.textDocument.synchronization` it is still required that the client provides text document synchronization (e.g. open, changed and close notifications).

<div class="anchorHolder"><a href="#clientCapabilities" name="clientCapabilities" class="linkableAnchor"></a></div>

```typescript
interface ClientCapabilities {
	/**
	 * Workspace specific client capabilities.
	 */
	workspace?: {
		/**
		 * The client supports applying batch edits
		 * to the workspace by supporting the request
		 * 'workspace/applyEdit'
		 */
		applyEdit?: boolean;

		/**
		 * Capabilities specific to `WorkspaceEdit`s
		 */
		workspaceEdit?: WorkspaceEditClientCapabilities;

		/**
		 * Capabilities specific to the `workspace/didChangeConfiguration`
		 * notification.
		 */
		didChangeConfiguration?: DidChangeConfigurationClientCapabilities;

		/**
		 * Capabilities specific to the `workspace/didChangeWatchedFiles`
		 * notification.
		 */
		didChangeWatchedFiles?: DidChangeWatchedFilesClientCapabilities;

		/**
		 * Capabilities specific to the `workspace/symbol` request.
		 */
		symbol?: WorkspaceSymbolClientCapabilities;

		/**
		 * Capabilities specific to the `workspace/executeCommand` request.
		 */
		executeCommand?: ExecuteCommandClientCapabilities;

		/**
		 * The client has support for workspace folders.
		 *
		 * @since 3.6.0
		 */
		workspaceFolders?: boolean;

		/**
		 * The client supports `workspace/configuration` requests.
		 *
		 * @since 3.6.0
		 */
		configuration?: boolean;

		/**
		 * Capabilities specific to the semantic token requests scoped to the
		 * workspace.
		 *
		 * @since 3.16.0
		 */
		 semanticTokens?: SemanticTokensWorkspaceClientCapabilities;

		/**
		 * Capabilities specific to the code lens requests scoped to the
		 * workspace.
		 *
		 * @since 3.16.0
		 */
		codeLens?: CodeLensWorkspaceClientCapabilities;

		/**
		 * The client has support for file requests/notifications.
		 *
		 * @since 3.16.0
		 */
		fileOperations?: {
			/**
			 * Whether the client supports dynamic registration for file
			 * requests/notifications.
			 */
			dynamicRegistration?: boolean;

			/**
			 * The client has support for sending didCreateFiles notifications.
			 */
			didCreate?: boolean;

			/**
			 * The client has support for sending willCreateFiles requests.
			 */
			willCreate?: boolean;

			/**
			 * The client has support for sending didRenameFiles notifications.
			 */
			didRename?: boolean;

			/**
			 * The client has support for sending willRenameFiles requests.
			 */
			willRename?: boolean;

			/**
			 * The client has support for sending didDeleteFiles notifications.
			 */
			didDelete?: boolean;

			/**
			 * The client has support for sending willDeleteFiles requests.
			 */
			willDelete?: boolean;
		};

		/**
		 * Client workspace capabilities specific to inline values.
		 *
		 * @since 3.17.0 - proposed state
		 */
		inlineValue?: InlineValueWorkspaceClientCapabilities;

		/**
		 * Client workspace capabilities specific to inlay hints.
		 *
		 * @since 3.17.0 - proposed state
		 */
		inlayHint?: InlayHintWorkspaceClientCapabilities;
	};

	/**
	 * Text document specific client capabilities.
	 */
	textDocument?: TextDocumentClientCapabilities;

	/**
	 * Window specific client capabilities.
	 */
	window?: {
		/**
		 * It indicates whether the client supports server initiated
		 * progress using the `window/workDoneProgress/create` request.
		 *
		 * The capability also controls Whether client supports handling
		 * of progress notifications. If set servers are allowed to report a
		 * `workDoneProgress` property in the request specific server
		 * capabilities.
		 *
		 * @since 3.15.0
		 */
		workDoneProgress?: boolean;

		/**
		 * Capabilities specific to the showMessage request
		 *
		 * @since 3.16.0
		 */
		showMessage?: ShowMessageRequestClientCapabilities;

		/**
		 * Client capabilities for the show document request.
		 *
		 * @since 3.16.0
		 */
		showDocument?: ShowDocumentClientCapabilities;
	};

	/**
	 * General client capabilities.
	 *
	 * @since 3.16.0
	 */
	general?: {
		/**
		 * Client capability that signals how the client
		 * handles stale requests (e.g. a request
		 * for which the client will not process the response
		 * anymore since the information is outdated).
		 *
		 * @since 3.17.0
		 */
		staleRequestSupport?: {
			/**
			 * The client will actively cancel the request.
			 */
			cancel: boolean;

			/**
			 * The list of requests for which the client
			 * will retry the request if it receives a
			 * response with error code `ContentModified``
			 */
			 retryOnContentModified: string[];
		}

		/**
		 * Client capabilities specific to regular expressions.
		 *
		 * @since 3.16.0
		 */
		regularExpressions?: RegularExpressionsClientCapabilities;

		/**
		 * Client capabilities specific to the client's markdown parser.
		 *
		 * @since 3.16.0
		 */
		markdown?: MarkdownClientCapabilities;

		/**
		 * The position encodings supported by the client. Client and server
		 * have to agree on the same position encoding to ensure that offsets
		 * (e.g. character position in a line) are interpreted the same on both
		 * side.
		 *
		 * To keep the protocol backwards compatible the following applies: if
		 * the value 'utf-16' is missing from the array of position encodings
		 * servers can assume that the client supports UTF-16. UTF-16 is
		 * therefore a mandatory encoding.
		 *
		 * If omitted it defaults to ['utf-16'].
		 *
		 * For the following standard Unicode encodings these values should be
		 * used:
		 *
		 * UTF-8: 'utf-8'
		 * UTF-16: 'utf-16'
		 * UTF-32: 'utf-32'
		 *
		 * Implementation considerations: since the conversion from one encoding
		 * into another requires the content of the file / line the conversion
		 * is best done where the file is read which is usually on the server
		 * side.
		 *
		 * @since 3.17.0
		 * @proposed
		 */
		positionEncodings?: ('utf-16' | 'utf-8' | 'utf-32' | string)[];
	};

	/**
	 * Experimental client capabilities.
	 */
	experimental?: LSPAny;
}
```

_Response_:
* result: `InitializeResult` defined as follows:

<div class="anchorHolder"><a href="#initializeResult" name="initializeResult" class="linkableAnchor"></a></div>

```typescript
interface InitializeResult {
	/**
	 * The capabilities the language server provides.
	 */
	capabilities: ServerCapabilities;

	/**
	 * Information about the server.
	 *
	 * @since 3.15.0
	 */
	serverInfo?: {
		/**
		 * The name of the server as defined by the server.
		 */
		name: string;

		/**
		 * The server's version as defined by the server.
		 */
		version?: string;
	};
}
```
* error.code:

<div class="anchorHolder"><a href="#initializeErrorCodes" name="initializeErrorCodes" class="linkableAnchor"></a></div>

```typescript
/**
 * Known error codes for an `InitializeErrorCodes`;
 */
export namespace InitializeErrorCodes {

	/**
	 * If the protocol version provided by the client can't be handled by
	 * the server.
	 *
	 * @deprecated This initialize error got replaced by client capabilities.
	 * There is no version handshake in version 3.0x
	 */
	export const unknownProtocolVersion: 1 = 1;
}

export type InitializeErrorCodes = 1;
```

* error.data:

<div class="anchorHolder"><a href="#initializeError" name="initializeError" class="linkableAnchor"></a></div>

```typescript
interface InitializeError {
	/**
	 * Indicates whether the client execute the following retry logic:
	 * (1) show the message provided by the ResponseError to the user
	 * (2) user selects retry or cancel
	 * (3) if user selected retry the initialize method is sent again.
	 */
	retry: boolean;
}
```

The server can signal the following capabilities:

<div class="anchorHolder"><a href="#serverCapabilities" name="serverCapabilities" class="linkableAnchor"></a></div>

```typescript
interface ServerCapabilities {

	/**
	 * The position encoding the server picked from the encodings offered
	 * by the client via the client capability `general.positionEncodings`.
	 *
	 * If the client didn't provide any position encodings the only valid
	 * value that a server can return is 'utf-16'.
	 *
	 * If omitted it defaults to 'utf-16'.
	 *
	 * @since 3.17.0
	 * @proposed
	 */
	positionEncoding?: 'utf-16' | 'utf-8' | 'utf-32' | string;

	/**
	 * Defines how text documents are synced. Is either a detailed structure
	 * defining each notification or for backwards compatibility the
	 * TextDocumentSyncKind number. If omitted it defaults to
	 * `TextDocumentSyncKind.None`.
	 */
	textDocumentSync?: TextDocumentSyncOptions | TextDocumentSyncKind;

	/**
	 * The server provides completion support.
	 */
	completionProvider?: CompletionOptions;

	/**
	 * The server provides hover support.
	 */
	hoverProvider?: boolean | HoverOptions;

	/**
	 * The server provides signature help support.
	 */
	signatureHelpProvider?: SignatureHelpOptions;

	/**
	 * The server provides go to declaration support.
	 *
	 * @since 3.14.0
	 */
	declarationProvider?: boolean | DeclarationOptions
		| DeclarationRegistrationOptions;

	/**
	 * The server provides goto definition support.
	 */
	definitionProvider?: boolean | DefinitionOptions;

	/**
	 * The server provides goto type definition support.
	 *
	 * @since 3.6.0
	 */
	typeDefinitionProvider?: boolean | TypeDefinitionOptions
		| TypeDefinitionRegistrationOptions;

	/**
	 * The server provides goto implementation support.
	 *
	 * @since 3.6.0
	 */
	implementationProvider?: boolean | ImplementationOptions
		| ImplementationRegistrationOptions;

	/**
	 * The server provides find references support.
	 */
	referencesProvider?: boolean | ReferenceOptions;

	/**
	 * The server provides document highlight support.
	 */
	documentHighlightProvider?: boolean | DocumentHighlightOptions;

	/**
	 * The server provides document symbol support.
	 */
	documentSymbolProvider?: boolean | DocumentSymbolOptions;

	/**
	 * The server provides code actions. The `CodeActionOptions` return type is
	 * only valid if the client signals code action literal support via the
	 * property `textDocument.codeAction.codeActionLiteralSupport`.
	 */
	codeActionProvider?: boolean | CodeActionOptions;

	/**
	 * The server provides code lens.
	 */
	codeLensProvider?: CodeLensOptions;

	/**
	 * The server provides document link support.
	 */
	documentLinkProvider?: DocumentLinkOptions;

	/**
	 * The server provides color provider support.
	 *
	 * @since 3.6.0
	 */
	colorProvider?: boolean | DocumentColorOptions
		| DocumentColorRegistrationOptions;

	/**
	 * The server provides document formatting.
	 */
	documentFormattingProvider?: boolean | DocumentFormattingOptions;

	/**
	 * The server provides document range formatting.
	 */
	documentRangeFormattingProvider?: boolean | DocumentRangeFormattingOptions;

	/**
	 * The server provides document formatting on typing.
	 */
	documentOnTypeFormattingProvider?: DocumentOnTypeFormattingOptions;

	/**
	 * The server provides rename support. RenameOptions may only be
	 * specified if the client states that it supports
	 * `prepareSupport` in its initial `initialize` request.
	 */
	renameProvider?: boolean | RenameOptions;

	/**
	 * The server provides folding provider support.
	 *
	 * @since 3.10.0
	 */
	foldingRangeProvider?: boolean | FoldingRangeOptions
		| FoldingRangeRegistrationOptions;

	/**
	 * The server provides execute command support.
	 */
	executeCommandProvider?: ExecuteCommandOptions;

	/**
	 * The server provides selection range support.
	 *
	 * @since 3.15.0
	 */
	selectionRangeProvider?: boolean | SelectionRangeOptions
		| SelectionRangeRegistrationOptions;

	/**
	 * The server provides linked editing range support.
	 *
	 * @since 3.16.0
	 */
	linkedEditingRangeProvider?: boolean | LinkedEditingRangeOptions
		| LinkedEditingRangeRegistrationOptions;

	/**
	 * The server provides call hierarchy support.
	 *
	 * @since 3.16.0
	 */
	callHierarchyProvider?: boolean | CallHierarchyOptions
		| CallHierarchyRegistrationOptions;

	/**
	 * The server provides semantic tokens support.
	 *
	 * @since 3.16.0
	 */
	semanticTokensProvider?: SemanticTokensOptions
		| SemanticTokensRegistrationOptions;

	/**
	 * Whether server provides moniker support.
	 *
	 * @since 3.16.0
	 */
	monikerProvider?: boolean | MonikerOptions | MonikerRegistrationOptions;

	/**
	 * The server provides type hierarchy support.
	 *
	 * @since 3.17.0 - proposed state
	 */
	typeHierarchyProvider?: boolean | TypeHierarchyOptions | TypeHierarchyRegistrationOptions;

	/**
	 * The server provides inline values.
	 *
	 * @since 3.17.0 - proposed state
	 */
	inlineValueProvider?: boolean | InlineValueOptions | InlineValueRegistrationOptions;

	/**
	 * The server provides inlay hints.
	 *
	 * @since 3.17.0 - proposed state
	 */
	inlayHintProvider?: boolean | InlayHintOptions | InlayHintRegistrationOptions;

	/**
	 * The server provides workspace symbol support.
	 */
	workspaceSymbolProvider?: boolean | WorkspaceSymbolOptions;

	/**
	 * Workspace specific server capabilities
	 */
	workspace?: {
		/**
		 * The server supports workspace folder.
		 *
		 * @since 3.6.0
		 */
		workspaceFolders?: WorkspaceFoldersServerCapabilities;

		/**
		 * The server is interested in file notifications/requests.
		 *
		 * @since 3.16.0
		 */
		fileOperations?: {
			/**
			 * The server is interested in receiving didCreateFiles
			 * notifications.
			 */
			didCreate?: FileOperationRegistrationOptions;

			/**
			 * The server is interested in receiving willCreateFiles requests.
			 */
			willCreate?: FileOperationRegistrationOptions;

			/**
			 * The server is interested in receiving didRenameFiles
			 * notifications.
			 */
			didRename?: FileOperationRegistrationOptions;

			/**
			 * The server is interested in receiving willRenameFiles requests.
			 */
			willRename?: FileOperationRegistrationOptions;

			/**
			 * The server is interested in receiving didDeleteFiles file
			 * notifications.
			 */
			didDelete?: FileOperationRegistrationOptions;

			/**
			 * The server is interested in receiving willDeleteFiles file
			 * requests.
			 */
			willDelete?: FileOperationRegistrationOptions;
		};
	};

	/**
	 * Experimental server capabilities.
	 */
	experimental?: LSPAny;
}
```