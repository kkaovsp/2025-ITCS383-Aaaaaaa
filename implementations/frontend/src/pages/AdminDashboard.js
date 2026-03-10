import React from 'react';
import { Link } from 'react-router-dom';

function AdminDashboard() {
  return (
    <div>
      <h2>Admin Dashboard</h2>
      <ul>
        <li><Link to="/admin/merchants">Approve Merchants</Link></li>
        <li><Link to="/admin/payments">Review Payments</Link></li>
      </ul>
    </div>
  );
}

export default AdminDashboard;
