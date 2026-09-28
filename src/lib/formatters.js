/**
 * Utility functions for formatting and template masking of Registry IDs
 * Standard syntax: (user role-month-day register-F0000), e.g., farmer-0-0-F0000
 */

export function getRoleInitial(role = 'farmer') {
  const map = {
    farmer: 'F',
    provider: 'P',
    mechanic: 'M',
    admin: 'A',
    secops: 'S'
  };
  return map[(role || 'farmer').toLowerCase()] || 'F';
}

/**
 * Returns dynamic role template based on today's month and day:
 * e.g. farmer-0-0-F0000, provider-0-0-P0000, mechanic-0-0-M0000, admin-0-0-A0000
 */
export function getRoleTemplate(role = 'farmer') {
  const initial = getRoleInitial(role);
  return `${(role || 'farmer').toLowerCase()}-0-0-${initial}0000`;
}

export function formatRegistryId(val, activeRole = 'farmer') {
  if (!val) return '';

  // Normalize spaces, dots, underscores into hyphens
  let clean = val.replace(/[\s_.]+/g, '-');

  const roles = ['farmer', 'provider', 'mechanic', 'admin', 'secops'];
  const lower = clean.toLowerCase();

  // 1. If user just finished typing the role exactly (e.g. "farmer"), auto-add "-"
  for (const r of roles) {
    if (lower === r) {
      return `${r.toLowerCase()}-`;
    }
  }

  // Determine current active role initial
  const matchedRole = roles.find(r => lower.startsWith(r + '-')) || activeRole || 'farmer';
  const roleInitial = getRoleInitial(matchedRole);

  // 2. If user typed or pasted full unhyphenated string like "farmer925F0000" or "admin123A001"
  for (const r of roles) {
    if (lower.startsWith(r)) {
      const rest = clean.slice(r.length);
      if (rest && !rest.startsWith('-')) {
        // e.g. "925F0000" or "123A001" or "1015F0000"
        const unhyphenatedWithLetter = rest.match(/^(\d{1,2})(\d{2})([a-zA-Z]\d{3,4})$/);
        if (unhyphenatedWithLetter) {
          return `${r.toLowerCase()}-${unhyphenatedWithLetter[1]}-${unhyphenatedWithLetter[2]}-${unhyphenatedWithLetter[3].toUpperCase()}`;
        }
        // e.g. "9250000" (digits only, missing letter)
        const unhyphenatedDigitsOnly = rest.match(/^(\d{1,2})(\d{2})(\d{3,4})$/);
        if (unhyphenatedDigitsOnly) {
          return `${r.toLowerCase()}-${unhyphenatedDigitsOnly[1]}-${unhyphenatedDigitsOnly[2]}-${getRoleInitial(r)}${unhyphenatedDigitsOnly[3]}`;
        }
        // e.g. "123" without suffix
        const unhyphenatedDates = rest.match(/^(\d{1})(\d{2})$/);
        if (unhyphenatedDates) {
          return `${r.toLowerCase()}-${unhyphenatedDates[1]}-${unhyphenatedDates[2]}`;
        }
        const unhyphenatedDates4 = rest.match(/^(\d{2})(\d{2})$/);
        if (unhyphenatedDates4) {
          return `${r.toLowerCase()}-${unhyphenatedDates4[1]}-${unhyphenatedDates4[2]}`;
        }
        clean = `${r.toLowerCase()}-${rest}`;
        break;
      }
    }
  }

  // 3. For role-based format: role-0-0-suffix
  for (const r of roles) {
    if (clean.toLowerCase().startsWith(r + '-')) {
      const prefix = r.toLowerCase() + '-';
      let rest = clean.slice(prefix.length);

      // If user typed e.g. "1-23a" or "9-25f" without hyphen before suffix
      const missingSuffixHyphen = rest.match(/^(\d{1,2}-\d{1,2})([a-zA-Z].*)$/);
      if (missingSuffixHyphen) {
        rest = `${missingSuffixHyphen[1]}-${missingSuffixHyphen[2]}`;
      }

      // If user typed digits after day without hyphen (e.g. "9-25" then "0")
      const dayThenDigit = rest.match(/^(\d{1,2})-(\d{2})(\d+)$/);
      if (dayThenDigit) {
        rest = `${dayThenDigit[1]}-${dayThenDigit[2]}-${getRoleInitial(r)}${dayThenDigit[3]}`;
      }

      // If user typed e.g. "123A001" after "admin-"
      const missingDateHyphen = rest.match(/^(\d{1})(\d{2})(-[a-zA-Z].*)$/);
      if (missingDateHyphen) {
        rest = `${missingDateHyphen[1]}-${missingDateHyphen[2]}${missingDateHyphen[3]}`;
      }

      // If user typed 3 digits (e.g. "123") after "admin-" without hyphen
      if (/^\d{3}$/.test(rest)) {
        rest = `${rest.slice(0, 1)}-${rest.slice(1)}`;
      } else if (/^\d{4}$/.test(rest)) {
        const m = parseInt(rest.slice(0, 2), 10);
        if (m >= 1 && m <= 12) {
          rest = `${rest.slice(0, 2)}-${rest.slice(2)}`;
        }
      }

      const parts = rest.split('-');
      if (parts.length >= 3) {
        const month = parts[0];
        const day = parts[1];
        let suffix = parts.slice(2).join('-').toUpperCase();

        // Embedded auto-initial: if user typed trailing dash "farmer-0-0-"
        if (suffix === '') {
          suffix = getRoleInitial(r);
        } else if (/^\d+$/.test(suffix)) {
          // If user typed digits only without letter e.g. "farmer-0-0-0000"
          suffix = `${getRoleInitial(r)}${suffix}`;
        }

        return `${prefix}${month}-${day}-${suffix}`;
      } else if (parts.length === 2) {
        return `${prefix}${parts[0]}-${parts[1]}`;
      } else {
        return `${prefix}${parts[0]}`;
      }
    }
  }

  // 4. RSBSA Legacy numeric ID format: 03-49-12-00841
  const digitsOnly = clean.replace(/\D/g, '');
  if (/^\d{11}$/.test(digitsOnly)) {
    return `${digitsOnly.slice(0, 2)}-${digitsOnly.slice(2, 4)}-${digitsOnly.slice(4, 6)}-${digitsOnly.slice(6, 11)}`;
  }

  return clean;
}

