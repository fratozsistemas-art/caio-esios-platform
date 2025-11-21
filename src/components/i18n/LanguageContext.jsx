import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    // Try to get saved language from localStorage
    const saved = localStorage.getItem('caio_language');
    if (saved && (saved === 'en-US' || saved === 'pt-BR')) {
      return saved;
    }
    
    // Detect browser language
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.startsWith('pt')) {
      return 'pt-BR';
    }
    return 'en-US';
  });

  useEffect(() => {
    localStorage.setItem('caio_language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key, fallback) => {
    return translations[language]?.[key] || fallback || key;
  };

  const changeLanguage = (lang) => {
    if (lang === 'en-US' || lang === 'pt-BR') {
      setLanguage(lang);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}