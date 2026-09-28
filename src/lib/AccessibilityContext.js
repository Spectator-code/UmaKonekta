'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AccessibilityContext = createContext({
  fontScale: 'normal', // 'normal' (100%), 'large' (115%), 'xlarge' (130%)
  setFontScale: () => {},
  cycleFontScale: () => {},
  highContrast: false,
  setHighContrast: () => {},
  toggleHighContrast: () => {},
  sidebarCollapsed: false,
  setSidebarCollapsed: () => {},
  toggleSidebar: () => {},
  mobileNavOpen: false,
  setMobileNavOpen: () => {},
  toggleMobileNav: () => {},
  commandPaletteOpen: false,
  setCommandPaletteOpen: () => {},
  toggleCommandPalette: () => {},
  announceMessage: '',
  announce: () => {},
});

export function AccessibilityProvider({ children }) {
  const [fontScale, setFontScaleState] = useState('normal');
  const [highContrast, setHighContrastState] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [announceMessage, setAnnounceMessage] = useState('');

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const savedFont = localStorage.getItem('umakonekta_a11y_font');
      if (savedFont && ['normal', 'large', 'xlarge'].includes(savedFont)) {
        setFontScaleState(savedFont);
      }

      const savedContrast = localStorage.getItem('umakonekta_a11y_contrast');
      if (savedContrast === 'true') {
        setHighContrastState(true);
      }

      const savedSidebar = localStorage.getItem('umakonekta_sidebar_collapsed');
      if (savedSidebar === 'true') {
        setSidebarCollapsedState(true);
      }
    } catch (e) {
      console.warn('Unable to read a11y preferences from localStorage', e);
    }
  }, []);

  // Apply DOM classes for fontScale and highContrast
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Reset existing font classes
    body.classList.remove('font-scale-normal', 'font-scale-large', 'font-scale-xlarge');
    body.classList.add(`font-scale-${fontScale}`);

    if (highContrast) {
      root.classList.add('sunlight-contrast');
      body.classList.add('sunlight-contrast');
    } else {
      root.classList.remove('sunlight-contrast');
      body.classList.remove('sunlight-contrast');
    }
  }, [fontScale, highContrast]);



  const setFontScale = useCallback((scale) => {
    setFontScaleState(scale);
    try {
      localStorage.setItem('umakonekta_a11y_font', scale);
    } catch (e) {}
  }, []);

  const cycleFontScale = useCallback(() => {
    setFontScaleState((prev) => {
      const next = prev === 'normal' ? 'large' : prev === 'large' ? 'xlarge' : 'normal';
      try {
        localStorage.setItem('umakonekta_a11y_font', next);
      } catch (e) {}
      return next;
    });
  }, []);

  const setHighContrast = useCallback((val) => {
    setHighContrastState(val);
    try {
      localStorage.setItem('umakonekta_a11y_contrast', String(val));
    } catch (e) {}
  }, []);

  const toggleHighContrast = useCallback(() => {
    setHighContrastState((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('umakonekta_a11y_contrast', String(next));
      } catch (e) {}
      return next;
    });
  }, []);

  const setSidebarCollapsed = useCallback((val) => {
    setSidebarCollapsedState(val);
    try {
      localStorage.setItem('umakonekta_sidebar_collapsed', String(val));
    } catch (e) {}
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsedState((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('umakonekta_sidebar_collapsed', String(next));
      } catch (e) {}
      return next;
    });
  }, []);

  const toggleMobileNav = useCallback(() => {
    setMobileNavOpen((prev) => !prev);
  }, []);

  const toggleCommandPalette = useCallback(() => {
    setCommandPaletteOpen((prev) => !prev);
  }, []);

  const announce = useCallback((message) => {
    setAnnounceMessage('');
    setTimeout(() => {
      setAnnounceMessage(message);
    }, 50);
  }, []);

  return (
    <AccessibilityContext.Provider
      value={{
        fontScale,
        setFontScale,
        cycleFontScale,
        highContrast,
        setHighContrast,
        toggleHighContrast,
        sidebarCollapsed,
        setSidebarCollapsed,
        toggleSidebar,
        mobileNavOpen,
        setMobileNavOpen,
        toggleMobileNav,
        commandPaletteOpen,
        setCommandPaletteOpen,
        toggleCommandPalette,
        announceMessage,
        announce,
      }}
    >
      {children}
      {/* Screen Reader Live Region */}
      <div
        id="a11y-live-region"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announceMessage}
      </div>
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  return useContext(AccessibilityContext);
}
