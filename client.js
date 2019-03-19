
console.log("print");

const ws = new WebSocket('ws://localhost:3000');

ws.addEventListener('open', () => {
  // Send a message to the WebSocket server
  ws.sconst data = { message: 'Hello from the client!' }
  const json = JSON.stringify(data);
  ws.send(json);end('Hello!');

});



ws.addEventListener('message', (event) => {
  // The `event` object is a typical DOM event object, and the message data sent
  // by the server is stored in the `data` property
  const data = JSON.parse(event.data);
  console.log(data);
  
});