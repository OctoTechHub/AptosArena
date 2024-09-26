import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [showLoginRequiredPopup, setShowLoginRequiredPopup] = useState(false);

  // Check if publicKey is in localStorage
  useEffect(() => {
    const publicKey = localStorage.getItem('publicKey');
    if (publicKey) {
      setIsLoggedIn(true); // Set logged in state if publicKey exists
    } else {
      // If no publicKey, navigate to signin page and show the login required popup
      navigate('/signin');
      setShowLoginRequiredPopup(true);
      // Automatically hide the popup after 3 seconds
      setTimeout(() => {
        setShowLoginRequiredPopup(false);
      }, 3000);
    }
  }, [navigate]);

  // Handle sign-in redirection
  const handleSignIn = () => {
    navigate('/signin');
  };

  // Handle log out
  const handleLogout = () => {
    localStorage.removeItem('publicKey'); // Remove publicKey from localStorage
    setIsLoggedIn(false); // Update the state
    setShowLogoutPopup(true); // Show the logout popup
    navigate('/'); // Redirect to home page after logging out

    // Automatically hide the logout popup after 3 seconds
    setTimeout(() => {
      setShowLogoutPopup(false);
    }, 3000);
  };

  return (
    <>
      <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-4 shadow-md w-full">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <div className="text-white text-3xl font-extrabold tracking-wide">
            CrickTrade
          </div>

          {/* Navigation Links */}
          <ul className="flex space-x-8 text-white font-medium">
            <li className="transition transform hover:scale-105">
              <p 
                onClick={() => navigate('/profile')} 
                className="hover:text-blue-400 cursor-pointer transition-colors duration-300"
              >
                Portfolio
              </p>
            </li>
            <li className="transition transform hover:scale-105">
              <p 
                onClick={() => navigate("/")} 
                className="hover:text-blue-400 cursor-pointer transition-colors duration-300"
              >
                Player Live
              </p>
            </li>
            <li className="transition transform hover:scale-105">
              <a href="#all-players" className="hover:text-blue-400 transition-colors duration-300">All Players</a>
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
