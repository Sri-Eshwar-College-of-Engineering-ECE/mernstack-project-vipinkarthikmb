import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";


function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/leaderboard");
        console.log("API Response:", response.data);
        
        if (response.data.success && Array.isArray(response.data.data)) {
          setLeaderboardData(response.data.data);
        } else {
          throw new Error("Invalid data format received");
        }
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setError("Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="bg-gradient-to-r from-green-500 to-blue-500 min-h-screen flex">
      <div className="w-1/5 bg-green-900 h-screen sticky top-0 flex flex-col items-start p-6 space-y-6 rounded-r-3xl shadow-lg">
        <h1 className="text-white font-bold text-2xl mb-4">LingoLeap</h1>
        <ul className="space-y-4 w-full">
          <li className="text-white hover:bg-green-700 p-2 rounded-lg w-full">
            <Link to="/dashboard">Home</Link>
          </li>
          <li className="text-white hover:bg-green-700 p-2 rounded-lg w-full">
            <Link to="/practice">Practice</Link>
          </li>
          <li className="text-white hover:bg-green-700 p-2 rounded-lg w-full">
            <Link to="/leaderboard">Leaderboard</Link>
          </li>
          <li className="text-white hover:bg-green-700 p-2 rounded-lg w-full">
            <Link to="/profile">Profile</Link>
          </li>
        </ul>
      </div>
      <div className="w-4/5 flex flex-col items-center justify-start p-10">
        <div className="bg-white p-10 rounded-3xl shadow-2xl text-center w-full max-w-screen-xl">
          <h2 className="text-green-700 text-4xl font-bold mb-6">Leaderboard</h2>

          {loading ? (
            <p className="text-gray-600 text-xl">Loading...</p>
          ) : error ? (
            <p className="text-red-600 text-xl">{error}</p>
          ) : leaderboardData.length === 0 ? (
            <p className="text-gray-600 text-xl">No leaderboard data available.</p>
          ) : (
            <div className="bg-gray-100 rounded-lg p-6 shadow-lg">
              <ul className="list-none">
                {leaderboardData.map((item, index) => (
                  <li
                    key={index}
                    className={`flex justify-between items-center p-4 rounded-md ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <span className="text-gray-800 text-xl font-semibold">#{item.rank}</span>
                    <div className="flex items-center space-x-3">
                      <span className="text-gray-800 text-xl font-medium">{item.name}</span>
                      <span className="text-gray-600 text-2xl">{item.emoji}</span>
                    </div>
                    <span className="text-gray-700 text-lg font-semibold">{`${item.points} pts.`}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
