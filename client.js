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


	clientWS.addEventListener('message', (event) => {
	  // The `event` object is a typical DOM event object, and the message data sent
	  // by the server is stored in the `data` property
	  const data = JSON.parse(event.data);
	  console.log("received data from server", data);
	  
	});


	// data structure from 

	// plotly
	// [trace0=binance, trace1=coinjar, trace2=USDAUD, trace3=tradingmarker];
	// incoming data format
	// {
		// name: tracename,
		// data: {
		// x : [timeinunixtime]
		// y : [closepriceinUSD]
		// type: "line"
		// }
	// }





    Plotly.plot ("chart", [{
    	x: [1,2,3,4],
    	y: [5,10,15,20],
    	type : "line"
    }]);

});