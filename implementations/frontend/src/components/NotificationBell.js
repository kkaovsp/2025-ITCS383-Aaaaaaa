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
    <div className="notif-bell-wrapper">
      <button className="notif-bell-btn" onClick={() => setOpen((v) => !v)} aria-label="Notifications">
        🔔
        {unread > 0 && <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>}
      </button>
      {open && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-header">Notifications</div>
          <div className="notif-list">
            {notes.length === 0 && (
              <div style={{ padding: '1rem', color: 'var(--text-muted)', textAlign: 'center', fontSize: '.88rem' }}>No notifications</div>
            )}
            {notes.map((n) => (
              <div key={n.notification_id} className={`notif-item ${n.is_read ? '' : 'unread'}`}>
                <div className="notif-item-title">{n.title}</div>
                <div className="notif-item-msg">{n.message}</div>
                {!n.is_read && (
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ marginTop: '.35rem', fontSize: '.75rem', padding: '.2rem .55rem' }}
                    onClick={() => markRead(n.notification_id)}
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="notif-footer">
            <Link to="/notifications" onClick={() => setOpen(false)}>View all notifications</Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
