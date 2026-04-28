import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageToggle() {
  const { i18n } = useTranslation();

  const toggle = () => {
    const newLang = i18n.language === 'en' ? 'th' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('i18nextLng', newLang);
  };

  return (
    <button onClick={toggle} className="lang-toggle" aria-label="Toggle language">
      {i18n.language === 'en' ? '🇹🇭 TH' : '🇬🇧 EN'}
    </button>
  );
}
