import axios from 'axios';

export const ACCESS_TOKEN_KEY = 'boothOrganizerAccessToken';
export const DEFAULT_API_URL = 'https://uaoufhdysqcivheauwyf.supabase.co/functions/v1/api';

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || DEFAULT_API_URL,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
