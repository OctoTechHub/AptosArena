import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Rollingstrip.css';

interface Player {
  firstName: string;
  lastName: string;
  value: number;
}

const Rollingstrip: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await axios.get('https://cricktrade-server.azurewebsites.net/api/player/getallplayers');
        setPlayers(response.data);
      } catch (error) {
        console.error('Error fetching player data:', error);
      }
    };

    fetchPlayers();
  }, []);

  return (
    <div className="relative w-full bg-gray-900 overflow-hidden">
      <div className="rolling-strip">
        {players.map((player, index) => (
          <div key={index} className="flex items-center px-8 text-white space-x-2">
            <span className="font-bold">{`${player.firstName} ${player.lastName}`}</span>
            <span className="text-green-400">${player.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Rollingstrip;
