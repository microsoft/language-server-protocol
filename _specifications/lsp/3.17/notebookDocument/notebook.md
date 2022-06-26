### <a href="#notebookDocument_synchronization" name="notebookDocument_synchronization" class="anchor">Notebook Document Synchronization</a>

Notebooks are becoming more and more popular. Adding support for them to the language server protocol allows notebook editors to reused language smarts provided by the server inside a notebook or a notebook cell, respectively. To reuse protocol parts and therefore server implementations notebooks are modeled in the following way in LSP:

- *notebook document*: a collection of notebook cells typically stored in a file on disk. A notebook document has a type and can be uniquely identified using a resource URI.
- *notebook cell*: holds the actual text content. Cells have a kind (either code or markdown). The actual text content of the cell is stored in a text document which can be synced to the server like all other text documents. Cell text documents have an URI however servers should not rely on any format for this URI since it is up to the client on how it will create these URIs. The URIs must be unique across ALL notebook cells and can therefore be used to uniquely identify a notebook cell or the cell's text document.

The two concepts are defined as follows:

<div class="anchorHolder"><a href="#notebookDocument" name="notebookDocument" class="linkableAnchor"></a></div>

```typescript
/**
 * A notebook document.
 *
 * @since 3.17.0
 */
export interface NotebookDocument {

	/**
	 * The notebook document's URI.
	 */
	uri: URI;

	/**
	 * The type of the notebook.
	 */
	notebookType: string;

	/**
	 * The version number of this document (it will increase after each
	 * change, including undo/redo).
	 */
	version: integer;

	/**
	 * Additional metadata stored with the notebook
	 * document.
	 */
	metadata?: LSPObject;

	/**
	 * The cells of a notebook.
	 */
	cells: NotebookCell[];
}
```

<div class="anchorHolder"><a href="#notebookCell" name="notebookCell" class="linkableAnchor"></a></div>


```typescript
/**
 * A notebook cell.
 *
 * A cell's document URI must be unique across ALL notebook
 * cells and can therefore be used to uniquely identify a
 * notebook cell or the cell's text document.
 *
 * @since 3.17.0
 */
export interface NotebookCell {

	/**
	 * The cell's kind
	 */
	kind: NotebookCellKind;

	/**
	 * The URI of the cell's text document
	 * content.
	 */
	document: DocumentUri;

	/**
	 * Additional metadata stored with the cell.
	 */
	metadata?: LSPObject;

	/**
	 * Additional execution summary information
	 * if supported by the client.
	 */
	executionSummary?: ExecutionSummary;
}
```

<div class="anchorHolder"><a href="#notebookCellKind" name="notebookCellKind" class="linkableAnchor"></a></div>

```typescript
/**
 * A notebook cell kind.
 *
 * @since 3.17.0
 */
export namespace NotebookCellKind {

	/**
	 * A markup-cell is formatted source that is used for display.
	 */
	export const Markup: 1 = 1;

	/**
	 * A code-cell is source code.
	 */
	export const Code: 2 = 2;
}
```

<div class="anchorHolder"><a href="#executionSummary" name="executionSummary" class="linkableAnchor"></a></div>

```typescript
export interface ExecutionSummary {
	/**
	 * A strict monotonically increasing value
	 * indicating the execution order of a cell
	 * inside a notebook.
	 */
	executionOrder: uinteger;

	/**
	 * Whether the execution was successful or
	 * not if known by the client.
	 */
	success?: boolean;
}
```

Next we describe how notebooks, notebook cells and the content of a notebook cell should be synchronized to a language server.

Syncing the text content of a cell is relatively easy since clients should model them as text documents. However since the URI of a notebook cell's text document should be opaque, servers can not know its scheme nor its path. However what is know is the notebook document itself. We therefore introduce a special filter for notebook cell documents:

<div class="anchorHolder"><a href="#notebookCellTextDocumentFilter" name="notebookCellTextDocumentFilter" class="linkableAnchor"></a></div>

```typescript
/**
 * A notebook cell text document filter denotes a cell text
 * document by different properties.
 *
 * @since 3.17.0
 */
export interface NotebookCellTextDocumentFilter {
	/**
	 * A filter that matches against the notebook
	 * containing the notebook cell. If a string
	 * value is provided it matches against the
	 * notebook type. '*' matches every notebook.
	 */
	notebook: string | NotebookDocumentFilter;

	/**
	 * A language id like `python`.
	 *
	 * Will be matched against the language id of the
	 * notebook cell document. '*' matches every language.
	 */
	language?: string;
}
```

