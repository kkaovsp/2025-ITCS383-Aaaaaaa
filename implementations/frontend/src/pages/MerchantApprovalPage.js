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
    <div className="page-content">
      <div className="page-header"><h2>👥 Merchant Approvals</h2></div>
      {loadError && <div className="alert alert-error">{loadError}</div>}
      {!loadError && users.length === 0 && (
        <div className="empty-state"><div className="empty-state-icon">👥</div>No users found.</div>
      )}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>MOI Validation</th>
              <th>Seller Information</th>
              <th>Joined</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const badgeCls = u.approval_status === 'APPROVED' ? 'badge-success' : u.approval_status === 'REJECTED' ? 'badge-danger' : 'badge-warning';
              return (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{u.name || u.username}</div>
                    {u.product_description && <div style={{ fontSize: '.78rem', color: 'var(--text-muted)', marginTop: '.15rem' }}>{u.product_description}</div>}
                  </td>
                  <td><span className="badge badge-purple">{u.role}</span></td>
                  <td>
                    {u.citizen_valid === null || u.citizen_valid === undefined
                      ? <span className="badge badge-gray">N/A</span>
                      : u.citizen_valid
                        ? <span className="badge badge-success">✔ Valid</span>
                        : <span className="badge badge-danger">✖ Invalid</span>}
                  </td>
                  <td style={{ maxWidth: 220, fontSize: '.85rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {u.seller_information || 'N/A'}
                  </td>
                  <td style={{ fontSize: '.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td>
                    <select
                      className="form-control"
                      style={{ width: 140, padding: '.3rem .6rem', fontSize: '.85rem' }}
                      value={u.approval_status || 'PENDING'}
                      onChange={(e) => handleStatusChange(u.id, e.target.value)}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                    <div style={{ marginTop: '.3rem' }}>
                      <span className={`badge ${badgeCls}`}>{u.approval_status || 'PENDING'}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MerchantApprovalPage;
