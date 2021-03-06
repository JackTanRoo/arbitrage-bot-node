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
var moment = require("moment");


var app = express(); 

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
			"current_fiat": 5000,
			"current_crypto": 100
		},
		"binance" :{
			"name": "binance",
			"slippage": 0.005,
			"fees": 0.001,
			"current_fiat": 5000,
			"current_crypto": 100,
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
    res.sendFile(path.join(__dirname + '/index-backup.html'));
});

// var server = app.listen(port, function () {
//     console.log('node.js static server listening on port: ' + port + ", with websockets listener")
// })

var server = require('http').createServer(app);


const wss = new WebSocket.Server({ server });


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
    	console.log("in backend", data, "received ")
        client.in(data.roomId).emit('message', "Server received stuff in toBackend, please display");
    })

    client.emit("message", "hahahaha")

});

server.listen(port, function () {
    console.log('node.js static server listening on port: ' + port + ", fdafdafaw with websockets listener")
});


// const server = new WebSocket.Server({ server: app.listen(3000) });
 

// SET UP SOCKET CONNECTION ON SERVER TO SERVE CLIENT TRADING DATA FOR GRAPH

// wss.on('connection', function connection(socket) {
	
// 	console.log("I have connected", socket)
	
// 	socket.on('message', function incoming(message) {

// 		wss.clients.forEach(client => {
// 	      client.send(message);
// 		});  
// 		console.log("received from a client: ", message)
// 	});  

// 	socket.send('Hello from server!');
// });

// global pricing variables

var coinjarData;
var coinjarDataObj;

var latestCoinjarPriceAUD;
var latestCoinjarPriceUSD;

var latestBinancePriceUSD;
var latestBinanceDate;

var latestAUDUSDrate = 1.4;

var profit1;
var profit2;
var simpleProfitCounter = 1000;


// establish connection with binance

var response;

var exchangeObjOne = new ccxt[context.selected_exchanges.exchange_1]()

async function handleData (exchangeObj, symbol, interval, res) {
	// let response;
	try {
		response = await exchangeObj.fetchOHLCV(symbol, interval)
		// console.log("I am the response", response[0])
		return response;
	} catch (err) {
		console.log ("error", err)
	}

}

// run the data pull for binance at the rate limit

var binanceData;

var newBinanceDate;

var dataJSON = {};





// establish connection with coinjar and pull data


