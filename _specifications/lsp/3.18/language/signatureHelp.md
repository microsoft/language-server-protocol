#### <a href="#textDocument_signatureHelp" name="textDocument_signatureHelp" class="anchor">Signature Help Request (:leftwards_arrow_with_hook:)</a>

The signature help request is sent from the client to the server to request signature information at a given cursor position.

_Client Capability_:
* property name (optional): `textDocument.signatureHelp`
* property type: `SignatureHelpClientCapabilities` defined as follows:

<div class="anchorHolder"><a href="#signatureHelpClientCapabilities" name="signatureHelpClientCapabilities" class="linkableAnchor"></a></div>

```typescript
export interface SignatureHelpClientCapabilities {
	/**
	 * Whether signature help supports dynamic registration.
	 */
	dynamicRegistration?: boolean;

	/**
	 * The client supports the following `SignatureInformation`
	 * specific properties.
	 */
	signatureInformation?: {
		/**
		 * Client supports the follow content formats for the documentation
		 * property. The order describes the preferred format of the client.
		 */
		documentationFormat?: MarkupKind[];

		/**
		 * Client capabilities specific to parameter information.
		 */
		parameterInformation?: {
			/**
			 * The client supports processing label offsets instead of a
			 * simple label string.
			 *
			 * @since 3.14.0
			 */
			labelOffsetSupport?: boolean;
		};

		/**
		 * The client supports the `activeParameter` property on
		 * `SignatureInformation` literal.
		 *
		 * @since 3.16.0
		 */
		activeParameterSupport?: boolean;
	};

	/**
	 * The client supports to send additional context information for a
	 * `textDocument/signatureHelp` request. A client that opts into
	 * contextSupport will also support the `retriggerCharacters` on
	 * `SignatureHelpOptions`.
	 *
	 * @since 3.15.0
	 */
	contextSupport?: boolean;
}
```

_Server Capability_:
* property name (optional): `signatureHelpProvider`
* property type: `SignatureHelpOptions` defined as follows:

<div class="anchorHolder"><a href="#signatureHelpOptions" name="signatureHelpOptions" class="linkableAnchor"></a></div>

```typescript
export interface SignatureHelpOptions extends WorkDoneProgressOptions {
	/**
	 * The characters that trigger signature help
	 * automatically.
	 */
	triggerCharacters?: string[];

	/**
	 * List of characters that re-trigger signature help.
	 *
	 * These trigger characters are only active when signature help is already
	 * showing. All trigger characters are also counted as re-trigger
	 * characters.
	 *
	 * @since 3.15.0
	 */
	retriggerCharacters?: string[];
}
```

_Registration Options_: `SignatureHelpRegistrationOptions` defined as follows:

<div class="anchorHolder"><a href="#signatureHelpRegistrationOptions" name="signatureHelpRegistrationOptions" class="linkableAnchor"></a></div>

```typescript
export interface SignatureHelpRegistrationOptions
	extends TextDocumentRegistrationOptions, SignatureHelpOptions {
}
```

_Request_:
* method: `textDocument/signatureHelp`
* params: `SignatureHelpParams` defined as follows:

<div class="anchorHolder"><a href="#signatureHelpParams" name="signatureHelpParams" class="linkableAnchor"></a></div>

```typescript
export interface SignatureHelpParams extends TextDocumentPositionParams,
	WorkDoneProgressParams {
	/**
	 * The signature help context. This is only available if the client
	 * specifies to send this using the client capability
	 * `textDocument.signatureHelp.contextSupport === true`
	 *
	 * @since 3.15.0
	 */
	context?: SignatureHelpContext;
}
```

<div class="anchorHolder"><a href="#signatureHelpTriggerKind" name="signatureHelpTriggerKind" class="linkableAnchor"></a></div>

```typescript
/**
 * How a signature help was triggered.
 *
 * @since 3.15.0
 */
export namespace SignatureHelpTriggerKind {
	/**
	 * Signature help was invoked manually by the user or by a command.
	 */
	export const Invoked: 1 = 1;
	/**
	 * Signature help was triggered by a trigger character.
	 */
	export const TriggerCharacter: 2 = 2;
	/**
	 * Signature help was triggered by the cursor moving or by the document
	 * content changing.
	 */
	export const ContentChange: 3 = 3;
}
export type SignatureHelpTriggerKind = 1 | 2 | 3;
```

