import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-soil-slate text-cream-surface border-t border-soil-slate/40 mt-16 no-print">
      {/* Scope Policy Banner */}
      <div className="bg-primary/90 py-3 px-4 border-b border-white/10 text-xs sm:text-sm text-center text-on-primary font-medium">
        <span className="font-bold tracking-wide uppercase">Agrarian Resource Directory Standard:</span> Zero digital payment gateways (No GCash/online checkout). Direct field coordination between verified Farmers, Equipment Providers, and LGU Admins.
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
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
             <strong>Philippine Agrarian Resource Directory & Exchange. Connecting smallholder farmers, machinery providers, and cooperatives across agrarian reform communities.</strong> 
            </p>
            <div className="text-xs font-mono text-cream-surface/60 space-y-1">
              <p>  <strong>DA-LGU RSBSA Directory Protocol</strong></p>
              <p>Standard In-Scope Directory Workflow</p>
            </div>
          </div>

          {/* Quick Modules (Working Interactive Action Buttons) */}
          <div>
            <h4 className="text-xs font-mono font-black uppercase tracking-wider text-harvest-amber mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-sprout-green">touch_app</span>
                <span>DIRECTORY PORTALS</span>
              </span>
              <span className="text-[10px] font-mono text-harvest-amber/90 font-bold uppercase tracking-wider bg-harvest-amber/10 px-2 py-0.5 rounded-full border border-harvest-amber/25">
                Click Arrow to Open
              </span>
            </h4>

            <div className="space-y-2">
              {[
                {
                  href: '/marketplace',
                  icon: 'agriculture',
                  title: 'Machinery Marketplace & Directory',
                  role: 'Public Catalog',
                },
                {
                  href: '/farmer-dashboard',
                  icon: 'person',
                  title: 'Farmer Portal & Simple Requests',
                  role: 'RSBSA Farmers',
                },
                {
                  href: '/provider-dashboard',
                  icon: 'corporate_fare',
                  title: 'Provider Hub & Resource Listings',
                  role: 'Machinery FCA Pool',
                },
                {
                  href: '/mechanic-dashboard',
                  icon: 'handyman',
                  title: 'Field Mechanic & SOS Repairs',
                  role: 'TESDA NC-II Unit',
                },
                {
                  href: '/admin',
                  icon: 'shield_person',
                  title: 'Admin Directory & Role Moderation',
                  role: 'LGU MAO Command',
                },
              ].map((portal) => (
                <Link
                  key={portal.href}
                  href={portal.href}
                  className="group relative flex items-center justify-between p-2.5 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.14] active:bg-white/[0.20] active:scale-[0.99] border border-white/10 hover:border-harvest-amber/60 hover:shadow-lg hover:shadow-harvest-amber/5 transition-all duration-150 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 transition-colors group-hover:bg-harvest-amber text-harvest-amber group-hover:text-soil-slate shadow-2xs">
                      <span className="material-symbols-outlined text-[19px]">{portal.icon}</span>
                    </div>
                    <div className="min-w-0 text-left">
                      <span className="block text-xs sm:text-[13px] font-bold text-cream-surface group-hover:text-white transition-colors truncate">
                        {portal.title}
                      </span>
                      <span className="block text-[10px] font-mono text-cream-surface/50 group-hover:text-cream-surface/80 transition-colors truncate">
                        {portal.role}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className="w-6 h-6 rounded-lg bg-white/5 group-hover:bg-harvest-amber/25 flex items-center justify-center transition-colors">
                      <span className="material-symbols-outlined text-[15px] text-cream-surface/50 group-hover:text-harvest-amber group-hover:translate-x-0.5 transition-all">
                        arrow_forward
                      </span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Scope Boundaries & Standards */}
          <div>
            <h4 className="text-xs font-mono font-black uppercase tracking-wider text-harvest-amber mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-sprout-green">verified</span>
              <span>DIRECTORY ARCHITECTURE</span>
            </h4>
            <div className="space-y-2">
              {[
                { icon: 'verified', color: 'text-sprout-green', title: 'DA-RSBSA Verified User Roles', desc: 'Admin, Provider, Mechanic, Farmer' },
                { icon: 'edit_note', color: 'text-harvest-amber', title: 'Direct Resource Listings', desc: 'Manual creation and specification updates' },
                { icon: 'travel_explore', color: 'text-sprout-green', title: 'Location & Fleet Search', desc: 'Category and text-based machinery lookup' },
                { icon: 'send', color: 'text-harvest-amber', title: 'Simple Request Submission', desc: 'RSBSA beneficiary equipment dispatch queue' },
              ].map((item, idx) => (
                <div key={idx} className="p-2.5 px-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-start gap-2.5">
                  <span className={`material-symbols-outlined text-[18px] shrink-0 mt-0.5 ${item.color}`}>
                    {item.icon}
                  </span>
                  <div className="text-left min-w-0">
                    <p className="text-xs font-bold text-cream-surface/90">{item.title}</p>
                    <p className="text-[11px] text-cream-surface/50 leading-tight">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-cream-surface/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cream-surface/60">
          <p>© {new Date().getFullYear()} UMAKONEKTA.</p>
          <div className="flex items-center gap-4">
            <span>DA-LGU Resource Directory Standard</span>
            <span className="hidden sm:inline">•</span>
            <span>Version 1.5</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
