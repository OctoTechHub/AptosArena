import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowUpDown, ArrowUp, ArrowDown, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Rollingstrip from '@/components/Rollingstrip';

export interface PlayerDetails {
  _id: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
  nationality: string;
  role: string;
  playerName: string;
}

export interface Order {
  _id: string;
  playerId: string;
  orderPrice: number;
  orderQuantity: number;
  orderStatus: string;
  orderTime: string;
  orderType: string;
  playerDetails: PlayerDetails;
}

const Alert: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
    <span className="block sm:inline">{children}</span>
  </div>
);

const Dialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
}> = ({ isOpen, onClose, title, description }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <p className="text-gray-300 mb-6">{description}</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const OrderBook = () => {
  const [orderBook, setOrderBook] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [activeTab, setActiveTab] = useState('open');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState({ title: '', description: '' });

  useEffect(() => {
    const fetchOrderBook = async () => {
      try {
        const response = await axios.get('https://cricktrade-server.azurewebsites.net/api/purchase/getOrderBook');
        setOrderBook(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch order data');
        setLoading(false);
      }
    };
    fetchOrderBook();
  }, []);

  const buyFromOrderBook = async (orderId: string) => {
    const publicKey = localStorage.getItem('publicKey');
    const privateKey = localStorage.getItem('privateKey');
    try {
      const response = await axios.post('http://localhost:3000/api/purchase/buyFromOrderBook', {
        orderId,
        publicKey,
        privateKey
      });
      if (response.data.message === 'Transaction successful') {
        setDialogContent({
          title: 'Payment Successful',
          description: 'Your transaction has been processed successfully.'
        });
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      setDialogContent({
        title: 'Payment Failed',
        description: 'We were unable to process your transaction. Please try again later.'
      });
    } finally {
      setDialogOpen(true);
    }
  };

  const sortData = (key: keyof Order) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });

    const sortedData = orderBook
      ? [...orderBook].sort((a, b) => {
        if (a[key] < b[key]) return direction === 'ascending' ? -1 : 1;
        if (a[key] > b[key]) return direction === 'ascending' ? 1 : -1;
        return 0;
      })
      : [];

    setOrderBook(sortedData);
  };

  const filteredOrders = orderBook?.filter((order) =>
    activeTab === 'open' ? order.orderStatus !== 'closed' : order.orderStatus === 'closed'
  );

  if (loading) {
    return (
      <div className="bg-gray-900 w-screen h-screen justify-center items-center flex flex-col gap-2">
        <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-blue-500"></div>
        <div className='text-2xl text-white font-semibold'>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8 bg-gray-900 min-h-screen">
        <Alert>{error}</Alert>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <Rollingstrip />
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white w-full">
        <div className="w-full max-w-8xl p-10 rounded-lg shadow-xl">
          <div className="container mx-auto p-8 bg-gray-900 min-h-screen">
            <h1 className="text-4xl font-bold mb-8 text-white text-center">Order Book</h1>

            {/* Tabs */}
            <div className="flex justify-center space-x-4 mb-8">
              <button
                className={`px-4 py-2 rounded-lg ${activeTab === 'open' ? 'bg-gray-800 text-white' : 'bg-gray-700 text-gray-400'}`}
                onClick={() => setActiveTab('open')}
              >
                Open Orders
              </button>
              <button
                className={`px-4 py-2 rounded-lg ${activeTab === 'closed' ? 'bg-gray-800 text-white' : 'bg-gray-700 text-gray-400'}`}
                onClick={() => setActiveTab('closed')}
              >
                Closed Orders
              </button>
            </div>

            {/* Orders Table */}
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-700 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      <th className="px-6 py-3">Player</th>
                      <th className="px-6 py-3 cursor-pointer" onClick={() => sortData('orderType')}>
                        Order Type
                        <ArrowUpDown className="inline ml-1" size={14} />
                      </th>
                      <th className="px-6 py-3 cursor-pointer" onClick={() => sortData('orderPrice')}>
                        Price
                        <ArrowUpDown className="inline ml-1" size={14} />
                      </th>
                      <th className="px-6 py-3 cursor-pointer" onClick={() => sortData('orderQuantity')}>
                        Quantity
                        <ArrowUpDown className="inline ml-1" size={14} />
                      </th>
                      <th className="px-6 py-3 cursor-pointer" onClick={() => sortData('orderStatus')}>
                        Status
                        <ArrowUpDown className="inline ml-1" size={14} />
                      </th>
                      <th className="px-6 py-3 cursor-pointer" onClick={() => sortData('orderTime')}>
                        Time
                        <ArrowUpDown className="inline ml-1" size={14} />
                      </th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-600">
                    {filteredOrders &&
                      filteredOrders.map((order) => (
                        <tr
                          key={order._id}
                          className={`text-gray-300 hover:bg-gray-700 transition-all duration-300 ease-in-out ${order.orderType === 'buy' ? 'bg-green-900/30' : 'bg-red-900/30'}`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap flex items-center">
                            <img
                              src={order.playerDetails.imageUrl}
                              alt={order.playerDetails.playerName}
                              className="w-10 h-10 rounded-full mr-3"
                            />
                            <span>{`${order.playerDetails.firstName} ${order.playerDetails.lastName}`}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {order.orderType === 'buy' ? (
                              <span className="text-green-400 font-semibold flex items-center">
                                <ArrowUp className="mr-1" size={14} />
                                Buy
                              </span>
                            ) : (
                              <span className="text-red-400 font-semibold flex items-center">
                                <ArrowDown className="mr-1" size={14} />
                                Sell
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{order.orderPrice.toFixed(2)} APT</td>
                          <td className="px-6 py-4 whitespace-nowrap">{order.orderQuantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.orderStatus === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {order.orderStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {new Date(order.orderTime).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {order.orderStatus === 'open' && order.orderType !== 'buy' ? (
                              <button
                                onClick={() => buyFromOrderBook(order._id)}
                                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition duration-300"
                              >
                                Buy
                              </button>
                            ) : (
                              <span className="text-gray-500">N/A</span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Dialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={dialogContent.title}
        description={dialogContent.description}
      />
    </>
  );
};

export default OrderBook;