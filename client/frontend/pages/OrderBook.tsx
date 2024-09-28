import Navbar from "@/components/Navbar";
import Rollingstrip from "@/components/Rollingstrip";
import axios from "axios";
import { useEffect, useState } from "react";
import { AiOutlineArrowDown, AiOutlineArrowUp } from "react-icons/ai"; // Icons for Buy/Sell
import { useNavigate } from "react-router-dom";
 // Use for navigation

export interface Order {
  _id: string;
  playerId: string;
  orderPrice: number;
  orderQuantity: number;
  orderStatus: string;
  orderTime: string;
  orderType: string;
}

const OrderBook = () => {
  const [orderBook, setOrderBook] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrderBook = async () => {
      try {
        const response = await axios.get(
          "https://cricktrade-server.azurewebsites.net/api/purchase/getOrderBook"
        );
        setOrderBook(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch order data");
        setLoading(false);
      }
    };
    fetchOrderBook();
  }, []);

  if (loading) {
    return <p className="text-center text-white">Loading...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  // Filter only open orders
  const openOrders = orderBook?.filter((order) => order.orderStatus === "open") || [];
  const buyOrders = openOrders.filter((order) => order.orderType === "buy");
  const sellOrders = openOrders.filter((order) => order.orderType === "sell");

  return (
    <>
      <Navbar />
      <Rollingstrip />
      <div className="flex flex-col mx-auto p-8 bg-gradient-to-b from-gray-800 to-gray-900 min-h-screen w-full">
        <h1 className="text-4xl font-extrabold mb-8 text-white text-center tracking-wider">Order Book</h1>

        {/* Button to navigate to closed orders */}
        <div className="flex justify-end mb-6">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition duration-300"
            onClick={() => navigate('/closed-orders')} // Navigate to closed orders
          >
            View Closed Orders
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg w-1/4 shadow-2xl">
          <table className="min-w-full bg-gray-800 text-white rounded-lg shadow-lg border border-gray-700">
            <thead className="bg-gradient-to-r from-green-400 to-blue-500 text-white text-lg uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Quantity</th>
                <th className="px-6 py-4">Total</th>
              </tr>
            </thead>
            <tbody>
              {/* Sell Orders */}
              <tr>
                <td colSpan={3} className="text-center text-red-400 text-2xl py-4 font-semibold">
                  <AiOutlineArrowUp className="inline-block mr-2" /> Sell Orders
                </td>
              </tr>
              {sellOrders.map((order) => (
                <tr
                  key={order._id}
                  className="border-t border-gray-700 hover:bg-gray-700 transition-all duration-300 ease-in-out"
                  style={{
                    backgroundColor: `rgba(255, 0, 0, ${Math.min(order.orderQuantity / 100, 1)})`,
                  }}
                >
                  <td className="px-6 py-4 font-medium">₹{order.orderPrice.toFixed(2)}</td>
                  <td className="px-6 py-4">{order.orderQuantity}</td>
                  <td className="px-6 py-4">
                    ₹{(order.orderPrice * order.orderQuantity).toFixed(2)}
                  </td>
                </tr>
              ))}

              {/* Buy Orders */}
              <tr>
                <td colSpan={3} className="text-center text-green-400 text-2xl py-4 font-semibold">
                  <AiOutlineArrowDown className="inline-block mr-2" /> Buy Orders
                </td>
              </tr>
              {buyOrders.map((order) => (
                <tr
                  key={order._id}
                  className="border-t border-gray-700 hover:bg-gray-700 transition-all duration-300 ease-in-out"
                  style={{
                    backgroundColor: `rgba(0, 255, 0, ${Math.min(order.orderQuantity / 100, 1)})`,
                  }}
                >
                  <td className="px-6 py-4 font-medium">₹{order.orderPrice.toFixed(2)}</td>
                  <td className="px-6 py-4">{order.orderQuantity}</td>
                  <td className="px-6 py-4">
                    ₹{(order.orderPrice * order.orderQuantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default OrderBook;
