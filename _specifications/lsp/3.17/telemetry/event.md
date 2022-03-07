#### <a href="#telemetry_event" name="telemetry_event" class="anchor">Telemetry Notification (:arrow_left:)</a>

The telemetry notification is sent from the server to the client to ask the client to log a telemetry event. The protocol doesn't specify the payload since no interpretation of the data happens in the protocol. Most clients even don't handle the event directly but forward them to the extensions owing the corresponding server issuing the event.

_Notification_:
* method: 'telemetry/event'
* params: 'object' \| 'number' \| 'boolean' \| 'string';
