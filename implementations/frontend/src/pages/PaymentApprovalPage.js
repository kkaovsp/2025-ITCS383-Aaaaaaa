import React, { useEffect, useState } from 'react';
import api from '../services/api';

function PaymentApprovalPage() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const resp = await api.get('/payments');
        setPayments(resp.data.filter((p) => p.payment_status === 'PENDING'));
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const approve = async (id) => {
    try {
      await api.patch(`/payments/${id}/approve`);
      setPayments((p) => p.filter((x) => x.payment_id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-content">
      <div className="page-header"><h2>✅ Payment Approvals</h2></div>
      {payments.length === 0 && (
        <div className="empty-state"><div className="empty-state-icon">✅</div>No pending payments.</div>
      )}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Payment ID</th>
              <th>Reservation ID</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.payment_id}>
                <td style={{ color: 'var(--text-muted)', fontSize: '.8rem' }}>{p.payment_id}</td>
                <td>{p.reservation_id}</td>
                <td style={{ fontWeight: 700 }}>${p.amount}</td>
                <td><span className="badge badge-warning">PENDING</span></td>
                <td>
                  <button className="btn btn-success btn-sm" onClick={() => approve(p.payment_id)}>Approve</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PaymentApprovalPage;
