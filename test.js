
const WebSocket = require('ws');
const express = require('express');
var path = require('path');
var ccxt = require("ccxt");
const axios = require('axios');
var moment = require("moment");
var binanceKey = require("./binance-key");



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

const wss = new WebSocket.Server({ server });



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


