const WebSocket = require('ws');
const express = require('express');
var path = require('path');
var ccxt = require("ccxt");
const axios = require('axios');
var moment = require("moment");


var context = {
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
			"data_endpoint": "wss://feed.exchange.coinjar.com/socket/websocket",
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


//  start app server on websocket 

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
});
 
const wss = new WebSocket.Server({ server });