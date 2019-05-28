// $( document ).ready(function() {
//     console.log( "ready!" );
	
// document.addEventListener("DOMContentLoaded", function(e) { 
  //do work

'use strict';

// var app = angular.module('MySocektApp', ['ngMaterial', 'LocalStorageModule', 'btford.socket-io']);

var app = angular.module('arbitrage-bot',['btford.socket-io']);


app.service('SocketService', ['socketFactory', function SocketService(socketFactory) {
    return socketFactory({
        ioSocket: io.connect('http://localhost:3000')
    });
}]); 

// factory to update scope.opportunities elements

app.factory('utilities', function(){
	var outputObj = {};

	outputObj.calculateTime = function(currentTime, tradeTime) {
		console.log("calculateTime",currentTime, tradeTime)
		if ((currentTime - tradeTime) > 60000 && (currentTime - tradeTime) < 60*60*1000) {
			var minute = Math.round(((currentTime - tradeTime) / 60000), 0);

			console.log(minute, "minute")

			return minute.toString() + " mins ago";

		} else if ((currentTime - tradeTime) > 60*60*1000) {
			
			var hours = Math.round(((currentTime - tradeTime) / (60 * 60 * 1000)), 0);
			return hours.toString() + " hrs ago";

		} else {
			return "A few seconds ago"
		}
	};

	outputObj.updateTime = function(oppsArray){
		// console.log("I am in update time")
		var currentTime;
		var output = oppsArray;

		for (var i = 0; i < oppsArray.length ; i++) {

			currentTime = outputObj.calculateTime(Date.now(), oppsArray[i].time_of_trade)
			output[i].time_of_trade = currentTime;

		}

		console.log("I am in update time", output)
		return output
	};

	outputObj.updateCardDesc = function (oppsArray){

		var output = oppsArray;

		for (var i = 0; i < oppsArray.length; i++ ) {

			if (output[i].type_of_trade == 2){
				output[i].description = "Trade " + output[i].first.symbol + " & " + output[i].second.symbol + " at " + output[i].first.exchange + " & " + output[i].second.exchange
				console.log("new description", output[i].description)
			}

			if (output[i].type_of_trade == 3){
				output[i].description = "Trade " + output[i].first.symbol + ", " + output[i].second.symbol + " & " + output[i].third.symbol + " at " + output[i].first.exchange + " & " + output[i].second.exchange
				console.log("new description", output[i].description)
			}
		};

	};

	outputObj.updateROI = function (oppsArray){

		var output = oppsArray;
		console.log("oppsArra", output)

		for (var i = 0; i < output.length; i++ ) {	
			output[i].display_ROI = output[i].ROI_of_trade.toFixed(1) + "%"
		};
	
		return output;
	};

	return outputObj;
});

app.controller('homeController', function($scope, SocketService, $interval, utilities, $attrs) {
	// console.log("I am in homeController", $scope.hello)

    $scope.array = [];
    $scope.message = {};
    SocketService.emit('room', { roomId: "temp" });

    SocketService.on('message', function(msg) {
        // console.log(typeof(msg), msg)
        var message = JSON.parse(msg);

        if (message.message = "opportunities") {
        	$scope.trades = message.trades
        	$scope.trades = utilities.updateTime($scope.trades)
        	$scope.trades = utilities.updateCardDesc($scope.trades)
        	$scope.trades = utilities.updateROI(message.trades)
        	$scope.trading_data = message.trading_data
        }
    	// console.log("got message from server", msg)

    });

    $interval(function(){
    	console.log("emitting new opps")
    	SocketService.emit('newOpportunities', {
    		roomId:'temp', 
    		data: "hellowwwwwww from client", 
    		date: new Date() 
    	});

    }, 3000)

    SocketService.emit('toBackEnd', {roomId:'temp', data: "hellowwwwwww from client", date: new Date() })

	$scope.showTradeInfo = function(item){
		console.log("i am trading data", item ,$scope.trading_data, "I am trades", $scope.trades)
		var domID = item.attributes['data-id'].value
		console.log("domID", domID)
		var id = angular.element(item).data("id")
		console.log("scope trading data", id, $scope.trading_data);	
	}
	

	$scope.trades = [
		{
			selected: true, 
			trade_id: 1,
			type_of_trade: 2,
			time_of_trade: 1556173353463,
			display_time: utilities.calculateTime(Date.now(), 1556173353463),
			ROI_of_trade: 0.03
		},
		{
			selected: true, 
			trade_id: 2,
			type_of_trade: 3,
			time_of_trade: 1556173353463,
			display_time: utilities.calculateTime(Date.now(), 1556173353463),
			ROI_of_trade: 0.03
		}		
	]

});

app.controller('showTradeInfo', function($scope) {


	// onclick of a recommendation card
	// pull data from $scope.trading_data based on symbol of first, second, third asse t
	// then plot the last 10 data points
})



// Start a recommendations pane

// app.controller("myControl", function($websocket){
// 	// console.log("I am in run")

// 	// var ws = new WebSocket('ws://localhost:3000')

// 	// ws.onopen = function(){  
//  //        console.log("Socket has been opened!");  
//  //        ws.send("heloooos")
//  //    };

//  //    ws.onmessage = function(message) {
//  //    	console.log("got message", message)
//  //        console.log(JSON.parse(message.data));
//  //    };

//  //     ws.onerror = function(err){
//  //     	console.log("error on client side")
//  //        console.log(err)
//  //    };
// 	// var ws = $websocket.$new('ws://localhost:3000');

// 	// ws.$on('$open', function () {
// 	// 	console.log("CONNECTED!")
// 	//     ws.$emit('message', "data is here"); // it sends the event 'hello' with data 'world'
// 	// })

// 	// ws.$on('message', function (message) { // it listents for 'incoming event'
// 	//     console.log('something incoming from the server: ' + message);
// 	// });

// })




app.controller("recommenderController", function($scope, utilities){
	$scope.hello = {
		what: "is up"
	}
})


// RECOMMENDATION TAB MAKES A WEBSOCKET CALL TO SERVER TO GET LATEST DATA


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