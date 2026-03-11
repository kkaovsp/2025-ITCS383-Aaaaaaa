import React, { useEffect, useState } from 'react';
import api from '../services/api';

function PaymentApprovalPage() {
  const [payments, setPayments] = useState([]);
  const [validatedMap, setValidatedMap] = useState({});

  const fetchSlipBlob = async (paymentId, download = false) => {
    const resp = await api.get(`/payments/${paymentId}/slip${download ? '?download=true' : ''}`, {
      responseType: 'blob',
    });
    return {
      blob: resp.data,
      contentType: resp.headers?.['content-type'] || '',
      disposition: resp.headers?.['content-disposition'] || '',
    };
  };

  const guessFileName = (paymentId, disposition, contentType) => {
    const match = /filename="?([^";]+)"?/i.exec(disposition || '');
    if (match && match[1]) return match[1];
    if ((contentType || '').includes('pdf')) return `${paymentId}.pdf`;
    if ((contentType || '').includes('png')) return `${paymentId}.png`;
    if ((contentType || '').includes('jpeg')) return `${paymentId}.jpg`;
    if ((contentType || '').includes('webp')) return `${paymentId}.webp`;
    return `${paymentId}.bin`;
  };

  const viewSlip = async (paymentId) => {
    try {
      const { blob, contentType } = await fetchSlipBlob(paymentId, false);
      const url = window.URL.createObjectURL(new Blob([blob], { type: contentType || blob.type || 'application/octet-stream' }));
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || 'Failed to open slip file');
    }
  };

  const downloadSlip = async (paymentId) => {
    try {
      const { blob, contentType, disposition } = await fetchSlipBlob(paymentId, true);
      const fileName = guessFileName(paymentId, disposition, contentType);
      const url = window.URL.createObjectURL(new Blob([blob], { type: contentType || blob.type || 'application/octet-stream' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || 'Failed to download slip file');
    }
  };

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
      alert(err?.response?.data?.detail || 'Failed to approve payment');
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
              <th>Slip</th>
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
                  {p.method === 'BANK_TRANSFER'
                    ? (p.slip_url
                      ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap' }}>
                          <span className="badge badge-success">Uploaded</span>
                          <button className="btn btn-secondary btn-sm" onClick={() => viewSlip(p.payment_id)}>View Slip</button>
                          <button className="btn btn-primary btn-sm" onClick={() => downloadSlip(p.payment_id)}>Download</button>
                          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '.35rem', fontSize: '.8rem' }}>
                            <input
                              type="checkbox"
                              checked={!!validatedMap[p.payment_id]}
                              onChange={(e) => setValidatedMap((prev) => ({ ...prev, [p.payment_id]: e.target.checked }))}
                            />
                            Validated
                          </label>
                        </div>
                      )
                      : <span className="badge badge-danger">Missing</span>)
                    : <span className="badge badge-gray">N/A</span>}
                </td>
                <td>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => approve(p.payment_id)}
                    disabled={p.method === 'BANK_TRANSFER' && (!p.slip_url || !validatedMap[p.payment_id])}
                    title={
                      p.method === 'BANK_TRANSFER' && !p.slip_url
                        ? 'Slip is required before approval'
                        : (p.method === 'BANK_TRANSFER' && !validatedMap[p.payment_id]
                          ? 'Open and validate slip before approval'
                          : 'Approve payment')
                    }
                  >
                    Approve
                  </button>
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
