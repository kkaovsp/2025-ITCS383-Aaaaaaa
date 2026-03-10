import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useLocation } from 'react-router-dom';

function BoothSelectionPage() {
  const [booths, setBooths] = useState([]);
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

  return (
    <div>
      <h2>Booths for Event {eventId}</h2>
      <ul>
        {booths.map((b) => (
          <li key={b.booth_id}>{b.booth_number} - {b.status}</li>
        ))}
      </ul>
    </div>
  );
}

export default BoothSelectionPage;
