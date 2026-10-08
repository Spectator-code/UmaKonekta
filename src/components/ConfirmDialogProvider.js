'use client';

/**
 * @file ConfirmDialogProvider.js
 * @description React Component / Provider for ConfirmDialogProvider. Handles custom confirmation dialogs with safe fallback.
 * @module ConfirmDialogProvider
 * 
 * @notes
 * - Ensure all imports are correctly resolved.
 * - Follows standard React and Next.js conventions.
 * - Provides graceful window.confirm fallback if invoked outside the provider tree.
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmDialogContext = createContext(null);

export function ConfirmDialogProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: () => {},
    onCancel: () => {},
  });

  const confirm = useCallback(({ title, message, confirmText, cancelText, onConfirm, onCancel }) => {
    setConfig({
      title: title || 'Confirm Action',
      message: message || 'Are you sure you want to proceed?',
      confirmText: confirmText || 'Confirm',
      cancelText: cancelText || 'Cancel',
      onConfirm: () => {
        setIsOpen(false);
        if (onConfirm) onConfirm();
      },
      onCancel: () => {
        setIsOpen(false);
        if (onCancel) onCancel();
      },
    });
    setIsOpen(true);
  }, []);

  return (
    <ConfirmDialogContext.Provider value={confirm}>
      {children}
      
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="bg-white border-2 border-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-sm w-full p-6 relative">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 bg-red-50 border-2 border-red-200 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1 mt-1">
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">
                  {config.title}
                </h3>
              </div>
            </div>
            
            <p className="text-sm text-gray-700 font-medium mb-8 leading-relaxed">
              {config.message}
            </p>
            
            <div className="flex items-center justify-end gap-3 border-t-2 border-gray-100 pt-4">
              <button
                type="button"
                onClick={config.onCancel}
                className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-50 border-2 border-gray-200 hover:bg-gray-100 hover:text-gray-900 transition-colors uppercase tracking-wider cursor-pointer"
              >
                {config.cancelText || 'Cancel'}
              </button>
              <button
                type="button"
                onClick={config.onConfirm}
                className="px-5 py-2.5 text-sm font-black text-red-600 bg-transparent border-2 border-red-600 hover:bg-red-50 transition-colors uppercase tracking-wider cursor-pointer"
              >
                {config.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    // Safe fallback if called outside ConfirmDialogProvider to avoid uncaught crashes in error boundaries or isolated components
    return ({ title, message, onConfirm, onCancel }) => {
      if (typeof window !== 'undefined') {
        const text = `${title ? title + ':\n' : ''}${message || 'Are you sure you want to proceed?'}`;
        const confirmed = window.confirm(text);
        if (confirmed) {
          if (onConfirm) onConfirm();
        } else {
          if (onCancel) onCancel();
        }
      }
    };
  }
  return context;
}
