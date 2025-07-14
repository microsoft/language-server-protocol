#### <a href="#documentFilter" name="documentFilter" class="anchor"> DocumentFilter </a>

A document filter denotes a document through properties like `language`, `scheme` or `pattern`. An example is a filter that applies to TypeScript files on disk. Another example is a filter that applies to JSON files with name `package.json`:
```typescript
{ language: 'typescript', scheme: 'file' }
{ language: 'json', pattern: '**/package.json' }
```

```typescript
export interface DocumentFilter {
	/**
	 * A language id, like `typescript`.
	 */
	language?: string;

	/**
	 * A Uri scheme, like `file` or `untitled`.
	 */
	scheme?: string;

	/**
	 * A pattern, like `*.{ts,js}` or a pattern relative to a workspace folders.
	 *
	 * See GlobPattern.
	 *
	 * Whether clients support relative patterns depends on the client
	 * capability `textDocuments.filters.relativePatternSupport`.
	 */
	pattern?: GlobPattern;
}
```

Please note that for a document filter to be valid, at least one of the properties for `language`, `scheme`, or `pattern` must be set. To keep the type definition simple, all properties are marked as optional.

A document selector is the combination of one or more document filters.

<div class="anchorHolder"><a href="#documentSelector" name="documentSelector" class="linkableAnchor"></a></div>

```typescript
export type DocumentSelector = DocumentFilter[];
```
