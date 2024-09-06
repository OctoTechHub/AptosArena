import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Player {
  firstName: string;
  lastName: string;
  quantity: number;
  value: number;
  imageUrl: string;
  nationality: string;
}

const TopPlayerscards = () => {
  const [players, setPlayers] = useState<Player[]>([]);

  // Fetch players from API when the component mounts
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/player/getallplayers');
        setPlayers(response.data); // Assuming the API returns an array of players
      } catch (error) {
        console.error('Error fetching player data:', error);
      }
    };

    fetchPlayers();
  }, []);

  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      {players.map((player, index) => (
        <div key={index} className="bg-white shadow-lg rounded-lg p-4">
          <img src={player.imageUrl} alt={`${player.firstName} ${player.lastName}`} className="h-32 w-32 mx-auto rounded-full" />
          <h2 className="text-xl font-semibold text-center mt-4">
            {player.firstName} {player.lastName}
          </h2>
          <p className="text-center text-gray-500">Nationality: {player.nationality}</p>
          <p className="text-center text-gray-700 mt-2">Value: {player.value}</p>
          <p className="text-center text-gray-700 mt-2">Quantity: {player.quantity}</p>
        </div>
      ))}
    </div>
  );
};

export default TopPlayerscards;
