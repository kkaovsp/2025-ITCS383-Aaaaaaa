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
  const eventName = query.get('eventName');

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
    <div className="page-content">
      <div className="page-header">
        <h2>🏪 Booths — {eventName || `Event ${eventId}`}</h2>
      </div>

      {booths.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🏪</div>
          No booths have been added to this event yet.
        </div>
      )}

      <div className="booth-grid">
        {booths.map((b) => {
          const statusCls = b.status === 'AVAILABLE' ? 'available' : b.status === 'RESERVED' ? 'reserved' : 'unavailable';
          const badgeCls  = b.status === 'AVAILABLE' ? 'badge-success' : b.status === 'RESERVED' ? 'badge-warning' : 'badge-gray';
          return (
            <div key={b.booth_id} className={`booth-card ${statusCls}`}>
              <div className="booth-card-header">
                <span className="booth-card-number">#{b.booth_number}</span>
                <span className={`badge ${badgeCls}`}>{b.status}</span>
              </div>
              <div className="booth-card-price">${b.price}</div>
              <div className="booth-card-meta">
                <span>📏 {b.size}</span>
                {b.location && <span>📍 {b.location}</span>}
                <span>{b.type === 'INDOOR' ? '🏠 Indoor' : '🌳 Outdoor'}</span>
                <span>{b.classification}</span>
                {b.electricity && <span>⚡ Electricity ({b.outlets} outlets)</span>}
                {b.water_supply && <span>💧 Water</span>}
              </div>
              <div className="booth-card-actions">
                {isMerchant && b.status === 'AVAILABLE' && (
                  <button className="btn btn-success btn-sm" onClick={() => reserveBooth(b.booth_id)}>Reserve</button>
                )}
                {isManager && (
                  <>
                    <button className="btn btn-secondary btn-sm" onClick={() => startEditBooth(b)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => removeBooth(b.booth_id)}>Delete</button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isManager && (
        <div className="panel" style={{ marginTop: '2rem', maxWidth: 620 }}>
          <div className="panel-header">
            <h3>{editingId ? '✏️ Edit Booth' : '➕ Add Booth'}</h3>
          </div>
          <div className="panel-body">
            <form onSubmit={addBooth}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Booth Number</label>
                  <input className="form-control" placeholder="e.g. A-01" value={form.booth_number} onChange={(e) => setForm({ ...form, booth_number: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Size</label>
                  <input className="form-control" placeholder="e.g. 3x3m" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Price (THB)</label>
                  <input className="form-control" type="number" step="0.01" placeholder="0.00" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input className="form-control" placeholder="e.g. Zone B, Row 2" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="form-control" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="INDOOR">Indoor</option>
                    <option value="OUTDOOR">Outdoor</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Duration</label>
                  <select className="form-control" value={form.duration_type} onChange={(e) => setForm({ ...form, duration_type: e.target.value })}>
                    <option value="SHORT_TERM">Short-term</option>
                    <option value="LONG_TERM">Long-term</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Classification</label>
                <select className="form-control" style={{ maxWidth: 200 }} value={form.classification} onChange={(e) => setForm({ ...form, classification: e.target.value })}>
                  <option value="FIXED">Fixed</option>
                  <option value="TEMPORARY">Temporary</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <label className="form-check">
                  <input type="checkbox" checked={form.electricity} onChange={(e) => setForm({ ...form, electricity: e.target.checked })} />
                  <span>Electricity</span>
                </label>
                {form.electricity && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <label className="form-label" style={{ margin: 0 }}>Outlets:</label>
                    <input className="form-control" type="number" value={form.outlets} onChange={(e) => setForm({ ...form, outlets: e.target.value })} style={{ width: 80 }} />
                  </div>
                )}
                <label className="form-check">
                  <input type="checkbox" checked={form.water_supply} onChange={(e) => setForm({ ...form, water_supply: e.target.checked })} />
                  <span>Water Supply</span>
                </label>
              </div>
              <div style={{ display: 'flex', gap: '.75rem' }}>
                <button type="submit" className="btn btn-primary">{editingId ? 'Save Changes' : 'Add Booth'}</button>
                {editingId && (
                  <button type="button" className="btn btn-secondary" onClick={() => { setEditingId(null); setForm({ booth_number: '', size: '', price: '', location: '', electricity: false, outlets: 0, water_supply: false, type: 'INDOOR', duration_type: 'SHORT_TERM', classification: 'FIXED' }); }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BoothSelectionPage;
