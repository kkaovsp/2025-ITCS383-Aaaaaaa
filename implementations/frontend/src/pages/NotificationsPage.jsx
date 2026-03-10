import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchNotifications, markNotificationRead } from "../services/api";

export default function NotificationsPage({ token }) {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchNotifications(token)
      .then(setNotifications)
      .catch(() => setError("Unable to load notifications"));
  }, [token]);

  const markRead = async (id) => {
    try {
      const updated = await markNotificationRead(id, token);
      setNotifications((prev) => prev.map((n) => (n.notification_id === id ? updated : n)));
    } catch {
      setError("Unable to mark read");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => navigate(-1)}>← Back</button>
      <h2>Notifications</h2>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {notifications.length === 0 ? (
        <p>No notifications.</p>
      ) : (
        <ul>
          {notifications.map((n) => (
            <li key={n.notification_id} style={{ marginBottom: 12 }}>
              <div>
                <strong>{n.title}</strong> {n.is_read ? "(read)" : "(unread)"}
              </div>
              <div>{n.message}</div>
              {!n.is_read && (
                <button onClick={() => markRead(n.notification_id)}>Mark read</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
