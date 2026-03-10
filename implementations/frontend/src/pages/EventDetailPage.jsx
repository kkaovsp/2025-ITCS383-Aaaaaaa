import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchBoothsForEvent, createReservation, getMe, createBooth } from "../services/api";

export default function EventDetailPage({ token }) {
  const { eventId } = useParams();
  const [booths, setBooths] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [me, setMe] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    getMe()
      .then(setMe)
      .catch(() => setError("Unable to fetch user information"));

    fetchBoothsForEvent(eventId, token)
      .then(setBooths)
      .catch(() => setError("Unable to load booths"));
  }, [eventId, token]);

  const handleReserve = async (boothId) => {
    if (!me) {
      setError("Missing merchant information");
      return;
    }

    try {
      await createReservation(
        {
          booth_id: boothId,
          merchant_id: me.id,
          reservation_type: "SHORT_TERM",
        }
      );
      setSuccess("Reservation created successfully. Please proceed to payment.");
    } catch (err) {
      setError("Failed to create reservation");
    }
  };

  const handleAddBooth = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      event_id: eventId,
      booth_number: form.get("booth_number"),
      size: form.get("size"),
      price: parseFloat(form.get("price")),
      location: form.get("location"),
      type: form.get("type"),
      classification: form.get("classification"),
      duration_type: form.get("duration_type"),
      electricity: form.get("electricity") === "on",
      water_supply: form.get("water_supply") === "on",
      outlets: parseInt(form.get("outlets"), 10) || 0,
    };

    try {
      await createBooth(payload);
      setSuccess("Booth created.");
      setTimeout(() => setSuccess(null), 2000);
      fetchBoothsForEvent(eventId, token).then(setBooths);
    } catch {
      setError("Unable to create booth");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => navigate(-1)}>← Back</button>
      <h2>Booths</h2>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {success && <div style={{ color: "green" }}>{success}</div>}

      {me?.role === "BOOTH_MANAGER" && (
        <div style={{ marginBottom: 24, padding: 12, border: "1px solid #ccc" }}>
          <h3>Add Booth</h3>
          <form onSubmit={handleAddBooth}>
            <div style={{ marginBottom: 8 }}>
              <label>
                Booth Number
                <input name="booth_number" required style={{ width: "100%" }} />
              </label>
            </div>
            <div style={{ marginBottom: 8 }}>
              <label>
                Price
                <input name="price" type="number" step="0.01" required style={{ width: "100%" }} />
              </label>
            </div>
            <div style={{ marginBottom: 8 }}>
              <label>
                Size
                <input name="size" style={{ width: "100%" }} />
              </label>
            </div>
            <div style={{ marginBottom: 8 }}>
              <label>
                Location
                <input name="location" style={{ width: "100%" }} />
              </label>
            </div>
            <div style={{ marginBottom: 8 }}>
              <label>
                Type
                <select name="type" required style={{ width: "100%" }}>
                  <option value="INDOOR">Indoor</option>
                  <option value="OUTDOOR">Outdoor</option>
                </select>
              </label>
            </div>
            <div style={{ marginBottom: 8 }}>
              <label>
                Classification
                <select name="classification" required style={{ width: "100%" }}>
                  <option value="TEMPORARY">Temporary</option>
                  <option value="FIXED">Fixed</option>
                </select>
              </label>
            </div>
            <div style={{ marginBottom: 8 }}>
              <label>
                Duration
                <select name="duration_type" required style={{ width: "100%" }}>
                  <option value="SHORT_TERM">Short term</option>
                  <option value="LONG_TERM">Long term</option>
                </select>
              </label>
            </div>
            <div style={{ marginBottom: 8 }}>
              <label>
                Electricity
                <input name="electricity" type="checkbox" />
              </label>
            </div>
            <div style={{ marginBottom: 8 }}>
              <label>
                Water Supply
                <input name="water_supply" type="checkbox" />
              </label>
            </div>
            <div style={{ marginBottom: 8 }}>
              <label>
                Outlets
                <input name="outlets" type="number" min="0" style={{ width: "100%" }} />
              </label>
            </div>
            <button type="submit">Add Booth</button>
          </form>
        </div>
      )}

      <ul>
        {booths.map((booth) => (
          <li key={booth.booth_id} style={{ marginBottom: 12 }}>
            <div>
              <strong>{booth.booth_number}</strong> ({booth.type}) — {booth.status}
            </div>
            <div>Price: {booth.price}</div>
            <div>Size: {booth.size}</div>
            <div>Location: {booth.location}</div>
            <button
              onClick={() => handleReserve(booth.booth_id)}
              disabled={booth.status !== "AVAILABLE"}
              style={{ marginTop: 6 }}
            >
              {booth.status === "AVAILABLE" ? "Reserve" : "Unavailable"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
