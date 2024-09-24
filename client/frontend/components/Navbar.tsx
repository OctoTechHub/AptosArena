import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  // Check if privateKey is in localStorage
  useEffect(() => {
    const privateKey = localStorage.getItem('privateKey');
    setIsLoggedIn(!!privateKey); // Set logged in state based on presence of privateKey
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
    navigate('/'); // Redirect to home page after logging out

    // Automatically hide the popup after 3 seconds
    setTimeout(() => {
      setShowLogoutPopup(false);
    }, 3000);
  };
  // const navigate=useNavigate();

  return (
    <>
      <nav className="bg-gray-800 p-4 w-full">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="text-white text-2xl font-bold">
            CrickTrade
          </div>

          {/* Navigation Links */}
          <ul className="flex space-x-6 text-white">
            <li><a href="#transfer" className="hover:text-gray-400">Transfer</a></li>
            <li><p onClick={()=>{navigate("/")}} className="hover:text-gray-400">Player Live</p></li>
            <li><a href="#all-players" className="hover:text-gray-400">All Players</a></li>
          </ul>

          {/* Conditional Sign In/Log Out Button */}
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              Log Out
            </button>
          ) : (
            <button
              onClick={handleSignIn}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Logout Successful Popup */}
      {showLogoutPopup && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg">
          Logout Successful!
        </div>
      )}
    </>
  );
};

export default Navbar;
