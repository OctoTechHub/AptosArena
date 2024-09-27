// import WebSocket from 'ws';
const WebSocket = require('ws');
// Define the playerId that you want to send to the server
const playerId = '66e695f44e03e22adaed3347'; // Replace with actual playerId

// Create a WebSocket connection to the server
const ws = new WebSocket('wss://aptosarena.onrender.com');

// Event listener for when the connection opens
ws.on('open', () => {
  console.log('Connected to the server');

  // Send the player's ID to the server
  ws.send(JSON.stringify({ playerId }));

  console.log(`Player ID ${playerId} sent to the server`);
});

// Event listener for receiving messages from the server
ws.on('message', (data) => {
  // Parse and handle the incoming message
  const message = JSON.parse(data);
  console.log('Received data from server:', message);

  if (message.error) {
    console.error('Error from server:', message.error);
  } else {
    const { playerId, stats, currentValue } = message;
    console.log(`Stats for player ${playerId}:`, stats);
    console.log(`Current value of player ${playerId}: ${currentValue}`);
  }
});

// Event listener for when the connection closes
ws.on('close', () => {
  console.log('Disconnected from the server');
});

// Event listener for errors
ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});
