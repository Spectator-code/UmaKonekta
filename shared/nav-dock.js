// UMAKONEKTA Universal Design System Floating Navigation Dock
// Connects all 19 screens with quick-switching, role portal selector, and direct link to Root Showcase Hub.

(function () {
  if (window.__UMAKONEKTA_NAV_DOCK_LOADED__) return;
  window.__UMAKONEKTA_NAV_DOCK_LOADED__ = true;

  // Determine relative root path from current page location
  const isRoot = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') || !window.location.pathname.includes('/');
  const prefix = isRoot ? './' : '../';

  const screens = [
    // 1. Public & Citizen Discovery
    {
      id: 'home',
      name: 'Home Landing Page',
      category: 'Public Discovery',
      path: prefix + 'umakonekta_home_landing_page_interactive_animated/code.html',
      icon: 'home',
      badge: 'Public'
    },
    {
      id: 'marketplace',
      name: 'Farm Equipment Marketplace',
      category: 'Public Discovery',
      path: prefix + 'umakonekta_farm_equipment_marketplace/code.html',
      icon: 'storefront',
      badge: 'Directory'
    },
    {
      id: 'how_it_works',
      name: 'How It Works (Guide)',
      category: 'Public Discovery',
      path: prefix + 'umakonekta_how_it_works/code.html',
      icon: 'help_outline',
      badge: 'Guide'
    },
    {
      id: 'machinery_detail',
      name: 'Machinery Detail & Booking',
      category: 'Public Discovery',
      path: prefix + 'umakonekta_machinery_product_detail_booking/code.html',
      icon: 'agriculture',
      badge: 'Booking'
    },
    {
      id: 'resource_detail',
      name: 'Resource Detail & Request',
      category: 'Public Discovery',
      path: prefix + 'umakonekta_resource_detail_schedule_request/code.html',
      icon: 'warehouse',
      badge: 'Facility'
    },
    {
      id: 'emergency_hotlines',
      name: 'Emergency Hotlines (1343)',
      category: 'Public Discovery',
      path: prefix + 'umakonekta_critical_agricultural_emergency_contacts_hotline_directory/code.html',
      icon: 'emergency',
      badge: '24/7'
    },

    // 2. Portals & Dashboards
    {
      id: 'auth_login',
      name: 'Secure Authentication & Login',
      category: 'Role Portals',
      path: prefix + 'umakonekta_secure_authentication_identity_verification/code.html',
      icon: 'lock',
      badge: 'Auth'
    },
    {
      id: 'farmer_dashboard',
      name: 'Farmer Requestor Dashboard',
      category: 'Role Portals',
      path: prefix + 'umakonekta_farmer_requestor_dashboard/code.html',
      icon: 'person',
      badge: 'Farmer'
    },
    {
      id: 'provider_dashboard',
      name: 'Resource Provider Dashboard',
      category: 'Role Portals',
      path: prefix + 'umakonekta_resource_provider_dashboard/code.html',
      icon: 'corporate_fare',
      badge: 'Provider'
    },
    {
      id: 'admin_moderation',
      name: 'Admin Portal Moderation',
      category: 'Role Portals',
      path: prefix + 'umakonekta_administrator_portal_moderation/code.html',
      icon: 'shield_person',
      badge: 'Admin'
    },
    {
      id: 'user_role_management',
      name: 'User Role Management',
      category: 'Role Portals',
      path: prefix + 'umakonekta_user_role_management_verification/code.html',
      icon: 'manage_accounts',
      badge: 'Roles'
    },

    // 3. Field Mechanics & Operations
    {
      id: 'mechanic_booking',
      name: 'Field Repair Booking Flow',
      category: 'Field Operations',
      path: prefix + 'umakonekta_field_repair_on_site_mechanics_booking_flow/code.html',
      icon: 'build',
      badge: 'Repair'
    },
    {
      id: 'mechanic_portal',
      name: 'Mobile Repair Mechanics Portal',
      category: 'Field Operations',
      path: prefix + 'umakonekta_mobile_repair_field_mechanics_portal/code.html',
      icon: 'handyman',
      badge: 'Technician'
    },
    {
      id: 'dispatch_slip',
      name: 'Operator Dispatch Slip Ticket',
      category: 'Field Operations',
      path: prefix + 'umakonekta_operator_field_dispatch_slip_job_ticket/code.html',
      icon: 'receipt_long',
      badge: 'Field Slip'
    },

    // 4. Offline & Printable Documents
    {
      id: 'sacco_ticket',
      name: 'Palay Harvest SACCO Ticket',
      category: 'Print & Tickets',
      path: prefix + 'umakonekta_palay_harvest_sacco_receipt_scale_ticket/code.html',
      icon: 'scale',
      badge: 'Desktop'
    },
    {
      id: 'sacco_ticket_mobile',
      name: 'SACCO Ticket Mobile View',
      category: 'Print & Tickets',
      path: prefix + 'umakonekta_palay_harvest_sacco_receipt_scale_ticket_mobile/code.html',
      icon: 'smartphone',
      badge: 'Mobile'
    },
    {
      id: 'sacco_ticket_eco_print',
      name: 'SACCO Ticket Eco Print',
      category: 'Print & Tickets',
      path: prefix + 'umakonekta_palay_harvest_sacco_receipt_scale_ticket_eco_monochrome_print_preview/code.html',
      icon: 'print',
      badge: 'Eco Print'
    },
    {
      id: 'barangay_notice',
      name: 'Barangay Bulletin Guide Notice',
      category: 'Print & Tickets',
      path: prefix + 'umakonekta_printable_barangay_hall_guide_bulletin_notice/code.html',
      icon: 'campaign',
      badge: 'Notice'
    },
    {
      id: 'barangay_notice_eco_print',
      name: 'Barangay Bulletin Eco Print',
      category: 'Print & Tickets',
      path: prefix + 'umakonekta_printable_barangay_hall_guide_eco_monochrome_print_preview/code.html',
      icon: 'print_disabled',
      badge: 'Eco Print'
    }
  ];

  // Helper to find current active screen
  const currentPath = window.location.pathname.toLowerCase();
  const currentScreen = screens.find(s => currentPath.includes(s.id) || currentPath.includes(s.path.replace('../', '').replace('./', '').split('/')[0])) || screens[0];

  function injectDock() {
    const hubUrl = isRoot ? 'index.html' : '../index.html';
    const landingPageUrl = prefix + 'umakonekta_home_landing_page_interactive_animated/code.html';

    // Container for dock & modals
    const container = document.createElement('div');
    container.id = 'umakonekta-dock-root';
    container.style.cssText = 'position:fixed;top:0;left:0;width:100%;z-index:9999;font-family:"Plus Jakarta Sans",system-ui,sans-serif;pointer-events:auto;';

    container.innerHTML = `
      <style>
        /* Comprehensive suppression of legacy hardcoded page headers so no duplicate navigation or duplicate action buttons render */
        body > header, main > header, header.fixed, header.sticky, header.top-0, header[class*="top-0"], header { 
          display: none !important; 
        }
        /* Except keep our unified dock header visible */
        #umakonekta-dock-root header, #umakonekta-dock-root .uk-dock-bar {
          display: flex !important;
        }
        /* Add padding to body to compensate for fixed header */
        body { padding-top: 80px; }

        #umakonekta-dock-root * { box-sizing: border-box; }
        .uk-dock-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          height: 80px;
          padding: 0 40px;
          background: rgba(251, 251, 247, 0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0,0,0,0.05);
          transition: all 0.25s ease;
        }
        .uk-nav-left {
          display: flex;
          align-items: center;
          gap: 32px;
        }
        .uk-nav-text-link {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          color: #141e1b;
          text-decoration: none;
          background: transparent;
          border: none;
          cursor: pointer;
          letter-spacing: 0.05em;
          padding: 0;
          transition: color 0.15s ease;
        }
        .uk-nav-text-link:hover {
          color: #005426;
        }
        .uk-nav-pill-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 24px;
          border-radius: 9999px;
          border: 2px solid #141e1b;
          background: transparent;
          color: #141e1b;
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          cursor: pointer;
          letter-spacing: 0.05em;
          transition: all 0.15s ease;
        }
        .uk-nav-pill-btn:hover {
          background: #141e1b;
          color: #ffffff;
        }
        .uk-dock-icon {
          font-family: 'Material Symbols Outlined';
          font-size: 18px;
          line-height: 1;
        }
        .uk-dock-menu {
          position: absolute;
          top: 58px;
          left: 50%;
          transform: translateX(-50%) translateY(-10px);
          width: 320px;
          max-height: 440px;
          overflow-y: auto;
          background: #FBFBF7;
          border-radius: 16px;
          border: 1.5px solid #DDE3DA;
          box-shadow: 0 14px 40px rgba(0, 0, 0, 0.16);
          padding: 12px;
          display: none;
          flex-direction: column;
          gap: 4px;
          opacity: 0;
          transition: all 0.2s ease;
        }
        .uk-dock-menu.uk-show {
          display: flex;
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
        .uk-menu-title {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #005426;
          font-weight: 700;
          padding: 6px 8px;
          margin-top: 4px;
        }
        .uk-menu-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 10px;
          border-radius: 8px;
          color: #141e1b;
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          transition: background 0.15s ease;
        }
        .uk-menu-item:hover {
          background: #e5f0eb;
          color: #005426;
        }
        .uk-menu-badge {
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 9999px;
          background: #e5f0eb;
          color: #005426;
          font-weight: 700;
        }

        /* UMAKONEKTA Live Toast Notification System */
        #uk-toast-container {
          position: fixed;
          top: 92px;
          right: 24px;
          z-index: 10000;
          display: flex;
          flex-direction: column;
          gap: 10px;
          pointer-events: none;
          max-width: 380px;
          width: calc(100vw - 48px);
        }
        .uk-toast {
          pointer-events: auto;
          background: #ffffff;
          border: 1px solid #DDE3DA;
          border-radius: 12px;
          padding: 12px 16px;
          box-shadow: 0 10px 30px rgba(0, 84, 38, 0.12), 0 1px 3px rgba(0,0,0,0.06);
          display: flex;
          align-items: flex-start;
          gap: 12px;
          transform: translateX(120%);
          opacity: 0;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .uk-toast.uk-toast-visible {
          transform: translateX(0);
          opacity: 1;
        }
        .uk-toast-icon-wrap {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .uk-toast-success .uk-toast-icon-wrap { background: #EAF5EE; color: #1B6E39; }
        .uk-toast-urgent .uk-toast-icon-wrap { background: #FDE8E8; color: #C53030; }
        .uk-toast-maintenance .uk-toast-icon-wrap { background: #FEF3E7; color: #C26D1A; }
        .uk-toast-info .uk-toast-icon-wrap { background: #E8F4F8; color: #01505e; }
        .uk-toast-content { flex: 1; min-width: 0; }
        .uk-toast-title {
          font-size: 13px;
          font-weight: 700;
          color: #141e1b;
          margin-bottom: 2px;
        }
        .uk-toast-message {
          font-size: 12px;
          color: #475953;
          line-height: 1.4;
        }
        .uk-toast-close {
          background: none;
          border: none;
          color: #707a6f;
          cursor: pointer;
          padding: 2px;
          font-size: 14px;
          line-height: 1;
          border-radius: 4px;
          transition: color 0.15s ease;
        }
        .uk-toast-close:hover { color: #141e1b; }

        @media (max-width: 768px) {
          .uk-nav-left { gap: 16px; }
          .uk-nav-text-link { font-size: 11px; }
          .uk-nav-pill-btn { padding: 6px 16px; font-size: 11px; }
          #uk-toast-container { top: 86px; right: 12px; left: 12px; width: auto; max-width: none; }
        }
      </style>

      <!-- Live Toast Container -->
      <div id="uk-toast-container"></div>

      <!-- Portals Popover Menu -->
      <div id="uk-portals-menu" class="uk-dock-menu">
        <div class="uk-menu-title">Role Portals & Dashboards</div>
        <a class="uk-menu-item" href="${prefix}umakonekta_farmer_requestor_dashboard/code.html">
          <span style="display:flex;align-items:center;gap:6px;"><span class="uk-dock-icon" style="color:#005426;">person</span> Farmer Dashboard</span>
          <span class="uk-menu-badge">Requestor</span>
        </a>
        <a class="uk-menu-item" href="${prefix}umakonekta_resource_provider_dashboard/code.html">
          <span style="display:flex;align-items:center;gap:6px;"><span class="uk-dock-icon" style="color:#005426;">corporate_fare</span> Provider Dashboard</span>
          <span class="uk-menu-badge">LGU / Co-op</span>
        </a>
        <a class="uk-menu-item" href="${prefix}umakonekta_administrator_portal_moderation/code.html">
          <span style="display:flex;align-items:center;gap:6px;"><span class="uk-dock-icon" style="color:#005426;">shield_person</span> Admin Moderation</span>
          <span class="uk-menu-badge">Municipal</span>
        </a>
        <a class="uk-menu-item" href="${prefix}umakonekta_user_role_management_verification/code.html">
          <span style="display:flex;align-items:center;gap:6px;"><span class="uk-dock-icon" style="color:#005426;">manage_accounts</span> User Role Verification</span>
          <span class="uk-menu-badge">Roles</span>
        </a>
        <a class="uk-menu-item" href="${prefix}umakonekta_secure_authentication_identity_verification/code.html">
          <span style="display:flex;align-items:center;gap:6px;"><span class="uk-dock-icon" style="color:#005426;">lock</span> Secure Login / RSBSA</span>
          <span class="uk-menu-badge">Auth</span>
        </a>
      </div>

      <!-- Field Ops Popover Menu -->
      <div id="uk-ops-menu" class="uk-dock-menu">
        <div class="uk-menu-title">Field Operations & Repairs</div>
        <a class="uk-menu-item" href="${prefix}umakonekta_field_repair_on_site_mechanics_booking_flow/code.html">
          <span style="display:flex;align-items:center;gap:6px;"><span class="uk-dock-icon" style="color:#C26D1A;">build</span> Book On-Site Mechanic</span>
          <span class="uk-menu-badge">Emergency</span>
        </a>
        <a class="uk-menu-item" href="${prefix}umakonekta_mobile_repair_field_mechanics_portal/code.html">
          <span style="display:flex;align-items:center;gap:6px;"><span class="uk-dock-icon" style="color:#C26D1A;">handyman</span> Field Mechanics Portal</span>
          <span class="uk-menu-badge">Technician</span>
        </a>
        <a class="uk-menu-item" href="${prefix}umakonekta_operator_field_dispatch_slip_job_ticket/code.html">
          <span style="display:flex;align-items:center;gap:6px;"><span class="uk-dock-icon" style="color:#005426;">receipt_long</span> Operator Dispatch Slip</span>
          <span class="uk-menu-badge">Job Ticket</span>
        </a>
        <a class="uk-menu-item" href="${prefix}umakonekta_critical_agricultural_emergency_contacts_hotline_directory/code.html">
          <span style="display:flex;align-items:center;gap:6px;"><span class="uk-dock-icon" style="color:#C53030;">emergency</span> Emergency Hotlines (1343)</span>
          <span class="uk-menu-badge" style="background:#FDE8E8;color:#C53030;">24/7 Hotline</span>
        </a>
      </div>

      <!-- Tickets & Print Popover Menu -->
      <div id="uk-print-menu" class="uk-dock-menu">
        <div class="uk-menu-title">Offline & Printable Documents</div>
        <a class="uk-menu-item" href="${prefix}umakonekta_palay_harvest_sacco_receipt_scale_ticket/code.html">
          <span style="display:flex;align-items:center;gap:6px;"><span class="uk-dock-icon">scale</span> Palay Scale Ticket (Desktop)</span>
          <span class="uk-menu-badge">Full Color</span>
        </a>
        <a class="uk-menu-item" href="${prefix}umakonekta_palay_harvest_sacco_receipt_scale_ticket_mobile/code.html">
          <span style="display:flex;align-items:center;gap:6px;"><span class="uk-dock-icon">smartphone</span> Scale Ticket Mobile</span>
          <span class="uk-menu-badge">Field View</span>
        </a>
        <a class="uk-menu-item" href="${prefix}umakonekta_palay_harvest_sacco_receipt_scale_ticket_eco_monochrome_print_preview/code.html">
          <span style="display:flex;align-items:center;gap:6px;"><span class="uk-dock-icon">print</span> Scale Ticket Eco Print</span>
          <span class="uk-menu-badge">B&W Ink Saver</span>
        </a>
        <a class="uk-menu-item" href="${prefix}umakonekta_printable_barangay_hall_guide_bulletin_notice/code.html">
          <span style="display:flex;align-items:center;gap:6px;"><span class="uk-dock-icon">campaign</span> Barangay Bulletin Notice</span>
          <span class="uk-menu-badge">Poster</span>
        </a>
        <a class="uk-menu-item" href="${prefix}umakonekta_printable_barangay_hall_guide_eco_monochrome_print_preview/code.html">
          <span style="display:flex;align-items:center;gap:6px;"><span class="uk-dock-icon">print_disabled</span> Barangay Notice Eco Print</span>
          <span class="uk-menu-badge">B&W Ink Saver</span>
        </a>
      </div>

      <!-- Full 19-Screen Drawer Modal -->
      <div id="uk-all-screens-drawer" class="uk-dock-menu" style="width:360px;max-height:500px;left:auto;right:24px;transform:none;">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 8px;border-bottom:1px solid #DDE3DA;margin-bottom:8px;">
          <div style="font-weight:700;color:#005426;font-size:13px;display:flex;align-items:center;gap:6px;">
            <span class="uk-dock-icon">dataset</span> All 19 Design Screens
          </div>
          <button id="uk-close-all-screens" style="background:none;border:none;cursor:pointer;color:#707a6f;">✕</button>
        </div>
        <input id="uk-screen-search" type="text" placeholder="Search screens..." style="width:100%;padding:6px 10px;border-radius:6px;border:1px solid #DDE3DA;font-size:12px;margin-bottom:8px;outline:none;" />
        <div id="uk-screen-list" style="display:flex;flex-direction:column;gap:3px;overflow-y:auto;">
          ${screens.map(s => `
            <a class="uk-menu-item uk-screen-searchable" href="${s.path}" data-name="${s.name.toLowerCase()} ${s.category.toLowerCase()}">
              <span style="display:flex;align-items:center;gap:8px;">
                <span class="uk-dock-icon" style="color:#005426;font-size:16px;">${s.icon}</span>
                <span style="font-size:12px;">${s.name}</span>
              </span>
              <span class="uk-menu-badge">${s.badge}</span>
            </a>
          `).join('')}
        </div>
      </div>

      <!-- Dock Bar -->
      <div class="uk-dock-bar" id="uk-main-dock-bar">
        <!-- Logo with Official Emblem - Redirects to Landing Page -->
        <a href="${landingPageUrl}" style="text-decoration: none; display: flex; align-items: center; gap: 10px;" title="Go to UMAKONEKTA Landing Page">
          <img src="https://lh3.googleusercontent.com/aida/AEtjO1WXdPG7CNTT3uGt1my2aOQZ4VdiHSKXHOILhIaSJ3u-AegiA3gD8xHtjq7FKI_Dk4t8OJN2tchZP4B7lzoWzi9iCQ4taPeFYs4FlSJpYWOp5Qaz5kZG2CBpD3j2tVbUB7OctH2duF9lC3BQSCBB2XfQCLiJtRHRf4OaSOydiyU2BnuqBwmiFBreNDu6J7rDxbGeA5bT0F3mjjSNMcnetOy7obOGck1Z_zVHuMXK2XyNHuau8uo9sn4_NuDHvCGO3TSaNL4dz1F3" alt="UMAKONEKTA Logo" style="height: 32px; width: auto; object-fit: contain;" />
          <span style="font-size: 22px; font-weight: 800; color: #005426; letter-spacing: -0.5px;">UMAKONEKTA</span>
        </a>

        <!-- Center Links -->
        <div class="uk-nav-left">
          <a class="uk-nav-text-link" href="${landingPageUrl}">Home</a>
          <a class="uk-nav-text-link" href="${prefix}umakonekta_farm_equipment_marketplace/code.html">Marketplace</a>
          <button class="uk-nav-text-link" id="uk-btn-portals">Portals</button>
          <button class="uk-nav-text-link" id="uk-btn-ops">Field Ops</button>
          <button class="uk-nav-text-link" id="uk-btn-print">Tickets</button>
        </div>

        <!-- Right Actions & Unified Role Switcher -->
        <div style="display: flex; align-items: center; gap: 12px;">
          <!-- Quick Role Switcher Pill -->
          <div style="display: flex; align-items: center; background: #e5f0eb; border: 1px solid #DDE3DA; border-radius: 9999px; padding: 3px 6px; gap: 4px;">
            <span style="font-size: 11px; font-weight: 700; color: #005426; text-transform: uppercase; padding: 0 4px; display: flex; align-items: center; gap: 3px;">
              <span class="uk-dock-icon" style="font-size: 14px;">badge</span> Role:
            </span>
            <select id="uk-quick-role-select" onchange="window.location.href=this.value" style="background: transparent; border: none; font-size: 11px; font-weight: 700; color: #141e1b; outline: none; cursor: pointer; padding-right: 4px;">
              <option value="${prefix}umakonekta_farmer_requestor_dashboard/code.html" ${currentPath.includes('farmer') ? 'selected' : ''}>🌾 Farmer</option>
              <option value="${prefix}umakonekta_resource_provider_dashboard/code.html" ${currentPath.includes('provider') ? 'selected' : ''}>🚜 Provider</option>
              <option value="${prefix}umakonekta_mobile_repair_field_mechanics_portal/code.html" ${currentPath.includes('mechanic') ? 'selected' : ''}>🔧 Mechanic</option>
              <option value="${prefix}umakonekta_palay_harvest_sacco_receipt_scale_ticket/code.html" ${currentPath.includes('sacco') ? 'selected' : ''}>⚖️ SACCO Proxy</option>
              <option value="${prefix}umakonekta_administrator_portal_moderation/code.html" ${currentPath.includes('admin') ? 'selected' : ''}>🛡️ Admin</option>
            </select>
          </div>

          <button class="uk-nav-pill-btn" id="uk-btn-all-screens" title="Search all 19 screens" style="padding: 6px 14px; font-size: 11px;">
            <span class="uk-dock-icon" style="font-size: 15px;">search</span>
            <span>All Pages</span>
          </button>
          
          <a href="${prefix}umakonekta_secure_authentication_identity_verification/code.html" style="display:inline-flex; align-items:center; justify-content:center; padding:6px 14px; border-radius:9999px; background:#005426; color:#fff; font-size:11px; font-weight:800; text-transform:uppercase; text-decoration:none; letter-spacing:0.05em; transition: background 0.15s ease;">Sign In</a>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    // Toggle popover helpers
    function closeAllMenus() {
      document.querySelectorAll('.uk-dock-menu').forEach(el => el.classList.remove('uk-show'));
    }

    function toggleMenu(menuId, e) {
      if (e) e.stopPropagation();
      const menu = document.getElementById(menuId);
      const isAlreadyOpen = menu.classList.contains('uk-show');
      closeAllMenus();
      if (!isAlreadyOpen) {
        menu.classList.add('uk-show');
      }
    }

    document.getElementById('uk-btn-portals').addEventListener('click', (e) => toggleMenu('uk-portals-menu', e));
    document.getElementById('uk-btn-ops').addEventListener('click', (e) => toggleMenu('uk-ops-menu', e));
    document.getElementById('uk-btn-print').addEventListener('click', (e) => toggleMenu('uk-print-menu', e));
    document.getElementById('uk-btn-all-screens').addEventListener('click', (e) => toggleMenu('uk-all-screens-drawer', e));
    document.getElementById('uk-close-all-screens').addEventListener('click', closeAllMenus);

    // Search filter inside 19-screen drawer
    const searchInput = document.getElementById('uk-screen-search');
    searchInput.addEventListener('input', function () {
      const q = this.value.toLowerCase().trim();
      document.querySelectorAll('.uk-screen-searchable').forEach(item => {
        const text = item.getAttribute('data-name');
        item.style.display = text.includes(q) ? 'flex' : 'none';
      });
    });

    // Global Toast Notification Engine
    window.showUmakonektaToast = function (title, message, type = 'success', duration = 4000) {
      const toastContainer = document.getElementById('uk-toast-container');
      if (!toastContainer) return;

      const iconMap = {
        success: 'check_circle',
        urgent: 'warning',
        maintenance: 'build',
        info: 'info'
      };

      const icon = iconMap[type] || 'notifications';
      const toast = document.createElement('div');
      toast.className = `uk-toast uk-toast-${type}`;
      toast.innerHTML = `
        <div class="uk-toast-icon-wrap">
          <span class="uk-dock-icon">${icon}</span>
        </div>
        <div class="uk-toast-content">
          <div class="uk-toast-title">${title}</div>
          <div class="uk-toast-message">${message}</div>
        </div>
        <button class="uk-toast-close" title="Dismiss">✕</button>
      `;

      toastContainer.appendChild(toast);

      // Trigger enter animation
      requestAnimationFrame(() => {
        toast.classList.add('uk-toast-visible');
      });

      const dismiss = () => {
        toast.classList.remove('uk-toast-visible');
        setTimeout(() => toast.remove(), 350);
      };

      toast.querySelector('.uk-toast-close').addEventListener('click', dismiss);
      if (duration > 0) {
        setTimeout(dismiss, duration);
      }
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectDock);
  } else {
    injectDock();
  }
})();
