#### <a href="#documentFilter" name="documentFilter" class="anchor">DocumentFilter</a>

A document filter denotes a document through properties like `language`, `scheme` or `pattern`. An example is a filter that applies to TypeScript files on disk. Another example is a filter that applies to JSON files with name `package.json`:
```typescript
{ language: 'typescript', scheme: 'file' }
{ language: 'json', pattern: '**/package.json' }
```

```typescript
/**
 * A document filter where `language` is required field.
 *
 * @since 3.18.0
 */
export type TextDocumentFilterLanguage = {
	/**
	 * A language id, like `typescript`.
	 */
	language: string;

	/**
	 * A Uri {@link Uri.scheme scheme}, like `file` or `untitled`.
	 */
	scheme?: string;

	/**
	 * A glob pattern, like **​/*.{ts,js}. See TextDocumentFilter for examples.
	 *
	 * @since 3.18.0 - support for relative patterns. Whether clients support
	 * relative patterns depends on the client capability
	 * `textDocuments.filters.relativePatternSupport`.
	 */
	pattern?: GlobPattern;
};

/**
 * A document filter where `scheme` is required field.
 *
 * @since 3.18.0
 */
export type TextDocumentFilterScheme = {
	/**
	 * A language id, like `typescript`.
	 */
	language?: string;

	/**
	 * A Uri {@link Uri.scheme scheme}, like `file` or `untitled`.
	 */
	scheme: string;

	/**
	 * A glob pattern, like **​/*.{ts,js}. See TextDocumentFilter for examples.
	 *
	 * @since 3.18.0 - support for relative patterns. Whether clients support
	 * relative patterns depends on the client capability
	 * `textDocuments.filters.relativePatternSupport`.
	 */
	pattern?: GlobPattern;
};

/**
 * A document filter where `pattern` is required field.
 *
 * @since 3.18.0
 */
export type TextDocumentFilterPattern = {
	/**
	 * A language id, like `typescript`.
	 */
	language?: string;

	/**
	 * A Uri {@link Uri.scheme scheme}, like `file` or `untitled`.
	 */
	scheme?: string;

	/**
	 * A glob pattern, like **​/*.{ts,js}. See TextDocumentFilter for examples.
	 *
	 * @since 3.18.0 - support for relative patterns. Whether clients support
	 * relative patterns depends on the client capability
	 * `textDocuments.filters.relativePatternSupport`.
	 */
	pattern: GlobPattern;
};

/**
 * A document filter denotes a document by different properties like
 * the {@link TextDocument.languageId language}, the {@link Uri.scheme scheme}
 * of its resource, or a glob-pattern that is applied to
 * the {@link TextDocument.fileName path}.
 *
 * Glob patterns can have the following syntax:
 * - `*` to match zero or more characters in a path segment
 * - `?` to match on one character in a path segment
 * - `**` to match any number of path segments, including none
 * - `{}` to group sub patterns into an OR expression. (e.g. `**​/*.{ts,js}`
 *   matches all TypeScript and JavaScript files)
 * - `[]` to declare a range of characters to match in a path segment
 *   (e.g., `example.[0-9]` to match on `example.0`, `example.1`, …)
 * - `[!...]` to negate a range of characters to match in a path segment
 *   (e.g., `example.[!0-9]` to match on `example.a`, `example.b`,
 *   but not `example.0`)
 *
 * @sample A language filter that applies to typescript files on disk:
 *   `{ language: 'typescript', scheme: 'file' }`
 * @sample A language filter that applies to all package.json paths:
 *   `{ language: 'json', pattern: '**package.json' }`
 *
 * @since 3.17.0
 */
export type TextDocumentFilter = TextDocumentFilterLanguage |
	TextDocumentFilterScheme | TextDocumentFilterPattern;

/**
 * A document filter describes a top level text document or
 * a notebook cell document.
 *
 * @since 3.17.0 - support for NotebookCellTextDocumentFilter.
 */
export type DocumentFilter = TextDocumentFilter | NotebookCellTextDocumentFilter;
```

A document selector is the combination of one or more document filters.

<div class="anchorHolder"><a href="#documentSelector" name="documentSelector" class="linkableAnchor"></a></div>

```typescript
export type DocumentSelector = DocumentFilter[];
```
