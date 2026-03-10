import React, { useEffect, useState } from 'react';
import api from '../services/api';

function PaymentPage() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    async function load() {
      const resp = await api.get('/payments');
      setPayments(resp.data);
    }
    load();
  }, []);

  return (
    <div>
      <h2>Your Payments</h2>
      <ul>
        {payments.map((p) => (
          <li key={p.payment_id}>${p.amount} - {p.payment_status}</li>
        ))}
      </ul>
    </div>
  );
}

export default PaymentPage;
