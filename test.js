
var express = require('express');
var path = require('path');
var app = express();
var server = require('http').createServer(app);

const WebSocket = require('ws');

var context = {
    "selected_exchanges": {
        "exchange_1": "binance",
        "exchange_2": "coinjar",    
    },
    "crypto_exchange_parameters": {
        "coinjar": {
            "name": "coinjar",
            "data_endpoint": "wss://feed.exchange.coinjar.com/socket/websocket",
            "heartbeat_freq": 15000,
            "heartbeat_message": { "topic": "phoenix", "event": "heartbeat", "payload": {}, "ref": 0 },
            "channel_sub": {
                "BTCAUD": { "topic": "trades:BTCAUD", "event": "phx_join", "payload": {}, "ref": 0 },
                "LTCAUD": { "topic": "trades:LTCAUD", "event": "phx_join", "payload": {}, "ref": 0 },
                "ZECBTC": { "topic": "trades:ZECBTC", "event": "phx_join", "payload": {}, "ref": 0 }
            }, 
            "slippage": 0.01,
            "fees": 0.001,
            "current_fiat": 5000,
            "current_crypto": 100
        },
        "binance" :{
            "name": "binance",
            "data_endpoint": "wss://stream.binance.com:9443",
            "heartbeat_freq": 3 * 60 * 1000,
            "channel_sub": {
                "BTCUSDT": "BTCUSDT",
                "ZECBTC": "ZECBTC",
                "LTCUSDT": "LTCUSDT"
            },
            "slippage": 0.005,
            "fees": 0.001,
            "current_fiat": 5000,
            "currentLTCAUD_crypto": 100,
            "time_sync_adjustment" : (8 * 60 * 60 + 19 * 60 + 55)
        }
    },
    "forex_parameters":{
        "forex_api": "https://api.exchangeratesapi.io/latest?base=AUD"
    },
    "selected_trading_pairs": {
        "crypto_1": "LTC/USDT",
        "crypto_2": "LTC/AUD",
        "fiat_1": "AUD",
        "fiat_2": "USD"
    },
    "marginOfError": 0.01,
    "amountToTrade": 0.05,
    "trading_data": {
        "binance": {
            "BTCUSDT" : 
            [
                {
                symbol: "BTCUSDT",
                time: Date.now(),
                price: 7300,
                quantity: 1,
                exchange: "binance" 
                }
            ],
            "ZECBTC" : [
                {
                symbol: "ZECBTC",
                time: Date.now(),
                price: 0.009,
                quantity: 1,
                exchange: "binance" 
                }
            ],
            "LTCUSDT" : [
                {
                symbol: "LTCUSDT",
                time: Date.now(),
                price: 85,
                quantity: 1,
                exchange: "binance" 
                }
            ] 
        },
        "coinjar": {
            "BTCAUD" : 
            [
                {
                symbol: "BTCAUD",
                time: Date.now(),
                price: 9900,
                quantity: 1,
                exchange: "coinjar" 
                }
            ],
            "ZECBTC" : [
                {
                symbol: "ZECBTC",
                time: Date.now(),
                price: 0.009,
                quantity: 1,
                exchange: "coinjar" 
                }
            ],
            "LTCAUD" : [
                {
                symbol: "LTCAUD",
                time: Date.now(),
                price: 121,
                quantity: 1,
                exchange: "coinjar" 
                }
            ] 
        },
        "forex":{
            "AUDUSD" : []
        },
    },
    "twoWayLookup" :{
        BTCUSDT : "BTCAUD",
        LTCUSDT : "LTCAUD",
        ZECBTC : "ZECBTC", 
        BTCAUD : "BTCUSDT",
        LTCAUD : "LTCUSDT",         
    },
    "arbitrage_opportunities":{
        selected : []
            // 150230214310 : {

            // }
        ,
        allOpportunities : []
            // 12325315314 : {

            // }
        
        // selected : {
        //  // trade_id: belo
        // },
        // allOpportunities: {

        
        // 15105104313 : {
        //  // {
        // selected: true or false
        // trade_id: 1
        // type_of_trade: twoWay or threeWay,
        // time_of_trade: trades.first.time,
        // ROI_of_trade: ROI
        // trades: {
            // first: {
            //  exchange: binance
            //  symbol: BTCUSDT
            //  indexTradeData: Index in the Trade Data Array
            //  trade: buy
            //  time: time
            //  buyAsset: BTC
            //  sellAsset: USDT
            //  buyPrice: BTC/USDT Price
            //  buyQuantity: quantity of buyAsset bought
            //  sellQuantity: quantity of sellAsset sold
            // },
            // second: {
            //  exchange: binance
            //  symbol: BTCUSDT
            //  indexTradeData: Index in the Trade Data Array
            //  trade: buy
            //  time: time
            //  buyAsset: BTC
            //  sellAsset: USDT
            //  buyPrice: BTC/USDT Price
            //  buyQuantity: quantity of buyAsset bought
            //  sellQuantity: quantity of sellAsset sold
            // },
            // third: {
            //  exchange: binance
            //  symbol: BTCUSDT
            //  indexTradeData: Index in the Trade Data Array
            //  trade: buy
            //  time: time
            //  buyAsset: BTC
            //  sellAsset: USDT
            //  buyPrice: BTC/USDT Price
            //  buyQuantity: quantity of buyAsset bought
            //  sellQuantity: quantity of sellAsset sold
            // },
        // }
        // exchange_first: exchangeName,
        // time_first: exchangeNameTime,
        // time_second: 
    // }
        // }
    }   
};

