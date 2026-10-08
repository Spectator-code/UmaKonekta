# UMAKONEKTA — Master Website Features, System Architecture & User Roles Specification

> **Platform:** UMAKONEKTA (Philippine Agrarian Resource Directory & Exchange Platform)  
> **Core Architecture:** DA-LGU RSBSA Directory Protocol, Unified `(user role-month-day register-A000)` ID Format, Cash-on-Dike Settlement, 100 Active Fleet Units across 10 Municipal Depots, Offline-First PWA, and CyGuard SIEM Telemetry Defense.

---

## Table of Contents
1. [Executive Summary & Workflow Architecture](#1-executive-summary--workflow-architecture)
2. [Comprehensive User Roles & Permissions Matrix](#2-comprehensive-user-roles--permissions-matrix)
3. [Master Website Features Catalog](#3-master-website-features-catalog)
4. [Frontend Design & UI/UX Architecture](#4-frontend-design--uiux-architecture)
5. [Complete Directory & Folder Structure Architecture](#5-complete-directory--folder-structure-architecture)
6. [Backend Architecture, Data Modeling & Security](#6-backend-architecture-data-modeling--security)
7. [Hardware & Field Printing Workflows](#7-hardware--field-printing-workflows)
8. [Comprehensive Updates, Enhancements & Implementation Log](#8-comprehensive-updates-enhancements--implementation-log)
9. [Roadmap, Deep-Dive Suggestions & Phased Strategy](#9-roadmap-deep-dive-suggestions--phased-strategy)

--- 

## 1. Executive Summary & Workflow Architecture

**UmaKonekta** is a specialized agrarian web platform built specifically for the rural Philippine agricultural ecosystem. The system eliminates friction between smallholder farmers, agrarian reform beneficiaries, agricultural cooperatives, certified machinery operators, mobile mechanics, and local government units (LGUs).

The overarching engineering philosophy is:
- **Low Cognitive Load:** Designed for direct, intuitive operability in outdoor environments.
- **Fast Offline-First Responsiveness:** Service worker caching and local ledger persistence.
- **Strict Agrarian Data Privacy:** Strict compliance with the Philippine Data Privacy Act (RA 10173) and complete eradication of personal PII.
- **Authentic Philippine Agrarian Workflows:** Replaces digital payment gateways with physical **Cash-on-Dike** settlement and **Cooperative Passbook / Harvest Grain Split** ledgers.

### The End-to-End Agrarian Workflow Lifecycle
```
[ 1. LGU Admin (MAO) ]
      │ Validates RSBSA registry & issues Farmer ID Card
      ▼
[ 2. Machinery Provider (Co-op / Depot) ]
      │ Registers certified equipment across 10 municipal depots
      ▼
[ 3. Smallholder Farmer ]
      │ Browses 100-unit regional fleet & broadcasts machinery "Need"
      ▼
[ 4. Depot Operations Head ]
      │ Accepts need, maps accredited driver, generates Dispatch Slip
      ▼
[ 5. Operator & Field Mechanic ]
      │ Dispatches machine to field dike, logs maintenance & SOS
      ▼
[ 6. Settlement & Grain Split ]
      └─► Physical Cash-on-Dike or SACCO Passbook Harvest Grain Split
```

---

## 2. Comprehensive User Roles & Permissions Matrix

### 1. Farmer (RSBSA Beneficiary)
- **Profile & Context:** Smallholder farmer or agrarian reform beneficiary operating in lowland rice paddies or upland crop sectors with intermittent mobile connectivity.
- **Standardized Account ID:** `farmer-1-23-A001` (Unified `farmer-month-day-A000` syntax).
- **Authentication & Security:** Case-insensitive institutional login using verified ID and zero-space strong password with special character requirements (e.g., minimum 8 characters with numbers and symbols).
- **Core Rules:**
  - Must have a registered or pending RSBSA enrollment number with the Municipal Agriculture Office (MAO).
  - Navigates via the top **Hanging Navigation Bar** (My Dashboard, Marketplace, Dispatch Slips, SACCO Passbook, Emergency SOS, Barangay Bulletin).
  - Access to browse the regional fleet of **100 Active Certified Machinery Units** across 10 municipal co-op depots.
  - Submits dispatch requests using the interactive `<SmartSearchSelect />` modal with automatic diesel fuel volume estimation.
  - Access is sandboxed; cannot access administrative ledgers or other farmers' records.
- **Permissions:** Read/Write access to own profile, farm parcels, photo avatar, and service dispatch requests.

---

### 2. Machinery Provider / Co-op Depot Manager
- **Profile & Context:** Agricultural cooperative heads (FCA / SACCO) and private machinery pool managers operating regional depots.
- **Standardized Account ID:** `provider-1-23-A001` through `provider-1-23-A010`.
- **Depot Network:** Covers 10 municipal depots across Davao del Norte (Tagum City, Panabo City, Carmen, Sto. Tomas, Kapalong, Asuncion, New Corella, San Isidro, Samal Island, Talaingod), each maintaining 10 dedicated fleet units (100 total units).
- **Core Rules:**
  - Manages depot fleet availability and rates via `/api/assets` using `<SmartSearchSelect />`.
  - Assigns accredited institutional drivers (e.g., *Accredited Operator #1 (Cert #819)*) to pending requests.
  - Accepts broadcasted farmer needs and parameterizes official Field Dispatch Slips.
  - Reviews harvest rotation schedules and reserves cropping blocks to prevent peak season double-booking.
  - Generates downloadable Daily Dispatch Briefing Rosters (`DailyDispatchRoster`) in A4, 80mm Eco-Thermal, and CSV formats.
- **Permissions:** Read access to the public community needs board; Write access to fleet assets, operator rosters, and dispatch statuses.

---

### 3. Field Mechanic / Mobile Repair Unit
- **Profile & Context:** Accredited agrarian technicians and mobile repair vans responding to mechanical breakdowns on the field dike (broken belts, clogged injectors, bogged chassis).
- **Standardized Account ID:** `mechanic-1-23-A001`.
- **Core Rules:**
  - Operates primarily from the **Mechanic Portal** (`/mechanic-dashboard`), monitoring the live "Emergency SOS Breakdown Feed".
  - Logs field repair work orders with `<SmartSearchSelect />`, selecting breakdown equipment and deducting spare parts from the mobile van inventory.
  - Coordinates dike navigation using landmark references and emergency phone links.
- **Permissions:** Read access to SOS broadcasts and work order tickets; Write access to maintenance history and van spare parts inventory.

---

### 4. SACCO / Financial Officer
- **Profile & Context:** Cooperative credit officers and silo weighers managing passbook deductions, moisture adjustments, and harvest grain splits.
- **Core Rules:**
  - Handles passbook deductions for machinery rental and manages palay harvest grain splits (e.g., standard 8-10% share for combine harvesters).
  - Generates standardized printable A4 SACCO receipts factoring in 14.0% moisture content formulas and drying fees.
  - Maintains strict neutrality and privacy compliant with Philippine DPA guidelines.
- **Permissions:** Read/Write access to co-op passbook transactions, weighing receipts, and settlement records.

---

### 5. Municipal Admin / LGU MAO (Command Center)
- **Profile & Context:** Municipal Agriculture Office (MAO) officers and municipal agrarian reform program officers (MARPO).
- **Standardized Account ID:** `admin-1-23-A001`.
- **Core Rules:**
  - Oversees municipal-wide agrarian mechanics, validates RSBSA registrations, and creates verified Farmer ID cards.
  - Manages dual-intake workflows to enroll offline farmers and register cooperative machinery using `<SmartSearchSelect />`.
  - Audits engine serials, chassis numbers, and DA-PhilMech safety clearances across all **100 Active Fleet Units**.
  - Accesses system-wide audit ledgers and monitors platform health.
- **Permissions:** Full Read/Write/Delete administrative authority across municipal data, fleet certifications, and user registrations.

---

### 6. SecOps Specialist / Telemetry Operator
- **Profile & Context:** Systems security administrators managing infrastructure health, IP firewalling, and brute-force intrusion mitigation.
- **Standardized Account ID:** `secops-1-23-A001` (with alias `SECOPS-ALPHA-01`).
- **Core Rules:**
  - Strictly sandboxed to `/x9f-telemetry-vault-8812` (SIEM event logs, IP firewall blacklists, telemetry traffic metrics).
  - Monitors CyGuard threat alerts, initiates DEFCON 1 global authentication lockdowns, and neutralizes rogue IPs.
  - Cannot access agrarian farm dispatch ledgers or create machinery requests.
- **Permissions:** Read/Write authority over SIEM logs, IP blacklists, and traffic telemetry.

---

## 3. Master Website Features Catalog

### 1. Profile Photo Management (5MB Strict Limit)
- **Client-Side Size Validation:** Rejects any image file exceeding **5MB** (`MAX_PHOTO_SIZE_MB = 5`) before upload, accompanied by clear user error banners.
- **File Type Enforcement:** Accepts only standard web image formats: JPEG, PNG, WebP, and GIF.
- **Canvas Dimension Optimization:** Automatically resizes client-side images to an optimal 384×384 square canvas preserving aspect ratios, maintaining crystal-clear avatars without ballooning storage or mobile data usage.
- **Reactive Multi-Component Sync:** Employs window-level `umakonekta_avatar_updated` event broadcasting, synchronizing photo updates in real time across:
  - Top Hanging Navbar avatar.
  - Profile dropdown identity card.
  - Farmer Dashboard welcome banner.
  - Physical RSBSA Farmer ID Card 2x2 photo slot.
- **Clear & Replace Controls:** Allows users to update, replace, or reset their photo to default role-colored avatars at any time.

---

### 2. Standardized ID Formatting System `(user role-month-day register-A000)`
- **Unified Syntax:** Standardized across all user roles:
  - `farmer-1-23-A001`
  - `provider-1-23-A001` through `provider-1-23-A010`
  - `mechanic-1-23-A001`
  - `admin-1-23-A001`
  - `secops-1-23-A001`
- **Real-Time Hyphen Injection (`src/lib/formatters.js`):** Keystroke interceptor that automatically formats raw text (e.g., `farmer123a001` → `farmer-1-23-A001`).
- **Unhyphenated Paste Sanitizer:** Cleans and normalizes unformatted paste strings.
- **Interactive Template Helper Button:** One-tap `Template: [role]-M-D-A001` button on login and registration pages for instant demonstration.
- **Bidirectional Authentication Compatibility:** Seamless NextAuth translation aliases allowing legacy credentials (`03-49-12-00841`, `CDA-FCA-2024-9140`, `MECH-TESDA-889`, `GOV-MAO-R11-0042`, `SECOPS-ALPHA-01`) to authenticate smoothly while normalizing returned sessions to standard IDs.

---

### 3. Physical RSBSA Farmer ID Card Generator & 2x2 Slot
- **Interactive 2x2 Photo Slot:** Direct photo upload trigger with 5MB validation, camera overlay icon, and hover controls embedded directly in the ID card frame.
- **Dual-Sided Layout:**
  - **Front Side:** Republic of the Philippines Department of Agriculture header, Official DA seal, 2x2 photo, Farmer Full Name, RSBSA Registry ID No., Valid Until date, Cooperative Affiliation, and high-density SVG barcode representation.
  - **Back Side:** Land parcel metadata, emergency beneficiary contact, Barangay Captain signature block, and 24/7 MAO hotlines.
- **Multi-Format Previews:** Pixel-perfect CSS layouts for both **CR80 PVC (Standard ID Card)** and **Eco-Thermal 80mm** formats.
- **Farmer Dashboard Modal Integration:** Direct "My RSBSA Farmer ID" modal button on `/farmer-dashboard` allowing farmers to preview and print their official credential at any time.

---

### 4. Public Agricultural Machinery Marketplace (`/marketplace`)
- **Live 100-Unit Fleet Catalog:** Categorized directory of all 100 active fleet units spanning 10 municipal co-op depots.
- **Interactive Category Filtering:** Fast category pill toggles (All, Tractors, Harvesters, Drones, Transplanters, Irrigation, Dryers).
- **Municipality-Aware Search:** Synchronized with onboarding location preferences, instantly highlighting machinery available in the farmer's municipality.
- **Dynamic Booking Request Modal:** Captures scheduled dates, hectarage, and settlement preferences, pre-filling verified credentials and submitting directly to the live cooperative queue.

---

### 5. Printable Agrarian Field Slips & Receipts
- **Operator Field Dispatch Slip (`/dispatch-slip`):** Calibrated for single-sheet standard A4 printing (`210mm x 297mm`). Injects dynamic job tickets, assigned operator credentials, phone hotlines, parcel hectarage, and Cash-on-Dike verification checkboxes.
- **Daily Operations & Dispatch Roster (`/daily-roster`):** 5:00 AM briefing sheet for cooperative depot managers, displaying scheduled fleet movements, aggregate fuel requisitions, driver assignments, CSV export, and dual A4 / Eco-Thermal print modes.
- **SACCO Palay Harvest Scale Ticket (`/sacco-receipt`):** Standardized weighing receipt with automatic mathematical formulas for 14.0% moisture content adjustments, 8-10% harvester shares, and 2% co-op drying deductions.

---

### 6. Trilingual Language Switching (Deprecated)
- **Status:** Removed for a minimalist UI.
- All translation buttons and dropdowns have been purged from the global navigation bar in favor of a cleaner, iconography-first interface.

---

### 7. Interactive Command Palette (`CommandPalette.js`)
- **Quick-Jump System Navigation:** Search modal providing rapid navigation across all portals, pages, tools, and actions.
- **Role-Aware Suggestions:** Prioritizes relevant links for Farmers, Providers, Mechanics, and Admins.
- **Screen-Reader Safe:** Purely interactive search interface that avoids conflicting with native assistive technology hotkeys.

---

### 8. Mobile Mechanics Emergency SOS Breakdown Feed
- **Live Incident Queue:** Dedicated feed on `/mechanic-dashboard` broadcasting urgent field breakdowns (e.g., combine harvester thrown track, hydraulic line rupture).
- **Landmark Navigation Support:** Displays barangay sector, canal lateral references, and emergency farmer contact hotlines.
- **Mobile Van Spare Parts Deduction:** Work order modal with `<SmartSearchSelect />` for instant spare parts lookup and stock deduction.

---

### 9. SecOps Command Center & CyGuard Engine (`/x9f-telemetry-vault-8812`)
- **Real-Time SIEM Event Feed:** Live monitoring of failed logins, role bypass attempts, and brute-force spikes (`prisma.siemLog`).
- **Autonomous IP Firewall:** Instant IP blacklisting and threat neutralization (`prisma.ipBlacklist`).
- **DEFCON 1 Global Lockdown:** Emergency switch allowing operators to temporarily suspend non-SecOps authentication during active attacks.
- **Visitor Traffic Radar:** Tracks client IP addresses, user agents, and geolocation markers.

---

## 4. Frontend Design & UI/UX Architecture

### 100% Full-Width Layout & Zero-Sidebar Design
- **Elimination of Left Sidebar:** Completely removed the static left sidebar (`DashboardSidebar`) across all portals, granting 100% screen real estate to data tables, equipment cards, and interactive forms.
- **Elimination of Breadcrumb Strips:** Purged redundant sub-headers displaying page names and `ROLE: [ROLE]` to reduce visual clutter and cognitive fatigue.
- **High-Contrast Sunlight Visibility:** Field UI built with brilliant white typography against deep agricultural green (`#005426`) and warm ochre accents, tested for readability under harsh outdoor glare.

### Universal Smart Search Selection (`<SmartSearchSelect />`)
- Replaces static `<select>` elements with an accessible, feature-rich combobox.
- Features real-time substring search across titles, subtitles, and badges.
- Full keyboard support (`ArrowDown`, `ArrowUp`, `Enter`, `Escape`).
- Supports freeform custom entries (`allowCustom={true}`) and instant clear (`✕`).

### Top Hanging Navigation Bar & Identity Dropdown
- **100% Solid White Opaque Header (`#ffffff`):** Eliminates dashboard text and card bleed-through.
- **Minimalist Profile Button:** Radically simplified to display only the user avatar logo and a minimal chevron, eliminating text clutter (names, roles, IDs) from the top bar.
- **Role-Specific Quick Links:** Curated actions tailored strictly to the authenticated role.
- **4-Role Directory Switcher:** Interactive 4-tile grid for testing Farmer, Provider, Mechanic, and Admin workspaces.
- **Accessible Touch Targets:** Minimum 44x44px clickable areas for field operability with gloves or stylus pens.

### Animated Sprouting Plant Loading Screen
- Thematic SVG animation depicting a rice seedling sprouting from rich soil into vibrant green leaves.
- Smooth state handling during async credential validation and route transitions, eliminating white screen flashes.

---

## 5. Complete Directory & Folder Structure Architecture

The repository adheres to a clean, single-root Next.js 14 App Router layout. All runtime frontend pages, backend API handlers, reusable components, and core domain utilities are organized under `src/`, while database schemas and public static assets remain strictly separated.

### High-Level Architectural Tree

```text
UmaKonekta-main-1.5/
├── .env                                # Environment variables (DATABASE_URL, NEXTAUTH_SECRET)
├── next.config.js                      # Next.js bundler configuration & security headers
├── package.json                        # NPM package scripts & dependency declarations
├── postcss.config.js                   # PostCSS pipeline for Tailwind CSS
├── tailwind.config.js                  # Custom AgriTech Earth Connect design tokens
├── jsconfig.json                       # Module path aliases (@/* -> ./src/*)
├── BUGS_AUDIT.md                       # Comprehensive security, validation & UI audit report
├── FEATURES_AND_SYSTEM_ARCHITECTURE.md # Master system specification & architectural blueprints
├── README.md                           # Starter documentation & deployment guide
├── UML_USE_CASE_DIAGRAM.md             # Role workflows & Mermaid use-case diagrams
│
├── prisma/                             # Database Layer & Migrations
│   ├── dev.db                          # SQLite local database file
│   ├── schema.prisma                   # Prisma entity models (User, Asset, Request, SiemLog, etc.)
│   └── seed.js                         # Database seed script (10 depots, 100 machines, 4 test users)
│
├── public/                             # Public Static Assets & PWA Cache
│   ├── favicon.ico                     # Standard browser tab icon
│   ├── icon.png                        # High-resolution 512x512 PWA app icon
│   ├── logo.jpg / logo background.png  # Branding marks & textures
│   ├── images/                         # Machinery catalog photos & equipment fallbacks
│   ├── svgs/                           # Vector badges & iconography
│   └── sw.js                           # Workbox service worker for offline asset caching
│
└── src/                                # Application Source Code
    ├── middleware.js                   # Edge WAF, Geo-fencing & SIEM security clearance
    │
    ├── app/                            # Next.js 14 App Router (Pages, Portals & API Handlers)
    │   ├── layout.js                   # Root HTML layout with context providers
    │   ├── globals.css                 # Global CSS rules, Tailwind directives & card sheens
    │   ├── page.js                     # Public Home & Agrarian Landing Page
    │   ├── loading.js                  # Sprouting plant animated route suspense loader
    │   ├── error.js                    # Global edge diagnostic error boundary
    │   ├── not-found.js                # Custom 404 recovery page
    │   ├── sw.js                       # Client-side service worker registration helper
    │   │
    │   ├── (auth)/                     # Authentication & Registration
    │   │   ├── login/page.js           # Multi-role authentication with institutional aliases
    │   │   └── register/page.js        # RSBSA DA legal name validation & account registration
    │   │
    │   ├── (portals)/                  # Role-Specific Dashboard Portals
    │   │   ├── farmer-dashboard/page.js # Farmer passbook, active requests & ID card modal
    │   │   ├── provider-dashboard/page.js # Machinery depot pool, dispatch controls & pricing
    │   │   ├── mechanic-dashboard/page.js # Mobile technician SOS emergency repair queue
    │   │   ├── admin/page.js           # Municipal intake ledger, fleet certification & analytics
    │   │   └── x9f-telemetry-vault-8812/page.js # SecOps telemetry vault, SIEM logs & CyGuard
    │   │
    │   ├── (field-ops)/                # Agrarian Field & Print Documents
    │   │   ├── marketplace/page.js     # 100-unit certified machinery catalog & filters
    │   │   ├── daily-roster/page.js    # Multi-unit daily dispatch schedule & print view
    │   │   ├── dispatch-slip/page.js   # Tractor operator field job ticket & Cash-on-Dike cert
    │   │   ├── sacco-receipt/page.js   # Palay scale ticket, MC14% deductions & thermal print
    │   │   └── bulletin-notice/page.js # Barangay community notice & NIA water rotation bulletin
    │   │
    │   └── api/                        # Backend REST Route Handlers
    │       ├── auth/                   # NextAuth credentials provider & registration endpoint
    │       │   ├── [...nextauth]/route.js # NextAuth handler with rate limits & CyGuard lockouts
    │       │   └── register/route.js   # Account registration with anti-XSS & legal name regex
    │       ├── assets/route.js         # Fleet catalog query & depot availability filter
    │       ├── providers/route.js      # Accredited cooperative depots directory
    │       ├── requests/route.js       # Dispatch booking creations, transitions & approval
    │       ├── dashboard/route.js      # Dynamic role ledger statistics & operational aggregates
    │       ├── operations/calendar/route.js # Scheduled machinery timeline for SmartCalendar
    │       ├── dispatch-slip/route.js  # Field dispatch ledger query & status updater
    │       ├── mechanics/route.js      # Mobile mechanic SOS repair dispatch feed
    │       ├── admin/farmers/route.js  # Municipal beneficiary registration & verification
    │       └── x9f-ops/                # SecOps Telemetry & Defensive Management Endpoints
    │           ├── track/route.js      # Public SIEM telemetry ingest for edge middleware
    │           ├── logs/route.js       # Live SIEM audit trail query & filtering
    │           ├── firewall/route.js   # IP blacklist management & manual IP ban
    │           ├── lockdown/route.js   # DEFCON 1 global emergency lockdown toggle
    │           ├── cyguard/route.js    # Autonomous mitigation configuration toggle
    │           ├── users/route.js      # Directory query & user privilege management
    │           ├── ban-user/route.js   # User account suspension & reinstatement
    │           ├── user-history/route.js # Targeted user authentication audit history
    │           ├── analyze/route.js    # Threat intelligence & anomalous behavior detector
    │           └── purge-logs/route.js # SIEM audit log rotation & cleanup
    │
    ├── components/                     # Modular Reusable UI Components
    │   ├── Navbar.js                   # Opaque top navigation, role switch & profile photo modal
    │   ├── Footer.js                   # Agrarian institutional footer & hotline directory
    │   ├── FarmerIDCard.js             # High-fidelity agrarian member ID badge with glossy sheen
    │   ├── BatchFarmerIDGrid.js        # Multi-card A4 batch layout for LGU mass printing
    │   ├── DailyDispatchRoster.js      # Multi-parcel cropping block schedule & print manager
    │   ├── SmartCalendar.js            # Monthly fleet schedule with offline mode & retry
    │   ├── SmartSearchSelect.js        # Accessible combobox with instant search & clear
    │   ├── ConfirmDialogProvider.js    # Universal confirmation modal with safe native fallback
    │   ├── ErrorMessage.js             # Reusable dismissible error banner component
    │   ├── CommandPalette.js           # Quick keyboard shortcut navigation (`Cmd/Ctrl + K`)
    │   ├── ContentProtection.js        # Protects sensitive field ledgers against casual scraping
    │   ├── FarmerLoadingScreen.js      # Animated sprouting seedling transition screen
    │   ├── PasswordStrengthIndicator.js# Real-time password complexity visualization
    │   ├── MunicipalityOnboarding.js   # First-time municipal depot selection helper
    │   ├── OfflineIndicator.js         # Real-time network connectivity status pill
    │   ├── TrafficTracker.js           # Client-side route transition telemetry tracker
    │   ├── FloatingScrollControls.js   # Smooth page elevation & scroll-to-top buttons
    │   ├── SkipToContent.js            # WCAG accessible skip link for screen readers
    │   ├── MainContentWrapper.js       # Dynamic main container sizing & padding
    │   └── SessionProvider.js          # NextAuth client session wrapper
    │
    └── lib/                            # Core Utilities, Domain Logic & Providers
        ├── prisma.js                   # Prisma ORM singleton client instance
        ├── siem.js                     # Resilient SIEM logger with local file fallback
        ├── userProfile.js              # Canvas avatar optimizer (384x384), quota prune & sync hook
        ├── formatters.js               # Registry ID auto-hyphenation, date & currency formatters
        ├── equipmentImages.js          # Machinery photo resolver with category fallbacks
        └── AccessibilityContext.js     # Text size scaling, high contrast & motion controls
```

### Directory Responsibilities & File Conventions

| Directory | Primary Responsibility | Conventions & Rules |
| :--- | :--- | :--- |
| `src/app/` | Next.js 14 App Router filesystem routes. | Each folder containing a `page.js` corresponds to a browser route. Nested `route.js` files handle HTTP endpoints (`GET`, `POST`, `PATCH`). |
| `src/app/api/` | Secure backend REST API endpoints. | Handlers use `NextResponse.json()`, enforce session authorization tokens, and record security events to SIEM. |
| `src/components/` | Reusable client & server UI components. | Components accept declarative props, avoid browser-blocking `alert()`, and use Tailwind design tokens. |
| `src/lib/` | Shared domain logic, formatters, and singletons. | Houses stateless helper functions, Prisma ORM database clients, and client storage utilities. |
| `prisma/` | Relational database schema and migration tools. | Contains `schema.prisma` definitions, seed data scripts, and the SQLite `dev.db` database file. |
| `public/` | Publicly served static assets and icons. | Contains PWA service worker files, SVG badges, favicon, and fallback equipment images. |

---

## 6. Backend Architecture, Data Modeling & Security

### Technology Stack & API Infrastructure
- **Framework:** Next.js 14 (App Router) with React Server Components and API Route Handlers.
- **Database:** SQLite managed via Prisma ORM (`prisma/schema.prisma` and `prisma/seed.js`).
- **API Endpoints:**
  - `/api/assets`: Manages the 100 active fleet units with filtering by `category`, `providerId`, and `status`.
  - `/api/providers`: Returns the 10 accredited municipal cooperative machinery depots.
  - `/api/requests`: Handles dispatch booking creation, PATCH status transitions, and optimistic client updates.
  - `/api/dashboard`: Serves dynamic request ledgers and real-time operational statistics.
  - `/api/auth/register`: Enforces ID syntax `(user role-month-day register-A000)`, zero-space password policy, and role validation.
  - `/api/x9f-ops/*`: Telemetry, SIEM logs, lockdown controls, and IP firewall management.

### Security, RBAC & Privacy Standards
- **Standardized ID Regex Validation:** Backend validation enforcing `/^(farmer|provider|mechanic|admin)-\d{1,2}-\d{1,2}-[A-Za-z]\d{3,4}$/i`.
- **Zero-Space Password Policy:** Passwords strictly disallow whitespace (`/^\S+$/`) and require 8+ characters, special symbols, and numbers.
- **Edge Middleware Route Protection (`src/middleware.js`):** Edge-level route guarding enforcing role boundaries:
  - `/admin` → strictly restricted to `admin`.
  - `/x9f-telemetry-vault-8812` → strictly restricted to `secops`.
  - `/farmer-dashboard` → restricted to `farmer` and `admin`.
  - `/provider-dashboard` & `/daily-roster` → restricted to `provider` and `admin`.
  - `/mechanic-dashboard` → restricted to `mechanic` and `admin`.
- **Case-Insensitive SQLite Queries:** Implements raw SQL fallback `SELECT id FROM User WHERE LOWER(registryId) = LOWER(...) LIMIT 1` across NextAuth and registration, bypassing SQLite Prisma limitations.
- **DPA RA 10173 Compliance:** Complete eradication of Personally Identifiable Information (PII) from codebase, documentation, and mock stores.

---

## 7. Hardware & Field Printing Workflows

### Dual A4 & Eco-Thermal (80mm) Printing Modes
To bridge rural technological realities, UmaKonekta natively formats all documents for both office laser printers and mobile Bluetooth thermal slip printers:
- **Standard A4 Layout:** Clean, ink-saving borders, PhilMech accreditation seals, and official dual-signature blocks.
- **Eco-Thermal 80mm Layout:** High-contrast monochrome mode that strips colors and complex graphics for 58mm/80mm thermal receipt printers carried on motorcycles and mobile vans.

---

## 8. Comprehensive Updates, Enhancements & Implementation Log

### Architecture & Clean Layout Modernization
- **Repository Flattening:** Consolidated nested directories into a clean single-root project structure at `/`.
- **Full-Width Screen Layout:** Eliminated left sidebar across all user pages.
- **Breadcrumb Strip Elimination:** Removed redundant sub-header strips.
- **Minimalist Overhaul:** Radically simplified the loading screens (inline, non-fullscreen) and stripped the navigation bar of translation buttons and verbose profile text for an ultra-clean aesthetic.
- **Routing Cleanup:** Purged the redundant `/mechanics/portal` directory to unify all mechanic operations strictly under `/mechanic-dashboard`.

### Form Modernization & Usability
- Replaced all static `<select>` elements with `<SmartSearchSelect />` across all 5 user portals.
- Added instant clear, visual subtitle contexts, and custom input capabilities.

### Identity Standardization & Password Hardening
- Enforced structured syntax `(user role-month-day register-A000)` across registration, auth, and database seed.
- Created real-time auto-hyphenation utility (`src/lib/formatters.js`).
- Replaced 4-digit PINs with cryptographically secure zero-space passwords.
- Built interactive real-time password strength meter.

### Profile Photo System & 5MB Limit
- Built `src/lib/userProfile.js` supporting photo upload with strict 5MB validation.
- Integrated photo upload overlays into Navbar, ID Card, and Farmer Dashboard.

### Regional Machinery Fleet Expansion
- Established **100 Active Certified Fleet Units** evenly distributed across **10 Municipal Cooperative Depots**.
- Updated marketplace, provider dashboard, and admin fleet certification views.

### UI/UX Design Audit & Bug Fix Implementation
- **Glassmorphic Navigation**: Integrated dynamic glassmorphism and scroll-based elevation into the top `Navbar` and added interactive hover scale effects for primary actions.
- **Premium ID Card Styling**: Upgraded the `FarmerIDCard` component to feature a premium physical-card aesthetic, including a dynamic CSS-only glossy sheen overlay, deep `shadow-2xl` elevation, and precise `font-mono` registry typography.
- **Form Validation & Security (SecOps)**: Fortified registration forms against XSS by strictly blocking illegal special characters. Implemented an `fs` file-system fallback for the SIEM telemetry logger to guarantee 100% security audit trail integrity even during database outages.
- **SecOps Telemetry Vault Dark Mode**: The `/x9f-telemetry-vault-8812` dashboard is now completely re-themed with an exclusive dark mode (`bg-slate-900` and neon green monospace text). It also integrates custom Toast notifications, replacing all native browser alerts.

### Privacy & Security Fortification
- Completely purged all PII, converting to standardized institutional personas.
- Built edge middleware RBAC and resolved SecOps infinite redirect loops.
- Deployed `/x9f-telemetry-vault-8812` SIEM threat intelligence vault.

---

## 9. Roadmap, Deep-Dive Suggestions & Phased Strategy

### Phased Evolution Plan
1. **Phase 1: Foundation, Full-Width Layout & Identity (COMPLETED):**
   - Single-root structure, full-width UI, standardized ID formatting `(user role-month-day register-A000)`, sprouting plant loader, and live request persistence.
2. **Phase 2: Cooperative Depot Fleet & Dispatch Operations (COMPLETED):**
   - 10-depot / 100-unit fleet expansion, operator assignment, PhilMech pricing presets, harvest rotation cropping block manager, and printable daily rosters (`/daily-roster`).
3. **Phase 3: System Security, RBAC & Profile Photo System (COMPLETED):**
   - Edge middleware route protection, SecOps SIEM telemetry vault, solid opaque hanging navigation bar, and 5MB profile photo upload with multi-component sync.
4. **Phase 4: Advanced Offline Capabilities & Batch Card Generation (NEXT):**
   - Multi-card A4 batch printing grid for LGU assemblies.
   - Background sync optimization for dead-zone field execution.
   - SMS dispatch gateway simulation for non-smartphone farmers.

---

*This document serves as the authoritative, comprehensive master reference for the UmaKonekta Agrarian Operations Suite.*
