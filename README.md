# VSCode Client / Server Language Protocol

Defines the client server protocol used by VSCode to talk to out of process language servers. 
The repository contains a VSCode protocol definition and a verification test suite so that other 
can implement the protocol in language like C#, C++, Java or Python.

## Base Protocol

The base protocol consists of a header and a content part (comparable to http). The header and content part are
separated by a '\r\n'.

### Header Part

The header part consist of header fields. Header fields are separated from each other by '\r\n'. The last header
field needs to be terminated with '\r\n' as well. Currently the following header fields are supported:

| Header File Name | Value Type  | Description |
|:-----------------|:------------|:------------|
| Content-Length   | number      | The length of the content part |
| Content-Type     | string      | The mime typ of the content part. Defaults to application/openTools-json; charset=utf8 |


### Content Part

Contains the actual content of the message. The content part of a messages uses [JSON-RPC](http://www.jsonrpc.org/) to describe requests, responses and notifications.


### Example:

```
Content-Length: ...\r\n
Content-Type: "application/openTools-json; charset=utf8"\r\n
\r\n
{
	"jsonrpc": "2.0",
	"id": 1,
	"method": "textDocument/didOpen", 
	"params": {
		...
	}
}
```