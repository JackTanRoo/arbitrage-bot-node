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
	  server.end('HTTP/1.1 400 Bad Request');
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
  server.write(responseHeaders.join('\r\n') + '\r\n\r\n');

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

server.on('data', buffer => {

  const message = parseMessage(buffer);
  if (message) {
    // For our convenience, so we can see what the client sent
    console.log(message);
    // We'll just send a hardcoded message in this example 
    server.write(constructReply({ message: 'Hello from the server!' })); 
  } else if (message === null) { 
    console.log('WebSocket connection closed by the client.'); 
  }
});

function constructReply (data) {
  // Convert the data to JSON and copy it into a buffer
  const json = JSON.stringify(data)
  const jsonByteLength = Buffer.byteLength(json);
  // Note: we're not supporting > 65535 byte payloads at this stage const lengthByteCount = jsonByteLength < 126 ? 0 : 2; const payloadLength = lengthByteCount === 0 ? jsonByteLength : 126; const buffer = Buffer.alloc(2 + lengthByteCount + jsonByteLength); // Write out the first byte, using opcode `1` to indicate that the message // payload contains text data buffer.writeUInt8(0b10000001, 0); buffer.writeUInt8(payloadLength, 1); // Write the length of the JSON payload to the second byte let payloadOffset = 2; if (lengthByteCount > 0) { buffer.writeUInt16BE(jsonByteLength, 2); payloadOffset += lengthByteCount; } // Write the JSON data to the data buffer buffer.write(json, payloadOffset); return buffer;
}

function parseMessage (buffer) {
	console.log(buffer);
	return buffer;





  // const firstByte = buffer.readUInt8(0);
  // const isFinalFrame = Boolean((firstByte >>> 7) & 0×1); 
  // const [reserved1, reserved2, reserved3] = [ Boolean((firstByte >>> 6) & 0×1), Boolean((firstByte >>> 5) & 0×1), Boolean((firstByte >>> 4) & 0×1) ]; 
  // const opCode = firstByte & 0xF; 
  // // We can return null to signify that this is a connection termination frame 
  // if (opCode === 0×8) 
  //    return null; 
  // // We only care about text frames from this point onward 
  // if (opCode !== 0×1) 
  //   return; 
  // const secondByte = buffer.readUInt8(1); 
  // const isMasked = Boolean((secondByte >>> 7) & 0×1); 
  // // Keep track of our current position as we advance through the buffer 
  // let currentOffset = 2; 
  // let payloadLength = secondByte & 0×7F; 
  // if (payloadLength > 125) { 
  //   if (payloadLength === 126) { 
  //     payloadLength = buffer.readUInt16BE(currentOffset); 
  //     currentOffset += 2; 
  //   } else { 
  //     // 127 
  //     // If this has a value, the frame size is ridiculously huge! 
  //     const leftPart = buffer.readUInt32BE(currentOffset); 
  //     const rightPart = buffer.readUInt32BE(currentOffset += 4); 
  //     // Honestly, if the frame length requires 64 bits, you're probably doing it wrong. 
  //     // In Node.js you'll require the BigInt type, or a special library to handle this. throw new Error('Large payloads not currently implemented'); 
  //   } 
  // }
}
