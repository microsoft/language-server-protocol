/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';

import * as lsp from 'vscode-languageserver-protocol';

/**
 * An `Id` to identify a vertex or an edge.
 */
export type Id = number | string;

/**
 * An element in the graph.
 */
export interface Element {
	id: Id;
	type: 'vertex' | 'edge';
}

/**
 * All know vertices literal types.
 */
export type VertexLiterals =
	'metaData' |
	'project' |
	'range' |
	'location' |
	'document' |
	'externalImportItem' |
	'externalImportResult' |
	'exportItem' |
	'exportResult' |
	'resultSet' |
	'documentSymbolResult' |
	'foldingRangeResult' |
	'documentLinkResult' |
	'diagnosticResult' |
	'declarationResult' |
	'definitionResult' |
	'typeDefinitionResult' |
	'hoverResult' |
	'referenceResult' |
	'implementationResult';

/**
 * Uris are currently stored as strings.
 */
export type Uri = string;

export interface V extends Element {
	id: Id;
	type: 'vertex';
	label: VertexLiterals;
}

/**
 * A result set acts as a hub to share n LSP request results
 * between different ranges.
 */
export interface ResultSet extends V {

	label: 'resultSet';
}

/**
 * All know range tag literal types.
 */
export type RangeTagLiterals = 'declaration' | 'definition' | 'reference' | 'unknown';

/**
 * The range represents a declaration.
 */
export interface DeclarationTag {

	/**
	 * A type identifier for the declaration tag.
	 */
	type: 'declaration';

	/**
	 * The text covered by the range.
	 */
	text: string;

	/**
	 * The symbol kind.
	 */
	kind: lsp.SymbolKind;

	/**
	 * Indicates if this symbol is deprecated.
	 */
	deprecated?: boolean;

	/**
	 * The full range of the declaration not including leading/trailing whitespace but everything else, e.g comments and code.
	 * The range must be included in fullRange.
	 */
	fullRange: lsp.Range;

	/**
	 * Optional detail information for the declaration.
	 */
	detail?: string;
}

/**
 * The range represents a definition
 */
export interface DefinitionTag {
	/**
	 * A type identifier for the declaration tag.
	 */
	type: 'definition';

	/**
	 * The text covered by the range
	 */
	text: string;

	/**
	 * The symbol kind.
	 */
	kind: lsp.SymbolKind;

	/**
	 * Indicates if this symbol is deprecated.
	 */
	deprecated?: boolean;

	/**
	 * The full range of the definition not including leading/trailing whitespace but everything else, e.g comments and code.
	 * The range must be included in fullRange.
	 */
	fullRange: lsp.Range;

	/**
	 * Optional detail information for the definition.
	 */
	detail?: string;
}

/**
 * The range represents a reference.
 */
export interface ReferenceTag {

	/**
	 * A type identifier for the reference tag.
	 */
	type: 'reference';

	/**
	 * The text covered by the range.
	 */
	text: string;
}

/**
 * The type of the range is unknown.
 */
export interface UnknownTag {

	/**
	 * A type identifier for the unknown tag.
	 */
	type: 'unknown';

	/**
	 * The text covered by the range.
	 */
	text: string;
}

/**
 * All available range tag types.
 */
export type RangeTag = DefinitionTag | DeclarationTag | ReferenceTag | UnknownTag;

/**
 * The const definitions for range tags.
 */
export namespace RangeTag {
	/** definition tag */
	export const definition: 'definition' = 'definition';
	/** declaration tag */
	export const declaration: 'declaration' = 'declaration';
	/** reference tag */
	export const reference: 'reference' = 'reference';
	/** unknown tag */
	export const unknown: 'unknown' = 'unknown';
}

/**
 * A vertex representing a range inside a document.
 */
export interface Range extends V, lsp.Range {

	label: 'range';

	/**
	 * Some optional meta data for the range.
	 */
	tag?: RangeTag;
}

/**
 * The id type of the range is a normal id.
 */
