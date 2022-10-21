#### <a href="#textDocument_onTypeFormatting" name="textDocument_onTypeFormatting" class="anchor">Document on Type Formatting Request (:leftwards_arrow_with_hook:)</a>

The document on type formatting request is sent from the client to the server to format parts of the document during typing.

_Client Capability_:
* property name (optional): `textDocument.onTypeFormatting`
* property type: `DocumentOnTypeFormattingClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#documentOnTypeFormattingClientCapabilities" name="documentOnTypeFormattingClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface DocumentOnTypeFormattingClientCapabilities {
	/**
	 * Whether on type formatting supports dynamic registration.
	 */
	dynamicRegistration?: boolean;
}
```

_Server Capability_:
* property name (optional): `documentOnTypeFormattingProvider`
* property type: `DocumentOnTypeFormattingOptions` defined as follows:

<div class="anchorHolder"><a href="#documentOnTypeFormattingOptions" name="documentOnTypeFormattingOptions" class="linkableAnchor"></a></div>

```typescript
export interface DocumentOnTypeFormattingOptions {
	/**
	 * A character on which formatting should be triggered, like `{`.
	 */
	firstTriggerCharacter: string;

	/**
	 * More trigger characters.
	 */
	moreTriggerCharacter?: string[];
}
```

_Registration Options_: `DocumentOnTypeFormattingRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#documentOnTypeFormattingRegistrationOptions" name="documentOnTypeFormattingRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface DocumentOnTypeFormattingRegistrationOptions extends
	TextDocumentRegistrationOptions, DocumentOnTypeFormattingOptions {
}
```

_Request_:
* method: `textDocument/onTypeFormatting`
* params: `DocumentOnTypeFormattingParams` defined as follows:

<div class="anchorHolder"><a href="#documentOnTypeFormattingParams" name="documentOnTypeFormattingParams" class="linkableAnchor"></a></div>

```typescript
interface DocumentOnTypeFormattingParams {

	/**
	 * The document to format.
	 */
	textDocument: TextDocumentIdentifier;

	/**
	 * The position around which the on type formatting should happen.
	 * This is not necessarily the exact position where the character denoted
	 * by the property `ch` got typed.
	 */
	position: Position;

	/**
	 * The character that has been typed that triggered the formatting
	 * on type request. That is not necessarily the last character that
	 * got inserted into the document since the client could auto insert
	 * characters as well (e.g. like automatic brace completion).
	 */
	ch: string;

	/**
	 * The formatting options.
	 */
	options: FormattingOptions;
}
```

_Response_:
* result: [`TextEdit[]`](#textEdit) \| `null` describing the modification to the document.
* error: code and message set in case an exception happens during the range formatting request.
