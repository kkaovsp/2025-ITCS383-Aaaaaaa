import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { useTranslation } from 'react-i18next';

function HomePage() {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="page-content">
      <div className="hero">
        <h1>{t('home.title')}</h1>
        <p>{t('home.subtitle')}</p>
        <Link to="/events" className="btn btn-lg" style={{ background: '#fff', color: 'var(--primary)', fontWeight: 700 }}>
          {t('home.browseEvents')}
        </Link>
      </div>

      <div className="features-grid">
        <Link to="/events" className="feature-card-link">
          <div className="feature-card">
            <div className="feature-icon">🎪</div>
            <h3>{t('home.findEvents')}</h3>
            <p>{t('home.findEventsDesc')}</p>
          </div>
        </Link>
        <Link to="/booths" className="feature-card-link">
          <div className="feature-card">
            <div className="feature-icon">🛒</div>
            <h3>{t('home.reserveBooth')}</h3>
            <p>{t('home.reserveBoothDesc')}</p>
          </div>
        </Link>
        <Link to="/events" className="feature-card-link">
          <div className="feature-card">
            <div className="feature-icon">💳</div>
            <h3>{t('home.easyPayment')}</h3>
            <p>{t('home.easyPaymentDesc')}</p>
          </div>
        </Link>
        {user && (
          <Link to="/notifications" className="feature-card-link">
            <div className="feature-card">
              <div className="feature-icon">🔔</div>
              <h3>{t('home.notifications')}</h3>
              <p>{t('home.notificationsDesc')}</p>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}

export default HomePage;
