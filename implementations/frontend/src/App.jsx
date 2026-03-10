import { useEffect, useState } from "react";

import { login, registerMerchant, fetchEvents } from "./services/api";

export default function App() {
  const [view, setView] = useState("login");
  const [token, setToken] = useState(null);
  const [message, setMessage] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (token) {
      fetchEvents(token)
        .then((data) => setEvents(data))
        .catch(() => setEvents([]));
    }
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    try {
      const data = await login({ username, password });
      setToken(data.access_token);
      setView("dashboard");
      setMessage(null);
    } catch (err) {
      setMessage("Login failed");
    }
  };

  const handleRegisterMerchant = async (e) => {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.target));
    try {
      await registerMerchant(values);
      setMessage("Registration submitted. Wait for approval.");
      setView("login");
    } catch (err) {
      setMessage("Registration failed");
    }
  };

  if (view === "dashboard") {
    return (
      <div style={{ padding: 20 }}>
        <h1>Dashboard</h1>
        <button onClick={() => setView("login")}>Logout</button>
        <h2>Events</h2>
        {events.length === 0 ? (
          <p>No events found.</p>
        ) : (
          <ul>
            {events.map((e) => (
              <li key={e.event_id}>{e.name}</li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Booth Organizer</h1>
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setView("login")}>Login</button>
        <button onClick={() => setView("register")}>Register Merchant</button>
      </div>

      {message && <div style={{ color: "red" }}>{message}</div>}

      {view === "login" && (
        <form onSubmit={handleLogin} style={{ maxWidth: 350 }}>
          <div>
            <label>Username</label>
            <input name="username" type="text" required />
          </div>
          <div>
            <label>Password</label>
            <input name="password" type="password" required />
          </div>
          <button type="submit">Login</button>
        </form>
      )}

      {view === "register" && (
        <form onSubmit={handleRegisterMerchant} style={{ maxWidth: 350 }}>
          <div>
            <label>Username</label>
            <input name="username" type="text" required />
          </div>
          <div>
            <label>Password</label>
            <input name="password" type="password" required />
          </div>
          <div>
            <label>Name</label>
            <input name="name" type="text" required />
          </div>
          <div>
            <label>Contact</label>
            <input name="contact_info" type="text" required />
          </div>
          <div>
            <label>Citizen ID</label>
            <input name="citizen_id" type="text" required />
          </div>
          <div>
            <label>Seller Info</label>
            <textarea name="seller_information" />
          </div>
          <div>
            <label>Product Description</label>
            <textarea name="product_description" />
          </div>
          <input type="hidden" name="role" value="MERCHANT" />
          <button type="submit">Register</button>
        </form>
      )}
    </div>
  );
}
