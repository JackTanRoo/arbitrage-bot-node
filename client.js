// $( document ).ready(function() {
//     console.log( "ready!" );
	
// document.addEventListener("DOMContentLoaded", function(e) { 
  //do work


    var app = angular.module('arbitrage-bot',["ngRoute", "ngResource"]);

	// Start a recommendations pane

    app.controller("recommenderController", function($scope){
    	
    	$scope.arbitrage = {
	 		"15105104313" : {
				selected: true, 
				trade_id: 1,
				type_of_trade: "twoWay",
				time_of_trade: 15105104313,
				ROI_of_trade: 0.03,
				trades: {
					first: {
						exchange: "binance",
						symbol: "BTCUSDT",
						indexTradeData: 0,
						trade: "buy",
						time: 15105104313,
						buy: {
							asset: "BTC",
							price: 5000,
							quantity: 1,
						},
						sell: {
							asset: "USDT",
							price: 1/5000,
							quantity: 5000 * 1,
						}
					},
					second: {
						exchange: "binance",
						symbol: "BTCUSDT",
						indexTradeData: 0,
						trade: "buy",
						time: 15105104313,
						buy: {
							asset: "BTC",
							price: 5000,
							quantity: 1,
						},
						sell: {
							asset: "USDT",
							price: 1/5000,
							quantity: 5000 * 1,
						}
					},
					third: {
						exchange: "binance",
						symbol: "BTCUSDT",
						indexTradeData: 0,
						trade: "buy",
						time: 15105104313,
						buy: {
							asset: "BTC",
							price: 5000,
							quantity: 1,
						},
						sell: {
							asset: "USDT",
							price: 1/5000,
							quantity: 5000 * 1,
						}
					}
				}
			}	
    	}



    })


// 15105104313 : {
		// 	// {
		// selected: true or false
		// trade_id: 1
		// type_of_trade: twoWay or threeWay,
		// time_of_trade: trades.first.time,
		// ROI_of_trade: ROI
		// trades: {
			// first: {
// 			// 	exchange: binance
// 			// 	symbol: BTCUSDT
// 			//  indexTradeData: Index in the Trade Data Array
// 			// 	trade: buy
// 			// 	time: time
// 			// 	buyAsset: BTC
// 			// 	sellAsset: USDT
// 			// 	buyPrice: BTC/USDT Price
// 			// 	buyQuantity: quantity of buyAsset bought
// 			// 	sellQuantity: quantity of sellAsset sold
// 			// },
// 			// second: {
// 			// 	exchange: binance
// 			// 	symbol: BTCUSDT
// 			//  indexTradeData: Index in the Trade Data Array
// 			// 	trade: buy
// 			// 	time: time
// 			// 	buyAsset: BTC
// 			// 	sellAsset: USDT
// 			// 	buyPrice: BTC/USDT Price
// 			// 	buyQuantity: quantity of buyAsset bought
// 			// 	sellQuantity: quantity of sellAsset sold
// 			// },
// 			// third: {
// 			// 	exchange: binance
// 			// 	symbol: BTCUSDT
// 			//  indexTradeData: Index in the Trade Data Array
// 			// 	trade: buy
// 			// 	time: time
// 			// 	buyAsset: BTC
// 			// 	sellAsset: USDT
// 			// 	buyPrice: BTC/USDT Price
// 			// 	buyQuantity: quantity of buyAsset bought
// 			// 	sellQuantity: quantity of sellAsset sold
// 			// },
// 		// }
// 		// exchange_first: exchangeName,
// 		// time_first: exchangeNameTime,
// 		// time_second: 
// 	// }



// 	TESTER = document.getElementById('chart');

// 	const clientWS = new WebSocket('ws://localhost:3000');

// 	clientWS.addEventListener('open', () => {
// 	  // Send a message to the WebSocket server
// 	  const data = { message: 'Hello from the client!' }
// 	  const json = JSON.stringify(data);
// 	  clientWS.send(json);
// 	  console.log("open")
// 	});


// 	// only show max x data points

// 	var count = 0;

// 	clientWS.addEventListener('message', (event) => {
// 	  // The `event` object is a typical DOM event object, and the message data sent
// 	  // by the server is stored in the `data` property
// 	  var incomingData = JSON.parse(event.data);
// 	  console.log("I got data from server: ", incomingData)
// 	  // console.log("received data from server", data);
// 	  if (incomingData.type = "trade") {
	  	
// 			// Incoming Data format
// 				// trace 1 = coinjar
// 				// {
// 				// 	type : "trade",
// 				// 	coinjar : {
// 				// 		name : "coinjar",
// 				// 		type : "trade",
// 				// 		data : {
// 				// 			x : coinjarDate,
// 				// 			y : coinjarData.last
// 				// 		}	
// 				// 	},
// 				// 	binance: {
// 				// 		name : "binance",
// 				// 		type : "trade",
// 				// 		data: {
// 				// 			x : latestBinanceDate,
// 				// 			y : latestBinancePriceUSD
// 				// 		}
// 				// 	}
// 				// };
// 				// index 0 = binance, 
// 				// index 1 = coinjar

// 	  	var binanceCurrentTime = moment.unix(Math.floor(incomingData.binance.data.x)).format('H:m:s, MMM D, YY');
// 	  	var coinjarCurrentTime = moment.unix(Math.floor(incomingData.coinjar.data.x)).format('H:m:s, MMM D, YY');
	  	
// 	  	Plotly.extendTraces("chart", { 
// 	  		x: [[binanceCurrentTime],[coinjarCurrentTime]],
// 	  		y: [[incomingData.binance.data.y],[incomingData.coinjar.data.y]]
// 	  	}, [0,1])

// 	  	count++;

// 	  	if (count > 10) {
// 	  		Plotly.relayout("chart", {
// 	  			xaxis : {
// 	  				range: [count-10, count]
// 	  			}
// 	  		})
// 	  	}

// 	  }
	  
	  
// 	});

// 	// data structure from 
// 	// plotly
// 	// [trace0=binance, trace1=coinjar, trace2=USDAUD, trace3=tradingmarker];
// 	// incoming data format
// 	// {
// 		// name: tracename,
// 		// type: "trade",
// 		// data: {
// 		// x : [timeinunixtime]
// 		// y : [closepriceinUSD]
// 		// type: "line"
// 		// }
// 	// };


//     Plotly.plot ("chart", [
//     {
//     	x: [moment.unix(Math.floor(Date.now() / 1000)).format('H:m:s, MMM D, YY')],
//     	y: [0],
//     	type : "line",
//     	name : "binance"
//     },{
// 		x: [moment.unix(Math.floor(Date.now() / 1000)).format('H:m:s, MMM D, YY')],
//     	y: [0],
//     	type : "line",
//     	name : "coinjar"
//     }], {}, {
//     	responsive : true
//     });
// });
// });