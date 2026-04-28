import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { useTranslation } from 'react-i18next';

function BoothSelectionPage() {
  const [booths, setBooths] = useState([]);
  const { user } = useAuth();
  const [form, setForm] = useState({ booth_number: '', size: '', price: '', location: '', electricity: false, outlets: 0, water_supply: false, type: 'INDOOR', duration_type: 'SHORT_TERM', classification: 'FIXED' });
  const [editingId, setEditingId] = useState(null);
  const query = new URLSearchParams(useLocation().search);
  const eventId = query.get('event');
  const eventName = query.get('eventName');
  const { t } = useTranslation();

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
      alert(t('booths.addFailed'));
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
    if (!window.confirm(t('booths.deleteConfirm'))) return;
    try {
      await api.delete(`/booths/${boothId}`);
      setBooths((prev) => prev.filter((b) => b.booth_id !== boothId));
    } catch (err) {
      console.error('Failed to delete booth', err);
      alert(t('booths.deleteFailed'));
    }
  }

  const navigate = useNavigate();

  async function reserveBooth(boothId) {
    if (!window.confirm(t('booths.reserveConfirm'))) return;
    try {
      const resp = await api.post('/reservations', {
        booth_id: boothId,
        reservation_type: 'SHORT_TERM',
      });
        const reservationId = resp.data.reservation_id;
      alert(t('booths.reserveSuccess'));
      // refresh booths to reflect reserved status
      const list = await api.get(`/events/${eventId}/booths`);
      setBooths(list.data);
      // navigate merchant to reservations page and focus the new reservation so they can pay
      if (user && user.role === 'MERCHANT') {
          navigate(`/reservations?focus=${reservationId}`);
      }
    } catch (err) {
      console.error('Failed to reserve booth', err);
      alert(err?.response?.data?.detail || t('booths.reserveFailed'));
    }
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>{t('booths.title')} — {eventName || `Event ${eventId}`}</h2>
      </div>

      {booths.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🏪</div>
          {t('booths.noBooths')}
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
                <span>{b.type === 'INDOOR' ? t('booths.indoor') : t('booths.outdoor')}</span>
                <span>{b.classification}</span>
                {b.electricity && <span>{t('booths.electricity')} ({b.outlets} {t('booths.outlets')})</span>}
                {b.water_supply && <span>{t('booths.water')}</span>}
              </div>
              <div className="booth-card-actions">
                {isMerchant && b.status === 'AVAILABLE' && (
                  <button className="btn btn-success btn-sm" onClick={() => reserveBooth(b.booth_id)}>{t('booths.reserve')}</button>
                )}
                {isManager && (
                  <>
                    <button className="btn btn-secondary btn-sm" onClick={() => startEditBooth(b)}>{t('events.edit')}</button>
                    <button className="btn btn-danger btn-sm" onClick={() => removeBooth(b.booth_id)}>{t('booths.deleteBooth')}</button>
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
            <h3>{editingId ? t('booths.editBooth') : t('booths.addBooth')}</h3>
          </div>
          <div className="panel-body">
            <form onSubmit={addBooth}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t('booths.boothNumber')}</label>
                  <input className="form-control" placeholder={t('booths.boothNumberPlaceholder')} value={form.booth_number} onChange={(e) => setForm({ ...form, booth_number: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('booths.size')}</label>
                  <input className="form-control" placeholder={t('booths.sizePlaceholder')} value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t('booths.price')}</label>
                  <input className="form-control" type="number" step="0.01" placeholder={t('booths.pricePlaceholder')} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('booths.location')}</label>
                  <input className="form-control" placeholder={t('booths.locationPlaceholder')} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t('booths.type')}</label>
                  <select className="form-control" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="INDOOR">{t('booths.typeIndoor')}</option>
                    <option value="OUTDOOR">{t('booths.typeOutdoor')}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('booths.duration')}</label>
                  <select className="form-control" value={form.duration_type} onChange={(e) => setForm({ ...form, duration_type: e.target.value })}>
                    <option value="SHORT_TERM">{t('booths.shortTerm')}</option>
                    <option value="LONG_TERM">{t('booths.longTerm')}</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{t('booths.classification')}</label>
                <select className="form-control" style={{ maxWidth: 200 }} value={form.classification} onChange={(e) => setForm({ ...form, classification: e.target.value })}>
                  <option value="FIXED">{t('booths.fixed')}</option>
                  <option value="TEMPORARY">{t('booths.temporary')}</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <label className="form-check">
                  <input type="checkbox" checked={form.electricity} onChange={(e) => setForm({ ...form, electricity: e.target.checked })} />
                  <span>{t('booths.electricityLabel')}</span>
                </label>
                {form.electricity && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <label className="form-label" style={{ margin: 0 }}>{t('booths.outletsLabel')}</label>
                    <input className="form-control" type="number" value={form.outlets} onChange={(e) => setForm({ ...form, outlets: e.target.value })} style={{ width: 80 }} />
                  </div>
                )}
                <label className="form-check">
                  <input type="checkbox" checked={form.water_supply} onChange={(e) => setForm({ ...form, water_supply: e.target.checked })} />
                  <span>{t('booths.waterSupply')}</span>
                </label>
              </div>
              <div style={{ display: 'flex', gap: '.75rem' }}>
                <button type="submit" className="btn btn-primary">{editingId ? t('booths.saveChanges') : t('booths.addBoothBtn')}</button>
                {editingId && (
                  <button type="button" className="btn btn-secondary" onClick={() => { setEditingId(null); setForm({ booth_number: '', size: '', price: '', location: '', electricity: false, outlets: 0, water_supply: false, type: 'INDOOR', duration_type: 'SHORT_TERM', classification: 'FIXED' }); }}>
                    {t('booths.cancel')}
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
