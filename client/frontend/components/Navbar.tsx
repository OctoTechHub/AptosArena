import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../Assets/logo.png'; // Ensure the correct path to the logo

const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [showLoginRequiredPopup, setShowLoginRequiredPopup] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Check if privateKey is in localStorage
  useEffect(() => {
    const privateKey = localStorage.getItem('privateKey');
    setIsLoggedIn(!!privateKey);
  }, []);

  const handleSignIn = () => {
    navigate('/signin');
  };

  const handleLogout = () => {
    localStorage.removeItem('privateKey');
    setIsLoggedIn(false);
    setShowLogoutPopup(true);
    navigate('/');
    setTimeout(() => {
      setShowLogoutPopup(false);
    }, 3000);
  };

  const handlePortfolioClick = () => {
    if (isLoggedIn) {
      navigate('/profile');
    } else {
      setShowLoginRequiredPopup(true);
      setTimeout(() => {
        setShowLoginRequiredPopup(false);
        navigate('/signin');
      }, 3000);
    }
  };

  return (
    <>
      <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-4 shadow-md w-full">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => navigate('/')}
          >
            <img src={logo} alt="CrickTrade Logo" className="h-12 w-auto mr-2" />
            <span className="text-white text-3xl font-extrabold tracking-wide">
              CrickTrade
            </span>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden mt-4">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white focus:outline-none"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16m-7 6h7'}
                ></path>
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <ul className={`hidden md:flex space-x-8 text-white font-medium`}>
            <li className="transition transform hover:scale-105">
              <p
                onClick={handlePortfolioClick}
                className="hover:text-blue-400 cursor-pointer transition-colors duration-300"
              >
                Portfolio
              </p>
            </li>
            <li className="transition transform hover:scale-105">
              <p
                onClick={() => {
                  navigate('/');
                }}
                className="hover:text-blue-400 cursor-pointer transition-colors duration-300"
              >
                Player Live
              </p>
            </li>
            <li className="transition transform hover:scale-105">
              <a
                href="/orderbook"
                className="hover:text-blue-400 transition-colors duration-300"
              >
                OrderBook
              </a>
            </li>
          </ul>

          {/* Conditional Sign In/Log Out Button */}
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-5 py-2 rounded-full shadow-lg hover:bg-red-600 transition-transform duration-300 transform hover:scale-105 focus:outline-none"
            >
              Log Out
            </button>
          ) : (
            <button
              onClick={handleSignIn}
              className="bg-blue-500 text-white px-5 py-2 rounded-full shadow-lg hover:bg-blue-600 transition-transform duration-300 transform hover:scale-105 focus:outline-none"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-gray-900 shadow-md">
            <ul className="flex flex-col space-y-2 p-4">
              <li>
                <p
                  onClick={handlePortfolioClick}
                  className="text-white hover:text-blue-400 cursor-pointer transition-colors duration-300"
                >
                  Portfolio
                </p>
              </li>
              <li>
                <p
                  onClick={() => {
                    navigate('/');
                  }}
                  className="text-white hover:text-blue-400 cursor-pointer transition-colors duration-300"
                >
                  Player Live
                </p>
              </li>
              <li>
                <a
                  href="/orderbook"
                  className="text-white hover:text-blue-400 transition-colors duration-300"
                >
                  OrderBook
                </a>
              </li>
            </ul>
          </div>
        )}
      </nav>

      {/* Logout Successful Popup */}
      {showLogoutPopup && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in-out">
          Logout Successful!
        </div>
      )}

      {/* Login Required Popup */}
      {showLoginRequiredPopup && (
        <div className="fixed bottom-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in-out">
          Login Required!
        </div>
      )}
    </>
  );
};

export default Navbar;