export type RangeId = Id;

/**
 * A range representing a definition.
 */
export interface DefinitionRange extends Range {
	/**
	 * The definition meta data.
	 */
	tag: DefinitionTag;
}

/**
 * A range representing a declaration.
 */
export interface DeclarationRange extends Range {
	/**
	 * The declaration meta data.
	 */
	tag: DeclarationTag;
}

/**
 * A range representing a reference.
 */
export interface ReferenceRange extends Range {
	/**
	 * The reference meta data.
	 */
	tag: ReferenceTag;
}

/**
 * A location emittable in LSIF. It has no uri since
 * like ranges locations should be connected to a document
 * using a `contains`edge.
 */
export interface Location extends V {
	/**
	 * The label property.
	 */
	label: 'location';

	/**
	 * The location's range
	 */
	range: lsp.Range;
}

/**
 * The meta data vertex.
 */
export interface MetaData extends V {

	/**
	 * The label property.
	 */
	label: 'metaData';

	/**
	 * The dump version
	 */
	version: string;
}


export type AdditionDataValueType = string | number | boolean | string[] | number[] | boolean[];
export interface AdditionalData {
	[key: string]: AdditionDataValueType | AdditionalData | AdditionalData[];
}

/**
 * A document tag allows Indexers to tag documents for special
 * purposes
 */
export interface ProjectData extends AdditionalData {
}

/**
 * A project vertex.
 */
export interface Project extends V {

	/**
	 * The label property.
	 */
	label: 'project';

	/**
	 * The project kind like 'typescript' or 'csharp'. See also the language ids
	 * in the [specification](https://microsoft.github.io/language-server-protocol/specification)
	 */
	kind: string;

	/**
	 * The resource URI of the project file.
	 */
	resource?: Uri;

	/**
	 * Optional project data specific to the programming language.
	 */
	data?: ProjectData;

	/**
	 * Optional the content of the project file, `base64` encoded.
	 */
	contents?: string;
}

/**
 * A document tag allows Indexers to tag documents for special
 * purposes
 */
export interface DocumentData extends AdditionalData {
}

export type DocumentId = Id;

/**
 * A vertex representing a document in the project
 */
export interface Document extends V {

	/**
	 * The label property.
	 */
	label: 'document';

	/**
	 * The Uri of the document.
	 */
	uri: Uri;

	/**
	 * The document's language Id as defined in the LSP
	 * (https://microsoft.github.io/language-server-protocol/specification)
	 */
	languageId: string;

	/**
	 * Optional document data specific to the programming language.
	 */
	data?: DocumentData;

	/**
	 * Optional the content of the document, `based64` encoded
	 */
	contents?: string;
}

export namespace inline {

	export interface ExternalImportItem {
		/**
		 * A position independent handle to identify a range in a document.
		 */
		moniker: string;

		/**
		 * The range ids this moniker refers to.
		 */
		rangeIds: RangeId[];
	}

	export interface ExportItem {
		/**
		 * A position independent handle to identify a range in a document.
		 */
		moniker: string;

		/**
		 * The range ids this moniker refers to.
		 */
		rangeIds: RangeId[];
	}
}

/**
 * An item in the external export result.
 */
export interface ExternalImportItem extends inline.ExternalImportItem, V {

	label: 'externalImportItem';
}

export type ExternalImportResultId = Id;

/**
 * The imported items of a document. The imported items can either
 * be inlined or added to the import result using an item edge.
 */
export interface ExternalImportResult extends V {

	label: 'externalImportResult';

	/**
	 * The result when inlined.
	 */
	result?: inline.ExternalImportItem[];
}


/**
 * An item in a export result.
 */
export interface ExportItem extends inline.ExportItem, V {

	label: 'exportItem';
}

export type ExportResultId = Id;

/**
 * The exported items of a document. The export items can either
 * be inlined or added to the export result using an item edge.
 */
export interface ExportResult extends V {

