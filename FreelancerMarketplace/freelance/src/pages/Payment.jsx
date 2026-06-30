import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import '../styles/payment.css';

function Payment() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPayments() {
      try {
        const response = await fetch('http://localhost:5000/api/payments');
        if (!response.ok) throw new Error('Failed to fetch payments');
        const data = await response.json();
        setPayments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPayments();
  }, []);

  return (
    <div className="payment-page">
      <Navbar />
      <div className="payment-wrapper">
        <h2 className="payment-title">Payment Notifications 💰</h2>
        <p className="payment-subtitle">
          Track your earnings, recent payouts, and payment history.
        </p>

        {loading && <p className="status-msg">Loading payments...</p>}
        {error && <p className="status-msg error">Error: {error}</p>}

        <div className="payment-list">
          {payments.map(payment => (
            <div className="payment-card" key={payment._id || payment.date + payment.amount}>
              <h4>{payment.work}</h4>
              <p><strong>Company:</strong> {payment.company}</p>
              <p><strong>Holder:</strong> {payment.holder}</p>
              <p><strong>Amount:</strong> {payment.amount}</p>
              <p><strong>Status:</strong> <span className="status-badge">{payment.status}</span></p>
              <p><strong>Date:</strong> {payment.date}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Payment;
