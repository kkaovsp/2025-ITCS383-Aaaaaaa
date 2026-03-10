const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
}

export function login(payload) {
  return request("/api/auth/login", { method: "POST", body: JSON.stringify(payload) });
}

export function registerMerchant(payload) {
  return request("/api/auth/register", { method: "POST", body: JSON.stringify(payload) });
}

export function fetchEvents(token) {
  return request("/api/events", { headers: { Authorization: `Bearer ${token}` } });
}
