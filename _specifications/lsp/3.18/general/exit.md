#### <a href="#exit" name="exit" class="anchor">Exit Notification (:arrow_right:)</a>

A notification to ask the server to exit its process.
The server should exit with `success` code 0 if the shutdown request has been received before; otherwise with `error` code 1.

_Notification_:
* method: 'exit'
* params: void
