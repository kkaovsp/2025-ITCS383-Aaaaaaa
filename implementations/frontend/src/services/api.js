import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  withCredentials: true,
});

// We use HttpOnly cookie for auth; do not attach Authorization header from
// localStorage to avoid stale tokens. Requests will send cookies automatically
// because `withCredentials: true` is enabled.

export default api;
