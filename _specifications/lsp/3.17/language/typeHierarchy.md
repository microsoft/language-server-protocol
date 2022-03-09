
#### <a href="#textDocument_prepareTypeHierarchy" name="textDocument_prepareTypeHierarchy" class="anchor">Prepare Type Hierarchy Request (:leftwards_arrow_with_hook:)</a>

> *Since version 3.17.0*

The type hierarchy request is sent from the client to the server to return a type hierarchy for the language element of given text document positions. Will return `null` if the server couldn't infer a valid type from the position. The type hierarchy requests are executed in two steps:

  1. first a type hierarchy item is prepared for the given text document position.
  1. for a type hierarchy item the supertype or subtype type hierarchy items are resolved.

_Client Capability_:

* property name (optional): `textDocument.typeHierarchy`
* property type: `TypeHierarchyClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#typeHierarchyClientCapabilities" name="typeHierarchyClientCapabilities" class="linkableAnchor"></a></div>

```typescript
type TypeHierarchyClientCapabilities = {
	/**
	 * Whether implementation supports dynamic registration. If this is set to
	 * `true` the client supports the new `(TextDocumentRegistrationOptions &
	 * StaticRegistrationOptions)` return value for the corresponding server
	 * capability as well.
	 */
	dynamicRegistration?: boolean;
};
```

_Server Capability_:

* property name (optional): `typeHierarchyProvider`
* property type: `boolean | TypeHierarchyOptions | TypeHierarchyRegistrationOptions` where `TypeHierarchyOptions` is defined as follows:

<div class="anchorHolder"><a href="#typeHierarchyOptions" name="typeHierarchyOptions" class="linkableAnchor"></a></div>

```typescript
export type TypeHierarchyOptions = WorkDoneProgressOptions;
```

_Registration Options_: `TypeHierarchyRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#typeHierarchyRegistrationOptions" name="typeHierarchyRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export type TypeHierarchyRegistrationOptions =
	TextDocumentRegistrationOptions & TypeHierarchyOptions &
	StaticRegistrationOptions;
```

_Request_:

* method: 'textDocument/prepareTypeHierarchy'
* params: `TypeHierarchyPrepareParams` defined as follows:

<div class="anchorHolder"><a href="#typeHierarchyPrepareParams" name="typeHierarchyPrepareParams" class="linkableAnchor"></a></div>

```typescript
export type TypeHierarchyPrepareParams = TextDocumentPositionParams &
	WorkDoneProgressParams;
```

_Response_:

* result: `TypeHierarchyItem[] | null` defined as follows:

<div class="anchorHolder"><a href="#typeHierarchyItem" name="typeHierarchyItem" class="linkableAnchor"></a></div>

```typescript
export type TypeHierarchyItem = {
	/**
	 * The name of this item.
	 */
	name: string;

	/**
	 * The kind of this item.
	 */
	kind: SymbolKind;

	/**
	 * Tags for this item.
	 */
	tags?: SymbolTag[];

	/**
	 * More detail for this item, e.g. the signature of a function.
	 */
	detail?: string;

	/**
	 * The resource identifier of this item.
	 */
	uri: DocumentUri;

	/**
	 * The range enclosing this symbol not including leading/trailing whitespace
	 * but everything else, e.g. comments and code.
	 */
	range: Range;

	/**
	 * The range that should be selected and revealed when this symbol is being
	 * picked, e.g. the name of a function. Must be contained by the
	 * [`range`](#TypeHierarchyItem.range).
	 */
	selectionRange: Range;

	/**
	 * A data entry field that is preserved between a type hierarchy prepare and
	 * supertypes or subtypes requests. It could also be used to identify the
	 * type hierarchy in the server, helping improve the performance on
	 * resolving supertypes and subtypes.
	 */
	data?: LSPAny;
};
```

* error: code and message set in case an exception happens during the 'textDocument/prepareTypeHierarchy' request

#### <a href="#typeHierarchy_supertypes" name="typeHierarchy_supertypes" class="anchor">Type Hierarchy Supertypes(:leftwards_arrow_with_hook:)</a>

> *Since version 3.17.0*

The request is sent from the client to the server to resolve the supertypes for a given type hierarchy item. Will return `null` if the server couldn't infer a valid type from `item` in the params. The request doesn't define its own client and server capabilities. It is only issued if a server registers for the [`textDocument/prepareTypeHierarchy` request](#textDocument_prepareTypeHierarchy).

_Request_:

* method: 'typeHierarchy/supertypes'
* params: `TypeHierarchySupertypesParams` defined as follows:

<div class="anchorHolder"><a href="#typeHierarchySupertypesParams" name="typeHierarchySupertypesParams" class="linkableAnchor"></a></div>

```typescript
export type TypeHierarchySupertypesParams =
	WorkDoneProgressParams & PartialResultParams & {
	item: TypeHierarchyItem;
};
```
_Response_:

* result: `TypeHierarchyItem[] | null`
* partial result: `TypeHierarchyItem[]`
* error: code and message set in case an exception happens during the 'typeHierarchy/supertypes' request

#### <a href="#typeHierarchy_subtypes" name="typeHierarchy_subtypes" class="anchor">Type Hierarchy Subtypes(:leftwards_arrow_with_hook:)</a>

> *Since version 3.17.0*

The request is sent from the client to the server to resolve the subtypes for a given type hierarchy item. Will return `null` if the server couldn't infer a valid type from `item` in the params. The request doesn't define its own client and server capabilities. It is only issued if a server registers for the [`textDocument/prepareTypeHierarchy` request](#textDocument_prepareTypeHierarchy).

_Request_:

* method: 'typeHierarchy/subtypes'
* params: `TypeHierarchySubtypesParams` defined as follows:

<div class="anchorHolder"><a href="#typeHierarchySubtypesParams" name="typeHierarchySubtypesParams" class="linkableAnchor"></a></div>

```typescript
export type TypeHierarchySubtypesParams =
	WorkDoneProgressParams & PartialResultParams & {
	item: TypeHierarchyItem;
};
```
_Response_:

* result: `TypeHierarchyItem[] | null`
* partial result: `TypeHierarchyItem[]`
* error: code and message set in case an exception happens during the 'typeHierarchy/subtypes' request


<!--- linable types addition

  - type: 'TypeHierarchyClientCapabilities'
    link: '#typeHierarchyClientCapabilities'
  - type: 'TypeHierarchyOptions'
    link: '#typeHierarchyOptions'
  - type: 'TypeHierarchyRegistrationOptions'
    link: '#typeHierarchyRegistrationOptions'
  - type: 'TypeHierarchyPrepareParams'
    link: '#typeHierarchyPrepareParams'
  - type: 'TypeHierarchyItem'
    link: '#typeHierarchyItem'
  - type: 'TypeHierarchySupertypesParams'
    link: '#typeHierarchySupertypesParams'
  - type: 'TypeHierarchySubtypesParams'
    link: '#typeHierarchySubtypesParams'

--->