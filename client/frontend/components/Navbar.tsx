import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [showLoginRequiredPopup, setShowLoginRequiredPopup] = useState(false); // New state for login-required popup
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for mobile menu

  // Check if privateKey is in localStorage
  useEffect(() => {
    const privateKey = localStorage.getItem('privateKey');
    setIsLoggedIn(!!privateKey); // Set logged-in state based on presence of privateKey
  }, []);

  // Handle sign-in redirection
  const handleSignIn = () => {
    navigate('/signin');
  };

  // Handle log out
  const handleLogout = () => {
    localStorage.removeItem('privateKey'); // Remove privateKey from localStorage
    setIsLoggedIn(false); // Update the state
    setShowLogoutPopup(true); // Show the popup
    navigate('/'); // Redirect to the home page after logging out

    // Automatically hide the popup after 3 seconds
    setTimeout(() => {
      setShowLogoutPopup(false);
    }, 3000);
  };

  // Handle navigation to the Portfolio page
  const handlePortfolioClick = () => {
    if (isLoggedIn) {
      navigate('/profile'); // Allow navigation to the Portfolio page if logged in
    } else {
      setShowLoginRequiredPopup(true); // Show the login required popup if not logged in
      setTimeout(() => {
        setShowLoginRequiredPopup(false);
        navigate('/signin'); // Redirect to the sign-in page after showing the popup
      }, 3000); // Show the popup for 3 seconds
    }
  };

  return (
    <>
      <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-4 shadow-md w-full">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <div className="text-white text-3xl font-extrabold tracking-wide">
            CrickTrade
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
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
                  d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
                ></path>
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <ul className={`md:flex space-x-8 text-white font-medium ${isMenuOpen ? 'block' : 'hidden'} md:block`}>
            <li className="transition transform hover:scale-105">
              <p
                onClick={handlePortfolioClick} // Handle the portfolio link click
                className="hover:text-blue-400 cursor-pointer transition-colors duration-300"
              >
                Portfolio
              </p>
            </li>
            <li className="transition transform hover:scale-105">
              <p
                onClick={() => { navigate("/") }}
                className="hover:text-blue-400 cursor-pointer transition-colors duration-300"
              >
                Player Live
              </p>
            </li>
            <li className="transition transform hover:scale-105">
              <a href="/orderbook" className="hover:text-blue-400 transition-colors duration-300">
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