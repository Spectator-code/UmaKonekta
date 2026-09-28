'use client';

import React, { useMemo } from 'react';

export function calculatePasswordStrength(password = '') {
  const criteria = [
    { id: 'length', label: 'At least 8 characters', met: password.length >= 8 },
    { id: 'noSpaces', label: 'No spaces allowed', met: password.length > 0 && !/\s/.test(password) },
    { id: 'uppercase', label: 'Uppercase letter (A-Z)', met: /[A-Z]/.test(password) },
    { id: 'lowercase', label: 'Lowercase letter (a-z)', met: /[a-z]/.test(password) },
    { id: 'number', label: 'Number (0-9)', met: /[0-9]/.test(password) },
    { id: 'special', label: 'Special characters', met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password) },
  ];

  const score = criteria.filter((c) => c.met).length;

  let label = 'Very Weak';
  let color = 'bg-red-500';
  let textColor = 'text-red-600';
  let percentage = 20;

  if (score === 0) {
    label = 'Too Short';
    color = 'bg-gray-300';
    textColor = 'text-soil-slate';
    percentage = 0;
  } else if (score === 1) {
    label = 'Very Weak';
    color = 'bg-red-500';
    textColor = 'text-red-600';
    percentage = 15;
  } else if (score === 2) {
    label = 'Weak';
    color = 'bg-orange-500';
    textColor = 'text-orange-600';
    percentage = 35;
  } else if (score === 3) {
    label = 'Fair';
    color = 'bg-amber-500';
    textColor = 'text-amber-600';
    percentage = 55;
  } else if (score === 4) {
    label = 'Good';
    color = 'bg-yellow-500';
    textColor = 'text-yellow-600';
    percentage = 75;
  } else if (score === 5) {
    label = 'Strong';
    color = 'bg-emerald-500';
    textColor = 'text-emerald-600';
    percentage = 90;
  } else if (score >= 6) {
    label = 'Very Strong & Secure';
    color = 'bg-primary';
    textColor = 'text-primary';
    percentage = 100;
  }

  const isCompliant = criteria.every((c) => c.met);

  return {
    score,
    label,
    color,
    textColor,
    percentage,
    criteria,
    isCompliant,
  };
}

export default function PasswordStrengthIndicator({ password = '', showCriteria = true }) {
  const { score, label, color, textColor, criteria } = useMemo(
    () => calculatePasswordStrength(password),
    [password]
  );

  if (!password) return null;

  return (
    <div className="space-y-2 mt-2 pt-1 animate-in fade-in duration-200" aria-live="polite">
      {/* Strength Bar & Label */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-soil-slate">Password Strength:</span>
        <span className={`font-black font-mono tracking-wide ${textColor}`}>
          {label}
        </span>
      </div>

      {/* 6-segment Progress Bar */}
      <div className="grid grid-cols-6 gap-1 h-1.5 w-full bg-surface-container-low rounded-full overflow-hidden p-0.5 border border-border-soft">
        {[1, 2, 3, 4, 5, 6].map((level) => (
          <div
            key={level}
            className={`h-full rounded-full transition-all duration-300 ${score >= level ? color : 'bg-transparent'
              }`}
          />
        ))}
      </div>

      {/* Detailed Checklist */}
      {showCriteria && (
        <div className="pt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] font-medium text-soil-slate">
          {criteria.map((c) => (
            <div
              key={c.id}
              className={`flex items-center gap-1.5 transition-colors ${c.met ? 'text-primary font-bold' : 'text-soil-slate/70'
                }`}
            >
              <span className="material-symbols-outlined text-[15px] shrink-0">
                {c.met ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              <span>{c.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
