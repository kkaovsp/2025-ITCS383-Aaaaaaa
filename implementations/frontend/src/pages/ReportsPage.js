import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

function ReportsPage() {
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [error, setError] = useState('');
  const [csvLoading, setCsvLoading] = useState(false);

  // Fetch event list on mount for the dropdown
  useEffect(() => {
    setEventsLoading(true);
    api.get('/reports/events')
      .then(res => {
        // The API returns the array directly
        setEvents(Array.isArray(res.data) ? res.data : (res.data.events || []));
      })
      .catch(() => {
        setError(t('reports.loadEventsFailed'));
      })
      .finally(() => {
        setEventsLoading(false);
      });
  }, []);

  // Generate report handler
  const handleGenerate = useCallback(async () => {
    /* istanbul ignore next: the Generate button is disabled until an event is selected. */
    if (!selectedEventId) {
      setError(t('reports.selectEventFirst'));
      return;
    }
    setLoading(true);
    setError('');
    setReportData(null);
    try {
      const res = await api.get(
        `/reports/reservations-payments?event_id=${selectedEventId}`
      );
      // Backend returns { event, rows }
      const { event, rows } = res.data;
      
      // Calculate summary locally since backend doesn't provide it
      const summary = {
        total_reservations: rows.length,
        confirmed_count: rows.filter(r => r.reservation_status === 'CONFIRMED').length,
        pending_count: rows.filter(r => 
          ['PENDING', 'PENDING_PAYMENT', 'WAITING_FOR_APPROVAL'].includes(r.reservation_status)
        ).length,
        total_amount: rows.reduce((sum, r) => sum + (Number(r.payment_amount) || 0), 0)
      };

      setReportData({
        event,
        reservations: rows,
        summary
      });
    } catch (err) {
      setError(err.response?.data?.error || t('reports.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [selectedEventId, t]);

  // CSV download handler
  const handleDownloadCSV = useCallback(async () => {
    if (!selectedEventId) return;
    setCsvLoading(true);
    setError('');
    try {
      const res = await api.get(
        `/reports/reservations-payments.csv?event_id=${selectedEventId}`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      const selectedEvent = events.find(e => e.event_id === selectedEventId);
      const filename = selectedEvent
        ? `report_${selectedEvent.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
        : `report_${selectedEventId}.csv`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(t('reports.csvFailed'));
    } finally {
      setCsvLoading(false);
    }
  }, [selectedEventId, events, t]);

  // Helper: badge class for reservation status
  const statusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'badge badge-success';
      case 'PENDING': return 'badge badge-warning';
      case 'CANCELLED': return 'badge badge-danger';
      default: return 'badge badge-gray';
    }
  };

  // Helper: badge class for payment status
  const paymentBadge = (status) => {
    switch (status) {
      case 'APPROVED': return 'badge badge-success';
      case 'PENDING': return 'badge badge-warning';
      case 'REJECTED': return 'badge badge-danger';
      default: return 'badge badge-gray';
    }
  };

  return (
    <div className="page-content">
      {/* Page Header */}
      <div className="page-header">
        <h2>{t('reports.title')}</h2>
      </div>

      {/* Filter Bar */}
      <div className="report-filter-bar">
        <div className="report-filter-group">
          <label className="form-label" htmlFor="report-event-select">
            {t('reports.selectEvent')}
          </label>
          <select
            id="report-event-select"
            className="form-control report-select"
            value={selectedEventId}
            onChange={e => { setSelectedEventId(e.target.value); setError(''); }}
            disabled={eventsLoading}
          >
            <option value="">{eventsLoading ? t('reports.loadingEvents') : t('reports.chooseEvent')}</option>
            {events.map(ev => (
              <option key={ev.event_id} value={ev.event_id}>
                {ev.name} — {ev.location}
              </option>
            ))}
          </select>
        </div>
        <div className="report-filter-actions">
          <button
            id="generate-report-btn"
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={loading || !selectedEventId}
          >
            {loading ? (
              <><span className="report-spinner"></span> {t('reports.generating')}</>
            ) : (
              <>{t('reports.generateReport')}</>
            )}
          </button>
          <button
            id="download-csv-btn"
            className="btn btn-secondary"
            onClick={handleDownloadCSV}
            disabled={!selectedEventId || csvLoading}
          >
            {csvLoading ? (
              <><span className="report-spinner"></span> {t('reports.downloading')}</>
            ) : (
              <>📥 {t('reports.downloadCsv')}</>
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-error" id="report-error-msg" role="alert">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="report-loading-container">
          <div className="report-loading-spinner"></div>
          <p>{t('reports.loadingReport')}</p>
        </div>
      )}

      {/* Report Content */}
      {!loading && reportData && (
        <>
          {/* Event Info & Summary Stats */}
          <div className="report-event-header">
            <div className="report-event-info">
              <h3>{reportData.event?.name}</h3>
              <p className="report-event-meta">
                📅 {reportData.event?.start_date} — {reportData.event?.end_date} &nbsp;·&nbsp; 📍 {reportData.event?.location}
              </p>
            </div>
          </div>

          <div className="report-summary-grid">
            <div className="report-stat-card">
              <div className="report-stat-icon">📊</div>
              <div className="report-stat-value">{reportData.summary?.total_reservations ?? 0}</div>
              <div className="report-stat-label">{t('reports.totalReservations')}</div>
            </div>
            <div className="report-stat-card report-stat-confirmed">
              <div className="report-stat-icon">✅</div>
              <div className="report-stat-value">{reportData.summary?.confirmed_count ?? 0}</div>
              <div className="report-stat-label">{t('reports.confirmed')}</div>
            </div>
            <div className="report-stat-card report-stat-pending">
              <div className="report-stat-icon">⏳</div>
              <div className="report-stat-value">{reportData.summary?.pending_count ?? 0}</div>
              <div className="report-stat-label">{t('reports.pending')}</div>
            </div>
            <div className="report-stat-card report-stat-revenue">
              <div className="report-stat-icon">💰</div>
              <div className="report-stat-value">฿{(reportData.summary?.total_amount ?? 0).toLocaleString()}</div>
              <div className="report-stat-label">{t('reports.totalRevenue')}</div>
            </div>
          </div>

          {/* Data Table */}
          {reportData.reservations?.length > 0 ? (
            <div className="panel" style={{ marginTop: '1.5rem' }}>
              <div className="panel-header">
                <h3>{t('reports.reservationDetails')}</h3>
                <span className="badge badge-info">
                  {reportData.reservations.length} {t('reports.records')}
                </span>
              </div>
              <div className="table-wrapper">
                <table id="report-table">
                  <thead>
                    <tr>
                      <th>{t('reports.booth')}</th>
                      <th>{t('reports.merchant')}</th>
                      <th>{t('reports.type')}</th>
                      <th>{t('reports.status')}</th>
                      <th>{t('reports.paymentMethod')}</th>
                      <th>{t('reports.paymentStatus')}</th>
                      <th>{t('reports.amount')}</th>
                      <th>{t('reports.date')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.reservations.map(r => (
                      <tr key={r.reservation_id}>
                        <td>
                          <strong>{r.booth_number}</strong>
                          <br />
                          <span style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>{r.booth_size || '—'}</span>
                        </td>
                        <td>{r.merchant_name || '—'}</td>
                        <td>
                          <span className="badge badge-purple">{r.reservation_type}</span>
                        </td>
                        <td>
                          <span className={statusBadge(r.reservation_status)}>{r.reservation_status}</span>
                        </td>
                        <td>{r.payment_method || '—'}</td>
                        <td>
                          {r.payment_status ? (
                            <span className={paymentBadge(r.payment_status)}>
                              {r.payment_status}
                            </span>
                          ) : '—'}
                        </td>
                        <td style={{ fontWeight: 700 }}>
                          {r.payment_amount != null ? `฿${Number(r.payment_amount).toLocaleString()}` : '—'}
                        </td>
                        <td style={{ fontSize: '.85rem', color: 'var(--text-secondary)' }}>
                          {r.payment_created_at ? new Date(r.payment_created_at).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="report-empty-state" id="report-empty-msg">
              <div className="report-empty-icon">📭</div>
              <p>{t('reports.noReservations')}</p>
              <span className="report-empty-hint">{t('reports.noReservationsHint')}</span>
            </div>
          )}
        </>
      )}

      {/* Initial State — no report generated yet */}
      {!loading && !reportData && !error && (
        <div className="report-initial-state">
          <div className="report-initial-icon">📋</div>
          <p>{t('reports.initialHint')}</p>
        </div>
      )}
    </div>
  );
}

export default ReportsPage;
