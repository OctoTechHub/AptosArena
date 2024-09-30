import { BrowserRouter, Route, Routes } from "react-router-dom";
// Internal Components
// import { Header } from "@/components/Header";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Signin from "./pages/Signin"; 
// import LivePlayers from "./pages/LivePlayers";
import Playergraph from "./pages/Playergraph";
import UserProfile from "./pages/Userprofile";
import OrderBook from "./pages/OrderBook";
import ClosedOrders from "./pages/Closed";
import FundAccount from "./pages/FundAccount";

function App() {

  return (
    <>
      <BrowserRouter>
        {/* <Header /> */}
        <div className="flex items-center justify-center flex-col">
          <Routes>
            <Route path="/" element= {<Home/>} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/signup" element={<Signup />} />
            {/* <Route path="/liveplayers" element={<LivePlayers/>}/> */}
            <Route path="/player/:id" element={<Playergraph/>}/>
            <Route path="/home" element={<Home />} />
            <Route path="/profile" element={<UserProfile/>} />
            <Route path="/orderBook" element={<OrderBook/>} />
            <Route path="/closed-orders" element={<ClosedOrders/>} />
            <Route path="/fundaccount" element={<FundAccount/>} />
          </Routes>
        </div>
      </BrowserRouter>
    </>
  );
}

export default App;