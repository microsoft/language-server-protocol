#### <a href="#textDocument_colorPresentation" name="textDocument_colorPresentation" class="anchor">Color Presentation Request (:leftwards_arrow_with_hook:)</a>

> *Since version 3.6.0*

The color presentation request is sent from the client to the server to obtain a list of presentations for a color value at a given location. Clients can use the result to
- modify a color reference.
- show in a color picker and let users pick one of the presentations

This request has no special capabilities and registration options since it is send as a resolve request for the `textDocument/documentColor` request.

_Request_:

* method: `textDocument/colorPresentation`
* params: `ColorPresentationParams` defined as follows

<div class="anchorHolder"><a href="#colorPresentationParams" name="colorPresentationParams" class="linkableAnchor"></a></div>

```typescript
interface ColorPresentationParams extends WorkDoneProgressParams,
	PartialResultParams {
	/**
	 * The text document.
	 */
	textDocument: TextDocumentIdentifier;

	/**
	 * The color information to request presentations for.
	 */
	color: Color;

	/**
	 * The range where the color would be inserted. Serves as a context.
	 */
	range: Range;
}
```

_Response_:
* result: `ColorPresentation[]` defined as follows:

<div class="anchorHolder"><a href="#colorPresentation" name="colorPresentation" class="linkableAnchor"></a></div>

```typescript
interface ColorPresentation {
	/**
	 * The label of this color presentation. It will be shown on the color
	 * picker header. By default this is also the text that is inserted when
	 * selecting this color presentation.
	 */
	label: string;
	/**
	 * An [edit](#TextEdit) which is applied to a document when selecting
	 * this presentation for the color. When `falsy` the
	 * [label](#ColorPresentation.label) is used.
	 */
	textEdit?: TextEdit;
	/**
	 * An optional array of additional [text edits](#TextEdit) that are applied
	 * when selecting this color presentation. Edits must not overlap with the
	 * main [edit](#ColorPresentation.textEdit) nor with themselves.
	 */
	additionalTextEdits?: TextEdit[];
}
```

* partial result: `ColorPresentation[]`
* error: code and message set in case an exception happens during the 'textDocument/colorPresentation' request
