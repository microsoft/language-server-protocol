#### <a href="#textDocumentItem" name="textDocumentItem" class="anchor">TextDocumentItem</a>

An item to transfer a text document from the client to the server.

```typescript
interface TextDocumentItem {
	/**
	 * The text document's URI.
	 */
	uri: DocumentUri;

	/**
	 * The text document's language identifier.
	 */
	languageId: string;

	/**
	 * The version number of this document (it will increase after each
	 * change, including undo/redo).
	 */
	version: integer;

	/**
	 * The content of the opened text document.
	 */
	text: string;
}
```

Text documents have a language identifier to identify a document on the server side when it handles more than one language to avoid re-interpreting the file extension. If a document refers to one of the programming languages listed below it is recommended that clients use those ids.

Language | Identifier
-------- | ----------
Astro | `astro` (@since 3.19.0)
ABAP | `abap`
Windows Bat | `bat`
BibTeX | `bibtex`
Clojure | `clojure`
Coffeescript | `coffeescript`
C | `c`
C++ | `cpp`
C# | `csharp`
CSS | `css`
D | `d` (@since 3.18.0)
Dotenv | `dotenv` (@since 3.19.0)
Delphi | `pascal` (@since 3.18.0)
Diff | `diff`
Dart | `dart`
Dockerfile | `dockerfile`
Elixir | `elixir`
Erlang | `erlang`
F# | `fsharp`
Git | `git-commit` and `git-rebase`
Glimmer JS | `glimmer-js` (@since 3.19.0)
Glimmer TS | `glimmer-ts` (@since 3.19.0)
Go | `go`
GraphQL | `graphql` (@since 3.19.0)
Groovy | `groovy`
Handlebars | `handlebars`
Haskell | `haskell`
HTML | `html`
Ini | `ini`
Java | `java`
JavaScript | `javascript`
JavaScript React | `javascriptreact`
JSON | `json`
LaTeX | `latex`
Less | `less`
Lua | `lua`
Makefile | `makefile`
Markdown | `markdown`
MDX | `mdx` (@since 3.19.0)
Objective-C | `objective-c`
Objective-C++ | `objective-cpp`
Pascal | `pascal` (@since 3.18.0)
Perl | `perl`
Perl 6 | `perl6`
PHP | `php`
Plaintext | `plaintext`
Powershell | `powershell`
Pug | `jade`
Python | `python`
R | `r`
Razor (cshtml) | `razor`
reStructuredText | `restructuredtext` (@since 3.19.0)
Ruby | `ruby`
Rust | `rust`
SCSS | `scss` (syntax using curly brackets), `sass` (indented syntax)
Scala | `scala`
ShaderLab | `shaderlab`
Shell Script (Bash) | `shellscript`
SQL | `sql`
Svelte | `svelte` (@since 3.19.0)
Swift | `swift`
TypeScript | `typescript`
TypeScript React| `typescriptreact`
TeX | `tex`
Text (plain) | `plaintext`
Visual Basic | `vb`
Vue | `vue` (@since 3.19.0)
XML | `xml`
XSL | `xsl`
YAML | `yaml`
{: .table .table-bordered .table-responsive}
