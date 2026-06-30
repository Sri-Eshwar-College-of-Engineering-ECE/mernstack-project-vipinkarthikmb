import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = ({ onLogout, username }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [systemStatus, setSystemStatus] = useState({
    activeDevices: 0,
    detectionRate: 0,
    lastUpdated: null,
  });
  const [allEvents, setAllEvents] = useState([]);
  const [displayedEvents, setDisplayedEvents] = useState([]);
  const [eventIndex, setEventIndex] = useState(0);

  useEffect(() => {
    const fetchSystemData = async () => {
      try {
        const activeDevices = Math.floor(Math.random() * 20) + 10;
        const detectionRate = Math.floor(Math.random() * 15) + 85;

        setSystemStatus({
          activeDevices,
          detectionRate,
          lastUpdated: new Date().toLocaleString(),
        });

        setAllEvents((prevEvents) => [
          {
            id: Date.now(),
            title: 'System status updated',
            details: `Active Devices: ${activeDevices}, Detection Rate: ${detectionRate}%`,
            timestamp: new Date().toLocaleString(),
          },
          ...prevEvents,
        ]);
      } catch (error) {
        console.error('Error fetching system data:', error);
        setAllEvents((prevEvents) => [
          {
            id: Date.now(),
            title: 'Error fetching system data',
            details: error.message || 'An error occurred.',
            timestamp: new Date().toLocaleString(),
          },
          ...prevEvents,
        ]);
      }
    };

    fetchSystemData();
    const intervalId = setInterval(fetchSystemData, 5000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const eventsToDisplay = allEvents.slice(eventIndex, eventIndex + 5);
    setDisplayedEvents(eventsToDisplay);
  }, [allEvents, eventIndex]);

  const handleTabClick = (tab, path) => {
    setActiveTab(tab);
    navigate(path);
  };

  const handleNext = () => {
    if (eventIndex + 5 < allEvents.length) {
      setEventIndex(eventIndex + 5);
    }
  };

  const handlePrev = () => {
    if (eventIndex > 0) {
      setEventIndex(eventIndex - 5);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="sidebar-header">DASHBOARD</div>
        <ul className="nav-links">
          <li
            className={`nav-item ${activeTab === 'Dashboard' ? 'active' : ''}`}
            onClick={() => handleTabClick('Dashboard', '/Dashboard')}
          >
            <button className="nav-button">Home</button>
          </li>
          <li
            className={`nav-item ${activeTab === 'Live' ? 'active' : ''}`}
            onClick={() => handleTabClick('Live', '/Livepage')}
          >
            <button className="nav-button">Live</button>
          </li>
          <li
            className={`nav-item ${activeTab === 'Detection' ? 'active' : ''}`}
            onClick={() => handleTabClick('Detection', '/detection')}
          >
            <button className="nav-button">Detection</button>
          </li>
          <li
            className={`nav-item ${activeTab === 'Location' ? 'active' : ''}`}
            onClick={() => handleTabClick('Location', '/location')}
          >
            <button className="nav-button">Location</button>
          </li>
          <li
            className={`nav-item ${activeTab === 'Sensus' ? 'active' : ''}`}
            onClick={() => handleTabClick('Sensus', '/sensus')}
          >
            <button className="nav-button">Sensus</button>
          </li>
          <li
            className={`nav-item ${activeTab === 'About' ? 'active' : ''}`}
            onClick={() => handleTabClick('About', '/about')}
          >
            <button className="nav-button">About</button>
          </li>
        </ul>
        <button className="logout" onClick={onLogout}>
          LOG OUT
        </button>
      </div>

      <div className="main-content">
        <div className="header">DETECTION MONITORING SYSTEM</div>

        <div className="profile-section">
          <div className="profile-image"></div>
          <div className="profile-info">
            <div className="info-item">
              <label>NAME</label>
              <input type="text" value={username} readOnly />
            </div>
          </div>
        </div>

        <div className="system-overview">
          <h2>System Overview</h2>
          <div className="overview-item">
            <span className="overview-label">Active Devices:</span>
            <span className="overview-value">{systemStatus.activeDevices}</span>
          </div>
          <div className="overview-item">
            <span className="overview-label">Detection Rate:</span>
            <span className="overview-value">{systemStatus.detectionRate}%</span>
          </div>
          <div className="overview-item">
            <span className="overview-label">Last Updated:</span>
            <span className="overview-value">{systemStatus.lastUpdated}</span>
          </div>
        </div>

        <div className="events-section">
          <h2>Recent Events</h2>
          <ul className="events-list">
            {displayedEvents.map((event) => (
              <li key={event.id} className="event-item">
                <div className="event-details">
                  <span className="event-title">{event.title}</span>
                  <span className="event-description">{event.details}</span>
                </div>
                <span className="event-timestamp">{event.timestamp}</span>
              </li>
            ))}
          </ul>
          <div className="pagination">
            <button onClick={handlePrev} disabled={eventIndex === 0}>Prev</button>
            <button onClick={handleNext} disabled={eventIndex + 5 >= allEvents.length}>Next</button>
          </div>
        </div>

        <div className="button-group">
        <button className="alert-button" onClick={() => navigate('/Livepage')}>Check for alerts</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;