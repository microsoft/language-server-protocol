#### <a href="#stringValue" name="stringValue" class="anchor"> String Value </a>

Template strings for inserting text and controlling the editor cursor upon insertion.

```typescript
/**
 * A string value used as a snippet is a template which allows to insert text
 * and to control the editor cursor when insertion happens.
 *
 * A snippet can define tab stops and placeholders with `$1`, `$2`
 * and `${3:foo}`. `$0` defines the final tab stop, it defaults to
 * the end of the snippet. Variables are defined with `$name` and
 * `${name:default value}`.
 * 
 * @since 3.18.0
 */
export interface StringValue {
	/**
	 * The kind of string value.
	 */
	kind: 'snippet';

	/**
	 * The snippet string.
	 */
	value: string;
}
```