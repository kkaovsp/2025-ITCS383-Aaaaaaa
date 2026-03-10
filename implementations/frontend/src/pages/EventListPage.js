import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

function EventListPage() {
  const [events, setEvents] = useState([]);
  const { user } = useAuth();
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', location: '', start_date: '', end_date: '' });

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
      alert('Failed to update event');
    }
  }

  async function deleteEvent(eventId) {
    if (!window.confirm('Delete this event and all related booths/reservations?')) return;
    try {
      await api.delete(`/events/${eventId}`);
      const resp = await api.get('/events');
      setEvents(resp.data);
    } catch (err) {
      console.error('Failed to delete event', err);
      alert('Failed to delete event');
    }
  }

  const isManager = user && user.role === 'BOOTH_MANAGER';

  return (
    <div>
      <h2>Events</h2>
      <ul>
        {events.map((e) => (
          <li key={e.event_id} style={{ marginBottom: '1rem' }}>
            {editingId === e.event_id ? (
              <div>
                <div>
                  <label>Name: </label>
                  <input value={form.name} onChange={(ev) => setForm({ ...form, name: ev.target.value })} />
                </div>
                <div>
                  <label>Location: </label>
                  <input value={form.location} onChange={(ev) => setForm({ ...form, location: ev.target.value })} />
                </div>
                <div>
                  <label>Start: </label>
                  <input type="date" value={form.start_date} onChange={(ev) => setForm({ ...form, start_date: ev.target.value })} />
                </div>
                <div>
                  <label>End: </label>
                  <input type="date" value={form.end_date} onChange={(ev) => setForm({ ...form, end_date: ev.target.value })} />
                </div>
                <div>
                  <label>Description: </label>
                  <input value={form.description} onChange={(ev) => setForm({ ...form, description: ev.target.value })} />
                </div>
                <button onClick={() => saveEdit(e.event_id)}>Save</button>
                <button onClick={cancelEdit}>Cancel</button>
              </div>
            ) : (
              <div>
                <strong>{e.name}</strong> &nbsp;({e.start_date} - {e.end_date})<br />
                {e.location && <span>Location: {e.location}<br/></span>}
                {e.description && <span>{e.description}<br/></span>}
                <span>Created by: {e.created_by}</span><br />
                <Link to={`/booths?event=${e.event_id}`}><button>View Booths</button></Link>
                {isManager && <button onClick={() => startEdit(e)}>Edit</button>}
                {isManager && <button onClick={() => deleteEvent(e.event_id)} style={{ marginLeft: '0.5rem', color: 'red' }}>Delete</button>}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default EventListPage;
