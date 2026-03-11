import axios from 'axios';

// Use a relative URL so the React dev server can proxy requests to the backend
// (configured via `proxy` in package.json). This avoids cross-origin requests
// and CORS issues in the Codespaces preview.
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// We use HttpOnly cookie for auth; do not attach Authorization header from
// localStorage to avoid stale tokens. Requests will send cookies automatically
// because `withCredentials: true` is enabled.

export default api;