<div class="anchorHolder"><a href="#signatureHelpContext" name="signatureHelpContext" class="linkableAnchor"></a></div>

```typescript
/**
 * Additional information about the context in which a signature help request
 * was triggered.
 *
 * @since 3.15.0
 */
export interface SignatureHelpContext {
	/**
	 * Action that caused signature help to be triggered.
	 */
	triggerKind: SignatureHelpTriggerKind;

	/**
	 * Character that caused signature help to be triggered.
	 *
	 * This is undefined when triggerKind !==
	 * SignatureHelpTriggerKind.TriggerCharacter
	 */
	triggerCharacter?: string;

	/**
	 * `true` if signature help was already showing when it was triggered.
	 *
	 * Retriggers occur when the signature help is already active and can be
	 * caused by actions such as typing a trigger character, a cursor move, or
	 * document content changes.
	 */
	isRetrigger: boolean;

	/**
	 * The currently active `SignatureHelp`.
	 *
	 * The `activeSignatureHelp` has its `SignatureHelp.activeSignature` field
	 * updated based on the user navigating through available signatures.
	 */
	activeSignatureHelp?: SignatureHelp;
}
```

_Response_:
* result: `SignatureHelp` \| `null` defined as follows:

<div class="anchorHolder"><a href="#signatureHelp" name="signatureHelp" class="linkableAnchor"></a></div>

```typescript
/**
 * Signature help represents the signature of something
 * callable. There can be multiple signature but only one
 * active and only one active parameter.
 */
export interface SignatureHelp {
	/**
	 * One or more signatures. If no signatures are available the signature help
	 * request should return `null`.
	 */
	signatures: SignatureInformation[];

	/**
	 * The active signature. If omitted or the value lies outside the
	 * range of `signatures` the value defaults to zero or is ignore if
	 * the `SignatureHelp` as no signatures.
	 *
	 * Whenever possible implementors should make an active decision about
	 * the active signature and shouldn't rely on a default value.
	 *
	 * In future version of the protocol this property might become
	 * mandatory to better express this.
	 */
	activeSignature?: uinteger;

	/**
	 * The active parameter of the active signature. If omitted or the value
	 * lies outside the range of `signatures[activeSignature].parameters`
	 * defaults to 0 if the active signature has parameters. If
	 * the active signature has no parameters it is ignored.
	 * In future version of the protocol this property might become
	 * mandatory to better express the active parameter if the
	 * active signature does have any.
	 */
	activeParameter?: uinteger;
}
```

<div class="anchorHolder"><a href="#signatureInformation" name="signatureInformation" class="linkableAnchor"></a></div>

```typescript
/**
 * Represents the signature of something callable. A signature
 * can have a label, like a function-name, a doc-comment, and
 * a set of parameters.
 */
export interface SignatureInformation {
	/**
	 * The label of this signature. Will be shown in
	 * the UI.
	 */
	label: string;

	/**
	 * The human-readable doc-comment of this signature. Will be shown
	 * in the UI but can be omitted.
	 */
	documentation?: string | MarkupContent;

	/**
	 * The parameters of this signature.
	 */
	parameters?: ParameterInformation[];

	/**
	 * The index of the active parameter.
	 *
	 * If provided, this is used in place of `SignatureHelp.activeParameter`.
	 *
	 * @since 3.16.0
	 */
	activeParameter?: uinteger;
}
```

<div class="anchorHolder"><a href="#parameterInformation" name="parameterInformation" class="linkableAnchor"></a></div>

```typescript
/**
 * Represents a parameter of a callable-signature. A parameter can
 * have a label and a doc-comment.
 */
export interface ParameterInformation {

	/**
	 * The label of this parameter information.
	 *
	 * Either a string or an inclusive start and exclusive end offsets within
	 * its containing signature label. (see SignatureInformation.label). The
	 * offsets are based on a UTF-16 string representation as `Position` and
	 * `Range` does.
	 *
	 * *Note*: a label of type string should be a substring of its containing
	 * signature label. Its intended use case is to highlight the parameter
	 * label part in the `SignatureInformation.label`.
	 */
	label: string | [uinteger, uinteger];

	/**
	 * The human-readable doc-comment of this parameter. Will be shown
	 * in the UI but can be omitted.
	 */
	documentation?: string | MarkupContent;
}
```

* error: code and message set in case an exception happens during the signature help request.
