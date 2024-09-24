import React, { useEffect, useState } from 'react';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import axios from 'axios';
import { useParams } from 'react-router-dom';

interface AreaGraphData {
  time: number;
  value: number;
  color: string;
}

interface Player {
  firstName: string;
  lastName: string;
  value: number;
  quantity: number;
  imageUrl: string;
  nationality: string;
  role: string;
  playerName: string;
}

interface PlayerStats {
  runs: number;
  ballsFaced: number;
  wickets: number;
  oversBowled: number;
}

const PlayerGraph: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Get player ID from URL params
  const [areaGraphData, setAreaGraphData] = useState<AreaGraphData[]>([]); // Store area graph data
  const [player, setPlayer] = useState<Player | null>(null); // Store player data
  const [stats, setStats] = useState<PlayerStats | null>(null); // Store player stats
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  useEffect(() => {
    // Fetch player data from API
    const fetchPlayer = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/player/getPlayer/${id}`);
        setPlayer(response.data); // Store player data in state
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch player data');
        setLoading(false);
      }
    };

    fetchPlayer();

    // WebSocket connection for real-time data updates
    const socket = new WebSocket('ws://localhost:8080');

    socket.onopen = () => {
      console.log(`WebSocket connection established. Sending playerId: ${id}`);
      socket.send(JSON.stringify({ playerId: id }));
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.playerId === id) {
        const currentValue = message.currentValue;
        const now = new Date().getTime();

        // Update area graph data with new value
        setAreaGraphData((prevData) => {
          const updatedData = [...prevData];
          const lastValue = prevData.length > 0 ? prevData[prevData.length - 1].value : currentValue;

          // Determine the color (green for rising, red for falling)
          const color = currentValue >= lastValue ? '#00ff00' : '#ff0000';

          updatedData.push({
            time: now,
            value: currentValue,
            color,
          });

          return updatedData;
        });

        // Update player stats
        setStats(message.stats); // Set the real-time stats received from WebSocket
      }
    };

    return () => {
      socket.close(); // Close WebSocket connection when component unmounts
    };
  }, [id]);

  const options = {
    chart: {
      type: 'area',
      backgroundColor: '#181818', // Dark background
    },
    title: {
      text: `Player Value Over Time (${player?.firstName || 'Loading...'} ${player?.lastName || ''})`,
      style: { color: '#ffffff' },
    },
    yAxis: {
      title: {
        text: 'Value',
        style: { color: '#ffffff' },
      },
      gridLineColor: '#444',
      labels: {
        style: {
          color: '#ffffff',
        },
      },
    },
    xAxis: {
      type: 'datetime',
      labels: {
        style: {
          color: '#ffffff',
        },
      },
    },
    tooltip: {
      shared: true,
      style: {
        color: '#ffffff',
      },
    },
    plotOptions: {
      area: {
        fillOpacity: 0.5,
        marker: {
          enabled: false,
        },
        threshold: null,
      },
    },
    series: [
      {
        name: 'Player Value',
        data: areaGraphData.map(({ time, value }) => [time, value]),
        color: '#1e90ff',
        zones: areaGraphData.map(({ value, color }, index) => ({
          value: value,
          color: color, // Color transitions depending on rise or fall
        })),
        fillColor: {
          linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
          stops: [
            [0, 'rgba(0, 255, 0, 0.5)'], // Green for rising areas
            [1, 'rgba(255, 0, 0, 0.5)'], // Red for falling areas
          ],
        },
      },
    ],
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="w-full max-w-4xl p-5 rounded-lg bg-gray-800 shadow-lg">
        {loading ? (
          <div className="text-xl">Loading player data...</div>
        ) : error ? (
          <div className="text-xl text-red-500">{error}</div>
        ) : (
          <div>
            {/* Display Player Info */}
            <div className="flex items-center mb-8 space-x-4">
              <img
                src={player?.imageUrl}
                alt={player?.playerName}
                className="w-24 h-24 rounded-full shadow-md"
              />
              <div>
                <h2 className="text-2xl font-bold">
                  {player?.firstName} {player?.lastName}
                </h2>
                <p className="text-lg text-gray-400">
                  {player?.role} - {player?.nationality}
                </p>
                <p className="text-lg font-semibold">Value: {player?.value}</p>
              </div>
            </div>

            {/* Display Real-time Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-gray-700 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold">Runs</h3>
                <p className="text-xl">{stats?.runs || 0}</p>
              </div>
              <div className="p-4 bg-gray-700 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold">Balls Faced</h3>
                <p className="text-xl">{stats?.ballsFaced || 0}</p>
              </div>
              <div className="p-4 bg-gray-700 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold">Wickets</h3>
                <p className="text-xl">{stats?.wickets || 0}</p>
              </div>
              <div className="p-4 bg-gray-700 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold">Overs Bowled</h3>
                <p className="text-xl">{stats?.oversBowled || 0}</p>
              </div>
            </div>

            {/* Render Graph */}
            <div className="bg-gray-700 rounded-lg p-5 shadow-md">
              <HighchartsReact highcharts={Highcharts} options={options} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerGraph;
