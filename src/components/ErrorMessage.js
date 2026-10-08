import React from 'react';

export default function ErrorMessage({ error, onDismiss }) {
  if (!error) return null;
  return (
    <div className="mt-2 p-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[11px] leading-tight flex items-start gap-1.5 animate-fadeIn">
      <span className="material-symbols-outlined text-[15px] shrink-0 text-red-600">error</span>
      <div className="flex-1">
        <span className="font-bold">Error: </span>
        <span>{error}</span>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-red-500 hover:text-red-800 text-[13px] leading-none"
        >
          ×
        </button>
      )}
    </div>
  );
}
