import { useNavigate } from 'react-router-dom'; // Add this import
import { WalletSelector } from './WalletSelector';

const Navbar = () => {

  const navigate = useNavigate(); // Initialize useNavigate

  const handleSignIn = () => {
    navigate('/signin'); // Redirect to /signin
  };

  return (
    <nav className="bg-gray-800 p-4 w-full">
      <div className="flex justify-between items-center w-full">
        {/* Logo */}

        <div className="heading">
          <h1 className="text-2xl font-bold">CrickTrade</h1>
        </div>

        {/* Navigation Links */}
        <ul className="flex space-x-6 text-white mr-6">
          <li><a href="#transfer" className="hover:text-gray-400">Transfer</a></li>
          <li><a href="#player-live" className="hover:text-gray-400">Player Live</a></li>
          <li><a href="#all-players" className="hover:text-gray-400">All Players</a></li>
        </ul>

        {/* Sign-In Button */}
        <button
          onClick={handleSignIn}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Sign In
        </button>
        <div>
          <WalletSelector/>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;