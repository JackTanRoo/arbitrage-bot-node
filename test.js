var ccxt = require("ccxt");

// (() => async function () {


//     let allMarkets = await binance.loadMarkets()

//     console.log(allMarkets)


// }) ()

let binance = new ccxt.binance()

var allMarkets;

var start = async function (){

	allMarkets = await binance.loadMarkets();
	console.log("I am allMarkets", allMarkets)
};

start();

