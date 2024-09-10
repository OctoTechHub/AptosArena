import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
// Internal Components
// import { Header } from "@/components/Header";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Signin from "./pages/Signin"; 

function App() {
  const { connected } = useWallet();

  return (
    <>
      <BrowserRouter>
        {/* <Header /> */}
        <div className="flex items-center justify-center flex-col">
          <Routes>
            <Route path="/" element={connected ? <Home /> : <Signup />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/home" element={<Home />} />
          </Routes>
        </div>
      </BrowserRouter>
    </>
  );
}

export default App;