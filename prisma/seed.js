const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding UmaKonekta database with 10 providers and 100 active fleet units...");

  // Core system users
  // Core system users (allows environment overrides for secure deployments)
  const standardUsers = [
    {
      role: 'farmer',
      registryId: 'farmer-1-23-A001',
      password: process.env.SEED_FARMER_PASSWORD || 'Farmer@2026!',
      name: 'Farmer Member #00001'
    },
    {
      role: 'mechanic',
      registryId: 'mechanic-1-23-A001',
      password: process.env.SEED_MECHANIC_PASSWORD || 'Mech@2026!',
      name: 'TESDA Field Mechanic #889'
    },
    {
      role: 'admin',
      registryId: 'admin-1-23-A001',
      password: process.env.SEED_ADMIN_PASSWORD || 'MAO-Command-9912',
      name: 'LGU Admin Officer'
    },
    {
      role: 'secops',
      registryId: 'secops-1-23-A001',
      password: process.env.SEED_SECOPS_PASSWORD || 'SecOps@2026!',
      name: 'SecOps Threat Analyst'
    }
  ];

  // 10 Accredited Equipment Providers (Agricultural Cooperatives & Machinery Depots)
  const providerConfigs = [
    {
      registryId: 'provider-1-23-A001',
      name: 'Tagum FCA Machinery Depot',
      password: process.env.SEED_PROVIDER_PASSWORD || 'TagumAdmin2024!',
      location: 'Tagum City, Davao del Norte',
      units: [
        { name: 'Kubota DC-70 Plus Combine Harvester', type: 'harvester', rate: 2800, unit: 'per_ha', description: '70 HP Turbo Diesel tracked combine with grain tank. Farmer supplies 18L diesel/ha.' },
        { name: 'Yanmar EF494T 4WD Heavy Duty Tractor', type: 'tractor', rate: 2400, unit: 'per_ha', description: '49 HP 4WD with rotary tiller & 3-disc plow. Inclusive within 10km.' },
        { name: 'New Holland TT4.75 Heavy Field Ripper', type: 'tractor', rate: 3500, unit: 'per_ha', description: '75 HP Turbo with 3-shank subsoiler for hardpan clay cracking.' },
        { name: 'Siam Kubota SPW-68C 6-Row Rice Transplanter', type: 'transplanter', rate: 3200, unit: 'per_ha', description: '6-row mechanical transplanter with certified tray loaders included.' },
        { name: 'DJI Agras T40 Precision Crop Sprayer Drone', type: 'drone', rate: 950, unit: 'per_ha', description: '40L payload dual-atomized centrifugal sprayer with licensed pilot.' },
        { name: 'Buhler 5-Ton Grain Recirculating Batch Dryer', type: 'dryer', rate: 45, unit: 'per_bag', description: 'Biomass rice-husk fired recirculating grain dryer (MC 14% target).' },
        { name: 'Kubota M7040 4WD Heavy Duty Mud Tractor', type: 'tractor', rate: 2600, unit: 'per_ha', description: '70 HP heavy tractor with high-lug cage wheels for deep wetland paddies.' },
        { name: 'Yanmar AW70V Tracked Rice Combine Harvester', type: 'harvester', rate: 2900, unit: 'per_ha', description: 'High-speed tracked grain harvester with straw chopper and cutterbar.' },
        { name: 'BIDA 5HP Solar Powered Deep Well Mobile Pump', type: 'pump', rate: 450, unit: 'per_day', description: '16-panel mobile solar array trailer with 5HP submersible axial pump.' },
        { name: 'Kubota NSPU-68CMD High-Speed Riding Transplanter', type: 'transplanter', rate: 3400, unit: 'per_ha', description: 'Riding-type 6-row high precision transplanter for rapid seedling planting.' }
      ]
    },
    {
      registryId: 'provider-1-23-A002',
      name: 'Apokon Agrarian Reform Beneficiaries Cooperative',
      password: 'Apokon2024!',
      location: 'Brgy. Apokon, Tagum City',
      units: [
        { name: 'Yanmar EF494T 4WD Heavy Tractor + Rotary Tiller', type: 'tractor', rate: 2400, unit: 'per_ha', description: '49 HP 4WD tractor equipped with 2.2m heavy duty rotavator.' },
        { name: 'Kubota DC-60 Tracked Combine Harvester', type: 'harvester', rate: 2600, unit: 'per_ha', description: 'Compact tracked combine suited for narrow bunds and small farm plots.' },
        { name: 'John Deere 5050D 4WD Utility Tractor', type: 'tractor', rate: 2500, unit: 'per_ha', description: '50 HP heavy pull tractor with 3-furrow disc plow.' },
        { name: 'DJI Agras T30 Heavy Granular & Spray Drone', type: 'drone', rate: 900, unit: 'per_ha', description: '30L spray and 40kg solid fertilizer spreader with RTK accuracy.' },
        { name: 'Suncue 6-Ton Recirculating Paddy Dryer', type: 'dryer', rate: 42, unit: 'per_bag', description: 'Computerized moisture control dryer using agricultural biomass husk.' },
        { name: 'Kubota KND-180 8-inch High-Volume Mobile Axial Pump', type: 'pump', rate: 500, unit: 'per_day', description: '8-inch mobile flood and canal transfer pump with diesel engine.' },
        { name: 'Yanmar VP6D Riding 6-Row Diesel Transplanter', type: 'transplanter', rate: 3300, unit: 'per_ha', description: 'Fuel-efficient diesel riding transplanter with hydraulic floating pan.' },
        { name: 'Massey Ferguson 2605 Deep Tiller', type: 'tractor', rate: 2350, unit: 'per_ha', description: '48 HP rugged tractor with spring-loaded chisel plow.' },
        { name: 'Sonalika Tiger DI 60 4WD Heavy Rotavator', type: 'tractor', rate: 2450, unit: 'per_ha', description: '60 HP heavy duty tractor for fast wetland puddling and leveling.' },
        { name: 'Kubota L3408 4WD Compact Rice Paddy Tractor', type: 'tractor', rate: 2100, unit: 'per_ha', description: '34 HP compact tractor with paddler wheel attachments for terraced land.' }
      ]
    },
    {
      registryId: 'provider-1-23-A003',
      name: 'San Manuel Farmers Multi-Purpose Cooperative',
      password: 'SanManuel2024!',
      location: 'Brgy. San Manuel, Tagum City',
      units: [
        { name: 'Kubota DC-70G Rice & Corn Tracked Harvester', type: 'harvester', rate: 2850, unit: 'per_ha', description: 'Heavy-duty crawler combine harvester with optional corn header attachment.' },
        { name: 'New Holland TC5.30 Multi-Crop Combine Harvester', type: 'harvester', rate: 3100, unit: 'per_ha', description: 'Commercial grade combine harvester for continuous broad-acre harvest.' },
        { name: 'Kubota M9540 95HP Heavy Mud Crawler Tractor', type: 'tractor', rate: 2900, unit: 'per_ha', description: '95 HP turbocharged tractor for extreme mud depth and subsoiling.' },
        { name: 'XAG P100 Pro Agricultural Drone (50L Payload)', type: 'drone', rate: 980, unit: 'per_ha', description: 'Quad-rotor folding drone with high-volume peristaltic pump system.' },
        { name: 'Yanmar TF160 Diesel 6-inch Centrifugal Pump', type: 'pump', rate: 480, unit: 'per_day', description: '6-inch high pressure diesel irrigation pump mounted on steel skids.' },
        { name: 'Buhler 6-Ton Biomass Husk-Fired Grain Dryer', type: 'dryer', rate: 44, unit: 'per_bag', description: 'Continuous flow grain drying with automated heat exchanger.' },
        { name: 'Siam Kubota 4-Row Walk-Behind Transplanter', type: 'transplanter', rate: 2800, unit: 'per_ha', description: 'Lightweight transplanter ideal for small farmers with soft muddy base.' },
        { name: 'John Deere 5310 55HP 4WD Disc Plow Tractor', type: 'tractor', rate: 2550, unit: 'per_ha', description: '55 HP heavy duty tractor with heavy moldboard and disc plow.' },
        { name: 'Claas Crop Tiger 30 Terra Trac Harvester', type: 'harvester', rate: 3000, unit: 'per_ha', description: 'Rubber-tracked grain harvester with high throughput cleaning shoes.' },
        { name: 'Mahindra 575 DI 4WD Puddle & Levee Tractor', type: 'tractor', rate: 2200, unit: 'per_ha', description: '45 HP tractor configured with ditcher and levee-making implement.' }
      ]
    },
    {
      registryId: 'provider-1-23-A004',
      name: 'Panabo City Rice & Corn Mechanization Hub',
      password: 'Panabo2024!',
      location: 'Brgy. Malasin, Panabo City',
      units: [
        { name: 'Yanmar YH850 Tracked Large-Capacity Combine', type: 'harvester', rate: 3000, unit: 'per_ha', description: '85 HP tracked grain harvester with 2-ton hopper and unloading auger.' },
        { name: 'Kubota MU5502 4WD Heavy Land Prep Tractor', type: 'tractor', rate: 2500, unit: 'per_ha', description: '55 HP Synchromesh transmission tractor with 3-blade disc plow.' },
        { name: 'DJI Agras T50 Dual-Atomized Precision Sprayer', type: 'drone', rate: 1050, unit: 'per_ha', description: '50kg payload flagship spraying drone with coaxial twin-rotor thrust.' },
        { name: 'Suncue 10-Ton Industrial Grain Recirculating Dryer', type: 'dryer', rate: 40, unit: 'per_bag', description: 'High-capacity cooperative drying plant for community palay volume.' },
        { name: 'Kubota SPV-6CMD Riding Rice Transplanter', type: 'transplanter', rate: 3350, unit: 'per_ha', description: '6-row riding transplanter with automated seedling depth control.' },
        { name: 'Yanmar EF393T 39HP 4WD Lightweight Paddy Tractor', type: 'tractor', rate: 2150, unit: 'per_ha', description: '39 HP compact diesel tractor designed for minimum soil compaction.' },
        { name: 'Honda GX390 Mobile High-Pressure Irrigation Unit', type: 'pump', rate: 420, unit: 'per_day', description: '4-inch self-priming petrol pump with 50-meter heavy discharge hose.' },
        { name: 'New Holland TD5.90 90HP Heavy Field Ripper', type: 'tractor', rate: 2850, unit: 'per_ha', description: '90 HP turbo tractor for sugarcane, corn, and deep paddy prep.' },
        { name: 'Kubota DC-93 High-Capacity Grain Combine Harvester', type: 'harvester', rate: 3200, unit: 'per_ha', description: '93 HP high capacity combine with long track ground contact area.' },
        { name: 'Farmtrac 6055 Classic 4WD Heavy Duty Tractor', type: 'tractor', rate: 2300, unit: 'per_ha', description: '55 HP workhorse tractor with 16-speed transmission and subsoiler.' }
      ]
    },
    {
      registryId: 'provider-1-23-A005',
      name: 'Carmen Agrarian Valley Machinery Depot',
      password: 'Carmen2024!',
      location: 'Brgy. Sto. Tomas, Carmen',
      units: [
        { name: 'Kubota DC-70 Plus Combine with Straw Chopper', type: 'harvester', rate: 2800, unit: 'per_ha', description: 'Tracked combine harvester with integrated residue chopper for organic mulch.' },
        { name: 'Yanmar EF725T 72HP 4WD Land Leveler Tractor', type: 'tractor', rate: 2700, unit: 'per_ha', description: '72 HP heavy tractor with laser-guided land leveling blade.' },
        { name: 'DJI Agras T25 Compact Precision Field Drone', type: 'drone', rate: 880, unit: 'per_ha', description: '20L compact agile drone for small fields and patchy crops.' },
        { name: 'SuperBrix 8-Ton Biomass Continuous Grain Dryer', type: 'dryer', rate: 43, unit: 'per_bag', description: '8-ton continuous flow dryer with rice hull burner furnace.' },
        { name: 'BIDA 7.5HP Solar Powered Deep Well Mobile Array', type: 'pump', rate: 490, unit: 'per_day', description: '24-panel mobile solar array trailer with 7.5HP high-head pump.' },
        { name: 'Siam Kubota NSPU-68C High-Speed Rice Transplanter', type: 'transplanter', rate: 3250, unit: 'per_ha', description: 'High productivity 6-row transplanter with nursery mat seedling feed.' },
        { name: 'John Deere 5045D 4WD Utility Tractor + Disc Harrow', type: 'tractor', rate: 2400, unit: 'per_ha', description: '45 HP utility tractor with heavy offset disc harrow implement.' },
        { name: 'Massey Ferguson 2615 4WD 50HP Subsoiler Tractor', type: 'tractor', rate: 2450, unit: 'per_ha', description: '50 HP reliable tractor with sub-surface drainage furrower.' },
        { name: 'Yanmar AW82G Tracked Grain Harvester', type: 'harvester', rate: 2950, unit: 'per_ha', description: '82 HP large-chassis combine harvester with air-conditioned cabin.' },
        { name: 'Kubota B2420 Mini Mud Tractor for Terraced Paddies', type: 'tractor', rate: 1850, unit: 'per_ha', description: '24 HP ultra-light 4WD tractor suited for small terraced plots.' }
      ]
    },
    {
      registryId: 'provider-1-23-A006',
      name: 'Asuncion Saug River Agri-Machinery Cooperative',
      password: 'Asuncion2024!',
      location: 'Brgy. Cruz, Asuncion',
      units: [
        { name: 'Kubota DC-70G Cabin Air-Con Tracked Harvester', type: 'harvester', rate: 2900, unit: 'per_ha', description: 'Enclosed air-conditioned cabin combine harvester with wide tracks.' },
        { name: 'Yanmar YT490 90HP Heavy 4WD Rotary Tiller', type: 'tractor', rate: 2800, unit: 'per_ha', description: '90 HP high-spec tractor with heavy rotary tiller and reverser.' },
        { name: 'XAG V40 Dual-Rotor Agricultural Precision Drone', type: 'drone', rate: 920, unit: 'per_ha', description: 'Twin-rotor tilting drone with centrifugal atomization nozzles.' },
        { name: 'Kubota KND-220 10-inch High-Capacity Lift Pump', type: 'pump', rate: 550, unit: 'per_day', description: '10-inch river and canal axial pump with 22HP diesel engine.' },
        { name: 'Suncue PHS-130 5-Ton Grain Moisture Control Dryer', type: 'dryer', rate: 45, unit: 'per_bag', description: 'Recirculating batch dryer with uniform drying grain sensor.' },
        { name: 'Kubota KND-150 Mobile Self-Priming River Pump', type: 'pump', rate: 460, unit: 'per_day', description: '6-inch self-priming mobile water pump on heavy duty cart.' },
        { name: 'Yanmar VP8D 8-Row High-Efficiency Rice Transplanter', type: 'transplanter', rate: 3500, unit: 'per_ha', description: '8-row high capacity riding transplanter with row spacing adjuster.' },
        { name: 'New Holland TT3.50 50HP 4WD Farm Utility Tractor', type: 'tractor', rate: 2350, unit: 'per_ha', description: '50 HP versatile 4WD farm tractor with rotary slasher.' },
        { name: 'Sonalika Worldtrac 60 Heavy Duty Mud Plodder', type: 'tractor', rate: 2400, unit: 'per_ha', description: '60 HP tractor fitted with anti-bogging rear paddle wheels.' },
        { name: 'Kubota DC-68G Tracked Rice & Soybean Combine', type: 'harvester', rate: 2750, unit: 'per_ha', description: '68 HP multi-crop tracked combine with low grain loss system.' }
      ]
    },
    {
      registryId: 'provider-1-23-A007',
      name: 'Kapalong Datu Balite Agricultural Pool',
      password: 'Kapalong2024!',
      location: 'Brgy. Maniki, Kapalong',
      units: [
        { name: 'Yanmar YH700 Tracked Rice Combine Harvester', type: 'harvester', rate: 2850, unit: 'per_ha', description: '70 HP high flotation tracked combine for wetland paddies.' },
        { name: 'Kubota M6040 4WD Heavy Duty Disc Plow Tractor', type: 'tractor', rate: 2550, unit: 'per_ha', description: '60 HP heavy duty tractor with heavy disc plow and harrow.' },
        { name: 'DJI Agras T40 Ultra-Low Volume Field Sprayer Drone', type: 'drone', rate: 950, unit: 'per_ha', description: '40L precision agricultural drone with dual atomizers.' },
        { name: 'BIDA 10HP Mobile Solar Irrigation Array Trailer', type: 'pump', rate: 520, unit: 'per_day', description: '32-panel mobile solar array trailer with 10HP deep well pump.' },
        { name: 'Buhler 8-Ton Biomass Husk Batch Paddy Dryer', type: 'dryer', rate: 42, unit: 'per_bag', description: '8-ton capacity husk-fired batch dryer with cyclone dust separator.' },
        { name: 'Siam Kubota SPW-68C 6-Row Rice Transplanter Unit B', type: 'transplanter', rate: 3200, unit: 'per_ha', description: '6-row walk-behind mechanical transplanter with operator.' },
        { name: 'John Deere 5065E 65HP Heavy Mud Plowing Tractor', type: 'tractor', rate: 2650, unit: 'per_ha', description: '65 HP 4WD tractor equipped with heavy trailing rotavator.' },
        { name: 'Yanmar EF453T 45HP 4WD Compact Rice Paddy Tractor', type: 'tractor', rate: 2250, unit: 'per_ha', description: '45 HP lightweight tractor ideal for sticky clay soils.' },
        { name: 'Claas Crop Tiger 40 Wheel Harvester', type: 'harvester', rate: 2950, unit: 'per_ha', description: 'Wheeled combine harvester with auxiliary mud tires for upland rice.' },
        { name: 'Solis 50 4WD Heavy Duty Farm Workhorse Tractor', type: 'tractor', rate: 2300, unit: 'per_ha', description: '50 HP rugged mechanical transmission tractor with front weights.' }
      ]
    },
    {
      registryId: 'provider-1-23-A008',
      name: 'New Corella Green Valley Equipment Pool',
      password: 'NewCorella2024!',
      location: 'Brgy. Poblacion, New Corella',
      units: [
        { name: 'Kubota DC-70 Plus High-Clearance Track Harvester', type: 'harvester', rate: 2800, unit: 'per_ha', description: 'High clearance tracked combine for waterlogged fields.' },
        { name: 'Yanmar EF494T 4WD Tractor + 2.2m Rotavator', type: 'tractor', rate: 2400, unit: 'per_ha', description: '49 HP tractor with heavy rotavator for fine seedbed preparation.' },
        { name: 'DJI Agras T30 Precision Bio-Fertilizer Seeder & Drone', type: 'drone', rate: 920, unit: 'per_ha', description: '30L agricultural drone equipped with direct rice seeding spreading hopper.' },
        { name: 'SuperBrix 6-Ton Recirculating Paddy Dryer', type: 'dryer', rate: 44, unit: 'per_bag', description: '6-ton grain dryer with automatic grain discharge and elevator.' },
        { name: 'Yanmar TF140 Diesel 4-inch Portable Sump Pump', type: 'pump', rate: 400, unit: 'per_day', description: '4-inch portable diesel pump for creek drainage and pond filling.' },
        { name: 'Kubota NSPU-68C Riding Transplanter with Marker', type: 'transplanter', rate: 3300, unit: 'per_ha', description: 'Riding-type transplanter with automated hydraulic line markers.' },
        { name: 'New Holland TT4.55 55HP 4WD Mud Puddle Tractor', type: 'tractor', rate: 2450, unit: 'per_ha', description: '55 HP 4WD tractor with 4-blade rotary tiller for paddy leveling.' },
        { name: 'Massey Ferguson 375 75HP Heavy Disc Plow Tractor', type: 'tractor', rate: 2700, unit: 'per_ha', description: '75 HP heavy duty tractor for virgin soil and fallow land tillage.' },
        { name: 'Yanmar AW70V High-Efficiency Track Harvester Unit B', type: 'harvester', rate: 2900, unit: 'per_ha', description: 'Tracked combine harvester with wide thresher drum and straw spreader.' },
        { name: 'Mahindra Yuvo 575 DI 4WD Farm Tractor', type: 'tractor', rate: 2250, unit: 'per_ha', description: '45 HP modern tractor with 12 forward + 3 reverse transmission.' }
      ]
    },
    {
      registryId: 'provider-1-23-A009',
      name: 'Braulio E. Dujali Irrigators Farm Machinery Pool',
      password: 'Dujali2024!',
      location: 'Brgy. Dujali, B.E. Dujali',
      units: [
        { name: 'Kubota DC-70G Multi-Crop Rice & Corn Combine', type: 'harvester', rate: 2850, unit: 'per_ha', description: '70 HP versatile combine harvester with rapid grain bagger.' },
        { name: 'Yanmar YT5113 113HP Heavy Subsoil Ripper Tractor', type: 'tractor', rate: 3200, unit: 'per_ha', description: '113 HP heavy high-power tractor for deep clay pan fracturing.' },
        { name: 'XAG P100 Pro Granular Fertilizer Spreader Drone', type: 'drone', rate: 960, unit: 'per_ha', description: 'Agricultural drone configured for fast broadcast seeding and urea spreading.' },
        { name: 'Suncue 8-Ton Energy-Saving Husk-Fired Dryer', type: 'dryer', rate: 43, unit: 'per_bag', description: '8-ton recirculating dryer with computerized heat controller.' },
        { name: 'Kubota KND-250 12-inch High-Volume Canal Lift Pump', type: 'pump', rate: 600, unit: 'per_day', description: '12-inch irrigation canal lift pump for communal rice irrigation.' },
        { name: 'Siam Kubota SPW-68C Walk-Behind Rice Transplanter', type: 'transplanter', rate: 3100, unit: 'per_ha', description: 'Reliable 6-row walking transplanter with seedling conveyor.' },
        { name: 'John Deere 5075E 75HP Heavy 4WD Plowing Tractor', type: 'tractor', rate: 2750, unit: 'per_ha', description: '75 HP heavy tractor with 4-bottom reversible disc plow.' },
        { name: 'Yanmar EF393T Lightweight Wetland Puddle Tractor', type: 'tractor', rate: 2150, unit: 'per_ha', description: '39 HP tractor designed for deep mud paddies with floating wheels.' },
        { name: 'Kubota DC-60 Combine Harvester for Terraced Parcels', type: 'harvester', rate: 2600, unit: 'per_ha', description: 'Compact tracked combine harvester for tight turnings and small parcels.' },
        { name: 'Sonalika DI 750 Heavy Duty Disc Harrow Tractor', type: 'tractor', rate: 2500, unit: 'per_ha', description: '55 HP heavy tractor with 18-disc notched harrowing implement.' }
      ]
    },
    {
      registryId: 'provider-1-23-A010',
      name: 'Davao Precision Drone & Agri-Tech Depot',
      password: 'DavaoPrecision2024!',
      location: 'Brgy. Mankilam, Tagum City',
      units: [
        { name: 'DJI Agras T50 Intelligent Spraying & Spreading Drone', type: 'drone', rate: 1050, unit: 'per_ha', description: '50kg high-throughput spraying and spreading drone with phased-array radar.' },
        { name: 'DJI Agras T40 Precision Crop Sprayer Drone Unit #2', type: 'drone', rate: 950, unit: 'per_ha', description: '40L drone sprayer with active obstacle avoidance sensors.' },
        { name: 'DJI Agras T40 Precision Crop Sprayer Drone Unit #3', type: 'drone', rate: 950, unit: 'per_ha', description: '40L drone sprayer optimized for micro-nutrient and foliar fertilizer.' },
        { name: 'XAG P100 Pro Agricultural Multi-Rotor Drone Unit #2', type: 'drone', rate: 980, unit: 'per_ha', description: 'Autonomous RTK guided agricultural flight system for pest management.' },
        { name: 'Kubota M7040 4WD Heavy Tractor with GPS Guidance', type: 'tractor', rate: 2700, unit: 'per_ha', description: '70 HP tractor equipped with Trimble auto-steer GPS for straight plowing.' },
        { name: 'Yanmar YH850 High-Speed Tracked Grain Harvester', type: 'harvester', rate: 3050, unit: 'per_ha', description: '85 HP high-speed grain combine harvester with grain loss monitors.' },
        { name: 'BIDA 12HP Mobile Solar Deep Well Pumping Station', type: 'pump', rate: 580, unit: 'per_day', description: 'Mobile 40-panel solar array trailer with 12HP submersible pump.' },
        { name: 'Buhler 10-Ton Precision Automated Rice Dryer', type: 'dryer', rate: 42, unit: 'per_bag', description: '10-ton automated grain dryer with digital grain moisture meter.' },
        { name: 'Kubota NSPU-68CMD GPS-Assisted Rice Transplanter', type: 'transplanter', rate: 3500, unit: 'per_ha', description: '6-row riding transplanter with precision row markers and tray carrier.' },
        { name: 'New Holland TT4.75 Heavy Rotavator & Seed Drill', type: 'tractor', rate: 2650, unit: 'per_ha', description: '75 HP tractor with combined rotavator and mechanical seed drill box.' }
      ]
    }
  ];

  // 1. Upsert standard users (Farmer, Mechanic, Admin)
  for (const u of standardUsers) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { registryId: u.registryId },
      update: { name: u.name, role: u.role, passwordHash },
      create: {
        role: u.role,
        registryId: u.registryId,
        passwordHash,
        name: u.name
      }
    });
  }

  // 2. Upsert the 10 Providers
  const providerRecords = [];
  for (const p of providerConfigs) {
    const passwordHash = await bcrypt.hash(p.password, 10);
    const providerRecord = await prisma.user.upsert({
      where: { registryId: p.registryId },
      update: { name: p.name, role: 'provider', passwordHash },
      create: {
        role: 'provider',
        registryId: p.registryId,
        passwordHash,
        name: p.name
      }
    });
    providerRecords.push({ ...providerRecord, units: p.units, location: p.location });
  }

  // 3. Clear existing assets and recreate the 100 Active Fleet Units
  // First, check dispatch requests referencing assets and clean if needed
  await prisma.dispatchRequest.deleteMany({});
  await prisma.asset.deleteMany({});

  let assetCount = 0;
  for (const p of providerRecords) {
    for (const unit of p.units) {
      await prisma.asset.create({
        data: {
          providerId: p.id,
          name: unit.name,
          type: unit.type,
          description: unit.description,
          rate: unit.rate,
          unit: unit.unit,
          status: 'available', // Active Fleet Unit
          location: p.location
        }
      });
      assetCount++;
    }
  }

  // 4. Create realistic active dispatch requests for demo
  const sampleFarmer = await prisma.user.findUnique({ where: { registryId: 'farmer-1-23-A001' } });
  const sampleAsset1 = await prisma.asset.findFirst({ where: { name: { contains: 'Combine Harvester' } } });
  const sampleAsset2 = await prisma.asset.findFirst({ where: { name: { contains: 'Tractor' } } });

  if (sampleFarmer && sampleAsset1 && sampleAsset2) {
    await prisma.dispatchRequest.create({
      data: {
        farmerId: sampleFarmer.id,
        assetId: sampleAsset1.id,
        status: 'approved',
        date: new Date('2026-10-14'),
        hectares: 2.5,
        totalCost: 7000,
        notes: 'Sector: Purok 2 (Sitio Balite) | Phone: 0917-000-0001 | Cash-on-Dike settlement.'
      }
    });

    await prisma.dispatchRequest.create({
      data: {
        farmerId: sampleFarmer.id,
        assetId: sampleAsset2.id,
        status: 'pending',
        date: new Date('2026-10-18'),
        hectares: 1.8,
        totalCost: 4320,
        notes: 'Sector: Purok 3 (East Rice Basin) | Phone: 0928-000-0003 | Primary rotavator plowing.'
      }
    });
  }

  console.log(`\n========================================`);
  console.log(`Database successfully seeded!`);
  console.log(`- Providers created: ${providerRecords.length} Providers`);
  console.log(`- Active Fleet Units: ${assetCount} Units (Status: available)`);
  console.log(`========================================\n`);
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
