
var express = require('express');
var path = require('path');
var app = express();
var server = require('http').createServer(app);


// app.use('/', express.static(path.join(__dirname, '/index-backup.html')));
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index-backup.html'));
});

app.use(express.static('./'))

var io = require('socket.io')(server);


io.on('connection', function(client) {

    client.on('disconnect', function() {
	    console.log("disconnected")
    });


    client.on('room', function(data) {
        client.join(data.roomId);
        console.log(' Client joined the room and client id is '+ client.id);

    });
    
    
    client.on('toBackEnd', function(data) {
        client.in(data.roomId).emit('message', data);
    })

});

server.listen(3000, function () {
    console.log('node.js static server listening on port: ' + 3000 + ", fdafdafaw with websockets listener")
});







// const WebSocket = require('ws');
// const express = require('express');
// var path = require('path');
// var ccxt = require("ccxt");
// const axios = require('axios');
// var moment = require("moment");
// var binanceKey = require("./binance-key");



// var app = express();

// //init Express Router
// var router = express.Router();
// var port = process.env.PORT || 3000;

// //return static page with websocket client

// app.use(express.static('./'))

// app.get('/', function(req, res) {
//     res.sendFile(path.join(__dirname + '/index.html'));
// });

// var server = app.listen(port, function () {
//     console.log('node.js static server listening on port: ' + port + ", with websockets listener")
// })

// const wss = new WebSocket.Server({ server });

// wss.on('connection', ws => {
// 	console.log("connected!")
//   ws.on('message', message => {
//     console.log(`Received message => ${message}`)
//   })
//   ws.on("error", function(err){
//   	console.error("error", err)
//   })
//   ws.send('Hello! Message From Server!!')
// })



// wss.on('open', function open() {
//   console.log("OPENED");
//   wss.send('opened, something');
// });

// wss.on('connection', ws => {
	
// // console.log("CONNECTED TO CLIENT!")
//   // ws.send('Hello! Message From Server!!')

//   ws.on('message', message => {
//     console.log(`Received message => ${message}`)
//     ws.send(JSON.stringify("here is the reply"))
//   })

//   ws.on("error", function(err){
//   	console.error("error", err)
//   })
  
// })

// wss.on('open', function open() {
//   console.log("oepned");
//   wss.send('opened, something');
// });


// var ccxt = require("ccxt");

// // (() => async function () {


// //     let allMarkets = await binance.loadMarkets()

// //     console.log(allMarkets)


// // }) ()

// let binance = new ccxt.binance()
// var fs = require("fs");

// // var data = "New File Contents";




// var allMarkets;
// var array;

// var i

// var start = async function (){

// 	allMarkets = await binance.loadMarkets();
// 	// console.log("I am allMarkets", Object.keys(allMarkets))

// 	console.log("in the async", Object.keys(allMarkets))
// 	// return Object.keys(allMarkets)
// 	array = Object.keys(allMarkets);

// 	fs.writeFile("temp.txt", array, (err) => {
// 	  if (err) console.log(err);
// 	  console.log("Successfully Written to File.");
// 	});

// };

// start();

// console.log("array", array);


