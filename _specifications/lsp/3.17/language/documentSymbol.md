#### <a href="#textDocument_documentSymbol" name="textDocument_documentSymbol" class="anchor">Document Symbols Request (:leftwards_arrow_with_hook:)</a>

The document symbol request is sent from the client to the server. The returned result is either

- `SymbolInformation[]` which is a flat list of all symbols found in a given text document. Then neither the symbol's location range nor the symbol's container name should be used to infer a hierarchy.
- `DocumentSymbol[]` which is a hierarchy of symbols found in a given text document.

Servers should whenever possible return `DocumentSymbol` since it is the richer data structure.

_Client Capability_:
* property name (optional): `textDocument.documentSymbol`
* property type: `DocumentSymbolClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#documentSymbolClientCapabilities" name="documentSymbolClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface DocumentSymbolClientCapabilities {
	/**
	 * Whether document symbol supports dynamic registration.
	 */
	dynamicRegistration?: boolean;

	/**
	 * Specific capabilities for the `SymbolKind` in the
	 * `textDocument/documentSymbol` request.
	 */
	symbolKind?: {
		/**
		 * The symbol kind values the client supports. When this
		 * property exists the client also guarantees that it will
		 * handle values outside its set gracefully and falls back
		 * to a default value when unknown.
		 *
		 * If this property is not present the client only supports
		 * the symbol kinds from `File` to `Array` as defined in
		 * the initial version of the protocol.
		 */
		valueSet?: SymbolKind[];
	};

	/**
	 * The client supports hierarchical document symbols.
	 */
	hierarchicalDocumentSymbolSupport?: boolean;

	/**
	 * The client supports tags on `SymbolInformation`. Tags are supported on
	 * `DocumentSymbol` if `hierarchicalDocumentSymbolSupport` is set to true.
	 * Clients supporting tags have to handle unknown tags gracefully.
	 *
	 * @since 3.16.0
	 */
	tagSupport?: {
		/**
		 * The tags supported by the client.
		 */
		valueSet: SymbolTag[];
	};

	/**
	 * The client supports an additional label presented in the UI when
	 * registering a document symbol provider.
	 *
	 * @since 3.16.0
	 */
	labelSupport?: boolean;
}
```

_Server Capability_:
* property name (optional): `documentSymbolProvider`
* property type: `boolean | DocumentSymbolOptions` where `DocumentSymbolOptions` is defined as follows:

<div class="anchorHolder"><a href="#documentSymbolOptions" name="documentSymbolOptions" class="linkableAnchor"></a></div>

```typescript
export interface DocumentSymbolOptions extends WorkDoneProgressOptions {
	/**
	 * A human-readable string that is shown when multiple outlines trees
	 * are shown for the same document.
	 *
	 * @since 3.16.0
	 */
	label?: string;
}
```

_Registration Options_: `DocumentSymbolRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#documentSymbolRegistrationOptions" name="documentSymbolRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface DocumentSymbolRegistrationOptions extends
	TextDocumentRegistrationOptions, DocumentSymbolOptions {
}
```

_Request_:
* method: `textDocument/documentSymbol`
* params: `DocumentSymbolParams` defined as follows:

<div class="anchorHolder"><a href="#documentSymbolParams" name="documentSymbolParams" class="linkableAnchor"></a></div>

```typescript
export interface DocumentSymbolParams extends WorkDoneProgressParams,
	PartialResultParams {
	/**
	 * The text document.
	 */
	textDocument: TextDocumentIdentifier;
}
```

_Response_:
* result: `DocumentSymbol[]` \| `SymbolInformation[]` \| `null` defined as follows:

<div class="anchorHolder"><a href="#symbolKind" name="symbolKind" class="linkableAnchor"></a></div>

```typescript
/**
 * A symbol kind.
 */
export namespace SymbolKind {
	export const File = 1;
	export const Module = 2;
	export const Namespace = 3;
	export const Package = 4;
	export const Class = 5;
	export const Method = 6;
	export const Property = 7;
	export const Field = 8;
	export const Constructor = 9;
	export const Enum = 10;
	export const Interface = 11;
	export const Function = 12;
	export const Variable = 13;
	export const Constant = 14;
	export const String = 15;
	export const Number = 16;
	export const Boolean = 17;
	export const Array = 18;
	export const Object = 19;
	export const Key = 20;
	export const Null = 21;
	export const EnumMember = 22;
	export const Struct = 23;
	export const Event = 24;
	export const Operator = 25;
	export const TypeParameter = 26;
}
```

