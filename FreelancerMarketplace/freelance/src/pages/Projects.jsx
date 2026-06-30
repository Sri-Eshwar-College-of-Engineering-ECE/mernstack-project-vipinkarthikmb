import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import '../styles/projects.css';

function Projects() {
  const [allProjects, setAllProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isActivePage, setIsActivePage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = 'http://localhost:5000/api/projects';
  const USER_ID = 'user123';

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get(API_URL);
        setAllProjects(response.data);
      } catch (err) {
        setError('Failed to fetch projects');
      }
      setLoading(false);
    };
    fetchProjects();
  }, []);

  const handleApplyNow = async () => {
    if (!selectedProject) return;
    try {
      const response = await axios.put(`${API_URL}/apply/${selectedProject._id}`, {
        userId: USER_ID,
      });

      const updatedProject = response.data;

      setAllProjects(prev =>
        prev.map(p => (p._id === updatedProject._id ? updatedProject : p))
      );

      alert(`You applied for: ${updatedProject.title}`);
      setSelectedProject(null);
    } catch (err) {
      alert('Failed to apply for project');
    }
  };

  const appliedProjects = allProjects.filter(p => p.assignedTo === USER_ID);
 const projectsToPick = allProjects.filter(
  p => (!p.assignedTo || p.assignedTo !== USER_ID) && p.status === 'Open'
);

  const renderProjectCard = (project, isPickable = true) => (
    <div
      className={isPickable ? 'project-item fadeInUp' : 'active-project-item fadeInUp'}
      key={project._id}
    >
      <h4>{project.title}</h4>
      <p><strong>Job Type:</strong> {project.jobType}</p>
      <p><strong>Price:</strong> {project.price}</p>
      <p><strong>Due Date:</strong> {new Date(project.dueDate).toLocaleDateString()}</p>
      <p><strong>Company:</strong> {project.company}</p>
      <p><strong>Duration:</strong> {project.duration}</p>
      <p><strong>Dealer:</strong> {project.dealer}</p>
      {isPickable && (
        <button className="project-action" onClick={() => setSelectedProject(project)}>
          View Details
        </button>
      )}
    </div>
  );

  return (
    <div className={isActivePage ? 'active-projects-wrapper' : 'projects-wrapper'}>
      <Navbar />

      <div className="header-section fadeInUp">
        <h2 className="projects-title">
          {isActivePage ? 'Active Projects 💼' : 'Projects to Pick ✨'}
        </h2>
        <p className="projects-subtitle">
          {isActivePage
            ? 'These are your current project assignments.'
            : 'Select from available open projects to work on.'}
        </p>
      </div>

      <div className="toggle-wrapper">
        <button
          className={!isActivePage ? 'toggle-button active' : 'toggle-button'}
          onClick={() => setIsActivePage(false)}
        >
          Projects to Pick
        </button>
        <button
          className={isActivePage ? 'toggle-button active' : 'toggle-button'}
          onClick={() => setIsActivePage(true)}
        >
          Active Projects
        </button>
      </div>

      {loading && <p>Loading projects...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div className={isActivePage ? 'active-projects-list' : 'projects-list'}>
        {isActivePage
          ? appliedProjects.length === 0
            ? <p>No active projects yet.</p>
            : appliedProjects.map(p => renderProjectCard(p, false))
          : projectsToPick.length === 0
          ? <p>No projects to pick.</p>
          : projectsToPick.map(p => renderProjectCard(p, true))}
      </div>

      {selectedProject && (
        <div className="modal-overlay">
          <div className="project-details-modal">
            <h3>{selectedProject.title}</h3>
            <p><strong>Job Type:</strong> {selectedProject.jobType}</p>
            <p><strong>Price:</strong> {selectedProject.price}</p>
            <p><strong>Due Date:</strong> {new Date(selectedProject.dueDate).toLocaleDateString()}</p>
            <p><strong>Company:</strong> {selectedProject.company}</p>
            <p><strong>Duration:</strong> {selectedProject.duration}</p>
            <p><strong>Dealer:</strong> {selectedProject.dealer}</p>
            <button className="pick-job-button" onClick={handleApplyNow}>
              Apply Now
            </button>
            <button className="close-details-button" onClick={() => setSelectedProject(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Projects;
