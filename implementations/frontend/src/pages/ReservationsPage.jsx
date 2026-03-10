import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchReservations, createPayment, getMe } from "../services/api";

export default function ReservationsPage({ token }) {
  const [reservations, setReservations] = useState([]);
  const [me, setMe] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    getMe()
      .then(setMe)
      .catch(() => setError("Unable to fetch user info"));

    fetchReservations(token)
      .then(setReservations)
      .catch(() => setError("Unable to load reservations"));
  }, [token]);

  const handlePayment = async (reservationId, amount) => {
    if (!me) return;

    try {
      await createPayment(
        {
          reservation_id: reservationId,
          amount,
          method: "CREDIT_CARD",
        },
        token
      );
      setSuccess("Payment created. Wait for approval.");
      setTimeout(() => setSuccess(null), 2500);
    } catch (err) {
      setError("Unable to create payment");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => navigate(-1)}>← Back</button>
      <h2>My Reservations</h2>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {success && <div style={{ color: "green" }}>{success}</div>}
      {reservations.length === 0 ? (
        <p>No reservations yet. Book a booth from an event.</p>
      ) : (
        <ul>
          {reservations.map((res) => (
            <li key={res.reservation_id} style={{ marginBottom: 16 }}>
              <div>
                <strong>Reservation:</strong> {res.reservation_id}
              </div>
              <div>Status: {res.status}</div>
              <div>Type: {res.reservation_type}</div>
              <div style={{ marginTop: 8 }}>
                <button onClick={() => handlePayment(res.reservation_id, 0)}>
                  Create Payment (mock)
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
