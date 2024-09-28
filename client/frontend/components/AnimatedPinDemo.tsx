"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Rollingstrip from "./Rollingstrip";
import { useNavigate } from "react-router-dom";

interface Player {
  _id: string;
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
  const navigate = useNavigate();

  const navigatetoGraph = (playerId: string) => {
    navigate(`/player/${playerId}`);
  };

  const GraphIcon = () => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#23d178"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-chart-line"
      >
        <path d="M3 3v16a2 2 0 0 0 2 2h16" />
        <path d="m19 9-5 5-4-4-3 3" />
      </svg>
    );
  };

  // Fetch player data from API
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await axios.get(
          "https://cricktrade-server.azurewebsites.net/api/player/getallplayers"
        );
        const sortedPlayers = response.data.sort(
          (a: Player, b: Player) => b.value - a.value
        ); // Sort players by value in descending order
        setPlayers(sortedPlayers.slice(0, 3)); // Get the top 3 players
      } catch (error) {
        console.error("Error fetching player data:", error);
      }
    };

    fetchPlayers();
  }, []);

  const roundNumbers = (value: number) => {
    return Math.round(value * 100) / 100;
  };

  return (
    <>
      {/* Rolling strip section */}
      <div className="w-full mt-[-2%]">
        <Rollingstrip />
      </div>

      {/* Player cards grid */}
      <div className="h-full w-full flex items-center flex-col mt-10">
        <div className="flex flex-row pl-[14%] pt-4 pb-4 justify-start w-full text-2xl font-semibold gap-2 items-center">
          <h1>Top Players</h1> <GraphIcon />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 pl-8 pr-8 pb-8">
          {players.map((player, index) => (
            <div key={index} title={`${player.firstName} ${player.lastName}`}>
              <div className="flex flex-col bg-gray-900 border border-gray-700 rounded-xl shadow-xl hover:shadow-3xl transition-shadow duration-300 w-[27rem] ">
                <div className="flex flex-row gap-4 items-center pr-4 pl-4 pt-4">
                  <img
                    src={player.imageUrl}
                    alt={`${player.firstName} ${player.lastName}`}
                    className="rounded-2xl h-20 w-20 object-cover border-4 border-gray-700"
                  />
                  <div className="flex flex-col">
                    <h1 className="font-semibold text-lg">
                      {player.firstName} {player.lastName}
                    </h1>
                    <h3>Role : {player.role}</h3>
                  </div>
                </div>
                <div className="border-b h-1 border-gray-700 my-2"></div>
                <div className="flex flex-col p-4 ">
                  <h3>
                    <span className="font-semibold text-neutral-200">Price</span>{" "}
                    : {roundNumbers(player.value)} APT
                  </h3>
                  <h3>
                    <span className="font-semibold text-neutral-200">
                      Quantity
                    </span>{" "}
                    : {player.quantity} / 10,000 qty{" "}
                  </h3>
                  <button
                    onClick={() => {
                      navigatetoGraph(player._id);
                    }}
                    className="px-6 py-2 bg-green-500 rounded-lg text-white font-semibold hover:bg-green-400 transition duration-300 mt-4"
                  >
                    Buy Player
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default AnimatedPinDemo;