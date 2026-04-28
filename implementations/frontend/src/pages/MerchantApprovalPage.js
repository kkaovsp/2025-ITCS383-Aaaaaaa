import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useTranslation } from 'react-i18next';

function MerchantApprovalPage() {
  const [users, setUsers] = useState([]);
  const [loadError, setLoadError] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    async function load() {
      try {
        const resp = await api.get('/users');
        setUsers(resp.data);
      } catch (err) {
        console.error(err);
        setLoadError(t('merchantApproval.loadFailed'));
      }
    }
    load();
  }, [t]);

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const resp = await api.patch(`/users/${userId}/merchant_status`, { status: newStatus });
      // update local list with returned info
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, approval_status: resp.data.approval_status, role: resp.data.role } : u)));
    } catch (err) {
      console.error(err);
      alert(t('merchantApproval.statusFailed'));
    }
  };

  return (
    <div className="page-content">
      <div className="page-header"><h2>{t('merchantApproval.title')}</h2></div>
      {loadError && <div className="alert alert-error">{loadError}</div>}
      {!loadError && users.length === 0 && (
        <div className="empty-state"><div className="empty-state-icon">👥</div>{t('merchantApproval.noUsers')}</div>
      )}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>{t('merchantApproval.name')}</th>
              <th>{t('merchantApproval.role')}</th>
              <th>{t('merchantApproval.moiValidation')}</th>
              <th>{t('merchantApproval.sellerInfo')}</th>
              <th>{t('merchantApproval.joined')}</th>
              <th>{t('merchantApproval.status')}</th>
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
                      ? <span className="badge badge-gray">{t('merchantApproval.na')}</span>
                      : u.citizen_valid
                        ? <span className="badge badge-success">{t('merchantApproval.valid')}</span>
                        : <span className="badge badge-danger">{t('merchantApproval.invalid')}</span>}
                  </td>
                  <td style={{ maxWidth: 220, fontSize: '.85rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {u.seller_information || t('merchantApproval.na')}
                  </td>
                  <td style={{ fontSize: '.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : t('merchantApproval.na')}
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
