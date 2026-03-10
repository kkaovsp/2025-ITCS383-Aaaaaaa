const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

function getStoredToken() {
  return localStorage.getItem("authToken");
}

function setStoredToken(token) {
  if (token) {
    localStorage.setItem("authToken", token);
  } else {
    localStorage.removeItem("authToken");
  }
}

async function request(path, options = {}) {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

export async function login(payload) {
  const data = await request("/api/auth/login", { method: "POST", body: JSON.stringify(payload) });
  setStoredToken(data.access_token);
  return data;
}

export function logout() {
  setStoredToken(null);
}

export function registerMerchant(payload) {
  return request("/api/auth/register", { method: "POST", body: JSON.stringify(payload) });
}

export function getMe() {
  return request("/api/auth/me");
}

export function fetchEvents() {
  return request("/api/events");
}

export function createEvent(payload) {
  return request("/api/events", { method: "POST", body: JSON.stringify(payload) });
}

export function fetchBoothsForEvent(eventId) {
  return request(`/api/booths/event/${eventId}`);
}

export function createBooth(payload) {
  return request("/api/booths", { method: "POST", body: JSON.stringify(payload) });
}

export function createReservation(payload) {
  return request("/api/reservations", { method: "POST", body: JSON.stringify(payload) });
}

export function fetchReservations() {
  return request("/api/reservations");
}

export function createPayment(payload) {
  return request("/api/payments", { method: "POST", body: JSON.stringify(payload) });
}

export function fetchNotifications() {
  return request("/api/notifications");
}

export function markNotificationRead(notificationId) {
  return request(`/api/notifications/${notificationId}/read`, { method: "PATCH" });
}

export function fetchPendingMerchants() {
  return request("/api/merchants/pending");
}

export function approveMerchant(merchantId) {
  return request(`/api/merchants/${merchantId}/approve`, { method: "POST" });
}

export function getToken() {
  return getStoredToken();
}
