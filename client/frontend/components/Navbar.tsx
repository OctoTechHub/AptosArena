import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  const handleSignIn = () => {
    navigate('/signin'); // Redirect to /signin
  };

  return (
    <nav className="bg-gray-800 p-4 w-full">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <div className="text-white text-2xl font-bold">
          CrickTrade
        </div>

        {/* Navigation Links */}
        <ul className="flex space-x-6 text-white">
          <li><a href="#transfer" className="hover:text-gray-400">Transfer</a></li>
          <li><a href="#player-live" className="hover:text-gray-400">Player Live</a></li>
          <li><a href="#all-players" className="hover:text-gray-400">All Players</a></li>
        </ul>

        {/* Sign-In Button */}
        <button
          onClick={handleSignIn}
          className="  bg-purple-600 text-white px-4 py-2 rounded hover: bg-purple-600 transition"
        >
          Sign In
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
