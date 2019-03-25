// # create server
// # select crypto to track to track pricing data and make trades
// # select crypto exchange to track pricing data and make trades
// # select fiat pair to track forex rates
// # select forex rate exchange to pull exchange data from
// # pull pricing data from selected crypto exchanges every 1 minute
// # pull forex data from selected forex source every 1 hour
// # plot data as a live graph that updates every 1 minute
// # provide trade suggestions 
// # plot trade suggestions on graph updated every 1 minute
// # plot trade suggestions on the graph every 1 minute
// # make trades to selected trades based on key trade parameters - balance, trading amount, trading currency, trading direction, trading price
// # track balance after every trade
// # calculate profitability of every trade


// // # select crypto to track to track pricing data and make trades


const WebSocket = require('ws');
const express = require('express');
var path = require('path');
var ccxt = require("ccxt");
// console.log("ccxt")
// init context of params

context = {
	"selected_exchanges": {
		"exchange_1": "binance",
		"exchange_2": "coinjar",	
	},
	"crypto_exchange_parameters": {
		"coinjar": {
			"data_endpoint": "wss://feed.exchange.coinjar.com/socket/websocket",
			"heartbeat_freq": 4500,
			"heartbeat_message": '{ "topic": "phoenix", "event": "heartbeat", "payload": {}, "ref": 0 }',
			"channel_sub": '{ "topic": "ticker:BTCAUD", "event": "phx_join", "payload": {}, "ref": 0 }'
		}
	},
	"forex_parameters":{
		"forex_api": "http://www.apilayer.net/api/live?access_key=97ec6af4d54ae75ef9cf190f8706b6c7&currencies="
	},
	"selected_trading_pairs": {
		"crypto_1": "LTC/USD",
		"crypto_2": "LTC/AUD",
		"fiat_1": "AUD",
		"fiat_2": "USD"
	}
}

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

const wss = new WebSocket.Server({ server });

// const server = new WebSocket.Server({ server: app.listen(3000) });
 
wss.on('connection', function connection(socket) {
	
	// console.log("I have connected", socket)
	
	socket.on('message', function incoming(message) {

		wss.clients.forEach(client => {
	      client.send(message);
		});  
		console.log("received from a client: ", message)
	});  

	wss.send('Hello world!');
});


// establish connection with coinjar and pull data

var coinjarWss = new WebSocket(context["crypto_exchange_parameters"]["coinjar"]["data_endpoint"])

// coinjarWss.on("open", function connection(socket){
// 	console.log("I am have connected to coinjar")	

// 	// set heartbeat every 40 seconds - coinjar requires every 45 seconds
// 	setInterval(function(){
// 		coinjarWss.send(context["crypto_exchange_parameters"]["coinjar"]["heartbeat_message"]);
// 		console.log("sending heart beat!")
// 	}, context["crypto_exchange_parameters"]["coinjar"]["heartbeat_freq"])

// 	// get message from coinjar Socket

// 	coinjarWss.on('message', function incoming(message) {

// 		// coinjarWss.clients.forEach(client => {
// 	 //      client.send(message);
// 		// });  
// 		console.log("received from a client: ", message)
// 	});  

// 	coinjarWss.send(context["crypto_exchange_parameters"]["coinjar"]["channel_sub"]);

// })

// establish connection with binance

var exchangeObjOne = new ccxt[context.selected_exchanges.exchange_1]()

console.log("I am binance", exchangeObjOne);






