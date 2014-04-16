"use strict";

// Port where we'll run the websocket server
var PORT = 31337;
 
// websocket and http servers
var webSocketServer = require('websocket').server;
var http = require('http');

exports.start = function(onClient) {
    var server = http.createServer(function(request, response) {
    });
    
    server.listen(PORT, function() {
        console.log('Server is listening on port ' + PORT);
    });
     
    var wsServer = new webSocketServer({
        httpServer: server
    });
     
    wsServer.on('request', function(request) {
        //TODO: check origin
        console.log((new Date()) + ' Connection from origin ' + request.origin + '.');

        onClient(request.accept(null, request.origin));
    });
}
