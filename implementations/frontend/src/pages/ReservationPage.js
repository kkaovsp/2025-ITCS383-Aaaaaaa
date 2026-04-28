import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../services/AuthContext';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function ReservationPage() {
  const [reservations, setReservations] = useState([]);
  const [payFormMap, setPayFormMap] = useState({});
  const [fileMap, setFileMap] = useState({});
  const { user } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

  async function load() {
    try {
      const resp = await api.get('/reservations');
      setReservations(resp.data);
      setPayFormMap((prev) => {
        const next = { ...prev };
        resp.data.forEach((r) => {
          if (!next[r.reservation_id]) {
            next[r.reservation_id] = {
              amount: r.booth?.price ?? '',
              method: 'BANK_TRANSFER',
            };
          }
        });
        return next;
      });
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => { load(); }, []);
  // if opened with ?focus=<reservation_id>, prefill pay form
  const { search } = useLocation();
  useEffect(() => {
    const q = new URLSearchParams(search);
    const focus = q.get('focus');
    if (focus) {
      // try to find the reservation in current list (or reload)
      (async () => {
        await load();
        const found = reservations.find((r) => r.reservation_id === focus);
        if (found) {
          setPayFormMap((prev) => ({
            ...prev,
            [found.reservation_id]: {
              amount: found.booth?.price ?? '',
              method: prev[found.reservation_id]?.method || 'BANK_TRANSFER',
            },
          }));
          window.scrollTo(0, 0);
        }
      })();
    }
  }, [search]);

  useEffect(() => {
    // handled by the search-based effect above which sets `payForm`
  }, [location.search, reservations]);

  async function createPayment(reservation) {
    const form = payFormMap[reservation.reservation_id] || {};
    try {
      const payResp = await api.post('/payments', {
        reservation_id: reservation.reservation_id,
        amount: parseFloat(form.amount),
        method: form.method,
      });

      if (form.method === 'BANK_TRANSFER') {
        const selectedFile = fileMap[reservation.reservation_id];
        if (!selectedFile) {
          alert(t('reservations.paymentCreated'));
          await load();
          return;
        }

        const fd = new FormData();
        fd.append('file', selectedFile, selectedFile.name);
        await api.post(`/payments/upload-slip?payment_id=${payResp.data.payment_id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      alert(t('reservations.paymentSubmitted'));
      load();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || t('reservations.paymentFailed'));
    }
  }

  async function uploadSlipForPayment(paymentId, reservationId) {
    const selectedFile = fileMap[reservationId];
    if (!selectedFile) {
      alert(t('reservations.selectFile'));
      return;
    }

    try {
      const fd = new FormData();
      fd.append('file', selectedFile, selectedFile.name);
      await api.post(`/payments/upload-slip?payment_id=${paymentId}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert(t('reservations.slipUploaded'));
      load();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || t('reservations.slipUploadFailed'));
    }
  }

  async function approvePaymentForReservation(paymentId) {
    if (!window.confirm(t('reservations.approveConfirm'))) return;
    try {
      await api.patch(`/payments/${paymentId}/approve`);
      alert(t('reservations.paymentApproved'));
      load();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || t('reservations.approveFailed'));
    }
  }

  async function cancelReservation(resId) {
    if (!window.confirm(t('reservations.cancelConfirm'))) return;
    try {
      await api.patch(`/reservations/${resId}/cancel`);
      alert(t('reservations.cancelSuccess'));
      load();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || t('reservations.cancelFailed'));
    }
  }

  function statusBadge(status) {
    const map = { PENDING_PAYMENT: 'badge-warning', WAITING_FOR_APPROVAL: 'badge-info', CONFIRMED: 'badge-success', CANCELLED: 'badge-danger' };
    return <span className={`badge ${map[status] || 'badge-gray'}`}>{status?.replace(/_/g, ' ')}</span>;
  }

  return (
    <div className="page-content">
      <div className="page-header"><h2>{t('reservations.title')}</h2></div>

      {reservations.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          {t('reservations.noReservations')} <a href="/events">{t('reservations.browseEvents')}</a> {t('reservations.toGetStarted')}
        </div>
      )}

      {reservations.map((r) => (
        <div key={r.reservation_id} className="reservation-item">
          <div className="reservation-item-info">
            <div style={{ fontWeight: 700, marginBottom: '.25rem' }}>
              {t('reservations.booth')} #{r.booth?.booth_number || r.booth_id}
            </div>
            <div style={{ fontSize: '.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
              {statusBadge(r.status)}
              {r.booth?.price != null && <span>💰 ${r.booth.price}</span>}
              {r.reservation_id && <span style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>ID: {r.reservation_id}</span>}
              {r.payment?.payment_status && <span className="badge badge-purple">{t('reservations.payment')}: {r.payment.payment_status}</span>}
              {r.payment?.slip_url && <span className="badge badge-info">{t('reservations.slipBadge')}</span>}
            </div>

            {user && user.role === 'MERCHANT' && r.status === 'PENDING_PAYMENT' && (
              <div style={{ marginTop: '.75rem', borderTop: '1px solid var(--border)', paddingTop: '.75rem' }}>
                <div style={{ fontWeight: 600, marginBottom: '.5rem' }}>{t('reservations.submitPayment')}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.5rem' }}>
                  <input
                    className="form-control"
                    type="number"
                    step="0.01"
                    value={payFormMap[r.reservation_id]?.amount ?? (r.booth?.price ?? '')}
                    onChange={(e) => setPayFormMap((prev) => ({
                      ...prev,
                      [r.reservation_id]: {
                        ...(prev[r.reservation_id] || {}),
                        amount: e.target.value,
                      },
                    }))}
                    placeholder={t('reservations.amount')}
                  />
                  <select
                    className="form-control"
                    value={payFormMap[r.reservation_id]?.method || 'BANK_TRANSFER'}
                    onChange={(e) => setPayFormMap((prev) => ({
                      ...prev,
                      [r.reservation_id]: {
                        ...(prev[r.reservation_id] || {}),
                        method: e.target.value,
                      },
                    }))}
                  >
                    <option value="CREDIT_CARD">{t('reservations.creditCard')}</option>
                    <option value="TRUEMONEY">{t('reservations.truemoney')}</option>
                    <option value="BANK_TRANSFER">{t('reservations.bankTransfer')}</option>
                  </select>
                </div>

                {(payFormMap[r.reservation_id]?.method || 'BANK_TRANSFER') === 'BANK_TRANSFER' && (
                  <div style={{ marginTop: '.5rem', display: 'flex', gap: '.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input type="file" onChange={(e) => setFileMap((prev) => ({ ...prev, [r.reservation_id]: e.target.files?.[0] }))} />
                    <span style={{ fontSize: '.8rem', color: 'var(--text-secondary)' }}>{t('reservations.uploadSlipBefore')}</span>
                  </div>
                )}
              </div>
            )}

            {user && user.role === 'MERCHANT' && r.status === 'WAITING_FOR_APPROVAL' && r.payment && r.payment.method === 'BANK_TRANSFER' && !r.payment.slip_url && (
              <div style={{ marginTop: '.75rem', borderTop: '1px solid var(--border)', paddingTop: '.75rem' }}>
                <div style={{ marginBottom: '.35rem', color: 'var(--danger-dark)', fontSize: '.85rem' }}>{t('reservations.slipNotUploaded')}</div>
                <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input type="file" onChange={(e) => setFileMap((prev) => ({ ...prev, [r.reservation_id]: e.target.files?.[0] }))} />
                  <button className="btn btn-primary btn-sm" onClick={() => uploadSlipForPayment(r.payment.payment_id, r.reservation_id)}>{t('reservations.uploadSlip')}</button>
                </div>
              </div>
            )}
          </div>
          <div className="reservation-item-actions">
            {user && user.role === 'BOOTH_MANAGER' && r.status === 'WAITING_FOR_APPROVAL' && r.payment?.payment_id && (
              <button
                className="btn btn-success btn-sm"
                onClick={() => approvePaymentForReservation(r.payment.payment_id)}
                disabled={r.payment.method === 'BANK_TRANSFER' && !r.payment.slip_url}
                title={r.payment.method === 'BANK_TRANSFER' && !r.payment.slip_url ? t('reservations.slipRequired') : t('reservations.approvePayment')}
              >
                {t('reservations.approvePayment')}
              </button>
            )}
            {user && user.role === 'MERCHANT' && r.status === 'PENDING_PAYMENT' && (
              <>
                <button className="btn btn-primary btn-sm" onClick={() => createPayment(r)}>{t('reservations.submitPaymentBtn')}</button>
                <button className="btn btn-danger btn-sm" onClick={() => cancelReservation(r.reservation_id)}>{t('reservations.cancelBtn')}</button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ReservationPage;