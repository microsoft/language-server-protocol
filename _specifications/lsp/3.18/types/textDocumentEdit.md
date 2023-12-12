#### <a href="#textDocumentEdit" name="textDocumentEdit" class="anchor"> TextDocumentEdit </a>

> New in version 3.16: support for `AnnotatedTextEdit`. The support is guarded by the client capability `workspace.workspaceEdit.changeAnnotationSupport`. If a client doesn't signal the capability, servers shouldn't send `AnnotatedTextEdit` literals back to the client.

Describes textual changes on a single text document. The text document is referred to as a `OptionalVersionedTextDocumentIdentifier` to allow clients to check the text document version before an edit is applied. A `TextDocumentEdit` describes all changes on a version Si and after they are applied move the document to version Si+1. So the creator of a `TextDocumentEdit` doesn't need to sort the array of edits or do any kind of ordering. However the edits must be non overlapping.

```typescript
export interface TextDocumentEdit {
	/**
	 * The text document to change.
	 */
	textDocument: OptionalVersionedTextDocumentIdentifier;

	/**
	 * The edits to be applied.
	 *
	 * @since 3.16.0 - support for AnnotatedTextEdit. This is guarded by the
	 * client capability `workspace.workspaceEdit.changeAnnotationSupport`
	 */
	edits: (TextEdit | AnnotatedTextEdit)[];
}
```