import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './i18n';
import { AuthProvider, useAuth } from './services/AuthContext';
import api, { clearAccessToken } from './services/api';
import ProtectedRoute from './components/ProtectedRoute';
import NotificationBell from './components/NotificationBell';
import LanguageToggle from './components/LanguageToggle';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EventListPage from './pages/EventListPage';
import BoothSelectionPage from './pages/BoothSelectionPage';
import ReservationPage from './pages/ReservationPage';
// PaymentPage removed from routes (admin review exists)
import AdminDashboard from './pages/AdminDashboard';
import NotificationsPage from './pages/NotificationsPage';
import CreateEventPage from './pages/CreateEventPage';
import MerchantApprovalPage from './pages/MerchantApprovalPage';
import PaymentApprovalPage from './pages/PaymentApprovalPage';
import ProfilePage from './pages/ProfilePage';

function NavBar() {
  const { user, refresh } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('logout failed', err);
    } finally {
      clearAccessToken();
      await refresh();
      navigate('/');
    }
  };

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <Link to="/" className="navbar-brand">{t('nav.brand')}</Link>
        <div className="navbar-links">
          <Link to="/">{t('nav.home')}</Link>
          <Link to="/events">{t('nav.events')}</Link>
          {user && <Link to="/reservations">{t('nav.reservations')}</Link>}
          {user && <Link to="/profile">{t('nav.profile')}</Link>}
          {user && user.role === 'BOOTH_MANAGER' && <Link to="/create-event">{t('nav.createEvent')}</Link>}
          {user && user.role === 'BOOTH_MANAGER' && <Link to="/admin">{t('nav.admin')}</Link>}
        </div>
      </div>
      <div className="navbar-right">
        <LanguageToggle />
        {!user && (
          <>
            <Link to="/login" className="btn btn-ghost btn-sm">{t('nav.login')}</Link>
            <Link to="/register" className="btn btn-primary btn-sm">{t('nav.register')}</Link>
          </>
        )}
        {user && <NotificationBell />}
        {user && (
          <>
            <span className="navbar-user-chip">{user.name || user.username} · {user.role}</span>
            <button className="btn btn-logout btn-sm" onClick={handleLogout}>{t('nav.logout')}</button>
          </>
        )}
      </div>
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/events" element={<EventListPage />} />
          <Route path="/booths" element={<BoothSelectionPage />} />
          <Route path="/reservations" element={<ReservationPage />} />
          <Route path="/admin" element={<ProtectedRoute requiredRole="BOOTH_MANAGER"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/create-event" element={<ProtectedRoute requiredRole="BOOTH_MANAGER"><CreateEventPage /></ProtectedRoute>} />
          <Route path="/admin/merchants" element={<ProtectedRoute requiredRole="BOOTH_MANAGER"><MerchantApprovalPage /></ProtectedRoute>} />
          <Route path="/admin/payments" element={<ProtectedRoute requiredRole="BOOTH_MANAGER"><PaymentApprovalPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
