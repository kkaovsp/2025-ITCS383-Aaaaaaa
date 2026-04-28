import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../services/AuthContext';
import { useTranslation } from 'react-i18next';

function PaymentPage() {
  const [payments, setPayments] = useState([]);
  const { user } = useAuth();
  const [fileMap, setFileMap] = useState({});
  const { t } = useTranslation();

  useEffect(() => {
    async function load() {
      const resp = await api.get('/payments');
      setPayments(resp.data);
    }
    load();
  }, []);

  async function uploadSlip(paymentId) {
    const file = fileMap[paymentId];
    if (!file) return alert(t('payments.selectFile'));
    const form = new FormData();
    form.append('file', file, file.name);
    try {
      await api.post(`/payments/upload-slip?payment_id=${paymentId}`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert(t('payments.slipUploadedMsg'));
      const resp = await api.get('/payments');
      setPayments(resp.data);
    } catch (err) {
      console.error(err);
      alert(t('payments.uploadFailed'));
    }
  }

  async function approve(paymentId) {
    try {
      await api.patch(`/payments/${paymentId}/approve`);
      alert(t('payments.approved'));
      const resp = await api.get('/payments');
      setPayments(resp.data);
    } catch (err) {
      console.error(err);
      alert(t('payments.approveFailed'));
    }
  }

  function statusBadge(s) {
    const map = { PENDING: 'badge-warning', APPROVED: 'badge-success', REJECTED: 'badge-danger' };
    return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>;
  }
  function methodLabel(m) {
    return { CREDIT_CARD: t('payments.creditCard'), TRUEMONEY: t('payments.truemoney'), BANK_TRANSFER: t('payments.bankTransfer') }[m] || m;
  }

  return (
    <div className="page-content">
      <div className="page-header"><h2>{t('payments.title')}</h2></div>
      {payments.length === 0 && (
        <div className="empty-state"><div className="empty-state-icon">💳</div>{t('payments.noPayments')}</div>
      )}
      {payments.map((p) => (
        <div key={p.payment_id} className="payment-item">
          <div className="payment-item-header">
            <div>
              <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>${p.amount}</span>
              <span style={{ marginLeft: '.75rem', color: 'var(--text-secondary)', fontSize: '.88rem' }}>{methodLabel(p.method)}</span>
              {p.slip_url && <span className="badge badge-info" style={{ marginLeft: '.5rem' }}>{t('payments.slipUploaded')}</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
              {statusBadge(p.payment_status)}
              {user && user.role === 'BOOTH_MANAGER' && p.payment_status === 'PENDING' && (
                <button className="btn btn-success btn-sm" onClick={() => approve(p.payment_id)}>{t('payments.approve')}</button>
              )}
            </div>
          </div>
          {p.method === 'BANK_TRANSFER' && !p.slip_url && user && user.role === 'MERCHANT' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginTop: '.5rem', paddingTop: '.5rem', borderTop: '1px solid var(--border)' }}>
              <input type="file" accept="image/*,.pdf" onChange={(e) => setFileMap({ ...fileMap, [p.payment_id]: e.target.files[0] })} style={{ fontSize: '.85rem' }} />
              <button className="btn btn-primary btn-sm" onClick={() => uploadSlip(p.payment_id)}>{t('payments.uploadSlip')}</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default PaymentPage;
