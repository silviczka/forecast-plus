const lastShownIndexMap = new Map<string, number>();

export function getLocalFallbackFact(ip: string): string {
  const lastIndex = lastShownIndexMap.get(ip) ?? -1;
  const nextIndex = (lastIndex + 1) % fallbackFunFacts.length;
  lastShownIndexMap.set(ip, nextIndex);
  return fallbackFunFacts[nextIndex];
}

export const fallbackFunFacts = [
  "Weather is just Earth's way of keeping things interesting!",
  'Even on cloudy days, the sun is still shining somewhere.',
  'Rainbows are proof that patience pays off.',
  "Windy days are nature's way of giving you a free hairdo!",
  'Snowflakes are tiny, frozen masterpieces.',
  'Rainy days make puddles perfect for jumping!',
  'Thunder is just clouds having a drum battle!',
  "Fog is like nature's soft blanket.",
  'Sunshine is free vitamin D delivered by nature.',
  'A single snowflake can have over 200 delicate branches.',
  'Clouds are giant floating water factories.',
  "The smell of rain is called petrichor - it's nature's perfume!",
  "Lightning can heat the air to 30,000 kelvins - hotter than the sun's surface!",
  'Every snowflake is completely unique.',
  'Hailstones are just icy projectiles from the sky.',
  'Windy days help trees practice their dance moves.',
  'Rain makes flowers do their happy dance.',
  'Dew drops are tiny morning mirrors.',
  'Fog can turn ordinary streets into mysterious worlds.',
  "Thunderstorms are nature's way of keeping things dramatic.",
];
