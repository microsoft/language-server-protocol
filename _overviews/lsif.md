---
title: Language Server Index Format
shortTitle: "LSIF - Overview"
layout: overviews
author: Microsoft
index: 2
---

## Rich Code Navigation without Checkout

There are many of scenarios where the focus of the developer is reading and comprehending code and not on authoring new code. Examples are:

- browsing an existing version of a code in a repository (e.g. on GitHub) without requiring to clone and check it out locally.
- browsing a pull request without being limited to the changed files or being forced to check out the pull request locally. This feature got demoed on [Connect(); 2018](https://news.microsoft.com/connect-2018/) and is powered by LSIF. The blog post [A first look at rich code navigation] (https://code.visualstudio.com/blogs/2018/12/04/rich-navigation) contains the demo.
- browsing dependencies of a project. Projects today have many dependencies and you often need to dive into them to learn about their implementation.

In all of the above scenarios you ideally do not want to check out a branch or clone a repository locally, all you want to do is reading the code. Still, you want to have the same rich code navigation capabilities that your are used to from your editor (e.g. hover info, go to definition, find all references). In the editor these features can be powered by the Language Server Protocol **add link**. The Language Server Protocol supports providing features like auto complete, go to definition, or find all references in an way that is independent of the development tool. The focus of LSP is to support rich code authoring but not which goes beyond rich code navigation. For code comprehension you only need a subset of the features specified by LSP. Desirable features are go to definition, find all references, documentation hovers, document outline, or folding ranges. Features like auto complete are typically not necessary to read and comprehend code.

The goal of the Language Server Index Format (LSIF) is to augment the LSP protocol to support rich code navigation independent of whether the code is checked out on your local machine. 

## The Language Server Index Format 

Since LSIF (pronounced like "else if") builds on LSP it uses the same requests and data types as defined in LSP. At a high level, LSIF models all the responses of LSP requests for a set of documents in an efficient way. Same as LSP, LSIF  doesn't contain any program symbol information nor does the LSIF define any symbol semantics (e.g. what makes the definition of a symbol or when a method overrides another method). The LSIF therefore doesn't define a symbol database, which is consistent with the LSP itself.

Using LSP data types as the base for LSP has another advantage: it can easily be integrated into tools or servers which already understand LSP. 

**Suggest to illustrate this point**
In the following example **suggest to show a hover in simple Java file (Java since TS is not LSP) file** the user hovers over a symbol. In an editor powered by LSP this results in the following requests **show the request and response**. The idea of LSIF is that the same request and response can be provided, but without having a running language server. Instead the data is coming from an index that is populated using LSIF. 

As the example above shows, LSIF needs to be able to define both the input of the request and the corresponding results. This is again aligned with LSP. 

In the following let's take a closer look at the requirements for an index format that supports LSP requests. 

LSP is using two types of requests, where the `uri` identifies a document:
**should we use java and not ts as an example? my concern is that we have no LSP for TS, and we argue that LSIF is an augmentation of LSP**
```typescript
request(uri, method) -> result
request('file:///Users/dirkb/sample/test.ts', 'textDocument/foldingRange') -> FoldingRange[];

request(uri, position, method) -> result
request('file:///Users/dirkb/sample/test.ts', { line: 10, character: 17 }, 'textDocument/hover') -> Hover;
```

An indexer that uses LSIF to populate an index **we should distinguish between LSIF the format and the indexer that produces the index**needs to emit for all indexed documents:
- the request method
- the results for the request.

To enable answering request for any position inside the document, the information needs to be enrichted by range information:
- the request method
- the range information
- the LSP result for the [document, range, method] tuple.

When designing the LSIF we also considered the following requirements:

- it should be possible to emit data as soon as it is available to allow streaming rather than having to store large amounts of data in memory. For example, emitting data for a document should be done for each file as the parsing progresses.
- it should be possible to extend the format with additional request types.

We came to the conclusion that the most flexible way to emit this information is a graph, where edges represent the method and vertices are documents, ranges or request results. This data can then be stored as JSON or populate a database. **Notice**, that the fact that LSIF is using a graph representation does not imply the use of a graph database. As a prove of concept, we created an indexer that stores the LSIF output in a SQL database.

## Representing an LSP Request in LSIF
**I wonder whether the hover example is sufficient to bring the point across?**


**suggest to illustrate with with a screenshot**Assume there is a file `/Users/dirkb/sample.ts` and we want to store the folding range information with it then the indexer emits two vertices: one representing the document with its URI `file:///Users/dirkb/sample.ts` and the other representing the folding result. In addition, an edge would be emitted representing the `textDocument/foldingRange` request.


```typescript
{ id: 1, type: "vertex", label: "document", uri: "file:///Users/dirkb/sample.ts", languageId: "typescript" }
{ id: 2, type: "vertex", label: "foldingRangeResult", result: [ { ... }, { ... }, ... ] }
{ id: 3, type: "edge", label: "textDocument/foldingRange", outV: 1, inV: 2 }
```

The corresponding graph looks like this:

<img src="./img/hoverResult.png" class="img-fluid" alt="hover result">

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
**suggest to also show the annotated graph**

To keep the index at a reasonable size additional optimizations are added to the index format:

- reusing results between different ranges. For example the definition of bar and all it references have the same hover, find all references or go o definition result. **show another graph**
- reusing ranges inside results. **not clear to me what this means?**
- reusing sets of ranges inside results. **needs more explanation, what is an example**

How this works in detail is documented in the [LSIF specification](https://github.com/Microsoft/language-server-protocol/blob/master/indexFormat/specification.md)

## How to get started

If you want to get started with LSIF you can have a look at the following resources:

- The actual [LSIF specification](https://github.com/Microsoft/language-server-protocol/blob/master/indexFormat/specification.md)
- [Index for TypeScript](https://github.com/Microsoft/lsif-typescript): generates LSIF for TypeScript. The corresponding readme has steps for how to use it.
- [VS Code extension for LSIF](https://github.com/Microsoft/vscode-lsif-extension): an extension for VS Code to provide language comprehension feature from an LSIF JSON dump. When you have implemented an LSIF generator then you can use this extension to validate it with arbitrary source code. 

**Suggest to end with an invitation for feedback**
## We need your feedback!

At this point we think we have made enough progress to share the LSIF specification and we wanted to start an open conversation with the community about what we're working on. For feedback please comment on **issue** number.