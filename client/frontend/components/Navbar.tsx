import { useState } from 'react';
import axios from 'axios';
// import logo from '../Assets/logo-removebg-preview (1).png';  // Import the logo image

const Navbar = () => {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [privateKey, setPrivateKey] = useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      // Replace with your sign-in API endpoint
      const response = await axios.post('/api/signin', {
        // You may need to provide a way to get these credentials
        publicKey: 'samplePublicKey',
        privateKey: 'samplePrivateKey',
      });

      // Extract public and private keys from the response
      const { publicKey, privateKey } = response.data;
      setPublicKey(publicKey);
      setPrivateKey(privateKey);

      alert(`Signed in! Public Key: ${publicKey}\nPrivate Key: ${privateKey}`);
    } catch (error) {
      console.error('Error during sign-in:', error);
      alert('Failed to sign in.');
    }
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
      </div>
    </nav>
  );
};

export default Navbar;
