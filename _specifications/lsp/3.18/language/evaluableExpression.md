#### <a href="#textDocument_evaluableExpression" name="textDocument_evaluableExpression" class="anchor">Evaluable Expression Request (:leftwards_arrow_with_hook:)</a>

> *Since version 3.18.0*

The evaluable expression request is sent from the client to the server to return information about an expression that can be evaluated by a debugger to get the value of the item at a given location.

_Client Capability_:

* property name (optional): `textDocument.evaluableExpression`
* property type: `EvaluableExpressionClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#evaluableExpressionClientCapabilities" name="evaluableExpressionClientCapabilities" class="linkableAnchor"></a></div>

```typescript
interface EvaluableExpressionClientCapabilities {
	/**
	 * Whether implementation supports dynamic registration. If this is set to
	 * `true` the client supports the new `(TextDocumentRegistrationOptions &
	 * StaticRegistrationOptions)` return value for the corresponding server
	 * capability as well.
	 */
	dynamicRegistration?: boolean;
}
```

_Server Capability_:

* property name (optional): `evaluableExpressionProvider`
* property type: `boolean`, representing whether this server can resolve a selection to an evaluable expression

_Registration Options_: `EvaluableExpressionRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#evaluableExpressionRegistrationOptions" name="evaluableExpressionRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface EvaluableExpressionRegistrationOptions extends
	TextDocumentRegistrationOptions, StaticRegistrationOptions {
}
```

_Request_:

* method: `textDocument/evaluableExpression`
* params: `EvaluableExpressionParams` defined as follows:

<div class="anchorHolder"><a href="#evaluableExpressionParams" name="evaluableExpressionParams" class="linkableAnchor"></a></div>

```typescript
export interface EvaluableExpressionParams extends TextDocumentPositionParams,
	WorkDoneProgressParams {
}
```

_Response_:

* result: `EvaluableExpressionResult | null` defined as follows:

<div class="anchorHolder"><a href="#EvaluableExpressionResult" name="EvaluableExpressionResult" class="linkableAnchor"></a></div>

```typescript
export interface EvaluableExpressionResult {
	/**
	 * The expression that can be passed to a debugger for evaluation. The expression does not have to match the exact
	 * document extract and can be reworked; for example to improve formatting or optimize the evaluation.
	 */
	expression: string;

	/**
	 * The range enclosing this expression not including leading/trailing whitespace
	 * but everything else, e.g. comments and code.
	 */
	range: Range;
}
```

* error: code and message set in case an exception happens during the 'textDocument/evaluatableExpression' request