wss.on('connection', function connection(clientsocket) {
	console.log("I am connected", clientsocket);
	

	var coinjarWss = new WebSocket(context["crypto_exchange_parameters"]["coinjar"]["data_endpoint"]);

	coinjarWss.on("open", function connection(socket){
		console.log("I am have connected to coinjar")	

		// set heartbeat every 40 seconds - coinjar requires every 45 seconds
		setInterval(function(){
			coinjarWss.send(context["crypto_exchange_parameters"]["coinjar"]["heartbeat_message"]);
			console.log("sending heart beat!")
		}, context["crypto_exchange_parameters"]["coinjar"]["heartbeat_freq"])

		// get message from coinjar Socket

		coinjarWss.on('message', function incoming(message) {

			// coinjarWss.clients.forEach(client => {
			//      client.send(message);
			// });  
			// console.log("received from a client: ",typeof(message));
			
			coinjarDataObj = JSON.parse(message);
			coinjarData = coinjarDataObj["payload"]
			
			// send data to graphing client

			if (coinjarData["status"] == "continuous") {
				var coinjarDate = moment(coinjarData.current_time).unix();
				
				// console.log("coinjardate", coinjarDate)
				
				dataJSON = 

				{
					type : "trade",
					coinjar : {
						name : "coinjar",
						type : "trade",
						data : {
							x : coinjarDate,
							y : coinjarData.last / latestAUDUSDrate
						}	
					},
					binance: {
						name : "binance",
						type : "trade",
						data: {
							x : latestBinanceDate,
							y : latestBinancePriceUSD
						}
					}
				};
				console.log("am about to send data to client, ", dataJSON)
								
				setInterval(function(){
					handleData(exchangeObjOne, context.selected_trading_pairs.crypto_1, "1m").then(function(success, err){

						if (err) { console.error(err); }
						// binanceData = success
						console.log("binance data ", binanceData[0]);	

						newBinanceDate = binanceData[0][0] / 1000 + context.crypto_exchange_parameters.binance.time_sync_adjustment;

						console.log("new binance date", newBinanceDate, latestBinanceDate)
						
						if (newBinanceDate > latestBinanceDate || latestBinanceDate == undefined ) {				
							latestBinanceDate = newBinanceDate;
							latestBinancePriceUSD = binanceData[0][4];

							dataJSON.binance.data.x = latestBinanceDate;
							dataJSON.binance.data.y = latestBinancePriceUSD;

							clientsocket.send(JSON.stringify(dataJSON))
							console.log("I sent the data");

						};

						console.log("latest binance data ", latestBinanceDate, latestBinancePriceUSD);	

					});
				}, 5000)


			}

			// Format of client return
			// {"topic":"ticker:LTCAUD","ref":null,"payload":{"volume":"181.00000000","transition_time":"2019-04-04T07:50:00Z","status":"continuous","session":11800,"prev_close":"117.80000000","last":"122.30000000","current_time":"2019-04-04T05:59:11.670951Z","bid":"116.40000000","ask":"122.10000000"},"event":"update"}


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
					// console.log("buy at binance ", profit1["ROI"], "buy at coinjar", profit2["ROI"])

					if (profit1["ROI"] >= profit1["margin_of_error"]) {
						// update the balance 

						context.crypto_exchange_parameters[context.selected_exchanges.exchange_1].current_fiat += profit1[context.selected_exchanges.exchange_1].total_fiat_used;
						context.crypto_exchange_parameters[context.selected_exchanges.exchange_1].current_crypto += profit1[context.selected_exchanges.exchange_1].total_crypto_used;

						context.crypto_exchange_parameters[context.selected_exchanges.exchange_2].current_fiat += profit1[context.selected_exchanges.exchange_2].total_fiat_used;
						context.crypto_exchange_parameters[context.selected_exchanges.exchange_2].current_crypto += profit1[context.selected_exchanges.exchange_2].total_crypto_used;

						// console.log("Is profitable to BUY AT ", context.selected_exchanges.exchange_1, " at price ", latestBinancePriceUSD, " with total invested amount of", profit1[context.selected_exchanges.exchange_1]["total_fiat_used"], " with expected profit of ", profit1["final_profit"]);
					}

					else if (profit2["ROI"] >= profit2["margin_of_error"] ) {

						// console.log("Is profitable to BUY AT ", context.selected_exchanges.exchange_2, " at price ", latestCoinjarPriceUSD, " with total invested amount of", profit2[context.selected_exchanges.exchange_2]["total_fiat_used"], " with expected profit of ", profit2["final_profit"], context.crypto_exchange_parameters);

						context.crypto_exchange_parameters[context.selected_exchanges.exchange_1].current_fiat += profit2[context.selected_exchanges.exchange_1].total_fiat_used;
						context.crypto_exchange_parameters[context.selected_exchanges.exchange_1].current_crypto += profit2[context.selected_exchanges.exchange_1].total_crypto_used;

						context.crypto_exchange_parameters[context.selected_exchanges.exchange_2].current_fiat += profit2[context.selected_exchanges.exchange_2].total_fiat_used;
						context.crypto_exchange_parameters[context.selected_exchanges.exchange_2].current_crypto += profit2[context.selected_exchanges.exchange_2].total_crypto_used;

					}
			}

		});  

		coinjarWss.send(context["crypto_exchange_parameters"]["coinjar"]["channel_sub"]);

	});

});






// format of binance return output

// [ 1554412320000, 83, 83.1, 82.98, 82.99, 294.06736 ]

//  get the data feed for AUD to USD

var currency_conversion_endpoint = context["forex_parameters"]["forex_api"];


