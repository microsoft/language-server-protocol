#### <a href="#textDocument_formatting" name="textDocument_formatting" class="anchor">Document Formatting Request  (:leftwards_arrow_with_hook:)</a>

The document formatting request is sent from the client to the server to format a whole document.

_Client Capability_:
* property name (optional): `textDocument.formatting`
* property type: `DocumentFormattingClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#documentFormattingClientCapabilities" name="documentFormattingClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface DocumentFormattingClientCapabilities {
	/**
	 * Whether formatting supports dynamic registration.
	 */
	dynamicRegistration?: boolean;
}
```

_Server Capability_:
* property name (optional): `documentFormattingProvider`
* property type: `boolean | DocumentFormattingOptions` where `DocumentFormattingOptions` is defined as follows:

<div class="anchorHolder"><a href="#documentFormattingOptions" name="documentFormattingOptions" class="linkableAnchor"></a></div>

```typescript
export interface DocumentFormattingOptions extends WorkDoneProgressOptions {
}
```

_Registration Options_: `DocumentFormattingRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#documentFormattingRegistrationOptions" name="documentFormattingRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface DocumentFormattingRegistrationOptions extends
	TextDocumentRegistrationOptions, DocumentFormattingOptions {
}
```

_Request_:
* method: `textDocument/formatting`
* params: `DocumentFormattingParams` defined as follows

<div class="anchorHolder"><a href="#documentFormattingParams" name="documentFormattingParams" class="linkableAnchor"></a></div>

```typescript
interface DocumentFormattingParams extends WorkDoneProgressParams {
	/**
	 * The document to format.
	 */
	textDocument: TextDocumentIdentifier;

	/**
	 * The format options.
	 */
	options: FormattingOptions;
}
```

<div class="anchorHolder"><a href="#formattingOptions" name="formattingOptions" class="linkableAnchor"></a></div>

```typescript
/**
 * Value-object describing what options formatting should use.
 */
interface FormattingOptions {
	/**
	 * Size of a tab in spaces.
	 */
	tabSize: uinteger;

	/**
	 * Prefer spaces over tabs.
	 */
	insertSpaces: boolean;

	/**
	 * Trim trailing whitespace on a line.
	 *
	 * @since 3.15.0
	 */
	trimTrailingWhitespace?: boolean;

	/**
	 * Insert a newline character at the end of the file if one does not exist.
	 *
	 * @since 3.15.0
	 */
	insertFinalNewline?: boolean;

	/**
	 * Trim all newlines after the final newline at the end of the file.
	 *
	 * @since 3.15.0
	 */
	trimFinalNewlines?: boolean;

	/**
	 * Signature for further properties.
	 */
	[key: string]: boolean | integer | string;
}
```

_Response_:
* result: [`TextEdit[]`](#textEdit) \| `null` describing the modification to the document to be formatted.
* error: code and message set in case an exception happens during the formatting request.
