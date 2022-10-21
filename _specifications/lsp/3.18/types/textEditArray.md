#### <a href="#textEditArray" name="textEditArray" class="anchor"> TextEdit[] </a>

Complex text manipulations are described with an array of `TextEdit`'s or `AnnotatedTextEdit`'s, representing a single change to the document.

All text edits ranges refer to positions in the document the are computed on. They therefore move a document from state S1 to S2 without describing any intermediate state. Text edits ranges must never overlap, that means no part of the original document must be manipulated by more than one edit. However, it is possible that multiple edits have the same start position: multiple inserts, or any number of inserts followed by a single remove or replace edit. If multiple inserts have the same position, the order in the array defines the order in which the inserted strings appear in the resulting text.
