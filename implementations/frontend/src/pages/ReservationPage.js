import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../services/AuthContext';
import { useLocation } from 'react-router-dom';

function ReservationPage() {
  const [reservations, setReservations] = useState([]);
  const [payForm, setPayForm] = useState({ reservation_id: '', amount: '', method: 'BANK_TRANSFER' });
  const { user } = useAuth();
  const location = useLocation();

  async function load() {
    try {
      const resp = await api.get('/reservations');
      setReservations(resp.data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => { load(); }, []);
  // if opened with ?focus=<reservation_id>, prefill pay form
  const { search } = useLocation();
  useEffect(() => {
    const q = new URLSearchParams(search);
    const focus = q.get('focus');
    if (focus) {
      // try to find the reservation in current list (or reload)
      (async () => {
        await load();
        const found = reservations.find((r) => r.reservation_id === focus);
        if (found) {
          setPayForm({ reservation_id: found.reservation_id, amount: found.booth?.price ?? '', method: 'BANK_TRANSFER' });
          window.scrollTo(0, 0);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    // handled by the search-based effect above which sets `payForm`
  }, [location.search, reservations]);

  async function createPayment(e) {
    e.preventDefault();
    try {
      await api.post('/payments', {
        reservation_id: payForm.reservation_id,
        amount: parseFloat(payForm.amount),
        method: payForm.method,
      });
      alert('Payment record created. If bank transfer, upload slip on Payments page.');
      setPayForm({ reservation_id: '', amount: '', method: 'BANK_TRANSFER' });
      load();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || 'Failed to create payment');
    }
  }

  async function approveReservation(resId) {
    if (!window.confirm('Confirm reservation?')) return;
    try {
      await api.patch(`/reservations/${resId}/confirm`);
      alert('Reservation confirmed');
      load();
    } catch (err) {
      console.error(err);
      alert('Failed to confirm reservation');
    }
  }

  async function cancelReservation(resId) {
    if (!window.confirm('Cancel this reservation?')) return;
    try {
      await api.patch(`/reservations/${resId}/cancel`);
      alert('Reservation cancelled');
      load();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || 'Failed to cancel reservation');
    }
  }

  function statusBadge(status) {
    const map = { PENDING_PAYMENT: 'badge-warning', WAITING_FOR_APPROVAL: 'badge-info', CONFIRMED: 'badge-success', CANCELLED: 'badge-danger' };
    return <span className={`badge ${map[status] || 'badge-gray'}`}>{status?.replace(/_/g, ' ')}</span>;
  }

  return (
    <div className="page-content">
      <div className="page-header"><h2>📋 Your Reservations</h2></div>

      {reservations.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          No reservations found. <a href="/events">Browse events</a> to get started.
        </div>
      )}

      {reservations.map((r) => (
        <div key={r.reservation_id} className="reservation-item">
          <div className="reservation-item-info">
            <div style={{ fontWeight: 700, marginBottom: '.25rem' }}>
              Booth #{r.booth?.booth_number || r.booth_id}
            </div>
            <div style={{ fontSize: '.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
              {statusBadge(r.status)}
              {r.booth?.price != null && <span>💰 ${r.booth.price}</span>}
              {r.reservation_id && <span style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>ID: {r.reservation_id}</span>}
            </div>
          </div>
          <div className="reservation-item-actions">
            {user && user.role === 'BOOTH_MANAGER' && r.status === 'WAITING_FOR_APPROVAL' && (
              <button className="btn btn-success btn-sm" onClick={() => approveReservation(r.reservation_id)}>Confirm</button>
            )}
            {user && user.role === 'MERCHANT' && r.status === 'PENDING_PAYMENT' && (
              <>
                <button className="btn btn-primary btn-sm" onClick={() => setPayForm({ ...payForm, reservation_id: r.reservation_id, amount: r.booth?.price ?? '' })}>Pay</button>
                <button className="btn btn-danger btn-sm" onClick={() => cancelReservation(r.reservation_id)}>Cancel</button>
              </>
            )}
          </div>
        </div>
      ))}

      {user && user.role === 'MERCHANT' && (
        <div className="panel" style={{ marginTop: '2rem', maxWidth: 480 }}>
          <div className="panel-header"><h3>💳 Create Payment</h3></div>
          <div className="panel-body">
            <form onSubmit={createPayment}>
              <div className="form-group">
                <label className="form-label">Reservation ID</label>
                <input className="form-control" placeholder="Reservation ID" value={payForm.reservation_id} onChange={(e) => setPayForm({ ...payForm, reservation_id: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Amount (THB)</label>
                <input className="form-control" type="number" step="0.01" placeholder="0.00" value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select className="form-control" value={payForm.method} onChange={(e) => setPayForm({ ...payForm, method: e.target.value })}>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="TRUEMONEY">TrueMoney Wallet</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary">Submit Payment</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReservationPage;
