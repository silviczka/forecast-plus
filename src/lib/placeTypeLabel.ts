/**
 * Place type info for GeoNames feature_code: label (for hover/accessibility) and emoji.
 * @see https://www.geonames.org/export/codes.html
 */
export type PlaceTypeInfo = { label: string; emoji: string };

const PLACE_TYPES: Record<string, PlaceTypeInfo> = {
  // Populated places
  PPLC: { label: 'capital', emoji: '🏛️' },
  PPLA: { label: 'city', emoji: '🏙️' },
  PPLA2: { label: 'city', emoji: '🏙️' },
  PPLA3: { label: 'town', emoji: '🏘️' },
  PPLA4: { label: 'town', emoji: '🏘️' },
  PPL: { label: 'town', emoji: '🏘️' },
  PPLX: { label: 'area', emoji: '📍' },
  PPLL: { label: 'locality', emoji: '📍' },
  // Terrain
  MT: { label: 'mountain', emoji: '🏔️' },
  PK: { label: 'peak', emoji: '⛰️' },
  RK: { label: 'rock', emoji: '🪨' },
  HLL: { label: 'hill', emoji: '🌄' },
  // Transport & facilities
  AIRP: { label: 'airport', emoji: '✈️' },
  RSTN: { label: 'station', emoji: '🚉' },
  PRT: { label: 'port', emoji: '🚢' },
  // Nature
  PRK: { label: 'park', emoji: '🌳' },
  LK: { label: 'lake', emoji: '🏞️' },
  RESV: { label: 'reservoir', emoji: '💧' },
  SEA: { label: 'sea', emoji: '🌊' },
  ISL: { label: 'island', emoji: '🏝️' },
  FRST: { label: 'forest', emoji: '🌲' },
  GLCR: { label: 'glacier', emoji: '🧊' },
};

const DEFAULT_PLACE: PlaceTypeInfo = { label: 'place', emoji: '📌' };

export function getPlaceTypeInfo(featureCode: string | undefined): PlaceTypeInfo {
  if (!featureCode) return DEFAULT_PLACE;
  return PLACE_TYPES[featureCode] ?? DEFAULT_PLACE;
}

/** Text label only (for backwards compatibility / screen readers). */
export function getPlaceTypeLabel(featureCode: string | undefined): string {
  return getPlaceTypeInfo(featureCode).label;
}
