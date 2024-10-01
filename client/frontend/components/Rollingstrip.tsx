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
        const response = await axios.get('https://api.cricktrade.co/api/player/getallplayers');
        setPlayers(response.data);
      } catch (error) {
        console.error('Error fetching player data:', error);
      }
    };

    fetchPlayers();
  }, []);

  const roundNumbers = (value: number) => {
    return Math.round(value * 100) / 100;
  };

  // Duplicate the players array to create a seamless loop
  const duplicatedPlayers = [...players, ...players];

  return (
    <div className="relative w-full bg-gray-900 overflow-hidden">
      <div className="rolling-strip">
        {duplicatedPlayers.map((player, index) => (
          <div key={index} className="rolling-strip-item">
            <span className="font-bold">{`${player.firstName} ${player.lastName}`}</span>
            <span className="text-green-400 ml-2">{roundNumbers(player.value)} APT</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Rollingstrip;
