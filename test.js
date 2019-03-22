const WebSocket = require('ws');
const express = require('express');
var path = require('path');

context = {
	"selected_exchanges": {
		"exchange_1": "binance",
		"exchange_2": "coinjar",	
	},
	"crypto_exchange_parameters": {
		"coinjar": {
			"data_endpoint": "wss://feed.exchange.coinjar.com/socket/websocket",
			"heartbeat_freq": 4500,
			"heartbeat_message": '{ "topic": "phoenix", "event": "heartbeat", "payload": {}, "ref": 0 }',
			"channel_sub": '{ "topic": "ticker:BTCAUD", "event": "phx_join", "payload": {}, "ref": 0 }'
		}
	},
	"forex_parameters":{
		"forex_api": "http://www.apilayer.net/api/live?access_key=97ec6af4d54ae75ef9cf190f8706b6c7&currencies="
	},
	"selected_trading_pairs": {
		"crypto_1": "LTC/USD",
		"crypto_2": "LTC/AUD",
		"fiat_1": "AUD",
		"fiat_2": "USD"
	}
}

var coinjarWss = new WebSocket(context["crypto_exchange_parameters"]["coinjar"]["data_endpoint"])

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
		console.log("received from a client: ", message)
	});  

	coinjarWss.send(context["crypto_exchange_parameters"]["coinjar"]["channel_sub"]);

})