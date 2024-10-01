"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import "./AllPlayers.css";
import { useNavigate } from "react-router-dom";

interface Player {
  _id: string;
  firstName: string;
  lastName: string;
  nationality: string;
  role: string;
  value: number;
  quantity: number;
  imageUrl: string;
}

const AllPlayers = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await axios.get("https://api.cricktrade.co/api/player/getallplayers");
        setPlayers(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch player data");
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  const roundNumbers = (value: number) => {
    return Math.round(value * 100) / 100
  }

  const navigatetoGraph = (playerId: string) => {
    navigate(`/player/${playerId}`);
  };

  if (loading) {
    return (
      <div className="bg-gray-900 w-screen h-screen justify-center items-center flex flex-col gap-2">
        <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-blue-500"></div>
        <div className='text-2xl text-white font-semibold'>Loading...</div>
      </div>
    );
  }
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="container mx-auto p-8 bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-white">All Players</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 text-white rounded-lg shadow-lg border border-gray-700">
          <thead>
            <tr className="bg-gray-700 text-left">
              <th className="px-6 py-3">Image</th>
              <th className="px-6 py-3">First Name</th>
              <th className="px-6 py-3">Last Name</th>
              <th className="px-6 py-3">Nationality</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Value</th>
              <th className="px-6 py-3">Quantity</th>
              <th className="px-8 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => (
              <tr key={index} className="border-t border-gray-600 hover:bg-gray-700">
                <td className="px-6 py-4">
                  <img
                    src={player.imageUrl}
                    alt={`${player.firstName} ${player.lastName}`}
                    className="w-16 h-16 object-cover rounded-full"
                  />
                </td>
                <td className="px-6 py-4">{player.firstName}</td>
                <td className="px-6 py-4">{player.lastName}</td>
                <td className="px-6 py-4">{player.nationality}</td>
                <td className="px-6 py-4">{player.role}</td>
                <td className="px-6 py-4">{roundNumbers(player.value)} APT</td>
                <td className="px-6 py-4">{player.quantity}</td>
                <td className="px-6 py-4">
                  <button
                    className="px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg shadow-md border border-blue-500 hover:bg-gray-700 hover:text-blue-400 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    onClick={() => {
                      navigatetoGraph(player._id);
                    }}
                  >
                    SEE LIVE CHARTS
                  </button>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllPlayers;
