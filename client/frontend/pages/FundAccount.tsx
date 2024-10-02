import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Rollingstrip from '@/components/Rollingstrip';

const FundAccount = () => {
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
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
      const response = await axios.post('https://api.cricktrade.co/api/purchase/fund-account', {
        accountAddress: privateKey,
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
      setShowModal(false);
    }
  };

  return (
    <>
      <Navbar />
      <Rollingstrip />
      <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gradient-to-r from-gray-900 to-gray-800 py-8">
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full border border-gray-700 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Attention!</h2>
          <p className="text-gray-300 font-semibold mb-8">
            This is a fantasy gaming platform with virtual player stocks. This platform does not involve real money, and users are funded with Aptos Testnet tokens.
            We strongly condemn any violation of rules and regulations.
          </p>

          <div className="flex items-center justify-center mb-4">
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-blue-600"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            <label className="ml-2 text-gray-300">Agree to Proceed</label>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className={`w-full py-3 text-lg font-semibold rounded-lg shadow-md transition mb-4 ${termsAccepted ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
            disabled={!termsAccepted}
          >
            Fund Account
          </button>

          {responseMessage && (
            <div className="mt-4 text-center">
              <p className="text-white">{responseMessage}</p>
            </div>
          )}

          {showModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75">
              <div className="bg-gray-900 p-6 rounded-lg shadow-xl max-w-sm w-full border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-4">Confirm Funding</h2>
                <p className="text-gray-300 mb-6">Are you sure you want to fund your account?</p>
                <div className="flex justify-between">
                  <button
                    onClick={handleFundAccount}
                    className="bg-blue-600 text-white py-2 px-6 rounded-lg shadow-md hover:bg-blue-700 transition"
                    disabled={loading}
                  >
                    {loading ? 'Funding...' : 'Yes, Fund'}
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="bg-red-600 text-white py-2 px-6 rounded-lg shadow-md hover:bg-red-700 transition"
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
