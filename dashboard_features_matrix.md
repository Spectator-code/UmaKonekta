# UmaKonekta: Recommended Dashboard Features Matrix

This document outlines the recommended minimalist, high-impact features for each user role's dashboard within the UmaKonekta ecosystem. All features adhere to the **Minimalist Agrarian** design philosophy: high contrast, large touch targets, zero sidebars, and progressive disclosure of information.

---

## 1. Farmer (RSBSA Beneficiary) Dashboard

**Goal:** Quick access to equipment, status of requests, and essential farming data without cognitive overload.

### Key Metrics (Top Row)
- **Active Requests:** Count of currently pending or approved equipment requests.
- **Harvest Season Progress:** A simple timeline or indicator (e.g., "Planting Phase" or "Harvest Phase").

### Core Modules
- **My Bookings / Dispatch Slips:** A chronological feed of upcoming and past machinery bookings. Each card should show:
  - Equipment Name & Type (Icon)
  - Date & Time
  - Status Badge (Pending, Approved, En Route, Completed)
- **Fast Request Action:** A large, prominent, full-width emerald green button: **"Request Machinery"**, leading directly to the `SmartSearchSelect` modal.
- **Digital RSBSA ID:** A compact, interactive card displaying their digital farmer ID, which expands to full screen when tapped for physical validation at the co-op.
- **Emergency SOS Shortcut:** A distinct amber/red button to report field emergencies (e.g., stuck tractor, broken irrigation).

---

## 2. Machinery Provider / Co-op Depot Manager Dashboard

**Goal:** Efficient fleet management, operator assignment, and schedule oversight.

### Key Metrics (Top Row)
- **Fleet Status:** Available vs. In-Use vs. Maintenance counts.
- **Pending Requests:** Number of farmer requests awaiting approval.
- **Daily Revenue/Volume:** Simple metrics on hectares serviced or expected cash-on-dike settlements.

### Core Modules
- **Actionable Request Queue:** A list of pending farmer requests. Clicking a request allows the provider to quickly assign an accredited driver and approve it.
- **Fleet Health Board:** A grid of their machinery (e.g., 10 units per depot) showing current status and location.
- **Daily Dispatch Roster Generator:** A quick action button to generate the "5:00 AM Briefing Sheet" (PDF/Eco-Thermal) for operators.
- **Harvest Rotation Calendar:** A minimalist calendar view showing booked blocks to prevent double-booking during peak seasons.

---

## 3. Field Mechanic / Mobile Repair Unit Dashboard

**Goal:** Rapid response to emergencies and simple logging of field repairs.

### Key Metrics (Top Row)
- **Active SOS Alerts:** Number of ongoing field breakdowns.
- **Completed Repairs (Today):** Simple count of resolved issues.

### Core Modules
- **Live SOS Breakdown Feed:** The central component. A real-time, auto-refreshing list of urgent alerts. Each card shows:
  - Exact Location / Landmark
  - Machine Type & Reported Issue
  - Farmer/Operator Contact
  - **"Accept Job & Navigate"** Button
- **Van Spare Parts Inventory:** A quick lookup tool with a low-stock warning system.
- **Work Order Logger:** A simple, large-touch form to log repairs and deduct parts used once a job is complete.

---

## 4. Municipal Admin / LGU MAO Dashboard

**Goal:** Command-center oversight of the entire municipality's agrarian operations and user verifications.

### Key Metrics (Top Row)
- **Total Registered Farmers:** Count of verified RSBSA members.
- **Active Municipal Fleet:** Total machines currently operating across all co-ops.
- **Pending Verifications:** Users waiting for LGU approval.

### Core Modules
- **Dual-Intake Registration:** Large buttons for **"Register New Farmer"** and **"Register Cooperative Machinery"**.
- **Audit & Compliance Ledger:** A searchable table of all fleet certifications, safety clearances, and driver accreditations.
- **Platform Health Radar:** High-level metrics on successful dispatches versus reported breakdowns.
- **Batch Card Generation:** A tool to generate and print multiple physical RSBSA ID cards for offline distribution at barangay assemblies.

---

## 🛡️ 5. SecOps Specialist / Telemetry Operator Dashboard

**Goal:** Autonomous defense, threat monitoring, and infrastructure health.

### Key Metrics (Top Row)
- **Blocked Threats (24h):** Number of neutralized rogue IPs or brute-force attempts.
- **System Uptime & Latency:** Real-time infrastructure health.

### Core Modules
- **Live SIEM Event Feed:** A high-density, monospaced feed of authentication attempts, role-bypass alerts, and unusual traffic patterns.
- **Active IP Firewall:** A module to view blacklisted IPs and manually revoke or add bans.
- **DEFCON 1 Lockdown Switch:** A secure, multi-step confirmation button to temporarily suspend all non-SecOps logins during an active cyberattack.

---

## Universal Dashboard Guidelines

1. **No Left Sidebars:** 100% full-width layout to maximize screen real estate on mobile devices.
2. **Minimalist Top Navigation:** Only the UmaKonekta logo and a highly simplified Profile Avatar button (no text/names).
3. **High Contrast:** Ensure all text passes WCAG AAA contrast ratios (e.g., dark slate text on cream surfaces) for readability under harsh midday sunlight.
4. **Tactile Boundaries:** Use crisp 1px borders and distinct surface background colors instead of heavy drop-shadows to define cards and actionable areas.
