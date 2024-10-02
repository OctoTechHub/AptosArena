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
  const [balance, setBalance] = useState<number | string>('-');
  const [sellOrderLoading, setSellOrderLoading] = useState<boolean>(false);
  const [sellOrderError, setSellOrderError] = useState<string | null>(null);

  useEffect(() => {
    const publicKey = localStorage.getItem('publicKey');
    const privateKey = localStorage.getItem('privateKey');

    // Fetch stocks and balance data
    const fetchStocksAndBalance = async () => {
      try {
        const response = await axios.get(`https://api.cricktrade.co/api/user/get-stocks/${publicKey}`);
        const fetchedStocks = response.data;

        setStocks(fetchedStocks);

        // Calculate role counts and total worth
        const counts = { batsmen: 0, bowlers: 0, allRounders: 0 };
        let totalInvested = 0;

        fetchedStocks.forEach((stock: Stock) => {
          totalInvested += stock.quantity * stock.player.value;

          if (stock.player.role.toLowerCase() === 'batsman') {
            counts.batsmen += 1;
          } else if (stock.player.role.toLowerCase() === 'bowler') {
            counts.bowlers += 1;
          } else if (stock.player.role.toLowerCase() === 'all-rounder') {
            counts.allRounders += 1;
          }
        });

        setRoleCounts(counts);
        setTotalWorth(totalInvested);

        // Fetch user balance
        const balanceResponse = await axios.get(`https://api.cricktrade.co/api/purchase/get-balance/${privateKey}`);
        const fetchedBalance = balanceResponse.data?.['apt token'] ?? 0;

        // Subtract total invested amount from balance
        const finalBalance = fetchedBalance - totalInvested;
        setBalance(finalBalance >= 0 ? finalBalance.toFixed(2) : '0.00'); // Show 0 if balance goes negative
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
      }
    };

    fetchStocksAndBalance();
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

  // Function to handle sell order submission
  const handleSellOrder = async (playerId: string, orderPrice: number, orderQuantity: number) => {
    setSellOrderLoading(true);
    setSellOrderError(null);

    const publicKey = localStorage.getItem('publicKey');
    const privateKey = localStorage.getItem('privateKey');

    try {
      const response = await axios.post('https://api.cricktrade.co/api/purchase/addToOrderBook', {
        orderType: 'sell',
        playerId,
        orderPrice,
        orderQuantity,
        orderStatus: 'open',
        publicKey,
        privateKey
      });

      console.log('Order added:', response.data);
      alert('Order added to the order book successfully!');
    } catch (error) {
      console.error('Error adding sell order:', error);
      setSellOrderError('Failed to add sell order. Please try again.');
    } finally {
      setSellOrderLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Rollingstrip />
      <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900 text-white flex items-center justify-center p-4 sm:p-8 w-full">
        <div className="w-full max-w-7xl">
          {loading ? (
            <div className="bg-transparent w-full h-screen justify-center items-center flex flex-col gap-2">
              <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-blue-500"></div>
              <div className='text-2xl text-white font-semibold'>Loading...</div>
            </div>
          ) : error ? (
            <div className="text-center text-3xl text-red-500">{error}</div>
          ) : (
            <div>
              <h1 className="text-4xl font-bold mb-8 text-center">Your Portfolio</h1>

              {/* Total worth of user's assets */}
              <div className="mt-8 bg-gray-800 p-4 sm:p-8 rounded-lg shadow-lg text-center">
                <h2 className="text-2xl font-semibold mb-4">Total Asset Worth</h2>
                <p className="text-xl">
                  Total Value of Assets: <span className="text-green-400">{totalWorth.toFixed(2)} APT</span>
                </p>

                {/* Display the final balance after deducting the invested amount */}
                <p>Your Balance: <span className="text-green-400">{balance}</span> APT</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 mt-8">
                {stocks.map((stock) => (
                  <div
                    key={stock.playerId}
                    className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300 ease-in-out"
                  >
                    <img
                      src={stock.player.imageUrl}
                      alt={stock.player.playerName}
                      className="rounded-full w-20 h-20 sm:w-24 sm:h-24 mb-4 mx-auto object-cover border-4 border-gray-600"
                    />
                    <h2 className="text-xl sm:text-2xl font-semibold text-center mb-2">
                      {stock.player.firstName} {stock.player.lastName}
                    </h2>
                    <p className="text-center text-gray-400 mb-4">{stock.player.nationality}</p>
                    <div className="flex justify-around text-xs sm:text-sm text-gray-400 mb-4">
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

                    {/* Sell to Orderbook Button */}
                    <div className="mt-4 text-center">
                      <button
                        onClick={() => handleSellOrder(stock.playerId, stock.player.value, stock.quantity)}
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                        disabled={sellOrderLoading}
                      >
                        {sellOrderLoading ? 'Processing...' : 'Sell to Orderbook'}
                      </button>
                      {sellOrderError && <p className="text-red-500 mt-2">{sellOrderError}</p>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pie Chart */}
              <div className="bg-gray-800 p-4 sm:p-8 rounded-lg shadow-lg mt-8">
                <h2 className="text-2xl font-semibold mb-4 text-center">Player Roles Distribution</h2>
                <div className="flex justify-center">
                  <div className="w-64 sm:w-80">
                    <Pie data={pieData} />
                  </div>
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
