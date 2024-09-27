import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Rollingstrip from '@/components/Rollingstrip';
import { PinContainer } from './../components/ui/3d-pin';
import { ChartOptions, Chart, TimeScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(TimeScale, LinearScale, PointElement, LineElement, Tooltip, Legend);


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
  const { id } = useParams<{ id: string }>();
  const [areaGraphData, setAreaGraphData] = useState({
    labels: [new Date().getTime()], // Initialize with current timestamp
    datasets: [
      {
        label: 'Player Value',
        data: [0], // Initialize with a placeholder value
        backgroundColor: 'rgba(0, 255, 0, 0.5)',
        borderColor: 'rgba(0, 255, 0, 1)',
        pointBackgroundColor: 'rgba(0, 255, 0, 1)',
        pointBorderColor: 'rgba(0, 255, 0, 1)',
        pointBorderWidth: 1,
      },
    ],
  });
  const [player, setPlayer] = useState<Player | null>(null);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPlayerValue, setCurrentPlayerValue] = useState<number | null>(null);
  const [decrementAmount, setDecrementAmount] = useState<number>(1); // Default decrement amount

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const response = await axios.get(`https://cricktrade-server.azurewebsites.net/api/player/getPlayer/${id}`);
        setPlayer(response.data);
        setCurrentPlayerValue(response.data.value);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch player data');
        setLoading(false);
      }
    };

    fetchPlayer();

    const socket = new WebSocket('ws://localhost:8085');
    socket.onopen = () => {
      console.log('WebSocket connection established');
      socket.send(JSON.stringify({ playerId: id }));
    };

    socket.onmessage = (event) => {
      console.log('WebSocket message received:', event.data);
      const message = JSON.parse(event.data);
      if (message.playerId === id) {
        const currentValue = message.currentValue;
        const now = new Date().getTime();

        setAreaGraphData((prevData) => {
          const updatedData = {
            labels: [...prevData.labels, now],
            datasets: [
              {
                ...prevData.datasets[0],
                data: [...prevData.datasets[0].data, currentValue],
              },
            ],
          };
          console.log('Updated Graph Data:', updatedData);
          return updatedData;
        });

        setStats(message.stats);
        setCurrentPlayerValue(currentValue);
      }
    };

    return () => {
      console.log('Closing WebSocket connection');
      socket.close();
    };
  }, [id]);

  const handleBuy = async () => {
    const privateKey = localStorage.getItem('privateKey');
    const publicKey = localStorage.getItem('publicKey');
    let amount = player?.value || 0;
    amount = Math.round(amount)
    if (!privateKey || !publicKey) {
      alert('Please log in to purchase');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/purchase/buy-player', {
        privateKey,
        publicKey,
        amount,
        playerId: id,
        decrementAmount
      });

      alert(`Transaction successful! Hash: ${response.data.transactionHash}`);
    } catch (error) {
      console.error('Error during purchase:', error);
      alert('Failed to process the purchase');
    }
  };

  useEffect(() => {
    console.log('Area Graph Data updated:', areaGraphData);
  }, [areaGraphData]);

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: `Player Value Over Time (${player?.firstName || 'Loading...'} ${player?.lastName || ''})`,
      },
    },
    interaction: {
      intersect: false,
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'second',
        },
        display: true,
        title: {
          display: true,
          text: 'Time',
        },
      },
      y: {
        type: 'linear',
        display: true,
        title: {
          display: true,
          text: 'Value',
        },
        min: 0, // Set a minimum value to ensure the chart always shows from 0
      },
    },
  };

  return (
    <>
      <Navbar />
      <Rollingstrip />
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white w-full">
        <div className="w-full max-w-6xl p-10 rounded-lg bg-gray-800 shadow-xl">
          {loading ? (
            <div className="text-2xl font-medium">Loading player data...</div>
          ) : error ? (
            <div className="text-2xl text-red-500 font-semibold">{error}</div>
          ) : (
            <div className="flex flex-col lg:flex-row space-y-8 lg:space-y-0 lg:space-x-8">
              {/* Left Side - Player Card */}
              <div className="flex-shrink-0">
                <PinContainer title={`${player?.firstName} ${player?.lastName}`}>
                  <div className="flex flex-col items-center p-8 bg-gray-900 border border-gray-700 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 w-[22rem] h-auto">
                    <img
                      src={player?.imageUrl}
                      alt={player?.playerName}
                      className="rounded-full h-28 w-28 mb-4 object-cover border-4 border-gray-700"
                    />
                    <h3 className="font-semibold text-2xl text-center text-white mb-4">
                      {player?.firstName} {player?.lastName}
                    </h3>
                    <div className="text-md text-center text-gray-300 mb-4 space-y-2">
                      <p className="font-medium">
                        Nationality: <span className="text-white">{player?.nationality}</span>
                      </p>
                      <p className="font-medium">
                        Role: <span className="text-white">{player?.role}</span>
                      </p>
                      <p className="font-medium">
                        Value: <span className="text-white">${currentPlayerValue?.toFixed(2)}</span>
                      </p>
                    </div>
                  </div>
                </PinContainer>

                {/* Real-time Stats */}
                <div className="grid grid-cols-2 gap-8 mt-[25%]">
                  {[
                    { label: 'Runs', value: stats?.runs || 0 },
                    { label: 'Balls Faced', value: stats?.ballsFaced || 0 },
                    { label: 'Wickets', value: stats?.wickets || 0 },
                    { label: 'Overs Bowled', value: stats?.oversBowled || 0 },
                  ].map((stat, index) => (
                    <div key={index} className="p-6 bg-gray-700 rounded-lg shadow-lg">
                      <h3 className="text-lg font-medium mb-2">{stat.label}</h3>
                      <p className="text-2xl font-semibold text-white">{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Input for Decrement Amount */}
                <div className="mb-4 mt-6">
                  <label className="block text-white mb-2">Decrement Amount</label>
                  <input
                    type="number"
                    className="px-4 py-2 rounded-lg bg-gray-700 text-white w-full"
                    value={decrementAmount}
                    onChange={(e) => setDecrementAmount(Number(e.target.value))}
                  />
                </div>

                {/* Buy Button */}
                <button
                  onClick={handleBuy}
                  className="px-6 py-2 bg-blue-600 rounded-lg text-white font-semibold hover:bg-blue-500 transition duration-300 mt-4"
                >
                  Buy Player
                </button>
              </div>

              {/* Right Side - Graph */}
              <div className="flex-1 space-y-8">
                <div className="bg-gray-700 rounded-lg p-6 shadow-lg">
                  <Line options={chartOptions} data={areaGraphData} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PlayerGraph;