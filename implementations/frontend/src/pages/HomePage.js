import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

function HomePage() {
  const { user } = useAuth();

  return (
    <div className="page-content">
      <div className="hero">
        <h1>🏪 BoothOrganizer</h1>
        <p>Discover events, reserve booths, and manage your merchant business all in one place.</p>
        <Link to="/events" className="btn btn-lg" style={{ background: '#fff', color: 'var(--primary)', fontWeight: 700 }}>
          Browse Events →
        </Link>
      </div>

      <div className="features-grid">
        <Link to="/events" className="feature-card-link">
          <div className="feature-card">
            <div className="feature-icon">🎪</div>
            <h3>Find Events</h3>
            <p>Explore upcoming events and markets near you, with full booth availability info.</p>
          </div>
        </Link>
        <Link to="/booths" className="feature-card-link">
          <div className="feature-card">
            <div className="feature-icon">🛒</div>
            <h3>Reserve a Booth</h3>
            <p>Merchants can apply for booth spots instantly and track their reservation status.</p>
          </div>
        </Link>
        <Link to="/events" className="feature-card-link">
          <div className="feature-card">
            <div className="feature-icon">💳</div>
            <h3>Easy Payment</h3>
            <p>Pay securely via credit card, TrueMoney wallet, or bank transfer with slip upload.</p>
          </div>
        </Link>
        {user && (
          <Link to="/notifications" className="feature-card-link">
            <div className="feature-card">
              <div className="feature-icon">🔔</div>
              <h3>Real-time Notifications</h3>
              <p>Stay up to date with reservation confirmations, payment approvals, and more.</p>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}

export default HomePage;
