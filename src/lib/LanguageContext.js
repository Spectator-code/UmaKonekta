'use client';

import { createContext, useContext, useState, useEffect } from 'react';

export const translations = {
  en: {
    dashboard: 'My Dashboard',
    marketplace: 'Equipment Marketplace',
    signOut: 'Sign Out',
    verifiedMember: 'Verified Member',
    hotline: 'Hotline 1343',
    language: 'Language',
    smartCalendar: 'Smart Calendar',
    farmerLedger: 'Farmer Ledger',
    operatorDispatch: 'Operator Dispatch',
    saccoSplitReceipt: 'SACCO Split Receipt',
    admin: 'Admin',
    farmer: 'Farmer',
    provider: 'Depot Provider',
    mechanic: 'Mechanic',
  },
  tl: {
    dashboard: 'Aking Dashboard',
    marketplace: 'Pamilihan ng Makinarya',
    signOut: 'Mag-Sign Out',
    verifiedMember: 'Beripikadong Miyembro',
    hotline: 'Hotline 1343',
    language: 'Wika',
    smartCalendar: 'Matalinong Kalendaryo',
    farmerLedger: 'Talaan ng Magsasaka',
    operatorDispatch: 'Dispatso ng Operator',
    saccoSplitReceipt: 'Resibo ng SACCO Hati',
    admin: 'Tagapamahala (Admin)',
    farmer: 'Magsasaka',
    provider: 'May-ari ng Makinarya',
    mechanic: 'Mekaniko',
  },
  ceb: {
    dashboard: 'Akong Dashboard',
    marketplace: 'Merkado sa Makinarya',
    signOut: 'Gawas / Sign Out',
    verifiedMember: 'Beripikadong Miyembro',
    hotline: 'Hotline 1343',
    language: 'Pinulongan',
    smartCalendar: 'Smart nga Kalendaryo',
    farmerLedger: 'Listahan sa Mag-uuma',
    operatorDispatch: 'Dispatser sa Operator',
    saccoSplitReceipt: 'Resibo sa Bahin sa SACCO',
    admin: 'Tigdumala (Admin)',
    farmer: 'Mag-uuma',
    provider: 'Tag-iya sa Makinarya',
    mechanic: 'Mekaniko',
  }
};

const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState('en');

  useEffect(() => {
    const saved = localStorage.getItem('umakonekta_lang');
    if (saved && (saved === 'en' || saved === 'tl' || saved === 'ceb')) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('umakonekta_lang', lang);
      window.dispatchEvent(new Event('language_changed'));
    } catch (e) {}
  };

  const t = (key) => {
    const currentDict = translations[language] || translations.en;
    return currentDict[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
