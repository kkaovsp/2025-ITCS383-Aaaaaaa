import React, { useEffect, useState } from 'react';
import api from '../services/api';

function ReservationPage() {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    async function load() {
      const resp = await api.get('/reservations');
      setReservations(resp.data);
    }
    load();
  }, []);

  return (
    <div>
      <h2>Your Reservations</h2>
      <ul>
        {reservations.map((r) => (
          <li key={r.reservation_id}>Booth {r.booth_id} - {r.status}</li>
        ))}
      </ul>
    </div>
  );
}

export default ReservationPage;
