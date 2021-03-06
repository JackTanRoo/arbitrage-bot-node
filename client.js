// $( document ).ready(function() {
//     console.log( "ready!" );
	
// document.addEventListener("DOMContentLoaded", function(e) { 
  //do work

'use strict';

// var app = angular.module('MySocektApp', ['ngMaterial', 'LocalStorageModule', 'btford.socket-io']);

var app = angular.module('arbitrage-bot',['btford.socket-io', 'chart.js']);


app.service('SocketService', ['socketFactory', function SocketService(socketFactory) {
    return socketFactory({
        ioSocket: io.connect('http://localhost:3000')
    });
}]); 

// factory to update scope.opportunities elements

app.factory('utilities', function(){
	var outputObj = {};

	outputObj.calculateTime = function(currentTime, tradeTime) {
		// console.log("calculateTime",currentTime, tradeTime)
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

		// console.log("I am in update time", output)
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
		// console.log("oppsArra", output)

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


    // send ping to server to ask for new opportunities
    
    $interval(function(){
    	// console.log("emitting new opps")
    	SocketService.emit('newOpportunities', {
    		roomId:'temp', 
    		data: "hellowwwwwww from client", 
    		date: new Date() 
    	});

    }, 3000)

    SocketService.emit('toBackEnd', {roomId:'temp', data: "hellowwwwwww from client", date: new Date() })


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


app.controller("LineCtrl", function ($scope) {

  $scope.onHover = function (points, evt) {
    // console.log(points, evt);
  };
  
  // x axis for time series

  // function convertTime
  // scope.trading_data = {
  		// binance: {
			// BTCUSDT:
  			// [{
			// exchange: "binance"
			// price: 7300
			// quantity: 1
			// symbol: "BTCUSDT"
			// time: 1559096683127			
  		// }]
  // }

  // scope.trades = [{
	// ROI_of_trade: 99.9037464314745
	// description: "Trade BTCUSDT & BTCAUD at binance & coinjar"
	// display_ROI: "99.9%"
	// first: {exchange: "binance", symbol: "BTCUSDT", indexTradeData: null, time: 1559096692571, buy: {…}, …}
	// profitable: true
	// second: {exchange: "coinjar", symbol: "BTCAUD", indexTradeData: null, time: 1559093601, buy: {…}, …}
	// time_of_trade: "A few seconds ago"
	// trade_id: 36
	// type_of_trade: 2
// }]

  // PROVIDES AN ARRAY OF ELEMENTS FROM TRADING LOG

  function returnArray(elementsOnEitherSide, elementIndex, wholeArray, attrName) {
  	var output = []

  	var counter = elementsOnEitherSide;
  	// console.log("I am in return array", wholeArray)

  	// if the length of the array is shorter than the elements On either Side would require, then return the full array

  	if (wholeArray.length <= elementsOnEitherSide * 2) {
  		// console.log("I am in for loop", wholeArray, elementsOnEitherSide)
  		for (var i = 0; i < wholeArray.length; i ++) {

  			// make time for human readable
  			if (attrName == "time") {
  				output.push(moment.unix(wholeArray[i][attrName]).format("h:mm:ss"))	
  			} else {
  				output.push(wholeArray[i][attrName])
  				// console.log(" I am in price", output)
  			}

  		}
  	} else {
		while (counter >= -1 * elementsOnEitherSide ) { 
	  		// console.log("In while loop", wholeArray, counter, elementsOnEitherSide, elementIndex, wholeArray[elementIndex - counter])

			if (wholeArray[elementIndex - counter] && wholeArray[elementIndex - counter][attrName] ) {
		  		
		  		if (attrName == "time") {
	  				output.push(moment.unix(wholeArray[elementIndex - counter][attrName]).format("HH:mm:ss"))	
	  			} else {
	  				output.push(wholeArray[elementIndex - counter][attrName])
	  				// console.log(" I am in price", output)

	  			}
		  		// console.log("in the if statement", output)
			}
	  		// counter starts as positive and iterates down by 1
	  		// whilst counter is higher than 
	  		counter = counter - 1;
	  	}
  	}

  	return output;
  }


  function getTradingData (exchangeName, tradingTime, symbol){
	
	// console.log("I am in getTradingData")

  	var output = {};

  	output = {
  		time:[],
  		price: []
  	};

  	var interim = [];
	// console.log("I am out side for loop", $scope.trading_data[exchangeName], tradingTime)

  	for (var i = 0; i < $scope.trading_data[exchangeName][symbol].length; i ++) {
  		// console.log("I am in for loop")
  		if ($scope.trading_data[exchangeName][symbol][i].time == tradingTime) {
  			// push the 4 data points on either side of the element
  			// console.log("I am in if statement")
  			output.time = returnArray(4, i, $scope.trading_data[exchangeName][symbol], "time");
  			output.price = returnArray(4, i, $scope.trading_data[exchangeName][symbol], "price")
  		
  		}
  	}

  	// console.log("output for getTradingData", output);

  	return output;

  }

  $scope.showTradeInfo = function(item){
		// console.log(" i am in trade info", item)
		$scope.graphToDisplay = item;


		// trade in question
		var tradeBeingRecommended = $scope.trades[item]
		console.log("i am trade being recommended", tradeBeingRecommended);
		console.log("I am new format of time", moment.unix(tradeBeingRecommended.first.time).format("HH:mm:ss"));
		// getRightGraphDataPoints(item);
		var dataOutput = $scope.getRightGraphDataPoints(item);

		console.log("i am dataOutput", dataOutput);

		$scope.labels =  dataOutput.labels
		$scope.series = dataOutput.series
		$scope.data = dataOutput.data

		$scope.tradeSteps =	$scope.tradeStepsToDisplay(item);
  }




  // get the right exchanges, get the right time of the trade, get the 4 data points to either side of the trade

   $scope.getRightGraphDataPoints = function (tradeDataPoint) {
	   	// console.log("get Right Graph Data is getting called", $scope)
	  	var output = {}

		if ($scope.trades[tradeDataPoint].first) {
		
		  	var firstExchange = $scope.trades[tradeDataPoint].first.exchange;
		  	var firstExchangeTradingTime = $scope.trades[tradeDataPoint].first.time;
		  	var firstExchangeTradingSymbol = $scope.trades[tradeDataPoint].first.symbol;

		  	// get the 9 data points for labels
	  		output[firstExchange] = getTradingData(firstExchange, firstExchangeTradingTime, firstExchangeTradingSymbol)
	  		// console.log("I am output for first", output)
	  	
	  	} else {
	  		
	  		return
	  	
	  	}

	  	if ($scope.trades[tradeDataPoint].second) {
	  		
	  		var secondExchange = $scope.trades[tradeDataPoint].second.exchange
	  		var secondExchangeTradingTime = $scope.trades[tradeDataPoint].second.time
		  	var secondExchangeTradingSymbol = $scope.trades[tradeDataPoint].second.symbol;

	  		output[secondExchange] = getTradingData(secondExchange, secondExchangeTradingTime, secondExchangeTradingSymbol)
	  		// console.log("I am output for second", output)
	  	
	  	} else {
	  		return 
	  	}

	  	if ($scope.trades[tradeDataPoint].third) {
	  		var thirdExchange = $scope.trades[tradeDataPoint].third.exchange
	  		var thirdExchangeTradingTime = $scope.trades[tradeDataPoint].third.time
		  	var thirdExchangeTradingSymbol = $scope.trades[tradeDataPoint].third.symbol;

	  		output[thirdExchange] = getTradingData(thirdExchange, thirdExchangeTradingTime, thirdExchangeTradingSymbol)
	  		// console.log("I am output for third", output)

	  	} else {
	  		// console.log("no third exchange")
	  	}

	  	// output {
			// firstExchange: {
			  	// 	time:[],
			  	// 	price: []
		  	// }
	  	// };

	  	// console.log("I am output", output, firstExchange, secondExchange, thirdExchange);
	  	// NOTE - NEED TO ADD LOGIC FOR THIRD EXCHANGE


	  	var dataOutput = {
	  		labels : output[firstExchange].time,

	  		series: [
	  			firstExchange,
	  			secondExchange
	  		],

	  		data: [
	  			output[firstExchange].price,
	  			output[secondExchange].price
	  			// exchange 2 data - 9 data points
	  		]

	  	}
	  	return dataOutput;
	  }



  // live update the graph 


  // freeze the view in chartjs

  // $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
  

  // $scope.series = ['Series A', 'Series B'];
  // $scope.data = [
  //   [65, 59, 80, 81, 56, 55, 40],
  //   [28, 48, 40, 19, 86, 27, 90]
  // ];

  // SCOPE VARIABLE FOR GRAPHS

  $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
  
  $scope.options = {
    scales: {
      yAxes: [
        {
          id: 'y-axis-1',
          type: 'linear',
          display: true,
          position: 'left'
        },
        {
          id: 'y-axis-2',
          type: 'linear',
          display: true,
          position: 'right'
        }
      ]
    }
  };


  // SCOPE VARIABLE FOR TRADING STEPS

  // scope.trades = [{ROI_of_trade: 98.22386956952988
	// description: "Trade BTCUSDT & BTCAUD at binance & coinjar"
	// display_ROI: "98.2%"
	// first:
	// buy:
		// asset: "BTC"
		// price: "8658.42000000"
		// quantity: 0.5740249668797938
		// __proto__: Object
		// exchange: "binance"
		// indexTradeData: null
		// sell:
		// asset: "USDT"
		// price: 0.00011549451285569422
		// quantity: 4970.149253731344
		// __proto__: Object
		// symbol: "BTCUSDT"
		// time: 1559538833853
		// __proto__: Object
	// profitable: true}]

  $scope.tradeStepsToDisplay = function (tradeDataPoint) {

  		// console.log("get Right tradeStepsToDisplay is getting called", $scope.trades)
	  	var output = {
	  		steps: [],
	  		summary: {

	  		}
	  	}

	  	// element format
	  	// {
	  		// buy : {
	  		// 	asset: 
	  		// 	price: 
	  		// 	quantity: xxx
	  		// }
	  	// }

		if ($scope.trades[tradeDataPoint].first) {

			output.steps.push($scope.trades[tradeDataPoint].first)
		  	// var firstExchange = $scope.trades[tradeDataPoint].first.exchange;
		  	// var firstExchangeFirstBuySymbol = $scope.trades[tradeDataPoint].first.buy.asset;
		  	// var firstExchangeFirstBuySymbol = $scope.trades[tradeDataPoint].first.buy.asset;


	  		// console.log("I am output for first", output)
	  	
	  	} else {
	  		
	  		return
	  	
	  	}

	  	if ($scope.trades[tradeDataPoint].second) {
	  		
			output.steps.push($scope.trades[tradeDataPoint].second)

	  	
	  	} else {
	  		return 
	  	}

	  	if ($scope.trades[tradeDataPoint].third) {
			output.steps.push($scope.trades[tradeDataPoint].third)


	  	} else {
	  		console.log("no third exchange")
	  	}

	  	var fiatReturn = Math.round(output.steps[0].sell.quantity * (1 + $scope.trades[tradeDataPoint].ROI_of_trade / 10)) / 10;

	  	console.log("fiatreturn", fiatReturn)

		output.summary = {
			display_ROI: $scope.trades[tradeDataPoint].display_ROI, 
			quantity_fiat: fiatReturn.toLocaleString("en")
		}

	  	console.log("output for tradeStepsToDisplay", output, $scope.trades)
	  	
	  	return output;

  }




});


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