import React, { useEffect, useState } from 'react';
import api from '../services/api';

function MerchantApprovalPage() {
  const [users, setUsers] = useState([]);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const resp = await api.get('/users');
        setUsers(resp.data);
      } catch (err) {
        console.error(err);
        setLoadError('Failed to load users');
      }
    }
    load();
  }, []);

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const resp = await api.patch(`/users/${userId}/merchant_status`, { status: newStatus });
      // update local list with returned info
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, approval_status: resp.data.approval_status, role: resp.data.role } : u)));
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };

  return (
    <div>
      <h2>Merchant Approvals</h2>
      {loadError && <div style={{ color: 'red' }}>{loadError}</div>}
      {!loadError && users.length === 0 && <div>No users found.</div>}
      <ul>
        {users.map((u) => (
          <li key={u.id} style={{ marginBottom: '0.75rem', padding: '0.5rem', border: '1px solid #eee' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div><strong>Name:</strong> {u.name || u.username}</div>
                <div><strong>Role:</strong> {u.role}</div>
                <div><strong>MOI validation result:</strong> {u.citizen_valid === null || u.citizen_valid === undefined ? 'N/A' : (u.citizen_valid ? 'Valid' : 'Invalid')}</div>
                <div><strong>Seller information:</strong> {u.seller_information || 'N/A'}</div>
                <div><strong>Product information:</strong> {u.product_description || 'N/A'}</div>
              </div>
              <div style={{ minWidth: '180px', textAlign: 'right' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem' }}><strong>Merchant Status:</strong></label>
                  <select value={u.approval_status || 'PENDING'} onChange={(e) => handleStatusChange(u.id, e.target.value)}>
                    <option value="PENDING">PENDING</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>
                <div style={{ fontSize: '0.8rem' }}>{u.created_at && `Joined: ${new Date(u.created_at).toLocaleString()}`}</div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MerchantApprovalPage;
