'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ShieldAlert, Shield, Trash2, Ban, ShieldCheck, Activity, Terminal, AlertTriangle, Lock, Users, Radar, Crosshair, Search, Copy, Cpu, X, History, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { useConfirm } from '@/components/ConfirmDialogProvider';

export default function SecOpsDashboard() {
  const confirm = useConfirm();
  const { data: session, status } = useSession();
  const [logs, setLogs] = useState([]);
  const [traffic, setTraffic] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('siem'); // siem, directory, radar
  
  const [loading, setLoading] = useState(true);
  const [targetUser, setTargetUser] = useState('');
  const [targetIp, setTargetIp] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lockdownActive, setLockdownActive] = useState(false);
  const [cyguardActive, setCyguardActive] = useState(false);
  
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, ip: null, registryId: null });
  const [dossier, setDossier] = useState(null);
  const [userHistory, setUserHistory] = useState(null);

  // Filters
  const [siemFilter, setSiemFilter] = useState({ ip: '', date: '' });
  const [trafficFilter, setTrafficFilter] = useState({ ip: '', date: '' });
  const [directorySearch, setDirectorySearch] = useState('');

  useEffect(() => {
    const handleClick = () => setContextMenu({ visible: false, x: 0, y: 0, ip: null, registryId: null });
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData();
      const interval = setInterval(fetchData, 10000);
      return () => clearInterval(interval);
    }
  }, [status, activeTab]);

  // Synchronize hash in URL to active tabs (#threats, #directory, #siem)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#threats' || hash === '#radar') {
        setActiveTab('radar');
      } else if (hash === '#directory' || hash === '#users') {
        setActiveTab('directory');
      } else if (hash === '#siem' || hash === '#logs') {
        setActiveTab('siem');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const fetchData = async () => {
    fetchSystemState();
    if (activeTab === 'siem') fetchLogs();
    if (activeTab === 'directory') fetchUsers();
    if (activeTab === 'radar') fetchTraffic();
    setLoading(false);
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/x9f-ops/logs');
      if (res.ok) setLogs((await res.json()).logs);
    } catch (e) {}
  };

  const fetchTraffic = async () => {
    try {
      const res = await fetch('/api/x9f-ops/track');
      if (res.ok) setTraffic((await res.json()).traffic);
    } catch (e) {}
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/x9f-ops/users');
      if (res.ok) setUsers((await res.json()).users);
    } catch (e) {}
  };

  const fetchSystemState = async () => {
    try {
      const res1 = await fetch('/api/x9f-ops/lockdown');
      if (res1.ok) setLockdownActive((await res1.json()).active);
      
      const res2 = await fetch('/api/x9f-ops/cyguard');
      if (res2.ok) setCyguardActive((await res2.json()).active);
    } catch (e) {}
  };

  const handleBanToggle = async (target, ban) => {
    if (!target) return alert('Enter a Registry ID to target.');
    confirm({
      title: 'Confirm Action',
      message: `Are you sure you want to ${ban ? 'BAN' : 'UNBAN'} ${target}?`,
      onConfirm: async () => {
        setIsProcessing(true);
        try {
          const res = await fetch('/api/x9f-ops/ban-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ registryId: target, ban })
          });
          if (res.ok) {
            setTargetUser('');
            fetchData();
          } else {
            alert((await res.json()).error || 'Failed.');
          }
        } catch (e) {
          alert('Error.');
        } finally {
          setIsProcessing(false);
        }
      }
    });
  };

  const handleFirewall = async (action) => {
    if (!targetIp) return alert('Enter an IP address to target.');
    confirm({
      title: 'Confirm Firewall Action',
      message: `Are you sure you want to ${action} ${targetIp}?`,
      onConfirm: async () => {
        setIsProcessing(true);
        try {
          const res = await fetch('/api/x9f-ops/firewall', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ipAddress: targetIp, action })
          });
          if (res.ok) {
            alert((await res.json()).message);
            setTargetIp('');
            fetchData();
          }
        } catch (e) {
          alert('Error.');
        } finally {
          setIsProcessing(false);
        }
      }
    });
  };

  const toggleLockdown = async () => {
    const newState = !lockdownActive;
    if (newState) {
      confirm({
        title: 'Activate Lockdown',
        message: 'DEFCON 1 WARNING: Suspends all non-SecOps auth. Proceed?',
        onConfirm: executeLockdown
      });
    } else {
      executeLockdown();
    }

    async function executeLockdown() {
      setIsProcessing(true);
      try {
        const res = await fetch('/api/x9f-ops/lockdown', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ activate: newState })
        });
        if (res.ok) fetchData();
      } catch (e) { } finally { setIsProcessing(false); }
    }
  };

  const toggleCyguard = async () => {
    const newState = !cyguardActive;
    if (newState) {
      confirm({
        title: 'Activate Cyguard',
        message: 'ARM CYGUARD? The AI will autonomously fire responses and execute WAF blocks.',
        onConfirm: executeCyguard
      });
    } else {
      executeCyguard();
    }

    async function executeCyguard() {
      setIsProcessing(true);
      try {
        const res = await fetch('/api/x9f-ops/cyguard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ activate: newState })
        });
        if (res.ok) fetchData();
      } catch (e) { } finally { setIsProcessing(false); }
    }
  };

  const handlePurgeLogs = async () => {
    confirm({
      title: 'Purge Logs',
      message: 'CRITICAL WARNING: Permanent SIEM destruction. Proceed?',
      onConfirm: async () => {
        try {
          const res = await fetch('/api/x9f-ops/purge-logs', { method: 'POST' });
          if (res.ok) fetchData();
        } catch (e) {}
      }
    });
  };

  const handleContextMenu = (e, targetData) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      ...targetData
    });
  };

  const generateDossier = async (ip) => {
    setIsProcessing(true);
    setDossier(null);
    try {
      const res = await fetch('/api/x9f-ops/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ipAddress: ip })
      });
      if (res.ok) {
        setDossier(await res.json());
      } else {
        alert('Failed to generate dossier.');
      }
    } catch (e) {
      alert('Error generating dossier.');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateUserHistory = async (registryId) => {
    setIsProcessing(true);
    setUserHistory(null);
    try {
      const res = await fetch('/api/x9f-ops/user-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registryId })
      });
      if (res.ok) {
        setUserHistory(await res.json());
      } else {
        alert('Failed to generate user history.');
      }
    } catch (e) {
      alert('Error generating user history.');
    } finally {
      setIsProcessing(false);
    }
  };

  const executeContextMenuBlock = () => {
    if (contextMenu.ip) {
      setTargetIp(contextMenu.ip);
      confirm({
        title: 'Block IP',
        message: `Are you sure you want to BLOCK ${contextMenu.ip}?`,
        onConfirm: () => {
          setIsProcessing(true);
          fetch('/api/x9f-ops/firewall', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ipAddress: contextMenu.ip, action: 'BLOCK' })
          }).then(res => res.json()).then(data => {
            alert(data.message || 'Processed');
            fetchData();
          }).finally(() => setIsProcessing(false));
        }
      });
    }
  };

  // Filtered Data
  const filteredLogs = logs.filter(log => {
    const matchIp = siemFilter.ip ? log.ipAddress?.includes(siemFilter.ip) : true;
    const matchDate = siemFilter.date ? log.createdAt.startsWith(siemFilter.date) : true;
    return matchIp && matchDate;
  });

  const filteredTraffic = traffic.filter(t => {
    const matchIp = trafficFilter.ip ? t.ipAddress?.includes(trafficFilter.ip) : true;
    const matchDate = trafficFilter.date ? new Date(t.timestamp).toISOString().startsWith(trafficFilter.date) : true;
    return matchIp && matchDate;
  });

  const filteredUsers = users.filter(u => {
    if (!directorySearch) return true;
    const search = directorySearch.toLowerCase();
    return (u.registryId?.toLowerCase().includes(search) || u.name?.toLowerCase().includes(search) || u.role?.toLowerCase().includes(search));
  });

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-green-500 font-mono">
        <Terminal className="w-8 h-8 animate-pulse mr-3" /> INITIALIZING SECOPS TERMINAL...
      </div>
    );
  }

  if (session?.user?.role !== 'secops' && session?.user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-red-500 font-mono">
        <ShieldAlert className="w-12 h-12 mb-4" />
        <h1 className="text-2xl ml-4">UNAUTHORIZED ACCESS.</h1>
      </div>
    );
  }

  return (
    <div className={`min-h-screen text-slate-300 font-mono p-8 selection:bg-green-500/30 transition-colors duration-1000 ${lockdownActive ? 'bg-red-950/20' : 'bg-slate-950'}`}>
      
      {/* DOSSIER MODAL */}
      {dossier && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-slate-950 border border-slate-700 rounded-xl w-full max-w-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center">
              <h2 className="text-green-500 font-bold tracking-widest flex items-center gap-2">
                <Cpu className="w-5 h-5 animate-pulse" /> CYGUARD THREAT DOSSIER
              </h2>
              <button onClick={() => setDossier(null)} className="text-slate-500 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Target Identity</div>
                  <div className="text-2xl font-bold text-white tracking-widest">{dossier.ipAddress}</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Threat Classification</div>
                  <div className={`text-2xl font-bold tracking-widest ${
                    dossier.designation === 'CRITICAL_THREAT' ? 'text-red-500 animate-pulse' :
                    dossier.designation === 'HOSTILE_ACTOR' ? 'text-orange-500' :
                    dossier.designation === 'SUSPICIOUS' ? 'text-yellow-500' : 'text-green-500'
                  }`}>
                    {dossier.designation.replace('_', ' ')}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-center">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Threat Score</div>
                  <div className={`text-3xl font-bold ${dossier.threatScore > 70 ? 'text-red-500' : 'text-white'}`}>{dossier.threatScore}/100</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-center">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Total Connections</div>
                  <div className="text-3xl font-bold text-white">{dossier.totalRequests}</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-center">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Accounts Targeted</div>
                  <div className="text-3xl font-bold text-orange-500">{dossier.accountsTargeted.length}</div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-3">Identified Attack Vectors</div>
                {dossier.attackVectors.length === 0 ? <div className="text-sm text-green-500">NO MALICIOUS ACTIVITY DETECTED</div> : (
                  <div className="flex flex-wrap gap-2">
                    {dossier.attackVectors.map(v => (
                      <span key={v} className="bg-red-500/10 text-red-500 border border-red-500/30 px-3 py-1 rounded-full text-xs font-bold">{v}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 max-h-[150px] overflow-y-auto custom-scrollbar">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-3">Fingerprints (User-Agents)</div>
                <div className="space-y-2">
                  {dossier.userAgents.map((ua, i) => (
                    <div key={i} className="text-xs text-slate-400 font-sans">{ua}</div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* USER HISTORY MODAL */}
      {userHistory && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-slate-950 border border-slate-700 rounded-xl w-full max-w-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shrink-0">
              <h2 className="text-green-500 font-bold tracking-widest flex items-center gap-2">
                <History className="w-5 h-5 animate-pulse" /> USER BEHAVIORAL DOSSIER
              </h2>
              <button onClick={() => setUserHistory(null)} className="text-slate-500 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="p-6 shrink-0 border-b border-slate-800 bg-slate-900/50">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Target Account</div>
                  <div className="text-2xl font-bold text-white tracking-widest">{userHistory.user.registryId}</div>
                  <div className="text-sm text-slate-400 mt-1">{userHistory.user.name} ({userHistory.user.role.toUpperCase()})</div>
                </div>
                <div>
                  {userHistory.user.isBanned ? (
                     <div className="px-4 py-2 border border-red-500/50 bg-red-500/10 text-red-500 font-bold rounded-lg tracking-widest animate-pulse flex items-center gap-2">
                       <Ban className="w-4 h-4"/> BANNED
                     </div>
                  ) : (
                     <div className="px-4 py-2 border border-green-500/50 bg-green-500/10 text-green-500 font-bold rounded-lg tracking-widest flex items-center gap-2">
                       <ShieldCheck className="w-4 h-4"/> ACTIVE
                     </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest">Historical SIEM Events (Last 50)</div>
              {userHistory.history.length === 0 ? (
                <div className="p-8 text-center text-slate-600 bg-slate-900/50 border border-slate-800 rounded-lg">NO HISTORY FOUND</div>
              ) : (
                <div className="relative border-l border-slate-800 ml-3 space-y-6">
                  {userHistory.history.map((log) => (
                    <div key={log.id} className="relative pl-6">
                      <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ${
                          log.severity === 'CRITICAL' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' :
                          log.severity === 'HIGH' ? 'bg-orange-500' :
                          log.severity === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                      <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-sm font-bold tracking-widest ${
                            log.severity === 'CRITICAL' ? 'text-red-500' :
                            log.severity === 'HIGH' ? 'text-orange-500' :
                            log.severity === 'MEDIUM' ? 'text-yellow-500' : 'text-green-500'
                          }`}>[{log.eventType}]</span>
                          <span className="text-[10px] text-slate-500">{format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss')}</span>
                        </div>
                        <div className="text-xs text-slate-400 font-sans mb-2">{log.details}</div>
                        <div className="text-[10px] text-slate-500">Origin IP: {log.ipAddress}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* TACTICAL CONTEXT MENU */}
      {contextMenu.visible && (
        <div 
          className="fixed z-50 bg-slate-950 border border-slate-700 rounded-lg shadow-2xl py-2 w-64 shadow-[0_10px_40px_rgba(0,0,0,0.8)]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          {contextMenu.ip && (
            <>
              <div className="px-4 py-2 border-b border-slate-800 mb-1">
                <span className="text-[10px] text-slate-500 tracking-widest uppercase">Target IP</span>
                <div className="text-green-500 font-bold text-sm">{contextMenu.ip}</div>
              </div>
              <button onClick={() => generateDossier(contextMenu.ip)} className="w-full text-left px-4 py-2 text-xs font-bold tracking-widest text-green-400 hover:bg-green-950 hover:text-green-300 flex items-center gap-2">
                <Cpu className="w-3 h-3" /> [CYGUARD] GENERATE DOSSIER
              </button>
              <div className="border-t border-slate-800 my-1"></div>
              <button onClick={() => window.open(`https://www.abuseipdb.com/check/${contextMenu.ip}`, '_blank')} className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2">
                <Search className="w-3 h-3" /> Investigate via AbuseIPDB
              </button>
              <button onClick={() => window.open(`https://ipinfo.io/${contextMenu.ip}`, '_blank')} className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2">
                <Search className="w-3 h-3" /> Investigate via IPInfo
              </button>
              <button onClick={() => navigator.clipboard.writeText(contextMenu.ip)} className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2">
                <Copy className="w-3 h-3" /> Copy IP Address
              </button>
              <div className="border-t border-slate-800 my-1"></div>
              <button onClick={executeContextMenuBlock} className="w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-red-950 hover:text-red-400 font-bold flex items-center gap-2">
                <Crosshair className="w-3 h-3" /> EXECUTE WAF BLOCK
              </button>
            </>
          )}

          {contextMenu.registryId && (
            <>
              <div className="px-4 py-2 border-b border-slate-800 mb-1">
                <span className="text-[10px] text-slate-500 tracking-widest uppercase">Target User</span>
                <div className="text-green-500 font-bold text-sm">{contextMenu.registryId}</div>
              </div>
              <button onClick={() => generateUserHistory(contextMenu.registryId)} className="w-full text-left px-4 py-2 text-xs font-bold tracking-widest text-green-400 hover:bg-green-950 hover:text-green-300 flex items-center gap-2">
                <History className="w-3 h-3" /> [CYGUARD] VIEW HISTORY
              </button>
              <div className="border-t border-slate-800 my-1"></div>
              <button onClick={() => navigator.clipboard.writeText(contextMenu.registryId)} className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2">
                <Copy className="w-3 h-3" /> Copy Registry ID
              </button>
            </>
          )}
        </div>
      )}

      {/* Header */}
      <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
            <ShieldCheck className="text-green-500 w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-widest">SECOPS COMMAND CENTER</h1>
            <p className="text-xs text-green-500/70 tracking-widest flex items-center gap-2">
              <Activity className="w-3 h-3 animate-pulse" /> LIVE TELEMETRY FEED
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-400">OPERATOR: <span className="text-white font-bold">{session?.user?.registryId || 'secops-1-23-A001'}</span></p>
          <p className="text-xs text-slate-500 mt-1">{format(new Date(), 'yyyy-MM-dd HH:mm:ss')} PHT</p>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Active Defense Tools (Left Column) */}
        <div className="xl:col-span-1 space-y-6">
          
          <div className={`border rounded-xl p-6 relative overflow-hidden transition-all ${cyguardActive ? 'bg-green-950/20 border-green-500/50' : 'bg-slate-900 border-slate-800'}`}>
            {cyguardActive && <div className="absolute inset-0 bg-green-500/5 animate-pulse pointer-events-none"></div>}
            <h2 className={`text-sm font-bold tracking-widest mb-4 flex items-center gap-2 ${cyguardActive ? 'text-green-500' : 'text-white'}`}>
              <Cpu className={`w-4 h-4 ${cyguardActive ? 'text-green-500 animate-pulse' : 'text-slate-500'}`} /> CYGUARD AI ENGINE
            </h2>
            <button 
              onClick={toggleCyguard}
              disabled={isProcessing}
              className={`w-full py-4 rounded-lg text-sm font-bold tracking-widest transition-all flex items-center justify-center gap-3 ${
                cyguardActive ? 'bg-green-600/20 text-green-400 border border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.2)]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <Cpu className="w-5 h-5" /> {cyguardActive ? 'CYGUARD ARMED' : 'ARM CYGUARD'}
            </button>
          </div>

          <div className={`border rounded-xl p-6 relative overflow-hidden transition-all ${lockdownActive ? 'bg-red-900/20 border-red-500/50' : 'bg-slate-900 border-slate-800'}`}>
            {lockdownActive && <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none"></div>}
            <h2 className={`text-sm font-bold tracking-widest mb-4 flex items-center gap-2 ${lockdownActive ? 'text-red-500' : 'text-white'}`}>
              <AlertTriangle className={`w-4 h-4 ${lockdownActive ? 'text-red-500 animate-pulse' : 'text-yellow-500'}`} /> GLOBAL LOCKDOWN
            </h2>
            <button 
              onClick={toggleLockdown}
              disabled={isProcessing}
              className={`w-full py-4 rounded-lg text-sm font-bold tracking-widest transition-all flex items-center justify-center gap-3 ${
                lockdownActive ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-red-600 text-white hover:bg-red-700 shadow-[0_0_20px_rgba(220,38,38,0.2)]'
              }`}
            >
              <Lock className="w-5 h-5" /> {lockdownActive ? 'LIFT LOCKDOWN' : 'INITIATE DEFCON 1'}
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-sm font-bold text-white tracking-widest mb-6 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-orange-500" /> WAF: IP FIREWALL
            </h2>
            <div className="space-y-4">
              <input type="text" value={targetIp} onChange={(e) => setTargetIp(e.target.value)} placeholder="IP Address" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white text-xs focus:border-orange-500 focus:outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleFirewall('BLOCK')} className="bg-orange-500/10 text-orange-500 border border-orange-500/30 py-3 rounded-lg text-[10px] font-bold hover:bg-orange-500 hover:text-white transition-all">BLOCK IP</button>
                <button onClick={() => handleFirewall('UNBLOCK')} className="bg-slate-800 text-slate-300 border border-slate-700 py-3 rounded-lg text-[10px] font-bold hover:bg-slate-700">UNBLOCK IP</button>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-sm font-bold text-white tracking-widest mb-6 flex items-center gap-2">
              <Ban className="w-4 h-4 text-red-500" /> THREAT NEUTRALIZATION
            </h2>
            <div className="space-y-4">
              <input type="text" value={targetUser} onChange={(e) => setTargetUser(e.target.value)} placeholder="Registry ID (e.g., farmer-1-23-A001)" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white text-xs focus:border-red-500 focus:outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleBanToggle(targetUser, true)} className="bg-red-500/10 text-red-500 border border-red-500/30 py-3 rounded-lg text-[10px] font-bold hover:bg-red-500 hover:text-white transition-all">EXECUTE BAN</button>
                <button onClick={() => handleBanToggle(targetUser, false)} className="bg-green-500/10 text-green-500 border border-green-500/30 py-3 rounded-lg text-[10px] font-bold hover:bg-green-500 hover:text-white transition-all">RESTORE</button>
              </div>
            </div>
          </div>
          
          <button onClick={handlePurgeLogs} className="w-full bg-slate-950 text-slate-500 border border-slate-800 hover:text-red-400 py-3 rounded-lg text-[10px] font-bold flex items-center justify-center gap-2">
            <Trash2 className="w-4 h-4" /> PURGE LOGS
          </button>
        </div>

        {/* Data Views (Right Column) */}
        <div className="xl:col-span-3">
          
          {/* Tabs */}
          <div className="flex gap-2 mb-4 border-b border-slate-800 pb-px">
            <button 
              onClick={() => setActiveTab('siem')}
              className={`px-6 py-3 text-sm font-bold tracking-widest flex items-center gap-2 border-b-2 ${activeTab === 'siem' ? 'border-green-500 text-white bg-green-500/5' : 'border-transparent text-slate-500 hover:text-slate-400'}`}
            >
              <Shield className="w-4 h-4" /> SIEM ALERTS
            </button>
            <button 
              onClick={() => setActiveTab('radar')}
              className={`px-6 py-3 text-sm font-bold tracking-widest flex items-center gap-2 border-b-2 ${activeTab === 'radar' ? 'border-green-500 text-white bg-green-500/5' : 'border-transparent text-slate-500 hover:text-slate-400'}`}
            >
              <Radar className="w-4 h-4" /> LIVE TRAFFIC
            </button>
            <button 
              onClick={() => setActiveTab('directory')}
              className={`px-6 py-3 text-sm font-bold tracking-widest flex items-center gap-2 border-b-2 ${activeTab === 'directory' ? 'border-green-500 text-white bg-green-500/5' : 'border-transparent text-slate-500 hover:text-slate-400'}`}
            >
              <Users className="w-4 h-4" /> GLOBAL DIRECTORY
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden h-[750px] flex flex-col shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            
            {/* SIEM TAB */}
            {activeTab === 'siem' && (
              <>
                {/* Filters */}
                <div className="p-4 border-b border-slate-800 bg-slate-950 flex gap-4">
                  <div className="flex-1 flex items-center bg-slate-900 border border-slate-800 rounded-lg px-3">
                    <Filter className="w-4 h-4 text-slate-500 mr-2" />
                    <input 
                      type="text" 
                      placeholder="Filter by IP Address..." 
                      className="bg-transparent text-xs text-white outline-none w-full py-2"
                      value={siemFilter.ip}
                      onChange={e => setSiemFilter({ ...siemFilter, ip: e.target.value })}
                    />
                  </div>
                  <div className="w-48 flex items-center bg-slate-900 border border-slate-800 rounded-lg px-3">
                    <input 
                      type="date" 
                      className="bg-transparent text-xs text-slate-400 outline-none w-full py-2"
                      value={siemFilter.date}
                      onChange={e => setSiemFilter({ ...siemFilter, date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                  {filteredLogs.length === 0 ? <div className="p-8 text-center text-slate-600">NO ALERTS FOUND</div> : filteredLogs.map(log => (
                    <div key={log.id} className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex gap-4 hover:border-slate-700 transition-all">
                      <div className="mt-1">
                        {log.severity === 'CRITICAL' ? <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                        : log.severity === 'HIGH' ? <div className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                        : log.severity === 'MEDIUM' ? <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        : <div className="w-3 h-3 rounded-full bg-green-500" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-sm font-bold tracking-widest ${
                            log.severity === 'CRITICAL' ? 'text-red-500' :
                            log.severity === 'HIGH' ? 'text-orange-500' :
                            log.severity === 'MEDIUM' ? 'text-yellow-500' : 'text-green-500'
                          }`}>[{log.eventType}]</span>
                          <span className="text-[10px] text-slate-500">{format(new Date(log.createdAt), 'MMM dd, HH:mm:ss')}</span>
                        </div>
                        <div className="text-xs text-slate-500 mb-2">
                          IP: <span onContextMenu={(e) => handleContextMenu(e, { ip: log.ipAddress })} className="text-slate-300 hover:text-green-400 cursor-context-menu underline decoration-slate-700 decoration-dashed underline-offset-4">{log.ipAddress}</span> | ACTOR: <span onContextMenu={(e) => handleContextMenu(e, { registryId: log.registryId })} className="font-bold text-slate-300 hover:text-green-400 cursor-context-menu underline decoration-slate-700 decoration-dashed underline-offset-4">{log.registryId}</span>
                        </div>
                        <div className="text-xs text-slate-400 bg-slate-900/50 p-2 rounded border border-slate-800/50 font-sans">{log.details}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* TRAFFIC TAB */}
            {activeTab === 'radar' && (
              <>
                {/* Filters */}
                <div className="p-4 border-b border-slate-800 bg-slate-950 flex gap-4">
                  <div className="flex-1 flex items-center bg-slate-900 border border-slate-800 rounded-lg px-3">
                    <Filter className="w-4 h-4 text-slate-500 mr-2" />
                    <input 
                      type="text" 
                      placeholder="Filter by IP Address..." 
                      className="bg-transparent text-xs text-white outline-none w-full py-2"
                      value={trafficFilter.ip}
                      onChange={e => setTrafficFilter({ ...trafficFilter, ip: e.target.value })}
                    />
                  </div>
                  <div className="w-48 flex items-center bg-slate-900 border border-slate-800 rounded-lg px-3">
                    <input 
                      type="date" 
                      className="bg-transparent text-xs text-slate-400 outline-none w-full py-2"
                      value={trafficFilter.date}
                      onChange={e => setTrafficFilter({ ...trafficFilter, date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-950 sticky top-0 text-xs text-slate-500 uppercase tracking-widest border-b border-slate-800">
                      <tr>
                        <th className="p-4">Time</th>
                        <th className="p-4">IP Address</th>
                        <th className="p-4">Path</th>
                        <th className="p-4">User-Agent</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs text-slate-300">
                      {filteredTraffic.length === 0 ? <tr><td colSpan="4" className="p-8 text-center text-slate-600">NO TRAFFIC FOUND</td></tr> : filteredTraffic.map(t => (
                        <tr key={t.id} className="border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors">
                          <td className="p-4 text-slate-500 whitespace-nowrap">{format(new Date(t.timestamp), 'HH:mm:ss')}</td>
                          <td className="p-4 font-bold text-green-400 cursor-context-menu hover:text-green-300 underline decoration-slate-700 decoration-dashed underline-offset-4" onContextMenu={(e) => handleContextMenu(e, { ip: t.ipAddress })}>{t.ipAddress}</td>
                          <td className="p-4 text-slate-400">{t.path}</td>
                          <td className="p-4 text-slate-500 truncate max-w-[300px] font-sans" title={t.userAgent}>{t.userAgent}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* DIRECTORY TAB */}
            {activeTab === 'directory' && (
              <>
                {/* Search */}
                <div className="p-4 border-b border-slate-800 bg-slate-950">
                  <div className="flex-1 flex items-center bg-slate-900 border border-slate-800 rounded-lg px-3">
                    <Search className="w-4 h-4 text-slate-500 mr-2" />
                    <input 
                      type="text" 
                      placeholder="Search Registry ID, Name, or Role..." 
                      className="bg-transparent text-xs text-white outline-none w-full py-2"
                      value={directorySearch}
                      onChange={e => setDirectorySearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-950 sticky top-0 text-xs text-slate-500 uppercase tracking-widest border-b border-slate-800">
                      <tr>
                        <th className="p-4">Registry ID</th>
                        <th className="p-4">Name</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs text-slate-300">
                      {filteredUsers.length === 0 ? <tr><td colSpan="5" className="p-8 text-center text-slate-600">NO USERS FOUND</td></tr> : filteredUsers.map(u => (
                        <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors">
                          <td className="p-4 font-bold cursor-context-menu hover:text-green-400 underline decoration-slate-700 decoration-dashed underline-offset-4" onContextMenu={(e) => handleContextMenu(e, { registryId: u.registryId })}>{u.registryId}</td>
                          <td className="p-4 font-sans">{u.name}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded bg-slate-950 border ${u.role === 'admin' ? 'border-red-500/50 text-red-400' : u.role === 'secops' ? 'border-green-500/50 text-green-400' : 'border-slate-700 text-slate-400'}`}>
                              {u.role.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-4">
                            {u.isBanned 
                              ? <span className="text-red-500 font-bold flex items-center gap-1"><Ban className="w-3 h-3"/> BANNED</span> 
                              : <span className="text-green-500">ACTIVE</span>}
                          </td>
                          <td className="p-4 text-right">
                            {u.role !== 'secops' && (
                              <button 
                                onClick={() => handleBanToggle(u.registryId, !u.isBanned)}
                                className={`px-3 py-1 rounded border text-[10px] font-bold transition-all ${
                                  u.isBanned ? 'border-green-500/30 text-green-500 hover:bg-green-500 hover:text-white' : 'border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white'
                                }`}
                              >
                                {u.isBanned ? 'UNBAN' : 'BAN'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
