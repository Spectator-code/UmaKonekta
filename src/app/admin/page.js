'use client';
export default function AdminDashboard() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-surface text-primary p-4">
      <div className="text-center">
        <span className="material-symbols-outlined text-6xl mb-4">shield_person</span>
        <h1 className="text-2xl font-bold">Admin Moderation Portal</h1>
        <p className="mt-2 text-soil-slate">This module is currently being integrated into the Next.js App Router.</p>
        <a href="/login" className="mt-4 inline-block bg-primary text-white px-4 py-2 rounded-lg font-bold">Return to Login</a>
      </div>
    </div>
  );
}
