import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signin = () => {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false); // Add a state to control the popup visibility

  const navigate = useNavigate(); // Initialize the useNavigate hook

  const handleGenerateKeys = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/user/generateAccount');
      const { data } = response;
      const publicKey = data.match(/<p><strong>Public Key:<\/strong> (.*)<\/p>/)[1];
      const privateKey = data.match(/<p><strong>Private Key:<\/strong> (.*)<\/p>/)[1];
      setPublicKey(publicKey);
      setPrivateKey(privateKey);
      localStorage.setItem('publicKey', publicKey);
      localStorage.setItem('privateKey', privateKey);
      setShowPopup(true); // Show the popup when keys are generated successfully
    } catch (error) {
      console.error('Error generating keys:', error);
    }
  };

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    const publicKey = (document.getElementById('publicKey') as HTMLInputElement).value;
    const privateKey = (document.getElementById('privateKey') as HTMLInputElement).value;

    try {
      const response = await axios.post('http://localhost:3000/api/user/signin', { publicKey, privateKey });
      console.log('Sign-In Response:', response.data);

      if (response.status === 200) {
        navigate('/'); // Redirect to the home page upon successful sign-in
      }
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 p-4">
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
            onClick={handleSignIn}
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

          {showPopup && (
            <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Generated Keys</h1>
                <p><strong>Public Key:</strong> {publicKey}</p>
                <p><strong>Private Key:</strong> {privateKey}</p>
                <button
                  onClick={() => setShowPopup(false)}
                  className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signin;