<div class="anchorHolder"><a href="#notebookDocumentFilter" name="notebookDocumentFilter" class="linkableAnchor"></a></div>

```typescript
/**
 * A notebook document filter denotes a notebook document by
 * different properties.
 *
 * @since 3.17.0
 */
export type NotebookDocumentFilter = {
	/** The type of the enclosing notebook. */
	notebookType: string;

	/** A Uri [scheme](#Uri.scheme), like `file` or `untitled`. */
	scheme?: string;

	/** A glob pattern. */
	pattern?: string;
} | {
	/** The type of the enclosing notebook. */
	notebookType?: string;

	/** A Uri [scheme](#Uri.scheme), like `file` or `untitled`.*/
	scheme: string;

	/** A glob pattern. */
	pattern?: string;
} | {
	/** The type of the enclosing notebook. */
	notebookType?: string;

	/** A Uri [scheme](#Uri.scheme), like `file` or `untitled`. */
	scheme?: string;

	/** A glob pattern. */
	pattern: string;
};
```

Given these structures a Python cell document in a Jupyter notebook stored on disk in a folder having `books1` in its path can be identified as follows;

```typescript
{
	notebook: {
		scheme: 'file',
		pattern '**/books1/**',
		notebookType: 'jupyter-notebook'
	},
	language: 'python'
}
```

A `NotebookCellTextDocumentFilter` can be used to register providers for certain requests like code complete or hover. If such a provider is registered the client will send the corresponding `textDocument/*` requests to the server using the cell text document's URI as the document URI.

There are cases where simply only knowing about a cell's text content is not enough for a server to reason about the cells content and to provide good language smarts. Sometimes it is necessary to know all cells of a notebook document including the notebook document itself. Consider a notebook that has two JavaScript cells with the following content

Cell one:

```javascript
function add(a, b) {
	return a + b;
}
```

Cell two:

```javascript
add/*<cursor>*/;
```
Requesting code assist in cell two at the marked cursor position should propose the function `add` which is only possible if the server knows about cell one and cell two and knows that they belong to the same notebook document.

The protocol will therefore support two modes when it comes to synchronizing cell text content:

* _cellContent_: in this mode only the cell text content is synchronized to the server using the standard `textDocument/did*` notification. No notebook document and no cell structure is synchronized. This mode allows for easy adoption of notebooks since servers can reuse most of it implementation logic.
* _notebook_: in this mode the notebook document, the notebook cells and the notebook cell text content is synchronized to the server. To allow servers to create a consistent picture of a notebook document the cell text content is NOT synchronized using the standard `textDocument/did*` notifications. It is instead synchronized using special `notebook/did*` notifications. This ensures that the cell and its text content arrives on the server using one open, change or close event.

To request the cell content only a normal document selector can be used. For example the selector `[{ language: 'python' }]` will synchronize Python notebook document cells to the server. However since this might synchronize unwanted documents as well a document filter can also be a `NotebookCellTextDocumentFilter`. So `{ notebook: { scheme: 'file', notebookType: 'jupyter-notebook' }, language: 'python' }` synchronizes all Python cells in a Jupyter notebook stored on disk.

To synchronize the whole notebook document a server provides a `notebookDocumentSync` in its server capabilities. For example:

```typescript
{
	notebookDocumentSync: {
		notebookSelector: {
			notebook: { scheme: 'file', notebookType: 'jupyter-notebook' },
			cells: [{ language: 'python' }]
		}
	}
}
```
Synchronizes the notebook including all Python cells to the server if the notebook is stored on disk.

_Client Capability_:

The following client capabilities are defined for notebook documents:

* property name (optional): `notebookDocument.synchronization`
* property type: `NotebookDocumentSyncClientCapabilities` defined as follows

<div class="anchorHolder"><a href="#notebookDocumentSyncClientCapabilities" name="notebookDocumentSyncClientCapabilities" class="linkableAnchor"></a></div>

```typescript
/**
 * Notebook specific client capabilities.
 *
 * @since 3.17.0
 */
export interface NotebookDocumentSyncClientCapabilities {

	/**
	 * Whether implementation supports dynamic registration. If this is
	 * set to `true` the client supports the new
	 * `(TextDocumentRegistrationOptions & StaticRegistrationOptions)`
	 * return value for the corresponding server capability as well.
	 */
	dynamicRegistration?: boolean;

	/**
	 * The client supports sending execution summary data per cell.
	 */
	executionSummarySupport?: boolean;
}
```

_Server Capability_:

The following server capabilities are defined for notebook documents:

* property name (optional): `notebookDocumentSync`
* property type: `NotebookDocumentOptions | NotebookDocumentRegistrationOptions` where `NotebookDocumentOptions` is defined as follows:

