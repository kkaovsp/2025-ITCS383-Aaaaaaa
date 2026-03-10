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

  return (
    <div>
      <h2>Your Reservations</h2>
      <ul>
        {reservations.map((r) => (
          <li key={r.reservation_id} style={{ marginBottom: '0.5rem' }}>
            Booth: {r.booth?.booth_number || r.booth_id} &nbsp;|&nbsp; Status: {r.status} &nbsp;|&nbsp; Price: ${r.booth?.price ?? 'N/A'}
            {user && user.role === 'BOOTH_MANAGER' && r.status === 'WAITING_FOR_APPROVAL' && (
              <button style={{ marginLeft: '0.5rem' }} onClick={() => approveReservation(r.reservation_id)}>Confirm</button>
            )}
            {user && user.role === 'MERCHANT' && r.status === 'PENDING_PAYMENT' && (
              <>
                <button style={{ marginLeft: '0.5rem' }} onClick={() => setPayForm({ ...payForm, reservation_id: r.reservation_id, amount: r.booth?.price ?? '' })}>Pay</button>
                <button style={{ marginLeft: '0.5rem' }} onClick={() => cancelReservation(r.reservation_id)}>Cancel</button>
              </>
            )}
          </li>
        ))}
      </ul>

      {user && user.role === 'MERCHANT' && (
        <form onSubmit={createPayment} style={{ marginTop: '1rem' }}>
          <h3>Create Payment (Merchant)</h3>
          <div>
            <label>Reservation ID:</label>
            <input value={payForm.reservation_id} onChange={(e) => setPayForm({ ...payForm, reservation_id: e.target.value })} required />
          </div>
          <div>
            <label>Amount:</label>
            <input type="number" step="0.01" value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} required />
          </div>
          <div>
            <label>Method:</label>
            <select value={payForm.method} onChange={(e) => setPayForm({ ...payForm, method: e.target.value })}>
              <option value="CREDIT_CARD">Credit Card</option>
              <option value="TRUEMONEY">TrueMoney Wallet</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
            </select>
          </div>
          <button type="submit">Create Payment</button>
        </form>
      )}
    </div>
  );
}

export default ReservationPage;
