# Building an LSIF exporter

With an LSIF (Language Server Index Format) exporter for your programming language of choice, you can use [Rich Code Navigation](https://code.visualstudio.com/blogs/2018/12/04/rich-navigation) on pull requests inside Visual Studio and Visual Studio Code.

In this guide, we cover how you can build an LSIF implementation that can be used for Rich Code Navigation. If you are new to LSIF, start with the [specification](specification.md), which covers motivation and implementation details of the protocol.

## The Rich Code Navigation scenario

With Rich Code Navigation, users use navigate features (peek definition, find all references, diagnostics, etc.) over PRs in their editor without having a local checkout. These navigation features are powered by a cloud language service, which uses an LSIF index. The index can be generated at a variety of places, like for instance in the CI pipeline:

1. User creates a new PR.
1. The CI configured on the repo builds the PR.
1. The LSIF exporter runs on CI and generates the LSIF index.

## LSIF exporters

| Language | Repository |
|--|--|
| TypeScript/JavaScript | [lsif-node](https://github.com/Microsoft/lsif-node) |
| Java | |
| C# | |

> Are we missing an implementation? File a new issue on GitHub to add it here.

## LSIF exporter skeleton

As [detailed in the spec](specification.md#project-exports-and-external-imports), the LSIF exporter consists of two tools: the index exporter and the package linker.

### Index exporter

This tool generates an LSIF dump for a workspace by traversing through source files and storing LSP responses. For TypeScript/JavaScript, [`lsif-tsc`](https://github.com/Microsoft/lsif-node/tree/master/tsc) is the index exporter.

### Package linker

This tool ingests the LSIF output from an index exporter and converts `moniker` vertices into the package manager scheme. Additionally, it links these monikers to `packageInformation` vertices that reference packages hosted on a registry. For TypeScript/JavaScript, [`lsif-npm`](https://github.com/Microsoft/lsif-node/tree/master/npm) is the package manager linker for NPM.

## Testing and validation

### LSIF validation utility

The [`lsif-util`](https://github.com/jumattos/lsif-util) tool can validate your generated LSIF output. Additionally, the tool can also help you comprehend the generated output by visualizing and searching the vertices and edges.

### VS Code LSIF extension

With the [LSIF extension for VS Code](https://github.com/Microsoft/vscode-lsif-extension), you can dogfood an LSIF index to power navigation inside VS Code.

## Recommended patterns

We have seen the following patterns work well in existing implementations.

### Cross-platform

If the LSIF exporter does not work across platforms (Windows, Linux, Mac), platform dependencies should be called out.

### `--outputFormat` execution flag

It is recommended that the LSIF exporter support two output formats: `line` and `json`.

1. `line`: Output is a series of JSON objects (vertex or edge) separated by newline. This format is optimized for streaming output, and works better for larger repos.
1. `json`: Output is a valid JSON array, with each JSON object (vertex or edge) as an element of this array. The VS Code LSIF extension uses this format.

### `--projectRoot` execution flag

This flag can be used to specify the root of the project directory, or specify the location of the project configuration file (`tsconfig.json` for TypeScript projects).

## Support

Feel free to reach out to us for questions by raising an issue on GitHub.
