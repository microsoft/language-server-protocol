#### <a href="#textEdit" name="textEdit" class="anchor"> TextEdit, AnnotatedTextEdit & SnippetTextEdit </a>

- New in version 3.16: Support for `AnnotatedTextEdit`.
- New in version 3.18: Support for `SnippetTextEdit`.


A textual edit applicable to a text document.

```typescript
interface TextEdit {
	/**
	 * The range of the text document to be manipulated. To insert
	 * text into a document, create a range where start === end.
	 */
	range: Range;

	/**
	 * The string to be inserted. For delete operations, use an
	 * empty string.
	 */
	newText: string;
}
```
Since 3.16.0 there is also the concept of an annotated text edit which supports adding an annotation to a text edit. The annotation can add information describing the change to the text edit.

<div class="anchorHolder"><a href="#changeAnnotation" name="changeAnnotation" class="linkableAnchor"></a></div>

```typescript
/**
 * Additional information that describes document changes.
 *
 * @since 3.16.0
 */
export interface ChangeAnnotation {
	/**
	 * A human-readable string describing the actual change. The string
	 * is rendered prominently in the user interface.
	 */
	label: string;

	/**
	 * A flag which indicates that user confirmation is needed
	 * before applying the change.
	 */
	needsConfirmation?: boolean;

	/**
	 * A human-readable string which is rendered less prominently in
	 * the user interface.
	 */
	description?: string;
}
```

Usually clients provide options to group the changes along the annotations they are associated with. To support this in the protocol an edit or resource operation refers to a change annotation using an identifier and not the change annotation literal directly. This allows servers to use the identical annotation across multiple edits or resource operations which then allows clients to group the operations under that change annotation. The actual change annotations together with their identifiers are managed by the workspace edit via the new property `changeAnnotations`.

<div class="anchorHolder"><a href="#changeAnnotationIdentifier" name="changeAnnotationIdentifier" class="linkableAnchor"></a></div>

```typescript
/**
 * An identifier referring to a change annotation managed by a workspace
 * edit.
 *
 * @since 3.16.0.
 */
export type ChangeAnnotationIdentifier = string;
```

<div class="anchorHolder"><a href="#annotatedTextEdit" name="annotatedTextEdit" class="linkableAnchor"></a></div>

```typescript
/**
 * A special text edit with an additional change annotation.
 *
 * @since 3.16.0.
 */
export interface AnnotatedTextEdit extends TextEdit {
	/**
	 * The actual annotation identifier.
	 */
	annotationId: ChangeAnnotationIdentifier;
}
```

Since 3.18.0, there is also the concept of a snippet text edit, which supports inserting a snippet instead of plain text.

Some important remarks:
- interactive snippets are only applied to the file opened in the active editor. This avoids unwanted focus switches or editor reveals.
- For the active file, only one snippet can specify a cursor position. In case there are multiple snippets defining a cursor position for a given URI, it is up to the client to decide the end position of the cursor.
- In case the snippet text edit corresponds to a file that is not currently open in the active editor, the client should downgrade the snippet to a non-interactive normal text edit and apply it to the file. This ensures that a workspace edit doesn't open arbitrary files.

<div class="anchorHolder"><a href="#snippetTextEdit" name="snippetTextEdit" class="linkableAnchor"></a></div>

```typescript
/**
 * An interactive text edit.
 *
 * @since 3.18.0
 */
export interface SnippetTextEdit {
	/**
	 * The range of the text document to be manipulated.
	 */
	range: Range;

	/**
	 * The snippet to be inserted.
	 */
	snippet: StringValue;

	/**
	 * The actual identifier of the snippet edit.
	 */
	annotationId?: ChangeAnnotationIdentifier;
}
```