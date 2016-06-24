# Language Server Protocol

The Language Server protocol is used between a tool (the client) and a language smartness provider (the server) to integrate features 
like auto complete, goto definition, find all references and alike into the tool. The following diagram illustrates the communication between a tool and the language server.

![Interaction diagram](images/interaction-diagram.png)

The Language server maintains the semantic information about a program implemented in a particular language. 
* When the user opens a document in the tool then it notifies the language server that the document did open and that the truth of the document is now maintained by the tool in an memory buffer. 
* When the user edits the document the server is notified about the changes and the semantic information of program is updated by the language server.
* As the user makes changes the language server analyses the document and notifies the tool with the errors and warnings (diagnostics) that are found,
* When the user requests to go to the definition of a symbol, then it sends a `definition` request to the server. The server responds with a uri of the document that holds the definition and the range inside the document. Based on this information the tool opens the corresponding document at the position where the symbol is defined.
* When the user closes the document, the a `didClose` notification is sent, informing the language server that the truth of the file is now on the file system.

The communication between the Editor/IDE host and the Language Server uses [JSON RPC](http://www.jsonrpc.org/). The protocol supports servers with different capabilities. The first request sent from the Editor/IDE to the language server informs the server about the supported language features.


The first version of the protocol is based on experiences we gained while
integrating [OmniSharp](http://www.omnisharp.net/) and the [TypeScript Server](https://github.com/Microsoft/TypeScript/tree/master/src/server) into 
[VS Code](https://code.visualstudio.com/). Looks [here](https://github.com/Microsoft/language-server-protocol/wiki/Protocol-History) for a more detailed
history of the protocol.

## Contributing
If you are interested in fixing issues like typos or contributing directly to the protocol specification either file an issue or provide a pull request
containing the changes to the protocol.md file. In case you want to extend the specification it is beneficial if the protocol changes got already implemented
in a server. This helps understanding its use case.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## The Actual Protocol

The latest version of the Language Server protocol can be found [here](protocol.md).

## License
[Creative Commons Attribution / MIT](LICENSE.txt)