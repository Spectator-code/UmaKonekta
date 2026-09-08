import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-soil-slate text-cream-surface border-t border-soil-slate/40 mt-16 no-print">
      {/* Zero Digital Payment Policy Banner */}
      <div className="bg-primary/90 py-3 px-4 border-b border-white/10 text-xs sm:text-sm text-center text-on-primary font-medium">
        <span className="font-bold tracking-wide uppercase">🚜 Agrarian Cash-on-Dike & Passbook Standard:</span> Zero digital payment gateways. All machine rentals and harvest splits are settled strictly in-person upon field completion or credited via accredited Cooperative Passbooks.
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand & Mandate */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-white p-1 flex items-center justify-center shadow-xs border border-primary/20 overflow-hidden">
                <img 
                  src="/umakonekta-logo.jpg" 
                  alt="UMAKONEKTA Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-headline-sm text-xl font-extrabold tracking-tight text-cream-surface">UMAKONEKTA</span>
            </div>
            <p className="text-cream-surface/80 text-sm leading-relaxed mb-4">
              Philippine Agrarian Resource Exchange Network. Connecting smallholder farmers, machinery operators, and cooperatives across agrarian reform communities.
            </p>
            <div className="text-xs font-mono text-cream-surface/60 space-y-1">
              <p>DA-LGU Accreditation #2026-CAR-041</p>
              <p>RSBSA Cooperative Registry Protocol</p>
            </div>
          </div>

          {/* Quick Modules */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-harvest-amber mb-4">Core Modules</h4>
            <ul className="space-y-2.5 text-sm text-cream-surface/80">
              <li>
                <Link href="/marketplace" className="hover:text-harvest-amber transition-colors">
                  🚜 Machinery Marketplace
                </Link>
              </li>
              <li>
                <Link href="/farmer-dashboard" className="hover:text-harvest-amber transition-colors">
                  🌾 Farmer Passbook Ledger
                </Link>
              </li>
              <li>
                <Link href="/dispatch-slip" className="hover:text-harvest-amber transition-colors">
                  📋 Operator Dispatch Slip
                </Link>
              </li>
              <li>
                <Link href="/sacco-receipt" className="hover:text-harvest-amber transition-colors">
                  🧾 Palay SACCO Scale Ticket
                </Link>
              </li>
              <li>
                <Link href="/bulletin-notice" className="hover:text-harvest-amber transition-colors">
                  🏛️ Barangay Hall Bulletin
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-harvest-amber transition-colors">
                  🪪 LGU Farmer ID Creator System
                </Link>
              </li>
            </ul>
          </div>

          {/* Field Operations & Standards */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-harvest-amber mb-4">Agrarian Protocols</h4>
            <ul className="space-y-2.5 text-sm text-cream-surface/80">
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-harvest-amber text-[18px]">payments</span>
                <span>Cash-on-Dike Field Settlement</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-sprout-green text-[18px]">menu_book</span>
                <span>Cooperative Passbook Ledgers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-harvest-amber text-[18px]">signal_wifi_off</span>
                <span>Offline Serwist Workbox PWA</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-sprout-green text-[18px]">print</span>
                <span>Eco Monochrome Print Previews</span>
              </li>
            </ul>
          </div>

          {/* Emergency & Agrarian Support */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-status-urgent mb-4">Emergency & Hotlines</h4>
            <div className="bg-soil-slate/80 p-4 rounded-xl border border-soil-slate/60 space-y-3 text-xs">
              <div>
                <p className="text-cream-surface/60 uppercase text-[10px] font-mono">Agricultural Emergency Hotline</p>
                <a href="tel:1343" className="text-base font-extrabold text-harvest-amber hover:underline flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">call</span>
                  1343 (DA-LGU Action)
                </a>
              </div>
              <div>
                <p className="text-cream-surface/60 uppercase text-[10px] font-mono">NIA Irrigation Water Advisory</p>
                <p className="font-semibold text-cream-surface">(044) 940-1234 (District 1)</p>
              </div>
              <div>
                <p className="text-cream-surface/60 uppercase text-[10px] font-mono">National Disaster Hotline</p>
                <p className="font-semibold text-cream-surface">911 / (02) 8911-5061</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-cream-surface/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cream-surface/60">
          <p>© {new Date().getFullYear()} UMAKONEKTA. Republic of the Philippines. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>PhilMech Standard Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