/**
 * Unified Machinery Categories across Farmer, Provider, Admin, and Marketplace
 */
export const MACHINERY_CATEGORIES = [
  { value: 'tractor', label: '4WD Heavy Tractor', subtitle: 'Plowing, harrowing & rotavation', icon: 'forklift', badge: 'Land Prep' },
  { value: 'harvester', label: 'Combine Harvester (Tracked)', subtitle: 'Paddy harvesting & direct bagging', icon: 'agriculture', badge: 'Harvest' },
  { value: 'drone', label: 'Precision Spray Drone', subtitle: 'Centrifugal aerial pesticide & foliar fertilizer', icon: 'flight', badge: 'Aviation' },
  { value: 'transplanter', label: 'Mechanical Rice Transplanter', subtitle: 'Walk-behind & riding seedling planting', icon: 'grass', badge: 'Planting' },
  { value: 'dryer', label: 'Recirculating Batch Grain Dryer', subtitle: 'Biomass husk / diesel moisture conditioning', icon: 'grain', badge: 'Post-Harvest' },
  { value: 'pump', label: 'Irrigation Axial / Solar Pump', subtitle: 'Deep well solar & diesel canal water transfer', icon: 'solar_power', badge: 'Irrigation' }
];

/**
 * Unified Canonical Machinery Catalog Options for Booking & Dispatches
 */
