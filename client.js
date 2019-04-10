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
	  // console.log("received data from server", data);
	  if (incomingData.type = "trade") {
	  	var currentTime = moment.unix(Math.floor(incomingData.data.x)).format('H:m:s, MMM D, YY');
	  	Plotly.extendTraces("chart", { 
	  		x: [[currentTime],[currentTime]],
	  		y: [[incomingData.data.y],[Math.random()*100]]
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
    	type : "line"
    },{
		x: [moment.unix(Math.floor(Date.now() / 1000)).format('H:m:s, MMM D, YY')],
    	y: [0],
    	type : "line"
    }]);

});