setInterval(function(){

	axios.get(currency_conversion_endpoint)
	  .then(response => {
	  	// console.log("Forex Data type", response.data)
	    currencyObj = response.data;
	    if (currencyObj["quotes"]["USDAUD"] != undefined ) {

		    latestAUDUSDrate = currencyObj["quotes"]["USDAUD"]

	    }
	    console.log("I just updated the USD rate", latestAUDUSDrate);
	    // console.log(response.data.explanation);
	  })
	  .catch(error => {
	    console.log(error);
	  });

}, 60000)


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
	
	// console.log ("inputs to isprofitable", volumeToTrade, exchange_1, price_exchange_one, exchange_2, price_exchange_two, margin_of_error)

	var estimated_buy_unit_price = price_exchange_one * (1 + context["crypto_exchange_parameters"][exchange_1]['slippage']);

	var estimated_buy_total_price = volumeToTrade * context["crypto_exchange_parameters"][exchange_1]["current_fiat"]

	// console.log("after estimated_buy_total_price", context["crypto_exchange_parameters"][exchange_1])

	// units to buy refers to units of crypto to buy = (amount to trade - fees) / final price of crypto

	var units_to_buy = (estimated_buy_total_price * (1 - context["crypto_exchange_parameters"][exchange_1]['fees'])) / (estimated_buy_unit_price );
    
    var estimated_sell_unit_price = price_exchange_two * (1 - context["crypto_exchange_parameters"][exchange_2]['slippage']);

	var estimated_sell_total_price =  units_to_buy * estimated_sell_unit_price * (1 - context["crypto_exchange_parameters"][exchange_2]['fees']);
    
    var estimated_final_profit = estimated_sell_total_price - estimated_buy_total_price;

    var ROI = (estimated_final_profit / estimated_buy_total_price) * 100;



    // output format
    // {
    	// final_profit : "xxx",
    	// ROI: "ROI",
    	// margin_of_error: margin_of_error,
    	// [exchange_1]: {
    	// 	total_fiat_used: xxx
    	// 	total_crypto_used: xxx
    	// 	name: xxx
    	// }, 

	   	// [exchange_2]: {
    	// 	total_fiat_used: xxx
    	// 	total_crypto_used: xxx
    	// 	name: xxx
    	// }, 
    // }

    // console.log("check is profit: ", estimated_buy_unit_price, estimated_buy_total_price, units_to_buy, estimated_sell_unit_price, estimated_final_profit)

    var output = {
    	"final_profit" :  estimated_final_profit,
    	"ROI" : ROI,
    	"margin_of_error": margin_of_error * 100
    };


	output[exchange_1] = {};
    output[exchange_2] = {};

    output[exchange_1]["total_fiat_used"] = -1 * estimated_buy_total_price;
    output[exchange_1]["total_crypto_used"] = units_to_buy;

    output[exchange_2]["total_fiat_used"] = estimated_sell_total_price;
    output[exchange_2]["total_crypto_used"] = -1 * units_to_buy;

    // console.log( "estimated_buy_total_price",estimated_buy_total_price, output)

    return output;
};

// updates current portfolio balance 

function returnBalance (params) {


	// logic input current balance for fiat and crypto for both exchanges
	// input traded amounts 
	// calculate final balances
	// return balance
	// show me 
	// params format {
		// names: [binance, coinjar]
	// 	[exchange_1] : {
		// current_fiat: xxx
		// current_crypto : xxx
		// total_fiat_used: xxx
		// total_crypto_used: xxx
	// },
	//  [exchange_2] : {
		// current_fiat : xxx
		// curent_crypto : xxx
		// total_fiat_used: xxx
		// total_crypto_used: xxx
	// }
	// }


	var output = params;

	var names = params.names;

	var exchange_1 = names[0];
	var exchange_2 = names[1];

	output[exchange_1].current_fiat = params[exchange_1].current_fiat + params[exchange_1].total_fiat_used;
	output[exchange_2].current_fiat = params[exchange_2].current_fiat + params[exchange_2].total_fiat_used;

	output[exchange_1].current_crypto = params[exchange_1].current_crypto + params[exchange_1].total_crypto_used;
	output[exchange_2].current_crypto = params[exchange_2].current_crypto + params[exchange_2].total_crypto_used;

	// remove the fiat traded and crypto traded key value pairs

	delete output[exchange_1].fiat_traded;
	delete output[exchange_2].fiat_traded;
 
	delete output[exchange_1].crypto_traded;
	delete output[exchange_2].crypto_traded;

	return output;

	// output format {
	// 	exchange_1 : {
		// name: xxx
		// current_fiat: xxx
		// current_crypto : xxx
	// },
	//  exchange_2 : {
		// name : xxx
		// current_fiat : xxx
		// curent_crypto : xxx
	// }
	// }

};


// total ROI calculator

// function totalROI calculator (contextCryptoParams) {

// // input current fiat and crypto balance in both exchanges

// // input original balance

// // calculator ROI in both exchanges


// }



// balance crypto and fiat between coinjar and binance when it is more than 30% difference




// graph candles and trading signals



// 



