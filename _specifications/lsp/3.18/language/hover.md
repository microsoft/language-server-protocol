#### <a href="#textDocument_hover" name="textDocument_hover" class="anchor">Hover Request (:leftwards_arrow_with_hook:)</a>

The hover request is sent from the client to the server to request hover information at a given text document position.

_Client Capability_:
* property name (optional): `textDocument.hover`
* property type: `HoverClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#hoverClientCapabilities" name="hoverClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface HoverClientCapabilities {
	/**
	 * Whether hover supports dynamic registration.
	 */
	dynamicRegistration?: boolean;

	/**
	 * Client supports the follow content formats if the content
	 * property refers to a `literal of type MarkupContent`.
	 * The order describes the preferred format of the client.
	 */
	contentFormat?: MarkupKind[];
}
```

_Server Capability_:
* property name (optional): `hoverProvider`
* property type: `boolean | HoverOptions` where `HoverOptions` is defined as follows:

<div class="anchorHolder"><a href="#hoverOptions" name="hoverOptions" class="linkableAnchor"></a></div>

```typescript
export interface HoverOptions extends WorkDoneProgressOptions {
}
```

_Registration Options_: `HoverRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#hoverRegistrationOptions" name="hoverRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface HoverRegistrationOptions
	extends TextDocumentRegistrationOptions, HoverOptions {
}
```

_Request_:
* method: `textDocument/hover`
* params: `HoverParams` defined as follows:

<div class="anchorHolder"><a href="#hoverParams" name="hoverParams" class="linkableAnchor"></a></div>

```typescript
export interface HoverParams extends TextDocumentPositionParams,
	WorkDoneProgressParams {
}
```

_Response_:
* result: `Hover` \| `null` defined as follows:

<div class="anchorHolder"><a href="#hover" name="hover" class="linkableAnchor"></a></div>

```typescript
/**
 * The result of a hover request.
 */
export interface Hover {
	/**
	 * The hover's content
	 */
	contents: MarkedString | MarkedString[] | MarkupContent;

	/**
	 * An optional range is a range inside a text document
	 * that is used to visualize a hover, e.g. by changing the background color.
	 */
	range?: Range;
}
```

Where `MarkedString` is defined as follows:

<div class="anchorHolder"><a href="#markedString" name="markedString" class="linkableAnchor"></a></div>

```typescript
/**
 * MarkedString can be used to render human readable text. It is either a
 * markdown string or a code-block that provides a language and a code snippet.
 * The language identifier is semantically equal to the optional language
 * identifier in fenced code blocks in GitHub issues.
 *
 * The pair of a language and a value is an equivalent to markdown:
 * ```${language}
 * ${value}
 * ```
 *
 * Note that markdown strings will be sanitized - that means html will be
 * escaped.
 *
 * @deprecated use MarkupContent instead.
 */
type MarkedString = string | { language: string; value: string };
```

* error: code and message set in case an exception happens during the hover request.
