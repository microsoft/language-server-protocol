#### <a href="#markupContent" name="markupContent" class="anchor"> MarkupContent </a>

 A `MarkupContent` literal represents a string value which content can be represented in different formats. Currently `plaintext` and `markdown` are supported formats. A `MarkupContent` is usually used in documentation properties of result literals like `CompletionItem` or `SignatureInformation`. If the format is `markdown` the content should follow the [GitHub Flavored Markdown Specification](https://github.github.com/gfm/). `MarkupContent` in responses to requests that are scoped to a document may contain relative links, which will be resolved relative to that document.

```typescript
/**
 * Describes the content type that a client supports in various
 * result literals like `Hover`, `ParameterInfo` or `CompletionItem`.
 *
 * Please note that `MarkupKinds` must not start with a `$`. This kinds
 * are reserved for internal usage.
 */
export namespace MarkupKind {
	/**
	 * Plain text is supported as a content format
	 */
	export const PlainText: 'plaintext' = 'plaintext';

	/**
	 * Markdown is supported as a content format
	 */
	export const Markdown: 'markdown' = 'markdown';
}
export type MarkupKind = 'plaintext' | 'markdown';
```

<div class="anchorHolder"><a href="#markupContentDefinition" name="markupContentInnerDefinition" class="linkableAnchor"></a></div>

```typescript
/**
 * A `MarkupContent` literal represents a string value which content is
 * interpreted base on its kind flag. Currently the protocol supports
 * `plaintext` and `markdown` as markup kinds.
 *
 * If the kind is `markdown` then the value can contain fenced code blocks like
 * in GitHub issues.
 *
 * Here is an example how such a string can be constructed using
 * JavaScript / TypeScript:
 * ```typescript
 * let markdown: MarkdownContent = {
 * 	kind: MarkupKind.Markdown,
 * 	value: [
 * 		'# Header',
 * 		'Some text',
 * 		'```typescript',
 * 		'someCode();',
 * 		'```'
 * 	].join('\n')
 * };
 * ```
 *
 * *Please Note* that clients might sanitize the return markdown. A client could
 * decide to remove HTML from the markdown to avoid script execution.
 */
export interface MarkupContent {
	/**
	 * The type of the Markup
	 */
	kind: MarkupKind;

	/**
	 * The content itself
	 */
	value: string;
}
```

In addition clients should signal the markdown parser they are using via the client capability `general.markdown` introduced in version 3.16.0 defined as follows:

<div class="anchorHolder"><a href="#markdownClientCapabilities" name="markdownClientCapabilities" class="linkableAnchor"></a></div>

 ```typescript
/**
 * Client capabilities specific to the used markdown parser.
 *
 * @since 3.16.0
 */
export interface MarkdownClientCapabilities {
	/**
	 * The name of the parser.
	 */
	parser: string;

	/**
	 * The version of the parser.
	 */
	version?: string;

	/**
	 * A list of HTML tags that the client allows / supports in
	 * Markdown.
	 *
	 * @since 3.17.0
	 */
	allowedTags?: string[];
}
 ```

Known markdown parsers used by clients right now are:

Parser          | Version | Documentation
--------------- | ------- | -------------
marked          | 1.1.0   | [Marked Documentation](https://marked.js.org/)
Python-Markdown | 3.2.2   | [Python-Markdown Documentation](https://python-markdown.github.io)