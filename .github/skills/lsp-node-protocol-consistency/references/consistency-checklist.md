# Consistency checklist

Use this reference after identifying the feature or types in scope.

## Surface map

| Concern | Specification repository | Node repository |
| --- | --- | --- |
| Current version | `_data/specifications.yml` | `protocol/package.json` and meta-model metadata |
| Feature prose and snippets | `_specifications/lsp/<version>/<area>/<feature>.md` | Relevant files below |
| Shared wire data | Feature or `types/*.md` pages | `types/src/main.ts` |
| Request or notification | Feature page | `protocol/src/common/protocol.<feature>.ts` or `protocol.ts` |
| Capabilities | Feature page and `general/initialize.md` | `ClientCapabilities` and `ServerCapabilities` in protocol sources |
| Public protocol exports | TypeScript snippets imply public names | `protocol/src/common/protocol.ts` and `api.ts` |
| Client integration | Normative client behavior | `client/src/common/`, converters, middleware, and tests |
| Server integration | Normative server behavior | `server/src/common/` and tests |
| Machine-readable contract | `metaModel/metaModel.json` | Generated `protocol/metaModel.json` |
| Meta-model types | `metaModel/metaModel.ts` | `tools/src/metaModel.ts` |
| Meta-model schema | `metaModel/metaModel.schema.json` | Generated `protocol/metaModel.schema.json` |
| Navigation and release notes | Version TOC and change log | Usually not applicable |

The Node meta-model generator reads the protocol TypeScript program, including
types imported from `@vscode/languageserver-types`. A missing generated entry
can therefore originate in either `types/src/main.ts`, protocol declarations,
exports, or generator-recognition conventions.

## Request and notification checks

- Exact method string, including `$`, slashes, and casing.
- Correct direction.
- Request versus notification.
- Parameter type and whether parameters may be omitted.
- Result type, including `null`, arrays, and unions.
- Partial-result and work-done-progress types.
- Error-data type when protocol-specific.
- Registration-options type.
- Client capability path.
- Server capability path.
- Static registration identifier support.
- Dynamic registration support.
- Cancellation and retrigger behavior stated in prose.

## Type checks

- Public type name and link target.
- Structure inheritance or intersection members.
- Every property name and documentation.
- Required versus optional.
- Nullable versus non-nullable.
- Primitive kind, especially `integer`, `uinteger`, and `decimal`.
- Array element type and map key/value types.
- Union alternatives and literal values.
- Enum representation and exact numeric or string values.
- Recursive references and aliases.
- Serialization shape; helper factories and guards must not change it.
- `@since`, `@deprecated`, and `@proposed` metadata.

Type aliases and interfaces can be equivalent. Compare their resulting wire
shapes rather than requiring the same TypeScript syntax. Conversely, do not
treat `property?: T` as equivalent to `property: T | null`.

## Capability and registration checks

- Client capability is nested under the documented path.
- Server capability uses the documented property and value type.
- Boolean shorthand is supported only when the specification permits it.
- Registration options include the documented selector and static ID mixins.
- The message descriptor uses the same registration-options type.
- Client code advertises and consumes the capability consistently.
- Server APIs expose handlers only for valid directions.

## Stability and version checks

- New stable additions carry the intended `@since <major>.<minor>.<patch>`.
- Proposed declarations remain marked proposed on both sides.
- Finalizing a proposal removes proposal markers and moves/exports declarations
  according to established Node conventions.
- Deprecation text names the replacement when one exists.
- Patch-level corrections do not accidentally claim a new minor version.
- Previous specification versions stay unchanged unless the task explicitly
  corrects historical documentation.
- Package version bumps are release work and are not implied by a contract
  consistency fix.

## Runtime integration checks

Apply these only when the Node client or server implements the feature:

- Public feature registration and initialization.
- Protocol-to-editor and editor-to-protocol conversion.
- Middleware or handler signatures.
- Cancellation-token propagation.
- Partial-result and progress handling.
- Dynamic registration and unregistration.
- Capability negotiation and fallback behavior.
- Node and browser entry-point exposure where applicable.
- Focused tests for serialization, conversion, registration, and handlers.

## Completion gate

Consistency is established only when:

1. the normative prose and snippets describe the intended behavior;
2. Node wire declarations encode the same contract;
3. applicable client/server behavior honors it;
4. generated Node meta-model artifacts are current;
5. specification meta-model mirrors match semantically;
6. affected builds, lints, and tests pass;
7. no unexplained divergence remains in either repository.
