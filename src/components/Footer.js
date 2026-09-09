import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-soil-slate text-cream-surface border-t border-soil-slate/40 mt-16 no-print">
      {/* Scope Policy Banner */}
      <div className="bg-primary/90 py-3 px-4 border-b border-white/10 text-xs sm:text-sm text-center text-on-primary font-medium">
        <span className="font-bold tracking-wide uppercase">🚜 Agrarian Resource Directory Standard:</span> Zero digital payment gateways (No GCash/online checkout). Direct field coordination between verified Farmers, Equipment Providers, and LGU Admins.
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
              Philippine Agrarian Resource Directory & Exchange. Connecting smallholder farmers, machinery providers, and cooperatives across agrarian reform communities.
            </p>
            <div className="text-xs font-mono text-cream-surface/60 space-y-1">
              <p>DA-LGU RSBSA Directory Protocol</p>
              <p>Standard In-Scope Directory Workflow</p>
            </div>
          </div>

          {/* Quick Modules (In-Scope Workflow) */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-harvest-amber mb-4">Directory Portals</h4>
            <ul className="space-y-2.5 text-sm text-cream-surface/80">
              <li>
                <Link href="/marketplace" className="hover:text-harvest-amber transition-colors flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">agriculture</span>
                  Machinery Marketplace & Directory
                </Link>
              </li>
              <li>
                <Link href="/farmer-dashboard" className="hover:text-harvest-amber transition-colors flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">person</span>
                  Farmer Portal & Simple Requests
                </Link>
              </li>
              <li>
                <Link href="/provider-dashboard" className="hover:text-harvest-amber transition-colors flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">corporate_fare</span>
                  Provider Hub & Resource Listings
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-harvest-amber transition-colors flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">shield_person</span>
                  Admin Directory & Role Moderation
                </Link>
              </li>
            </ul>
          </div>

          {/* Scope Boundaries & Standards */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-harvest-amber mb-4">Directory Architecture</h4>
            <ul className="space-y-2.5 text-sm text-cream-surface/80">
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-sprout-green text-[18px]">verified</span>
                <span>User Roles (Admin, Provider, Farmer)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-harvest-amber text-[18px]">edit_note</span>
                <span>Manual Creation of Resource Listings</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-sprout-green text-[18px]">travel_explore</span>
                <span>Category & Text-Based Search</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-harvest-amber text-[18px]">send</span>
                <span>Simple Equipment Request Submissions</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-cream-surface/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cream-surface/60">
          <p>© {new Date().getFullYear()} UMAKONEKTA.</p>
          <div className="flex items-center gap-4">
            <span>DA-LGU Resource Directory Standard</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
