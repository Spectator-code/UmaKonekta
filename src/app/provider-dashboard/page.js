'use client';

import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ProviderDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState({ assets: [], requests: [] })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?role=provider')
    } else if (status === 'authenticated') {
      fetch('/api/dashboard')
        .then(res => res.json())
        .then(d => {
          setData(d)
          setIsLoading(false)
        })
    }
  }, [status, router])

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-surface">
        <span className="material-symbols-outlined text-4xl animate-spin text-primary">sync</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-surface text-on-surface">
      <div className="bg-primary text-white py-8 px-4 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold font-headline-sm">{session?.user?.name}</h1>
            <p className="text-primary-container font-label-md mt-1">Registry ID: {session?.user?.registryId}</p>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
          >
            <span className="material-symbols-outlined">logout</span>
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-8 px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Assets */}
        <div className="md:col-span-1 flex flex-col gap-4">
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-border-soft pb-2">
            <span className="material-symbols-outlined text-primary">agriculture</span>
            My Machinery
          </h2>
          {data.assets.length === 0 ? (
            <p className="text-soil-slate text-sm">No machinery registered yet.</p>
          ) : (
            data.assets.map(asset => (
              <div key={asset.id} className="bg-surface-container rounded-xl p-4 shadow-sm border border-border-soft">
                <h3 className="font-bold text-lg">{asset.name}</h3>
                <p className="text-sm text-soil-slate capitalize mt-1">{asset.type} • {asset.location}</p>
                <div className="mt-3 flex justify-between items-center">
                  <span className="font-bold text-field-ochre">₱{asset.rate} / {asset.unit === 'per_ha' ? 'Ha' : 'Day'}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${asset.status === 'available' ? 'bg-status-available-bg text-status-available' : 'bg-status-urgent-bg text-status-urgent'} font-bold uppercase`}>
                    {asset.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Dispatch Requests */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-border-soft pb-2">
            <span className="material-symbols-outlined text-field-ochre">receipt_long</span>
            Incoming Dispatches
          </h2>
          {data.requests.length === 0 ? (
            <div className="text-center py-12 bg-surface-container rounded-xl border border-border-soft border-dashed">
              <span className="material-symbols-outlined text-4xl text-soil-slate/50">inbox</span>
              <p className="mt-2 text-soil-slate font-bold">No active requests.</p>
            </div>
          ) : (
            data.requests.map(req => (
              <div key={req.id} className="bg-surface-container rounded-xl p-5 shadow-sm border border-border-soft flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">person</span>
                    <span className="font-bold">{req.farmer.name}</span>
                  </div>
                  <p className="text-sm text-soil-slate mt-1">Requested {req.asset.name} for {req.hectares || '?'} Ha.</p>
                  <p className="text-xs text-on-surface-variant mt-2 font-mono">ID: {req.id.split('-')[0]}</p>
                </div>
                <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                   <span className="text-xs px-2 py-1 rounded-full bg-status-pending-bg text-status-pending font-bold uppercase">
                    {req.status}
                  </span>
                  <div className="flex gap-2 mt-2">
                    <button className="px-4 py-2 bg-status-available text-white rounded-lg font-bold hover:bg-status-available/90 text-sm">Approve</button>
                    <button className="px-4 py-2 bg-surface-subtle text-on-surface rounded-lg font-bold hover:bg-border-soft text-sm">Deny</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
