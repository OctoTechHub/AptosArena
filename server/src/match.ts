import WebSocket, { WebSocketServer } from 'ws';
import { connectToDatabase, Player } from './db/index'; // Assuming you have player model

connectToDatabase();

// Define the type for a player's stats
type PlayerStats = {
  runs: number;
  ballsFaced: number;
  wickets: number;
  oversBowled: number;
};

// Define the type for the match state
type MatchState = {
  players: {
    [playerId: string]: PlayerStats; // Index signature for player stats
  };
  matchStatus: 'ongoing' | 'ended';
};

// Set up a WebSocket server
const wss = new WebSocketServer({ port: 8080 });

// Simulated cricket match data
let matchState: MatchState = {
  players: {} as { [playerId: string]: PlayerStats }, // Type for players
  matchStatus: 'ongoing'
};

// Initialize players for the simulation
const initializePlayers = async () => {
  const players = await Player.find();
  players.forEach(player => {
    matchState.players[player._id.toString()] = {
      runs: 0,
      ballsFaced: 0,
      wickets: 0,
      oversBowled: 0
    };
  });
  console.log('Match state initialized with players:', matchState);
};

// Function to update player's value based on events
const updatePlayerValue = async (playerId: string, eventType: 'run' | 'out' | 'wicket') => {
  const player = await Player.findById(playerId);

  if (player) {
    let newValue = player.value??0;

    switch (eventType) {
      case 'run':
        newValue += 10; // Increase value by 10 for each run scored
        break;
      case 'out':
        newValue -= 5; // Decrease value by 5 if the player gets out
        break;
      case 'wicket':
        newValue += 15; // Increase value by 15 for each wicket taken
        break;
    }

    // Ensure value does not go below 0
    newValue = Math.max(0, newValue);
    
    // Update the player's value in the database
    player.value = newValue;
    await player.save();
    
    console.log(`Updated player ${playerId} value to ${newValue}`);
  }
};

// Function to simulate individual player actions
const simulatePlayerAction = async (playerId: string) => {
  if (matchState.matchStatus === 'ended') return;

  const event = Math.floor(Math.random() * 6); // Random number between 0-5 for different events

  if (event <= 4) {
    const runs = event;
    matchState.players[playerId].runs += runs;
    matchState.players[playerId].ballsFaced += 1;
    console.log(`Player ${playerId} scored ${runs} runs.`);

    // Update value for batsman
    await updatePlayerValue(playerId, 'run');
  } else if (event === 5) {
    matchState.players[playerId].ballsFaced += 1;
    matchState.players[playerId].wickets += 1;
    console.log(`Player ${playerId} got out.`);

    // Update value for batsman (out) and bowler (wicket)
    await updatePlayerValue(playerId, 'out');
    await updatePlayerValue(playerId, 'wicket');
  }
};

// Broadcast the current match state for a specific player to the connected client
const broadcastMatchState = async (ws: WebSocket, playerId: string) => {
  if (ws.readyState === WebSocket.OPEN) {
    const player = await Player.findById(playerId); // Fetch player from DB to get updated value
    const stats = matchState.players[playerId];
    const currentValue = player ? player.value : 0; // Ensure the player's value is available

    // Send player stats and current value
    ws.send(JSON.stringify({
      playerId,
      stats,
      currentValue // Include the current value of the player
    }));
  }
};

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', async (message) => {
    const { playerId } = JSON.parse(message.toString());
    if (matchState.players[playerId]) {
      console.log(`Player ${playerId} connected for updates`);

      // Simulate random events for the player every 2 seconds
      const playerEventInterval = setInterval(async () => {
        if (matchState.matchStatus === 'ended') {
          clearInterval(playerEventInterval);
          console.log('Match ended for player:', playerId);
          return;
        }
        await simulatePlayerAction(playerId);
        await broadcastMatchState(ws, playerId);
      }, 2000); // Simulate events every 2 seconds

      // Clear interval on connection close
      ws.on('close', () => {
        console.log(`Player ${playerId} disconnected`);
        clearInterval(playerEventInterval);
      });
    } else {
      console.log(`Player ${playerId} not found.`);
      ws.send(JSON.stringify({ error: 'Player not found.' }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Start the simulation and allow player actions
const startPlayerSimulation = async () => {
  await initializePlayers();

  // Periodically broadcast player stats
  setInterval(() => {
    if (matchState.matchStatus === 'ended') {
      console.log('Match ended');
    }
  }, 10000); // Broadcast every 2 seconds
};

startPlayerSimulation();