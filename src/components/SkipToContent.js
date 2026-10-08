'use client';

/**
 * @file SkipToContent.js
 * @description React Component / Page for SkipToContent.js. Handles UI rendering and local state.
 * @module SkipToContent
 * 
 * @notes
 * - Ensure all imports are correctly resolved.
 * - Follows standard React and Next.js conventions.
 * - Requires proper authentication context for protected routes.
 */

import React from 'react';

export default function SkipToContent() {

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-4 focus:z-[9999] focus:px-5 focus:py-3 focus:bg-primary focus:text-white focus:font-extrabold focus:text-sm focus:rounded-xl focus:shadow-2xl focus:ring-4 focus:ring-primary/40 focus:outline-none transition-all flex items-center gap-2"
    >
      <span className="material-symbols-outlined text-[20px]">keyboard_double_arrow_down</span>
      <span>Skip to main content</span>
    </a>
  );
}
