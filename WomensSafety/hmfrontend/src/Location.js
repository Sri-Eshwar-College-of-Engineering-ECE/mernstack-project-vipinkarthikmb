import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Location.css';
import GoogleMapReact from 'google-map-react';

const Location = () => {
  const [activeTab, setActiveTab] = useState('Location'); // Track active tab
  const navigate = useNavigate();

  const defaultProps = {
    center: {
      lat: 20.5937, // Default to a central location in India
      lng: 78.9629,
    },
    zoom: 5, // Adjust zoom level as needed
  };

  const AnyReactComponent = ({ text }) => <div>{text}</div>;

  const handleNavigation = (path, tab) => {
    setActiveTab(tab);
    navigate(path);
  };

  return (
    <div className="detection-container">
      <div className="sidebar">
        <div className="sidebar-header">DASHBOARD</div>
        <ul className="nav-links">
          <li
            className={`nav-item ${activeTab === 'Home' ? 'active' : ''}`}
            onClick={() => handleNavigation('/', 'Home')}
          >
            <button className="nav-button">Home</button>
          </li>
          <li
            className={`nav-item ${activeTab === 'Live' ? 'active' : ''}`}
            onClick={() => handleNavigation('/Livepage', 'Live')}
          >
            <button className="nav-button">Live</button>
          </li>
          <li
            className={`nav-item ${activeTab === 'Detection' ? 'active' : ''}`}
            onClick={() => handleNavigation('/Detection', 'Detection')}
          >
            <button className="nav-button">Detection</button>
          </li>
          <li
            className={`nav-item ${activeTab === 'Location' ? 'active' : ''}`}
            onClick={() => handleNavigation('/Location', 'Location')}
          >
            <button className="nav-button">Location</button>
          </li>
          <li
            className={`nav-item ${activeTab === 'Sensus' ? 'active' : ''}`}
            onClick={() => handleNavigation('/Sensus', 'Sensus')}
          >
            <button className="nav-button">Sensus</button>
          </li>
          <li
            className={`nav-item ${activeTab === 'About' ? 'active' : ''}`}
            onClick={() => handleNavigation('/About', 'About')}
          >
            <button className="nav-button">About</button>
          </li>
        </ul>
        <button className="logout" onClick={() => navigate('/logout')}>
          LOG OUT
        </button>
      </div>
      <div className="main-content">
        <div className="location-header">LOCATION</div>
        <div className="map-container">
          <div style={{ height: '400px', width: '100%' }}>
            <GoogleMapReact
              bootstrapURLKeys={{ key: "" }} // Replace with your actual Google Maps API key
              defaultCenter={defaultProps.center}
              defaultZoom={defaultProps.zoom}
            >
              <AnyReactComponent
                lat={28.6139} // Example marker
                lng={77.2090}
                text="Marker 1"
              />
              <AnyReactComponent
                lat={19.0760} // Example marker
                lng={72.8777}
                text="Marker 2"
              />
              <AnyReactComponent
                lat={12.9716} // Example marker
                lng={79.1300}
                text="Marker 3"
              />
            </GoogleMapReact>
          </div>
        </div>
        <div className="location-details">
          <p>Location Details</p>
          <p>Alert: Harassment Detected (If Happens)</p>
          <p>Location: (Current Area)</p>
          <p>Time: (Current time)</p>
          <p>Place: (Current Place)</p>
        </div>
      </div>
    </div>
  );
};

export default Location;
