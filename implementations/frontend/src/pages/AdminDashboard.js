import React from 'react';
import { Link } from 'react-router-dom';

function AdminDashboard() {
  return (
    <div className="page-content">
      <div className="page-header"><h2>🛠️ Admin Dashboard</h2></div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-label">Merchant Approvals</div>
          <div className="stat-card-value" style={{ fontSize: '1.5rem', color: 'var(--warning)' }}>👥</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Payment Reviews</div>
          <div className="stat-card-value" style={{ fontSize: '1.5rem', color: 'var(--success)' }}>💳</div>
        </div>
      </div>
      <div className="cards-grid" style={{ maxWidth: 640 }}>
        <Link to="/admin/merchants" className="card-link">
          <div className="card" style={{ borderLeft: '4px solid var(--primary)', cursor: 'pointer' }}>
            <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>👥</div>
            <div className="card-title">Approve Merchants</div>
            <p style={{ fontSize: '.86rem', color: 'var(--text-secondary)', margin: 0 }}>Review pending merchant applications and update their approval status.</p>
          </div>
        </Link>
        <Link to="/admin/payments" className="card-link">
          <div className="card" style={{ borderLeft: '4px solid var(--success)', cursor: 'pointer' }}>
            <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>💳</div>
            <div className="card-title">Review Payments</div>
            <p style={{ fontSize: '.86rem', color: 'var(--text-secondary)', margin: 0 }}>Verify and approve pending payment submissions from merchants.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default AdminDashboard;
