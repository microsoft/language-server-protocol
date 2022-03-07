#### <a href="#textDocument_rangeFormatting" name="textDocument_rangeFormatting" class="anchor">Document Range Formatting Request (:leftwards_arrow_with_hook:)</a>

The document range formatting request is sent from the client to the server to format a given range in a document.

_Client Capability_:
* property name (optional): `textDocument.rangeFormatting`
* property type: `DocumentRangeFormattingClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#documentRangeFormattingClientCapabilities" name="documentRangeFormattingClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface DocumentRangeFormattingClientCapabilities {
	/**
	 * Whether formatting supports dynamic registration.
	 */
	dynamicRegistration?: boolean;
}
```

_Server Capability_:
* property name (optional): `documentRangeFormattingProvider`
* property type: `boolean | DocumentRangeFormattingOptions` where `DocumentRangeFormattingOptions` is defined as follows:

<div class="anchorHolder"><a href="#documentRangeFormattingOptions" name="documentRangeFormattingOptions" class="linkableAnchor"></a></div>

```typescript
export interface DocumentRangeFormattingOptions extends
	WorkDoneProgressOptions {
}
```

_Registration Options_: `DocumentFormattingRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#documentRangeFormattingRegistrationOptions" name="documentRangeFormattingRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface DocumentRangeFormattingRegistrationOptions extends
	TextDocumentRegistrationOptions, DocumentRangeFormattingOptions {
}
```

_Request_:
* method: `textDocument/rangeFormatting`,
* params: `DocumentRangeFormattingParams` defined as follows:

<div class="anchorHolder"><a href="#documentRangeFormattingParams" name="documentRangeFormattingParams" class="linkableAnchor"></a></div>

```typescript
interface DocumentRangeFormattingParams extends WorkDoneProgressParams {
	/**
	 * The document to format.
	 */
	textDocument: TextDocumentIdentifier;

	/**
	 * The range to format
	 */
	range: Range;

	/**
	 * The format options
	 */
	options: FormattingOptions;
}
```

_Response_:
* result: [`TextEdit[]`](#textEdit) \| `null` describing the modification to the document to be formatted.
* error: code and message set in case an exception happens during the range formatting request.
