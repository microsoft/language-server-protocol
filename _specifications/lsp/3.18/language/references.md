#### <a href="#textDocument_references" name="textDocument_references" class="anchor">Find References Request (:leftwards_arrow_with_hook:)</a>

The references request is sent from the client to the server to resolve project-wide references for the symbol denoted by the given text document position.

_Client Capability_:
* property name (optional): `textDocument.references`
* property type: `ReferenceClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#referenceClientCapabilities" name="referenceClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface ReferenceClientCapabilities {
	/**
	 * Whether references supports dynamic registration.
	 */
	dynamicRegistration?: boolean;
}
```

_Server Capability_:
* property name (optional): `referencesProvider`
* property type: `boolean | ReferenceOptions` where `ReferenceOptions` is defined as follows:

<div class="anchorHolder"><a href="#referenceOptions" name="referenceOptions" class="linkableAnchor"></a></div>

```typescript
export interface ReferenceOptions extends WorkDoneProgressOptions {
}
```

_Registration Options_: `ReferenceRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#referenceRegistrationOptions" name="referenceRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface ReferenceRegistrationOptions extends
	TextDocumentRegistrationOptions, ReferenceOptions {
}
```

_Request_:
* method: `textDocument/references`
* params: `ReferenceParams` defined as follows:

<div class="anchorHolder"><a href="#referenceParams" name="referenceParams" class="linkableAnchor"></a></div>

```typescript
export namespace ReferenceKind {
	/**
	 * Statement with l-value usage of the selected variable.
	 */
	export const Write = 1;
	/**
	 * Statement with r-value usage of the selected variable.
	 */
	export const Read = 2;
	/**
	 * Location that constructs a variable of the selected type.
	 */
	export const Type = 3;
	/**
	 * Location with super-type of the selected type.
	 */
	export const SuperType = 4;
	/**
	 * Location with sub-type of the selected type.
	 */
	export const SubType = 5;
	/**
	 * Expression that converts a value to the selected type.
	 * For example, in Go, 'writer = file' might implicitly convert
	 * an *os.File to an io.Writer.
	 */
	export const TypeConversion = 6;
	/**
	 * Implicit reference to the selected identifier.
	 * For example, in C++, 'Point2D {1, 2}' is shorthand to
	 * initialize the public fields X and Y, and it might be useful to
	 * highlight it when finding references to X or Y.
	 */
	export const Implicit = 7;
	/**
	 * Free variable of the selected code block.
	 * A variable is "free" if it is referenced from within the
	 * selected code block but defined outside of it.
	 */
	export const FreeVariable = 8;
	/**
	 * Function declaration (including anonymous lambdas) that
	 * satisfies a particular function type (and vice versa).
	 */
	export const FunctionDeclaration = 9;
	/**
	 * Argument expression that assigns the selected parameter.
	 * For example, in Go, a query on y 'func f(x, y int)' might
	 * report the expression 456 in the call f(123, 456).
	 */
	export const ArgumentExpression = 10;
}

export type ReferenceKind = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
```

```typescript
export interface ReferenceParams extends TextDocumentPositionParams,
	WorkDoneProgressParams, PartialResultParams {
	context: ReferenceContext;
	/**
	 * The requested reference kinds to filter by.
	 * Clients may send an empty array to request all kinds of references.
	 */
	referenceKind?: ReferenceKind[];
}
```

<div class="anchorHolder"><a href="#referenceContext" name="referenceContext" class="linkableAnchor"></a></div>

```typescript
export interface ReferenceContext {
	/**
	 * Include the declaration of the current symbol.
	 */
	includeDeclaration: boolean;
}
```
_Response_:
* result: [`Reference`](#reference)[] \| `null`
* partial result: [`Reference`](#reference)[]
* error: code and message set in case an exception happens during the reference request.
