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
    <div>
      <h2>Notifications</h2>
      <ul>
        {notes.map((n) => (
          <li key={n.notification_id} style={{ fontWeight: n.is_read ? 'normal' : 'bold' }}>
            {n.title}: {n.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NotificationsPage;
