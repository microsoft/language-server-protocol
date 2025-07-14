#### <a href="#patterns" name="patterns" class="anchor"> Patterns </a>

Pattern definitions used in file watchers and document filters.

<div class="anchorHolder"><a href="#pattern" name="pattern" class="linkableAnchor"></a></div>

```typescript
/**
 * The pattern to watch relative to the base path. Glob patterns can have
 * the following syntax:
 * - `*` to match zero or more characters in a path segment
 * - `?` to match on one character in a path segment
 * - `**` to match any number of path segments, including none
 * - `{}` to group conditions (e.g. `**​/*.{ts,js}` matches all TypeScript
 *   and JavaScript files)
 * - `[]` to declare a range of characters to match in a path segment
 *   (e.g., `example.[0-9]` to match on `example.0`, `example.1`, …)
 * - `[!...]` to negate a range of characters to match in a path segment
 *   (e.g., `example.[!0-9]` to match on `example.a`, `example.b`,
 *   but not `example.0`)
 *
 * @since 3.17.0
 */
export type Pattern = string;
```

<div class="anchorHolder"><a href="#relativePattern" name="relativePattern" class="linkableAnchor"></a></div>

```typescript
/**
 * A relative pattern is a helper to construct glob patterns that are matched
 * relatively to a base URI. The common value for a `baseUri` is a workspace
 * folder root, but it can be another absolute URI as well.
 *
 * @since 3.17.0
 */
export interface RelativePattern {
	/**
	 * A workspace folder or a base URI to which this pattern will be matched
	 * against relatively.
	 */
	baseUri: WorkspaceFolder | URI;

	/**
	 * The actual pattern;
	 */
	pattern: Pattern;
}
```

<div class="anchorHolder"><a href="#globPattern" name="globPattern" class="linkableAnchor"></a></div>

```typescript
/**
 * The glob pattern. Either a string pattern or a relative pattern.
 *
 * @since 3.17.0
 */
export type GlobPattern = Pattern | RelativePattern;
```