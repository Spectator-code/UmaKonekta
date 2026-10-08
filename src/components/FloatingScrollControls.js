'use client';

/**
 * @file FloatingScrollControls.js
 * @description React Component / Page for FloatingScrollControls.js. Handles UI rendering and local state.
 * @module FloatingScrollControls
 * 
 * @notes
 * - Ensure all imports are correctly resolved.
 * - Follows standard React and Next.js conventions.
 * - Requires proper authentication context for protected routes.
 */

import { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

export default function FloatingScrollControls() {
  const [isAtTop, setIsAtTop] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      setIsAtTop(scrollY < 80);
      setIsAtBottom(scrollY + clientHeight >= scrollHeight - 80);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    });
  };

  return (
    <aside
      aria-label="Page quick scroll navigation"
      className="fixed bottom-6 right-6 z-50 flex flex-col items-center p-1.5 rounded-2xl bg-white/95 backdrop-blur-md border border-primary/20 shadow-xl shadow-soil-slate/15 select-none print:hidden transition-all duration-300 hover:border-primary/40"
    >
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Scroll to top of page"
        title="Scroll to Top"
        className={`w-10 h-10 rounded-xl transition-all duration-200 flex items-center justify-center group cursor-pointer active:scale-90 ${
          isAtTop
            ? 'text-soil-slate/40 hover:text-white hover:bg-primary/80'
            : 'text-soil-slate hover:text-white hover:bg-primary'
        }`}
      >
        <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
      </button>

      <div className="w-5 h-px bg-border-soft my-1" />

      <button
        type="button"
        onClick={scrollToBottom}
        aria-label="Scroll to bottom of page"
        title="Scroll to Bottom"
        className={`w-10 h-10 rounded-xl transition-all duration-200 flex items-center justify-center group cursor-pointer active:scale-90 ${
          isAtBottom
            ? 'text-soil-slate/40 hover:text-white hover:bg-primary/80'
            : 'text-soil-slate hover:text-white hover:bg-primary'
        }`}
      >
        <ArrowDown className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
      </button>
    </aside>
  );
}
