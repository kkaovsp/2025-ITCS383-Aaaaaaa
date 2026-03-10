import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchEvents, getMe, logout, createEvent } from "../services/api";

export default function DashboardPage({ token, onLogout }) {
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;

    getMe()
      .then((data) => setUser(data))
      .catch(() => {
        setError("Failed to load user data");
      });

    fetchEvents(token)
      .then((data) => setEvents(data))
      .catch(() => setError("Failed to load events"));
  }, [token]);

  const handleLogout = () => {
    logout();
    onLogout();
    navigate("/login");
  };

  const handleCreateEvent = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      name: form.get("name"),
      description: form.get("description"),
      location: form.get("location"),
      start_date: form.get("start_date"),
      end_date: form.get("end_date"),
    };

    try {
      const created = await createEvent(payload);
      setEvents((prev) => [created, ...prev]);
    } catch (err) {
      setError("Unable to create event");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Booth Organizer</h1>
          {user && (
            <p>
              Logged in as <strong>{user.name}</strong> ({user.role})
            </p>
          )}
        </div>
        <div>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {error && <div style={{ color: "red" }}>{error}</div>}

      <section style={{ marginTop: 24 }}>
        <h2>Events</h2>
        {user?.role === "BOOTH_MANAGER" && (
          <div style={{ marginBottom: 20, padding: 12, border: "1px solid #ccc" }}>
            <h3>Create Event</h3>
            <form onSubmit={handleCreateEvent}>
              <div style={{ marginBottom: 8 }}>
                <label>
                  Name
                  <input name="name" required style={{ width: "100%" }} />
                </label>
              </div>
              <div style={{ marginBottom: 8 }}>
                <label>
                  Location
                  <input name="location" required style={{ width: "100%" }} />
                </label>
              </div>
              <div style={{ marginBottom: 8 }}>
                <label>
                  Start date
                  <input name="start_date" type="date" required style={{ width: "100%" }} />
                </label>
              </div>
              <div style={{ marginBottom: 8 }}>
                <label>
                  End date
                  <input name="end_date" type="date" required style={{ width: "100%" }} />
                </label>
              </div>
              <div style={{ marginBottom: 8 }}>
                <label>
                  Description
                  <textarea name="description" style={{ width: "100%" }} />
                </label>
              </div>
              <button type="submit">Create Event</button>
            </form>
          </div>
        )}

        {events.length === 0 ? (
          <p>No events found.</p>
        ) : (
          <ul>
            {events.map((event) => (
              <li key={event.event_id} style={{ marginBottom: 8 }}>
                <Link to={`/events/${event.event_id}`}>{event.name}</Link>
                <div style={{ fontSize: 12, color: "#555" }}>
                  {event.location} · {event.start_date} to {event.end_date}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginTop: 32 }}>
        <h2>Quick Links</h2>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={() => navigate("/reservations")}>My Reservations</button>
          <button onClick={() => navigate("/notifications")}>Notifications</button>
          {user?.role === "BOOTH_MANAGER" && (
            <button onClick={() => navigate("/merchants/pending")}>Pending Merchants</button>
          )}
        </div>
      </section>
    </div>
  );
}
