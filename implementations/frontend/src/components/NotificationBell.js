import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';

function NotificationBell() {
  const [notes, setNotes] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const resp = await api.get('/notifications');
        setNotes(resp.data);
      } catch (err) {
        setNotes([]);
      }
    }
    load();
  }, []);

  const unread = notes.filter((n) => !n.is_read).length;

  async function markRead(id) {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotes((prev) => prev.map((n) => (n.notification_id === id ? { ...n, is_read: true } : n)));
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div style={{ display: 'inline-block', position: 'relative', marginLeft: '1rem' }}>
      <button onClick={() => setOpen((v) => !v)}>🔔{unread > 0 ? ` (${unread})` : ''}</button>
      {open && (
        <div style={{ position: 'absolute', right: 0, background: 'white', border: '1px solid #ccc', padding: '0.5rem', width: '300px', zIndex: 1000 }}>
          <div style={{ maxHeight: '300px', overflow: 'auto' }}>
            {notes.length === 0 && <div>No notifications</div>}
            {notes.map((n) => (
              <div key={n.notification_id} style={{ padding: '0.25rem', borderBottom: '1px solid #eee' }}>
                <div style={{ fontWeight: n.is_read ? 'normal' : 'bold' }}>{n.title}</div>
                <div style={{ fontSize: '0.9em' }}>{n.message}</div>
                <div style={{ marginTop: '0.25rem' }}>
                  {!n.is_read && <button onClick={() => markRead(n.notification_id)}>Mark read</button>}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <Link to="/notifications">View all</Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