	label: 'exportResult';

	/**
	 * The result when inlined.
	 */
	result?: inline.ExportItem[];
}

/**
 * A range based document symbol. This allows to reuse already
 * emitted ranges with a `declaration` tag in a document symbol
 * result.
 */
export interface RangeBasedDocumentSymbol {
	/**
	 * The range to reference.
	 */
	id: RangeId

	/**
	 * The child symbols.
	 */
	children?: RangeBasedDocumentSymbol[];
}

/**
 * A vertex representing the document symbol result.
 */
export interface DocumentSymbolResult extends V {

	label: 'documentSymbolResult';

	result: lsp.DocumentSymbol[] | RangeBasedDocumentSymbol[];
}

/**
 * A vertex representing a diagnostic result.
 */
export interface DiagnosticResult extends V {

	/**
	 * The label property.
	 */
	label: 'diagnosticResult';

	/**
	 * The diagnostics.
	 */
	result: lsp.Diagnostic[];
}

/**
 * A vertex representing a folding range result.
 */
export interface FoldingRangeResult extends V {

	/**
	 * The label property.
	 */
	label: 'foldingRangeResult';

	/**
	 * The actual folding ranges.
	 */
	result: lsp.FoldingRange[];
}

/**
 * A vertex representing a document link result.
 */
export interface DocumentLinkResult extends V {

	/**
	 * The label property.
	 */
	label: 'documentLinkResult';

	/**
	 * The actual document links.
	 */
	result: lsp.DocumentLink[];
}

/**
 * The LSP defines the result of a `textDocument/definition` request as
 * `Location | Location[]. In the SIP we allow to use range ids as well.
 */
export type DeclarationResultTypeSingle = RangeId | lsp.Location;
export type DeclarationResultTypeMany = (RangeId | lsp.Location)[];
export type DeclarationResultType = DeclarationResultTypeSingle | DeclarationResultTypeMany;

export interface DeclarationResult extends V {
	/**
	 * The label property.
	 */
	label: 'declarationResult';

	/**
	 * The actual result.
	 */
	result: DeclarationResultType;
}

/**
 * The LSP defines the result of a `textDocument/definition` request as
 * `Location | Location[]. In the SIP we allow to use range ids as well.
 */
export type DefinitionResultTypeSingle = RangeId | lsp.Location;
export type DefinitionResultTypeMany = (RangeId | lsp.Location)[];
export type DefinitionResultType = DefinitionResultTypeSingle | DefinitionResultTypeMany;

/**
 * A vertex representing a definition result.
 */
export interface DefinitionResult extends V {
	/**
	 * The label property.
	 */
	label: 'definitionResult';

	/**
	 * The actual result.
	 */
	result: DefinitionResultType;
}

/**
 * The LSP defines the result of a `textDocument/typeDefinition` request as
 * `Location | Location[]. In the SIP we allow to use range ids as well.
 */
export type TypeDefinitionResultTypeSingle = RangeId | lsp.Location;
export type TypeDefinitionResultTypeMany = (RangeId | lsp.Location)[];
export type TypeDefinitionResultType = TypeDefinitionResultTypeSingle | TypeDefinitionResultTypeMany;

/**
 * A vertex representing a type definition result.
 */
export interface TypeDefinitionResult extends V {

	/**
	 * The label property.
	 */
	label: 'typeDefinitionResult';

	/**
	 * The actual result.
	 */
	result: TypeDefinitionResultType;
}

/**
 * A vertex representing a Hover.
 *
 * Extends the `Hover` type defined in LSP.
 */
export interface HoverResult extends V {

	/**
	 * The label property.
	 */
	label: 'hoverResult';

	/**
	 * The hover result. This is the normal LSP hover result.
	 */
	result: lsp.Hover;
}

/**
 * The id type of a reference result is a normal id.
 */
export type ReferenceResultId = Id;

/**
 * A vertex representing a reference result.
 */
export interface ReferenceResult extends V {