var coinjarWss = new WebSocket(context["crypto_exchange_parameters"]["coinjar"]["data_endpoint"]);

coinjarWss.on("open", function connection(socket){
    console.log("Server connected to coinjar")  

    // set heartbeat every 40 seconds - coinjar requires every 45 seconds
    setInterval(function(){
        console.log("trying to send a heartbeat")
        coinjarWss.send(JSON.stringify(context["crypto_exchange_parameters"]["coinjar"]["heartbeat_message"]));
        // console.log("sending heart beat!")
    }, context["crypto_exchange_parameters"]["coinjar"]["heartbeat_freq"])


    // subscribe to coinjar token channel
    // coinjarWss.send(context["crypto_exchange_parameters"]["coinjar"]["channel_sub"]["BTCUSD"]);
    // coinjarWss.send(context["crypto_exchange_parameters"]["coinjar"]["channel_sub"]["ZECUSD"]);


    // get message from coinjar Socket

    coinjarWss.on('message', function incoming(message) {
        // console.log("received message", message)
        coinjarDataObj = JSON.parse(message);
        console.log(coinjarDataObj)
        coinjarData = coinjarDataObj["payload"];
        
        if (coinjarDataObj["topic"] !== "phoenix") {
            if (coinjarDataObj["event"] == "init") {
                for (var i = 0; i < coinjarDataObj.payload.trades.length; i ++){                    
                    // context.trading_data = updateTradingLog(context.trading_data, "coinjar", coinjarDataObj.topic.substr(7, coinjarDataObj.topic.length-7), coinjarDataObj.payload.trades[i])
                }
            } else if (coinjarDataObj["event"] == "new") {
                console.log("IAM DATA OBJ", coinjarDataObj.payload.trades[0])
                // context.trading_data = updateTradingLog(context.trading_data, "coinjar", coinjarDataObj.topic.substr(7, coinjarDataObj.topic.length-7), coinjarDataObj.payload.trades[0])
            }
        }
    });

    coinjarWss.send(JSON.stringify(context["crypto_exchange_parameters"]["coinjar"]["channel_sub"]["BTCAUD"]));
    coinjarWss.send(JSON.stringify(context["crypto_exchange_parameters"]["coinjar"]["channel_sub"]["LTCAUD"]));
    coinjarWss.send(JSON.stringify(context["crypto_exchange_parameters"]["coinjar"]["channel_sub"]["ZECBTC"]));


    coinjarWss.on('close', function (evt) {
        console.log("closed")
    });

    coinjarWss.on('error', function (evt) {
        console.log("error!!", evt)
    });


});