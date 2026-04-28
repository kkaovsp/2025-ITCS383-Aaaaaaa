import React, { useState } from 'react';
import api, { setAccessToken } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { useTranslation } from 'react-i18next';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const resp = await api.post('/auth/login', new URLSearchParams({ username, password }));
      if (resp.data?.access_token) {
        setAccessToken(resp.data.access_token);
      }
      if (typeof refresh === 'function') await refresh();
      navigate('/');
    } catch (err) {
      alert(t('login.failed'));
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>{t('login.title')}</h2>
        <p className="auth-subtitle">{t('login.subtitle')}</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t('login.username')}</label>
            <input className="form-control" placeholder={t('login.usernamePlaceholder')} value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">{t('login.password')}</label>
            <input className="form-control" type="password" placeholder={t('login.passwordPlaceholder')} value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '.5rem' }}>{t('login.submit')}</button>
        </form>
        <div className="auth-footer">
          {t('login.noAccount')} <a href="/register">{t('login.registerLink')}</a>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
