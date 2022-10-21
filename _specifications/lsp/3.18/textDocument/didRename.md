#### <a href="#textDocument_didRename" name="textDocument_didRename" class="anchor">Renaming a document</a>

Document renames should be signaled to a server sending a document close notification with the document's old name followed by a open notification using the document's new name. Major reason is that besides the name other attributes can change as well like the language that is associated with the document. In addition the new document could not be of interest for the server anymore.

Servers can participate in a document rename by subscribing for the [`workspace/didRenameFiles`](#workspace_didRenameFiles) notification or the [`workspace/willRenameFiles`](#workspace_willRenameFiles) request.
