/**
 * NotificationBell.test.js
 */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NotificationBell from '../NotificationBell';

// Mock API - must use inline factory pattern to avoid ref errors
jest.mock('../../services/api', () => {
  return {
    __esModule: true,
    default: {
      get: jest.fn(),
      patch: jest.fn(),
      getAccessToken: jest.fn(() => 'tok'),
      setAccessToken: jest.fn(),
      clearAccessToken: jest.fn(),
    },
  };
});

const api = require('../../services/api');
const mockGet = api.default.get;
const mockPatch = api.default.patch;

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const m = {
        'notifications.bellLabel': 'Notifications',
        'notifications.noNotifShort': 'No notifications',
        'notifications.markRead': 'Mark read',
        'notifications.viewAll': 'View all',
      };
      return m[key] || key;
    },
    i18n: { language: 'en', changeLanguage: jest.fn() },
  }),
}));

beforeEach(() => {
  mockGet.mockReset();
  mockPatch.mockReset();
});

describe('NotificationBell', () => {
  test('renders bell button', async () => {
    mockGet.mockResolvedValue({ data: [] });
    await act(async () => {
      render(<BrowserRouter><NotificationBell /></BrowserRouter>);
    });
    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
  });

  test('shows empty list message when no notifications', async () => {
    mockGet.mockResolvedValue({ data: [] });
    await act(async () => {
      render(<BrowserRouter><NotificationBell /></BrowserRouter>);
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /notifications/i }));
    });
    expect(screen.getByText('No notifications')).toBeInTheDocument();
  });

  test('displays notification items when loaded', async () => {
    mockGet.mockResolvedValue({
      data: [
        { notification_id: 'n1', title: 'New merchant', message: 'Harry registered', is_read: false },
        { notification_id: 'n2', title: 'Payment received', message: 'From booth A1', is_read: true },
      ],
    });
    await act(async () => {
      render(<BrowserRouter><NotificationBell /></BrowserRouter>);
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /notifications/i }));
    });
    expect(screen.getByText('New merchant')).toBeInTheDocument();
    expect(screen.getByText('Payment received')).toBeInTheDocument();
  });

  test('shows badge with unread count', async () => {
    mockGet.mockResolvedValue({
      data: [
        { notification_id: 'n1', title: 'Notif 1', message: 'msg', is_read: false },
        { notification_id: 'n2', title: 'Notif 2', message: 'msg', is_read: false },
        { notification_id: 'n3', title: 'Notif 3', message: 'msg', is_read: true },
      ],
    });
    await act(async () => {
      render(<BrowserRouter><NotificationBell /></BrowserRouter>);
    });
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  test('shows 9+ badge when unread count exceeds 9', async () => {
    mockGet.mockResolvedValue({
      data: Array.from({ length: 12 }, (_, i) => ({
        notification_id: `n${i}`, title: `Notif ${i}`, message: 'msg', is_read: false,
      })),
    });
    await act(async () => {
      render(<BrowserRouter><NotificationBell /></BrowserRouter>);
    });
    expect(screen.getByText('9+')).toBeInTheDocument();
  });

  test('mark read button calls patch API and updates state', async () => {
    mockGet.mockResolvedValue({
      data: [
        { notification_id: 'n1', title: 'Test', message: 'msg', is_read: false },
        { notification_id: 'n2', title: 'Other', message: 'msg', is_read: false },
      ],
    });
    mockPatch.mockResolvedValue({ data: {} });
    await act(async () => {
      render(<BrowserRouter><NotificationBell /></BrowserRouter>);
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /notifications/i }));
    });
    await act(async () => {
      fireEvent.click(screen.getAllByText('Mark read')[0]);
    });
    expect(mockPatch).toHaveBeenCalledWith('/notifications/n1/read');
  });

  test('handles notification load failure as empty state', async () => {
    mockGet.mockRejectedValue(new Error('network'));
    await act(async () => {
      render(<BrowserRouter><NotificationBell /></BrowserRouter>);
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /notifications/i }));
    });
    expect(screen.getByText('No notifications')).toBeInTheDocument();
  });

  test('keeps unread item visible when mark read request fails', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockGet.mockResolvedValue({
      data: [{ notification_id: 'n1', title: 'Retry me', message: 'msg', is_read: false }],
    });
    mockPatch.mockRejectedValue(new Error('fail'));
    await act(async () => {
      render(<BrowserRouter><NotificationBell /></BrowserRouter>);
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /notifications/i }));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Mark read'));
    });
    expect(screen.getByText('Mark read')).toBeInTheDocument();
    errorSpy.mockRestore();
  });

  test('dropdown shows view all link', async () => {
    mockGet.mockResolvedValue({ data: [] });
    await act(async () => {
      render(<BrowserRouter><NotificationBell /></BrowserRouter>);
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /notifications/i }));
    });
    expect(screen.getByText('View all')).toBeInTheDocument();
  });

  test('view all link closes dropdown', async () => {
    mockGet.mockResolvedValue({ data: [] });
    await act(async () => {
      render(<BrowserRouter><NotificationBell /></BrowserRouter>);
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /notifications/i }));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('View all'));
    });
    expect(screen.queryByText('No notifications')).not.toBeInTheDocument();
  });
});
