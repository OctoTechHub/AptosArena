// closed-orders.tsx
import { useEffect, useState } from "react";
import axios from "axios";
// import { useNagi } from "next/router";
import { Order } from "./OrderBook";
import { useNavigate } from "react-router-dom";

const ClosedOrders = () => {
  const [closedOrders, setClosedOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClosedOrders = async () => {
      try {
        const response = await axios.get("https://api.cricktrade.co/api/purchase/getOrderBook");
        const orders = response.data.filter((order: Order) => order.orderStatus === "closed");
        setClosedOrders(orders);
        console.log(closedOrders)
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch closed order data");
        setLoading(false);
      }
    };
    fetchClosedOrders();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-900 w-screen h-screen justify-center items-center flex flex-col gap-2">
        <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-blue-500"></div>
        <div className='text-2xl text-white font-semibold'>Loading...</div>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="flex flex-col bg-gradient-to-b from-gray-800 to-gray-900 mx-auto p-8">
      <h1 className="text-4xl text-white">Closed Orders</h1>
      <button className="bg-blue-500 text-white px-4 py-2" onClick={() => navigate('/orderbook')}>
        Back to Open Orders
      </button>
        
    </div>
  );
};

export default ClosedOrders;
