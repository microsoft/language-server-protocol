#### <a href="#partialResults" name="partialResults" class="anchor"> Partial Result Progress </a>

> *Since version 3.15.0*

Partial results are also reported using the generic [`$/progress`](#progress) notification. The value payload of a partial result progress notification is in most cases the same as the final result. For example the `workspace/symbol` request has `SymbolInformation[]` \| `WorkspaceSymbol[]` as the result type. Partial result is therefore also of type `SymbolInformation[]` \| `WorkspaceSymbol[]`. Whether a client accepts partial result notifications for a request is signaled by adding a `partialResultToken` to the request parameter. For example, a `textDocument/reference` request that supports both work done and partial result progress might look like this:

```json
{
	"textDocument": {
		"uri": "file:///folder/file.ts"
	},
	"position": {
		"line": 9,
		"character": 5
	},
	"context": {
		"includeDeclaration": true
	},
	// The token used to report work done progress.
	"workDoneToken": "1d546990-40a3-4b77-b134-46622995f6ae",
	// The token used to report partial result progress.
	"partialResultToken": "5f6f349e-4f81-4a3b-afff-ee04bff96804"
}
```

The `partialResultToken` is then used to report partial results for the find references request.

If a server reports partial result via a corresponding `$/progress`, the whole result must be reported using n `$/progress` notifications. The final response has to be empty in terms of result values. This avoids confusion about how the final result should be interpreted, e.g. as another partial result or as a replacing result.

If the response errors the provided partial results should be treated as follows:

- the `code` equals to `RequestCancelled`: the client is free to use the provided results but should make clear that the request got canceled and may be incomplete.
- in all other cases the provided partial results shouldn't be used.