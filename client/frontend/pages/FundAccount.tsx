import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Rollingstrip from '@/components/Rollingstrip';

const FundAccount = () => {
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Fetch the private key from localStorage
    const storedPrivateKey = localStorage.getItem('privateKey');

    if (storedPrivateKey) {
      setPrivateKey(storedPrivateKey);
    } else {
      setResponseMessage('Please log in or generate a private key to fund your account.');
    }
  }, []);

  const handleFundAccount = async () => {
    if (!privateKey) {
      setResponseMessage('Private key is missing. Please log in or generate a private key.');
      return;
    }

    setLoading(true);
    setResponseMessage('');

    try {
      const response = await axios.post('https://cricktrade-server.azurewebsites.net/api/purchase/fund-account', {
        accountAddress: privateKey,  // Send privateKey as the accountAddress
      });

      if (response.status === 200) {
        setResponseMessage('Account successfully funded!');
      } else {
        setResponseMessage('Failed to fund the account.');
      }
    } catch (error) {
      console.error('Error funding account:', error);
      setResponseMessage('Failed to fund the account. Please try again.');
    } finally {
      setLoading(false);
      setShowModal(false);  // Close the modal after the transaction
    }
  };

  return (
    <>
      <Navbar />
      <Rollingstrip />
      <div className="w-full h-screen flex justify-center items-center bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full border border-gray-700">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">Fund Your Account</h1>

          {/* Information about funding the account */}
          <p className="text-gray-300 mb-6 text-center">
            Funding your account allows you to participate in trades, buy player stocks, and much more on CrickTrade. 
            Make sure to fund your account before initiating any transactions.
          </p>

          <button
            onClick={() => setShowModal(true)}  // Open modal on button click
            className="w-full bg-blue-600 text-white py-3 rounded-lg shadow-md hover:bg-blue-700 transition mb-4"
          >
            Fund Account
          </button>

          {responseMessage && (
            <div className="mt-4 text-center">
              <p className="text-white">{responseMessage}</p>
            </div>
          )}

          {/* Modal for confirming funding the account */}
          {showModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-gray-900 p-6 rounded-lg shadow-lg max-w-sm w-full border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-4">Confirm Funding</h2>
                <p className="text-gray-300 mb-4">Are you sure you want to fund your account?</p>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={handleFundAccount}
                    className="bg-blue-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition"
                    disabled={loading}
                  >
                    {loading ? 'Funding...' : 'Yes, Fund'}
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="bg-red-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-red-700 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FundAccount;
