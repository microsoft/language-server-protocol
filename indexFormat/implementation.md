# Building an LSIF exporter

By building an LSIF (Language Server Index Format) exporter for your language server, users can use [Rich Code Navigation](https://code.visualstudio.com/blogs/2018/12/04/rich-navigation) on their pull requests.

If you are new to LSIF, [the specification page](specification.md) covers the motivation and implementation details of the protocol.

In this guide, we cover how an LSIF implementation can be used in the context of Rich Code Navigation.

## Rich Code Navigation scenario

With Rich Code Navigation, users can use navigation features on their pull requests, without requiring a local checkout. In this scenario, the navigation features are powered through an external service. This service uses a pre-built LSIF index. The index can be generated at a variety of places, like for instance the CI pipeline of the repo:

1. User creates a pull request
1. The CI tool builds this pull request
1. The LSIF exporter runs in the CI pipeline and generates the LSIF file

## LSIF exporter implementations

| Language | Repository |
|--|--|
| TypeScript/JavaScript | [lsif-node](https://github.com/Microsoft/lsif-node) |

> Are we missing an implementation? Create a new issue on GitHub.

## LSIF implementation skeleton

As detailed in the specification, the LSIF exporter consists of two tools: the index exporter and the package manager linker.

### Index exporter

This tool generates an LSIF dump for a workspace by traversing through source files and storing LSP responses. For TypeScript/JavaScript, [`lsif-tsc`](https://github.com/Microsoft/lsif-node/tree/master/tsc) is the index exporter.

### Package manager linker

This tool ingests the LSIF output from an index exporter and converts `moniker` vertices into the package manager scheme. Additionally, it links these monikers to `packageInformation` vertices. For TypeScript/JavaScript, [`lsif-npm`](https://github.com/Microsoft/lsif-node/tree/master/npm) is the package manager linker for NPM.

## Testing and validation

### lsif-util

The `lsif-util` tool can validate your generated LSIF output. Additionally, the tool can also help you comprehend the generated output by visualizing and searching the vertices and edges.

### VS Code LSIF extension

With the [LSIF extension for VS Code](https://github.com/Microsoft/vscode-lsif-extension), you can power navigation in the editor over a generated LSIF file, instead of running a language server.

## Recommended patterns

### Execution from CLI

asdf

### `--outputFormat` flag

1. `json`: Output is a JSON array, with each JSON object (vertex or edge) as an element of this array.
1. `line`: Output is a series of lines, each line is a vertex or an edge. This format is more friendly to streaming output, and therefore preferred.

## `--projectRoot flag`

asdf

## Packaging

## Checklist

- [ ] Required documentation: usage instructions
- [ ] Required documentation: platform dependencies
- [ ] 

Performance

## Integration with Rich Code Navigation

While we 

## Support

Feel free to reach out to us for questions by raising an issue on GitHub.
