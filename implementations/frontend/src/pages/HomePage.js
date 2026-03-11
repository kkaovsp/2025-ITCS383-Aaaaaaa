import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
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
        <div className="feature-card">
          <div className="feature-icon">🎪</div>
          <h3>Find Events</h3>
          <p>Explore upcoming events and markets near you, with full booth availability info.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🛒</div>
          <h3>Reserve a Booth</h3>
          <p>Merchants can apply for booth spots instantly and track their reservation status.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">💳</div>
          <h3>Easy Payment</h3>
          <p>Pay securely via credit card, TrueMoney wallet, or bank transfer with slip upload.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🔔</div>
          <h3>Real-time Notifications</h3>
          <p>Stay up to date with reservation confirmations, payment approvals, and more.</p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
