import axios from "axios";
import { useEffect, useState } from "react"

const OrderBook = () => {
    const [orderBook, setOrderBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(()=>{
    const fetchOrderBook = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/purchase/getOrderBook");
        setOrderBook(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch order data");
        setLoading(false);
      }
    };
    fetchOrderBook();
    }, [])

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {orderBook && <pre>{JSON.stringify(orderBook, null, 2)}</pre>}
    </div>
  )
}

export default OrderBook
