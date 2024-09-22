#### <a href="#textDocumentPositionParams" name="textDocumentPositionParams" class="anchor"> TextDocumentPositionParams </a>

Was `TextDocumentPosition` in 1.0 with inlined parameters.

A parameter literal used in requests to pass a text document and a
position or optional range within that document.

To be consistent with features implemented internally, the client is
free to choose for each LSP request how a cursor position or text
selection is converted into a position or range.
For example, some editors display the cursor as a caret at the current
insertion point between characters (`A|BC`), whereas others display it
as a box around the character after the insertion point (`A🄱C`).
Depending on the operation, in the absence of a selection range,
editors of the second kind may choose to interpret the cursor position
as an implicit selection of the character _after_ the position.

```typescript
interface TextDocumentPositionParams {
	/**
	 * The text document.
	 */
	textDocument: TextDocumentIdentifier;

	/**
	 * The cursor position within the text document.
	 */
	position: Position;

	/**
	 * The selected range within the text document, if any.
	 * The position is typically one of the endpoints of the range.
	 */
	range?: Range;
}
```
