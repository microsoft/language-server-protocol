# How to Contribute to the Language Server Protocol

Contributing to the language server protocol by proposing extensions to it requires several contributions to be made:

- as the [protocol](https://github.com/Microsoft/vscode-languageserver-node/blob/master/protocol/src/protocol.ts) itself request and notification additions need to be defined using [TypeScript](https://www.typescriptlang.org/).
- a document describing the protocol extension must be written using [GitHub flavored Markdown](https://guides.github.com/features/mastering-markdown/). The document must follow the style of the [protocol](https://github.com/Microsoft/vscode-languageserver-node/blob/master/protocol/src/protocol.ts) document.
- a reference implementation of the protocol must be provided for the [VSCode language client library](https://www.npmjs.com/package/vscode-languageclient). A reference implementation for the [VS Code language server library](https://www.npmjs.com/package/vscode-languageserver) is optional.

The actual contributation can happen in two ways:

* either as a pull request against this GitHub [repository](https://github.com/Microsoft/vscode-languageserver-node)
* or as a standalone GitHub repository. In this case the extension can even be published as a standalone npm module and used by developers on an opt-in basis.

Proposed extensions need to be annouced via an issue in this [repository](https://github.com/Microsoft/language-server-protocol).

## How to create a protocol extension

The following section describes in detail how a protocol extension is to be created.

Version 3.4.0 of VS Code's client and server library now have support to propose additional protocol and to provide reference implementations without modifying the actual code. The protocol can be implemented in so called features and contributed to the language client and server. 

For a protocol extension the following files have to be created where ${name} is the name of the proposed extension:

* **protocol/${name}.proposed.ts**: contains the TypeScript definitions of the protocol extension. 
* **protocol/${name}.proposed.md** a markdown file containing the actual documentation of the proposed protocol. As said above the document must follow the style of the actual [protocol specification](https://github.com/Microsoft/vscode-languageserver-node/blob/master/protocol/src/protocol.ts). The markdown must document:

  * the extension to the initialize parameters sent to the server.
  * the extensions to the client and server capabilities.
  * the actual requests and notifications. 
* **client/${name}.proposed.ts**: this file contains the actual implementation of the proposed protocol for the `vscode-languageclient`. Since version 3.4.0 the client supports implementing protocol in so called features that can be registered with a client. A static feature is responsible for:
    * filling in the initalize properties (`fillInitializeParams` method)
	* filling in the client capabilities (`fillClientCapabilities` method) 
	* initalizing the feature (`initialize` method)

	The client also supports adding dynamic features. A dynamic feature supports capability registration requests sent from the server to the clients. See [`client/registerCapability`](https://github.com/Microsoft/language-server-protocol/blob/master/protocol.md#client_registerCapability) and [`client/unregisterCapability`](https://github.com/Microsoft/language-server-protocol/blob/master/protocol.md#client_unregisterCapability) in the protocol.
* **server/${name}.proposed.ts**: the file contains the actual implementation of the proposed protocol for the `vscode-languageserver` node module. 

If you want to 'publish' the protocol extension as a pull request against the [repository](https://github.com/Microsoft/vscode-languageserver-node) the above files need to be added to the following directories:

* `protocol/${name}.proposed.ts` and `protocol/${name}.proposed.md` files go into the `protocol\src` folder, additionally prefixed with `protocol.` as follows: `protocol.${name}.proposed.{md,ts}`. 
* the `client/${name}.proposed.ts` file goes into the `client/src` folder. 
* the `server/${name}.proposed.ts` file goes into the `server/src` folder. 

Please also ensure that you re-export the proposed API from the `client/src/main.ts` and the `server/src/main.ts`. Corresponding stubs can be found at the end of these files.

Users who want to make use of new proposed protocols needs to create the a client and register the proposed protocol with it in the following way:

```ts
let client = new LanguageClient('...', serverOptions, clientOptions);
client.registerProposedFeatures();
```

For the server a user needs to pass the feature implementation to the `createConnection` call. An example looks like this:

```ts
import { ..., ProposedFeatures } from 'vscode-languageserver';

let connection = createConnection(ProposedFeatures.all);
```

If you decide to publish the protocol extension in its own repository it must contain that above files with it defined name and format. The repository also needs documentation on how to instanciate the client and server features.

## A Sample Protocol Extension

This section contains an example of a protocol extension that adds workspace folder support.


### File _protocol/workspaceFolders.proposed.ts_

```ts
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';

import {
	RequestType0, RequestHandler0, NotificationType, NotificationHandler, HandlerResult,
	CancellationToken
} from 'vscode-jsonrpc';

export interface WorkspaceFoldersInitializeParams {
	/**
	 * The actual configured workspace folders.
	 */
	workspaceFolders: WorkspaceFolder[] | null;
}

export interface WorkspaceFoldersClientCapabilities {
	/**
	 * The workspace client capabilities
	 */
	workspace: {
		/**
		 * The client has support for workspace folders
		 */
		workspaceFolders?: boolean;
	}
}

export interface WorkspaceFolder {
	/**
	 * The associated URI for this workspace folder.
	 */
	uri: string;

	/**
	 * The name of the workspace folder. Defaults to the
	 * uri's basename.
	 */
	name: string;
}

/**
 * The `workspace/workspaceFolders` is sent from the server to the client to fetch the open workspace folders.
 */
export namespace WorkspaceFoldersRequest {
	export const type = new RequestType0<WorkspaceFolder[] | null, void, void>('workspace/workspaceFolders');
	export type HandlerSignature = RequestHandler0<WorkspaceFolder[] | null, void>;
	export type MiddlewareSignature = (token: CancellationToken, next: HandlerSignature) => HandlerResult<WorkspaceFolder[] | null, void>;
}

/**
 * The `workspace/didChangeWorkspaceFolders` notification is sent from the client to the server when the workspace
 * folder configuration changes.
 */
export namespace DidChangeWorkspaceFoldersNotification {
	export const type = new NotificationType<DidChangeWorkspaceFoldersParams, void>('workspace/didChangeWorkspaceFolders');
	export type HandlerSignature = NotificationHandler<DidChangeWorkspaceFoldersParams>;
	export type MiddlewareSignature = (params: DidChangeWorkspaceFoldersParams, next: HandlerSignature) => void;
}

/**
 * The parameters of a `workspace/didChangeWorkspaceFolders` notification.
 */
export interface DidChangeWorkspaceFoldersParams {
	/**
	 * The actual workspace folder change event.
	 */
	event: WorkspaceFoldersChangeEvent;
}

/**
 * The workspace folder change event.
 */
export interface WorkspaceFoldersChangeEvent {
	/**
	 * The array of added workspace folders
	 */
	added: WorkspaceFolder[];

	/**
	 * The array of the removed workspace folders
	 */
	removed: WorkspaceFolder[];
}
```

### File _protocol/workspaceFolders.proposed.md_

```
#### Workspace Folders

Many tools support more than one root folder per workspace. Examples for this are VS Code's multi-root support, Atom's project folder support or Sublime's project support. If a client workspace consists of multiple roots then a server typically needs to know about this. The protocol up to know assumes one root folder which is announce to the server by the `rootUri` property of the `InitializeParams`. For workspace folders the following additions are proposed:

_Client Capabilities_:

The client sets the following capability if it is supporting workspace folders.

\`\`\`ts
/**
 * The workspace client capabilities
 */
workspace: {
	/**
	 * The client has support for workspace folders
	 */
	workspaceFolders?: boolean;
}
\`\`\`

_InitializeParams_:

An additional property `workspaceFolders` which contain the configured workspace folders when the server starts.


\`\`\`ts
/**
 * The actual configured workspace folders.
 */
workspaceFolders: WorkspaceFolder[] | null;
\`\`\`

where a `WorkspaceFolder` is defined as follows:

\`\`\`ts
export interface WorkspaceFolder {
	/**
	 * The associated URI for this workspace folder.
	 */
	uri: string;

	/**
	 * The name of the workspace folder. Defaults to the
	 * uri's basename.
	 */
	name: string;
}
\`\`\`

##### Workspace Folders Request

The `workspace/workspaceFolders` request is sent from the server to the client to fetch the current open list of workspace folders. Returns `null` in the response if only a single file is open in the tool. Returns an empty array if a workspace is open but no folders are configured.

_Request_:

* method: 'workspace/workspaceFolders'
* params: none

_Response_:

* result: `WorkspaceFolder[] | null`
* error: code and message set in case an exception happens during the 'workspace/workspaceFolders' request

##### DidChangeWorkspaceFolders Notification

The `workspace/didChangeWorkspaceFolders` notification is sent from the client to the server to inform the client about workspace folder configuration changes.

_Notification_:

* method: 'workspace/didChangeWorkspaceFolders'
* params: `DidChangeWorkspaceFoldersParams` defined as follows:

\`\`\`ts
export interface DidChangeWorkspaceFoldersParams {
	/**
	 * The actual workspace folder change event.
	 */
	event: WorkspaceFoldersChangeEvent;
}

/**
 * The workspace folder change event.
 */
export interface WorkspaceFoldersChangeEvent {
	/**
	 * The array of added workspace folders
	 */
	added: WorkspaceFolder[];

	/**
	 * The array of the removed workspace folders
	 */
	removed: WorkspaceFolder[];
}
\`\`\`
```

### File _client/workspaceFolders.proposed.ts_

```ts
export interface WorkspaceFolderMiddleware {
	workspaceFolders?: WorkspaceFoldersRequest.MiddlewareSignature;
	didChangeWorkspaceFolders?: NextSignature<VWorkspaceFoldersChangeEvent, void>
}

export class WorkspaceFoldersFeature implements DynamicFeature<undefined> {

	private _listeners: Map<string, Disposable> = new Map<string, Disposable>();

	constructor(private _client: BaseLanguageClient) {
	}

	public get messages(): RPCMessageType {
		return DidChangeWorkspaceFoldersNotification.type;
	}

	public fillInitializeParams(params: InitializedParams): void {
		let proposedParams = params as ProposedWorkspaceFoldersInitializeParams;
		let folders = workspace.workspaceFolders;

		if (folders === void 0) {
			proposedParams.workspaceFolders = null;
		} else {
			proposedParams.workspaceFolders = folders.map(folder => this.asProtocol(folder));
		}
	}

	public fillClientCapabilities(capabilities: ClientCapabilities): void {
		capabilities.workspace = capabilities.workspace || {};
		let workspaceCapabilities = capabilities as ProposedWorkspaceFoldersClientCapabilities;
		workspaceCapabilities.workspace.workspaceFolders = true;
	}

	public initialize(): void {
		let client = this._client;
		client.onRequest(WorkspaceFoldersRequest.type, (token: CancellationToken) => {
			let workspaceFolders: WorkspaceFoldersRequest.HandlerSignature = () => {
				let folders = workspace.workspaceFolders;
				if (folders === void 0) {
					return null;
				}
				let result: WorkspaceFolder[] = folders.map((folder) => {
					return this.asProtocol(folder);
				});
				return result;
			};
			let middleware = this.getWorkspaceFolderMiddleware();
			return middleware.workspaceFolders
				? middleware.workspaceFolders(token, workspaceFolders)
				: workspaceFolders(token);
		});
	}

	public register(_message: RPCMessageType, data: RegistrationData<undefined>): void {
		let id = data.id;
		let disposable = workspace.onDidChangeWorkspaceFolders((event) => {
			let didChangeWorkspaceFolders = (event: VWorkspaceFoldersChangeEvent) => {
				let params: DidChangeWorkspaceFoldersParams = {
					event: {
						added: event.added.map(folder => this.asProtocol(folder)),
						removed: event.removed.map(folder => this.asProtocol(folder))
					}
				}
				this._client.sendNotification(DidChangeWorkspaceFoldersNotification.type, params);
			}
			let middleware = this.getWorkspaceFolderMiddleware();
			middleware.didChangeWorkspaceFolders
				? middleware.didChangeWorkspaceFolders(event, didChangeWorkspaceFolders)
				: didChangeWorkspaceFolders(event);
		});
		this._listeners.set(id, disposable);
	}

	public unregister(id: string): void {
		let disposable = this._listeners.get(id);
		if (disposable === void 0) {
			return;
		}
		this._listeners.delete(id);
		disposable.dispose();
	}

	public dispose(): void {
		for (let disposable of this._listeners.values()) {
			disposable.dispose();
		}
		this._listeners.clear();
	}

	private asProtocol(workspaceFolder: VWorkspaceFolder): WorkspaceFolder;
	private asProtocol(workspaceFolder: undefined): null;
	private asProtocol(workspaceFolder: VWorkspaceFolder | undefined): WorkspaceFolder | null {
		if (workspaceFolder === void 0) {
			return null;
		}
		return { uri: this._client.code2ProtocolConverter.asUri(workspaceFolder.uri), name: workspaceFolder.name };
	}

	private getWorkspaceFolderMiddleware(): WorkspaceFolderMiddleware {
		let middleware = this._client.clientOptions.middleware;
		return middleware && middleware.workspace
			? middleware.workspace as WorkspaceFolderMiddleware
			: {};
	}
}
```

### File _server/workspaceFolders.proposed.ts_

```ts
export interface WorkspaceFoldersProposed {
	getWorkspaceFolders(): Thenable<WorkspaceFolder[] | null>;
	onDidChangeWorkspaceFolders: Event<WorkspaceFoldersChangeEvent>;
}

export const WorkspaceFoldersFeature: WorkspaceFeature<WorkspaceFoldersProposed> = (Base) => {
	return class extends Base {
		private _onDidChangeWorkspaceFolders: Emitter<WorkspaceFoldersChangeEvent>;
		private _unregistration: Thenable<Disposable>;
		public initialize(capabilities: ClientCapabilities): void {
			let workspaceCapabilities = (capabilities as ProposedWorkspaceFoldersClientCapabilities).workspace;
			if (workspaceCapabilities.workspaceFolders) {
				this._onDidChangeWorkspaceFolders = new Emitter<WorkspaceFoldersChangeEvent>();
				this.connection.onNotification(DidChangeWorkspaceFoldersNotification.type, (params) => {
					this._onDidChangeWorkspaceFolders.fire(params.event);
				});
			}
		}
		getWorkspaceFolders(): Thenable<WorkspaceFolder[] | null> {
			return this.connection.sendRequest(WorkspaceFoldersRequest.type);
		}
		get onDidChangeWorkspaceFolders(): Event<WorkspaceFoldersChangeEvent> {
			if (!this._onDidChangeWorkspaceFolders) {
				throw new Error('Client doesn\'t support sending workspace folder change events.');
			}
			if (!this._unregistration) {
				this._unregistration = this.connection.client.register(DidChangeWorkspaceFoldersNotification.type);
			}
			return this._onDidChangeWorkspaceFolders.event;
		}
	}
};	
```
