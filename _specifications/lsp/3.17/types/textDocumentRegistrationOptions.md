#### <a href="#textDocumentRegistrationOptions" name="textDocumentRegistrationOptions" class="anchor"> TextDocumentRegistrationOptions </a>

Options to dynamically register for requests for a set of text documents.

```typescript
/**
 * General text document registration options.
 */
export interface TextDocumentRegistrationOptions {
	/**
	 * A document selector to identify the scope of the registration. If set to
	 * null the document selector provided on the client side will be used.
	 */
	documentSelector: DocumentSelector | null;
}
```