<div class="anchorHolder"><a href="#notebookDocumentSyncOptions" name="notebookDocumentSyncOptions" class="linkableAnchor"></a></div>

```typescript
/**
 * Options specific to a notebook plus its cells
 * to be synced to the server.
 *
 * If a selector provides a notebook document
 * filter but no cell selector all cells of a
 * matching notebook document will be synced.
 *
 * If a selector provides no notebook document
 * filter but only a cell selector all notebook
 * documents that contain at least one matching
 * cell will be synced.
 *
 * @since 3.17.0
 */
export interface NotebookDocumentSyncOptions {
	/**
	 * The notebooks to be synced
	 */
	notebookSelector: ({
		/**
		 * The notebook to be synced. If a string
		 * value is provided it matches against the
		 * notebook type. '*' matches every notebook.
		 */
		notebook: string | NotebookDocumentFilter;

		/**
		 * The cells of the matching notebook to be synced.
		 */
		cells?: { language: string }[];
	} | {
		/**
		 * The notebook to be synced. If a string
		 * value is provided it matches against the
		 * notebook type. '*' matches every notebook.
		 */
		notebook?: string | NotebookDocumentFilter;

		/**
		 * The cells of the matching notebook to be synced.
		 */
		cells: { language: string }[];
	})[];

	/**
	 * Whether save notification should be forwarded to
	 * the server. Will only be honored if mode === `notebook`.
	 */
	save?: boolean;
}
```

_Registration Options_: `NotebookDocumentRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#notebookDocumentSyncRegistrationOptions" name="notebookDocumentSyncRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
/**
 * Registration options specific to a notebook.
 *
 * @since 3.17.0
 */
export interface NotebookDocumentSyncRegistrationOptions extends
	NotebookDocumentSyncOptions, StaticRegistrationOptions {
}
```

#### <a href="#notebookDocument_didOpen" name="notebookDocument_didOpen" class="anchor">DidOpenNotebookDocument Notification (:arrow_right:)</a>

The open notification is sent from the client to the server when a notebook document is opened. It is only sent by a client if the server requested the synchronization mode `notebook` in its `notebookDocumentSync` capability.

_Notification_:

* method: `notebookDocument/didOpen`
* params: `DidOpenNotebookDocumentParams` defined as follows:

<div class="anchorHolder"><a href="#didOpenNotebookDocumentParams" name="didOpenNotebookDocumentParams" class="linkableAnchor"></a></div>

```typescript
/**
 * The params sent in an open notebook document notification.
 *
 * @since 3.17.0
 */
export interface DidOpenNotebookDocumentParams {

	/**
	 * The notebook document that got opened.
	 */
	notebookDocument: NotebookDocument;

	/**
	 * The text documents that represent the content
	 * of a notebook cell.
	 */
	cellTextDocuments: TextDocumentItem[];
}
```

#### <a href="#notebookDocument_didChange" name="notebookDocument_didChange" class="anchor">DidChangeNotebookDocument Notification (:arrow_right:)</a>

The change notification is sent from the client to the server when a notebook document changes. It is only sent by a client if the server requested the synchronization mode `notebook` in its `notebookDocumentSync` capability.

_Notification_:

* method: `notebookDocument/didChange`
* params: `DidChangeNotebookDocumentParams` defined as follows:

<div class="anchorHolder"><a href="#didChangeNotebookDocumentParams" name="didChangeNotebookDocumentParams" class="linkableAnchor"></a></div>

```typescript
/**
 * The params sent in a change notebook document notification.
 *
 * @since 3.17.0
 */
export interface DidChangeNotebookDocumentParams {

	/**
	 * The notebook document that did change. The version number points
	 * to the version after all provided changes have been applied.
	 */
	notebookDocument: VersionedNotebookDocumentIdentifier;

	/**
	 * The actual changes to the notebook document.
	 *
	 * The change describes single state change to the notebook document.
	 * So it moves a notebook document, its cells and its cell text document
	 * contents from state S to S'.
	 *
	 * To mirror the content of a notebook using change events use the
	 * following approach:
	 * - start with the same initial content
	 * - apply the 'notebookDocument/didChange' notifications in the order
	 *   you receive them.
	 */
	change: NotebookDocumentChangeEvent;
}
```

<div class="anchorHolder"><a href="#versionedNotebookDocumentIdentifier" name="versionedNotebookDocumentIdentifier" class="linkableAnchor"></a></div>

