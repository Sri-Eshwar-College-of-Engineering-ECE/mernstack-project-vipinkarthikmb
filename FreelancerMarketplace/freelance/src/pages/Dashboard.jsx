import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import '../styles/dashboard.css';

function Dashboard() {
  const [view, setView] = useState('dashboard'); 
  const [balance, setBalance] = useState(780);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawDetails, setWithdrawDetails] = useState({ bankAccount: '', upiId: '' });
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [messagesModalOpen, setMessagesModalOpen] = useState(false); // new

  const appliedProjects = [
    { id: 1, title: 'Project Alpha', jobType: 'Design', price: 500, dueDate: '2025-06-30', company: 'Acme Corp', duration: '2 months', dealer: 'John Doe' },
    { id: 2, title: 'Project Beta', jobType: 'Development', price: 1200, dueDate: '2025-07-15', company: 'Beta LLC', duration: '3 months', dealer: 'Jane Smith' },
  ];

  const unreadMessages = [
    { id: 1, sender: 'Alice', subject: 'Project update', snippet: 'Hey, the design draft looks great!' },
    { id: 2, sender: 'Bob', subject: 'Meeting schedule', snippet: 'Can we reschedule tomorrow’s call?' },
    { id: 3, sender: 'Carol', subject: 'Invoice reminder', snippet: 'Please send the invoice for June.' },
  ];

  function renderProjectCard(project) {
    return (
      <div key={project.id} className="project-card">
        <h4>{project.title}</h4>
        <p><strong>Job Type:</strong> {project.jobType}</p>
        <p><strong>Price:</strong> ${project.price}</p>
        <p><strong>Due Date:</strong> {new Date(project.dueDate).toLocaleDateString()}</p>
        <p><strong>Company:</strong> {project.company}</p>
      </div>
    );
  }

  function handleWithdrawSubmit(e) {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      alert('Please enter a valid withdraw amount.');
      return;
    }
    if (amount > balance) {
      alert('Withdraw amount exceeds available balance.');
      return;
    }
    if (!withdrawDetails.bankAccount && !withdrawDetails.upiId) {
      alert('Please enter either Bank Account or UPI ID.');
      return;
    }

    setBalance(prev => prev - amount);
    setWithdrawSuccess(true);
    setWithdrawModalOpen(false);
    setWithdrawAmount('');
    setWithdrawDetails({ bankAccount: '', upiId: '' });

    setTimeout(() => {
      setWithdrawSuccess(false);
    }, 3000);
  }

  return (
    <div className="freelanceDashboard-container">
      <main className="freelanceDashboard-main">
        <h2 className="freelanceDashboard-header">
          🌟 Welcome to Your Freelancer Dashboard 🌟
        </h2>
        <p className="freelanceDashboard-subtitle">
          Your gigs, earnings, and client updates — all in one vibrant place.
        </p>

        <div className="freelanceDashboard-content">
          <DashboardCard
            title="Active Projects"
            content={`You currently have ${appliedProjects.length} active gigs. Keep shining!`}
            onClick={() => setView('activeProjects')}
          />
          <DashboardCard
            title="Total Earnings"
            content="Your monthly earnings: $2,350. 🚀"
          />
          <DashboardCard
            title="New Messages"
            content="3 unread messages waiting in your inbox. ✉️"
            onClick={() => setMessagesModalOpen(true)}
          />
          <DashboardCard
            title="Pending Reviews"
            content="2 clients need feedback. Boost your profile! 🌟"
          />
          <DashboardCard
            title="Withdraw Funds"
            content={`Available balance: $${balance}. 💸`}
            onClick={() => setWithdrawModalOpen(true)}
          />
          <DashboardCard
            title="Recommended Jobs"
            content="5 new jobs match your skills. Apply now! 💼"
          />
        </div>
      </main>

      <div className="freelanceDashboard-bottomNavbar">
        <Navbar />
      </div>

      {withdrawModalOpen && (
        <div className="modal-overlay">
          <div className="withdraw-modal">
            <h3>Withdraw Funds</h3>
            <form onSubmit={handleWithdrawSubmit}>
              <label>
                Amount to withdraw:
                <input
                  type="number"
                  min="1"
                  max={balance}
                  step="0.01"
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  required
                />
              </label>
              <label>
                Bank Account Number:
                <input
                  type="text"
                  value={withdrawDetails.bankAccount}
                  onChange={e => setWithdrawDetails(prev => ({ ...prev, bankAccount: e.target.value }))}
                  placeholder="Enter bank account (optional)"
                />
              </label>
              <label>
                OR UPI ID:
                <input
                  type="text"
                  value={withdrawDetails.upiId}
                  onChange={e => setWithdrawDetails(prev => ({ ...prev, upiId: e.target.value }))}
                  placeholder="Enter UPI ID (optional)"
                />
              </label>
              <div className="modal-buttons">
                <button type="submit" className="submit-button">Withdraw</button>
                <button type="button" className="cancel-button" onClick={() => setWithdrawModalOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {view === 'activeProjects' && (
        <div className="modal-overlay">
          <div className="active-projects-modal">
            <h3>Active Projects</h3>
            <div className="active-projects-list">
              {appliedProjects.length === 0 ? (
                <p>No active projects yet.</p>
              ) : (
                appliedProjects.map(renderProjectCard)
              )}
            </div>
            <button className="close-button" onClick={() => setView('dashboard')}>
              Close
            </button>
          </div>
        </div>
      )}

      {messagesModalOpen && (
        <div className="modal-overlay">
          <div className="messages-modal">
            <h3>Unread Messages</h3>
            <ul className="messages-list">
              {unreadMessages.map(msg => (
                <li key={msg.id} className="message-item">
                  <p><strong>From:</strong> {msg.sender}</p>
                  <p><strong>Subject:</strong> {msg.subject}</p>
                  <p>{msg.snippet}</p>
                </li>
              ))}
            </ul>
            <button className="close-button" onClick={() => setMessagesModalOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {withdrawSuccess && (
        <div className="withdraw-success-popup">
          <div className="success-content">
            <span className="green-tick">✔️</span>
            <p>Amount withdrawn successfully!</p>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardCard({ title, content, onClick }) {
  return (
    <div className="freelanceDashboard-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <h3>{title}</h3>
      <p>{content}</p>
    </div>
  );
}

export default Dashboard;
