#### <a href="#textDocumentIdentifier" name="textDocumentIdentifier" class="anchor"> TextDocumentIdentifier </a>

Text documents are identified using a URI. On the protocol level, URIs are passed as strings. The corresponding JSON structure looks like this:
```typescript
interface TextDocumentIdentifier {
	/**
	 * The text document's URI.
	 */
	uri: DocumentUri;
}
```