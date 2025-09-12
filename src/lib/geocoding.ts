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
    logProd(data.results);
    return data.results || [];
  } catch (err) {
    logProd(`Failed to fetch suggestions for query="${query}":`, err);
    return [];
  }
};
