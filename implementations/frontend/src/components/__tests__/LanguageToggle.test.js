/**
 * LanguageToggle.test.js
 */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import LanguageToggle from '../LanguageToggle';

const mockChangeLanguage = jest.fn();
let mockLanguage = 'en';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      get language() {
        return mockLanguage;
      },
      changeLanguage: mockChangeLanguage,
    },
  }),
}));

describe('LanguageToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    mockChangeLanguage.mockClear();
    mockLanguage = 'en';
  });

  test('renders toggle button with correct label for en', () => {
    render(<LanguageToggle />);
    expect(screen.getByRole('button', { name: /toggle language/i })).toBeInTheDocument();
    expect(screen.getByText('🇹🇭 TH')).toBeInTheDocument();
  });

  test('clicking button calls changeLanguage with th when language is en', () => {
    render(<LanguageToggle />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockChangeLanguage).toHaveBeenCalledWith('th');
  });

  test('renders English label and switches to en when language is th', () => {
    mockLanguage = 'th';
    render(<LanguageToggle />);
    expect(screen.getByText('🇬🇧 EN')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /toggle language/i }));
    expect(mockChangeLanguage).toHaveBeenCalledWith('en');
    expect(localStorage.getItem('i18nextLng')).toBe('en');
  });
});
