import React, { useEffect, useState } from 'react';
import api from '../services/api';

function NotificationsPage() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    async function load() {
      const resp = await api.get('/notifications');
      setNotes(resp.data);
    }
    load();
  }, []);

  return (
    <div className="page-content">
      <div className="page-header"><h2>🔔 Notifications</h2></div>
      {notes.length === 0 && (
        <div className="empty-state"><div className="empty-state-icon">🔔</div>No notifications yet.</div>
      )}
      <div className="panel" style={{ maxWidth: 640 }}>
        {notes.map((n) => (
          <div key={n.notification_id} className={`notif-item ${n.is_read ? '' : 'unread'}`}>
            <div className="notif-item-title">{n.title}</div>
            <div className="notif-item-msg">{n.message}</div>
            {!n.is_read && <span className="badge badge-info" style={{ marginTop: '.35rem', display: 'inline-block' }}>Unread</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default NotificationsPage;
