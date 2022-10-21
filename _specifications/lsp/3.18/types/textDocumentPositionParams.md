#### <a href="#textDocumentPositionParams" name="textDocumentPositionParams" class="anchor"> TextDocumentPositionParams </a>

Was `TextDocumentPosition` in 1.0 with inlined parameters.

A parameter literal used in requests to pass a text document and a position inside that document. It is up to the client to decide how a selection is converted into a position when issuing a request for a text document. The client can for example honor or ignore the selection direction to make LSP request consistent with features implemented internally.

```typescript
interface TextDocumentPositionParams {
	/**
	 * The text document.
	 */
	textDocument: TextDocumentIdentifier;

	/**
	 * The position inside the text document.
	 */
	position: Position;
}
```