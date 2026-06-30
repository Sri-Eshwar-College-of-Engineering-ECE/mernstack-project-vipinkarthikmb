import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Profile() {
  const [totalPoints, setTotalPoints] = useState(() => {
    return parseInt(localStorage.getItem('totalPoints')) || 0;
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return JSON.parse(localStorage.getItem('isDarkMode')) || false;
  });

  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');
  const [notifications, setNotifications] = useState([
    "Learn a new word today!",
    "You completed a quiz. Great job!",
    "Your language skills are improving!"
  ]);
  const [activeSection, setActiveSection] = useState('profile');
  
  useEffect(() => {
    localStorage.setItem('totalPoints', totalPoints);
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
    document.body.classList.toggle('dark', isDarkMode);
  }, [totalPoints, isDarkMode]);

  const handleDarkModeToggle = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  const handleFeedbackChange = (e) => {
    setFeedback(e.target.value);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleFeedbackSubmit = async () => {
    if (!email || !feedback) {
      alert("Email and Feedback cannot be empty!");
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:5000/api/feedback', {
        email: email,
        content: feedback
      });
  
      if (response.data.success) {
        alert('Feedback submitted successfully');
        setFeedback('');
        setEmail('');
        setShowFeedbackForm(false);
      } else {
        alert('Failed to submit feedback: ' + response.data.message);
      }
    } catch (err) {
      console.error("Error submitting feedback:", err);
      alert('Error submitting feedback. Please try again later.');
    }
  };
  
  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-r from-green-500 to-blue-500'}`}>
      <div className="w-1/5 bg-green-900 h-screen sticky top-0 flex flex-col items-start p-6 space-y-6 rounded-r-3xl shadow-lg relative">
        <h1 className="text-white font-bold text-2xl mb-4">LingoLeap</h1>
        <ul className="space-y-4 w-full">
          <li className="text-white hover:bg-green-700 p-2 rounded-lg w-full"><Link to="/dashboard">Home</Link></li>
          <li className="text-white hover:bg-green-700 p-2 rounded-lg w-full"><Link to="/practice">Practice</Link></li>
          <li className="text-white hover:bg-green-700 p-2 rounded-lg w-full"><Link to="/leaderboard">Leaderboard</Link></li>
          <li className="text-white hover:bg-green-700 p-2 rounded-lg w-full"><Link to="/profile">Profile</Link></li>
        </ul>
        <button 
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white py-2 px-4 rounded-lg w-full hover:bg-gray-600"
          onClick={handleDarkModeToggle}
        >
          {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        </button>
      </div>
      <div className="w-4/5 flex flex-col items-center justify-center p-10">
        <div className="bg-white p-8 rounded-3xl shadow-2xl text-center w-2/3">
          <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <h1 className="text-green-700 text-3xl font-bold mb-2">VIPIN KARTHIK M B</h1>
          <p className="text-gray-600 text-lg mb-4">vipinkarthik2005@gmail.com</p>
          <p className="text-gray-700 text-xl font-semibold mb-6">
            Total Points: <span className="text-green-600">{totalPoints}</span>
          </p>
          {activeSection === 'profile' && (
            <div className="text-left w-full border-t pt-4">
              <h2 className="text-green-700 font-bold text-lg mb-2">Account Settings</h2>
              <ul className="space-y-3">
                <li className="text-gray-700 hover:text-green-600 cursor-pointer" onClick={() => setShowFeedbackForm(true)}>
                  Feedback
                </li>
                <li className="text-gray-700 hover:text-green-600 cursor-pointer" onClick={() => handleSectionChange('notifications')}>
                  Notifications
                </li>
              </ul>
            </div>
          )}
          <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-xl mt-6">
            <Link to="/">Log Out</Link>
          </button>
        </div>
        {showFeedbackForm && (
          <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-xl shadow-lg w-1/3">
              <h3 className="text-2xl font-bold text-green-700 mb-4">Submit Feedback</h3>
              <input
                type="email"
                className="w-full p-4 mb-4 border border-gray-300 rounded-lg"
                placeholder="Enter your email"
                value={email}
                onChange={handleEmailChange}
              />
              <textarea
                className="w-full p-4 mb-4 border border-gray-300 rounded-lg"
                rows="4"
                placeholder="Write your feedback..."
                value={feedback}
                onChange={handleFeedbackChange}
              />
              <div className="flex justify-between">
                <button
                  onClick={() => setShowFeedbackForm(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-black py-2 px-4 rounded-lg"
                >
                  Close
                </button>
                <button
                  onClick={handleFeedbackSubmit}
                  className="bg-green-700 hover:bg-green-800 text-white py-2 px-4 rounded-lg"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
