# https://github.com/libp2p/js-libp2p/issues/170

Launch server.js and then client.js in two different windows.

The client should print something similar to: `Result is 1.335171642752438`

Launch server_broken.js and then client.js in two different windows.

The client will throw `true` which indicates the server has closed the connection too early **even though only the connection client->server and NOT server->client (which is used for recieving the data) should have been closed**
