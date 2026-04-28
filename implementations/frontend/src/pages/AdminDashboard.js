import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function AdminDashboard() {
  const { t } = useTranslation();

  return (
    <div className="page-content">
      <div className="page-header"><h2>{t('admin.title')}</h2></div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-label">{t('admin.merchantApprovals')}</div>
          <div className="stat-card-value" style={{ fontSize: '1.5rem', color: 'var(--warning)' }}>👥</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">{t('admin.paymentReviews')}</div>
          <div className="stat-card-value" style={{ fontSize: '1.5rem', color: 'var(--success)' }}>💳</div>
        </div>
      </div>
      <div className="cards-grid" style={{ maxWidth: 960 }}>
        <Link to="/admin/merchants" className="card-link">
          <div className="card" style={{ borderLeft: '4px solid var(--primary)', cursor: 'pointer' }}>
            <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>👥</div>
            <div className="card-title">{t('admin.approveMerchants')}</div>
            <p style={{ fontSize: '.86rem', color: 'var(--text-secondary)', margin: 0 }}>{t('admin.approveMerchantsDesc')}</p>
          </div>
        </Link>
        <Link to="/admin/payments" className="card-link">
          <div className="card" style={{ borderLeft: '4px solid var(--success)', cursor: 'pointer' }}>
            <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>💳</div>
            <div className="card-title">{t('admin.reviewPayments')}</div>
            <p style={{ fontSize: '.86rem', color: 'var(--text-secondary)', margin: 0 }}>{t('admin.reviewPaymentsDesc')}</p>
          </div>
        </Link>
        <Link to="/reports" className="card-link">
          <div className="card" style={{ borderLeft: '4px solid var(--secondary)', cursor: 'pointer' }}>
            <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>📊</div>
            <div className="card-title">{t('admin.viewReports')}</div>
            <p style={{ fontSize: '.86rem', color: 'var(--text-secondary)', margin: 0 }}>{t('admin.viewReportsDesc')}</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default AdminDashboard;