	/**
	 * The label property.
	 */
	label: 'referenceResult';

	/**
	 * The declarations belonging to the reference result.
	 */
	declarations?: (RangeId | lsp.Location)[];

	/**
	 * The definitions belonging to the reference result.
	 */
	definitions?: (RangeId | lsp.Location)[];

	/**
	 * The references belonging to the reference result.
	 */
	references?: (RangeId | lsp.Location)[];

	/**
	 * The reference results belonging to this reference result.
	 */
	referenceResults?: ReferenceResultId[];
}


/**
 * The id type of an implementation result is a normal id.
 */
export type ImplementationResultId = Id;

/**
 * A vertex representing an implementation result.
 */
export interface ImplementationResult extends V {

	/**
	 * The label property.
	 */
	label: 'implementationResult';

	/**
	 * The ranges and locations belong to the implementation result.
	 */
	result?: (RangeId | lsp.Location)[];

	/**
	 * The other implementation results belonging to this result.
	 */
	implementationResults?: ImplementationResultId[];
}

/**
 * All available vertex types
 */
export type Vertex =
	MetaData |
	Project |
	Document |
	ExternalImportItem |
	ExternalImportResult |
	ExportItem |
	ExportResult |
	ResultSet |
	Range |
	DocumentSymbolResult |
	FoldingRangeResult |
	DocumentLinkResult |
	DiagnosticResult |
	DefinitionResult |
	DeclarationResult |
	TypeDefinitionResult |
	HoverResult |
	ReferenceResult |
	ImplementationResult;

/**
 * All know edge literal types.
 */
export type EdgeLiterals =
	'contains' |
	'item' |
	'refersTo' |
	'exports' |
	'imports' |
	'textDocument/documentSymbol' |
	'textDocument/foldingRange' |
	'textDocument/documentLink' |
	'textDocument/diagnostic' |
	'textDocument/definition' |
	'textDocument/declaration' |
	'textDocument/typeDefinition' |
	'textDocument/hover' |
	'textDocument/references' |
	'textDocument/implementation';

/**
 * A common base type of all edge types. The type parameters `S` and `T` are for typing and
 * documentation purpose only. An edge never holds a direct reference to a vertex. They are
 * referenced by `Id`.
 */
export interface E<S extends V, T extends V, K extends EdgeLiterals> extends Element {
	/* The brand.  This is only necessary to make make type instantiation differ from each other. */
	_?: [S, T];
	id: Id;
	type: 'edge';
	label: K;

	/**
	 * The id of the from Vertex.
	 */
	outV: Id;

	/**
	 * The id of the to Vertex.
	 */
	inV: Id;
}

export interface ItemEdge<S extends V, T extends V> extends E<S, T, 'item'> {
	property?: string;
}

/**
 * An edge expressing containment relationship. The relationship exist between:
 *
 * - `Project` -> `Document`
 * - `Package` -> `Document`
 * - `Document` -> `Range`
 */
export type contains = E<Project, Document, 'contains'> | E<Document, Range, 'contains'>;

/**
 * An edge associating a range with a result set. The relationship exists between:
 *
 * - `Range` -> `ResultSet`
 */
export type refersTo = E<Range, ResultSet, 'refersTo'>;

/**
 * An edge associating a export result with a document. The relationship exists between:
 *
 * - `Document` -> `ExportResult`
 */
export type $exports = E<Document, ExportResult, 'exports'>;

/**
 * An edge associating a external import result with a document. The relationship exists between:
 *
 * - `Document` -> `ExternalImportResult`
 */
export type $imports = E<Document, ExternalImportResult, 'imports'>;

/**
 * An edge representing a item in a result set. The relationship exists between:
 *
 * - `ReferenceResult` -> `Range`
 * - `ReferenceResult` -> `ReferenceResult`
 * - `ExportResult` -> `ExportResultItem`
 * - `ExternalImportResult` -> `ExternalImportItem`
 */
