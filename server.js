const WebSocket = require('ws').Server;
const express = require('express');
var path = require('path');


//init Express
var app = express();

//init Express Router
var router = express.Router();
var port = process.env.PORT || 3000;

//return static page with websocket client

app.use(express.static('./'))

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

var server = app.listen(port, function () {
    console.log('node.js static server listening on port: ' + port + ", with websockets listener")
})

const wss = new WebSocket({ server });

// const server = new WebSocket.Server({ server: app.listen(3000) });
 
wss.on('connection', function connection(socket) {
	
	console.log("I have connected", socket)
	
	socket.on('message', function incoming(message) {

		wss.clients.forEach(client => {
	      client.send(message);
		});  
		console.log("received from a client: ", message)
	});  

	// server.send('Hello world!');

});
