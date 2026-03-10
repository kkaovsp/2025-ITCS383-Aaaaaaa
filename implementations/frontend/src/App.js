import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EventListPage from './pages/EventListPage';
import BoothSelectionPage from './pages/BoothSelectionPage';
import ReservationPage from './pages/ReservationPage';
import PaymentPage from './pages/PaymentPage';
import AdminDashboard from './pages/AdminDashboard';
import NotificationsPage from './pages/NotificationsPage';
import CreateEventPage from './pages/CreateEventPage';
import MerchantApprovalPage from './pages/MerchantApprovalPage';
import PaymentApprovalPage from './pages/PaymentApprovalPage';

function App() {
  return (
    <Router>
      <nav>
        <Link to="/">Home</Link> | <Link to="/login">Login</Link> |{' '}
        <Link to="/register">Register</Link> | <Link to="/events">Events</Link> |{' '}
        <Link to="/create-event">Create Event</Link> | <Link to="/admin">Admin</Link>
      </nav>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/events" element={<EventListPage />} />
        <Route path="/booths" element={<BoothSelectionPage />} />
        <Route path="/reservations" element={<ReservationPage />} />
        <Route path="/payments" element={<PaymentPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/create-event" element={<CreateEventPage />} />
        <Route path="/admin/merchants" element={<MerchantApprovalPage />} />
        <Route path="/admin/payments" element={<PaymentApprovalPage />} />
      </Routes>
    </Router>
  );
}

export default App;
