#### <a href="#textDocument_semanticTokens" name="textDocument_semanticTokens" class="anchor">Semantic Tokens (:leftwards_arrow_with_hook:)</a>

> *Since version 3.16.0*

The request is sent from the client to the server to resolve semantic tokens for a given file. Semantic tokens are used to add additional color information to a file that depends on language specific symbol information. A semantic token request usually produces a large result. The protocol therefore supports encoding tokens with numbers. In addition optional support for deltas is available.

_General Concepts_

Tokens are represented using one token type combined with n token modifiers. A token type is something like `class` or `function` and token modifiers are like `static` or `async`. The protocol defines a set of token types and modifiers but clients are allowed to extend these and announce the values they support in the corresponding client capability. The predefined values are:

<div class="anchorHolder"><a href="#semanticTokenTypes" name="semanticTokenTypes" class="linkableAnchor"></a></div>

```typescript
export enum SemanticTokenTypes {
	namespace = 'namespace',
	/**
	 * Represents a generic type. Acts as a fallback for types which
	 * can't be mapped to a specific type like class or enum.
	 */
	type = 'type',
	class = 'class',
	enum = 'enum',
	interface = 'interface',
	struct = 'struct',
	typeParameter = 'typeParameter',
	parameter = 'parameter',
	variable = 'variable',
	property = 'property',
	enumMember = 'enumMember',
	event = 'event',
	function = 'function',
	method = 'method',
	macro = 'macro',
	keyword = 'keyword',
	modifier = 'modifier',
	comment = 'comment',
	string = 'string',
	number = 'number',
	regexp = 'regexp',
	operator = 'operator'
}
```

<div class="anchorHolder"><a href="#semanticTokenModifiers" name="semanticTokenModifiers" class="linkableAnchor"></a></div>

```typescript
export enum SemanticTokenModifiers {
	declaration = 'declaration',
	definition = 'definition',
	readonly = 'readonly',
	static = 'static',
	deprecated = 'deprecated',
	abstract = 'abstract',
	async = 'async',
	modification = 'modification',
	documentation = 'documentation',
	defaultLibrary = 'defaultLibrary'
}
```

The protocol defines an additional token format capability to allow future extensions of the format. The only format that is currently specified is `relative` expressing that the tokens are described using relative positions (see Integer Encoding for Tokens below).

<div class="anchorHolder"><a href="#tokenFormat" name="tokenFormat" class="linkableAnchor"></a></div>

```typescript
export namespace TokenFormat {
	export const Relative: 'relative' = 'relative';
}

export type TokenFormat = 'relative';
```

_Integer Encoding for Tokens_

On the capability level types and modifiers are defined using strings. However the real encoding happens using numbers. The server therefore needs to let the client know which numbers it is using for which types and modifiers. They do so using a legend, which is defined as follows:

<div class="anchorHolder"><a href="#semanticTokensLegend" name="semanticTokensLegend" class="linkableAnchor"></a></div>

```typescript
export interface SemanticTokensLegend {
	/**
	 * The token types a server uses.
	 */
	tokenTypes: string[];

	/**
	 * The token modifiers a server uses.
	 */
	tokenModifiers: string[];
}
```

Token types are looked up by index, so a `tokenType` value of `1` means `tokenTypes[1]`. Since a token type can have n modifiers, multiple token modifiers can be set by using bit flags,
so a `tokenModifier` value of `3` is first viewed as binary `0b00000011`, which means `[tokenModifiers[0], tokenModifiers[1]]` because bits 0 and 1 are set.

There are different ways how the position of a token can be expressed in a file. Absolute positions or relative positions. The protocol for the token format `relative` uses relative positions, because most tokens remain stable relative to each other when edits are made in a file. This simplifies the computation of a delta if a server supports it. So each token is represented using 5 integers. A specific token `i` in the file consists of the following array indices:

