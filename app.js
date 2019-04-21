const WebSocket = require('ws');
const express = require('express');
var path = require('path');
var ccxt = require("ccxt");
const axios = require('axios');
var moment = require("moment");


var context = {
	"selected_exchanges": {
		"exchange_1": "binance",
		"exchange_2": "coinjar",	
	},
	"crypto_exchange_parameters": {
		"coinjar": {
			"name": "coinjar",
			"data_endpoint": "wss://feed.exchange.coinjar.com/socket/websocket",
			"heartbeat_freq": 40000,
			"heartbeat_message": '{ "topic": "phoenix", "event": "heartbeat", "payload": {}, "ref": 0 }',
			"channel_sub": {
				"BTCUSD": '{ "topic": "trades:BTCUSD", "event": "phx_join", "payload": {}, "ref": 0 }',
				"ZECUSD": '{ "topic": "trades:ZECUSD", "event": "phx_join", "payload": {}, "ref": 0 }',
				"BTCAUD": '{ "topic": "trades:BTCAUD", "event": "phx_join", "payload": {}, "ref": 0 }',
				"LTCAUD": '{ "topic": "trades:LTCAUD", "event": "phx_join", "payload": {}, "ref": 0 }',
				"ZECAUD": '{ "topic": "trades:ZECAUD", "event": "phx_join", "payload": {}, "ref": 0 }'
			}, 
			"slippage": 0.01,
			"fees": 0.001,
			"current_fiat": 5000,
			"current_crypto": 100
		},
		"binance" :{
			"name": "binance",
			"data_endpoint": "wss://stream.binance.com:9443/",
			"heartbeat_freq": 3 * 60 * 1000,
			"channel_sub": {
				"BTCUSD": "BTCUSDT",
				"ZECUSD": "ZECUSDT",
				"LTCUSD": "LTCUSDT"
			},
			"slippage": 0.005,
			"fees": 0.001,
			"current_fiat": 5000,
			"currentLTCAUD_crypto": 100,
			"time_sync_adjustment" : (8 * 60 * 60 + 19 * 60 + 55)
		}
	},
	"forex_parameters":{
		"forex_api": "http://www.apilayer.net/api/live?access_key=97ec6af4d54ae75ef9cf190f8706b6c7&currencies=AUD"
	},
	"selected_trading_pairs": {
		"crypto_1": "LTC/USDT",
		"crypto_2": "LTC/AUD",
		"fiat_1": "AUD",
		"fiat_2": "USD"
	},
	"marginOfError": 0.01,
	"amountToTrade": 0.05,
	"trading_data": {
		"binance": {
			"BTCAUD" : [],
			"LTCAUD" : [],
			"ZECAUD" : [] 
		},
		"coinjar":[],
		"AUDUSD":[]
	}
};


// graph of data points for each trading pair

// trading_data: {
	// binance: 
		//{
			// data: [
			// 			{
					//   "e": "trade",     // Event type
					//   "E": 123456789,   // Event time
					//   "s": "BNBBTC",    // Symbol
					//   "t": 12345,       // Trade ID
					//   "p": "0.001",     // Price
					//   "q": "100",       // Quantity
					//   "b": 88,          // Buyer order ID
					//   "a": 50,          // Seller order ID
					//   "T": 123456785,   // Trade time
					//   "m": true,        // Is the buyer the market maker?
					//   "M": true         // Ignore
					// }
					// ]
		//},
	// coinjar: 
	// 	//{
			// data: [
			// 			{
					//   "e": "trade",     // Event type
					//   "E": 123456789,   // Event time
					//   "s": "BNBBTC",    // Symbol
					//   "t": 12345,       // Trade ID
					//   "p": "0.001",     // Price
					//   "q": "100",       // Quantity
					//   "b": 88,          // Buyer order ID
					//   "a": 50,          // Seller order ID
					//   "T": 123456785,   // Trade time
					//   "m": true,        // Is the buyer the market maker?
					//   "M": true         // Ignore
					// }
					// ]
		//}
// }


//  start app server on websocket 

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
});
 


//Return data to the app client

const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(clientsocket) {
	console.log("Arbiter client connected", clientsocket);
});

//  get data feed from Coinjar
//  LTC, BTC, zCash, Ripple


// establish connection with coinjar and pull data
	// Format of client return
	// {"topic":"ticker:LTCAUD","ref":null,"payload":{"volume":"181.00000000","transition_time":"2019-04-04T07:50:00Z","status":"continuous","session":11800,"prev_close":"117.80000000","last":"122.30000000","current_time":"2019-04-04T05:59:11.670951Z","bid":"116.40000000","ask":"122.10000000"},"event":"update"}


