#### <a href="#textDocuments" name="textDocuments" class="anchor"> Text Documents </a>

The current protocol is tailored for textual documents whose content can be represented as a string. There is currently no support for binary documents. A position inside a document (see Position definition below) is expressed as a zero-based line and character offset.

> New in 3.17

Prior to 3.17 the offsets were always based on a UTF-16 string representation. So a string of the form `a𐐀b` the character offset of the character `a` is 0, the character offset of `𐐀` is 1 and the character offset of b is 3 since `𐐀` is represented using two code units in UTF-16. Since 3.17 clients and servers can agree on a different string encoding representation (e.g. UTF-8). The client announces it's supported encoding via the client capability [`general.positionEncodings`](#clientCapabilities). The value is an array of position encodings the client supports, with decreasing preference (e.g. the encoding at index `0` is the most preferred one). To stay backwards compatible the only mandatory encoding is UTF-16 represented via the string `utf-16`. The server can pick one of the encodings offered by the client and signals that encoding back to the client via the initialize result's property [`capabilities.positionEncoding`](#serverCapabilities). If the string value `utf-16` is missing from the client's capability `general.positionEncodings` servers can safely assume that the client supports UTF-16. If the server omits the position encoding in its initialize result the encoding defaults to the string value `utf-16`. Implementation considerations: since the conversion from one encoding into another requires the content of the file / line the conversion is best done where the file is read which is usually on the server side.

To ensure that both client and server split the string into the same line representation the protocol specifies the following end-of-line sequences: '\n', '\r\n' and '\r'. Positions are line end character agnostic. So you can not specify a position that denotes `\r|\n` or `\n|` where `|` represents the character offset.

```typescript
export const EOL: string[] = ['\n', '\r\n', '\r'];
```
