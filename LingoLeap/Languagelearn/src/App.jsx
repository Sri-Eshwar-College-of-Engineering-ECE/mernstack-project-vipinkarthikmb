import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import LoginSignup from './pages/LoginSignup';
import LeaderBoard from './components/LeaderBoard';
import Profile from './components/Profile';
import Practice from './components/Practice';
import DailyChallenge from './components/DailyChallenge';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const handleAuthentication = (status) => {
    setIsAuthenticated(status);
    if (status) {
      navigate('/dashboard'); 
    } else {
      navigate('/');
    }
  };
  return (
    <div>
      <Routes>
        <Route path="/" element={<LoginSignup setIsAuthenticated={handleAuthentication} />} />
        {isAuthenticated && (
          <>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leaderboard" element={<LeaderBoard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/dailychallenge" element={<DailyChallenge />} />
          </>
        )}
        {!isAuthenticated && (
          <Route path="*" element={<LoginSignup setIsAuthenticated={handleAuthentication} />} />
        )}
      </Routes>
    </div>
  );
}
export default App;


