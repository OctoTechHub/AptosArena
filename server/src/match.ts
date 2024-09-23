import WebSocket, { WebSocketServer } from 'ws';
import { connectToDatabase, Player } from './db/index'; // Assuming you have player model
connectToDatabase()
// Define the type for a player's stats
type PlayerStats = {
  runs: number;
  ballsFaced: number;
  wickets: number;
  oversBowled: number;
};

// Define the type for the team state
type TeamState = {
  players: {
    [playerId: string]: PlayerStats; // Index signature for player stats
  };
  overs: number;
  balls: number;
  runs: number;
  wickets: number;
  status: 'batting' | 'bowling' | 'waiting';
};

// Set up a WebSocket server
const wss = new WebSocketServer({ port: 8080 });

// Simulated cricket match data
let matchState = {
  team1: {
    players: {} as { [playerId: string]: PlayerStats }, // Type for players
    overs: 0,
    balls: 0,
    runs: 0,
    wickets: 0,
    status: 'batting' as 'batting' | 'bowling' | 'waiting'
  },
  team2: {
    players: {} as { [playerId: string]: PlayerStats }, // Type for players
    overs: 0,
    balls: 0,
    runs: 0,
    wickets: 0,
    status: 'waiting' as 'batting' | 'bowling' | 'waiting'
  },
  currentInnings: 1, // 1 for team1's innings, 2 for team2's innings
  matchStatus: 'ongoing' as 'ongoing' | 'ended'
};

// Initialize players for both teams
const initializeMatchState = async () => {
  const players = await Player.find();
  const midPoint = Math.floor(players.length / 2);

  players.slice(0, midPoint).forEach(player => {
    matchState.team1.players[player._id.toString()] = {
      runs: 0,
      ballsFaced: 0,
      wickets: 0,
      oversBowled: 0
    };
  });

  players.slice(midPoint).forEach(player => {
    matchState.team2.players[player._id.toString()] = {
      runs: 0,
      ballsFaced: 0,
      wickets: 0,
      oversBowled: 0
    };
  });

  console.log('Match state initialized with players:', matchState);
};

// Function to simulate an event in the match
const simulateMatchEvent = () => {
  if (matchState.matchStatus === 'ended') return;

  let currentTeam = matchState.currentInnings === 1 ? matchState.team1 : matchState.team2;
  const playerIds = Object.keys(currentTeam.players);
  const randomPlayerId = playerIds[Math.floor(Math.random() * playerIds.length)];

  // Simulate random events (e.g., runs, wickets)
  const event = Math.floor(Math.random() * 6); // Random number between 0-5 for different events

  if (event <= 4) {
    // Player hits 0-4 runs
    const runs = event;
    currentTeam.players[randomPlayerId].runs += runs;
    currentTeam.players[randomPlayerId].ballsFaced += 1;
    currentTeam.runs += runs;
    currentTeam.balls += 1;
  } else if (event === 5) {
    // Wicket
    currentTeam.players[randomPlayerId].ballsFaced += 1;
    currentTeam.wickets += 1;
    currentTeam.balls += 1;
  }

  // Every 6 balls increment over
  if (currentTeam.balls % 6 === 0) {
    currentTeam.overs += 1;
  }

  // Check if the innings should end (20 overs or 10 wickets)
  if (currentTeam.overs >= 20 || currentTeam.wickets >= 10) {
    if (matchState.currentInnings === 1) {
      matchState.currentInnings = 2; // Switch to team2's innings
      matchState.team1.status = 'bowling';
      matchState.team2.status = 'batting';
      console.log('Team 1 finished batting. Team 2 is now batting.');
    } else {
      matchState.matchStatus = 'ended'; // End the match after team 2's innings
      console.log('Match ended.');
    }
  }
};

// Broadcast the current match state to all connected clients
const broadcastMatchState = () => {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(matchState));
    }
  });
};

// Handle WebSocket connections
wss.on('connection', async (ws) => {
  console.log('New client connected');
  
  // Send the current match state to the newly connected client
  ws.send(JSON.stringify(matchState));

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Start the simulation and broadcast updates every few seconds
const startMatchSimulation = async () => {
  await initializeMatchState();
  const matchInterval = setInterval(() => {
    if (matchState.matchStatus === 'ended') {
      clearInterval(matchInterval);
      console.log('Match ended');
    } else {
      simulateMatchEvent();
      broadcastMatchState();
    }
  }, 2000); // Broadcast every 2 seconds
};

startMatchSimulation();