```typescript
/**
 * A versioned notebook document identifier.
 *
 * @since 3.17.0
 */
export interface VersionedNotebookDocumentIdentifier {

	/**
	 * The version number of this notebook document.
	 */
	version: integer;

	/**
	 * The notebook document's URI.
	 */
	uri: URI;
}
```

<div class="anchorHolder"><a href="#notebookDocumentChangeEvent" name="notebookDocumentChangeEvent" class="linkableAnchor"></a></div>

```typescript
/**
 * A change event for a notebook document.
 *
 * @since 3.17.0
 */
export interface NotebookDocumentChangeEvent {
	/**
	 * The changed meta data if any.
	 */
	metadata?: LSPObject;

	/**
	 * Changes to cells
	 */
	cells?: {
		/**
		 * Changes to the cell structure to add or
		 * remove cells.
		 */
		structure?: {
			/**
			 * The change to the cell array.
			 */
			array: NotebookCellArrayChange;

			/**
			 * Additional opened cell text documents.
			 */
			didOpen?: TextDocumentItem[];

			/**
			 * Additional closed cell text documents.
			 */
			didClose?: TextDocumentIdentifier[];
		};

		/**
		 * Changes to notebook cells properties like its
		 * kind, execution summary or metadata.
		 */
		data?: NotebookCell[];

		/**
		 * Changes to the text content of notebook cells.
		 */
		textContent?: {
			document: VersionedTextDocumentIdentifier;
			changes: TextDocumentContentChangeEvent[];
		}[];
	};
}
```

<div class="anchorHolder"><a href="#notebookCellArrayChange" name="notebookCellArrayChange" class="linkableAnchor"></a></div>

```typescript
/**
 * A change describing how to move a `NotebookCell`
 * array from state S to S'.
 *
 * @since 3.17.0
 */
export interface NotebookCellArrayChange {
	/**
	 * The start offset of the cell that changed.
	 */
	start: uinteger;

	/**
	 * The deleted cells
	 */
	deleteCount: uinteger;

	/**
	 * The new cells, if any
	 */
	cells?: NotebookCell[];
}
```

#### <a href="#notebookDocument_didSave" name="notebookDocument_didSave" class="anchor">DidSaveNotebookDocument Notification (:arrow_right:)</a>

The save notification is sent from the client to the server when a notebook document is saved. It is only sent by a client if the server requested the synchronization mode `notebook` in its `notebookDocumentSync` capability.

_Notification_:

<div class="anchorHolder"><a href="#notebookDocument_didSave" name="notebookDocument_didSave" class="linkableAnchor"></a></div>

* method: `notebookDocument/didSave`
* params: `DidSaveNotebookDocumentParams` defined as follows:

<div class="anchorHolder"><a href="#didSaveNotebookDocumentParams" name="didSaveNotebookDocumentParams" class="linkableAnchor"></a></div>

```typescript
/**
 * The params sent in a save notebook document notification.
 *
 * @since 3.17.0
 */
export interface DidSaveNotebookDocumentParams {
	/**
	 * The notebook document that got saved.
	 */
	notebookDocument: NotebookDocumentIdentifier;
}
```

#### <a href="#notebookDocument_didClose" name="notebookDocument_didClose" class="anchor">DidCloseNotebookDocument Notification (:arrow_right:)</a>

The close notification is sent from the client to the server when a notebook document is closed. It is only sent by a client if the server requested the synchronization mode `notebook` in its `notebookDocumentSync` capability.

_Notification_:

<div class="anchorHolder"><a href="#notebookDocument_didClose" name="notebookDocument_didClose" class="linkableAnchor"></a></div>

* method: `notebookDocument/didClose`
* params: `DidCloseNotebookDocumentParams` defined as follows:

<div class="anchorHolder"><a href="#didCloseNotebookDocumentParams" name="didCloseNotebookDocumentParams" class="linkableAnchor"></a></div>

```typescript
/**
 * The params sent in a close notebook document notification.
 *
 * @since 3.17.0
 */
export interface DidCloseNotebookDocumentParams {

	/**
	 * The notebook document that got closed.
	 */
	notebookDocument: NotebookDocumentIdentifier;

	/**
	 * The text documents that represent the content
	 * of a notebook cell that got closed.
	 */
	cellTextDocuments: TextDocumentIdentifier[];
}
```

<div class="anchorHolder"><a href="#notebookDocumentIdentifier" name="notebookDocumentIdentifier" class="linkableAnchor"></a></div>

```typescript
/**
 * A literal to identify a notebook document in the client.
 *
 * @since 3.17.0
 */
export interface NotebookDocumentIdentifier {
	/**
	 * The notebook document's URI.
	 */
	uri: URI;
}
```
