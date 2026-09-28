/**
 * Agrarian Equipment Image Resolver
 * Provides reliable, high-resolution photography paths for all machinery types,
 * brands, and models across the Agrarian Equipment Marketplace.
 */

export const EQUIPMENT_IMAGE_PRESETS = {
  harvester: '/images/equipment/harvester-combine.jpg',
  harvesterCompact: '/images/equipment/harvester-compact.jpg',
  tractor: '/images/equipment/tractor-4wd.jpg',
  tractorMud: '/images/equipment/tractor-mud.jpg',
  drone: '/images/equipment/drone-sprayer.jpg',
  transplanter: '/images/equipment/transplanter-rice.jpg',
  irrigation: '/images/equipment/irrigation-pump.jpg',
  dryer: '/images/equipment/grain-dryer.jpg',
};

/**
 * Resolves the optimal image for any equipment listing.
 * Checks for custom imageUrl first, then evaluates name, type, and category keywords.
 *
 * @param {Object} item - Machinery asset object
 * @returns {string} Public image path
 */
export function getEquipmentImage(item = {}) {
  if (item?.imageUrl && typeof item.imageUrl === 'string' && item.imageUrl.trim() !== '') {
    return item.imageUrl;
  }

  const name = (item?.name || '').toLowerCase();
  const type = (item?.type || '').toLowerCase();
  const category = (item?.category || '').toLowerCase();
  const description = (item?.description || '').toLowerCase();
  const combined = `${name} ${type} ${category} ${description}`;

  // 1. Drones (DJI Agras, XAG, UAV sprayers)
  if (combined.includes('drone') || combined.includes('agras') || combined.includes('xag') || combined.includes('sprayer drone') || combined.includes('uav')) {
    return EQUIPMENT_IMAGE_PRESETS.drone;
  }

  // 2. Harvesters (Combine, Palay, Rice & Corn, Crawlers)
  if (combined.includes('harvester') || combined.includes('combine') || combined.includes('dc-70') || combined.includes('dc-93') || combined.includes('yh850') || combined.includes('crop tiger') || combined.includes('aw70') || combined.includes('aw82')) {
    if (combined.includes('compact') || combined.includes('dc-60') || combined.includes('small plot') || combined.includes('terraced')) {
      return EQUIPMENT_IMAGE_PRESETS.harvesterCompact;
    }
    return EQUIPMENT_IMAGE_PRESETS.harvester;
  }

  // 3. Rice Transplanters (Riding, Walk-behind, Seedling tray planters)
  if (combined.includes('transplanter') || combined.includes('nspu') || combined.includes('spw') || combined.includes('vp6d') || combined.includes('vp8d') || combined.includes('spv')) {
    return EQUIPMENT_IMAGE_PRESETS.transplanter;
  }

  // 4. Solar & Deep Well Irrigation Pumps (Mobile arrays, axial, centrifugal, lift pumps)
  if (combined.includes('pump') || combined.includes('solar') || combined.includes('irrigation') || combined.includes('knd') || combined.includes('axial') || combined.includes('deep well') || combined.includes('gx390') || combined.includes('tf160')) {
    return EQUIPMENT_IMAGE_PRESETS.irrigation;
  }

  // 5. Grain Dryers (Recirculating, biomass husk, batch dryers, Buhler, Suncue)
  if (combined.includes('dryer') || combined.includes('buhler') || combined.includes('suncue') || combined.includes('superbrix') || combined.includes('paddy dryer') || combined.includes('biomass')) {
    return EQUIPMENT_IMAGE_PRESETS.dryer;
  }

  // 6. Wetland Mud Tractors (High-lug wheels, paddle wheels, deep mud, levee makers)
  if (combined.includes('mud') || combined.includes('puddle') || combined.includes('wetland') || combined.includes('m7040') || combined.includes('m9540') || combined.includes('rotavator') || combined.includes('subsoiler') || combined.includes('paddle')) {
    return EQUIPMENT_IMAGE_PRESETS.tractorMud;
  }

  // 7. General 4WD Farm Tractors (Default)
  return EQUIPMENT_IMAGE_PRESETS.tractor;
}
