import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Rollingstrip from '@/components/Rollingstrip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';

const Signin = () => {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isLoginSuccess, setIsLoginSuccess] = useState(false);  // State for login success message

  const navigate = useNavigate();

  // Function to handle account generation
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
      setShowPopup(true);
    } catch (error) {
      console.error('Error generating keys:', error);
    }
  };

  // Function to handle sign-in
  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    const publicKey = (document.getElementById('publicKey') as HTMLInputElement).value;
    const privateKey = (document.getElementById('privateKey') as HTMLInputElement).value;

    try {
      const response = await axios.post('http://localhost:3000/api/user/signin', { publicKey, privateKey });
      if (response.status === 200) {
        // Save keys to localStorage
        localStorage.setItem('publicKey', publicKey);
        localStorage.setItem('privateKey', privateKey);

        // Show login success popup
        setIsLoginSuccess(true);
        setShowPopup(true);
        setTimeout(() => {
          navigate('/');  // Redirect after successful login
        }, 2000);  // Redirect after 2 seconds
      }
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  // Copy key to clipboard
  const handleCopyToClipboard = (key: string | null) => {
    if (key) {
      navigator.clipboard.writeText(key);
      alert(`${key ? 'Public Key' : 'Private Key'} copied to clipboard!`);
    }
  };

  return (
    <>
      <Navbar />
      <Rollingstrip />
      <div className="w-full h-screen flex justify-center items-center bg-gradient-to-r bg-gray-900">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full border border-gray-700">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">Sign In</h1>

          <form>
            <div className="mb-6">
              <label htmlFor="publicKey" className="block text-white text-sm font-medium mb-2">Public Key</label>
              <input
                id="publicKey"
                type="text"
                placeholder="Enter your public key"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="privateKey" className="block text-white text-sm font-medium mb-2">Private Key</label>
              <input
                id="privateKey"
                type="password"
                placeholder="Enter your private key"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <button
              onClick={handleSignIn}
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg shadow-md hover:bg-blue-700 transition"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={handleGenerateKeys}
              className="w-full bg-purple-600 text-white py-3 rounded-lg shadow-md hover:bg-purple-700 transition"
            >
              Generate New Keys
            </button>
          </div>
        </div>

        {/* Popup for generated keys or login success */}
        {showPopup && (
          <div className="fixed right-0 top-0 h-full w-1/3 bg-gray-800 bg-opacity-70 flex flex-col justify-center items-center z-50 p-4">
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-xs border border-gray-600 relative">
              <button
                onClick={() => setShowPopup(false)}
                className="absolute top-2 right-2 text-white text-lg font-bold"
              >
                &times;
              </button>
              <h1 className="text-3xl font-bold text-white mb-4">
                {isLoginSuccess ? 'Login Successful' : 'Generated Keys'}
              </h1>

              {!isLoginSuccess && (
                <div className="bg-gray-700 p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-white overflow-hidden overflow-ellipsis whitespace-nowrap">
                      <strong>Public Key:</strong> {publicKey}
                    </p>
                    <div
                      className="flex items-center bg-purple-600 p-2 rounded-full cursor-pointer hover:bg-purple-700 transition"
                      onClick={() => handleCopyToClipboard(publicKey)}
                    >
                      <FontAwesomeIcon icon={faCopy} className="text-white" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-white overflow-hidden overflow-ellipsis whitespace-nowrap">
                      <strong>Private Key:</strong> {privateKey}
                    </p>
                    <div
                      className="flex items-center bg-purple-600 p-2 rounded-full cursor-pointer hover:bg-purple-700 transition"
                      onClick={() => handleCopyToClipboard(privateKey)}
                    >
                      <FontAwesomeIcon icon={faCopy} className="text-white" />
                    </div>
                  </div>
                </div>
              )}

              {isLoginSuccess && (
                <p className="text-white text-lg">You have successfully logged in!</p>
              )}

              <button
                onClick={() => setShowPopup(false)}
                className="w-full bg-purple-600 text-white py-3 rounded-lg shadow-md hover:bg-purple-800 transition mt-4"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Signin;
