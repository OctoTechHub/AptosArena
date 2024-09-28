import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Rollingstrip from '@/components/Rollingstrip';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

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

interface Stock {
  playerId: string;
  quantity: number;
  player: Player;
}

const UserProfile: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleCounts, setRoleCounts] = useState({ batsmen: 0, bowlers: 0, allRounders: 0 });
  const [totalWorth, setTotalWorth] = useState(0);

  useEffect(() => {
    const publicKey = localStorage.getItem('publicKey');
    
    const fetchStocks = async () => {
      try {
        const response = await axios.get(`https://cricktrade-server.azurewebsites.net/api/user/get-stocks/${publicKey}`);
        const fetchedStocks = response.data;
        
        setStocks(fetchedStocks);

        const counts = { batsmen: 0, bowlers: 0, allRounders: 0 };
        let total = 0;

        fetchedStocks.forEach((stock: Stock) => {
          total += stock.quantity * stock.player.value;

          if (stock.player.role.toLowerCase() === 'batsman') {
            counts.batsmen += 1;
          } else if (stock.player.role.toLowerCase() === 'bowler') {
            counts.bowlers += 1;
          } else if (stock.player.role.toLowerCase() === 'all-rounder') {
            counts.allRounders += 1;
          }
        });

        setRoleCounts(counts);
        setTotalWorth(total);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch stocks data');
        setLoading(false);
      }
    };

    fetchStocks();
  }, []);

  const totalPlayers = roleCounts.batsmen + roleCounts.bowlers + roleCounts.allRounders;

  // Data for Pie Chart
  const pieData = {
    labels: ['Batsmen', 'Bowlers', 'All-Rounders'],
    datasets: [
      {
        data: [
          ((roleCounts.batsmen / totalPlayers) * 100).toFixed(2),
          ((roleCounts.bowlers / totalPlayers) * 100).toFixed(2),
          ((roleCounts.allRounders / totalPlayers) * 100).toFixed(2),
        ],
        backgroundColor: ['#4C9AFF', '#FF6B6B', '#FFB74D'], // Improved color scheme
        hoverBackgroundColor: ['#307AC1', '#E94E4E', '#FBAF3F'],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  return (
    <>
      <Navbar />
      <Rollingstrip />
      <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900 text-white flex items-center justify-center p-8 w-full">
        <div className="w-full max-w-7xl">
          {loading ? (
            <div className="text-center text-3xl font-semibold">Loading...</div>
          ) : error ? (
            <div className="text-center text-3xl text-red-500">{error}</div>
          ) : (
            <div>
              <h1 className="text-4xl font-bold mb-8 text-center">Your Portfolio</h1>
              
              {/* Total worth of user's assets */}
              <div className="mt-8 bg-gray-800 p-8 rounded-lg shadow-lg text-center">
                <h2 className="text-2xl font-semibold mb-4">Total Asset Worth</h2>
                <p className="text-xl">
                  Total Value of Assets: <span className="text-green-400">{totalWorth.toFixed(2)} APT</span>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                {stocks.map((stock) => (
                  <div
                    key={stock.playerId}
                    className="bg-gray-800 p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300 ease-in-out"
                  >
                    <img
                      src={stock.player.imageUrl}
                      alt={stock.player.playerName}
                      className="rounded-full w-24 h-24 mb-4 mx-auto object-cover border-4 border-gray-600"
                    />
                    <h2 className="text-2xl font-semibold text-center mb-2">
                      {stock.player.firstName} {stock.player.lastName}
                    </h2>
                    <p className="text-center text-gray-400 mb-4">{stock.player.nationality}</p>
                    <div className="flex justify-around text-sm text-gray-400 mb-4">
                      <p>
                        Role: <span className="text-white">{stock.player.role}</span>
                      </p>
                      <p>
                        Value: <span className="text-white">{stock.player.value.toFixed(2)} APT</span>
                      </p>
                    </div>
                    <div className="text-center text-gray-400">
                      <p>
                        Quantity Owned: <span className="text-white">{stock.quantity}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Role bifurcation with Pie Chart */}
              <div className="mt-12 bg-gray-800 p-8 rounded-lg shadow-lg text-center">
                <h2 className="text-3xl font-semibold mb-6">Player Role Summary</h2>
                <div className="w-64 mx-auto">
                  <Pie data={pieData} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UserProfile;
