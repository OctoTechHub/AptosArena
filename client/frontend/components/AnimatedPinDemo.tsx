"use client";
import  { useEffect, useState } from "react";
import { PinContainer } from "../components/ui/3d-pin";
import axios from "axios";
import Rollingstrip from "./Rollingstrip";

interface Player {
  firstName: string;
  lastName: string;
  imageUrl: string;
  nationality: string;
  role: string;
  value: number;
  quantity: number;
}

export function AnimatedPinDemo() {
  const [players, setPlayers] = useState<Player[]>([]);

  // Fetch player data from API
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await axios.get("https://cricktrade-server.azurewebsites.net/api/player/getallplayers");
        const sortedPlayers = response.data.sort((a: Player, b: Player) => b.value - a.value); // Sort players by value in descending order
        setPlayers(sortedPlayers.slice(0, 3)); // Get the top 3 players
      } catch (error) {
        console.error("Error fetching player data:", error);
      }
    };

    fetchPlayers();
  }, []);

  return (
    <>
      {/* Rolling strip section */}
      <div className="w-full mt-[-2%]">
        <Rollingstrip />
      </div>

      {/* Player cards grid */}
      <div className="h-full w-full flex items-center justify-center flex-col mt-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 p-8">
          {players.map((player, index) => (
            <PinContainer
              key={index}
              title={`${player.firstName} ${player.lastName}`}
              href={`#`} // You can set actual URLs if needed
            >
              <div className="flex flex-col items-center p-6 bg-gray-900 border border-gray-700 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 w-[20rem] h-auto">
                <img
                  src={player.imageUrl}
                  alt={`${player.firstName} ${player.lastName}`}
                  className="rounded-full h-24 w-24 mb-4 object-cover border-4 border-gray-700"
                />
                <h3 className="font-semibold text-xl text-center text-white mb-2">
                  {player.firstName} {player.lastName}
                </h3>
                <div className="text-md text-center text-gray-300 mb-4 space-y-2">
                  <p className="font-medium">Nationality: <span className="text-white">{player.nationality}</span></p>
                  <p className="font-medium">Role: <span className="text-white">{player.role}</span></p>
                  <p className="font-medium">Value: <span className="text-white">${player.value}</span></p>
                  <p className="font-medium">Quantity: <span className="text-white">{player.quantity}</span></p>
                </div>
              </div>
              {/* Buy Now button positioned below the card */}
              <button
                onClick={() =>
                  (window.location.href = `https://example.com/buy/${player.firstName}-${player.lastName}`)
                }
                className="mt-4 w-[20rem] py-2 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 transition-colors duration-300"
              >
                Buy Now
              </button>
            </PinContainer>
          ))}
        </div>
      </div>
    </>
  );
}

export default AnimatedPinDemo;