export const MACHINERY_CATALOG_PRESETS = [
  {
    id: 'KUB-DC70',
    value: 'Kubota DC-70 Plus Combine Harvester',
    label: 'Kubota DC-70 Plus Combine Harvester',
    category: 'harvester',
    subtitle: 'Tracked crawler with grain hopper • Tagum FCA Depot',
    rate: 2800,
    unit: 'per_ha',
    badge: '₱2,800/ha',
    icon: 'agriculture',
    fuelTerms: 'Farmer supplies 18L Diesel/ha'
  },
  {
    id: 'YAN-EF494',
    value: 'Yanmar EF494T 4WD Heavy Duty Tractor',
    label: 'Yanmar EF494T 4WD Tractor + Tiller',
    category: 'tractor',
    subtitle: '49 HP 4WD with rotary tiller & 3-disc plow',
    rate: 2400,
    unit: 'per_ha',
    badge: '₱2,400/ha',
    icon: 'forklift',
    fuelTerms: 'Farmer supplies 15L Diesel/ha'
  },
  {
    id: 'DJI-T40',
    value: 'DJI Agras T40 Precision Crop Sprayer',
    label: 'DJI Agras T40 Drone Sprayer',
    category: 'drone',
    subtitle: '40L centrifugal dual-atomized sprayer with licensed pilot',
    rate: 950,
    unit: 'per_ha',
    badge: '₱950/ha',
    icon: 'flight',
    fuelTerms: 'Solar battery charged (Drone)'
  },
  {
    id: 'KUB-SPW68',
    value: 'Siam Kubota SPW-68C 6-Row Rice Transplanter',
    label: 'Siam Kubota 6-Row Rice Transplanter',
    category: 'transplanter',
    subtitle: '6-row riding mechanical paddy transplanter',
    rate: 3200,
    unit: 'per_ha',
    badge: '₱3,200/ha',
    icon: 'grass',
    fuelTerms: 'Depot supplied fuel inclusive'
  },
  {
    id: 'BUH-DRY5T',
    value: 'Buhler 5-Ton Grain Recirculating Batch Dryer',
    label: 'Buhler 5-Ton Grain Recirculating Dryer',
    category: 'dryer',
    subtitle: 'Biomass rice-husk continuous batch grain drying',
    rate: 45,
    unit: 'per_sack',
    badge: '₱45/bag',
    icon: 'grain',
    fuelTerms: 'Biomass rice husk powered'
  },
  {
    id: 'BIDA-PUMP5',
    value: 'BIDA 5HP Solar Powered Deep Well Mobile Pump',
    label: 'BIDA 5HP Mobile Solar Deep Well Pump',
    category: 'pump',
    subtitle: '16-panel solar array trailer with 5HP submersible pump',
    rate: 450,
    unit: 'per_day',
    badge: '₱450/day',
    icon: 'solar_power',
    fuelTerms: '100% Solar PV powered'
  }
];

/**
 * Standard Settlement Methods across Farmer Booking, Admin Intake, and SACCO receipts
 */
export const SETTLEMENT_METHODS = [
  {
    value: 'Cash-on-Dike Standard',
    label: 'Cash-on-Dike Standard',
    subtitle: 'Farmer direct cash settlement upon physical inspection at field dike',
    icon: 'payments',
    badge: 'Standard'
  },
  {
    value: 'Cooperative Passbook Split',
    label: 'Cooperative Passbook Split',
    subtitle: 'Automatic deduction via SACCO Agrarian Member Savings Passbook',
    icon: 'account_balance',
    badge: 'Co-op SACCO'
  },
  {
    value: 'DA-PhilMech Subsidy Voucher',
    label: 'DA-PhilMech Subsidy Voucher',
    subtitle: 'Government RCEF mechanization credit voucher redemption',
    icon: 'card_membership',
    badge: 'DA Subsidy'
  }
];

/**
 * Standard Billing Metrics for Machinery Rentals
 */
export const BILLING_UNITS = [
  { value: 'per_ha', label: 'per Hectare (ha)', subtitle: 'Based on surveyed GPS parcel area', icon: 'crop_free', badge: 'Land Area' },
  { value: 'per_day', label: 'per Day (8 hours)', subtitle: 'Full 8-hour engine operating shift', icon: 'schedule', badge: 'Time Shift' },
  { value: 'per_sack', label: 'per Sack / Bag', subtitle: 'Per 50kg bag post-harvest throughput', icon: 'inventory_2', badge: 'Volume' }
];

/**
 * Standard Fuel Policies for Equipment Dispatch
 */
export const FUEL_POLICY_OPTIONS = [
  { value: 'Farmer supplies 18L Diesel/ha', label: 'Farmer Supplies Diesel (18L/ha)', subtitle: 'Client brings fuel jerrycans to field dike', icon: 'local_gas_station', badge: 'Client Fuel' },
  { value: 'Fuel Inclusive within 10km radius', label: 'Fuel Inclusive (+₱400/ha / Depot supplied)', subtitle: 'All diesel covered by machinery depot operations', icon: 'oil_barrel', badge: 'All-In' },
  { value: 'Solar battery charged (Drone)', label: 'Battery / Solar Clean Energy Powered', subtitle: 'Rapid solar chargers and packs managed by operator', icon: 'battery_charging_full', badge: 'Electric' }
];

