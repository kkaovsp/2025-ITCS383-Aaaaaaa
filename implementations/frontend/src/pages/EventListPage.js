import React, { useEffect, useState } from 'react';
import api from '../services/api';

function EventListPage() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const resp = await api.get('/events');
        setEvents(resp.data);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  return (
    <div>
      <h2>Events</h2>
      <ul>
        {events.map((e) => (
          <li key={e.event_id}>{e.name} ({e.start_date} - {e.end_date})</li>
        ))}
      </ul>
    </div>
  );
}

export default EventListPage;
