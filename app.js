// # STORIES
// # create server
// # select crypto to track to track pricing data and make trades
// # select crypto exchange to track pricing data and make trades
// # select fiat pair to track forex rates
// # select forex rate exchange to pull exchange data from
// # pull pricing data from selected crypto exchanges every 1 minute
// # pull forex data from selected forex source every 1 hour
// # plot data as a live graph that updates every 1 minute
// # provide trade suggestions 
// # plot trade suggestions on graph updated every 1 minute
// # plot trade suggestions on the graph every 1 minute
// # make trades to selected trades based on key trade parameters - balance, trading amount, trading currency, trading direction, trading price
// # track balance after every trade
// # calculate profitability of every trade


const http = require('http');
const static = require('node-static');
const file = new static.Server('./');
const crypto = require('crypto');



const server = http.createServer((req, res) => {
  req.addListener('end', () => file.serve(req, res)).resume();
});
const port = 3000;
server.listen(port, () => console.log(`Server running at http://localhost:${port}`));



server.on('upgrade', (req, socket) => {
// Make sure that we only handle WebSocket upgrade requests
	if (req.headers['upgrade'] !== 'websocket') {
	  socket.end('HTTP/1.1 400 Bad Request');
	  return;
	}
// More to come…

  // Read the websocket key provided by the client: 
  const acceptKey = req.headers['sec-websocket-key']; 
  // Generate the response value to use in the response: 
  const hash = generateAcceptValue(acceptKey); 
  // Write the HTTP response into an array of response lines: 
  const responseHeaders = [ 'HTTP/1.1 101 Web Socket Protocol Handshake', 'Upgrade: WebSocket', 'Connection: Upgrade', `Sec-WebSocket-Accept: ${hash}` ]; 
  // Write the response back to the client socket, being sure to append two // additional newlines so that the browser recognises the end of the response // header and doesn't continue to wait for more header data: 
  socket.write(responseHeaders.join('\r\n') + '\r\n\r\n');

  // Read the subprotocol from the client request headers:
	const protocol = req.headers['sec-websocket-protocol'];
	// If provided, they'll be formatted as a comma-delimited string of protocol
	// names that the client supports; we'll need to parse the header value, if
	// provided, and see what options the client is offering:
	const protocols = !protocol ? [] : protocol.split(',').map(s => s.trim());
	// To keep it simple, we'll just see if JSON was an option, and if so, include
	// it in the HTTP response:
	if (protocols.includes('json')) {
	  // Tell the client that we agree to communicate with JSON data
	  responseHeaders.push(`Sec-WebSocket-Protocol: json`);
	}

});

function generateAcceptValue (acceptKey) {
  return crypto
  .createHash('sha1')
  .update(acceptKey + '258EAFA5-E914–47DA-95CA-C5AB0DC85B11', 'binary')
  .digest('base64');
}
