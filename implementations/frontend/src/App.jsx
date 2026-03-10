import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import EventDetailPage from "./pages/EventDetailPage";
import ReservationsPage from "./pages/ReservationsPage";
import NotificationsPage from "./pages/NotificationsPage";
import MerchantApprovalsPage from "./pages/MerchantApprovalsPage";
import { getToken, getMe } from "./services/api";

function RequireAuth({ children }) {
  const token = getToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  const [token, setToken] = useState(getToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    getMe()
      .then(() => setLoading(false))
      .catch(() => {
        setToken(null);
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<LoginPage onLogin={(token) => setToken(token)} />}
        />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardPage token={token} onLogout={() => setToken(null)} />
            </RequireAuth>
          }
        />
        <Route
          path="/events/:eventId"
          element={
            <RequireAuth>
              <EventDetailPage token={token} />
            </RequireAuth>
          }
        />
        <Route
          path="/reservations"
          element={
            <RequireAuth>
              <ReservationsPage token={token} />
            </RequireAuth>
          }
        />
        <Route
          path="/notifications"
          element={
            <RequireAuth>
              <NotificationsPage token={token} />
            </RequireAuth>
          }
        />
        <Route
          path="/merchants/pending"
          element={
            <RequireAuth>
              <MerchantApprovalsPage />
            </RequireAuth>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
