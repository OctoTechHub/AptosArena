"use client";
import  { useState, useEffect } from "react";
import axios from "axios";
import "./AllPlayers.css";

interface Player {
  firstName: string;
  lastName: string;
  nationality: string;
  role: string;
  value: number;
  quantity: number;
  imageUrl: string; // Add this line
}

const AllPlayers = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/player/getallplayers");
        setPlayers(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch player data");
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  if (loading) return <p className="text-center text-white">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="container mx-auto p-8 bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-white">All Players</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 text-white rounded-lg shadow-lg border border-gray-700">
          <thead>
            <tr className="bg-gray-700 text-left">
              <th className="px-6 py-3">Image</th> {/* New header */}
              <th className="px-6 py-3">First Name</th>
              <th className="px-6 py-3">Last Name</th>
              <th className="px-6 py-3">Nationality</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Value</th>
              <th className="px-6 py-3">Quantity</th>
              <th className="px-6 py-3">Actions</th>
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
                <td className="px-6 py-4">${player.value}</td>
                <td className="px-6 py-4">{player.quantity}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-4">
                    <button className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors duration-300 focus:outline-none">
                      Buy
                    </button>
                    <button className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors duration-300 focus:outline-none">
                      Sell
                    </button>
                  </div>
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