<div class="anchorHolder"><a href="#symbolTag" name="symbolTag" class="linkableAnchor"></a></div>

```typescript
/**
 * Symbol tags are extra annotations that tweak the rendering of a symbol.
 *
 * @since 3.16
 */
export namespace SymbolTag {

	/**
	 * Render a symbol as obsolete, usually using a strike-out.
	 */
	export const Deprecated: 1 = 1;
}

export type SymbolTag = 1;
```

<div class="anchorHolder"><a href="#documentSymbol" name="documentSymbol" class="linkableAnchor"></a></div>

```typescript
/**
 * Represents programming constructs like variables, classes, interfaces etc.
 * that appear in a document. Document symbols can be hierarchical and they
 * have two ranges: one that encloses its definition and one that points to its
 * most interesting range, e.g. the range of an identifier.
 */
export interface DocumentSymbol {

	/**
	 * The name of this symbol. Will be displayed in the user interface and
	 * therefore must not be an empty string or a string only consisting of
	 * white spaces.
	 */
	name: string;

	/**
	 * More detail for this symbol, e.g the signature of a function.
	 */
	detail?: string;

	/**
	 * The kind of this symbol.
	 */
	kind: SymbolKind;

	/**
	 * Tags for this document symbol.
	 *
	 * @since 3.16.0
	 */
	tags?: SymbolTag[];

	/**
	 * Indicates if this symbol is deprecated.
	 *
	 * @deprecated Use tags instead
	 */
	deprecated?: boolean;

	/**
	 * The range enclosing this symbol not including leading/trailing whitespace
	 * but everything else like comments. This information is typically used to
	 * determine if the clients cursor is inside the symbol to reveal in the
	 * symbol in the UI.
	 */
	range: Range;

	/**
	 * The range that should be selected and revealed when this symbol is being
	 * picked, e.g. the name of a function. Must be contained by the `range`.
	 */
	selectionRange: Range;

	/**
	 * Children of this symbol, e.g. properties of a class.
	 */
	children?: DocumentSymbol[];
}
```

<div class="anchorHolder"><a href="#symbolInformation" name="symbolInformation" class="linkableAnchor"></a></div>

```typescript
/**
 * Represents information about programming constructs like variables, classes,
 * interfaces etc.
 *
 * @deprecated use DocumentSymbol or WorkspaceSymbol instead.
 */
export interface SymbolInformation {
	/**
	 * The name of this symbol.
	 */
	name: string;

	/**
	 * The kind of this symbol.
	 */
	kind: SymbolKind;

	/**
	 * Tags for this symbol.
	 *
	 * @since 3.16.0
	 */
	tags?: SymbolTag[];

	/**
	 * Indicates if this symbol is deprecated.
	 *
	 * @deprecated Use tags instead
	 */
	deprecated?: boolean;

	/**
	 * The location of this symbol. The location's range is used by a tool
	 * to reveal the location in the editor. If the symbol is selected in the
	 * tool the range's start information is used to position the cursor. So
	 * the range usually spans more then the actual symbol's name and does
	 * normally include things like visibility modifiers.
	 *
	 * The range doesn't have to denote a node range in the sense of a abstract
	 * syntax tree. It can therefore not be used to re-construct a hierarchy of
	 * the symbols.
	 */
	location: Location;

	/**
	 * The name of the symbol containing this symbol. This information is for
	 * user interface purposes (e.g. to render a qualifier in the user interface
	 * if necessary). It can't be used to re-infer a hierarchy for the document
	 * symbols.
	 */
	containerName?: string;
}
```

* partial result: `DocumentSymbol[]` \| `SymbolInformation[]`. `DocumentSymbol[]` and `SymbolInformation[]` can not be mixed. That means the first chunk defines the type of all the other chunks.
* error: code and message set in case an exception happens during the document symbol request.
