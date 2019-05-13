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

var latestAUDUSDrate = 1.4;

var context = {
	"selected_exchanges": {
		"exchange_1": "binance",
		"exchange_2": "coinjar",	
	},
	"crypto_exchange_parameters": {
		"coinjar": {
			"name": "coinjar",
			"data_endpoint": "wss://feed.exchange.coinjar.com/socket/websocket",
			"heartbeat_freq": 15000,
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
		"forex_api": "https://api.exchangeratesapi.io/latest?base=AUD"
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
			"BTCUSDT" : 
			[
				{
				symbol: "BTCUSDT",
				time: Date.now(),
				price: 7300,
				quantity: 1,
				exchange: "binance" 
				}
			],
			"ZECBTC" : [
				{
				symbol: "ZECBTC",
				time: Date.now(),
				price: 0.009,
				quantity: 1,
				exchange: "binance" 
				}
			],
			"LTCUSDT" : [
				{
				symbol: "LTCUSDT",
				time: Date.now(),
				price: 85,
				quantity: 1,
				exchange: "binance" 
				}
			] 
		},
		"coinjar": {
			"BTCAUD" : 
			[
				{
				symbol: "BTCAUD",
				time: Date.now(),
				price: 9900,
				quantity: 1,
				exchange: "coinjar" 
				}
			],
			"ZECBTC" : [
				{
				symbol: "ZECBTC",
				time: Date.now(),
				price: 0.009,
				quantity: 1,
				exchange: "coinjar" 
				}
			],
			"LTCAUD" : [
				{
				symbol: "LTCAUD",
				time: Date.now(),
				price: 121,
				quantity: 1,
				exchange: "coinjar" 
				}
			] 
		},
		"forex":{
			"AUDUSD" : []
		},
	},
	"twoWayLookup" :{
		BTCUSDT : "BTCAUD",
		LTCUSDT : "LTCAUD",
		ZECBTC : "ZECBTC", 
		BTCAUD : "BTCUSDT",
		LTCAUD : "LTCUSDT",			
	},
	"arbitrage_opportunities":{
		selected : []
			// 150230214310 : {

			// }
		,
		allOpportunities : []
			// 12325315314 : {

			// }
		
		// selected : {
		// 	// trade_id: belo
		// },
		// allOpportunities: {

		
		// 15105104313 : {
		// 	// {
		// selected: true or false
		// trade_id: 1
		// type_of_trade: twoWay or threeWay,
		// time_of_trade: trades.first.time,
		// ROI_of_trade: ROI
		// trades: {
			// first: {
			// 	exchange: binance
			// 	symbol: BTCUSDT
			//  indexTradeData: Index in the Trade Data Array
			// 	trade: buy
			// 	time: time
			// 	buyAsset: BTC
			// 	sellAsset: USDT
			// 	buyPrice: BTC/USDT Price
			// 	buyQuantity: quantity of buyAsset bought
			// 	sellQuantity: quantity of sellAsset sold
			// },
			// second: {
			// 	exchange: binance
			// 	symbol: BTCUSDT
			//  indexTradeData: Index in the Trade Data Array
			// 	trade: buy
			// 	time: time
			// 	buyAsset: BTC
			// 	sellAsset: USDT
			// 	buyPrice: BTC/USDT Price
			// 	buyQuantity: quantity of buyAsset bought
			// 	sellQuantity: quantity of sellAsset sold
			// },
			// third: {
			// 	exchange: binance
			// 	symbol: BTCUSDT
			//  indexTradeData: Index in the Trade Data Array
			// 	trade: buy
			// 	time: time
			// 	buyAsset: BTC
			// 	sellAsset: USDT
			// 	buyPrice: BTC/USDT Price
			// 	buyQuantity: quantity of buyAsset bought
			// 	sellQuantity: quantity of sellAsset sold
			// },
		// }
		// exchange_first: exchangeName,
		// time_first: exchangeNameTime,
		// time_second: 
	// }
		// }
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

// var app = express();

// //init Express Router
// var router = express.Router();
// var port = 3000;

//return static page with websocket client

// app.use(express.static('./'))

// app.get('/', function(req, res) {
// 	console.log("in request", req.url)
//     res.sendFile(path.join(__dirname + '/index.html'));
// });

// var server = app.listen(port);
 


// START SERVER AND WEBSOCKET TO RETURN DATA TO FRONT END
// console.log("I am server", server)
// const wss = new WebSocket.Server({ server });

// wss.on('open', function open() {
//   console.log("OPENED");
//   wss.send('opened, something');
// });


var app = express();
// var app2 = express();

//init Express Router
var router = express.Router();
var port = 3000;
// var port2 = 3000;

//return static page with websocket client


app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.use(express.static('./'))

// var server = app.listen(port, function () {
//     console.log('node.js static server listening on port: ' + port + ", with websockets listener")
// })

var server = require('http').createServer(app);


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
    	console.log("in backend", data, "received ")
        client.in(data.roomId).emit('message', "Server received stuff in toBackend, please display");
    })

    client.on('newOpportunities', function(data) {
    	
    	var lastTrades = [];

    	var len = context["arbitrage_opportunities"].allOpportunities.length;

    	if ( len >= 3) {

    		lastTrades = [
	    		context["arbitrage_opportunities"].allOpportunities[len-1],
	    		context["arbitrage_opportunities"].allOpportunities[len-2],
	    		context["arbitrage_opportunities"].allOpportunities[len-3]
	    	]
    	
    	}
    	
    	console.log("newOpportunities", lastTrades)

        client.emit('message', 
        	JSON.stringify({
        		message: "opportunities",
        		trades: lastTrades
        	})
        );
    })

    client.emit("message", "hahahaha")

});

