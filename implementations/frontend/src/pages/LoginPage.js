import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { refresh } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Login will set an HttpOnly cookie; we don't store the token in
      // localStorage to avoid token leakage and stale tokens across accounts.
      await api.post('/auth/login', new URLSearchParams({ username, password }));
      // refresh current user in context
      if (typeof refresh === 'function') await refresh();
      navigate('/');
    } catch (err) {
      alert('Login failed');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Welcome back</h2>
        <p className="auth-subtitle">Sign in to your BoothOrganizer account</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input className="form-control" placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '.5rem' }}>Sign In</button>
        </form>
        <div className="auth-footer">
          Don't have an account? <a href="/register">Register here</a>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
