#### <a href="#textDocument_willSaveWaitUntil" name="textDocument_willSaveWaitUntil" class="anchor">WillSaveWaitUntilTextDocument Request (:leftwards_arrow_with_hook:)</a>

The document will save request is sent from the client to the server before the document is actually saved. The request can return an array of TextEdits which will be applied to the text document before it is saved. Please note that clients might drop results if computing the text edits took too long or if a server constantly fails on this request. This is done to keep the save fast and reliable.  If a server has registered for open / close events clients should ensure that the document is open before a `willSaveWaitUntil` notification is sent since clients can't change the content of a file without ownership transferal.

_Client Capability_:
* property name (optional): `textDocument.synchronization.willSaveWaitUntil`
* property type: `boolean`

The capability indicates that the client supports `textDocument/willSaveWaitUntil` requests.

_Server Capability_:
* property name (optional): `textDocumentSync.willSaveWaitUntil`
* property type: `boolean`

The capability indicates that the server is interested in `textDocument/willSaveWaitUntil` requests.

_Registration Options_: `TextDocumentRegistrationOptions`

_Request_:
* method: `textDocument/willSaveWaitUntil`
* params: `WillSaveTextDocumentParams`

_Response_:
* result:[`TextEdit[]`](#textEdit) \| `null`
* error: code and message set in case an exception happens during the `textDocument/willSaveWaitUntil` request.