server.listen(port, function () {
    console.log('node.js static server listening on port: ' + port + ", WHAT IS LOVE with websockets listener")
});

// const wss = new WebSocket.Server({ server });


// wss.on('connection', ws => {
	
// 	console.log("CONNECTED TO CLIENT!")
// 	  ws.send('Hello! Message From Server!!')

//   ws.on('message', message => {
//     console.log(`Received message => ${message}`)
//     ws.send("here is the reply")
//   })

//   ws.on("error", function(err){
//   	console.error("error", err)
//   })

// })

//  GET DATA FROM COINJAR

//  LTC, BTC, zCash, Ripple


// establish connection with coinjar and pull data
// 	Format of client return
// 	{"topic":"ticker:LTCAUD","ref":null,"payload":{"volume":"181.00000000","transition_time":"2019-04-04T07:50:00Z","status":"continuous","session":11800,"prev_close":"117.80000000","last":"122.30000000","current_time":"2019-04-04T05:59:11.670951Z","bid":"116.40000000","ask":"122.10000000"},"event":"update"}


var coinjarWss = new WebSocket(context["crypto_exchange_parameters"]["coinjar"]["data_endpoint"]);

coinjarWss.on("open", function connection(socket){
	console.log("Server connected to coinjar")	

	coinjarWss.send(context["crypto_exchange_parameters"]["coinjar"]["channel_sub"]["BTCUSDT"]);
	coinjarWss.send(context["crypto_exchange_parameters"]["coinjar"]["channel_sub"]["LTCAUD"]);
	coinjarWss.send(context["crypto_exchange_parameters"]["coinjar"]["channel_sub"]["ZECBTC"]);

	// set heartbeat every 40 seconds - coinjar requires every 45 seconds
	setInterval(function(){
		console.log("trying to send a heartbeat")
		coinjarWss.send(context["crypto_exchange_parameters"]["coinjar"]["heartbeat_message"], function(error){
			console.log("received error", error)
		});
		// console.log("sending heart beat!")
	}, context["crypto_exchange_parameters"]["coinjar"]["heartbeat_freq"])


	// subscribe to coinjar token channel
	// coinjarWss.send(context["crypto_exchange_parameters"]["coinjar"]["channel_sub"]["BTCUSD"]);
	// coinjarWss.send(context["crypto_exchange_parameters"]["coinjar"]["channel_sub"]["ZECUSD"]);


	// get message from coinjar Socket

	coinjarWss.on('message', function incoming(message) {
		// console.log("received message", message)
		coinjarDataObj = JSON.parse(message);
		coinjarData = coinjarDataObj["payload"];
		
		if (coinjarDataObj["topic"] !== "phoenix") {
			if (coinjarDataObj["event"] == "init") {
				for (var i = 0; i < coinjarDataObj.payload.trades.length; i ++){					
					context.trading_data = updateTradingLog(context.trading_data, "coinjar", coinjarDataObj.topic.substr(7, coinjarDataObj.topic.length-7), coinjarDataObj.payload.trades[i])
				}
			} else if (coinjarDataObj["event"] == "new") {
				console.log("IAM DATA OBJ", coinjarDataObj.payload.trades[0])
				context.trading_data = updateTradingLog(context.trading_data, "coinjar", coinjarDataObj.topic.substr(7, coinjarDataObj.topic.length-7), coinjarDataObj.payload.trades[0])
			}
		}
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

setTimeout(function(){

	console.log("trying to send binance heartbeat")

	binance.websockets.trades([
		context["crypto_exchange_parameters"]["binance"]["channel_sub"]["BTCUSDT"],
		context["crypto_exchange_parameters"]["binance"]["channel_sub"]["ZECBTC"],
		context["crypto_exchange_parameters"]["binance"]["channel_sub"]["LTCUSDT"]

		], (trades) => {

			let {e:eventType, E:eventTime, s:symbol, p:price, q:quantity, m:maker, a:tradeId} = trades;
			context.trading_data = updateTradingLog(context.trading_data, "binance", trades.s, trades);
			
			var coinJarOppositePair = context.twoWayLookup[trades.s];
			var lastTrade = context.trading_data.binance[trades.s][context.trading_data.binance[trades.s].length-1]

			if (isTwoWayArbitrage(1, 
				context.trading_data.binance[trades.s]
				[context.trading_data.binance[trades.s].length-1], 
				context.trading_data.coinjar[coinJarOppositePair]
				[context.trading_data.coinjar[coinJarOppositePair]
				.length-1]).profitable)
			{
				context.arbitrage_opportunities.allOpportunities.push( 
					isTwoWayArbitrage(1, 
					context.trading_data.binance[trades.s][context.trading_data.binance[trades.s].length-1], 
					context.trading_data.coinjar[coinJarOppositePair][context.trading_data.coinjar[coinJarOppositePair].length-1]))

				// console.log("there is a profitable trade", context.arbitrage_opportunities)
			}

			// console.log(context.trading_data)
		  // console.log(symbol+" trade update. price: "+price+", quantity: "+quantity+", maker: "+maker);


	})}, 
20000);

// GET DATA FROM FOREXT

var currency_conversion_endpoint = context["forex_parameters"]["forex_api"];


setInterval(function(){

	axios.get(currency_conversion_endpoint)
	  .then(response => {
	  	console.log("Forex Data type", response.data.rates.USD)
	  	latestAUDUSDrate = 1 / response.data.rates.USD;
	  })
	  .catch(error => {
	    console.log(error);
	  });

}, 5000)


// update the context variable with latest trade data and format into the same format

// context trading data variable format

// UPDATE THE CONTEXT VARIABLE

function updateTradingLog (contextTradingObj, exchange, symbol, input){
	// console.log("updateTradingLog", contextTradingObj, exchange, symbol, input)
	var output = contextTradingObj;

	var cleanInput = handleTradeData(exchange, symbol, input)
	
	output[exchange][symbol].push(cleanInput);
	console.log("output", output)

	return output;

};


// PARSE AND CLEAN 1 INSTANCE OF TRADING DATA

function handleTradeData (exchange, symbol, input){

	var output = {
		symbol: "",
		time: "",
		price: "",
		quantity: "",
		exchange: exchange
	};

	if (exchange == "binance") {
		output.symbol = input.s;
		output.time = input.E;
		output.price = input.p;
		output.quantity = input.q;
	};

	if (exchange == "coinjar") {
		output.symbol = symbol;
		output.time = moment(input.timestamp).unix();;
		output.quantity = input.size

		if (symbol == "BTCAUD" || symbol == "LTCAUD"){
			output.price = input.price * latestAUDUSDrate;
		}
	};

	if (exchange == "forex") {
		output.symbol = Object.keys(input.quotes)[0];
		output.time = input.timestamp * 1000;;
		output.price = input.quotes.USDAUD;
		output.quantity;
	};

	return output;
};

// SEARCH FOR ARBITRAGE OPPORTUNITIES

// SIMPLE 2 WAY ARBITRAGE

// When there is a new trade, search if there an arbitrage for same pair on a different exchange
// 		BTC/USDT on Binance, Search for BTC / AUD (after Forex) On Coinjar
// 		LTC/USDT on Binance, Search for LTC / AUD (after Forex) On Coinjar
// 		ZEC/BTC on Binance, Search for ZEC / BTC On Coinjar


// return {
	// profitable : true or false,
	// trade_id: 1
	// type_of_trade: twoWay or threeWay,
	// time_of_trade: trades.first.time,
	// ROI_of_trade: ROI
	// first: {
			// first: {
			// 	exchange: binance
			// 	symbol: BTCUSDT
			//  indexTradeData: Index in the Trade Data Array
			// 	time: time
			// 	buy: {
					// asset: BTC
					// price: buyPrice
					// quantity: quantity
				// }
				// sell: {}
			// },
	// 	}
// }

function isTwoWayArbitrage (volumeToTrade, exchangeobj1, exchangeobj2){

	var price_exchange_one = exchangeobj1.price
	var price_exchange_two = exchangeobj2.price


	var exchange_1 = exchangeobj1.exchange
	var exchange_2 = exchangeobj2.exchange

	var symbol_1 = exchangeobj1.symbol
	var symbol_2 = exchangeobj2.symbol

	var margin_of_error = context.marginOfError

	var output = {};

	var estimated_buy_unit_price = price_exchange_one * (1 + context["crypto_exchange_parameters"][exchange_1]['slippage']);

	var estimated_buy_total_price = volumeToTrade * context["crypto_exchange_parameters"][exchange_1]["current_fiat"]

	// units to buy refers to units of crypto to buy = (amount to trade - fees) / final price of crypto

	var units_to_buy = (estimated_buy_total_price * (1 - context["crypto_exchange_parameters"][exchange_1]['fees'])) / (estimated_buy_unit_price );
    
    var estimated_sell_unit_price = price_exchange_two * (1 - context["crypto_exchange_parameters"][exchange_2]['slippage']);

	var estimated_sell_total_price =  units_to_buy * estimated_sell_unit_price * (1 - context["crypto_exchange_parameters"][exchange_2]['fees']);
    

	// IF BUYING EXCHANGE 1

    var ROI_buy_exchange1 = (estimated_sell_total_price - estimated_buy_total_price) / estimated_buy_total_price * 100;

    var ROI_buy_exchange2 = (estimated_buy_total_price - estimated_sell_total_price) / estimated_sell_total_price * 100;

    if (ROI_buy_exchange1 >=  margin_of_error){
    	console.log("ROI, sell price, buy price", ROI_buy_exchange1, estimated_buy_total_price, estimated_sell_total_price)
    	output = parseArbitrageObj(exchangeobj1, exchangeobj2, ROI_buy_exchange1, units_to_buy);
    } 

	// IF SELLING EXCHANGE 2
    
    else if (ROI_buy_exchange2 >=  margin_of_error){
    	console.log("ROI, sell price, buy price", ROI_buy_exchange2, estimated_sell_total_price, estimated_buy_total_price)
    	output = parseArbitrageObj(exchangeobj2, exchangeobj1, ROI_buy_exchange2, units_to_buy);
    }

    return output;
};


function parseArbitrageObj (exchange1Obj, exchange2Obj, ROI, units_to_buy){
	var output = {
		profitable : true,
		trade_id: Object.keys(context.arbitrage_opportunities.allOpportunities).length,
		type_of_trade: 2,
		time_of_trade: exchange1Obj.time,
		ROI_of_trade: ROI,
		first: {
				exchange: exchange1Obj.exchange,
				symbol: exchange1Obj.symbol,
				indexTradeData: context.trading_data[exchange1Obj.exchange].length-1,
				time: exchange1Obj.time,
				buy: {
					asset: exchange1Obj.symbol.substr(0,3),
					price: exchange1Obj.price, // price to get 1 BTC or 1 buy asset
					quantity: units_to_buy
				},
 				sell: {
					asset: exchange1Obj.symbol.substr(3,exchange1Obj.symbol.length-3),
					price: 1 / exchange1Obj.price,
					quantity: (exchange1Obj.price * units_to_buy)
				}
			},
		second: {
				exchange: exchange2Obj.exchange,
				symbol: exchange2Obj.symbol,
				indexTradeData: context.trading_data[exchange2Obj.exchange].length-1,
				time: exchange2Obj.time,
				buy: {
					asset: exchange2Obj.symbol.substr(0,3),
					price: exchange2Obj.price, // price to get 1 BTC or 1 buy asset
					quantity: units_to_buy
				},
 				sell: {
					asset: exchange2Obj.symbol.substr(3,exchange2Obj.symbol.length-3),
					price: 1 / exchange2Obj.price,
					quantity: (exchange2Obj.price * units_to_buy)
				}
			}
	}

	return output;

};

// 	input Obj = {
		// symbol: "",
		// time: "",
		// price: "",
		// quantity: "",
		// exchange: exchange
	// }

	// return {
		// profitable : true or false,
		// trade_id: 1
		// type_of_trade: twoWay or threeWay,
		// time_of_trade: trades.first.time,
		// ROI_of_trade: ROI
		// first: {
				// first: {
				// 	exchange: binance
				// 	symbol: BTCUSDT
				//  indexTradeData: Index in the Trade Data Array
				// 	time: time
				// 	buy: {
						// asset: BTC
						// price: buyPrice
						// quantity: quantity
					// }
					// sell: {}
				// },
		// 	}
	// }





// 3 WAY ARBITRAGE
// When there is a new trade, search for 3 way arbitrage

//		Buy BTC with USDT on Binance, Buy LTC with BTC on Coinjar, Buy USDT with LTC on Binance



// 




// When there is a a new trade, search if there is a 3 way arbitrage


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


function updateArbitrageLog (volumeToTrade, exchange1Obj, exchange2Obj, exchange3Obj){
	
	// return output

	// {
		// trade_id: 1
		// type_of_trade: twoWay or threeWay,
		// time_of_trade: trades.first.time,
		// ROI_of_trade: ROI
		// trades: {
			// first: {
			// 	exchange: binance
			// 	symbol: BTCUSDT
			//  indexTradeData: Index in the Trade Data Array
			// 	trade: buy
			// 	time: time
			// 	buyAsset: BTC
			// 	sellAsset: USDT
			// 	buyPrice: BTC/USDT Price
			// 	buyQuantity: quantity of buyAsset bought
			// 	sellQuantity: quantity of sellAsset sold
			// },
			// second: {
			// 	exchange: binance
			// 	symbol: BTCUSDT
			//  indexTradeData: Index in the Trade Data Array
			// 	trade: buy
			// 	time: time
			// 	buyAsset: BTC
			// 	sellAsset: USDT
			// 	buyPrice: BTC/USDT Price
			// 	buyQuantity: quantity of buyAsset bought
			// 	sellQuantity: quantity of sellAsset sold
			// },
			// third: {
			// 	exchange: binance
			// 	symbol: BTCUSDT
			//  indexTradeData: Index in the Trade Data Array
			// 	trade: buy
			// 	time: time
			// 	buyAsset: BTC
			// 	sellAsset: USDT
			// 	buyPrice: BTC/USDT Price
			// 	buyQuantity: quantity of buyAsset bought
			// 	sellQuantity: quantity of sellAsset sold
			// },
		// }
		// exchange_first: exchangeName,
		// time_first: exchangeNameTime,
		// time_second: 
	// }
}

