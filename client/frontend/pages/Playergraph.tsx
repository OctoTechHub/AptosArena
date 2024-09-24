import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PlayerGraph: React.FC = () => {
  const { id } = useParams<{ id: string }>();  // Player ID from URL params
  const [data, setData] = useState<{ time: string; value: number }[]>([]); // Store value history

  useEffect(() => {
    // Establish WebSocket connection
    const socket = new WebSocket('ws://localhost:8080'); // Update with correct WS URL

    // Send playerId to the WebSocket server after connection is established
    socket.onopen = () => {
      console.log(`WebSocket connection established. Sending playerId: ${id}`);
      socket.send(JSON.stringify({ playerId: id }));
    };

    // Handle incoming messages from WebSocket
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      // Only proceed if message contains the correct player ID
      if (message.playerId === id) {
        // Extract the current value and update the data array
        setData((prevData) => [
          ...prevData,
          { time: new Date().toLocaleTimeString(), value: message.currentValue },
        ]);
      }
    };

    // Clean up WebSocket connection on unmount
    return () => {
      socket.close();
    };
  }, [id]);

  return (
    <div className='flex w-screen'>
      <h2>Player Value Over Time</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis domain={['auto', 'auto']} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PlayerGraph;
