#### <a href="#workDoneProgress" name="workDoneProgress" class="anchor"> Work Done Progress </a>

> *Since version 3.15.0*

Work done progress is reported using the generic [`$/progress`](#progress) notification. The value payload of a work done progress notification can be of three different forms.

##### <a href="#workDoneProgressBegin" name="workDoneProgressBegin" class="anchor"> Work Done Progress Begin </a>

To start progress reporting a `$/progress` notification with the following payload must be sent:

```typescript
export interface WorkDoneProgressBegin {

	kind: 'begin';

	/**
	 * Mandatory title of the progress operation. Used to briefly inform about
	 * the kind of operation being performed.
	 *
	 * Examples: "Indexing" or "Linking dependencies".
	 */
	title: string;

	/**
	 * Controls if a cancel button should show to allow the user to cancel the
	 * long running operation. Clients that don't support cancellation are
	 * allowed to ignore the setting.
	 */
	cancellable?: boolean;

	/**
	 * Optional, more detailed associated progress message. Contains
	 * complementary information to the `title`.
	 *
	 * Examples: "3/25 files", "project/src/module2", "node_modules/some_dep".
	 * If unset, the previous progress message (if any) is still valid.
	 */
	message?: string;

	/**
	 * Optional progress percentage to display (value 100 is considered 100%).
	 * If not provided infinite progress is assumed and clients are allowed
	 * to ignore the `percentage` value in subsequent in report notifications.
	 *
	 * The value should be steadily rising. Clients are free to ignore values
	 * that are not following this rule. The value range is [0, 100]
	 */
	percentage?: uinteger;
}
```

##### <a href="#workDoneProgressReport" name="workDoneProgressReport" class="anchor"> Work Done Progress Report </a>

Reporting progress is done using the following payload:

```typescript
export interface WorkDoneProgressReport {

	kind: 'report';

	/**
	 * Controls enablement state of a cancel button. This property is only valid
	 * if a cancel button got requested in the `WorkDoneProgressBegin` payload.
	 *
	 * Clients that don't support cancellation or don't support control the
	 * button's enablement state are allowed to ignore the setting.
	 */
	cancellable?: boolean;

	/**
	 * Optional, more detailed associated progress message. Contains
	 * complementary information to the `title`.
	 *
	 * Examples: "3/25 files", "project/src/module2", "node_modules/some_dep".
	 * If unset, the previous progress message (if any) is still valid.
	 */
	message?: string;

	/**
	 * Optional progress percentage to display (value 100 is considered 100%).
	 * If not provided infinite progress is assumed and clients are allowed
	 * to ignore the `percentage` value in subsequent in report notifications.
	 *
	 * The value should be steadily rising. Clients are free to ignore values
	 * that are not following this rule. The value range is [0, 100]
	 */
	percentage?: uinteger;
}
```

##### <a href="#workDoneProgressEnd" name="workDoneProgressEnd" class="anchor"> Work Done Progress End </a>

Signaling the end of a progress reporting is done using the following payload:

```typescript
export interface WorkDoneProgressEnd {

	kind: 'end';

	/**
	 * Optional, a final message indicating to for example indicate the outcome
	 * of the operation.
	 */
	message?: string;
}
```

##### <a href="#initiatingWorkDoneProgress" name="initiatingWorkDoneProgress" class="anchor"> Initiating Work Done Progress </a>

Work Done progress can be initiated in two different ways:

1. by the sender of a request (mostly clients) using the predefined `workDoneToken` property in the requests parameter literal. The document will refer to this kind of progress as client initiated progress.
1. by a server using the request `window/workDoneProgress/create`. The document will refer to this kind of progress as server initiated progress.

###### <a href="#clientInitiatedProgress" name="clientInitiatedProgress" class="anchor">Client Initiated Progress </a>

Consider a client sending a `textDocument/reference` request to a server and the client accepts work done progress reporting on that request. To signal this to the server the client would add a `workDoneToken` property to the reference request parameters. Something like this:

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
	"workDoneToken": "1d546990-40a3-4b77-b134-46622995f6ae"
}
```

The corresponding type definition for the parameter property looks like this:


<div class="anchorHolder"><a href="#workDoneProgressParams" name="workDoneProgressParams" class="linkableAnchor"></a></div>

```typescript
export interface WorkDoneProgressParams {
	/**
	 * An optional token that a server can use to report work done progress.
	 */
	workDoneToken?: ProgressToken;
}
```

A server uses the `workDoneToken` to report progress for the specific `textDocument/reference`. For the above request the `$/progress` notification params look like this:

```json
{
	"token": "1d546990-40a3-4b77-b134-46622995f6ae",
	"value": {
		"kind": "begin",
		"title": "Finding references for A#foo",
		"cancellable": false,
		"message": "Processing file X.ts",
		"percentage": 0
	}
}
```

The token received via the `workDoneToken` property in a request's param literal is only valid as long as the request has not send a response back.

There is no specific client capability signaling whether a client will send a progress token per request. The reason for this is that this is in many clients not a static aspect and might even change for every request instance for the same request type. So the capability is signal on every request instance by the presence of a `workDoneToken` property.

To avoid that clients set up a progress monitor user interface before sending a request but the server doesn't actually report any progress a server needs to signal general work done progress reporting support in the corresponding server capability. For the above find references example a server would signal such a support by setting the `referencesProvider` property in the server capabilities as follows:

```json
{
	"referencesProvider": {
		"workDoneProgress": true
	}
}
```

The corresponding type definition for the server capability looks like this:

<div class="anchorHolder"><a href="#workDoneProgressOptions" name="workDoneProgressOptions" class="linkableAnchor"></a></div>

```typescript
export interface WorkDoneProgressOptions {
	workDoneProgress?: boolean;
}
```
###### <a href="#serverInitiatedProgress" name="serverInitiatedProgress" class="anchor">Server Initiated Progress </a>

Servers can also initiate progress reporting using the `window/workDoneProgress/create` request. This is useful if the server needs to report progress outside of a request (for example the server needs to re-index a database). The token can then be used to report progress using the same notifications used as for client initiated progress. The token provided in the create request should only be used once (e.g. only one begin, many report and one end notification should be sent to it).

To keep the protocol backwards compatible servers are only allowed to use `window/workDoneProgress/create` request if the client signals corresponding support using the client capability `window.workDoneProgress` which is defined as follows:

```typescript
	/**
	 * Window specific client capabilities.
	 */
	window?: {
		/**
		 * Whether client supports server initiated progress using the
		 * `window/workDoneProgress/create` request.
		 */
		workDoneProgress?: boolean;
	};
```