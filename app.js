const WebSocket = require('ws');
const express = require('express');
var path = require('path');
var ccxt = require("ccxt");
const axios = require('axios');
var moment = require("moment");
var binanceKey = require("./binance-key");

const binance = require('node-binance-api')().options({
  APIKEY: binanceKey.APIKEY,
  useServerTime: true // If you get timestamp errors, synchronize to server time at startup
});

var latestAUDUSDrate;

var context = {
	"selected_exchanges": {
		"exchange_1": "binance",
		"exchange_2": "coinjar",	
	},
	"crypto_exchange_parameters": {
		"coinjar": {
			"name": "coinjar",
			"data_endpoint": "wss://feed.exchange.coinjar.com/socket/websocket",
			"heartbeat_freq": 10000,
			"heartbeat_message": '{ "topic": "phoenix", "event": "heartbeat", "payload": {}, "ref": 0 }',
			"channel_sub": {
				"BTCAUD": '{ "topic": "trades:BTCAUD", "event": "phx_join", "payload": {}, "ref": 0 }',
				"LTCAUD": '{ "topic": "trades:LTCAUD", "event": "phx_join", "payload": {}, "ref": 0 }',
				"ZECBTC": '{ "topic": "trades:ZECBTC", "event": "phx_join", "payload": {}, "ref": 0 }'
			}, 
			"slippage": 0.01,
			"fees": 0.001,
			"current_fiat": 5000,
			"current_crypto": 100
		},
		"binance" :{
			"name": "binance",
			"data_endpoint": "wss://stream.binance.com:9443",
			"heartbeat_freq": 3 * 60 * 1000,
			"channel_sub": {
				"BTCUSDT": "BTCUSDT",
				"ZECBTC": "ZECBTC",
				"LTCUSDT": "LTCUSDT"
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
			"BTCUSDT" : [],
			"ZECBTC" : [],
			"LTCUSDT" : [] 
		},
		"coinjar": {
			"BTCAUD" : [],
			"LTCAUD" : [],
			"ZECBTC" : [] 
		},
		"forex":{
			"AUDUSD" : []
		},
	}
};


// FORMAT OF RAW DATA OUTPUTS FROM COINJAR AND BINANCE

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


//  START SERVER

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
 


// START SERVER AND WEBSOCKET TO RETURN DATA TO FRONT END

const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(clientsocket) {
	console.log("Arbiter client connected", clientsocket);
});


//  GET DATA FROM COINJAR

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
	coinjarWss.send(context["crypto_exchange_parameters"]["coinjar"]["channel_sub"]["ZECBTC"]);


	// get message from coinjar Socket

	coinjarWss.on('message', function incoming(message) {
		
		coinjarDataObj = JSON.parse(message);
		coinjarData = coinjarDataObj["payload"];
		
		if (coinjarDataObj["topic"] !== "phoenix") {
			console.log("received data from coinjar", coinjarDataObj)
		}


		// { topic: 'trades:ZECBTC',
		  // ref: null,
		  // payload:
		  //  { trades:

		// format
		// { value: '522.69',
	    // timestamp: '2019-04-21T05:43:12.673168Z',
	    // tid: 465063,
	    // taker_side: 'buy',
	    // size: '0.07000000',
	    // price: '7467.00000000' 
		// }


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

// GET DATA FROM BINANCE


// output data format
// { e: 'trade',
//   E: 1555826431038, -- time
//   s: 'LTCUSDT',     -- symbol
//   t: 18885798,
//   p: '80.05000000', -- price
//   q: '8.35156000', - quantity
//   b: 96354538,
//   a: 96354552,
//   T: 1555826431032,
//   m: true, -- maker
//   M: true 
// }


binance.websockets.trades([
	context["crypto_exchange_parameters"]["binance"]["channel_sub"]["BTCUSDT"],
	context["crypto_exchange_parameters"]["binance"]["channel_sub"]["ZECBTC"],
	context["crypto_exchange_parameters"]["binance"]["channel_sub"]["LTCUSDT"]

	], (trades) => {

		let {e:eventType, E:eventTime, s:symbol, p:price, q:quantity, m:maker, a:tradeId} = trades;
		// console.log("trades", trades, typeof(trades))

		context.trading_data = updateTradingLog(context.trading_data, "binance", trades.s, trades)
		console.log(context.trading_data)

	  // console.log(symbol+" trade update. price: "+price+", quantity: "+quantity+", maker: "+maker);


});

// GET DATA FROM FOREXT

var currency_conversion_endpoint = context["forex_parameters"]["forex_api"];


setInterval(function(){

	axios.get(currency_conversion_endpoint)
	  .then(response => {
	  	// console.log("Forex Data type", response.data)
	    if (response.data["quotes"]["USDAUD"] != undefined ) {
		    latestAUDUSDrate = currencyObj["quotes"]["USDAUD"]
	    }
	    console.log(latestAUDUSDrate)
	  })
	  .catch(error => {
	    console.log(error);
	  });

}, 60 * 60 * 1000)


// update the context variable with latest trade data and format into the same format

// context trading data variable format

// UPDATE THE CONTEXT VARIABLE

function updateTradingLog (contextTradingObj, exchange, symbol, input){
	var output = contextTradingObj;

	var cleanInput = handleTradeData(exchange, input, symbol)
	console.log("output", output)
	output[exchange][symbol].push (cleanInput);
	return output;
}


// PARSE AND CLEAN 1 INSTANCE OF TRADING DATA

function handleTradeData (exchange, input, symbol){


	var output = {
		symbol: "",
		time: "",
		price: "",
		quantity: "" 
	};

	if (exchange == "binance") {
		output.symbol = input.s;
		output.time = input.E;
		output.price = input.p;
		output.quantity = input.q
	};

	if (exchange == "coinjar") {
		output.symbol = symbol;
		output.time = moment(input.timestamp).unix();;
		output.price = input.price;
		output.quantity = input.size
	};

	if (exchange == "forex") {
		output.symbol = Object.keys(input.quotes)[0];
		output.time = input.timestamp * 1000;;
		output.price = input.quotes.USDAUD;
		output.quantity;
	};


	return output;
}

// FOREX
// { success: true,
//   terms: 'https://currencylayer.com/terms',
//   privacy: 'https://currencylayer.com/privacy',
//   timestamp: 1554438785,
//   source: 'USD',
//   quotes: { USDAUD: 1.40336 } }



// COINJAR
// { topic: 'trades:LTCAUD',
//   ref: null,
//   payload:
//    { trades: [

		// { value: '522.69',
		// timestamp: '2019-04-21T05:43:12.673168Z',
		// tid: 465063,
		// taker_side: 'buy',
		// size: '0.07000000',
		// price: '7467.00000000' 
		// }
// ]


// BINANCE
// { e: 'trade',
//   E: 1555826431038, -- time to millisecond
//   s: 'LTCUSDT',     -- symbol
//   t: 18885798,
//   p: '80.05000000', -- price
//   q: '8.35156000', - quantity
//   b: 96354538,
//   a: 96354552,
//   T: 1555826431032,
//   m: true, -- maker
//   M: true 
// }

// Binance : 
	// {
		// BTCUSD: 
			// [
				// {
					// symbol: BTCUSDT,
					// time: eventTime in unix,
					// price: price
					// quantity: quantity
				// }
			// ]
	// }

// Forex : 
	// {
		// AUDUSD: 
			// [
				// {
					// s: AUDUSD,
					// E: eventTime in unix,
					// p: price
					// q: undefined
				// }
			// ]
	// }



