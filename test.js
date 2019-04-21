var ccxt = require("ccxt");

// (() => async function () {


//     let allMarkets = await binance.loadMarkets()

//     console.log(allMarkets)


// }) ()

let binance = new ccxt.binance()
var fs = require("fs");

// var data = "New File Contents";




var allMarkets;
var array;

var i

var start = async function (){

	allMarkets = await binance.loadMarkets();
	// console.log("I am allMarkets", Object.keys(allMarkets))

	console.log("in the async", Object.keys(allMarkets))
	// return Object.keys(allMarkets)
	array = Object.keys(allMarkets);

	fs.writeFile("temp.txt", array, (err) => {
	  if (err) console.log(err);
	  console.log("Successfully Written to File.");
	});

};

start();

console.log("array", array);


