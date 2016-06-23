# Language Server Protocol

The Language Server protocol is used between a tool (the client) and a language smartness provider (the server) to integrate feature 
like code complete, goto definition, and alike into the tool. The first version of the protocol is based on experiences we gained while
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