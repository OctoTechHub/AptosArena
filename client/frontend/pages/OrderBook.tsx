import Navbar from "@/components/Navbar";
import Rollingstrip from "@/components/Rollingstrip";
import axios from "axios";
import { useEffect, useState } from "react";

interface Order {
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

  return (
    <>
      <Navbar />
      <Rollingstrip />
      <div className="container mx-auto p-8 bg-gray-900 min-h-screen w-full">
        <h1 className="text-3xl font-bold mb-6 text-white text-center">Order Book</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800 text-white rounded-lg shadow-lg border border-gray-700">
            <thead>
              <tr className="bg-gray-700 text-left">
                <th className="px-6 py-3">Player ID</th>
                <th className="px-6 py-3">Order Type</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Quantity</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {orderBook &&
                orderBook.map((order) => (
                  <tr
                    key={order._id}
                    className={`border-t border-gray-600 hover:bg-gray-700 transition-all duration-300 ease-in-out 
                      ${
                        order.orderType === "buy"
                          ? "bg-green-900 hover:shadow-green-500/50"
                          : "bg-red-900 hover:shadow-red-500/50"
                      }`}
                    style={{ boxShadow: "0 0 15px rgba(255, 255, 255, 0.2)" }}
                  >
                    <td className="px-6 py-4">{order.playerId}</td>
                    <td className="px-6 py-4">
                      {order.orderType === "buy" ? (
                        <span className="text-green-400 font-semibold">Buy</span>
                      ) : (
                        <span className="text-red-400 font-semibold">Sell</span>
                      )}
                    </td>
                    <td className="px-6 py-4">₹{order.orderPrice}</td>
                    <td className="px-6 py-4">{order.orderQuantity}</td>
                    <td className="px-6 py-4">{order.orderStatus}</td>
                    <td className="px-6 py-4">
                      {new Date(order.orderTime).toLocaleString()}
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
