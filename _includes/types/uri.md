#### <a href="#uri" name="uri" class="anchor"> URI </a>

URI's are transferred as strings. The URI's format is defined in [https://tools.ietf.org/html/rfc3986](https://tools.ietf.org/html/rfc3986)

```
  foo://example.com:8042/over/there?name=ferret#nose
  \_/   \______________/\_________/ \_________/ \__/
   |           |            |            |        |
scheme     authority       path        query   fragment
   |   _____________________|__
  / \ /                        \
  urn:example:animal:ferret:nose
```

We also maintain a node module to parse a string into `scheme`, `authority`, `path`, `query`, and `fragment` URI components. The GitHub repository is [https://github.com/Microsoft/vscode-uri](https://github.com/Microsoft/vscode-uri), and the npm module is [https://www.npmjs.com/package/vscode-uri](https://www.npmjs.com/package/vscode-uri).

Many of the interfaces contain fields that correspond to the URI of a document. For clarity, the type of such a field is declared as a `DocumentUri`. Over the wire, it will still be transferred as a string, but this guarantees that the contents of that string can be parsed as a valid URI.

Care should be taken to handle encoding in URIs. For example, some clients (such as VS Code) may encode colons in drive letters while others do not. The URIs below are both valid, but clients and servers should be consistent with the form they use themselves to ensure the other party doesn't interpret them as distinct URIs. Clients and servers should not assume that each other are encoding the same way (for example a client encoding colons in drive letters cannot assume server responses will have encoded colons). The same applies to casing of drive letters - one party should not assume the other party will return paths with drive letters cased the same as itself.

```
file:///c:/project/readme.md
file:///C%3A/project/readme.md
```

<div class="anchorHolder"><a href="#documentUri" name="documentUri" class="linkableAnchor"></a></div>

```typescript
type DocumentUri = string;
```

There is also a tagging interface for normal non document URIs. It maps to a `string` as well.

```typescript
type URI = string;
```
