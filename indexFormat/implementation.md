# Building an LSIF exporter

With an LSIF (Language Server Index Format) exporter for your programming language of choice, you can use [Rich Code Navigation](https://code.visualstudio.com/blogs/2018/12/04/rich-navigation) on pull requests inside Visual Studio and Visual Studio Code. Users can navigate PRs with go-to-definition, find-all-references, and diagnostics, without requiring a local checkout.

In this guide, we cover how you can build an LSIF implementation that can be used for Rich Code Navigation. If you are new to LSIF, start with the [specification](specification.md), which covers motivation and implementation details of the protocol.

## The Rich Code Navigation scenario

With Rich Code Navigation, users use navigate features (peek definition, find all references, diagnostics, etc.) over PRs in their editor without having a local checkout. These navigation features are powered by a cloud language service, which uses an LSIF index. The index can be generated at a variety of places. For example, the index could be generated in a CI pipeline with the following steps:

1. User creates a new PR.
1. The CI configured on the repo builds the PR.
1. The LSIF exporter runs on CI and generates the LSIF index.

## LSIF exporters

| Language | Repository |
|--|--|
| TypeScript/JavaScript | [lsif-node](https://github.com/Microsoft/lsif-node) |
| Java | [lsif-java](https://github.com/Microsoft/lsif-java) |
| C# | |

> Are we missing an implementation? File a new issue on GitHub to add it here.

## LSIF exporter skeleton

As [detailed in the spec](specification.md#project-exports-and-external-imports), the LSIF exporter consists of two tools: the index exporter and the package linker.

### Index exporter

The index exporter generates an LSIF dump for a workspace by traversing through source files and storing LSP responses. For TypeScript/JavaScript, [`lsif-tsc`](https://github.com/Microsoft/lsif-node/tree/master/tsc) is the index exporter.

### Package linker

The package linker converts the LSIF output of the index exporter into a global friendly index. By using package metadata, export `moniker` vertices are linked to packages available on a registry. For instance, the `observable` export from the mobx dependency is linked to the mobx dependency available on NPM. The package metadata is used to create the `packageInformation` vertices that reference external packages.

For TypeScript/JavaScript, [`lsif-npm`](https://github.com/Microsoft/lsif-node/tree/master/npm) is the package manager linker for NPM.

## Testing and validation

### LSIF validation utility

The [`lsif-util`](https://github.com/microsoft/lsif-node/tree/master/util) tool can validate your generated LSIF output. Additionally, the tool can also be used to search the output and visualize via Graphviz.

### VS Code LSIF extension

With the [LSIF extension for VS Code](https://github.com/Microsoft/vscode-lsif-extension), you can dogfood an LSIF index to power navigation inside VS Code.

## Performance

Generating LSIF for a project is expected to take roughly the same time as compilation.

A primitive LSIF index exporter loops over source files, and for every symbol encountered, queries the language server for responses to LSP requests. With this approach, computing references can become very expensive: references are computed multiple times for the same symbol spread over files. This can be inefficient, depending on the language server implementation.

This approach can optimized by computing references only once for a symbol spread over files. The approach taken by the [lsif-tsc](https://github.com/Microsoft/lsif-node) tool is outlined below:

- Parse the project configuration to get source files
- Loop over files, and run the following on the AST of each file
  - When you encounter a symbol, find out the binding of the symbol (declaration)
  - If the binding is local to the file, create a referencesResult data structure and add symbols with the same binding. When the parsing of the file is complete, we know that the referenceResult is complete and can be emitted.
  - If the binding is not local, keep result set in memory, and keep parsing other files.

## Recommended checklist

We have seen the following patterns work well in existing implementations.

### Method checklist

For an ideal integration with Rich Code Navigation, the following methods are required. For some languages, methods such as `textDocument/declaration` might not be applicable.

- [ ] `textDocument/hover`
- [ ] `textDocument/definition`
- [ ] `textDocument/references`
- [ ] `textDocument/implementation`
- [ ] `textDocument/declaration`
- [ ] `textDocument/typeDefinition`
- [ ] `textDocument/diagnostic`
- [ ] Cross-repo navigation for dependencies

### Cross-platform

If the LSIF exporter does not work across platforms (Windows, Linux, Mac), platform dependencies should be called out.

### Output format

The LSIF exporter is expected to implement the [line-delimited JSON](https://en.wikipedia.org/wiki/JSON_streaming#Line-delimited_JSON) (also known as [JSON lines](http://jsonlines.org/)) output format: series of JSON objects (vertex or edge) separated by newline. Since JSON lines is suitable for streaming output and works better for larger repos, it is preferred over a JSON array output.

If an LSIF consumer requires a valid JSON array as input (for example, the VS Code LSIF extension), the JSON lines output can be converted into a JSON array by piping into a conversion tool.

```
cat lsif.jsonl | sed '1s/^/[/;$!s/$/,/;$s/$/]/'
```

If the LSIF exporter needs to log additional output, it is recommended to use `stderr`, since `stdout` is reserved for JSON line output.

### Project configuration

The LSIF index exporter can expose a flag to specify the root of the project directory. For example, the [TypeScript implementation](https://github.com/Microsoft/lsif-node) exposes the `--project` (`-p`) to specify the root of the tsconfig.json file.

```
lsif-tsc --project ./frontend/tsconfig.json
```

### Error behavior

The LSIF tool is expected to signal for error conditions, with a numeric exit code. A successful execution returns a 0, whereas error conditions (unable to build project, unable to find project file) return 1.

### Required documentation

Since LSIF is an evolving protocol, it is critical to document the [protocol version](specification.md#changelog) supported by the exporter.

## Support

Feel free to reach out to us for questions by raising an issue on GitHub.
