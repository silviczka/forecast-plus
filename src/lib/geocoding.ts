import { logProd } from './logProd';

export const fetchSuggestions = async (query: string) => {
  if (!query) return [];
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        query,
      )}&count=10&language=en&format=json`,
    );
    const data = await res.json();

    const results: Suggestion[] = data.results || [];
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
    return uniqueResults || [];
  } catch (err) {
    logProd(`Failed to fetch suggestions for query="${query}":`, err);
    return [];
  }
};
