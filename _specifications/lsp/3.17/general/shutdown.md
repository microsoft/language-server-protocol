#### <a href="#shutdown" name="shutdown" class="anchor">Shutdown Request (:leftwards_arrow_with_hook:)</a>

The shutdown request is sent from the client to the server. It asks the server to shut down, but to not exit (otherwise the response might not be delivered correctly to the client). There is a separate exit notification that asks the server to exit. Clients must not send any notifications other than `exit` or requests to a server to which they have sent a shutdown request. Clients should also wait with sending the `exit` notification until they have received a response from the `shutdown` request.

If a server receives requests after a shutdown request those requests should error with `InvalidRequest`.

_Request_:
* method: 'shutdown'
* params: void

_Response_:
* result: null
* error: code and message set in case an exception happens during shutdown request.
