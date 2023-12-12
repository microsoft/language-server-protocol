#### <a href="#partialResultParams" name="partialResultParams" class="anchor"> PartialResultParams </a>

A parameter literal used to pass a partial result token.

```typescript
export interface PartialResultParams {
	/**
	 * An optional token that a server can use to report partial results (e.g.
	 * streaming) to the client.
	 */
	partialResultToken?: ProgressToken;
}
```