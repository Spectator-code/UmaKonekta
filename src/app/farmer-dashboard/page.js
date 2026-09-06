'use client';

import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function FarmerDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState({ requests: [] })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?role=farmer')
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
      <div className="bg-field-ochre text-white py-8 px-4 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold font-headline-sm">{session?.user?.name}</h1>
            <p className="text-white/80 font-label-md mt-1">RSBSA ID: {session?.user?.registryId}</p>
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

      <div className="max-w-6xl mx-auto py-8 px-4">
        <h2 className="text-2xl font-bold flex items-center gap-2 border-b border-border-soft pb-2 mb-6">
          <span className="material-symbols-outlined text-primary">history</span>
          My Dispatch Requests
        </h2>
        
        {data.requests?.length === 0 ? (
          <div className="text-center py-12 bg-surface-container rounded-xl border border-border-soft border-dashed">
            <span className="material-symbols-outlined text-4xl text-soil-slate/50">history</span>
            <p className="mt-2 text-soil-slate font-bold">You have not requested any machinery yet.</p>
            <button onClick={() => router.push('/marketplace')} className="mt-4 px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90">Browse Marketplace</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {data.requests?.map(req => (
              <div key={req.id} className="bg-surface-container rounded-xl p-5 shadow-sm border border-border-soft flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-field-ochre">store</span>
                    <span className="font-bold text-lg">{req.asset?.provider?.name || 'Provider'}</span>
                  </div>
                  <p className="text-sm text-soil-slate mt-1">Machine: <span className="font-semibold text-on-surface">{req.asset?.name}</span></p>
                  <p className="text-sm text-soil-slate mt-1">Requested Hectares: <span className="font-semibold">{req.hectares || 'Not specified'} Ha</span></p>
                </div>
                <div className="flex flex-col items-end gap-2">
                   <span className="text-sm px-3 py-1 rounded-full bg-status-pending-bg text-status-pending font-bold uppercase">
                    {req.status}
                  </span>
                  <p className="text-xs text-on-surface-variant font-mono mt-1">Ref: {req.id}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
