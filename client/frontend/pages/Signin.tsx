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
  const [isLoginSuccess, setIsLoginSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleGenerateKeys = async () => {
    try {
      const response = await axios.get('https://api.cricktrade.co/api/user/generateAccount');
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

  const handleDownloadKeys = () => {
    const keys = JSON.stringify({ publicKey, privateKey }, null, 2);
    const blob = new Blob([keys], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'keys.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const contents = e.target?.result as string;
        try {
          const parsedData = JSON.parse(contents);
          const uploadedPublicKey = parsedData.publicKey;
          const uploadedPrivateKey = parsedData.privateKey;

          if (uploadedPublicKey && uploadedPrivateKey) {
            setPublicKey(uploadedPublicKey);
            setPrivateKey(uploadedPrivateKey);
            handleSignInWithKeys(uploadedPublicKey, uploadedPrivateKey);
          } else {
            alert("Invalid keys in the uploaded file.");
          }
        } catch (error) {
          console.error('Error parsing JSON:', error);
          alert("Failed to parse the JSON file.");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSignInWithKeys = async (publicKey: string, privateKey: string) => {
    setLoading(true);
    try {
      const response = await axios.post('https://cricktrade-server.azurewebsites.net/api/user/signin', { publicKey, privateKey });
      if (response.status === 200) {
        localStorage.setItem('publicKey', publicKey);
        localStorage.setItem('privateKey', privateKey);
        setIsLoginSuccess(true);
        setShowPopup(true);
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error) {
      console.error('Error signing in:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    const publicKey = (document.getElementById('publicKey') as HTMLInputElement).value;
    const privateKey = (document.getElementById('privateKey') as HTMLInputElement).value;

    await handleSignInWithKeys(publicKey, privateKey);
  };

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
      <div className="w-full h-screen flex justify-center items-center bg-gradient-to-r from-gray-900 to-gray-800">
        {loading ? (
          <div className="bg-gray-900 w-screen h-screen justify-center items-center flex flex-col gap-2">
            <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-blue-500"></div>
            <div className='text-2xl text-white font-semibold'>Loading...</div>
          </div>
        ) : (
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full border border-gray-700">
            <h1 className="text-4xl font-bold text-white mb-8 text-center">Sign In</h1>

            <form onSubmit={handleSignIn}>
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

            <div className="mt-4 text-center">
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 transition hover:bg-gray-600">
                  <span className="text-white">Upload Key File (JSON)</span>
                </div>
              </label>
              <input
                id="file-upload"
                type="file"
                onChange={handleFileUpload}
                accept=".json"
                className="hidden"
              />
            </div>
          </div>
        )}

        {/* Spinner CSS */}
        <style>{`
          .loader {
            border: 8px solid rgba(255, 255, 255, 0.3);
            border-top: 8px solid #ffffff;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>

        {/* Popup for generated keys or login success */}
        {showPopup && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg max-w-md w-full border border-gray-600 relative">
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
                  <div className="flex justify-between items-center mb-4">
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
                  <button
                    onClick={handleDownloadKeys}
                    className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    Download Keys
                  </button>
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
