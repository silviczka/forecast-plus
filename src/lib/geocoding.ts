import { logProd } from './logProd';
import type { Suggestion } from '@/types/types';

export const fetchSuggestions = async (query: string) => {
  const trimmed = query?.trim();
  if (!trimmed) return [];
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        trimmed,
      )}&count=10&language=en&format=json`,
    );
    if (!res.ok) {
      logProd(`Geocoding API error ${res.status} for query="${trimmed}"`);
      return [];
    }
    const data = await res.json();
    const results: Suggestion[] = data.results ?? [];
    //remove dupes if city has multiple weather stations
    const uniqueResults = results.filter(
      (v, i, a) =>
        a.findIndex(
          (t) =>
            t.name.toLowerCase() === v.name.toLowerCase() &&
            t.country.toLowerCase() === v.country.toLowerCase(),
        ) === i,
    );
    logProd(uniqueResults);
    return uniqueResults;
  } catch (err) {
    logProd(`Failed to fetch suggestions for query="${trimmed}":`, err);
    return [];
  }
};