export type item = ItemEdge<ReferenceResult, Range> | ItemEdge<ReferenceResult, ReferenceResult> | ItemEdge<ExportResult, ExportItem> | ItemEdge<ExternalImportResult, ExternalImportItem>;

/**
 * An edge representing a `textDocument/documentSymbol` relationship. The relationship exists between:
 *
 * - `Document` -> `DocumentSymbolResult`
 */
export type textDocument_documentSymbol = E<Document, DocumentSymbolResult, 'textDocument/documentSymbol'>;

/**
 * An edge representing a `textDocument/foldingRange` relationship. The relationship exists between:
 *
 * - `Document` -> `FoldingRangeResult`
 */
export type textDocument_foldingRange = E<Document, FoldingRangeResult, 'textDocument/foldingRange'>;

/**
 * An edge representing a `textDocument/documentLink` relationship. The relationship exists between:
 *
 * - `Document` -> `DocumentLinkResult`
 */
export type textDocument_documentLink = E<Document, DocumentLinkResult, 'textDocument/documentLink'>;

/**
 * An edge representing a `textDocument/diagnostic` relationship. The relationship exists between:
 *
 * - `Project` -> `DiagnosticResult`
 * - `Document` -> `DiagnosticResult`
 */
export type textDocument_diagnostic = E<Project, DiagnosticResult, 'textDocument/diagnostic'> | E<Document, DiagnosticResult, 'textDocument/diagnostic'>;

/**
 * An edge representing a declaration relationship. The relationship exists between:
 *
 * - `Range` -> `DefinitionResult`
 * - `ResultSet` -> `DefinitionResult`
 */
export type textDocument_declaration = E<Range, DeclarationResult, 'textDocument/declaration'> | E<ResultSet, DeclarationResult, 'textDocument/declaration'>;

/**
 * An edge representing a definition relationship. The relationship exists between:
 *
 * - `Range` -> `DefinitionResult`
 * - `ResultSet` -> `DefinitionResult`
 */
export type textDocument_definition = E<Range, DefinitionResult, 'textDocument/definition'> | E<ResultSet, DefinitionResult, 'textDocument/definition'>;

/**
 * An edge representing a type definition relations ship. The relationship exists between:
 *
 * - `Range` -> `TypeDefinitionResult`
 * - `ResultSet` -> `TypeDefinitionResult`
 */
export type textDocument_typeDefinition = E<Range, TypeDefinitionResult, 'textDocument/typeDefinition'> | E<ResultSet, TypeDefinitionResult, 'textDocument/typeDefinition'>;

/**
 * An edge representing a hover relationship. The relationship exists between:
 *
 * - `Range` -> `HoverResult`
 * - `ResultSet` -> `HoverResult`
 */
export type textDocument_hover = E<Range, HoverResult, 'textDocument/hover'> | E<ResultSet, HoverResult, 'textDocument/hover'>;

/**
 * An edge representing a references relationship. The relationship exists between:
 *
 * - `Range` -> `ReferenceResult`
 * - `ResultSet` -> `ReferenceResult`
 */
export type textDocument_references = E<Range, ReferenceResult, 'textDocument/references'> | E<ResultSet, ReferenceResult, 'textDocument/references'>;

/**
 * An edge representing a implementation relationship. The relationship exists between:
 *
 * - `Range` -> `ImplementationResult`
 * - `ResultSet` -> `ImplementationResult`
 */
export type textDocument_implementation = E<Range, ImplementationResult, 'textDocument/implementation'> | E<ResultSet, ImplementationResult, 'textDocument/implementation'>;

/**
 *
 * All available Edge types.
 */
export type Edge =
	contains |
	item |
	refersTo |
	$exports |
	$imports |
	textDocument_documentSymbol |
	textDocument_foldingRange |
	textDocument_documentLink |
	textDocument_diagnostic |
	textDocument_definition |
	textDocument_typeDefinition |
	textDocument_hover |
	textDocument_references |
	textDocument_implementation;
