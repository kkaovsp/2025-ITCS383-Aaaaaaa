import React, { useEffect, useState } from 'react';
import api from '../services/api';

function MerchantApprovalPage() {
  const [merchants, setMerchants] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const resp = await api.get('/merchants/pending');
        setMerchants(resp.data);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const approve = async (id) => {
    try {
      await api.patch(`/merchants/${id}/approve`);
      setMerchants((m) => m.filter((x) => x.merchant_id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Merchant Approvals</h2>
      <ul>
        {merchants.map((m) => (
          <li key={m.merchant_id}>
            {m.user_id} - {m.approval_status}{' '}
            <button onClick={() => approve(m.merchant_id)}>Approve</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MerchantApprovalPage;
