'use client';

import Link from 'next/link';
import { MapPinOff, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-neutral-100 p-8 text-center">
        <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
          <MapPinOff className="w-10 h-10 text-green-600" />
        </div>
        
        <h1 className="text-4xl font-extrabold text-neutral-900 tracking-tight mb-2">
          404
        </h1>
        <h2 className="text-xl font-semibold text-neutral-800 mb-3">
          Resource Not Found
        </h2>
        
        <p className="text-neutral-500 mb-8 leading-relaxed">
          The page or agricultural resource you are looking for has been moved, deleted, or possibly never existed in our directory.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link 
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-green-600 hover:bg-green-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Home className="w-4 h-4 mr-2" />
            Return Home
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-neutral-200 text-sm font-medium rounded-xl text-neutral-700 bg-white hover:bg-neutral-50 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
      
      <div className="mt-8 text-sm text-neutral-400 font-medium">
        UmaKonekta — Agricultural Resource Platform
      </div>
    </div>
  );
}
