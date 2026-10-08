'use client';

/**
 * @file SmartSearchSelect.js
 * @description React Component / Page for SmartSearchSelect.js. Handles UI rendering and local state.
 * @module SmartSearchSelect
 * 
 * @notes
 * - Ensure all imports are correctly resolved.
 * - Follows standard React and Next.js conventions.
 * - Requires proper authentication context for protected routes.
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';

/**
 * SmartSearchSelect - A modern, accessible, searchable selection component
 * Supports live search filtering, icons, category badges, subtitles, keyboard navigation, and custom entry.
 */
export default function SmartSearchSelect({
  options = [],
  value = '',
  onChange,
  placeholder = 'Select an option...',
  searchPlaceholder = 'Type to search...',
  label,
  icon,
  required = false,
  disabled = false,
  allowCustom = false,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const listRef = useRef(null);

  // ============================================================================
  // 1. DATA NORMALIZATION & FILTERING
  // ============================================================================
  // Normalize options
  const normalizedOptions = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === 'string') {
        return { value: opt, label: opt };
      }
      return opt;
    });
  }, [options]);

  // Find currently selected option
  const selectedOption = useMemo(() => {
    return normalizedOptions.find((opt) => String(opt.value) === String(value)) || null;
  }, [normalizedOptions, value]);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!query.trim()) return normalizedOptions;
    const q = query.toLowerCase().trim();
    return normalizedOptions.filter((opt) => {
      const labelMatch = (opt.label || '').toLowerCase().includes(q);
      const subMatch = (opt.subtitle || '').toLowerCase().includes(q);
      const badgeMatch = (opt.badge || '').toLowerCase().includes(q);
      const valMatch = String(opt.value || '').toLowerCase().includes(q);
      return labelMatch || subMatch || badgeMatch || valMatch;
    });
  }, [normalizedOptions, query]);

  // ============================================================================
  // 2. LIFECYCLE & EVENT LISTENERS
  // ============================================================================
  // Handle outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(0);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const handleSelect = (opt) => {
    if (onChange) {
      onChange(opt.value, opt);
    }
    setIsOpen(false);
    setQuery('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (onChange) {
      onChange('', null);
    }
    setQuery('');
  };

  // ============================================================================
  // 3. KEYBOARD NAVIGATION & ACCESSIBILITY
  // ============================================================================
  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1 < filteredOptions.length ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions[highlightedIndex]) {
        handleSelect(filteredOptions[highlightedIndex]);
      } else if (allowCustom && query.trim()) {
        handleSelect({ value: query.trim(), label: query.trim() });
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setQuery('');
    }
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef} onKeyDown={handleKeyDown}>
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1 flex items-center justify-between">
          <span>
            {label} {required && <span className="text-red-500">*</span>}
          </span>
          {selectedOption && (
            <button
              type="button"
              onClick={handleClear}
              className="text-[10px] text-soil-slate hover:text-red-600 font-semibold lowercase cursor-pointer"
            >
              clear
            </button>
          )}
        </label>
      )}

      {/* ============================================================================
          4. MAIN TRIGGER BUTTON
          ============================================================================ */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-left text-xs sm:text-sm font-semibold transition-all flex items-center justify-between gap-2 cursor-pointer shadow-2xs ${
          isOpen
            ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
            : 'border-border-soft hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20'
        } ${disabled ? 'opacity-60 cursor-not-allowed bg-surface-container' : ''}`}
      >
        <div className="flex items-center gap-2.5 truncate min-w-0">
          {(selectedOption?.icon || icon) && (
            <span className="material-symbols-outlined text-[20px] text-primary shrink-0">
              {selectedOption?.icon || icon}
            </span>
          )}
          {selectedOption ? (
            <div className="flex items-center gap-2 truncate">
              <span className="font-bold text-on-surface truncate">
                {selectedOption.label}
              </span>
              {selectedOption.badge && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#EAF5EE] text-[#1B6E39] border border-[#1B6E39]/20 shrink-0">
                  {selectedOption.badge}
                </span>
              )}
            </div>
          ) : (
            <span className="text-soil-slate/70 font-normal">
              {placeholder}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 text-soil-slate">
          {selectedOption && (
            <span
              onClick={handleClear}
              className="material-symbols-outlined text-[16px] hover:text-red-600 cursor-pointer p-0.5"
              title="Clear selection"
            >
              close
            </span>
          )}
          <span
            className="material-symbols-outlined text-[20px] transition-transform duration-200"
            style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}
          >
            expand_more
          </span>
        </div>
      </button>

      {/* ============================================================================
          5. DROPDOWN MENU & LIVE SEARCH
          ============================================================================ */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white rounded-2xl border border-border-soft shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-150">
          {/* Live Search Input */}
          <div className="relative mb-2">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-soil-slate">
              <span className="material-symbols-outlined text-[18px]">search</span>
            </span>
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setHighlightedIndex(0);
              }}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-8 py-2 text-xs font-semibold bg-surface-container-low rounded-xl border border-border-soft focus:border-primary focus:outline-none focus:bg-white text-on-surface transition-all placeholder:text-soil-slate/60"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-soil-slate hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Options List */}
          <div
            ref={listRef}
            role="listbox"
            className="max-h-60 overflow-y-auto space-y-1 overscroll-contain pr-1 divide-y divide-border-soft/40"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, idx) => {
                const isSelected = String(opt.value) === String(value);
                const isHighlighted = idx === highlightedIndex;

                return (
                  <div
                    key={opt.value + idx}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`w-full px-3 py-2 rounded-xl text-left text-xs cursor-pointer transition-colors flex items-center justify-between gap-2.5 ${
                      isSelected
                        ? 'bg-[#EAF5EE] text-[#1B6E39] font-black'
                        : isHighlighted
                        ? 'bg-surface-container-low text-primary'
                        : 'text-on-surface hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate min-w-0">
                      {opt.icon ? (
                        <span className="material-symbols-outlined text-[18px] text-primary shrink-0">
                          {opt.icon}
                        </span>
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
                      )}
                      <div className="flex flex-col truncate">
                        <span className="truncate font-bold">
                          {opt.label}
                        </span>
                        {opt.subtitle && (
                          <span className="text-[11px] text-soil-slate font-normal truncate">
                            {opt.subtitle}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {opt.badge && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white text-primary border border-border-soft">
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && (
                        <span className="material-symbols-outlined text-[16px] text-[#1B6E39]">
                          check
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : allowCustom && query.trim() ? (
              <div
                onClick={() => handleSelect({ value: query.trim(), label: query.trim() })}
                className="p-3 text-xs text-primary font-bold cursor-pointer hover:bg-primary/10 rounded-xl flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Use custom: &quot;{query.trim()}&quot;</span>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-soil-slate">
                <span className="material-symbols-outlined text-[24px] text-soil-slate/40 block mb-1">
                  search_off
                </span>
                <span>No matching options found</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
