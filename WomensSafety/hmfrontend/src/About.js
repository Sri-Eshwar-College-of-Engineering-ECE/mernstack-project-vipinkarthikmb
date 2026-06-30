import React from 'react';
import './About.css';
import { useNavigate, useLocation } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path, tab) => {
    navigate(path);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="about-container">
      <div className="sidebar">
        <div className="sidebar-header">DASHBOARD</div>
        <ul className="nav-links">
          <li
            className={`nav-item ${isActive('/') ? 'active' : ''}`}
            onClick={() => handleNavigation('/', 'Home')}
          >
            <button className="nav-button">Home</button>
          </li>
          <li
            className={`nav-item ${isActive('/Livepage') ? 'active' : ''}`}
            onClick={() => handleNavigation('/Livepage', 'Live')}
          >
            <button className="nav-button">Live</button>
          </li>
          <li
            className={`nav-item ${isActive('/Detection') ? 'active' : ''}`}
            onClick={() => handleNavigation('/Detection', 'Detection')}
          >
            <button className="nav-button">Detection</button>
          </li>
          <li
            className={`nav-item ${isActive('/Location') ? 'active' : ''}`}
            onClick={() => handleNavigation('/Location', 'Location')}
          >
            <button className="nav-button">Location</button>
          </li>
          <li
            className={`nav-item ${isActive('/Sensus') ? 'active' : ''}`}
            onClick={() => handleNavigation('/Sensus', 'Sensus')}
          >
            <button className="nav-button">Sensus</button>
          </li>
          <li
            className={`nav-item ${isActive('/About') ? 'active' : ''}`}
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
        <div className="about-header">About</div>
        <div className="about-content">
          <p>
            Public safety is a fundamental right that every individual deserves. In today’s world, where technology is rapidly evolving, it is essential to leverage innovative solutions to ensure the safety and security of our communities. Our AI-powered public safety system is a cutting-edge solution that combines advanced technology with human intervention to create a secure environment for all.
            This detection system enhances public safety by monitoring live CCTV feeds under the supervision of police control room surveillance. It uses advanced AI technology to detect harassment activities and suspicious behavior in real-time, ensuring prompt alerts to authorities for swift intervention. With gender detection capabilities, the system improves monitoring efficiency and accuracy, enabling better identification of critical situations. The system sends instant notifications to control rooms and on-ground teams, ensuring timely action to prevent escalation. Designed to integrate seamlessly with existing CCTV infrastructures, it is both cost-effective and scalable, requiring minimal hardware upgrades. AI algorithms classify incidents by type and severity, providing actionable insights for law enforcement to prioritize responses effectively. All data processed by the system is encrypted and securely transmitted, ensuring privacy compliance and the protection of sensitive information. By analyzing historical data, the system identifies high-risk areas and peak times for incidents, enabling proactive safety measures.
            A user-friendly dashboard allows operators to view live feeds, monitor alerts, and access detailed analytics for quick decision-making. Additionally, a linked mobile application empowers citizens to report suspicious activities, creating a collaborative ecosystem for enhanced public safety. Adaptable to various environments, including urban areas, schools, workplaces, and transportation hubs, the system ensures widespread applicability. It offers multi-lingual support, making it accessible to diverse communities across regions. With real-time heatmaps and trend analysis, law enforcement can allocate resources efficiently and strengthen preventive strategies. Regular updates and AI model enhancements ensure the system remains future-ready to tackle emerging security challenges, fostering a safer, more vigilant community and empowering both law enforcement and citizens to work together toward a secure future. This holistic approach bridges the gap between technology and human intervention, creating an ecosystem where safety is a shared responsibility, making our cities and public spaces more secure for everyone.
          </p>
        </div>
        <div className="support-section">
          <p>SUPPORT</p>
          <p>• support12345@gmail.com</p>
        </div>
        <div className="footer">
          <p>Together, technology and humanity can build a safer tomorrow.</p>
        </div>
      </div>
    </div>
  );
};

export default About;
