import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

function BoothSelectionPage() {
  const [booths, setBooths] = useState([]);
  const { user } = useAuth();
  const [form, setForm] = useState({ booth_number: '', size: '', price: '', location: '', electricity: false, outlets: 0, water_supply: false, type: 'INDOOR', duration_type: 'SHORT_TERM', classification: 'FIXED' });
  const [editingId, setEditingId] = useState(null);
  const query = new URLSearchParams(useLocation().search);
  const eventId = query.get('event');

  useEffect(() => {
    if (!eventId) return;
    async function load() {
      try {
        const resp = await api.get(`/events/${eventId}/booths`);
        setBooths(resp.data);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [eventId]);

  const isManager = user && user.role === 'BOOTH_MANAGER';
  const isMerchant = user && user.role === 'MERCHANT';

  async function addBooth(e) {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/booths/${editingId}`, {
          event_id: eventId,
          booth_number: form.booth_number,
          size: form.size,
          price: parseFloat(form.price || 0),
          location: form.location,
          electricity: form.electricity,
          outlets: parseInt(form.outlets || 0),
          water_supply: form.water_supply,
          type: form.type,
          duration_type: form.duration_type,
          classification: form.classification,
        });
      } else {
        await api.post('/booths', {
          event_id: eventId,
          booth_number: form.booth_number,
          size: form.size,
          price: parseFloat(form.price || 0),
          location: form.location,
          electricity: form.electricity,
          outlets: parseInt(form.outlets || 0),
          water_supply: form.water_supply,
          type: form.type,
          duration_type: form.duration_type,
          classification: form.classification,
        });
      }
      const resp = await api.get(`/events/${eventId}/booths`);
      setBooths(resp.data);
      setForm({ booth_number: '', size: '', price: '', location: '', electricity: false, outlets: 0, water_supply: false, type: 'INDOOR', duration_type: 'SHORT_TERM', classification: 'FIXED' });
      setEditingId(null);
    } catch (err) {
      console.error('Failed to add booth', err);
      alert('Failed to add booth');
    }
  }

  function startEditBooth(b) {
    setEditingId(b.booth_id);
    setForm({
      booth_number: b.booth_number || '',
      size: b.size || '',
      price: b.price || 0,
      location: b.location || '',
      electricity: !!b.electricity,
      outlets: b.outlets || 0,
      water_supply: !!b.water_supply,
      type: b.type || 'INDOOR',
      duration_type: b.duration_type || 'SHORT_TERM',
      classification: b.classification || 'FIXED',
    });
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }

  async function removeBooth(boothId) {
    if (!window.confirm('Delete this booth?')) return;
    try {
      await api.delete(`/booths/${boothId}`);
      setBooths((prev) => prev.filter((b) => b.booth_id !== boothId));
    } catch (err) {
      console.error('Failed to delete booth', err);
      alert('Failed to delete booth');
    }
  }

  const navigate = useNavigate();

  async function reserveBooth(boothId) {
    if (!window.confirm('Reserve this booth?')) return;
    try {
      const resp = await api.post('/reservations', {
        booth_id: boothId,
        reservation_type: 'SHORT_TERM',
      });
        const reservationId = resp.data.reservation_id;
      alert('Reservation created (pending payment)');
      // refresh booths to reflect reserved status
      const list = await api.get(`/events/${eventId}/booths`);
      setBooths(list.data);
      // navigate merchant to reservations page and focus the new reservation so they can pay
      if (user && user.role === 'MERCHANT') {
          navigate(`/reservations?focus=${reservationId}`);
      }
    } catch (err) {
      console.error('Failed to reserve booth', err);
      alert(err?.response?.data?.detail || 'Failed to reserve booth');
    }
  }

  return (
    <div>
      <h2>Booths for Event {eventId}</h2>
      <ul>
        {booths.map((b) => (
          <li key={b.booth_id} style={{ marginBottom: '0.5rem' }}>
            {b.booth_number} - {b.status} - {b.size} - {b.price}
            <div style={{ fontSize: '0.9em' }}>
              <span>Type: {b.type || 'N/A'}</span> | <span>Classification: {b.classification || 'N/A'}</span> | <span>Electricity: {b.electricity ? 'Yes' : 'No'}</span> | <span>Water: {b.water_supply ? 'Yes' : 'No'}</span> | <span>Outlets: {b.outlets ?? '0'}</span>
            </div>
            {isManager && (
              <button style={{ marginLeft: '0.5rem' }} onClick={() => removeBooth(b.booth_id)}>Delete</button>
            )}
            {isManager && (
              <button style={{ marginLeft: '0.5rem' }} onClick={() => startEditBooth(b)}>Edit</button>
            )}
            {isMerchant && b.status === 'AVAILABLE' && (
              <button style={{ marginLeft: '0.5rem' }} onClick={() => reserveBooth(b.booth_id)}>Reserve</button>
            )}
          </li>
        ))}
      </ul>

      {isManager && (
        <form onSubmit={addBooth} style={{ marginTop: '1rem' }}>
          <h3>{editingId ? 'Edit Booth' : 'Add Booth'}</h3>
          <div>
            <label>Booth Number: </label>
            <input value={form.booth_number} onChange={(e) => setForm({ ...form, booth_number: e.target.value })} required />
          </div>
          <div>
            <label>Size: </label>
            <input value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} required />
          </div>
          <div>
            <label>Price: </label>
            <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            </div>
            <div>
              <label>Location: </label>
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div>
              <label>Electricity: </label>
              <input type="checkbox" checked={form.electricity} onChange={(e) => setForm({ ...form, electricity: e.target.checked })} />
              <label style={{ marginLeft: '1rem' }}>Outlets: </label>
              <input type="number" value={form.outlets} onChange={(e) => setForm({ ...form, outlets: e.target.value })} style={{ width: '80px' }} />
            </div>
            <div>
              <label>Water supply: </label>
              <input type="checkbox" checked={form.water_supply} onChange={(e) => setForm({ ...form, water_supply: e.target.checked })} />
            </div>
            <div>
              <label>Type: </label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="INDOOR">Indoor</option>
                <option value="OUTDOOR">Outdoor</option>
              </select>
            </div>
            <div>
              <label>Reservation duration: </label>
              <select value={form.duration_type} onChange={(e) => setForm({ ...form, duration_type: e.target.value })}>
                <option value="SHORT_TERM">Short-term</option>
                <option value="LONG_TERM">Long-term</option>
              </select>
            </div>
            <div>
              <label>Classification: </label>
              <select value={form.classification} onChange={(e) => setForm({ ...form, classification: e.target.value })}>
                <option value="FIXED">Fixed</option>
                <option value="TEMPORARY">Temporary</option>
              </select>
            </div>
          <button type="submit">Add Booth</button>
            {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ booth_number: '', size: '', price: '', location: '', electricity: false, outlets: 0, water_supply: false, type: 'INDOOR', duration_type: 'SHORT_TERM', classification: 'FIXED' }); }}>Cancel Edit</button>}
        </form>
      )}
    </div>
  );
}

export default BoothSelectionPage;
