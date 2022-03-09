#### <a href="#versionedTextDocumentIdentifier" name="versionedTextDocumentIdentifier" class="anchor"> VersionedTextDocumentIdentifier </a>

An identifier to denote a specific version of a text document. This information usually flows from the client to the server.

```typescript
interface VersionedTextDocumentIdentifier extends TextDocumentIdentifier {
	/**
	 * The version number of this document.
	 *
	 * The version number of a document will increase after each change,
	 * including undo/redo. The number doesn't need to be consecutive.
	 */
	version: integer;
}
```

An identifier which optionally denotes a specific version of a text document. This information usually flows from the server to the client.

<div class="anchorHolder"><a href="#optionalVersionedTextDocumentIdentifier" name="optionalVersionedTextDocumentIdentifier" class="linkableAnchor"></a></div>

```typescript
interface OptionalVersionedTextDocumentIdentifier extends TextDocumentIdentifier {
	/**
	 * The version number of this document. If an optional versioned text document
	 * identifier is sent from the server to the client and the file is not
	 * open in the editor (the server has not received an open notification
	 * before) the server can send `null` to indicate that the version is
	 * known and the content on disk is the master (as specified with document
	 * content ownership).
	 *
	 * The version number of a document will increase after each change,
	 * including undo/redo. The number doesn't need to be consecutive.
	 */
	version: integer | null;
}
```