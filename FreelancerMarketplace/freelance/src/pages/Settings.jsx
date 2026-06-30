import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/settings.css';

function Settings({ onToggleDarkMode, isDarkMode }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !feedback.trim()) {
      alert('Please enter your email and feedback.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), feedback: feedback.trim() }),
      });

      if (response.ok) {
        alert('Thank you for your feedback!');
        setEmail('');
        setFeedback('');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to submit feedback.');
      }
    } catch (error) {
      alert('Network error: Unable to submit feedback.');
    }
  };

  return (
    <div className={`settings-wrapper ${isDarkMode ? 'dark' : ''}`}>
      <Navbar />
      <h2 className="settings-title">Settings ⚙️</h2>

      <div className="settings-content">
        <section className="settings-section profile-section">
          <h3>Profile</h3>
          <div className="profile-info">
            <div className="profile-avatar-icon">👤</div>
            <div>
              <p><strong>Username:</strong> VIPIN KARTHIK M B</p>
              <p><strong>Email:</strong> vipinkarthik2005@gmail.com</p>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h3>Preferences</h3>
          <div className="settings-toggle">
            <span>Notifications</span>
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={() => setNotificationsEnabled(!notificationsEnabled)}
            />
          </div>
          <div className="settings-toggle">
            <span>Dark Mode</span>
            <input
              type="checkbox"
              checked={isDarkMode}
              onChange={onToggleDarkMode}
            />
          </div>
        </section>

        <section className="settings-section feedback-form-wrapper">
          <h3>Feedback</h3>
          <form onSubmit={handleFeedbackSubmit} className="feedback-form">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              required
              className="feedback-email-input"
            />
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your thoughts or issues..."
              required
            />
            <button type="submit">Submit Feedback</button>
          </form>
        </section>
      </div>

      <div className="logout-section">
        <button className="logout-btn" onClick={handleLogout}>
          🚪 Log Out
        </button>
      </div>
    </div>
  );
}

export default Settings;
