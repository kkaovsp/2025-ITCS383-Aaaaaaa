import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../services/AuthContext';

function PaymentPage() {
  const [payments, setPayments] = useState([]);
  const { user } = useAuth();
  const [fileMap, setFileMap] = useState({});

  useEffect(() => {
    async function load() {
      const resp = await api.get('/payments');
      setPayments(resp.data);
    }
    load();
  }, []);

  async function uploadSlip(paymentId) {
    const file = fileMap[paymentId];
    if (!file) return alert('Select a file first');
    const form = new FormData();
    form.append('file', file, file.name);
    try {
      await api.post(`/payments/upload-slip?payment_id=${paymentId}`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('Slip uploaded');
      const resp = await api.get('/payments');
      setPayments(resp.data);
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    }
  }

  async function approve(paymentId) {
    try {
      await api.patch(`/payments/${paymentId}/approve`);
      alert('Payment approved');
      const resp = await api.get('/payments');
      setPayments(resp.data);
    } catch (err) {
      console.error(err);
      alert('Approve failed');
    }
  }

  return (
    <div>
      <h2>Your Payments</h2>
      <ul>
        {payments.map((p) => (
          <li key={p.payment_id} style={{ marginBottom: '0.5rem' }}>
            ${p.amount} - {p.payment_status} - Method: {p.method} {p.slip_url && <span>(slip uploaded)</span>}
            {user && user.role === 'BOOTH_MANAGER' && (
              <button style={{ marginLeft: '0.5rem' }} onClick={() => approve(p.payment_id)}>Approve</button>
            )}
            {p.method === 'BANK_TRANSFER' && (!p.slip_url) && user && user.role === 'MERCHANT' && (
              <div style={{ marginTop: '0.25rem' }}>
                <input type="file" onChange={(e) => setFileMap({ ...fileMap, [p.payment_id]: e.target.files[0] })} />
                <button onClick={() => uploadSlip(p.payment_id)}>Upload Slip</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PaymentPage;
