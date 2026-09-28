'use client';

import React from 'react';

export default function MainContentWrapper({ children }) {
  return (
    <div className="flex-1 flex flex-col pt-20 transition-all duration-300 min-h-screen">
      <main
        id="main-content"
        role="main"
        tabIndex="-1"
        className="flex-1 focus:outline-none"
      >
        {children}
      </main>
    </div>
  );
}
