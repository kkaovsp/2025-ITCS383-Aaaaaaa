/**
 * ReportsPage.test.js — CR-04 report empty/error handling tests
 */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const m = {
        'reports.title': 'Reports',
        'reports.selectEvent': 'Select Event',
        'reports.chooseEvent': '— Choose an event —',
        'reports.loadingEvents': 'Loading events…',
        'reports.generateReport': 'Generate Report',
        'reports.generating': 'Generating…',
        'reports.downloadCsv': 'Download CSV',
        'reports.downloading': 'Downloading…',
        'reports.loadEventsFailed': 'Failed to load events',
        'reports.selectEventFirst': 'Please select an event first',
        'reports.loadFailed': 'Failed to load report',
        'reports.csvFailed': 'Failed to download CSV',
        'reports.loadingReport': 'Loading report data…',
        'reports.totalReservations': 'Total Reservations',
        'reports.confirmed': 'Confirmed',
        'reports.pending': 'Pending',
        'reports.totalRevenue': 'Total Revenue',
        'reports.reservationDetails': 'Reservation Details',
        'reports.records': 'records',
        'reports.booth': 'Booth',
        'reports.merchant': 'Merchant',
        'reports.type': 'Type',
        'reports.status': 'Status',
        'reports.paymentMethod': 'Payment Method',
        'reports.paymentStatus': 'Payment Status',
        'reports.amount': 'Amount',
        'reports.date': 'Date',
        'reports.noReservations': 'No reservations found for this event.',
        'reports.noReservationsHint': 'Try selecting a different event.',
        'reports.initialHint': 'Select an event and click Generate Report.',
      };
      return m[key] || key;
    },
    i18n: { language: 'en', changeLanguage: jest.fn() },
  }),
}));

// Mock API
jest.mock('../../services/api', () => {
  const fn = jest.fn(() => Promise.resolve({ data: [] }));
  return {
    __esModule: true,
    default: { get: fn },
    getAccessToken: jest.fn(() => 'tok'),
    setAccessToken: jest.fn(),
    clearAccessToken: jest.fn(),
    _mockGet: fn,
  };
});

const { _mockGet: mockGet } = require('../../services/api');
const ReportsPage = require('../ReportsPage').default;

beforeEach(() => {
  mockGet.mockReset();
  mockGet.mockImplementation(() => Promise.resolve({ data: [] }));
});

test('renders page title and initial hint', async () => {
  await act(async () => {
    render(<BrowserRouter><ReportsPage /></BrowserRouter>);
  });
  expect(screen.getByText('Reports')).toBeInTheDocument();
  expect(screen.getByText('Select an event and click Generate Report.')).toBeInTheDocument();
});

test('buttons are disabled without event selection', async () => {
  await act(async () => {
    render(<BrowserRouter><ReportsPage /></BrowserRouter>);
  });
  expect(screen.getByText('Generate Report')).toBeDisabled();
  expect(screen.getByText(/Download CSV/)).toBeDisabled();
});

test('shows events dropdown when events load', async () => {
  mockGet.mockImplementation((url) => {
    if (url.includes('/reports/events')) {
      return Promise.resolve({
        data: [{ event_id: 'e1', name: 'Test Event', location: 'Hall A' }]
      });
    }
    return Promise.resolve({ data: [] });
  });

  await act(async () => {
    render(<BrowserRouter><ReportsPage /></BrowserRouter>);
  });

  expect(screen.getByRole('combobox')).toBeInTheDocument();
  expect(screen.getByText(/Test Event/)).toBeInTheDocument();
});

test('shows error alert when event loading fails', async () => {
  mockGet.mockImplementation(() => Promise.reject(new Error('error')));
  await act(async () => {
    render(<BrowserRouter><ReportsPage /></BrowserRouter>);
  });
  expect(screen.getByText('Failed to load events')).toBeInTheDocument();
});

test('renders table and summary with WAITING_FOR_APPROVAL data', async () => {
  mockGet.mockImplementation((url) => {
    if (url.includes('/reports/events')) {
      return Promise.resolve({ data: [{ event_id: 'e1', name: 'Fair' }] });
    }
    return Promise.resolve({
      data: {
        event: { name: 'Fair' },
        rows: [{
          reservation_id: 'r1', booth_number: 'A01',
          merchant_name: 'ShopXYZ', reservation_type: 'SHORT_TERM', reservation_status: 'WAITING_FOR_APPROVAL',
          payment_amount: 5000, payment_method: 'BANK_TRANSFER', payment_status: 'PENDING', payment_created_at: '2026-04-20T10:00:00Z'
        }]
      }
    });
  });

  await act(async () => {
    render(<BrowserRouter><ReportsPage /></BrowserRouter>);
  });

  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'e1' } });
  await act(async () => {
    fireEvent.click(screen.getByText('Generate Report'));
  });

  // Check summary: Pending should be 1
  const pendingStat = screen.getByText('Pending').previousSibling;
  expect(pendingStat).toHaveTextContent('1');
  expect(screen.getByText('WAITING_FOR_APPROVAL')).toBeInTheDocument();
});

test('shows empty state for event with no reservations', async () => {
  mockGet.mockImplementation((url) => {
    if (url.includes('/reports/events')) {
      return Promise.resolve({ data: [{ event_id: 'e1', name: 'Ev1' }] });
    }
    return Promise.resolve({
      data: {
        event: { name: 'Ev1' },
        rows: []
      }
    });
  });

  await act(async () => {
    render(<BrowserRouter><ReportsPage /></BrowserRouter>);
  });

  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'e1' } });
  await act(async () => {
    fireEvent.click(screen.getByText('Generate Report'));
  });

  expect(screen.getByText('No reservations found for this event.')).toBeInTheDocument();
});

