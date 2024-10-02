import React, { useEffect, useState } from 'react';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Rollingstrip from '@/components/Rollingstrip';
import { X } from 'lucide-react';

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
  const { id } = useParams<{ id: string }>();
  const [areaGraphData, setAreaGraphData] = useState<AreaGraphData[]>([]);
  const [player, setPlayer] = useState<Player | null>(null);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [decrementAmount, setDecrementAmount] = useState<number>(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [playerQuantity, setPlayerQuantity] = useState<number>(0);
  const [isGraph, setIsgraph] = useState<boolean>(true);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState<boolean>(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentDialogContent, setPaymentDialogContent] = useState({ title: '', description: '' });

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const response = await axios.get(`https://api.cricktrade.co/api/player/getPlayer/${id}`);
        setPlayer(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch player data');
        setLoading(false);
      }
    };

    setTimeout(() => {
      setIsgraph(false);
    }, 6000)

    fetchPlayer();

    const socket = new WebSocket('wss://aptosarena.onrender.com');
    socket.onopen = () => {
      socket.send(JSON.stringify({ playerId: id }));
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.playerId === id) {
        const currentValue = message.currentValue;
        const now = new Date().getTime();

        setAreaGraphData((prevData) => {
          const updatedData = [...prevData];
          const lastValue = prevData.length > 0 ? prevData[prevData.length - 1].value : currentValue;

          const color = currentValue >= lastValue ? '#00ff00' : '#ff0000';
          updatedData.push({
            time: now,
            value: currentValue,
            color,
          });

          return updatedData;
        });

        setPlayer((prevPlayer) => {
          if (prevPlayer) {
            return { ...prevPlayer, value: currentValue };
          }
          return prevPlayer;
        });


        setStats(message.stats);
      }
    };

    return () => {
      socket.close();
    };
  }, [id]);

  useEffect(() => {
    if (!player) return;

    const fetchPlayerQuantity = async () => {
      const publicKey = localStorage.getItem('publicKey');
      if (!publicKey) {
        console.log('User not logged in');
        return;
      }

      try {
        const response = await axios.get(`https://api.cricktrade.co/api/user/get-stocks/${publicKey}`);
        const fetchedStocks = response.data;

        const playerStock = fetchedStocks.find((stock: any) =>
          stock.player.firstName === player.firstName &&
          stock.player.lastName === player.lastName
        );

        if (playerStock) {
          setPlayerQuantity(playerStock.quantity);
        } else {
          setPlayerQuantity(0);
        }
      } catch (err) {
        console.error('Failed to fetch player quantity:', err);
      }
    };

    fetchPlayerQuantity();
  }, [player]);


  const handleBuy = async () => {
    const privateKey = localStorage.getItem('privateKey');
    const publicKey = localStorage.getItem('publicKey');
    let amount = player?.value || 0;
    amount = Math.round(amount);
    if (!privateKey || !publicKey) {
      alert('Please log in to purchase');
      return;
    }

    setIsPaymentProcessing(true);
    setPaymentDialogContent({
      title: 'Processing Payment',
      description: 'Please wait while we process your payment...'
    });
    setPaymentDialogOpen(true);

    try {
      const response = await axios.post('https://api.cricktrade.co/api/purchase/buy-player', {
        privateKey,
        publicKey,
        amount,
        playerId: id,
        decrementAmount
      });
  
      if (response.data.message === 'Transaction successful') {
        setPaymentDialogContent({
          title: 'Payment Successful',
          description: 'Your transaction has been processed successfully.'
        });
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      setPaymentDialogContent({
        title: 'Payment Failed',
        description: 'We were unable to process your transaction. Please try again later.'
      });
      console.log(error);
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  const roundNumbers = (value: number) => {
    return Math.round(value * 100) / 100
  }

  const totalValue = (quantity: number, amount: number) => {
    const finalAmount = roundNumbers(quantity * amount);
    return finalAmount;
  }

  const options = {
    chart: {
      type: 'area',
      backgroundColor: '#181818',
    },
    title: {
      text: `Player Value Over Time (${player?.firstName || 'Loading...'} ${player?.lastName || ''})`,
      style: { color: '#ffffff', fontWeight: 'bold', fontSize: '20px' },
    },
    yAxis: {
      title: {
        text: 'Value',
        style: { color: '#ffffff', fontSize: '14px' },
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
        formatter: function (): string {
          const date = new Date((this as any).value);
          return date.toLocaleString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
          });
        }
      },
      title: {
        text: 'Time',
        style: { color: '#ffffff', fontSize: '14px' },
      },
    },
    tooltip: {
      shared: true,
      style: {
        color: '#99999',
      },
      formatter: function (this: Highcharts.TooltipFormatterContextObject): string {
        const point = this.points ? this.points[0] : { x: 0, y: 0 };
        const date = new Date(point.x ?? 0);
        const formattedDate = date.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        });
        return `<b>${formattedDate}</b><br/>Value: ${Highcharts.numberFormat(point.y ?? 0, 2)} APT`;
      }
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
        zones: areaGraphData.map(({ value, color }) => ({
          value: value,
          color: color,
        })),
        fillColor: {
          linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
          stops: [
            [0, 'rgba(0, 255, 0, 0.5)'],
            [1, 'rgba(255, 0, 0, 0.5)'],
          ],
        },
      },
    ],
  };

  const PaymentDialog: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description: string;
    isProcessing: boolean;
  }> = ({ isOpen, onClose, title, description, isProcessing }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            {!isProcessing && (
              <button onClick={onClose} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            )}
          </div>
          <p className="text-gray-300 mb-6">{description}</p>
          {isProcessing && (
            <div className="flex justify-center mb-6">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
          {!isProcessing && (
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <Rollingstrip />
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white w-full">
        <div className="w-full max-w-6xl p-10 rounded-lg bg-gray-800 shadow-xl">
          {loading ? (
            <div className="bg-gray-900 w-full h-full justify-center items-center flex flex-col gap-2">
              <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-blue-500"></div>
              <div className='text-2xl text-white font-semibold'>Loading...</div>
            </div>
          ) : error ? (
          <div className="text-2xl text-red-500 font-semibold">{error}</div>
          ) : (
          <div className="flex flex-col lg:flex-row lg:space-x-8">
            {/* Left Side - Player Card */}
            <div className='flex flex-col mt-4'>
              <div className="flex-shrink-0">
                <div className='h-auto w-auto p-6 bg-black rounded-xl flex justify-center'>
                  <div className="flex flex-col items-center p-4 sm:p-6 md:p-8 bg-gray-900 border border-gray-700 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 w-full lg:w-[22rem] h-auto">
                    <img
                      src={player?.imageUrl}
                      alt={player?.playerName}
                      className="rounded-full h-24 w-24 sm:h-28 sm:w-28 mb-4 object-cover border-4 border-gray-700"
                    />
                    <h3 className="font-semibold text-xl sm:text-2xl md:text-3xl text-center text-white mb-4">
                      {player?.firstName} {player?.lastName}
                    </h3>
                    <div className="text-sm sm:text-md text-center text-gray-300 mb-4 space-y-2">
                      <p className="font-medium">
                        Nationality: <span className="text-white">{player?.nationality}</span>
                      </p>
                      <p className="font-medium">
                        Role: <span className="text-white">{player?.role}</span>
                      </p>
                      <p className="font-medium">
                        Value: <span className="text-white">{roundNumbers(player?.value ?? 0)} APT</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className='h-auto w-full border flex flex-col border-gray-700 mt-4 p-4'>
                  <span className='text-lg font-semibold'>Player Quantity In Your Portfolio</span>
                  <span className='mt-2'>Quantity : {playerQuantity}</span>
                  <span>Net value : {totalValue(playerQuantity, player?.value ?? 0)} APT</span>
                </div>

                {/* Input for Decrement Amount */}
                <div className="mb-4 mt-8">
                  <label className="block text-white mb-2 font-semibold">Quantity</label>
                  <input
                    type="number"
                    className="px-4 py-2 rounded-lg bg-gray-700 text-white w-full"
                    value={decrementAmount}
                    onChange={(e) => setDecrementAmount(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className='flex flex-row w-full gap-4 mb-3 md:mb-0'>
                {/* Buy Button */}
                <button
                  onClick={() => setIsDialogOpen(true)}
                  className="w-full px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-400 transition-colors duration-300 "
                >
                  Buy Player
                </button>
                {/* Sell Button */}
                <button
                  onClick={() => setIsDialogOpen(true)}
                  className="w-full px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-400 transition-colors duration-300">
                  Sell Player
                </button>
              </div>

              {/* Custom Dialog */}
              {isDialogOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-gray-800 p-8 rounded-xl max-w-md w-full">
                    <h2 className="text-2xl font-bold mb-4">Confirm Purchase</h2>
                    <div className="mb-4 flex flex-col">
                      <span className='text-lg font-semibold'>Player Name : {player?.firstName} {player?.lastName}</span>
                      <span className='mt-2'>Value : {roundNumbers(player?.value ?? 0)} APT</span>
                      <span>Quantity : {decrementAmount}</span>
                      <span>Total amount : {totalValue(decrementAmount, player?.value ?? 0)} APT</span>
                    </div>
                    <div className="flex justify-end space-x-4">
                      <button
                        onClick={() => setIsDialogOpen(false)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors duration-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleBuy}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors duration-300"
                      >
                        Confirm Purchase
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side - Graph */}
            <div className='w-full'>
              <div className="bg-gray-700 rounded-lg p-6 shadow-lg">
                {isGraph ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-2xl font-medium">Loading the Graph...</div>
                  </div>
                ) : (
                  <HighchartsReact highcharts={Highcharts} options={options} />
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 mt-8">
                {[
                  { label: 'Runs', value: stats?.runs || 0 },
                  { label: 'Balls Faced', value: stats?.ballsFaced || 0 },
                  { label: 'Wickets', value: stats?.wickets || 0 },
                  { label: 'Overs Bowled', value: stats?.oversBowled || 0 },
                ].map((stat, index) => (
                  <div key={index} className="p-4 bg-gray-700 rounded-lg shadow-lg">
                    <h3 className="text-lg font-medium mb-2">{stat.label}</h3>
                    <p className="text-2xl font-semibold text-white">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
      <PaymentDialog
        isOpen={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        title={paymentDialogContent.title}
        description={paymentDialogContent.description}
        isProcessing={isPaymentProcessing}
      />
    </>
  );
};

export default PlayerGraph;