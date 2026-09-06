# UMAKONEKTA - Next.js (React) JavaScript Starter Prototype

> **Philippine Agricultural Resource Exchange Platform**  
> Modern Farm Machinery within Reach of Every Barangay.

This prototype represents the modern Next.js (React) + JavaScript implementation of the **Umakonekta Agrarian Operations Suite**, built with the **AgriTech Earth Connect** design tokens, offline PWA readiness, and strict adherence to Philippine agrarian settlement realities.

---

## 🌾 The Agrarian Cash-on-Dike & Passbook Standard

Unlike urban consumer platforms that force credit card or digital e-wallet checkouts (Stripe, GCash, PayMaya), **UMAKONEKTA features Zero Digital Checkout Gateways**. 

Philippine rice farmers and machinery operators operate in low-connectivity fields, relying on trusted physical and cooperative arrangements:
1. **Cash-on-Dike Settlement:** Payment is handed directly to machine operators in physical cash once the farmer has inspected the tilled or harvested parcel boundaries at the field dike.
2. **Cooperative Passbook Ledgers:** Machinery rental fees or custom rates are debited against member harvest credit at the local municipal Agrarian Beneficiaries Cooperative (SACCO).
3. **Palay Harvest Grain Split:** Combining and threshing fees are settled in-kind as a percentage of harvested clean and dry grain bags (e.g., standard 8% - 10% share).

---

## 📁 Key Routes in this Prototype

| Route | Purpose | Agrarian Domain Feature |
|---|---|---|
| `/` | Interactive Agrarian Home | Live machinery search, verified metrics, 5 core pathway cards, emergency contact banner. |
| `/marketplace` | Equipment Marketplace | 4WD tractors, combine harvesters, drone sprayers with filters, live status, and zero-digital reservation modal. |
| `/farmer-dashboard` | Farmer Member Ledger | RSBSA profile, cooperative passbook balances, palay sack reserves, active field requests, and transaction history. |
| `/dispatch-slip` | Operator Field Dispatch Slip | Digital job ticket for tractor operators, hectare calculations, diesel readings, and Cash-on-Dike certification. |
| `/sacco-receipt` | Palay SACCO Scale Ticket | Grain moisture (MC 14%) deductions, gross/tare weights, net payable formula, and Eco-Monochrome thermal print preview. |
| `/bulletin-notice` | Barangay Public Bulletin | Official DA-LGU rotation calendar, NIA irrigation canal releases, diesel subsidy alerts, and printable community notice. |

---

## 🛠️ Stack & Technology

- **Core Framework:** Next.js 14+ (React 18) with App Router (`src/app/`)
- **Language:** Clean JavaScript (ES6+ / JSX) — lightweight, accessible, zero TypeScript build overhead
- **Styling:** Tailwind CSS 3.4 with **AgriTech Earth Connect** color tokens:
  - `primary`: `#005426` (Philippine Evergreen / Forest)
  - `field-ochre`: `#C26D1A` (Harvest Ochre)
  - `harvest-amber`: `#F4A228` (Sunlit Grain)
  - `cream-surface`: `#FBFBF7` (Natural Paper & Field Linen)
  - `soil-slate`: `#475953` (Alluvial Silt)
- **Typography:** Google Fonts (`Plus Jakarta Sans` for body & headlines, `Space Grotesk` for data/thermal receipts)
- **Icons:** Material Symbols Outlined & Lucide React
- **Offline / PWA:** Serwist / Workbox Service Worker strategy (Cache-First for UI, Network-First with IndexedDB fallback for field slips)
- **Print Optimization:** Dedicated `@media print` and Eco-Monochrome modes for thermal receipt printers (80mm ESC/POS) and ink-saving community bulletin boards.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd nextjs_app
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
npm start
```

---

## 🔗 Cross-Reference: Legacy Stitch HTML Screens

This Next.js application corresponds directly to the 19 legacy Stitch HTML screen directories located in the parent folder:

1. `umakonekta_secure_authentication_identity_verification/` -> `/login`
2. `umakonekta_farm_equipment_marketplace/` -> `/marketplace`
3. `umakonekta_home_landing_page_interactive_animated/` -> `/`
4. `umakonekta_how_it_works/` -> `/how-it-works`
5. `umakonekta_machinery_product_detail_booking/` -> `/marketplace/[id]`
6. `umakonekta_resource_detail_schedule_request/` -> `/resources/[id]`
7. `umakonekta_farmer_requestor_dashboard/` -> `/farmer-dashboard`
8. `umakonekta_resource_provider_dashboard/` -> `/provider-dashboard`
9. `umakonekta_operator_field_dispatch_slip_job_ticket/` -> `/dispatch-slip`
10. `umakonekta_field_repair_on_site_mechanics_booking_flow/` -> `/mechanics/book`
11. `umakonekta_mobile_repair_field_mechanics_portal/` -> `/mechanics/portal`
12. `umakonekta_administrator_portal_moderation/` -> `/admin`
13. `umakonekta_user_role_management_verification/` -> `/admin/roles`
14. `umakonekta_palay_harvest_sacco_receipt_scale_ticket/` -> `/sacco-receipt`
15. `umakonekta_palay_harvest_sacco_receipt_scale_ticket_mobile/` -> `/sacco-receipt/mobile`
16. `umakonekta_palay_harvest_sacco_receipt_scale_ticket_eco_monochrome_print_preview/` -> `/sacco-receipt?print=eco`
17. `umakonekta_printable_barangay_hall_guide_bulletin_notice/` -> `/bulletin-notice`
18. `umakonekta_printable_barangay_hall_guide_eco_monochrome_print_preview/` -> `/bulletin-notice?print=eco`
19. `umakonekta_critical_agricultural_emergency_contacts_hotline_directory/` -> `/emergency`

---

*DA-LGU Accreditation #2026-CAR-041 • RSBSA Cooperative Registry Protocol*
