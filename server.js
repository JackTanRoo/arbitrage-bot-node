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
// # implement dynamic amount to trade depending on margin of error


// // # select crypto to track to track pricing data and make trades


const WebSocket = require('ws');
const express = require('express');
var path = require('path');
var ccxt = require("ccxt");
const axios = require('axios');



// console.log("ccxt")
// init context of params

var currencyData;
var currencyObj;

context = {
	"selected_exchanges": {
		"exchange_1": "binance",
		"exchange_2": "coinjar",	
	},
	"crypto_exchange_parameters": {
		"coinjar": {
			"name": "coinjar",
			"data_endpoint": "wss://feed.exchange.coinjar.com/socket/websocket",
			"heartbeat_freq": 4500,
			"heartbeat_message": '{ "topic": "phoenix", "event": "heartbeat", "payload": {}, "ref": 0 }',
			"channel_sub": '{ "topic": "ticker:LTCAUD", "event": "phx_join", "payload": {}, "ref": 0 }',
			"slippage": 0.01,
			"fees": 0.001,
			"balanceFiat": 5000,
			"balanceCrypto": 100
		},
		"binance" :{
			"name": "binance",
			"slippage": 0.005,
			"fees": 0.001,
			"balanceFiat": 5000,
			"balanceCrypto": 100
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
	"amountToTrade": 0.05
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

// global pricing variables

var coinjarData;
var coinjarDataObj;

var latestCoinjarPriceAUD;
var latestCoinjarPriceUSD;

var latestBinancePriceUSD;

var latestAUDUSDrate;

var profit1;
var profit2;
var simpleProfitCounter = 1000;



// establish connection with coinjar and pull data

var coinjarWss = new WebSocket(context["crypto_exchange_parameters"]["coinjar"]["data_endpoint"]);

coinjarWss.on("open", function connection(socket){
	console.log("I am have connected to coinjar")	

	// set heartbeat every 40 seconds - coinjar requires every 45 seconds
	setInterval(function(){
		coinjarWss.send(context["crypto_exchange_parameters"]["coinjar"]["heartbeat_message"]);
		// console.log("sending heart beat!")
	}, context["crypto_exchange_parameters"]["coinjar"]["heartbeat_freq"])

	// get message from coinjar Socket

	coinjarWss.on('message', function incoming(message) {

		// coinjarWss.clients.forEach(client => {
	 //      client.send(message);
		// });  
		// console.log("received from a client: ",typeof(message));
		coinjarDataObj = JSON.parse(message);
		coinjarData = coinjarDataObj["payload"]
		// skip heart beat response

		if (coinjarData["status"] == "continuous" && latestBinancePriceUSD != undefined && latestAUDUSDrate != undefined) {
			latestCoinjarPriceAUD = coinjarData["last"];
			latestCoinjarPriceUSD = latestCoinjarPriceAUD / latestAUDUSDrate;
			console.log("payload", coinjarData, "AUD", latestCoinjarPriceAUD, "USD", latestCoinjarPriceUSD)

			// make trade when there is a coinjar trade
			// function isProfitableToBuy (volumeToTrade, exchange_1, price_exchange_one, exchange_2, price_exchange_two, margin_of_error){
				// console.log("inputs", context.amountToTrade, context.selected_exchanges.exchange_1, latestBinancePriceUSD, context.selected_exchanges.exchange_2, latestCoinjarPriceUSD, context.marginOfError)
				profit1 = isProfitableToBuy(context.amountToTrade, context.selected_exchanges.exchange_1, latestBinancePriceUSD, context.selected_exchanges.exchange_2, latestCoinjarPriceUSD, context.marginOfError)
				profit2 = isProfitableToBuy(context.amountToTrade, context.selected_exchanges.exchange_2, latestCoinjarPriceUSD, context.selected_exchanges.exchange_1, latestBinancePriceUSD, context.marginOfError)
				
				// if profit ROI% is above margin of error %
				console.log("buy at binance ", profit1["ROI"], "buy at coinjar", profit2["ROI"])

				if (profit1["ROI"] >= profit1["margin_of_error"]) {
					console.log("Is profitable to BUY AT ", context.selected_exchanges.exchange_1, " at price ", latestBinancePriceUSD, " with total invested amount of", profit1["total_fiat_used_to_buy"], " with expected profit of ", profit1["final_profit"]);
				}
				else if (profit2["ROI"] >= profit2["margin_of_error"] ) {
					console.log("Is profitable to BUY AT ", context.selected_exchanges.exchange_2, " at price ", latestCoinjarPriceUSD, " with total invested amount of", profit2["total_fiat_used_to_buy"], " with expected profit of ", profit2["final_profit"]);

				}

				// console.log("first profit", profit1[0], profit1, typeof(profit1[0]), simpleProfitCounter)

				// simpleProfitCounter += profit1[0];

				// console.log("I am profit if I BOUGHT at ",context.selected_exchanges.exchange_1, profit1);
				// console.log("profit counter: ", simpleProfitCounter, "Total ROI" , (simpleProfitCounter / 5000 - 1)*100)
				// console.log("I am profit if I SOLD at ",context.selected_exchanges.exchange_1, profit2)
		}

	});  

	coinjarWss.send(context["crypto_exchange_parameters"]["coinjar"]["channel_sub"]);

})

// Format of client return
// {"topic":"ticker:LTCAUD","ref":null,"payload":{"volume":"181.00000000","transition_time":"2019-04-04T07:50:00Z","status":"continuous","session":11800,"prev_close":"117.80000000","last":"122.30000000","current_time":"2019-04-04T05:59:11.670951Z","bid":"116.40000000","ask":"122.10000000"},"event":"update"}

// establish connection with binance

var response;

var exchangeObjOne = new ccxt[context.selected_exchanges.exchange_1]()

async function handleData (exchangeObj, symbol, interval, res) {
	// let response;
	try {
		response = await exchangeObj.fetchOHLCV(symbol, interval)
		console.log("I am the response", response[0])
		return response;
	} catch (err) {
		console.log ("error", err)
	}

}

// run the data pull for binance at the rate limit

var binanceData;

setInterval(function(){
	handleData(exchangeObjOne, context.selected_trading_pairs.crypto_1, "1m").then(function(success, err){

		if (err) { console.error(err); }
		binanceData = success
		latestBinancePriceUSD = binanceData[0][4]
		console.log("binance data ", binanceData[0], latestBinancePriceUSD);	

	});
}, 1000)


// format of binance return output

// [ 1554412320000, 83, 83.1, 82.98, 82.99, 294.06736 ]

//  get the data feed for AUD to USD

var currency_conversion_endpoint = context["forex_parameters"]["forex_api"];


setInterval(function(){

	axios.get(currency_conversion_endpoint)
	  .then(response => {
	  	console.log("Forex Data type", typeof(response.data))
	    currencyObj = response.data;
	    latestAUDUSDrate = currencyObj["quotes"]["USDAUD"]
	    console.log(latestAUDUSDrate);
	    // console.log(response.data.explanation);
	  })
	  .catch(error => {
	    console.log(error);
	  });

}, 5000)


// format of currency conversion return output

// { success: true,
//   terms: 'https://currencylayer.com/terms',
//   privacy: 'https://currencylayer.com/privacy',
//   timestamp: 1554438785,
//   source: 'USD',
//   quotes: { USDAUD: 1.40336 } }


// implement trading algorithm

// logic: exchange_1 is the venue to buy, exchange _2 is the venue to sell

function isProfitableToBuy (volumeToTrade, exchange_1, price_exchange_one, exchange_2, price_exchange_two, margin_of_error){
	
	var estimated_buy_unit_price = price_exchange_one * (1 + context["crypto_exchange_parameters"][exchange_1]['slippage']);

	
	var estimated_buy_total_price = volumeToTrade * context["crypto_exchange_parameters"][exchange_1]["balanceFiat"]

	// units to buy refers to units of crypto to buy = (amount to trade - fees) / final price of crypto

	var units_to_buy = (estimated_buy_total_price * (1 - context["crypto_exchange_parameters"][exchange_1]['fees'])) / (estimated_buy_unit_price );
    
    var estimated_sell_unit_price = price_exchange_two * (1 - context["crypto_exchange_parameters"][exchange_2]['slippage']);

	var estimated_sell_total_price =  units_to_buy * estimated_sell_unit_price * (1 - context["crypto_exchange_parameters"][exchange_2]['fees']);
    
    var estimated_final_profit = estimated_sell_total_price - estimated_buy_total_price;

    var ROI = (estimated_final_profit / estimated_buy_total_price)*100;

    return {
    	"final_profit" :  estimated_final_profit,
    	"total_fiat_used_to_buy": estimated_buy_total_price,
    	"total_units_bought": units_to_buy,
    	"ROI" : ROI,
    	"margin_of_error": margin_of_error * 1000
    }

    // if (ROI > margin_of_error){
    // 	return true;
    // }
    // return false;

}

// simple profit counter



// graph candles and trading signals



// 



