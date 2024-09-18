import { useState } from 'react';
import axios from 'axios';

const Signin = () => {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [privateKey, setPrivateKey] = useState<string | null>(null);

  const handleGenerateKeys = async () => {
    try {
      const response = await axios.get('/api/generateAccount');
      const { publicKey, privateKey } = response.data;
      setPublicKey(publicKey);
      setPrivateKey(privateKey);
    } catch (error) {
      console.error('Error generating keys:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Sign In</h1>
        
        <form>
          <div className="mb-6">
            <label htmlFor="publicKey" className="block text-gray-700 text-sm font-medium mb-2">Public Key</label>
            <input
              id="publicKey"
              type="text"
              placeholder="Enter your public key"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="privateKey" className="block text-gray-700 text-sm font-medium mb-2">Private Key</label>
            <input
              id="privateKey"
              type="password"
              placeholder="Enter your private key"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={handleGenerateKeys}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-800 transition"
          >
            Generate New Keys
          </button>

          {publicKey && privateKey && (
            <div className="mt-6 p-4 border border-gray-300 rounded-lg bg-gray-50">
              <p><strong>Public Key:</strong> {publicKey}</p>
              <p><strong>Private Key:</strong> {privateKey}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signin;