var coinjarWss = new WebSocket(context["crypto_exchange_parameters"]["coinjar"]["data_endpoint"]);

coinjarWss.on("open", function connection(socket){
	console.log("Server connected to coinjar")	

	// set heartbeat every 40 seconds - coinjar requires every 45 seconds
	setInterval(function(){
		coinjarWss.send(context["crypto_exchange_parameters"]["coinjar"]["heartbeat_message"]);
		// console.log("sending heart beat!")
	}, context["crypto_exchange_parameters"]["coinjar"]["heartbeat_freq"])


	// subscribe to coinjar token channel
	// coinjarWss.send(context["crypto_exchange_parameters"]["coinjar"]["channel_sub"]["BTCUSD"]);
	// coinjarWss.send(context["crypto_exchange_parameters"]["coinjar"]["channel_sub"]["ZECUSD"]);
	coinjarWss.send(context["crypto_exchange_parameters"]["coinjar"]["channel_sub"]["BTCAUD"]);
	coinjarWss.send(context["crypto_exchange_parameters"]["coinjar"]["channel_sub"]["LTCAUD"]);
	coinjarWss.send(context["crypto_exchange_parameters"]["coinjar"]["channel_sub"]["ZECAUD"]);


	// get message from coinjar Socket

	coinjarWss.on('message', function incoming(message) {
		
		coinjarDataObj = JSON.parse(message);
		coinjarData = coinjarDataObj["payload"]
		
		if (coinjarDataObj["topic"] !== "phoenix") {
			console.log("received data from coinjar", coinjarDataObj)
		}


		// send data to graphing client

		// if (coinjarData["status"] == "continuous") {
		// 	var coinjarDate = moment(coinjarData.current_time).unix();
			
		// 	console.log("coinjardate", coinjarDate)
			
		// 	dataJSON = 

		// 	{
		// 		type : "trade",
		// 		coinjar : {
		// 			name : "coinjar",
		// 			type : "trade",
		// 			data : {
		// 				x : coinjarDate,
		// 				y : coinjarData.last /latestAUDUSDrate
		// 			}	
		// 		},
		// 		binance: {
		// 			name : "binance",
		// 			type : "trade",
		// 			data: {
		// 				x : latestBinanceDate,
		// 				y : latestBinancePriceUSD
		// 			}
		// 		}
		// 	};
		// 	console.log("am about to send data to client, ", dataJSON)

		// }

	});
});

//  get data feed from binance

var binanceEndPoint = context["crypto_exchange_parameters"]["binance"]["data_endpoint"] 
// + context["crypto_exchange_parameters"]["binance"]["channel_sub"].BTCUSD + "@trade"
+ "ws/" + "BNBBTC@trade"

console.log("binance end point", binanceEndPoint)
// + context["crypto_exchange_parameters"]["binance"]["channel_sub"].LTCUSD + "/" 
// + context["crypto_exchange_parameters"]["binance"]["channel_sub"].ZECUSD + "/" 


var binanceWss = new WebSocket(binanceEndPoint);

binanceWss.on("open", function connection(socket){
	console.log("Server connected to binance")	

	// // set heartbeat every 40 seconds - coinjar requires every 45 seconds
	// setInterval(function(){
	// 	coinjarWss.send(context["crypto_exchange_parameters"]["coinjar"]["heartbeat_message"]);
	// 	// console.log("sending heart beat!")
	// }, context["crypto_exchange_parameters"]["coinjar"]["heartbeat_freq"])

	// get message from coinjar Socket

	binanceWss.on('message', function incoming(message) {
		
		console.log("got message from binance", message)

	});
});

binanceWss.on("error", function connection(socket){
	console.log("socket error", socket)	

	// // set heartbeat every 40 seconds - coinjar requires every 45 seconds
	// setInterval(function(){
	// 	coinjarWss.send(context["crypto_exchange_parameters"]["coinjar"]["heartbeat_message"]);
	// 	// console.log("sending heart beat!")
	// }, context["crypto_exchange_parameters"]["coinjar"]["heartbeat_freq"])

	// get message from coinjar Socket

	binanceWss.on('message', function incoming(message) {
		
		console.log("got message from binance", message)

	});
});


// on update of any of the data in the latest price feed, run the arbitrate algorithm



// 










