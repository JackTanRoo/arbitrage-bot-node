$( document ).ready(function() {
    console.log( "ready!" );
	
	TESTER = document.getElementById('chart');

	const clientWS = new WebSocket('ws://localhost:3000');

	clientWS.addEventListener('open', () => {
	  // Send a message to the WebSocket server
	  const data = { message: 'Hello from the client!' }
	  const json = JSON.stringify(data);
	  clientWS.send(json);
	  console.log("open")
	});


	// only show max x data points

	var count = 0;

	clientWS.addEventListener('message', (event) => {
	  // The `event` object is a typical DOM event object, and the message data sent
	  // by the server is stored in the `data` property
	  var incomingData = JSON.parse(event.data);
	  console.log("I got data from server: ", incomingData)
	  // console.log("received data from server", data);
	  if (incomingData.type = "trade") {
	  	
			// Incoming Data format
				// trace 1 = coinjar
				// {
				// 	type : "trade",
				// 	coinjar : {
				// 		name : "coinjar",
				// 		type : "trade",
				// 		data : {
				// 			x : coinjarDate,
				// 			y : coinjarData.last
				// 		}	
				// 	},
				// 	binance: {
				// 		name : "binance",
				// 		type : "trade",
				// 		data: {
				// 			x : latestBinanceDate,
				// 			y : latestBinancePriceUSD
				// 		}
				// 	}
				// };
				// index 0 = binance, 
				// index 1 = coinjar

	  	var binanceCurrentTime = moment.unix(Math.floor(incomingData.binance.data.x)).format('H:m:s, MMM D, YY');
	  	var coinjarCurrentTime = moment.unix(Math.floor(incomingData.coinjar.data.x)).format('H:m:s, MMM D, YY');
	  	
	  	Plotly.extendTraces("chart", { 
	  		x: [[binanceCurrentTime],[coinjarCurrentTime]],
	  		y: [[incomingData.binance.data.y],[incomingData.coinjar.data.y]]
	  	}, [0,1])

	  	count++;

	  	if (count > 10) {
	  		Plotly.relayout("chart", {
	  			xaxis : {
	  				range: [count-10, count]
	  			}
	  		})
	  	}

	  }
	  
	  
	});

	// data structure from 
	// plotly
	// [trace0=binance, trace1=coinjar, trace2=USDAUD, trace3=tradingmarker];
	// incoming data format
	// {
		// name: tracename,
		// type: "trade",
		// data: {
		// x : [timeinunixtime]
		// y : [closepriceinUSD]
		// type: "line"
		// }
	// };


    Plotly.plot ("chart", [
    {
    	x: [moment.unix(Math.floor(Date.now() / 1000)).format('H:m:s, MMM D, YY')],
    	y: [0],
    	type : "line",
    	name : "binance"
    },{
		x: [moment.unix(Math.floor(Date.now() / 1000)).format('H:m:s, MMM D, YY')],
    	y: [0],
    	type : "line",
    	name : "coinjar"
    }], {}, {
    	responsive : true
    });

});