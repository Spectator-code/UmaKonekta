# UMAKONEKTA — Master Website Features, System Architecture & User Roles Specification

> **Platform:** UMAKONEKTA (Philippine Agrarian Resource Directory & Exchange Platform)  
> **Core Architecture:** DA-LGU RSBSA Directory Protocol, Unified `(user role-month-day register-A000)` ID Format, Cash-on-Dike Settlement, 100 Active Fleet Units across 10 Municipal Depots, Offline-First PWA, and CyGuard SIEM Telemetry Defense.

---

## Table of Contents
1. [Executive Summary & Workflow Architecture](#1-executive-summary--workflow-architecture)
2. [Comprehensive User Roles & Permissions Matrix](#2-comprehensive-user-roles--permissions-matrix)
3. [Master Website Features Catalog](#3-master-website-features-catalog)
4. [Frontend Design & UI/UX Architecture](#4-frontend-design--uiux-architecture)
5. [Backend Architecture, Data Modeling & Security](#5-backend-architecture-data-modeling--security)
6. [Hardware & Field Printing Workflows](#6-hardware--field-printing-workflows)
7. [Comprehensive Updates, Enhancements & Implementation Log](#7-comprehensive-updates-enhancements--implementation-log)
8. [Roadmap, Deep-Dive Suggestions & Phased Strategy](#8-roadmap-deep-dive-suggestions--phased-strategy)

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
  - Monitors CyGuard AI threat alerts, initiates DEFCON 1 global authentication lockdowns, and neutralizes rogue IPs.
  - Cannot access agrarian farm dispatch ledgers or create machinery requests.
- **Permissions:** Read/Write authority over SIEM logs, IP blacklists, and traffic telemetry.

---

## 3. Master Website Features Catalog

### 1. Profile Photo Management (5MB Strict Limit)
- **Client-Side Size Validation:** Rejects any image file exceeding **5MB** (`MAX_PHOTO_SIZE_MB = 5`) before upload, accompanied by clear user error banners.
- **File Type Enforcement:** Accepts only standard web image formats: JPEG, PNG, WebP, and GIF.
- **Canvas Dimension Optimization:** Automatically resizes client-side images to an optimal 512×512 square canvas preserving aspect ratios, maintaining crystal-clear avatars without ballooning storage or mobile data usage.
- **Reactive Multi-Component Sync:** Employs window-level `profile_photo_updated` event broadcasting, synchronizing photo updates in real time across:
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
- **Live Incident Queue:** Dedicated feed on `/mechanics/portal` broadcasting urgent field breakdowns (e.g., combine harvester thrown track, hydraulic line rupture).
- **Landmark Navigation Support:** Displays barangay sector, canal lateral references, and emergency farmer contact hotlines.
- **Mobile Van Spare Parts Deduction:** Work order modal with `<SmartSearchSelect />` for instant spare parts lookup and stock deduction.

---

### 9. SecOps Command Center & CyGuard AI Engine (`/x9f-telemetry-vault-8812`)
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

## 5. Backend Architecture, Data Modeling & Security

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
- **Standardized ID Regex Validation:** Backend validation enforcing `/^(farmer|provider|mechanic|admin)-\d{1,2}-\d{1,2}-[A-Za-z]\d{3}$/i`.
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

## 6. Hardware & Field Printing Workflows

### Dual A4 & Eco-Thermal (80mm) Printing Modes
To bridge rural technological realities, UmaKonekta natively formats all documents for both office laser printers and mobile Bluetooth thermal slip printers:
- **Standard A4 Layout:** Clean, ink-saving borders, PhilMech accreditation seals, and official dual-signature blocks.
- **Eco-Thermal 80mm Layout:** High-contrast monochrome mode that strips colors and complex graphics for 58mm/80mm thermal receipt printers carried on motorcycles and mobile vans.

---

## 7. Comprehensive Updates, Enhancements & Implementation Log

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

### Privacy & Security Fortification
- Completely purged all PII, converting to standardized institutional personas.
- Built edge middleware RBAC and resolved SecOps infinite redirect loops.
- Deployed `/x9f-telemetry-vault-8812` SIEM threat intelligence vault.

---

## 8. Roadmap, Deep-Dive Suggestions & Phased Strategy

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
