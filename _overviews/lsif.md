---
title: Language Server Index Format
shortTitle: "LSIF - Overview"
layout: overviews
author: Microsoft
index: 2
---

## Why an Index Format

The Language Server Protocol provides an easy way to implement feature like autocomplete, go to definition, or documentation on hover for a programming language and hook them up to programming tools. Language servers are usually optimized for the code writing case and not for the code comprehension. Features that are useful for code comprehension are document outline, folding ranges, go to definition find all references or hover. Auto complete is usually not necessary to comprehend code.

There are plenty of tasks in every programmers daily coding live where having code comprehension support is enough. Typical examples are:

- browsing an existing version of a code in a repository (e.g. on GitHub) without requiring to clone and check it out locally.
- browsing a pull request without being limited to the changed files or being forced to check the pull request out locally. This feature got demoed on [Connect(); 2018](https://news.microsoft.com/connect-2018/) and is powered by LSIF. The [blog post](https://code.visualstudio.com/blogs/2018/12/04/rich-navigation) contains the demo.
- browsing dependencies of a project. Let me explain this in more detail: consider the case where a TypeScript project depends on a npm library that is also written in TypeScript. The npm module is usually only bundling the JavaScript code which even might be minified. It would be helpful if my programming tool allowed me to browse and comprehend the TypeScript source code in place without cloning it locally.

Browsing the source code of project dependencies is supported in programming languages where their library concept supports attaching source code (like Java or C#). However in most cases the tools treat these attached sources as normal source code and spend CPU and memory to provide the necessary comprehension features.

## How it works

The data model is based on the data types defined in the Language Server Protocol. From a birds eye view it models result data typically returned from the corresponding language server requests. The LSIF (pronounce like "else if") doesn't contain any program symbol information nor does the LSIF define any symbol semantics (e.g. what makes the definition of a symbol or when a method overrides another method). The LSIF therefore doesn't define a symbol database, which is consistent with the LSP itself.

Using LSP data types as the base for LSP has another advantage: it can easily be integrated into tools or servers which already understand LSP. Besides specifying the result the LSIF needs to define the input to be able to look up the corresponding results. Again we align this with the LSP where requests have one of the following forms:

```typescript
request(uri, method) -> result
request(uri, position, method) -> result
```

Concrete examples are:

```typescript
request('file:///Users/dirkb/sample/test.ts', 'textDocument/foldingRange') -> FoldingRange[];
request('file:///Users/dirkb/sample/test.ts', { line: 10, character: 17 }, 'textDocument/hover') -> Hover;
```

So the LSIF needs to emit for document:
- the request method
- the LSP results for the [document, method] tuple.

And for every range in a document that can provide an LSP request result
- the request method
- the range information
- the LSP result for the [document, range, method] tuple.

Besides these domain requirements we think that the following technical once are important as well:

- it should be possible to emit data as soon as it is available to allow streaming rather than large memory requirements. For example, emitting data for a document should be done for each file as parsing progresses.
- it should be easy to add additional requests later on.

We came to the conclusion that the most flexible way to emit this is a graph, where edges represent the method and vertices are documents, ranges or request results. This data could then be stored as JSON or read into a database.

Assume there is a file `/Users/dirkb/sample.ts` and we want to store the folding range information with it then the indexer emits two vertices: one representing the document with its URI `file:///Users/dirkb/sample.ts` and the other representing the folding result. In addition, an edge would be emitted representing the `textDocument/foldingRange` request.


```typescript
{ id: 1, type: "vertex", label: "document", uri: "file:///Users/dirkb/sample.ts", languageId: "typescript" }
{ id: 2, type: "vertex", label: "foldingRangeResult", result: [ { ... }, { ... }, ... ] }
{ id: 3, type: "edge", label: "textDocument/foldingRange", outV: 1, inV: 2 }
```

For requests that take a position as an additional input, we need to store the position as well. Usually LSP requests return the same result for positions that point to the same word / identifier in a document. Take the following TypeScript example:

```typescript
function bar() {
}
```

A hover request for a position denoting the `b` in `bar` will return the same result as a position denoting the `a` or `r`. To make the dump more compact, it will use ranges to capture this instead of single positions. For a hover result the following vertices and edges will be emitted:

```typescript
{ id: 4, type: "vertex", label: "range", start: { line: 0, character: 9}, end: { line: 0, character: 12 } }
{ id: 5, type: "edge", label: "contains", outV: 1, inV: 4}
{ id: 6, type: "vertex", label: "hoverResult",
  result: {
    contents: [
      { language: "typescript", value: "function bar(): void" }
    ]
  }
}
{ id: 7, type: "edge", label: "textDocument/hover", outV: 4, inV: 6 }
```

The `contains` edge with id `5` links the range to the document `file:///Users/dirkb/sample.ts`. Vertex `6` is the actual hover result and the edge `7` links the hover result to the range.

To keep the index at a reasonable size additional optimizations are added to the index format: they are:

- reusing results between different ranges. For example the definition of bar and all it references have the same hover, find all references or go o definition result.
- reusing ranges inside results.
- reusing sets of ranges inside results.

How this works in detail is documented in the [LSIF specification](https://github.com/Microsoft/language-server-protocol/blob/master/indexFormat/specification.md)

## How to get started

If you want to get started with LSIF you can have a look at the following two repositories:

- [Index for TypeScript](https://github.com/Microsoft/lsif-typescript): provides an index for TypeScript. The corresponding readme has steps how to use it.
- [VS Code extension for LSIF](https://github.com/Microsoft/vscode-lsif-extension): an extension for VS Code to provide language comprehension feature from a LSIF JSON dump.

