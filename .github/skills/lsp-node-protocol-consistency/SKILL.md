---
name: lsp-node-protocol-consistency
description: Keeps the Language Server Protocol specification and the vscode-languageserver-node TypeScript implementation aligned. Use when adding, changing, reviewing, or auditing LSP requests, notifications, capabilities, registration options, wire types, proposed or final status, since tags, meta-model data, or related documentation across microsoft/language-server-protocol and microsoft/vscode-languageserver-node.
license: MIT
compatibility: Requires local checkouts of microsoft/language-server-protocol and microsoft/vscode-languageserver-node, plus Node.js, npm, and git. Ruby and Bundler are optional for building the specification site.
metadata:
  author: microsoft
  version: "1.0"
---

# LSP Node and specification consistency

Maintain one coherent LSP wire contract across the normative specification and
the Node implementation. Do not equate textual similarity with compatibility:
TypeScript aliases, interfaces, intersections, helper namespaces, and factories
can differ while describing the same wire shape.

## Establish the scope

1. Locate both repository roots instead of assuming fixed directory names:
   - The specification root contains `_data/specifications.yml`.
   - The Node root contains `protocol/package.json`, `types/src/main.ts`, and
     `tools/src/metaModel.ts`.
2. Read `git status --short --branch` in both repositories before editing.
   Preserve unrelated changes. If task files already have conflicting edits,
   ask how to proceed.
3. Read `_data/specifications.yml` to identify the current LSP version unless
   the user named a version. Do not update previous versions unless the task is
   explicitly a historical correction.
4. Determine whether the task is:
   - an audit or review,
   - a specification-first protocol change,
   - an implementation correction, or
   - synchronization of an already agreed contract.
5. Identify the exact methods, capability paths, types, properties, enum
   values, and documentation affected. Search both repositories for all of
   them before changing files.

If the intended wire behavior is ambiguous or the repositories disagree in a
way the task does not resolve, stop and ask which behavior is intended.

## Apply source-of-truth rules

- The specification prose defines normative protocol behavior.
- However the implementation is the point of truth of the actual behavior. The
  protocol should follow the implementation if not noted otherwise.
- The Node TypeScript sources define the Node API and generate the meta model.
- The specification's `metaModel.json`, `metaModel.ts`, and
  `metaModel.schema.json` are mirrors of artifacts from the Node repository.
- Never resolve a disagreement by blindly copying one side. Establish the
  intended contract, update the authoritative source for each concern, and
  then synchronize derived artifacts.

Read [the consistency checklist](references/consistency-checklist.md) for the
surface map and the invariants that must be checked.

## Build a contract matrix

For every affected request, notification, or type, record and compare:

- method string and message direction;
- parameter, result, error data, partial result, and registration types;
- client and server capability paths;
- static and dynamic registration behavior;
- property names, optionality, nullability, arrays, maps, unions, and literals;
- numeric or string enum values;
- `@since`, deprecation, and proposed/final status;
- behavioral requirements stated only in prose;
- public exports and, where applicable, client/server feature wiring.

Treat these distinctions as wire-significant:

- omitted versus present with `null`;
- optional versus required;
- integer versus decimal;
- an array versus a single value;
- a literal value versus a general primitive;
- client-to-server versus server-to-client versus both;
- static capability advertisement versus dynamic registration.

## Make coordinated changes

When the task calls for edits, use an analogous completed feature as a pattern
and update every applicable surface.

### Specification repository

Update the current version under `_specifications/lsp/<version>/`:

- the feature or shared-type Markdown;
- `specification.md` when a new topic must be included;
- `_data/specification-<major>-<minor>-toc.yml` when navigation changes;
- versioned message includes when the change affects shared messages;
- the change log when the protocol version gains a user-visible feature.

Keep prose examples and TypeScript snippets semantically aligned. Preserve
anchors and links when moving or renaming content.

### Node repository

Update only the layers required by the change:

- `types/src/main.ts` for serializable LSP data types and their public helpers;
- `protocol/src/common/protocol.ts` for shared protocol types, capabilities,
  imports, and exports;
- `protocol/src/common/protocol.<feature>.ts` for feature-specific messages;
- `protocol/src/common/api.ts` for public API exposure when needed;
- `client/src/common/` for client capability, registration, conversion, and
  middleware support;
- `server/src/common/` for typed server handlers and feature exposure;
- focused unit or integration tests for changed runtime behavior.

Not every wire change requires client or server feature code. Explain why a
layer is not applicable rather than adding empty plumbing.

## Regenerate and synchronize the meta model

After changing Node protocol or type sources:

1. Compile the affected Node workspaces.
2. From the Node `protocol` workspace, run `npm run compile:metaModelTool`.
3. From the Node repository root, run:
   - `npm run generate:metaModel`
   - `npm run generate:metaModelSchema`
4. Inspect the generated diff. Unexpected additions, omissions, reordered
   declarations, or lost documentation usually indicate an implementation or
   generator-modeling error; fix the source instead of hand-editing generated
   JSON.
5. Copy the intended generated artifacts to the current specification:
   - `protocol/metaModel.json` to
     `_specifications/lsp/<version>/metaModel/metaModel.json`;
   - `tools/src/metaModel.ts` to
     `_specifications/lsp/<version>/metaModel/metaModel.ts`;
   - `protocol/metaModel.schema.json` to
     `_specifications/lsp/<version>/metaModel/metaModel.schema.json`.
6. Run the bundled comparison from the specification root:

   `node .github/skills/lsp-node-protocol-consistency/scripts/compare-meta-model.mjs --node-repo <node-repository-root>`

The comparison is read-only. It compares JSON semantically so irrelevant
object-key ordering does not create false failures, while array ordering and
all values remain significant.

Meta-model equality is necessary but not sufficient. It does not prove that
normative prose, examples, client/server behavior, or runtime helpers agree.

## Validate

Use the smallest existing commands that cover the changed layers, escalating
only when needed:

- Node type changes: `npm run compile:types`, then the `types` lint and tests.
- Protocol changes: `npm run compile:protocol`, then the `protocol` lint and
  Node tests.
- Server changes: compile, lint, and test the `server` workspace.
- Client changes: compile and lint `client`; run the focused
  `client-node-tests` integration tests that exercise the feature.
- Specification Markdown, includes, or navigation: run
  `bundle exec jekyll build` when the repository's Ruby dependencies are
  available.
- Both repositories: run `git diff --check`.
- Always rerun the bundled meta-model comparison after synchronization.

Do not install or upgrade dependencies merely to complete an audit. If a
required existing tool is unavailable, report the exact validation that could
not run.

## Report the result

State:

- the two repository roots, branches, and target LSP version;
- the contract surfaces checked;
- files changed in each repository;
- generated artifacts synchronized;
- validation commands and outcomes;
- any unresolved divergence or validation gap.

For audits, report each mismatch with the specification evidence, Node
evidence, wire or API impact, and the recommended authoritative fix. Do not
claim consistency when only the meta-model files were compared.
