

const Navbar = () => {
  return (
    <nav className="bg-gray-800 p-4 w-full">
      <div className="flex justify-between items-center w-full">
        {/* Logo */}
        <div className="text-white text-2xl font-bold ml-6">
          <a href="/">LOGO</a>
        </div>

        {/* Navigation Links */}
        <ul className="flex space-x-6 text-white mr-6">
          <li><a href="#transfer" className="hover:text-gray-400">Transfer</a></li>
          <li><a href="#player-live" className="hover:text-gray-400">Player Live</a></li>
          <li><a href="#sales" className="hover:text-gray-400">Sales</a></li>
          <li><a href="#all-players" className="hover:text-gray-400">All Players</a></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