- at index `5*i`   - `deltaLine`: token line number, relative to the previous token
- at index `5*i+1` - `deltaStart`: token start character, relative to the previous token (relative to 0 or the previous token's start if they are on the same line)
- at index `5*i+2` - `length`: the length of the token.
- at index `5*i+3` - `tokenType`: will be looked up in `SemanticTokensLegend.tokenTypes`. We currently ask that `tokenType` < 65536.
- at index `5*i+4` - `tokenModifiers`: each set bit will be looked up in `SemanticTokensLegend.tokenModifiers`

Whether a token can span multiple lines is defined by the client capability `multilineTokenSupport`. If multiline tokens are not supported and a tokens length takes it past the end of the line, it should be treated as if the token ends at the end of the line and will not wrap onto the next line.

The client capability `overlappingTokenSupport` defines whether tokens can overlap each other.

Lets look at a concrete example which uses single line tokens without overlaps for encoding a file with 3 tokens in a number array. We start with absolute positions to demonstrate how they can easily be transformed into relative positions:

```typescript
{ line: 2, startChar:  5, length: 3, tokenType: "property",
	tokenModifiers: ["private", "static"]
},
{ line: 2, startChar: 10, length: 4, tokenType: "type", tokenModifiers: [] },
{ line: 5, startChar:  2, length: 7, tokenType: "class", tokenModifiers: [] }
```

First of all, a legend must be devised. This legend must be provided up-front on registration and capture all possible token types and modifiers. For the example we use this legend:

```typescript
{
   tokenTypes: ['property', 'type', 'class'],
   tokenModifiers: ['private', 'static']
}
```

The first transformation step is to encode `tokenType` and `tokenModifiers` as integers using the legend. As said, token types are looked up by index, so a `tokenType` value of `1` means `tokenTypes[1]`. Multiple token modifiers can be set by using bit flags, so a `tokenModifier` value of `3` is first viewed as binary `0b00000011`, which means `[tokenModifiers[0], tokenModifiers[1]]` because bits 0 and 1 are set. Using this legend, the tokens now are:

```typescript
{ line: 2, startChar:  5, length: 3, tokenType: 0, tokenModifiers: 3 },
{ line: 2, startChar: 10, length: 4, tokenType: 1, tokenModifiers: 0 },
{ line: 5, startChar:  2, length: 7, tokenType: 2, tokenModifiers: 0 }
```

The next step is to represent each token relative to the previous token in the file. In this case, the second token is on the same line as the first token, so the `startChar` of the second token is made relative to the `startChar` of the first token, so it will be `10 - 5`. The third token is on a different line than the second token, so the `startChar` of the third token will not be altered:

```typescript
{ deltaLine: 2, deltaStartChar: 5, length: 3, tokenType: 0, tokenModifiers: 3 },
{ deltaLine: 0, deltaStartChar: 5, length: 4, tokenType: 1, tokenModifiers: 0 },
{ deltaLine: 3, deltaStartChar: 2, length: 7, tokenType: 2, tokenModifiers: 0 }
```

Finally, the last step is to inline each of the 5 fields for a token in a single array, which is a memory friendly representation:

```typescript
// 1st token,  2nd token,  3rd token
[  2,5,3,0,3,  0,5,4,1,0,  3,2,7,2,0 ]
```

Now assume that the user types a new empty line at the beginning of the file which results in the following tokens in the file:

```typescript
{ line: 3, startChar:  5, length: 3, tokenType: "property",
	tokenModifiers: ["private", "static"]
},
{ line: 3, startChar: 10, length: 4, tokenType: "type", tokenModifiers: [] },
{ line: 6, startChar:  2, length: 7, tokenType: "class", tokenModifiers: [] }
```

Running the same transformations as above will result in the following number array:

```typescript
// 1st token,  2nd token,  3rd token
[  3,5,3,0,3,  0,5,4,1,0,  3,2,7,2,0]
```

The delta is now expressed on these number arrays without any form of interpretation what these numbers mean. This is comparable to the text document edits send from the server to the client to modify the content of a file. Those are character based and don't make any assumption about the meaning of the characters. So `[  2,5,3,0,3,  0,5,4,1,0,  3,2,7,2,0 ]` can be transformed into `[  3,5,3,0,3,  0,5,4,1,0,  3,2,7,2,0]` using the following edit description: `{ start:  0, deleteCount: 1, data: [3] }` which tells the client to simply replace the first number (e.g. `2`) in the array with `3`.

Semantic token edits behave conceptually like [text edits](#textEditArray) on documents: if an edit description consists of n edits all n edits are based on the same state Sm of the number array. They will move the number array from state Sm to Sm+1. A client applying the edits must not assume that they are sorted. An easy algorithm to apply them to the number array is to sort the edits and apply them from the back to the front of the number array.

_Client Capability_:

The following client capabilities are defined for semantic token requests sent from the client to the server:

* property name (optional): `textDocument.semanticTokens`
* property type: `SemanticTokensClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#semanticTokensClientCapabilities" name="semanticTokensClientCapabilities" class="linkableAnchor"></a></div>

```typescript
interface SemanticTokensClientCapabilities {
	/**
	 * Whether implementation supports dynamic registration. If this is set to
	 * `true` the client supports the new `(TextDocumentRegistrationOptions &
	 * StaticRegistrationOptions)` return value for the corresponding server
	 * capability as well.
	 */
	dynamicRegistration?: boolean;

	/**
	 * Which requests the client supports and might send to the server
	 * depending on the server's capability. Please note that clients might not
	 * show semantic tokens or degrade some of the user experience if a range
	 * or full request is advertised by the client but not provided by the
	 * server. If for example the client capability `requests.full` and
	 * `request.range` are both set to true but the server only provides a
	 * range provider the client might not render a minimap correctly or might
	 * even decide to not show any semantic tokens at all.
	 */
	requests: {
		/**
		 * The client will send the `textDocument/semanticTokens/range` request
		 * if the server provides a corresponding handler.
		 */
		range?: boolean | {
		};

		/**
		 * The client will send the `textDocument/semanticTokens/full` request
		 * if the server provides a corresponding handler.
		 */
		full?: boolean | {
			/**
			 * The client will send the `textDocument/semanticTokens/full/delta`
			 * request if the server provides a corresponding handler.
			 */
			delta?: boolean;
		};
	};

	/**
	 * The token types that the client supports.
	 */
	tokenTypes: string[];

	/**
	 * The token modifiers that the client supports.
	 */
	tokenModifiers: string[];

	/**
	 * The formats the clients supports.
	 */
	formats: TokenFormat[];

	/**
	 * Whether the client supports tokens that can overlap each other.
	 */
	overlappingTokenSupport?: boolean;

	/**
	 * Whether the client supports tokens that can span multiple lines.
	 */
	multilineTokenSupport?: boolean;

	/**
	 * Whether the client allows the server to actively cancel a
	 * semantic token request, e.g. supports returning
	 * ErrorCodes.ServerCancelled. If a server does the client
	 * needs to retrigger the request.
	 *
	 * @since 3.17.0
	 */
	serverCancelSupport?: boolean;

	/**
	 * Whether the client uses semantic tokens to augment existing
	 * syntax tokens. If set to `true` client side created syntax
	 * tokens and semantic tokens are both used for colorization. If
	 * set to `false` the client only uses the returned semantic tokens
	 * for colorization.
	 *
	 * If the value is `undefined` then the client behavior is not
	 * specified.
	 *
	 * @since 3.17.0
	 */
	augmentsSyntaxTokens?: boolean;
}
```

_Server Capability_:

The following server capabilities are defined for semantic tokens:

* property name (optional): `semanticTokensProvider`
* property type: `SemanticTokensOptions | SemanticTokensRegistrationOptions` where `SemanticTokensOptions` is defined as follows:

<div class="anchorHolder"><a href="#semanticTokensOptions" name="semanticTokensOptions" class="linkableAnchor"></a></div>

```typescript
export interface SemanticTokensOptions extends WorkDoneProgressOptions {
	/**
	 * The legend used by the server
	 */
	legend: SemanticTokensLegend;

	/**
	 * Server supports providing semantic tokens for a specific range
	 * of a document.
	 */
	range?: boolean | {
	};

	/**
	 * Server supports providing semantic tokens for a full document.
	 */
	full?: boolean | {
		/**
		 * The server supports deltas for full documents.
		 */
		delta?: boolean;
	};
}
```

_Registration Options_: `SemanticTokensRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#semanticTokensRegistrationOptions" name="semanticTokensRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface SemanticTokensRegistrationOptions extends
	TextDocumentRegistrationOptions, SemanticTokensOptions,
	StaticRegistrationOptions {
}
```

Since the registration option handles range, full and delta requests the method used to register for semantic tokens requests is `textDocument/semanticTokens` and not one of the specific methods described below.

**Requesting semantic tokens for a whole file**

_Request_:

<div class="anchorHolder"><a href="#semanticTokens_fullRequest" name="semanticTokens_fullRequest" class="linkableAnchor"></a></div>

* method: `textDocument/semanticTokens/full`
* params: `SemanticTokensParams` defined as follows:

<div class="anchorHolder"><a href="#semanticTokensParams" name="semanticTokensParams" class="linkableAnchor"></a></div>

```typescript
export interface SemanticTokensParams extends WorkDoneProgressParams,
	PartialResultParams {
	/**
	 * The text document.
	 */
	textDocument: TextDocumentIdentifier;
}
```

_Response_:

* result: `SemanticTokens | null` where `SemanticTokens` is defined as follows:

<div class="anchorHolder"><a href="#semanticTokens" name="semanticTokens" class="linkableAnchor"></a></div>

```typescript
export interface SemanticTokens {
	/**
	 * An optional result id. If provided and clients support delta updating
	 * the client will include the result id in the next semantic token request.
	 * A server can then instead of computing all semantic tokens again simply
	 * send a delta.
	 */
	resultId?: string;

	/**
	 * The actual tokens.
	 */
	data: uinteger[];
}
```

* partial result: `SemanticTokensPartialResult` defines as follows:

<div class="anchorHolder"><a href="#semanticTokensPartialResult" name="semanticTokensPartialResult" class="linkableAnchor"></a></div>

```typescript
export interface SemanticTokensPartialResult {
	data: uinteger[];
}
```

* error: code and message set in case an exception happens during the 'textDocument/semanticTokens/full' request

**Requesting semantic token delta for a whole file**

_Request_:

<div class="anchorHolder"><a href="#semanticTokens_deltaRequest" name="semanticTokens_deltaRequest" class="linkableAnchor"></a></div>

* method: `textDocument/semanticTokens/full/delta`
* params: `SemanticTokensDeltaParams` defined as follows:

<div class="anchorHolder"><a href="#semanticTokensDeltaParams" name="semanticTokensDeltaParams" class="linkableAnchor"></a></div>

```typescript
export interface SemanticTokensDeltaParams extends WorkDoneProgressParams,
	PartialResultParams {
	/**
	 * The text document.
	 */
	textDocument: TextDocumentIdentifier;

	/**
	 * The result id of a previous response. The result Id can either point to
	 * a full response or a delta response depending on what was received last.
	 */
	previousResultId: string;
}
```

_Response_:

* result: `SemanticTokens | SemanticTokensDelta | null` where `SemanticTokensDelta` is defined as follows:

<div class="anchorHolder"><a href="#semanticTokensDelta" name="semanticTokensDelta" class="linkableAnchor"></a></div>

```typescript
export interface SemanticTokensDelta {
	readonly resultId?: string;
	/**
	 * The semantic token edits to transform a previous result into a new
	 * result.
	 */
	edits: SemanticTokensEdit[];
}
```

<div class="anchorHolder"><a href="#semanticTokensEdit" name="semanticTokensEdit" class="linkableAnchor"></a></div>

```typescript
export interface SemanticTokensEdit {
	/**
	 * The start offset of the edit.
	 */
	start: uinteger;

	/**
	 * The count of elements to remove.
	 */
	deleteCount: uinteger;

	/**
	 * The elements to insert.
	 */
	data?: uinteger[];
}
```

* partial result: `SemanticTokensDeltaPartialResult` defines as follows:

<div class="anchorHolder"><a href="#semanticTokensDeltaPartialResult" name="semanticTokensDeltaPartialResult" class="linkableAnchor"></a></div>

```typescript
export interface SemanticTokensDeltaPartialResult {
	edits: SemanticTokensEdit[];
}
```

* error: code and message set in case an exception happens during the 'textDocument/semanticTokens/full/delta' request

**Requesting semantic tokens for a range**

There are two uses cases where it can be beneficial to only compute semantic tokens for a visible range:

- for faster rendering of the tokens in the user interface when a user opens a file. In this use cases servers should also implement the `textDocument/semanticTokens/full` request as well to allow for flicker free scrolling and semantic coloring of a minimap.
- if computing semantic tokens for a full document is too expensive servers can only provide a range call. In this case the client might not render a minimap correctly or might even decide to not show any semantic tokens at all.

_Request_:

<div class="anchorHolder"><a href="#semanticTokens_rangeRequest" name="semanticTokens_rangeRequest" class="linkableAnchor"></a></div>

* method: `textDocument/semanticTokens/range`
* params: `SemanticTokensRangeParams` defined as follows:

<div class="anchorHolder"><a href="#semanticTokensRangeParams" name="semanticTokensRangeParams" class="linkableAnchor"></a></div>

```typescript
export interface SemanticTokensRangeParams extends WorkDoneProgressParams,
	PartialResultParams {
	/**
	 * The text document.
	 */
	textDocument: TextDocumentIdentifier;

	/**
	 * The range the semantic tokens are requested for.
	 */
	range: Range;
}
```

_Response_:

* result: `SemanticTokens | null`
* partial result: `SemanticTokensPartialResult`
* error: code and message set in case an exception happens during the 'textDocument/semanticTokens/range' request

**Requesting a refresh of all semantic tokens**

The `workspace/semanticTokens/refresh` request is sent from the server to the client. Servers can use it to ask clients to refresh the editors for which this server provides semantic tokens. As a result the client should ask the server to recompute the semantic tokens for these editors. This is useful if a server detects a project wide configuration change which requires a re-calculation of all semantic tokens. Note that the client still has the freedom to delay the re-calculation of the semantic tokens if for example an editor is currently not visible.

_Client Capability_:

* property name (optional): `workspace.semanticTokens`
* property type: `SemanticTokensWorkspaceClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#semanticTokensWorkspaceClientCapabilities" name="semanticTokensWorkspaceClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface SemanticTokensWorkspaceClientCapabilities {
	/**
	 * Whether the client implementation supports a refresh request sent from
	 * the server to the client.
	 *
	 * Note that this event is global and will force the client to refresh all
	 * semantic tokens currently shown. It should be used with absolute care
	 * and is useful for situation where a server for example detect a project
	 * wide change that requires such a calculation.
	 */
	refreshSupport?: boolean;
}
```

_Request_:

<div class="anchorHolder"><a href="#semanticTokens_refreshRequest" name="semanticTokens_refreshRequest" class="linkableAnchor"></a></div>

* method: `workspace/semanticTokens/refresh`
* params: none

_Response_:

* result: void
* error: code and message set in case an exception happens during the 'workspace/semanticTokens/refresh' request
