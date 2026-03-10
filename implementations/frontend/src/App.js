import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './services/AuthContext';
import api from './services/api';
import ProtectedRoute from './components/ProtectedRoute';
import NotificationBell from './components/NotificationBell';
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

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      await refresh();
      navigate('/');
    } catch (err) {
      console.error('logout failed', err);
    }
  };

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <Link to="/">Home</Link> |{' '}
        <Link to="/events">Events</Link>
        {user && (
          <>
            {' '}
            | <Link to="/reservations">Reservations</Link> | <Link to="/profile">Profile</Link>
          </>
        )}
        {user && user.role === 'BOOTH_MANAGER' && (
          <>
            {' '}
            | <Link to="/create-event">Create Event</Link> | <Link to="/admin">Admin</Link>
          </>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {!user && (
          <>
            <Link to="/login">Login</Link> | <Link to="/register">Register</Link>
          </>
        )}
        {user && <NotificationBell />}
        {user && (
          <>
            <span>{user.name || user.username} {user.role}</span>
            <button onClick={handleLogout}>Logout</button>
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
          <Route path="/notifications" element={<NotificationsPage />} />
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
