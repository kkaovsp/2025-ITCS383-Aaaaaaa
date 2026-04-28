import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { useTranslation } from 'react-i18next';

function EventListPage() {
  const [events, setEvents] = useState([]);
  const { user } = useAuth();
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', location: '', start_date: '', end_date: '' });
  const { t } = useTranslation();

  useEffect(() => {
    async function load() {
      try {
        const eventsResp = await api.get('/events');
        setEvents(eventsResp.data);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  function startEdit(e) {
    setEditingId(e.event_id);
    setForm({
      name: e.name || '',
      description: e.description || '',
      location: e.location || '',
      start_date: e.start_date || '',
      end_date: e.end_date || '',
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ name: '', description: '', location: '', start_date: '', end_date: '' });
  }

  async function saveEdit(eventId) {
    try {
      await api.put(`/events/${eventId}`, {
        name: form.name,
        description: form.description,
        location: form.location,
        start_date: form.start_date,
        end_date: form.end_date,
      });
      // refresh list
      const resp = await api.get('/events');
      setEvents(resp.data);
      cancelEdit();
    } catch (err) {
      console.error('Failed to update event', err);
      alert(t('events.updateFailed'));
    }
  }

  async function deleteEvent(eventId) {
    if (!window.confirm(t('events.deleteConfirm'))) return;
    try {
      await api.delete(`/events/${eventId}`);
      const resp = await api.get('/events');
      setEvents(resp.data);
    } catch (err) {
      console.error('Failed to delete event', err);
      alert(t('events.deleteFailed'));
    }
  }

  const isManager = user && user.role === 'BOOTH_MANAGER';

  function statusBadge(e) {
    const now = new Date();
    const start = new Date(e.start_date);
    const end = new Date(e.end_date);
    if (now < start) return <span className="badge badge-info">{t('events.upcoming')}</span>;
    if (now > end)   return <span className="badge badge-gray">{t('events.ended')}</span>;
    return <span className="badge badge-success">{t('events.ongoing')}</span>;
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>{t('events.title')}</h2>
        {isManager && <a href="/create-event" className="btn btn-primary btn-sm">{t('events.createEvent')}</a>}
      </div>
      {events.length === 0 && (
        <div className="empty-state"><div className="empty-state-icon">🎪</div>{t('events.noEvents')}</div>
      )}
      <div className="cards-grid">
        {events.map((e) => (
          <div key={e.event_id} className="card">
            {editingId === e.event_id ? (
              <div>
                <div className="form-group">
                  <label className="form-label">{t('events.name')}</label>
                  <input className="form-control" value={form.name} onChange={(ev) => setForm({ ...form, name: ev.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('events.location')}</label>
                  <input className="form-control" value={form.location} onChange={(ev) => setForm({ ...form, location: ev.target.value })} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">{t('events.startDate')}</label>
                    <input className="form-control" type="date" value={form.start_date} onChange={(ev) => setForm({ ...form, start_date: ev.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('events.endDate')}</label>
                    <input className="form-control" type="date" value={form.end_date} onChange={(ev) => setForm({ ...form, end_date: ev.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('events.description')}</label>
                  <input className="form-control" value={form.description} onChange={(ev) => setForm({ ...form, description: ev.target.value })} />
                </div>
                <div style={{ display: 'flex', gap: '.5rem' }}>
                  <button className="btn btn-primary btn-sm" onClick={() => saveEdit(e.event_id)}>{t('events.save')}</button>
                  <button className="btn btn-secondary btn-sm" onClick={cancelEdit}>{t('events.cancel')}</button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.5rem' }}>
                  <div className="card-title">{e.name}</div>
                  {statusBadge(e)}
                </div>
                <div className="card-meta">
                  {e.location && <span>📍 {e.location}</span>}
                  <span>📅 {e.start_date} – {e.end_date}</span>
                  <span>👤 {e.created_by_name || e.created_by}</span>
                </div>
                {e.description && <p style={{ fontSize: '.88rem', color: 'var(--text-secondary)', marginBottom: '.75rem' }}>{e.description}</p>}
                <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                  <Link to={`/booths?event=${e.event_id}&eventName=${encodeURIComponent(e.name || '')}`} className="btn btn-primary btn-sm">{t('events.viewBooths')}</Link>
                  {isManager && <button className="btn btn-secondary btn-sm" onClick={() => startEdit(e)}>{t('events.edit')}</button>}
                  {isManager && <button className="btn btn-danger btn-sm" onClick={() => deleteEvent(e.event_id)}>{t('events.delete')}</button>}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default EventListPage;
