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
    <div>
      <h2>Payment Approvals</h2>
      <ul>
        {payments.map((p) => (
          <li key={p.payment_id}>
            {p.reservation_id} - {p.amount} <button onClick={() => approve(p.payment_id)}>Approve</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PaymentApprovalPage;
