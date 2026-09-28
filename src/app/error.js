'use client';

import { useEffect, useState } from 'react';
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  ShieldAlert, 
  Trash2,
  PhoneCall
} from 'lucide-react';
import Link from 'next/link';
import { useConfirm } from '@/components/ConfirmDialogProvider';

export default function Error({ error, reset }) {
  const confirm = useConfirm();
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    console.error('Unhandled application error:', error);
  }, [error]);

  const handleCopy = () => {
    const errorText = `[UmaKonekta Error Log]\nMessage: ${error?.message || 'Unknown'}\nDigest: ${error?.digest || 'N/A'}\nStack: ${error?.stack || 'N/A'}\nTimestamp: ${new Date().toISOString()}`;
    navigator.clipboard?.writeText(errorText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      reset();
      setIsRetrying(false);
    }, 400);
  };

  const handleClearCache = () => {
    if (typeof window !== 'undefined') {
      confirm({
        title: 'Clear Session Cache',
        message: 'Are you sure you want to clear your local session cache? This will log you out and clear stored preferences.',
        onConfirm: () => {
          try {
            localStorage.clear();
            sessionStorage.clear();
          } catch (e) {
            // ignore
          }
          window.location.reload();
        }
      });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#005426_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />

      <main className="relative max-w-lg w-full bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-emerald-950/5 border border-[#DDE3DA] p-6 sm:p-8 text-center transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Status Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200/80 text-red-700 text-xs font-mono font-semibold mb-6">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span>System Interruption • Edge Diagnostics</span>
        </div>

        {/* Warning Icon Badge */}
        <div className="relative mx-auto w-20 h-20 mb-5 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-red-500/20 to-amber-500/20 rotate-6" />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/25 text-white">
            <AlertTriangle className="w-8 h-8" />
          </div>
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight font-sans">
          Service Request Paused
        </h1>
        
        <p className="text-sm text-gray-600 mt-2 mb-6 leading-relaxed max-w-md mx-auto">
          UmaKonekta encountered an unexpected interruption while processing your agricultural ledger or dispatch stream.
        </p>

        {/* Collapsible Error Trace Box */}
        <div className="mb-6 rounded-2xl bg-[#F8FAFC] border border-[#DDE3DA] overflow-hidden text-left transition-all">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-gray-700 hover:bg-gray-100/70 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Diagnostic Details & Stack Code</span>
            </span>
            <span className="flex items-center gap-1 text-gray-500 text-[11px] font-mono">
              {showDetails ? 'Hide' : 'Inspect'}
              {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </span>
          </button>

          <div className={`px-4 pb-3 transition-all ${showDetails ? 'block border-t border-gray-200/80 pt-3' : 'hidden'}`}>
            <div className="bg-gray-900 rounded-xl p-3 text-xs font-mono text-emerald-400 space-y-1.5 overflow-x-auto max-h-40">
              <p className="text-gray-400 text-[10px] uppercase tracking-wider">Digest / ID</p>
              <p className="text-white break-all">{error?.digest || 'ERR_INTERNAL_TRANSACTION_RETRY'}</p>
              <p className="text-gray-400 text-[10px] uppercase tracking-wider pt-1">Error Message</p>
              <p className="text-amber-300 break-words">{error?.message || 'An unknown runtime exception occurred.'}</p>
            </div>

            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[11px] text-gray-500 font-mono">Click to copy trace for MAO Helpdesk:</span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-gray-500" />
                    <span>Copy Trace</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#005426] to-[#1B6E39] hover:from-[#004720] hover:to-[#165a2f] shadow-md shadow-emerald-900/15 transition-all active:scale-[0.98] disabled:opacity-70"
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Retrying…' : 'Try Again'}</span>
          </button>
          
          <Link 
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-gray-700 bg-white border border-[#DDE3DA] hover:bg-gray-50 hover:border-gray-300 transition-all shadow-xs active:scale-[0.98]"
          >
            <Home className="w-4 h-4 text-gray-500" />
            <span>Return Home</span>
          </Link>

          <button
            type="button"
            onClick={handleClearCache}
            title="Clear stored session cache and force reload"
            className="w-full sm:w-auto inline-flex items-center justify-center p-3 rounded-xl text-gray-500 bg-white border border-[#DDE3DA] hover:text-red-600 hover:border-red-200 hover:bg-red-50/50 transition-all shadow-xs"
          >
            <Trash2 className="w-4 h-4" />
            <span className="sm:hidden ml-2 text-xs font-medium">Reset Session Cache</span>
          </button>
        </div>

        {/* LGU Support Footer */}
        <div className="mt-8 pt-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-2">
          <span className="font-medium">UmaKonekta • Republic of the Philippines</span>
          <a
            href="tel:09190000002"
            className="inline-flex items-center gap-1 text-emerald-800 hover:underline font-mono font-medium"
          >
            <PhoneCall className="w-3 h-3 text-emerald-600" />
            <span>Hotline: 0919-000-0002</span>
          </a>
        </div>
      </main>
    </div>
  );
}
